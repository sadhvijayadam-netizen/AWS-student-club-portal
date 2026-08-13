/**
 * AWS Student Builder Groups - Application Page Views
 * Renders Landing, Auth, Dashboard, Chat, Resources, Workshops, Community, History, Architecture, Profile, Admin Command Center.
 */

import { API } from './api.js';
import { Auth } from './auth.js';
import { Components } from './components.js';

export const Views = {
  // ==========================================
  // 1. LANDING PAGE
  // ==========================================
  LandingView(navigate) {
    const container = document.createElement('div');
    container.className = 'main-view';
    container.innerHTML = `
      <div class="hero-section">
        <div class="hero-tag">
          <span>⚡ AWS Student Builder Groups</span>
          <span style="opacity:0.4;">|</span>
          <span>Verified Knowledge Portal</span>
        </div>
        <h1 class="hero-title">Build. Learn. Ask. Grow.</h1>
        <p class="hero-subtitle">
          A verified knowledge assistant for AWS Student Builders. Grounded strictly in official club documentation with verified source citations.
        </p>

        <div class="hero-ctas">
          <button class="btn btn-primary join-btn">Join the Community</button>
          <button class="btn btn-secondary login-btn">Member Login</button>
        </div>

        <!-- Animated Knowledge-Flow Diagram -->
        <div class="knowledge-flow-card">
          <div class="flow-title">RAG Knowledge-Flow Pipeline</div>
          <div class="flow-nodes-container">
            <div class="flow-node">
              <div class="flow-node-icon">👤</div>
              <div class="flow-node-title">Member</div>
              <div class="flow-node-desc">Asks Question</div>
            </div>
            <div class="flow-arrow">➔</div>
            <div class="flow-node">
              <div class="flow-node-icon">❓</div>
              <div class="flow-node-title">Query</div>
              <div class="flow-node-desc">Preprocessed Vector</div>
            </div>
            <div class="flow-arrow">➔</div>
            <div class="flow-node" style="border-color:var(--aws-orange);">
              <div class="flow-node-icon" style="background:var(--aws-orange); color:#000;">🤖</div>
              <div class="flow-node-title" style="color:var(--aws-orange);">AI Assistant</div>
              <div class="flow-node-desc">RAG Retrieval</div>
            </div>
            <div class="flow-arrow">➔</div>
            <div class="flow-node">
              <div class="flow-node-icon">📚</div>
              <div class="flow-node-title">Verified Docs</div>
              <div class="flow-node-desc">Strict Evidence Base</div>
            </div>
            <div class="flow-arrow">➔</div>
            <div class="flow-node">
              <div class="flow-node-icon">🛡️</div>
              <div class="flow-node-title">Cites & Answers</div>
              <div class="flow-node-desc">100% Grounded</div>
            </div>
          </div>
        </div>

        <!-- 3 Feature Cards -->
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🔍</div>
            <div class="feature-title">Verified Knowledge</div>
            <div class="feature-desc">Ask questions and receive answers grounded strictly in official club documents with exact section citations.</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🚀</div>
            <div class="feature-title">Builder Resources</div>
            <div class="feature-desc">Access the complete knowledge base covering AWS account setup, Bedrock, serverless patterns, and Builder Center publishing.</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🤝</div>
            <div class="feature-title">Community Guidance</div>
            <div class="feature-desc">Intelligently routes unsupported queries to the right campus lead (Shanmukha, Revan, etc.) rather than inventing facts.</div>
          </div>
        </div>
      </div>
    `;

    container.querySelector('.join-btn').addEventListener('click', () => navigate('/signup'));
    container.querySelector('.login-btn').addEventListener('click', () => navigate('/login'));
    return container;
  },

  // ==========================================
  // 2. DASHBOARD VIEW (With 10-15s Live Index Polling)
  // ==========================================
  DashboardView(navigate) {
    const user = Auth.getUser() || { name: 'Student Builder' };
    const container = document.createElement('div');
    container.className = 'main-view';
    container.innerHTML = `
      <div class="dashboard-container">
        <div class="welcome-header" style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem;">
          <div>
            <h1 class="welcome-title">Welcome back, ${escapeHtml(user.name)}!</h1>
            <p class="welcome-subtitle">What would you like to learn today about AWS Student Builders?</p>
          </div>
          <!-- Live Sync Status Indicator -->
          <div class="sync-status-badge" id="dash-sync-badge" style="background:rgba(34,197,94,0.12); border:1px solid rgba(34,197,94,0.3); color:var(--aws-green); padding:0.4rem 0.85rem; border-radius:20px; font-size:0.82rem; font-weight:700; display:flex; align-items:center; gap:0.4rem;">
            <span class="sync-dot" style="width:8px; height:8px; border-radius:50%; background:var(--aws-green); display:inline-block;"></span>
            <span id="dash-sync-text">KNOWLEDGE INDEX: SYNCED</span>
          </div>
        </div>

        <!-- Search Input Box -->
        <div class="search-box-container">
          <div style="font-weight:700; font-size:1.1rem; color:var(--text-main);">Knowledge Assistant</div>
          <div class="search-input-wrapper">
            <input type="text" class="search-input" id="dash-search-input" placeholder="Ask about AWS Student Builders, workshops, Builder Center, event day..." />
            <button class="btn btn-primary" id="dash-search-btn">Ask AI ↗</button>
          </div>
        </div>

        <!-- Quick Question Cards -->
        <div class="quick-questions-section">
          <div class="section-label">⚡ Quick Questions</div>
          <div class="questions-grid">
            <div class="quick-question-card" data-q="Where is judging located?">
              <span class="qq-text">Where is judging located?</span>
              <span class="qq-icon">➔</span>
            </div>
            <div class="quick-question-card" data-q="When is the next workshop?">
              <span class="qq-text">When is the next workshop?</span>
              <span class="qq-icon">➔</span>
            </div>
            <div class="quick-question-card" data-q="How do I publish on Builder Center?">
              <span class="qq-text">How do I publish on Builder Center?</span>
              <span class="qq-icon">➔</span>
            </div>
            <div class="quick-question-card" data-q="How do I get started with Bedrock?">
              <span class="qq-text">How do I get started with Bedrock?</span>
              <span class="qq-icon">➔</span>
            </div>
            <div class="quick-question-card" data-q="What are the hackathon rules?">
              <span class="qq-text">What are the hackathon rules?</span>
              <span class="qq-icon">➔</span>
            </div>
            <div class="quick-question-card" data-q="How do I join the club?">
              <span class="qq-text">How do I join the club?</span>
              <span class="qq-icon">➔</span>
            </div>
          </div>
        </div>

        <!-- Live Knowledge Snapshot -->
        <div class="stats-banner">
          <div class="stat-item">
            <div class="stat-value" id="stat-doc-count">8+</div>
            <div class="stat-label">Verified Core Documents</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" id="stat-chunk-count">RAG</div>
            <div class="stat-label">Live Vector Chunks</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">100%</div>
            <div class="stat-label">Source-Backed Grounding</div>
          </div>
        </div>
      </div>
    `;

    const handleSearch = (qText) => {
      if (!qText || !qText.trim()) return;
      sessionStorage.setItem('pending_chat_question', qText.trim());
      navigate('/chat');
    };

    const input = container.querySelector('#dash-search-input');
    container.querySelector('#dash-search-btn').addEventListener('click', () => {
      if (input.value) handleSearch(input.value);
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value) handleSearch(input.value);
    });

    container.querySelectorAll('.quick-question-card').forEach(card => {
      card.addEventListener('click', () => {
        handleSearch(card.getAttribute('data-q'));
      });
    });

    // 10-15s Poll for Live Sync Metadata
    const syncText = container.querySelector('#dash-sync-text');
    const docStat = container.querySelector('#stat-doc-count');
    const chunkStat = container.querySelector('#stat-chunk-count');

    const pollStats = async () => {
      try {
        const stats = await API.getStats();
        if (stats.verified_documents_count) {
          docStat.textContent = `${stats.verified_documents_count}`;
        }
        if (stats.total_chunks) {
          chunkStat.textContent = `${stats.total_chunks}`;
        }
        if (stats.sync_status) {
          const s = stats.sync_status;
          syncText.textContent = `KNOWLEDGE INDEX: ${s.status} • ${s.last_updated_seconds_ago}s ago`;
        }
      } catch (e) {}
    };

    pollStats();
    const pollInterval = setInterval(pollStats, 12000);

    // Clean up interval when container is removed
    const observer = new MutationObserver(() => {
      if (!document.body.contains(container)) {
        clearInterval(pollInterval);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return container;
  },

  // ==========================================
  // 3. KNOWLEDGE ASSISTANT CHAT VIEW (`/chat`)
  // ==========================================
  ChatView(navigate) {
    const container = document.createElement('div');
    container.className = 'chat-page-layout';

    let currentSources = [];
    const activeUser = Auth.getUser() || { name: 'Member' };

    container.innerHTML = `
      <!-- History Sidebar -->
      <div class="history-sidebar">
        <div class="sidebar-header">
          <button class="btn btn-secondary btn-sm new-chat-btn" id="new-chat-btn">
            <span>➕</span> New Conversation
          </button>
        </div>
        <div class="sidebar-history-list" id="sidebar-history">
          <div class="history-group-title">Today</div>
          <div id="history-items-container">
            <div style="font-size:0.8rem; color:var(--text-muted); padding:0.5rem;">Loading chat history...</div>
          </div>
        </div>
      </div>

      <!-- Main Chat Area -->
      <div class="chat-main-workspace">
        <div class="messages-scroll-area" id="chat-messages-area">
          <div class="suggestions-overlay" id="suggestions-overlay">
            <h2 class="suggestions-title">AWS Student Builder Knowledge Assistant</h2>
            <p style="color:var(--text-secondary); font-size:0.95rem;">
              Ask any question below. Answers are verified strictly against our official knowledge documents.
            </p>
            <div class="suggestions-grid">
              <div class="suggestion-chip" data-q="Where is judging located?">📍 Where is judging located?</div>
              <div class="suggestion-chip" data-q="When is the next workshop?">📅 When is the next workshop?</div>
              <div class="suggestion-chip" data-q="How do I publish on Builder Center?">📝 How do I publish on Builder Center?</div>
              <div class="suggestion-chip" data-q="What is Amazon Bedrock?">🧠 What is Amazon Bedrock?</div>
              <div class="suggestion-chip" data-q="What are the hackathon rules?">🏆 What are the hackathon rules?</div>
              <div class="suggestion-chip" data-q="How do I set up my AWS account?">⚙️ How do I set up my AWS account?</div>
            </div>
          </div>
        </div>

        <!-- Chat Input Dock -->
        <div class="chat-input-dock">
          <div class="input-box-wrapper">
            <textarea class="chat-textarea" id="chat-input" rows="1" placeholder="Ask about workshops, Builder Center, event day, AWS setup..."></textarea>
            <button class="btn btn-primary" id="chat-send-btn">Send ➔</button>
          </div>
          <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.4rem; text-align:center;">
            Press <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for new line.
          </div>
        </div>
      </div>

      <!-- Right Desktop Evidence Panel -->
      <div class="sources-panel-desktop" id="sources-panel">
        <div class="panel-header">
          <span>🛡️ Verified Sources</span>
        </div>
        <div class="panel-body" id="sources-body">
          <div style="font-size:0.85rem; color:var(--text-muted); text-align:center; padding-top:2rem;">
            Source evidence cards will appear here when you ask a question.
          </div>
        </div>
      </div>
    `;

    const messagesArea = container.querySelector('#chat-messages-area');
    const suggestionsOverlay = container.querySelector('#suggestions-overlay');
    const sourcesBody = container.querySelector('#sources-body');
    const chatInput = container.querySelector('#chat-input');
    const sendBtn = container.querySelector('#chat-send-btn');
    const sidebarHistory = container.querySelector('#history-items-container');

    const loadHistorySidebar = async () => {
      try {
        const res = await API.getHistory(Auth.getToken());
        if (res.history && res.history.length > 0) {
          sidebarHistory.innerHTML = res.history.map(item => `
            <div class="history-item" title="${escapeHtml(item.question)}">
              💬 ${escapeHtml(item.question)}
            </div>
          `).join('');
        } else {
          sidebarHistory.innerHTML = `<div style="font-size:0.8rem; color:var(--text-muted); padding:0.5rem;">No recent chats.</div>`;
        }
      } catch (e) {
        sidebarHistory.innerHTML = `<div style="font-size:0.8rem; color:var(--text-muted); padding:0.5rem;">History unavailable.</div>`;
      }
    };
    loadHistorySidebar();

    const handleViewSourceModal = (source) => {
      const modal = Components.SourceViewer(source, () => modal.remove());
      document.body.appendChild(modal);
    };

    const updateSourcesPanel = (sources) => {
      currentSources = sources || [];
      sourcesBody.innerHTML = '';
      if (!currentSources.length) {
        sourcesBody.innerHTML = `<div style="font-size:0.85rem; color:var(--text-muted); text-align:center; padding-top:2rem;">No verified sources linked to this reply.</div>`;
        return;
      }

      currentSources.forEach(src => {
        const card = Components.SourceCard(src, handleViewSourceModal);
        sourcesBody.appendChild(card);
      });
    };

    const handleFeedback = async (question, type) => {
      try {
        await API.sendFeedback(question, type, Auth.getToken());
        showToast("Thank you for your feedback!");
      } catch (e) {}
    };

    const submitQuestion = async (qText) => {
      if (!qText.trim()) return;

      if (suggestionsOverlay) suggestionsOverlay.style.display = 'none';

      const userMsg = { role: 'user', text: qText, userName: activeUser.name };
      messagesArea.appendChild(Components.ChatMessage(userMsg));

      const loadingRow = document.createElement('div');
      loadingRow.className = 'chat-message-row assistant';
      loadingRow.innerHTML = `
        <div class="msg-avatar">AWS</div>
        <div class="msg-bubble" style="color:var(--text-muted);">
          ⚡ Searching verified documents & evaluating vector match...
        </div>
      `;
      messagesArea.appendChild(loadingRow);
      messagesArea.scrollTop = messagesArea.scrollHeight;

      chatInput.value = '';
      sendBtn.disabled = true;

      try {
        const res = await API.askQuestion(qText, Auth.getToken());
        loadingRow.remove();

        if (res.error) {
          const errRow = document.createElement('div');
          errRow.className = 'chat-message-row assistant';
          errRow.innerHTML = `<div class="msg-bubble" style="color:#F87171;">⚠️ ${escapeHtml(res.error)}</div>`;
          messagesArea.appendChild(errRow);
        } else {
          const assistantMsg = {
            role: 'assistant',
            text: res.answer,
            grounded: res.grounded,
            fallback: res.fallback,
            status_title: res.status_title,
            group_leader: res.group_leader,
            tech_lead: res.tech_lead,
            relevant_director: res.relevant_director,
            question: qText
          };
          messagesArea.appendChild(Components.ChatMessage(assistantMsg, handleViewSourceModal, handleFeedback));
          updateSourcesPanel(res.sources || []);
          loadHistorySidebar();
        }
      } catch (err) {
        loadingRow.remove();
        const errRow = document.createElement('div');
        errRow.className = 'chat-message-row assistant';
        errRow.innerHTML = `<div class="msg-bubble" style="color:#F87171;">⚠️ Network error communicating with RAG service.</div>`;
        messagesArea.appendChild(errRow);
      } finally {
        sendBtn.disabled = false;
        messagesArea.scrollTop = messagesArea.scrollHeight;
      }
    };

    sendBtn.addEventListener('click', () => submitQuestion(chatInput.value));
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitQuestion(chatInput.value);
      }
    });

    container.querySelectorAll('.suggestion-chip').forEach(chip => {
      chip.addEventListener('click', () => submitQuestion(chip.getAttribute('data-q')));
    });

    container.querySelector('#new-chat-btn').addEventListener('click', () => {
      messagesArea.innerHTML = '';
      if (suggestionsOverlay) {
        suggestionsOverlay.style.display = 'block';
        messagesArea.appendChild(suggestionsOverlay);
      }
      updateSourcesPanel([]);
    });

    const pendingQ = sessionStorage.getItem('pending_chat_question');
    if (pendingQ) {
      sessionStorage.removeItem('pending_chat_question');
      setTimeout(() => submitQuestion(pendingQ), 200);
    }

    return container;
  },

  // ==========================================
  // 4. RESOURCE LIBRARY VIEW (`/resources`)
  // ==========================================
  ResourcesView(navigate) {
    const container = document.createElement('div');
    container.className = 'main-view';
    container.innerHTML = `
      <div class="dashboard-container">
        <h1 class="welcome-title">Student Builder Resource Library</h1>
        <p class="welcome-subtitle">Explore all official knowledge documents stored locally in <code>data/knowledge-document/</code>.</p>
        <div class="resources-grid" id="resources-grid">
          <div style="color:var(--text-muted);">Loading verified documents...</div>
        </div>
      </div>
    `;

    const grid = container.querySelector('#resources-grid');
    API.getDocuments().then(data => {
      grid.innerHTML = '';
      if (data.documents) {
        data.documents.forEach(doc => {
          const card = Components.DocumentCard(doc, async (d) => {
            const detailRes = await API.getDocumentDetail(d.id);
            if (detailRes.document) {
              const modal = Components.SourceViewer({
                doc_title: detailRes.document.title,
                filename: detailRes.document.filename,
                url: detailRes.document.url,
                category: detailRes.document.category,
                section: "Full Document Content",
                full_content: detailRes.document.raw_content
              }, () => modal.remove());
              document.body.appendChild(modal);
            }
          });
          grid.appendChild(card);
        });
      }
    });

    return container;
  },

  // ==========================================
  // 5. WORKSHOP SCHEDULE VIEW (`/workshops`)
  // ==========================================
  WorkshopsView(navigate) {
    const container = document.createElement('div');
    container.className = 'main-view';

    const workshops = [
      { date: 'Jan 15', topic: 'Intro to AWS & Free Tier', room: 'CS 101', level: 'Beginner', isNext: false, isPast: true },
      { date: 'Jan 29', topic: 'Serverless APIs with Lambda', room: 'CS 101', level: 'Beginner', isNext: false, isPast: true },
      { date: 'Feb 12', topic: 'RAG chatbots on Bedrock', room: 'CS 204', level: 'Intermediate', isNext: true, isPast: false },
      { date: 'Feb 26', topic: 'Builder Center publish party', room: 'Library 3F', level: 'All Levels', isNext: false, isPast: false },
      { date: 'Mar 12', topic: 'Hackathon prep clinic', room: 'CS 101', level: 'All Levels', isNext: false, isPast: false }
    ];

    container.innerHTML = `
      <div class="dashboard-container">
        <h1 class="welcome-title">AWS Student Builder Workshops</h1>
        <p class="welcome-subtitle">
          Official workshop schedule for the campus chapter (sourced directly from <code>06-workshop-index.md</code>). Click any workshop to view room & preparation details.
        </p>

        <div style="background:var(--bg-card); border:1px solid var(--aws-orange); border-radius:14px; padding:1.25rem 1.5rem; margin:1.5rem 0 2rem; display:flex; align-items:center; justify-content:space-between; gap:1rem;">
          <div>
            <div style="font-size:0.78rem; text-transform:uppercase; font-weight:800; color:var(--aws-orange);">Next Scheduled Session</div>
            <div style="font-size:1.2rem; font-weight:800; color:var(--text-main);">Feb 12 — RAG chatbots on Bedrock</div>
            <div style="font-size:0.85rem; color:var(--text-secondary);">Room CS 204 | Intermediate Level | Laptop & AWS Account Required</div>
          </div>
          <button class="btn btn-primary btn-sm" id="view-next-ws-btn">View Next Details ↗</button>
        </div>
        
        <div class="workshop-list" id="workshop-list-container"></div>
      </div>
    `;

    const wsListContainer = container.querySelector('#workshop-list-container');
    const handleWorkshopClick = (ws) => {
      const modal = Components.WorkshopDetailModal(ws, () => modal.remove());
      document.body.appendChild(modal);
    };

    workshops.forEach(ws => {
      const card = Components.WorkshopCard(ws, handleWorkshopClick);
      wsListContainer.appendChild(card);
    });

    container.querySelector('#view-next-ws-btn').addEventListener('click', () => {
      handleWorkshopClick(workshops[2]);
    });

    return container;
  },

  // ==========================================
  // 6. COMMUNITY VIEW (`/community`)
  // ==========================================
  CommunityView(navigate) {
    const container = document.createElement('div');
    container.className = 'main-view';

    const directoryData = [
      {
        department: "Group Leadership & Technical",
        members: [
          { name: "Shanmukha Sasi Sadineni", role: "AWS Student Builder Group Leader", phone: "7396025334", email: "sadinenisasi@gmail.com", department: "Group Leadership" },
          { name: "Revan Kumar Goud Bommagoni", role: "Technical Lead", phone: "8106105746", email: "brevankumargoud@gmail.com", department: "Technical Lead" },
          { name: "Shaik Suhail", role: "Technical Associate", phone: "8244793270", email: "—", department: "Technical" },
          { name: "Katta Naga Sai Nikhila", role: "Technical Associate", phone: "6302951898", email: "kattasainikhila@gmail.com", department: "Technical" }
        ]
      },
      {
        department: "Community Outreach & Engagement",
        members: [
          { name: "Rashesh Reddy Yarram", role: "Community Outreach & Engagement Director", phone: "8985468719", email: "yarramradheshreddy@gmail.com", department: "Community Outreach" },
          { name: "Palavari Navyasree", role: "Community Outreach & Engagement Associate", phone: "6300489908", email: "navyasreepalavari@gmail.com", department: "Community Outreach" }
        ]
      },
      {
        department: "Events & Operations",
        members: [
          { name: "Panala Aditya", role: "Events & Operations Director", phone: "9133770055", email: "—", department: "Events & Operations" },
          { name: "Bee Bee Reshma Shaik", role: "Events & Operations Associate", phone: "9963098234", email: "beebeereshma.55@gmail.com", department: "Events & Operations" }
        ]
      },
      {
        department: "Media & Creative",
        members: [
          { name: "Boda Sandeep Kumar", role: "Media & Creative Director", phone: "8019294885", email: "sandeepkumarboda777@gmail.com", department: "Media & Creative" },
          { name: "Grandhe Veera Venkata Sravya", role: "Media & Creative Associate", phone: "6304651563", email: "grandheveeravenkatasravya@gmail.com", department: "Media & Creative" },
          { name: "Rokkala Sahith", role: "Media & Creative Associate", phone: "9550694280", email: "rokkaladhoni410@gmail.com", department: "Media & Creative" }
        ]
      },
      {
        department: "Public Relations & Social Media",
        members: [
          { name: "Chittukuri Anil Kumar", role: "Public Relations & Social Media Director", phone: "6281852558", email: "anilkumarchittuluri@gmail.com", department: "Public Relations" },
          { name: "Palukuru Jeevanmai", role: "Public Relations & Social Media Associate", phone: "8142483559", email: "jeevanmaipalukuru@gmail.com", department: "Public Relations" }
        ]
      }
    ];

    container.innerHTML = `
      <div class="dashboard-container">
        <h1 class="welcome-title">AWS Student Builder Groups — Community</h1>
        <p class="welcome-subtitle">
          Mission: <strong>"Learn by building."</strong> Complete campus chapter directory from <code>01-onboarding-faq.md</code>. Click any card for full details.
        </p>

        <div style="display:flex; flex-direction:column; gap:2.5rem; margin-top:2rem;">
          ${directoryData.map(group => `
            <div>
              <h3 style="font-size:1.15rem; font-weight:700; color:var(--aws-orange); margin-bottom:1rem; border-bottom:1px solid var(--border-subtle); padding-bottom:0.4rem;">
                📌 ${escapeHtml(group.department)}
              </h3>
              <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:1.25rem;">
                ${group.members.map(m => `
                  <div class="directory-card" data-json="${escapeHtml(JSON.stringify(m))}" style="background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:12px; padding:1.25rem; cursor:pointer; transition:var(--transition-fast);">
                    <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.6rem;">
                      <div class="user-avatar" style="width:36px; height:36px; background:linear-gradient(135deg, var(--aws-blue), var(--aws-teal)); color:#fff; font-weight:700; font-size:0.9rem;">
                        ${m.name[0].toUpperCase()}
                      </div>
                      <div>
                        <div style="font-weight:700; color:var(--text-main); font-size:0.95rem;">${escapeHtml(m.name)}</div>
                        <div style="font-size:0.8rem; color:var(--aws-orange); font-weight:600;">${escapeHtml(m.role)}</div>
                      </div>
                    </div>
                    <div style="font-size:0.82rem; color:var(--text-secondary); display:flex; flex-direction:column; gap:0.2rem; margin-top:0.5rem; padding-top:0.5rem; border-top:1px solid var(--border-subtle);">
                      ${m.phone && m.phone !== '—' ? `<div>📞 Phone: <a href="tel:${escapeHtml(m.phone)}" class="contact-link" onclick="event.stopPropagation()">${escapeHtml(m.phone)}</a></div>` : ''}
                      ${m.email && m.email !== '—' ? `<div>📧 Email: <a href="mailto:${escapeHtml(m.email)}" class="contact-link" onclick="event.stopPropagation()">${escapeHtml(m.email)}</a></div>` : '<div style="color:var(--text-muted);">📧 Email: Contact via Lead</div>'}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    container.querySelectorAll('.directory-card').forEach(card => {
      card.addEventListener('click', () => {
        const memberData = JSON.parse(card.getAttribute('data-json'));
        const modal = Components.MemberDetailModal(memberData, () => modal.remove());
        document.body.appendChild(modal);
      });
    });

    return container;
  },

  // ==========================================
  // 7. CHAT HISTORY VIEW (`/history`)
  // ==========================================
  HistoryView(navigate) {
    const container = document.createElement('div');
    container.className = 'main-view';
    container.innerHTML = `
      <div class="dashboard-container">
        <h1 class="welcome-title">Your Question History</h1>
        <p class="welcome-subtitle">Review all your previous interactions with the Knowledge Assistant.</p>
        <div id="full-history-list" style="margin-top:2rem;">
          <div style="color:var(--text-muted);">Fetching your history...</div>
        </div>
      </div>
    `;

    const listDiv = container.querySelector('#full-history-list');
    API.getHistory(Auth.getToken()).then(res => {
      listDiv.innerHTML = '';
      if (!res.history || res.history.length === 0) {
        listDiv.innerHTML = `<div style="color:var(--text-muted);">No recorded chat history yet. Ask your first question in the Knowledge Assistant!</div>`;
        return;
      }

      res.history.forEach(item => {
        const div = document.createElement('div');
        div.style.cssText = 'background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:12px; padding:1.25rem; margin-bottom:1rem;';
        div.innerHTML = `
          <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
            <strong style="color:var(--aws-orange);">Q: ${escapeHtml(item.question)}</strong>
            <span style="font-size:0.8rem; color:var(--text-muted);">${escapeHtml(item.timestamp)}</span>
          </div>
          <div style="font-size:0.92rem; color:var(--text-main); line-height:1.5;">${escapeHtml(item.answer)}</div>
        `;
        listDiv.appendChild(div);
      });
    });

    return container;
  },

  // ==========================================
  // 8. AWS ARCHITECTURE / PITCH PAGE (`/architecture`)
  // ==========================================
  ArchitectureView(navigate) {
    const container = document.createElement('div');
    container.className = 'main-view';
    container.innerHTML = `
      <div class="architecture-container">
        <div class="arch-header">
          <h1 class="welcome-title">Production AWS Architecture Story</h1>
          <p class="welcome-subtitle">Demonstrating 70% baseline + 30% dynamic document sync readiness for hackathon judges.</p>
        </div>

        ${Components.ArchitectureDiagram().outerHTML}

        <div style="background:var(--bg-card); border:1px solid var(--border-strong); border-radius:16px; padding:2rem; margin-top:2rem;">
          <h3 style="font-size:1.2rem; font-weight:700; color:var(--aws-orange); margin-bottom:0.75rem;">30% Onsite Pipeline: Dynamic Document Synchronization</h3>
          <p style="color:var(--text-secondary); font-size:0.92rem; line-height:1.6; margin-bottom:1rem;">
            When an administrator publishes or updates event-day briefings, the file uploads to <strong>Amazon S3</strong>. 
            An <strong>S3 Event Trigger</strong> invokes an <strong>AWS Lambda Ingestion Function</strong> which re-chunks text, generates vector embeddings via <strong>Amazon Bedrock Titan</strong>, and updates the <strong>OpenSearch Serverless / Bedrock Knowledge Base index</strong> in under 60 seconds.
          </p>
          <h3 style="font-size:1.2rem; font-weight:700; color:var(--text-main); margin-bottom:0.75rem;">Official AWS Resources & Documentation Links</h3>
          <ul style="color:var(--text-secondary); padding-left:1.5rem; line-height:1.8;">
            <li><a href="https://aws.amazon.com" target="_blank" rel="noopener noreferrer" class="ext-link">AWS Official Portal (aws.amazon.com) ↗</a></li>
            <li><a href="https://builder.aws.com" target="_blank" rel="noopener noreferrer" class="ext-link">AWS Builder Center (builder.aws.com) ↗</a></li>
            <li><a href="https://docs.aws.amazon.com/bedrock/" target="_blank" rel="noopener noreferrer" class="ext-link">Amazon Bedrock Service Documentation ↗</a></li>
            <li><a href="https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html" target="_blank" rel="noopener noreferrer" class="ext-link">Bedrock Knowledge Bases Guide ↗</a></li>
          </ul>
        </div>
      </div>
    `;
    return container;
  },

  // ==========================================
  // 9. MEMBER PROFILE PAGE (`/profile`)
  // ==========================================
  ProfileView(navigate) {
    const container = document.createElement('div');
    container.className = 'main-view';
    container.innerHTML = `
      <div class="dashboard-container" style="max-width:700px;">
        <div class="welcome-header">
          <h1 class="welcome-title">Member Profile</h1>
          <p class="welcome-subtitle">Manage your account information and membership preferences.</p>
        </div>

        <div class="auth-card" style="max-width:100%;">
          <form id="profile-form">
            <div class="form-group">
              <label class="form-label">Campus Email (Read-Only ID)</label>
              <input type="email" class="form-input" id="pf-email" readonly style="opacity:0.7; cursor:not-allowed;" />
            </div>

            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input type="text" class="form-input" id="pf-name" required />
            </div>

            <div class="form-group">
              <label class="form-label">Club Role / Department</label>
              <input type="text" class="form-input" id="pf-role" placeholder="e.g. Student Builder Member, Technical Associate" required />
            </div>

            <div class="form-group">
              <label class="form-label">Member Bio & Technical Interests</label>
              <textarea class="form-input" id="pf-bio" rows="3" placeholder="Tell us about your AWS projects..."></textarea>
            </div>

            <div id="pf-message" style="margin-bottom:1rem; font-size:0.9rem; display:none;"></div>

            <div style="display:flex; gap:1rem; margin-top:1.5rem;">
              <button type="submit" class="btn btn-primary" style="flex:1;">Save Profile Changes</button>
              <button type="button" class="btn btn-secondary" id="pf-logout-btn">Log Out</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const emailInput = container.querySelector('#pf-email');
    const nameInput = container.querySelector('#pf-name');
    const roleInput = container.querySelector('#pf-role');
    const bioInput = container.querySelector('#pf-bio');
    const msgDiv = container.querySelector('#pf-message');

    API.getProfile(Auth.getToken()).then(res => {
      if (res.user) {
        emailInput.value = res.user.email || '';
        nameInput.value = res.user.name || '';
        roleInput.value = res.user.role || 'Student Builder Member';
        bioInput.value = res.user.bio || '';
      }
    });

    container.querySelector('#pf-logout-btn').addEventListener('click', () => {
      Auth.clearSession();
      navigate('/');
    });

    container.querySelector('#profile-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      msgDiv.style.display = 'none';

      const res = await API.updateProfile(nameInput.value, roleInput.value, bioInput.value, Auth.getToken());
      if (res.success) {
        Auth.updateUser(res.user);
        msgDiv.style.color = 'var(--aws-green)';
        msgDiv.textContent = '✅ Profile updated successfully!';
        msgDiv.style.display = 'block';
        showToast('Profile updated!');
      } else {
        msgDiv.style.color = '#F87171';
        msgDiv.textContent = res.error || 'Failed to update profile.';
        msgDiv.style.display = 'block';
      }
    });

    return container;
  },

  // ==========================================
  // 10. ADMIN COMMAND CENTER VIEW (`/admin`)
  // ==========================================
  AdminView(navigate) {
    const container = document.createElement('div');
    container.className = 'main-view';
    const token = Auth.getToken();

    container.innerHTML = `
      <div class="dashboard-container">
        <div class="welcome-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
          <div>
            <h1 class="welcome-title" style="color:var(--aws-orange);">⚡ BUILDER COMMAND CENTER</h1>
            <p class="welcome-subtitle">Onsite Admin Dashboard — Dynamic Document Publishing, Re-Indexing & Smoke Tests</p>
          </div>
          <div style="background:rgba(255,153,0,0.12); border:1px solid rgba(255,153,0,0.3); color:var(--aws-orange); padding:0.4rem 0.85rem; border-radius:20px; font-size:0.82rem; font-weight:700;">
            PORT 8080 API: ONLINE
          </div>
        </div>

        <!-- 4 Metric Cards -->
        <div class="stats-banner" style="margin-bottom:2rem; background:linear-gradient(135deg, rgba(17,24,39,0.9), rgba(30,41,59,0.9)); border:1px solid var(--border-strong);">
          <div class="stat-item">
            <div class="stat-value" id="adm-doc-count" style="color:var(--aws-orange);">10</div>
            <div class="stat-label">DOCUMENTS</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" id="adm-sync-status" style="color:var(--aws-green);">SYNCED</div>
            <div class="stat-label">INDEX STATUS</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" id="adm-last-updated" style="font-size:1.4rem;">0s ago</div>
            <div class="stat-label">LAST UPDATE</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" style="color:var(--aws-blue); font-size:1.4rem;">:8080/ask</div>
            <div class="stat-label">EVALUATOR API</div>
          </div>
        </div>

        <!-- Visual RAG Pipeline Flow -->
        <div class="knowledge-flow-card" style="margin-bottom:2rem;">
          <div class="flow-title">Onsite 30% Dynamic Indexing Pipeline</div>
          <div class="flow-nodes-container">
            <div class="flow-node">
              <div class="flow-node-title" style="color:var(--aws-orange);">ADMIN PUBLISH</div>
              <div class="flow-node-desc">Upload Markdown</div>
            </div>
            <div class="flow-arrow">➔</div>
            <div class="flow-node">
              <div class="flow-node-title">DOCUMENT STORE</div>
              <div class="flow-node-desc">data/knowledge-document</div>
            </div>
            <div class="flow-arrow">➔</div>
            <div class="flow-node" style="border-color:var(--aws-orange);">
              <div class="flow-node-title" style="color:var(--aws-orange);">RE-INDEX</div>
              <div class="flow-node-desc">refresh_document_index()</div>
            </div>
            <div class="flow-arrow">➔</div>
            <div class="flow-node">
              <div class="flow-node-title">RAG INDEX</div>
              <div class="flow-node-desc">TF-IDF Vector Cache</div>
            </div>
            <div class="flow-arrow">➔</div>
            <div class="flow-node">
              <div class="flow-node-title">MEMBER CHAT</div>
              <div class="flow-node-desc">Instant /ask Response</div>
            </div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:2rem;">
          <!-- Document Publishing Panel -->
          <div class="auth-card" style="max-width:100%;">
            <h3 style="font-size:1.2rem; font-weight:700; color:var(--text-main); margin-bottom:1rem;">Document Management & Publishing</h3>
            <form id="admin-doc-form">
              <div class="form-group">
                <label class="form-label">Filename (e.g. event-day-briefing.md)</label>
                <input type="text" class="form-input" id="adm-filename" value="event-day-briefing.md" required />
              </div>
              <div class="form-group">
                <label class="form-label">Document Title</label>
                <input type="text" class="form-input" id="adm-title" value="Event-Day Briefing & Onsite Hackathon Guide" required />
              </div>
              <div class="form-group">
                <label class="form-label">Category</label>
                <input type="text" class="form-input" id="adm-category" value="Event Day Document" required />
              </div>
              <div class="form-group">
                <label class="form-label">Markdown / Text Content</label>
                <textarea class="form-input" id="adm-content" rows="7" required># Event-Day Briefing & Onsite Hackathon Guide

## Judging Location & Time

Official onsite judging takes place in **CS 305 at 2:00 PM**. All teams must have their member portal working and published prior to judging.

## Submission Requirements

1. Published article on builder.aws.com with tag #aws-student-builders-groups.
2. Working demo URL showing member signup, knowledge search, source citations, and dynamic document synchronization.</textarea>
              </div>

              <div id="adm-msg" style="margin-bottom:1rem; font-size:0.9rem; display:none;"></div>

              <div style="display:flex; gap:0.75rem;">
                <button type="button" class="btn btn-secondary" id="adm-preview-btn">Preview</button>
                <button type="submit" class="btn btn-primary" style="flex:1;" id="adm-pub-btn">Publish Document ⚡</button>
              </div>
            </form>
          </div>

          <!-- Smoke Test Evaluation Panel -->
          <div>
            <div class="auth-card" style="max-width:100%; height:100%;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                <h3 style="font-size:1.2rem; font-weight:700; color:var(--text-main);">Smoke Test Evaluation Suite</h3>
                <button class="btn btn-primary btn-sm" id="run-smoke-btn">Run Smoke Tests ➔</button>
              </div>
              <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:1rem;">
                Evaluates questions loaded from <code>09-smoke-test-questions.md</code> to verify live RAG retrieval & source citation accuracy.
              </p>

              <div id="smoke-results-container" style="display:flex; flex-direction:column; gap:0.85rem;">
                <div style="font-size:0.85rem; color:var(--text-muted);">Click 'Run Smoke Tests' to execute automated evaluation.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const form = container.querySelector('#admin-doc-form');
    const msgDiv = container.querySelector('#adm-msg');
    const pubBtn = container.querySelector('#adm-pub-btn');
    const smokeContainer = container.querySelector('#smoke-results-container');
    const runSmokeBtn = container.querySelector('#run-smoke-btn');

    const updateStatsDisplay = async () => {
      try {
        const stats = await API.getStats();
        container.querySelector('#adm-doc-count').textContent = stats.verified_documents_count || '10';
        if (stats.sync_status) {
          container.querySelector('#adm-sync-status').textContent = stats.sync_status.status;
          container.querySelector('#adm-last-updated').textContent = `${stats.sync_status.last_updated_seconds_ago}s ago`;
        }
      } catch (e) {}
    };
    updateStatsDisplay();

    // Run Smoke Tests Handler
    const executeSmokeTests = async () => {
      smokeContainer.innerHTML = `<div style="font-size:0.85rem; color:var(--aws-orange);">⚡ Executing smoke tests across dynamic RAG index...</div>`;
      try {
        const res = await API.runSmokeTests(token);
        smokeContainer.innerHTML = '';
        if (res.smoke_tests) {
          res.smoke_tests.forEach(st => {
            const div = document.createElement('div');
            div.style.cssText = 'background:var(--bg-surface); border:1px solid var(--border-strong); border-radius:10px; padding:0.85rem; font-size:0.88rem;';
            const isPass = st.status === 'PASS';
            div.innerHTML = `
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                <strong style="color:var(--text-main);">${escapeHtml(st.id)}: ${escapeHtml(st.question)}</strong>
                <span class="match-strength-badge ${isPass ? 'strong' : 'weak'}" style="${isPass ? 'background:rgba(34,197,94,0.15); color:var(--aws-green);' : 'background:rgba(239,68,68,0.15); color:#F87171;'}">
                  ${isPass ? '✅ PASS' : '❌ FAIL'}
                </span>
              </div>
              <div style="font-size:0.8rem; color:var(--text-secondary);">
                Expected Source: <strong style="color:var(--aws-orange);">${escapeHtml(st.expected_source)}</strong> | 
                Actual Source: <strong style="color:var(--aws-blue);">${escapeHtml(st.actual_source)}</strong>
              </div>
            `;
            smokeContainer.appendChild(div);
          });
        }
      } catch (e) {
        smokeContainer.innerHTML = `<div style="color:#F87171; font-size:0.85rem;">Failed executing smoke tests.</div>`;
      }
    };

    runSmokeBtn.addEventListener('click', executeSmokeTests);
    executeSmokeTests();

    // Document Publishing Form Submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      msgDiv.style.display = 'none';
      pubBtn.disabled = true;

      const filename = container.querySelector('#adm-filename').value;
      const title = container.querySelector('#adm-title').value;
      const category = container.querySelector('#adm-category').value;
      const content = container.querySelector('#adm-content').value;

      try {
        const res = await API.publishAdminDocument(filename, title, category, content, token);
        if (res.success) {
          msgDiv.style.color = 'var(--aws-green)';
          msgDiv.textContent = `✅ ${res.message}`;
          msgDiv.style.display = 'block';
          showToast(`Published '${filename}' & refreshed RAG index!`);
          updateStatsDisplay();
          executeSmokeTests();
        } else {
          msgDiv.style.color = '#F87171';
          msgDiv.textContent = res.error || 'Publishing failed.';
          msgDiv.style.display = 'block';
        }
      } catch (err) {
        msgDiv.style.color = '#F87171';
        msgDiv.textContent = 'Network error publishing document.';
        msgDiv.style.display = 'block';
      } finally {
        pubBtn.disabled = false;
      }
    });

    return container;
  },

  // ==========================================
  // 11. AUTHENTICATION VIEWS (`/login`, `/signup`, `/forgot-password`)
  // ==========================================
  AuthViews(path, navigate) {
    const container = document.createElement('div');
    container.className = 'auth-page-container';

    if (path === '/signup') {
      container.innerHTML = `
        <div class="auth-card">
          <div class="auth-header">
            <h1 class="auth-title">Join AWS Student Builders</h1>
            <p class="auth-subtitle">Create an account with your campus email</p>
          </div>
          <form id="signup-form">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input type="text" class="form-input" id="su-name" placeholder="e.g. Alex Rivera" required />
            </div>
            <div class="form-group">
              <label class="form-label">Campus Email</label>
              <input type="email" class="form-input" id="su-email" placeholder="student@campus.edu" required />
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <div class="password-wrapper">
                <input type="password" class="form-input" id="su-pass" placeholder="At least 6 characters" required />
                <button type="button" class="toggle-password" id="toggle-pass">👁️</button>
              </div>
              <div class="strength-meter"><div class="strength-bar" id="strength-bar"></div></div>
              <div class="strength-label" id="strength-text">Password strength</div>
            </div>
            <div class="form-group">
              <label class="form-label">Confirm Password</label>
              <input type="password" class="form-input" id="su-confirm" placeholder="Re-enter password" required />
            </div>
            <div id="auth-error" style="color:#F87171; font-size:0.85rem; margin-bottom:1rem; display:none;"></div>
            <button type="submit" class="btn btn-primary" style="width:100%;">Create Account</button>
            <div style="text-align:center; margin-top:1.25rem; font-size:0.88rem; color:var(--text-secondary);">
              Already a member? <a href="javascript:void(0)" id="to-login" style="color:var(--aws-orange); font-weight:600;">Sign in</a>
            </div>
          </form>
        </div>
      `;

      const passInput = container.querySelector('#su-pass');
      const toggleBtn = container.querySelector('#toggle-pass');
      const bar = container.querySelector('#strength-bar');
      const text = container.querySelector('#strength-text');
      const errDiv = container.querySelector('#auth-error');

      toggleBtn.addEventListener('click', () => {
        passInput.type = passInput.type === 'password' ? 'text' : 'password';
      });

      passInput.addEventListener('input', () => {
        const val = passInput.value;
        if (!val) {
          bar.className = 'strength-bar';
          text.textContent = 'Password strength';
          return;
        }
        let score = 0;
        if (val.length >= 6) score += 35;
        if (val.length >= 10) score += 25;
        if (/[A-Z]/.test(val)) score += 20;
        if (/[0-9]/.test(val)) score += 20;

        if (score < 50) {
          bar.className = 'strength-bar weak';
          text.textContent = 'Weak password';
        } else if (score < 80) {
          bar.className = 'strength-bar moderate';
          text.textContent = 'Moderate strength';
        } else {
          bar.className = 'strength-bar strong';
          text.textContent = 'Strong password';
        }
      });

      container.querySelector('#to-login').addEventListener('click', (e) => {
        e.preventDefault();
        navigate('/login');
      });

      container.querySelector('#signup-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        errDiv.style.display = 'none';

        const name = container.querySelector('#su-name').value;
        const email = container.querySelector('#su-email').value;
        const pass = container.querySelector('#su-pass').value;
        const confirm = container.querySelector('#su-confirm').value;

        const res = await API.signup(name, email, pass, confirm);
        if (res.success) {
          Auth.setSession(res.token, res.user);
          showToast(res.message);
          navigate('/dashboard');
        } else {
          errDiv.textContent = res.error;
          errDiv.style.display = 'block';
        }
      });

    } else if (path === '/login') {
      container.innerHTML = `
        <div class="auth-card">
          <div class="auth-header">
            <h1 class="auth-title">Member Sign In</h1>
            <p class="auth-subtitle">Access your AWS Student Builder Member Portal</p>
          </div>
          <form id="login-form">
            <div class="form-group">
              <label class="form-label">Campus Email</label>
              <input type="email" class="form-input" id="li-email" value="builder@campus.edu" required />
            </div>
            <div class="form-group">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                <label class="form-label" style="margin-bottom:0;">Password</label>
                <a href="javascript:void(0)" id="to-forgot" style="font-size:0.8rem; color:var(--aws-orange);">Forgot Password?</a>
              </div>
              <div class="password-wrapper">
                <input type="password" class="form-input" id="li-pass" value="Builder2026!" required />
                <button type="button" class="toggle-password" id="toggle-pass-li">👁️</button>
              </div>
            </div>
            <div class="form-group" style="display:flex; align-items:center; gap:0.5rem; font-size:0.85rem; color:var(--text-secondary);">
              <input type="checkbox" id="remember-me" checked />
              <label for="remember-me">Remember me</label>
            </div>
            <div id="auth-error" style="color:#F87171; font-size:0.85rem; margin-bottom:1rem; display:none;"></div>
            <button type="submit" class="btn btn-primary" style="width:100%;">Sign In</button>
            <div style="text-align:center; margin-top:1.25rem; font-size:0.88rem; color:var(--text-secondary);">
              New to the club? <a href="javascript:void(0)" id="to-signup" style="color:var(--aws-orange); font-weight:600;">Create Account</a>
            </div>
          </form>
        </div>
      `;

      const passInput = container.querySelector('#li-pass');
      const toggleBtn = container.querySelector('#toggle-pass-li');
      const errDiv = container.querySelector('#auth-error');

      toggleBtn.addEventListener('click', () => {
        passInput.type = passInput.type === 'password' ? 'text' : 'password';
      });

      container.querySelector('#to-forgot').addEventListener('click', (e) => {
        e.preventDefault();
        navigate('/forgot-password');
      });
      container.querySelector('#to-signup').addEventListener('click', (e) => {
        e.preventDefault();
        navigate('/signup');
      });

      container.querySelector('#login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        errDiv.style.display = 'none';

        const email = container.querySelector('#li-email').value;
        const pass = container.querySelector('#li-pass').value;

        const res = await API.login(email, pass);
        if (res.success) {
          Auth.setSession(res.token, res.user);
          showToast(res.message);
          navigate(res.user.role === 'admin' ? '/admin' : '/dashboard');
        } else {
          errDiv.textContent = res.error;
          errDiv.style.display = 'block';
        }
      });

    } else if (path === '/forgot-password') {
      container.innerHTML = `
        <div class="auth-card">
          <div class="auth-header">
            <h1 class="auth-title">Forgot Password</h1>
            <p class="auth-subtitle">Enter your registered email address to receive a verification code (OTP) in your actual email inbox.</p>
          </div>

          <form id="fp-form">
            <div class="form-group">
              <label class="form-label">Registered Campus / Real Email</label>
              <input type="email" class="form-input" id="fp-email" placeholder="e.g. builder@campus.edu or your-email@gmail.com" required />
            </div>

            <div id="fp-status-msg" style="margin-bottom:1rem; font-size:0.88rem; display:none; line-height:1.5;"></div>

            <button type="submit" class="btn btn-primary" id="fp-submit-btn" style="width:100%;">Send Real Verification Email ✉️</button>
          </form>

          <div style="text-align:center; margin-top:1.5rem; font-size:0.88rem; color:var(--text-secondary);">
            Already have a 6-digit OTP code? <a href="javascript:void(0)" id="to-reset-fp" style="color:var(--aws-orange); font-weight:600;">Enter OTP Code ➔</a>
          </div>

          <div style="text-align:center; margin-top:0.75rem; font-size:0.88rem; color:var(--text-secondary);">
            Remembered password? <a href="javascript:void(0)" id="to-login-fp" style="color:var(--aws-orange); font-weight:600;">Sign in</a>
          </div>
        </div>
      `;

      const fpForm = container.querySelector('#fp-form');
      const statusMsg = container.querySelector('#fp-status-msg');
      const submitBtn = container.querySelector('#fp-submit-btn');

      container.querySelector('#to-login-fp').addEventListener('click', (e) => {
        e.preventDefault();
        navigate('/login');
      });

      container.querySelector('#to-reset-fp').addEventListener('click', (e) => {
        e.preventDefault();
        navigate('/reset-password');
      });

      fpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        statusMsg.style.display = 'none';
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending Email via Real SMTP...';

        const email = container.querySelector('#fp-email').value;

        try {
          const res = await API.forgotPassword(email);

          if (res.success) {
            statusMsg.style.color = 'var(--aws-green)';
            statusMsg.style.background = 'rgba(34,197,94,0.1)';
            statusMsg.style.border = '1px solid rgba(34,197,94,0.3)';
            statusMsg.style.padding = '0.85rem';
            statusMsg.style.borderRadius = '8px';
            statusMsg.innerHTML = `
              <strong>✅ Verification Email Sent!</strong><br/>
              Check your actual email inbox (<strong>${escapeHtml(email)}</strong>) for your 6-digit OTP code or reset link.<br/><br/>
              <button type="button" class="btn btn-secondary btn-sm" id="btn-go-otp" style="width:100%; border-color:var(--aws-green); color:var(--aws-green); font-weight:700;">
                Check Email & Enter OTP ➔
              </button>
            `;
            statusMsg.style.display = 'block';
            showToast('Real verification email dispatched via SMTP!');

            container.querySelector('#btn-go-otp')?.addEventListener('click', () => {
              navigate('/reset-password');
            });
          } else {
            statusMsg.style.color = '#F87171';
            statusMsg.style.background = 'rgba(239,68,68,0.1)';
            statusMsg.style.border = '1px solid rgba(239,68,68,0.3)';
            statusMsg.style.padding = '0.85rem';
            statusMsg.style.borderRadius = '8px';
            statusMsg.textContent = `⚠️ ${res.error || 'Email delivery failed. Please verify SMTP server settings.'}`;
            statusMsg.style.display = 'block';
          }
        } catch (err) {
          statusMsg.style.color = '#F87171';
          statusMsg.style.background = 'rgba(239,68,68,0.1)';
          statusMsg.style.border = '1px solid rgba(239,68,68,0.3)';
          statusMsg.style.padding = '0.85rem';
          statusMsg.style.borderRadius = '8px';
          statusMsg.textContent = '⚠️ Network error sending verification email.';
          statusMsg.style.display = 'block';
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Real Verification Email ✉️';
        }
      });

    } else if (path === '/reset-password') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token') || '';

      container.innerHTML = `
        <div class="auth-card">
          <div class="auth-header">
            <h1 class="auth-title">Verify OTP & Reset Password</h1>
            <p class="auth-subtitle">Check your real email inbox for the 6-digit OTP code or click link.</p>
          </div>

          <form id="rp-form">
            <div class="form-group">
              <label class="form-label">6-Digit Verification OTP Code or Reset Token</label>
              <input type="text" class="form-input" id="rp-token" value="${escapeHtml(urlToken)}" placeholder="e.g. 849201 or prt_..." required style="font-family:var(--font-mono); font-size:1.1rem; letter-spacing:2px;" />
            </div>

            <div class="form-group">
              <label class="form-label">New Password</label>
              <div class="password-wrapper">
                <input type="password" class="form-input" id="rp-new-pass" placeholder="At least 6 characters" required />
                <button type="button" class="toggle-password" id="toggle-rp-pass">👁️</button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Confirm New Password</label>
              <input type="password" class="form-input" id="rp-confirm-pass" placeholder="Re-enter new password" required />
            </div>

            <div id="rp-error-msg" style="color:#F87171; font-size:0.85rem; margin-bottom:1rem; display:none;"></div>

            <button type="submit" class="btn btn-primary" id="rp-submit-btn" style="width:100%;">Verify OTP & Change Password</button>

            <div style="text-align:center; margin-top:1.25rem; font-size:0.88rem; color:var(--text-secondary);">
              Return to <a href="javascript:void(0)" id="to-login-rp" style="color:var(--aws-orange); font-weight:600;">Member Sign In</a>
            </div>
          </form>
        </div>
      `;

      const rpForm = container.querySelector('#rp-form');
      const passInput = container.querySelector('#rp-new-pass');
      const confirmInput = container.querySelector('#rp-confirm-pass');
      const tokenInput = container.querySelector('#rp-token');
      const toggleBtn = container.querySelector('#toggle-rp-pass');
      const errDiv = container.querySelector('#rp-error-msg');
      const submitBtn = container.querySelector('#rp-submit-btn');

      toggleBtn.addEventListener('click', () => {
        passInput.type = passInput.type === 'password' ? 'text' : 'password';
      });

      container.querySelector('#to-login-rp').addEventListener('click', (e) => {
        e.preventDefault();
        navigate('/login');
      });

      rpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errDiv.style.display = 'none';

        const tokenVal = tokenInput.value.trim();
        const newPass = passInput.value;
        const confirmPass = confirmInput.value;

        if (newPass !== confirmPass) {
          errDiv.textContent = 'Passwords do not match.';
          errDiv.style.display = 'block';
          return;
        }

        if (newPass.length < 6) {
          errDiv.textContent = 'New password must be at least 6 characters long.';
          errDiv.style.display = 'block';
          return;
        }

        submitBtn.disabled = true;

        try {
          const res = await API.resetPassword(tokenVal, newPass);
          if (res.success) {
            showToast(res.message || 'Password changed successfully!');
            navigate('/login');
          } else {
            errDiv.textContent = res.error || 'Password reset failed.';
            errDiv.style.display = 'block';
          }
        } catch (err) {
          errDiv.textContent = 'Network error verifying OTP code.';
          errDiv.style.display = 'block';
        } finally {
          submitBtn.disabled = false;
        }
      });
    }

    return container;
  }
};

function escapeHtml(text) {
  if (!text) return '';
  return text.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}
