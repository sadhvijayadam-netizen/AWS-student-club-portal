/**
 * AWS Student Builder Groups - Main Single Page Application Router
 * Mounts navbar, routing views, session state, and global handlers. Includes Admin Command Center routing.
 */

import { Auth } from './auth.js';
import { Views } from './views.js';

class App {
  constructor() {
    this.currentPath = window.location.pathname || '/';
    this.appContainer = document.getElementById('app-container');
    this.init();
  }

  init() {
    window.addEventListener('popstate', () => {
      this.navigate(window.location.pathname, false);
    });
    this.render();
  }

  navigate(path, pushState = true) {
    if (pushState) {
      window.history.pushState({}, '', path);
    }
    this.currentPath = path;
    this.render();
  }

  renderNavbar() {
    const isLoggedIn = Auth.isLoggedIn();
    const user = Auth.getUser() || {};
    const isAdmin = user.role === 'admin' || user.email === 'admin@campus.edu';

    const nav = document.createElement('nav');
    nav.className = 'navbar';
    nav.innerHTML = `
      <div class="nav-brand" id="nav-brand">
        <span class="nav-logo-badge">AWS</span>
        <span>Student Builder Portal</span>
      </div>

      <div class="nav-links">
        ${isLoggedIn ? `
          <a class="nav-link ${this.currentPath === '/dashboard' ? 'active' : ''}" data-path="/dashboard">Dashboard</a>
          <a class="nav-link ${this.currentPath === '/chat' ? 'active' : ''}" data-path="/chat">Knowledge Assistant</a>
          <a class="nav-link ${this.currentPath === '/resources' ? 'active' : ''}" data-path="/resources">Resources</a>
          <a class="nav-link ${this.currentPath === '/workshops' ? 'active' : ''}" data-path="/workshops">Workshops</a>
          <a class="nav-link ${this.currentPath === '/community' ? 'active' : ''}" data-path="/community">Community</a>
          <a class="nav-link ${this.currentPath === '/history' ? 'active' : ''}" data-path="/history">History</a>
          <a class="nav-link ${this.currentPath === '/architecture' ? 'active' : ''}" data-path="/architecture">AWS Pitch</a>
          <a class="nav-link ${this.currentPath === '/profile' ? 'active' : ''}" data-path="/profile">Profile</a>
          ${isAdmin ? `<a class="nav-link ${this.currentPath === '/admin' ? 'active' : ''}" data-path="/admin" style="color:var(--aws-orange); font-weight:700;">⚡ Admin Panel</a>` : ''}
        ` : `
          <a class="nav-link ${this.currentPath === '/' ? 'active' : ''}" data-path="/">Home</a>
          <a class="nav-link ${this.currentPath === '/resources' ? 'active' : ''}" data-path="/resources">Resource Library</a>
          <a class="nav-link ${this.currentPath === '/architecture' ? 'active' : ''}" data-path="/architecture">AWS Pitch</a>
        `}
      </div>

      <div class="nav-actions">
        ${isLoggedIn ? `
          <div class="user-badge" id="profile-badge-btn" style="cursor:pointer;" title="View Profile">
            <div class="user-avatar">${user.name ? user.name[0].toUpperCase() : 'U'}</div>
            <span>${user.name}</span>
          </div>
          <button class="btn btn-secondary btn-sm" id="logout-btn">Log Out</button>
        ` : `
          <button class="btn btn-secondary btn-sm" id="login-nav-btn">Member Login</button>
          <button class="btn btn-primary btn-sm" id="signup-nav-btn">Join Club</button>
        `}
      </div>
    `;

    // Bind nav events
    nav.querySelector('#nav-brand').addEventListener('click', () => {
      this.navigate(isLoggedIn ? '/dashboard' : '/');
    });

    nav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const path = link.getAttribute('data-path');
        this.navigate(path);
      });
    });

    if (isLoggedIn) {
      nav.querySelector('#profile-badge-btn')?.addEventListener('click', () => this.navigate('/profile'));
      nav.querySelector('#logout-btn')?.addEventListener('click', () => {
        Auth.clearSession();
        this.navigate('/');
      });
    } else {
      nav.querySelector('#login-nav-btn')?.addEventListener('click', () => this.navigate('/login'));
      nav.querySelector('#signup-nav-btn')?.addEventListener('click', () => this.navigate('/signup'));
    }

    return nav;
  }

  render() {
    this.appContainer.innerHTML = '';
    
    // Auth route check
    if (!Auth.requireAuth(this.currentPath, (redirectPath) => this.navigate(redirectPath, true))) {
      return;
    }

    const navbar = this.renderNavbar();
    this.appContainer.appendChild(navbar);

    let viewNode = null;
    const navigateBound = (path) => this.navigate(path);

    switch (this.currentPath) {
      case '/':
        viewNode = Views.LandingView(navigateBound);
        break;
      case '/dashboard':
        viewNode = Views.DashboardView(navigateBound);
        break;
      case '/chat':
        viewNode = Views.ChatView(navigateBound);
        break;
      case '/resources':
        viewNode = Views.ResourcesView(navigateBound);
        break;
      case '/workshops':
        viewNode = Views.WorkshopsView(navigateBound);
        break;
      case '/community':
        viewNode = Views.CommunityView(navigateBound);
        break;
      case '/history':
        viewNode = Views.HistoryView(navigateBound);
        break;
      case '/architecture':
        viewNode = Views.ArchitectureView(navigateBound);
        break;
      case '/profile':
        viewNode = Views.ProfileView(navigateBound);
        break;
      case '/admin':
        viewNode = Views.AdminView(navigateBound);
        break;
      case '/login':
      case '/signup':
      case '/forgot-password':
      case '/reset-password':
        viewNode = Views.AuthViews(this.currentPath, navigateBound);
        break;
      default:
        viewNode = Views.LandingView(navigateBound);
    }

    this.appContainer.appendChild(viewNode);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new App();
});
