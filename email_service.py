"""
AWS Student Builder Groups - Real-World SMTP Email Delivery Service
Handles real email delivery of cryptographically secure 6-digit OTPs and verification reset links.
Configurable via standard environment variables:
  SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, SMTP_FROM_EMAIL, SMTP_USE_TLS, SMTP_USE_SSL
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def is_smtp_configured():
    """Returns True if SMTP_HOST is configured in environment variables."""
    return bool(os.environ.get("SMTP_HOST", "").strip())

def send_reset_email(to_email, otp_code, reset_token, base_url="http://127.0.0.1:8080"):
    """
    Delivers a real email to the user's actual email inbox using configured SMTP server.
    Returns (success: bool, message: str).
    """
    smtp_host = os.environ.get("SMTP_HOST", "").strip()
    smtp_port_raw = os.environ.get("SMTP_PORT", "587").strip()
    try:
        smtp_port = int(smtp_port_raw)
    except ValueError:
        smtp_port = 587

    smtp_user = os.environ.get("SMTP_USERNAME", "").strip()
    smtp_pass = os.environ.get("SMTP_PASSWORD", "").strip()
    smtp_from = os.environ.get("SMTP_FROM_EMAIL", smtp_user or "noreply@awsbuilders.edu").strip()
    smtp_use_tls = os.environ.get("SMTP_USE_TLS", "true").lower() in ("true", "1", "yes")
    smtp_use_ssl = os.environ.get("SMTP_USE_SSL", "false").lower() in ("true", "1", "yes")

    if not smtp_host:
        return False, "SMTP server is not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_USERNAME, and SMTP_PASSWORD environment variables."

    reset_url = f"{base_url.rstrip('/')}/reset-password?token={reset_token}"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "AWS Student Builder Groups — Password Reset Verification Code"
    msg["From"] = smtp_from
    msg["To"] = to_email

    text_body = f"""Hello Student Builder,

You requested to reset your password for the AWS Student Builder Groups Club Member Portal.

Your Verification Code (OTP): {otp_code}

Alternatively, you can complete your password reset by opening this link:
{reset_url}

This verification code and link will expire in 15 minutes.
If you did not request a password reset, please ignore this email.

Best regards,
AWS Student Builder Groups Team
"""

    html_body = f"""<!DOCTYPE html>
<html>
<head>
  <style>
    body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0B0F19; color: #E5E7EB; margin: 0; padding: 20px; }}
    .container {{ max-width: 540px; margin: 0 auto; background: #111827; border: 1px solid #374151; border-radius: 12px; padding: 28px; }}
    .header {{ font-size: 20px; font-weight: 800; color: #FF9900; margin-bottom: 16px; border-bottom: 1px solid #374151; padding-bottom: 14px; }}
    .otp-box {{ background: #1F2937; border: 1px dashed #FF9900; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0; }}
    .otp-code {{ font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #FF9900; font-family: monospace; }}
    .btn {{ display: inline-block; background: #FF9900; color: #000000; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; margin-top: 16px; }}
    .footer {{ font-size: 12px; color: #9CA3AF; margin-top: 28px; text-align: center; border-top: 1px solid #374151; padding-top: 14px; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">⚡ AWS Student Builder Groups</div>
    <p>Hello Student Builder,</p>
    <p>You requested to reset your password for the Club Member Portal. Use the verification code below to complete your reset:</p>
    <div class="otp-box">
      <div style="font-size:12px; font-weight:bold; color:#9CA3AF; margin-bottom:8px; text-transform:uppercase;">Your Verification Code (OTP)</div>
      <div class="otp-code">{otp_code}</div>
    </div>
    <p style="text-align:center;">Or click the button below to verify directly in your browser:</p>
    <div style="text-align:center;">
      <a href="{reset_url}" class="btn" target="_blank">Verify & Reset Password ➔</a>
    </div>
    <p style="font-size:13px; color:#9CA3AF; margin-top:24px;">This code and reset link expire in <strong>15 minutes</strong> and can only be used once.</p>
    <div class="footer">AWS Student Builder Groups — Club Member Knowledge Portal</div>
  </div>
</body>
</html>
"""

    msg.attach(MIMEText(text_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    try:
        if smtp_use_ssl:
            server = smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=12)
        else:
            server = smtplib.SMTP(smtp_host, smtp_port, timeout=12)
            if smtp_use_tls:
                server.starttls()

        if smtp_user and smtp_pass:
            server.login(smtp_user, smtp_pass)

        server.sendmail(smtp_from, [to_email], msg.as_string())
        server.quit()
        return True, "Verification email sent successfully to your inbox."
    except Exception as e:
        error_str = str(e)
        print(f"[SMTP Delivery Error] Failed sending email: {error_str}")
        return False, f"Email delivery failed: {error_str}"
