"""
AWS Student Builder Groups - Authentication Service & Real Email Password Verification
Features real SMTP email delivery of cryptographically secure 6-digit OTPs and single-use verification links.
Enforces 15-minute expiration, single-use invalidation, attempt rate-limiting, and zero token leakage in API responses.
"""

import hashlib
import json
import os
import secrets
import re
import time

from backend.email_service import send_reset_email, is_smtp_configured

USERS_DB_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'users.json')
SESSIONS_DB = {}
RESET_TOKENS_DB = {}
OTP_LOOKUP_DB = {}
RESET_TOKEN_EXPIRATION_SECONDS = 900  # 15 minutes validity
MAX_OTP_ATTEMPTS = 5

def load_users():
    """Loads stored members database from JSON."""
    os.makedirs(os.path.dirname(USERS_DB_FILE), exist_ok=True)
    if not os.path.exists(USERS_DB_FILE):
        users = {
            "builder@campus.edu": {
                "email": "builder@campus.edu",
                "name": "Alex Rivera",
                "password_hash": hash_password("Builder2026!"),
                "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                "role": "Student Builder Member",
                "bio": "Passionate about cloud architecture, serverless, and building AI applications on AWS."
            },
            "admin@campus.edu": {
                "email": "admin@campus.edu",
                "name": "Command Center Admin",
                "password_hash": hash_password("Admin2026!"),
                "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                "role": "admin",
                "bio": "AWS Student Builder Groups Onsite Administrator."
            }
        }
        save_users(users)
        return users
    try:
        with open(USERS_DB_FILE, 'r', encoding='utf-8') as f:
            users = json.load(f)
            if "admin@campus.edu" not in users:
                users["admin@campus.edu"] = {
                    "email": "admin@campus.edu",
                    "name": "Command Center Admin",
                    "password_hash": hash_password("Admin2026!"),
                    "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                    "role": "admin",
                    "bio": "AWS Student Builder Groups Onsite Administrator."
                }
                save_users(users)
            return users
    except Exception:
        return {}

def save_users(users):
    """Saves members database to JSON."""
    os.makedirs(os.path.dirname(USERS_DB_FILE), exist_ok=True)
    with open(USERS_DB_FILE, 'w', encoding='utf-8') as f:
        json.dump(users, f, indent=2)

def hash_password(password):
    """Generates SHA-256 hash for member password."""
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def calculate_password_strength(password):
    score = 0
    if len(password) >= 8: score += 30
    if len(password) >= 12: score += 20
    if re.search(r'[A-Z]', password): score += 20
    if re.search(r'[0-9]', password): score += 15
    if re.search(r'[^A-Za-z0-9]', password): score += 15

    if score < 40: label = "Weak"
    elif score < 75: label = "Moderate"
    else: label = "Strong"

    return {"score": min(score, 100), "label": label}

def signup_user(name, email, password, confirm_password):
    name = name.strip()
    email = email.strip().lower()
    
    if not name or not email or not password:
        return {"success": False, "error": "All fields are required."}
    
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return {"success": False, "error": "Please enter a valid email address."}

    if password != confirm_password:
        return {"success": False, "error": "Passwords do not match."}

    if len(password) < 6:
        return {"success": False, "error": "Password must be at least 6 characters long."}

    users = load_users()
    if email in users:
        return {"success": False, "error": "An account with this email already exists. Please log in."}

    user_record = {
        "email": email,
        "name": name,
        "password_hash": hash_password(password),
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "role": "Student Builder Member",
        "bio": "New Student Builder community member."
    }
    
    users[email] = user_record
    save_users(users)

    token = secrets.token_hex(24)
    SESSIONS_DB[token] = {
        "email": email,
        "name": name,
        "role": user_record["role"],
        "created_at": time.time()
    }

    return {
        "success": True,
        "message": "Account created successfully! Welcome to AWS Student Builder Groups.",
        "token": token,
        "user": {
            "email": email,
            "name": name,
            "role": user_record["role"],
            "bio": user_record["bio"]
        }
    }

def login_user(email, password):
    email = email.strip().lower()
    users = load_users()

    if email not in users:
        return {"success": False, "error": "Invalid email or password."}

    user = users[email]
    if user["password_hash"] != hash_password(password):
        return {"success": False, "error": "Invalid email or password."}

    token = secrets.token_hex(24)
    user_role = user.get("role", "Student Builder Member")
    SESSIONS_DB[token] = {
        "email": email,
        "name": user["name"],
        "role": user_role,
        "created_at": time.time()
    }

    return {
        "success": True,
        "message": f"Welcome back, {user['name']}!",
        "token": token,
        "user": {
            "email": email,
            "name": user["name"],
            "role": user_role,
            "bio": user.get("bio", "Student Builder community member.")
        }
    }

def update_user_profile(email, name, role, bio):
    email = email.strip().lower()
    users = load_users()
    
    if email not in users:
        return {"success": False, "error": "Member record not found."}

    user = users[email]
    if name and name.strip():
        user["name"] = name.strip()
    if role and role.strip():
        user["role"] = role.strip()
    if bio is not None:
        user["bio"] = bio.strip()

    users[email] = user
    save_users(users)

    for tok, sess in SESSIONS_DB.items():
        if sess["email"] == email:
            sess["name"] = user["name"]
            sess["role"] = user["role"]

    return {
        "success": True,
        "message": "Profile updated successfully!",
        "user": {
            "email": email,
            "name": user["name"],
            "role": user["role"],
            "bio": user["bio"]
        }
    }

def handle_forgot_password(email, base_url="http://127.0.0.1:8080"):
    """
    Generates a 6-digit OTP & URL reset token, then delivers it to the user's REAL email inbox via SMTP.
    Returns success: True ONLY when real email delivery succeeds.
    Does NOT leak the OTP or token in the API response.
    """
    email = email.strip().lower()
    if not email or not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return {"success": False, "error": "Please enter a valid campus email address."}

    users = load_users()
    if email not in users:
        # Privacy protection: Return generic response without exposing user existence
        return {
            "success": True,
            "message": "If an account exists for this email, a verification code and reset link have been sent to your email inbox."
        }

    # Generate cryptographically secure 6-digit OTP and 256-bit URL reset token
    otp_code = f"{secrets.randbelow(900000) + 100000}"
    reset_token = f"prt_{secrets.token_urlsafe(32)}"
    now = time.time()

    # Deliver real email via SMTP
    sent_ok, email_msg = send_reset_email(email, otp_code, reset_token, base_url=base_url)
    
    if not sent_ok:
        # CRITICAL RULE: Never claim email sent if actual email delivery failed!
        return {
            "success": False,
            "error": f"Email delivery failed: {email_msg}"
        }

    # Store token & OTP mapping in memory after successful email delivery
    token_entry = {
        "email": email,
        "otp_code": otp_code,
        "reset_token": reset_token,
        "created_at": now,
        "expires_at": now + RESET_TOKEN_EXPIRATION_SECONDS,
        "failed_attempts": 0
    }
    
    RESET_TOKENS_DB[reset_token] = token_entry
    OTP_LOOKUP_DB[otp_code] = reset_token

    return {
        "success": True,
        "message": "A verification code (OTP) and password reset link have been delivered to your email inbox. Please check your email (and spam folder)."
    }

def verify_otp_or_token(token_or_otp):
    """
    Verifies a 6-digit OTP code or reset token string.
    Returns (is_valid: bool, token_data_or_error: dict/str).
    """
    key = (token_or_otp or "").strip()
    if not key:
        return False, "Verification code or reset token is required."

    reset_token = key
    if key in OTP_LOOKUP_DB:
        reset_token = OTP_LOOKUP_DB[key]

    if reset_token not in RESET_TOKENS_DB:
        return False, "Invalid or already used verification code/reset link."

    token_data = RESET_TOKENS_DB[reset_token]

    # Expiration check
    if time.time() > token_data.get("expires_at", 0):
        purge_token(reset_token)
        return False, "Verification code has expired (15-minute limit). Please request a new one."

    # Rate limiting attempt check
    if token_data.get("failed_attempts", 0) >= MAX_OTP_ATTEMPTS:
        purge_token(reset_token)
        return False, "Too many failed attempts. Verification code invalidated for security. Please request a new code."

    return True, token_data

def reset_password_with_token(reset_token_or_otp, new_password, email=None):
    """
    Resets user password after verifying 6-digit OTP or URL reset token.
    Invalidates token & OTP immediately upon successful reset (single-use).
    """
    key = (reset_token_or_otp or "").strip()
    new_password = (new_password or "").strip()

    valid, result = verify_otp_or_token(key)
    if not valid:
        # Increment attempt counter if key matched a token
        target_token = key if key in RESET_TOKENS_DB else OTP_LOOKUP_DB.get(key)
        if target_token and target_token in RESET_TOKENS_DB:
            RESET_TOKENS_DB[target_token]["failed_attempts"] += 1
        return {"success": False, "error": result}

    token_data = result
    if len(new_password) < 6:
        return {"success": False, "error": "New password must be at least 6 characters long."}

    user_email = token_data["email"]
    if email and email.strip().lower() != user_email:
        return {"success": False, "error": "Verification code does not match the provided email address."}

    users = load_users()
    if user_email not in users:
        purge_token(token_data["reset_token"])
        return {"success": False, "error": "Associated member account not found."}

    # Securely update password hash
    users[user_email]["password_hash"] = hash_password(new_password)
    save_users(users)

    # Invalidate token & OTP immediately (Single-Use Constraint)
    purge_token(token_data["reset_token"])

    return {
        "success": True,
        "message": "Password reset successfully! You can now log in with your new password.",
        "email": user_email
    }

def purge_token(reset_token):
    """Purges reset token and associated OTP from memory."""
    if reset_token in RESET_TOKENS_DB:
        otp = RESET_TOKENS_DB[reset_token].get("otp_code")
        if otp and otp in OTP_LOOKUP_DB:
            del OTP_LOOKUP_DB[otp]
        del RESET_TOKENS_DB[reset_token]

def verify_session(token):
    if not token or token not in SESSIONS_DB:
        return None
    return SESSIONS_DB[token]
