"""
AWS Student Builder Groups - Document Ingestion Service
Handles loading, parsing, chunking, and saving of knowledge documents in data/knowledge-document/.
Supports dynamic loading of all .md files (including event-day-briefing.md, 09-smoke-test-questions.md, and dynamic admin uploads).
"""

import os
import re
import urllib.request
import time
from backend.document_registry import DOCUMENTS_REGISTRY

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRIMARY_DOCS_DIR = os.path.join(BASE_DIR, 'data', 'knowledge-document')
FALLBACK_DOCS_DIR = os.path.join(BASE_DIR, 'data', 'docs')

def get_registered_meta(filename):
    """Finds registry metadata for a given filename if registered."""
    for meta in DOCUMENTS_REGISTRY:
        if meta['filename'] == filename:
            return meta
    return None

def load_or_fetch_documents():
    """
    Loads all .md documents from data/knowledge-document/.
    If starter documents are missing, fetches or initializes them.
    Supports dynamic administrative additions and updates.
    Returns a list of parsed document objects.
    """
    os.makedirs(PRIMARY_DOCS_DIR, exist_ok=True)

    # 1. Ensure registered starter documents exist
    for meta in DOCUMENTS_REGISTRY:
        primary_filepath = os.path.join(PRIMARY_DOCS_DIR, meta['filename'])
        fallback_filepath = os.path.join(FALLBACK_DOCS_DIR, meta['filename'])
        
        if not os.path.exists(primary_filepath):
            if os.path.exists(fallback_filepath):
                try:
                    with open(fallback_filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                    with open(primary_filepath, 'w', encoding='utf-8') as f_out:
                        f_out.write(content)
                except Exception as e:
                    print(f"[Ingestion] Warning copying fallback {meta['filename']}: {e}")
            else:
                try:
                    print(f"[Ingestion] Fetching raw URL for {meta['filename']}...")
                    req = urllib.request.Request(meta['url'], headers={'User-Agent': 'AWS-Student-Builder-Portal/1.0'})
                    with urllib.request.urlopen(req, timeout=5) as resp:
                        content = resp.read().decode('utf-8')
                    with open(primary_filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                except Exception as e:
                    print(f"[Ingestion] Failed fetching {meta['url']}: {e}")

    # 2. Scan all .md files in PRIMARY_DOCS_DIR dynamically
    documents = []
    all_files = sorted(os.listdir(PRIMARY_DOCS_DIR))
    
    for filename in all_files:
        if not filename.endswith('.md'):
            continue

        filepath = os.path.join(PRIMARY_DOCS_DIR, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"[Ingestion] Error reading file {filepath}: {e}")
            continue

        meta = get_registered_meta(filename)
        if not meta:
            # Build dynamic metadata for admin uploads or event-day files
            doc_id = filename.replace('.md', '')
            meta = {
                "id": doc_id,
                "filename": filename,
                "title": doc_id.replace('-', ' ').title(),
                "category": "Event Day / Dynamic Document",
                "url": f"file:///data/knowledge-document/{filename}",
                "description": "Dynamic Student Builder Knowledge Document"
            }

        parsed = parse_markdown_document(meta, content, filepath)
        documents.append(parsed)

    return documents

def parse_markdown_document(meta, raw_content, filepath=None):
    """
    Parses Markdown text into structured document and section chunks.
    Extracts H1 (#) title if present.
    """
    lines = raw_content.split('\n')
    doc_title = meta.get('title')
    
    # Try extracting first H1 header for title
    for line in lines:
        stripped = line.strip()
        if stripped.startswith('# ') and not stripped.startswith('##'):
            extracted = re.sub(r'^#\s*', '', stripped).strip()
            if extracted:
                doc_title = extracted
                break

    sections = []
    current_heading = "General Overview"
    current_lines = []

    for line in lines:
        stripped = line.strip()
        if stripped.startswith('#'):
            if current_lines:
                text_block = '\n'.join(current_lines).strip()
                if text_block:
                    sections.append({
                        "heading": current_heading,
                        "text": text_block
                    })
                current_lines = []
            
            heading_text = re.sub(r'^#+\s*', '', stripped)
            current_heading = heading_text
        else:
            current_lines.append(line)

    if current_lines:
        text_block = '\n'.join(current_lines).strip()
        if text_block:
            sections.append({
                "heading": current_heading,
                "text": text_block
            })

    chunks = []
    chunk_index = 0
    for sec in sections:
        sec_text = sec['text']
        paragraphs = [p.strip() for p in sec_text.split('\n\n') if p.strip()]
        if not paragraphs:
            paragraphs = [sec_text]

        for p in paragraphs:
            chunks.append({
                "chunk_id": f"{meta['id']}_{chunk_index}",
                "doc_id": meta['id'],
                "filename": meta['filename'],
                "doc_title": doc_title or meta['filename'],
                "url": meta.get('url', f"file:///data/knowledge-document/{meta['filename']}"),
                "category": meta.get('category', 'Dynamic Document'),
                "section": sec['heading'],
                "content": f"### {sec['heading']}\n{p}",
                "raw_text": p
            })
            chunk_index += 1

    last_updated = time.strftime("%Y-%m-%d %H:%M:%S")
    if filepath and os.path.exists(filepath):
        last_updated = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(os.path.getmtime(filepath)))

    return {
        "id": meta['id'],
        "filename": meta['filename'],
        "title": doc_title or meta['filename'],
        "category": meta.get('category', 'Dynamic Document'),
        "url": meta.get('url', f"file:///data/knowledge-document/{meta['filename']}"),
        "description": meta.get('description', 'Student Builder Document'),
        "raw_content": raw_content,
        "last_updated": last_updated,
        "sections": sections,
        "chunks": chunks
    }

def save_or_update_document(filename, title, category, content):
    """
    Saves or updates a Markdown document in data/knowledge-document/.
    """
    if not filename.endswith('.md'):
        filename += '.md'

    os.makedirs(PRIMARY_DOCS_DIR, exist_ok=True)
    filepath = os.path.join(PRIMARY_DOCS_DIR, filename)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    return filepath

if __name__ == '__main__':
    docs = load_or_fetch_documents()
    print(f"Loaded {len(docs)} documents successfully.")
    for d in docs:
        print(f" - {d['filename']} ({len(d['chunks'])} chunks)")
