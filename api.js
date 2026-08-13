/**
 * AWS Student Builder Groups - API Client
 * Wraps REST endpoints with authorization header support.
 */

const API_BASE = '';

export const API = {
  async signup(name, email, password, confirmPassword) {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, confirm_password: confirmPassword })
    });
    return res.json();
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  async forgotPassword(email) {
    const res = await fetch(`${API_BASE}/auth/forgot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return res.json();
  },

  async verifyOtp(otpOrToken) {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp: otpOrToken })
    });
    return res.json();
  },

  async resetPassword(resetToken, newPassword, email = null) {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reset_token: resetToken, new_password: newPassword, email })
    });
    return res.json();
  },

  async getProfile(token) {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  async updateProfile(name, role, bio, token) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, role, bio })
    });
    return res.json();
  },

  async askQuestion(question, token) {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ question })
    });
    return res.json();
  },

  async getDocuments() {
    const res = await fetch(`${API_BASE}/documents`);
    return res.json();
  },

  async getDocumentDetail(id) {
    const res = await fetch(`${API_BASE}/documents/${id}`);
    return res.json();
  },

  async getHistory(token) {
    const res = await fetch(`${API_BASE}/history`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  async sendFeedback(question, type, token) {
    const res = await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ question, type })
    });
    return res.json();
  },

  async publishAdminDocument(filename, title, category, content, token) {
    const res = await fetch(`${API_BASE}/admin/documents/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ filename, title, category, content })
    });
    return res.json();
  },

  async updateAdminDocument(filename, title, category, content, token) {
    const res = await fetch(`${API_BASE}/admin/documents/${filename}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title, category, content })
    });
    return res.json();
  },

  async runSmokeTests(token) {
    const res = await fetch(`${API_BASE}/admin/smoke-tests`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  async getStats() {
    const res = await fetch(`${API_BASE}/api/stats`);
    return res.json();
  }
};
