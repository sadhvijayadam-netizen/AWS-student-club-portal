/**
 * AWS Student Builder Groups - Auth State Manager
 * Handles local session persistence, token management, and route protection.
 */

const TOKEN_KEY = 'aws_sbg_session_token';
const USER_KEY = 'aws_sbg_user_data';

export const Auth = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser() {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  },

  setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  updateUser(userData) {
    const existing = this.getUser() || {};
    const updated = { ...existing, ...userData };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
  },

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isLoggedIn() {
    return !!this.getToken() && !!this.getUser();
  },

  requireAuth(currentPath, navigateCallback) {
    const protectedPaths = ['/chat', '/dashboard', '/resources', '/workshops', '/community', '/history', '/architecture', '/profile'];
    if (protectedPaths.includes(currentPath) && !this.isLoggedIn()) {
      navigateCallback('/login');
      return false;
    }
    return true;
  }
};
