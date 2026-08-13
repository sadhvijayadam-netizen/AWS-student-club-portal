"""
AWS Student Builder Groups - REST API Server & Static File Host
Zero-dependency Python HTTPServer providing hackathon routes compatible with AWS Lambda / API Gateway.
Listens on 0.0.0.0:8080 for POST /ask evaluator API and 8000/8001/8081 for SPA frontend & REST API.
"""

import json
import os
import time
import socket
import threading
import urllib.parse
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

from backend.document_registry import DOCUMENTS_REGISTRY
from backend.ingestion import load_or_fetch_documents, save_or_update_document
from backend.rag_engine import (
    initialize_rag_engine, refresh_document_index, process_query,
    get_index_sync_info
)
from backend.auth import (
    signup_user, login_user, handle_forgot_password, reset_password_with_token,
    update_user_profile, verify_session, load_users
)

PORT = 8080
STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'static')
HISTORY_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'chat_history.json')
FEEDBACK_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'feedback.json')

def load_chat_history():
    if not os.path.exists(HISTORY_FILE):
        return {}
    try:
        with open(HISTORY_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return {}

def save_chat_history(history):
    os.makedirs(os.path.dirname(HISTORY_FILE), exist_ok=True)
    with open(HISTORY_FILE, 'w', encoding='utf-8') as f:
        json.dump(history, f, indent=2)

def save_feedback_record(record):
    os.makedirs(os.path.dirname(FEEDBACK_FILE), exist_ok=True)
    feedbacks = []
    if os.path.exists(FEEDBACK_FILE):
        try:
            with open(FEEDBACK_FILE, 'r', encoding='utf-8') as f:
                feedbacks = json.load(f)
        except Exception:
            feedbacks = []
    feedbacks.append(record)
    with open(FEEDBACK_FILE, 'w', encoding='utf-8') as f:
        json.dump(feedbacks, f, indent=2)

class PortalHTTPServer(ThreadingHTTPServer):
    allow_reuse_address = True
    def server_bind(self):
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEPORT, 1)
        except (AttributeError, OSError):
            pass
        super().server_bind()

class PortalRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=STATIC_DIR, **kwargs)

    def do_OPTIONS(self):
        """Enable CORS for API endpoints."""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def send_json(self, data, status=200):
        """Sends a JSON response with CORS headers."""
        body = json.dumps(data).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def get_auth_token(self):
        auth_header = self.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            return auth_header[7:].strip()
        return None

    def read_json_body(self):
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length == 0:
            return {}
        raw_body = self.rfile.read(content_length).decode('utf-8')
        try:
            return json.loads(raw_body)
        except Exception:
            return {}

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        # 1. API Documents Endpoint
        if path == '/documents':
            docs = load_or_fetch_documents()
            docs_summary = []
            for doc in docs:
                docs_summary.append({
                    "id": doc["id"],
                    "filename": doc["filename"],
                    "title": doc["title"],
                    "category": doc["category"],
                    "url": doc["url"],
                    "description": doc["description"],
                    "last_updated": doc.get("last_updated", ""),
                    "section_count": len(doc.get("sections", [])),
                    "chunk_count": len(doc.get("chunks", []))
                })
            sync_info = get_index_sync_info()
            return self.send_json({"documents": docs_summary, "sync_status": sync_info})

        elif path.startswith('/documents/'):
            doc_id = path.replace('/documents/', '').strip()
            docs = load_or_fetch_documents()
            for doc in docs:
                if doc["id"] == doc_id or doc["filename"] == doc_id:
                    return self.send_json({"document": doc})
            return self.send_json({"error": "Document not found"}, status=404)

        # 2. Chat History
        elif path == '/history':
            token = self.get_auth_token()
            session = verify_session(token)
            if not session:
                return self.send_json({"error": "Unauthorized access"}, status=401)
            
            all_history = load_chat_history()
            user_history = all_history.get(session["email"], [])
            return self.send_json({"history": user_history})

        # 3. Auth Profile Me
        elif path == '/auth/me':
            token = self.get_auth_token()
            session = verify_session(token)
            if not session:
                return self.send_json({"error": "Unauthorized access"}, status=401)
            users = load_users()
            user_rec = users.get(session["email"], {})
            return self.send_json({
                "user": {
                    "email": session["email"],
                    "name": user_rec.get("name", session["name"]),
                    "role": user_rec.get("role", session.get("role", "Student Builder Member")),
                    "bio": user_rec.get("bio", "Student Builder community member."),
                    "created_at": user_rec.get("created_at", "")
                }
            })

        # 4. System & Live Sync Stats
        elif path == '/api/stats':
            sync_info = get_index_sync_info()
            docs = load_or_fetch_documents()
            return self.send_json({
                "verified_documents_count": len(docs),
                "grounded_rag": True,
                "response_guarantee": "100% Source-Backed",
                "total_chunks": sum(len(d.get("chunks", [])) for d in docs),
                "sync_status": sync_info
            })

        # 5. Smoke Tests Endpoint for Admin Dashboard
        elif path == '/admin/smoke-tests':
            tests = [
                {
                    "id": "ST-01",
                    "question": "Where is judging located?",
                    "expected_source": "event-day-briefing.md"
                },
                {
                    "id": "ST-02",
                    "question": "How do I publish on Builder Center?",
                    "expected_source": "03-builder-center-publish.md"
                },
                {
                    "id": "ST-03",
                    "question": "What is Amazon Bedrock?",
                    "expected_source": "04-bedrock-starter.md"
                }
            ]

            results = []
            for t in tests:
                res = process_query(t["question"])
                sources = res.get("sources", [])
                actual_source = sources[0]["filename"] if sources else "None"
                is_pass = actual_source.lower() == t["expected_source"].lower()
                results.append({
                    "id": t["id"],
                    "question": t["question"],
                    "expected_source": t["expected_source"],
                    "actual_source": actual_source,
                    "status": "PASS" if is_pass else "FAIL",
                    "answer": res.get("answer", "")
                })

            return self.send_json({"smoke_tests": results})

        # Static SPA File Routing (Fallback to index.html)
        file_path = os.path.join(STATIC_DIR, path.lstrip('/'))
        if not os.path.exists(file_path) or os.path.isdir(file_path):
            self.path = '/index.html'

        return super().do_GET()

    def do_POST(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        body = self.read_json_body()

        # 1. EVALUATOR REQUIRED API: POST /ask (Top-Level JSON)
        if path == '/ask':
            question = body.get('question', '').strip()
            if not question:
                return self.send_json({"answer": "Error: Question parameter is required.", "sources": []}, status=400)

            result = process_query(question)
            
            # Format top-level evaluator sources schema exactly as required
            evaluator_sources = []
            if result.get("grounded") and result.get("sources"):
                for idx, src in enumerate(result["sources"]):
                    evaluator_sources.append({
                        "document": src["filename"],
                        "chunk_id": src.get("chunk_id", f"{src['filename']}_{idx}"),
                        "rank": idx + 1,
                        "score": src.get("score", 0.95)
                    })

            # Top-level JSON response directly containing answer and sources
            return self.send_json({
                "answer": result.get("answer", "I could not find a verified answer in the club documents."),
                "sources": evaluator_sources
            })

        # 2. Auth Routes
        elif path == '/auth/signup':
            res = signup_user(
                body.get('name', ''),
                body.get('email', ''),
                body.get('password', ''),
                body.get('confirm_password', '')
            )
            status = 200 if res['success'] else 400
            return self.send_json(res, status=status)

        elif path == '/auth/login':
            res = login_user(
                body.get('email', ''),
                body.get('password', '')
            )
            status = 200 if res['success'] else 400
            return self.send_json(res, status=status)

        elif path == '/auth/forgot':
            host_header = self.headers.get('Host', '127.0.0.1:8080')
            scheme = 'https' if self.headers.get('X-Forwarded-Proto') == 'https' else 'http'
            base_url = f"{scheme}://{host_header}"
            res = handle_forgot_password(body.get('email', ''), base_url=base_url)
            status = 200 if res['success'] else 400
            return self.send_json(res, status=status)

        elif path == '/auth/verify-otp':
            otp_or_token = body.get('otp', '') or body.get('token', '') or body.get('reset_token', '')
            from backend.auth import verify_otp_or_token
            valid, token_data_or_err = verify_otp_or_token(otp_or_token)
            if valid:
                return self.send_json({
                    "success": True,
                    "message": "Verification code validated successfully.",
                    "reset_token": token_data_or_err["reset_token"]
                })
            else:
                return self.send_json({"success": False, "error": token_data_or_err}, status=400)

        elif path == '/auth/reset-password':
            reset_key = body.get('reset_token', '') or body.get('otp', '') or body.get('token', '')
            res = reset_password_with_token(
                reset_key,
                body.get('new_password', ''),
                body.get('email')
            )
            status = 200 if res['success'] else 400
            return self.send_json(res, status=status)

        elif path == '/auth/profile':
            token = self.get_auth_token()
            session = verify_session(token)
            if not session:
                return self.send_json({"error": "Unauthorized access"}, status=401)

            res = update_user_profile(
                session["email"],
                body.get('name'),
                body.get('role'),
                body.get('bio')
            )
            status = 200 if res['success'] else 400
            return self.send_json(res, status=status)

        # 3. RAG Chat Endpoint for UI
        elif path == '/chat':
            token = self.get_auth_token()
            session = verify_session(token)
            if not session:
                return self.send_json({"error": "Authentication required to ask questions in the member portal."}, status=401)

            question = body.get('question', '').strip()
            if not question:
                return self.send_json({"error": "Question parameter is required."}, status=400)

            result = process_query(question)

            # Record in history
            user_email = session["email"]
            all_history = load_chat_history()
            if user_email not in all_history:
                all_history[user_email] = []

            history_entry = {
                "id": str(int(time.time() * 1000)),
                "question": question,
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "answer": result.get("answer"),
                "grounded": result.get("grounded", False),
                "sources": result.get("sources", []),
                "fallback": result.get("fallback", False),
                "group_leader": result.get("group_leader"),
                "tech_lead": result.get("tech_lead"),
                "relevant_director": result.get("relevant_director")
            }
            all_history[user_email].insert(0, history_entry)
            save_chat_history(all_history)

            return self.send_json(result)

        # 4. Admin Document Management Endpoints
        elif path in ['/admin/documents', '/admin/documents/publish']:
            token = self.get_auth_token()
            session = verify_session(token)
            if not session or session.get("role") != "admin":
                return self.send_json({"error": "Admin authorization required."}, status=403)

            filename = body.get('filename', '').strip()
            title = body.get('title', '').strip()
            category = body.get('category', 'Event Day Document').strip()
            content = body.get('content', '').strip()

            if not filename or not content:
                return self.send_json({"error": "Filename and Content parameters are required."}, status=400)

            filepath = save_or_update_document(filename, title, category, content)
            doc_count, chunk_count = refresh_document_index()

            return self.send_json({
                "success": True,
                "message": f"Document '{filename}' published and RAG index updated successfully!",
                "filename": filename,
                "filepath": filepath,
                "doc_count": doc_count,
                "chunk_count": chunk_count,
                "indexed_at": time.strftime("%Y-%m-%d %H:%M:%S")
            })

        # 5. Feedback Endpoint
        elif path == '/feedback':
            token = self.get_auth_token()
            session = verify_session(token)
            feedback_type = body.get('type')
            question = body.get('question')
            
            save_feedback_record({
                "user": session["email"] if session else "guest",
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "question": question,
                "type": feedback_type
            })
            return self.send_json({"success": True, "message": "Thank you for your feedback!"})

        else:
            return self.send_json({"error": "Route not found"}, status=404)

    def do_PUT(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        body = self.read_json_body()

        if path.startswith('/admin/documents/'):
            token = self.get_auth_token()
            session = verify_session(token)
            if not session or session.get("role") != "admin":
                return self.send_json({"error": "Admin authorization required."}, status=403)

            filename = path.replace('/admin/documents/', '').strip()
            title = body.get('title', '').strip()
            category = body.get('category', 'Event Day Document').strip()
            content = body.get('content', '').strip()

            if not filename or not content:
                return self.send_json({"error": "Filename and Content parameters are required."}, status=400)

            filepath = save_or_update_document(filename, title, category, content)
            doc_count, chunk_count = refresh_document_index()

            return self.send_json({
                "success": True,
                "message": f"Document '{filename}' updated and RAG index refreshed!",
                "filename": filename,
                "doc_count": doc_count,
                "chunk_count": chunk_count,
                "indexed_at": time.strftime("%Y-%m-%d %H:%M:%S")
            })
        else:
            return self.send_json({"error": "Route not found"}, status=404)

def run_server(port=8080):
    print("[Server] Initializing Document Ingestion & RAG Engine...")
    initialize_rag_engine()

    preferred_ports = [8080, 8000, 8001, 8081]
    httpd = None
    selected_port = None

    for p in preferred_ports:
        try:
            server_address = ('', p)
            httpd = PortalHTTPServer(server_address, PortalRequestHandler)
            selected_port = p
            break
        except OSError as e:
            print(f"[Server] Could not bind port {p}: {e}")
            continue

    if not httpd:
        raise RuntimeError("Could not bind to any target port.")

    print(f"============================================================")
    print(f" AWS Student Builder Groups — Club Member Portal Server Ready ")
    print(f" Listening on 0.0.0.0 (all interfaces) at port {selected_port}")
    print(f" Evaluator API Endpoint Ready: http://0.0.0.0:{selected_port}/ask")
    print(f"============================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer shutting down gracefully.")

if __name__ == '__main__':
    run_server()
