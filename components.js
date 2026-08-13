/**
 * AWS Student Builder Groups - Reusable UI Components
 * Modular rendering functions for SourceCard, SourceViewer, MemberDetailModal, WorkshopDetailModal, FallbackCard, ChatMessage, etc.
 */

export const Components = {
  // 1. Source Citation Card
  SourceCard(source, onViewClick) {
    const card = document.createElement('div');
    card.className = 'source-card';
    card.innerHTML = `
      <div class="source-card-header">
        <span class="source-file-badge">
          📄 ${escapeHtml(source.filename)}
        </span>
        <span class="match-strength-badge ${source.match_strength ? source.match_strength.toLowerCase() : 'strong'}">
          ${escapeHtml(source.match_strength || 'Strong')} Match
        </span>
      </div>
      <div class="source-section-title">Section: ${escapeHtml(source.section)}</div>
      <div class="source-excerpt">"${escapeHtml(source.excerpt)}"</div>
      <button class="btn btn-secondary btn-sm view-source-btn">View document ↗</button>
    `;

    card.querySelector('.view-source-btn').addEventListener('click', () => onViewClick(source));
    return card;
  },

  // 2. Source Viewer Modal / Drawer
  SourceViewer(source, onClose) {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <div>
            <div class="modal-title">${escapeHtml(source.doc_title || source.filename)}</div>
            <div style="font-size:0.8rem; color:var(--text-muted); font-family:var(--font-mono);">
              Source File: ${escapeHtml(source.filename)}
            </div>
          </div>
          <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          ${source.url ? `
            <div style="margin-bottom:1rem; font-size:0.88rem; color:var(--aws-orange); font-weight:600;">
              Original Raw URL: <a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.url)}</a>
            </div>
          ` : ''}
          <h4 style="color:var(--text-main); margin-bottom:0.5rem;">Section: ${escapeHtml(source.section)}</h4>
          <div class="highlighted-section">
            ${formatMarkdownText(source.full_content || source.excerpt)}
          </div>
          <div style="margin-top:1.5rem; font-size:0.82rem; color:var(--text-secondary);">
            Category: <span class="category-badge">${escapeHtml(source.category || 'General')}</span>
          </div>
        </div>
      </div>
    `;

    modal.querySelector('.close-btn').addEventListener('click', onClose);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) onClose();
    });
    return modal;
  },

  // 3. Directory Member Detail Modal
  MemberDetailModal(member, onClose) {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    
    const emailHTML = member.email && member.email !== '—' && member.email !== 'Contact via Group Lead'
      ? `<a href="mailto:${escapeHtml(member.email)}" class="contact-link">📧 ${escapeHtml(member.email)}</a>`
      : `<span style="color:var(--text-muted); font-size:0.85rem;">📧 Email: Contact via Group Lead</span>`;

    const phoneHTML = member.phone && member.phone !== '—'
      ? `<a href="tel:${escapeHtml(member.phone)}" class="contact-link">📞 ${escapeHtml(member.phone)}</a>`
      : `<span style="color:var(--text-muted); font-size:0.85rem;">📞 Phone unavailable</span>`;

    modal.innerHTML = `
      <div class="modal-card" style="max-width:500px;">
        <div class="modal-header">
          <div class="modal-title">Club Directory Member Profile</div>
          <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body" style="text-align:center; padding:2rem 1.5rem;">
          <div class="user-avatar" style="width:64px; height:64px; font-size:1.8rem; margin:0 auto 1rem; background:linear-gradient(135deg, var(--aws-orange), var(--aws-amber)); color:#000;">
            ${member.name[0].toUpperCase()}
          </div>
          <h2 style="font-family:var(--font-heading); font-size:1.5rem; font-weight:800; margin-bottom:0.3rem;">
            ${escapeHtml(member.name)}
          </h2>
          <div style="font-size:0.95rem; font-weight:700; color:var(--aws-orange); margin-bottom:0.4rem;">
            ${escapeHtml(member.role)}
          </div>
          <div style="font-size:0.82rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.8px; margin-bottom:1.5rem;">
            Department: ${escapeHtml(member.department || 'General')}
          </div>

          <div class="contact-box" style="text-align:left; background:var(--bg-surface); border:1px solid var(--border-strong);">
            <div style="font-weight:700; font-size:0.88rem; color:var(--text-main); margin-bottom:0.75rem;">Direct Contact Information</div>
            <div style="display:flex; flex-direction:column; gap:0.6rem; font-size:0.9rem;">
              <div>${phoneHTML}</div>
              <div>${emailHTML}</div>
            </div>
          </div>
        </div>
      </div>
    `;

    modal.querySelector('.close-btn').addEventListener('click', onClose);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) onClose();
    });
    return modal;
  },

  // 4. Workshop Detail Modal
  WorkshopDetailModal(ws, onClose) {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-card" style="max-width:580px;">
        <div class="modal-header">
          <div>
            <div class="modal-title">${escapeHtml(ws.topic)}</div>
            <div style="font-size:0.8rem; color:var(--aws-orange); font-weight:600; margin-top:0.2rem;">
              ${ws.isNext ? '🔥 Next Scheduled Workshop' : (ws.isPast ? '📚 Past Workshop Session' : '📅 Scheduled Session')}
            </div>
          </div>
          <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; background:var(--bg-surface); padding:1rem; border-radius:10px; margin-bottom:1.25rem;">
            <div>
              <div style="font-size:0.78rem; color:var(--text-muted); text-transform:uppercase;">Date & Time</div>
              <div style="font-weight:700; font-size:1rem; color:var(--text-main);">${escapeHtml(ws.date)}</div>
            </div>
            <div>
              <div style="font-size:0.78rem; color:var(--text-muted); text-transform:uppercase;">Venue Location</div>
              <div style="font-weight:700; font-size:1rem; color:var(--text-main);">${escapeHtml(ws.room)}</div>
            </div>
            <div>
              <div style="font-size:0.78rem; color:var(--text-muted); text-transform:uppercase;">Skill Level</div>
              <div style="font-weight:700; font-size:1rem; color:var(--aws-orange);">${escapeHtml(ws.level)}</div>
            </div>
            <div>
              <div style="font-size:0.78rem; color:var(--text-muted); text-transform:uppercase;">Source Document</div>
              <div style="font-family:var(--font-mono); font-size:0.85rem; color:var(--aws-blue);">06-workshop-index.md</div>
            </div>
          </div>

          <h4 style="color:var(--text-main); margin-bottom:0.5rem;">Session Details & Preparation</h4>
          <p style="font-size:0.92rem; color:var(--text-secondary); line-height:1.6; margin-bottom:1rem;">
            Any student with an AWS account (Free Tier is fine) is welcome to attend. Please bring your personal laptop and ensure your AWS account setup is completed prior to the session.
          </p>

          <h4 style="color:var(--text-main); margin-bottom:0.5rem;">Session Recordings & Slides</h4>
          <p style="font-size:0.88rem; color:var(--text-secondary); line-height:1.6; margin-bottom:1.5rem;">
            Past session slides and code repositories live in the club shared drive. Ask any team lead or message the Knowledge Assistant for access links.
          </p>

          <button class="btn btn-primary" style="width:100%;" id="close-modal-btn">Close Details</button>
        </div>
      </div>
    `;

    modal.querySelector('.close-btn').addEventListener('click', onClose);
    modal.querySelector('#close-modal-btn').addEventListener('click', onClose);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) onClose();
    });
    return modal;
  },

  // 5. Directory-Aware Fallback Card with Structured Multi-Contact Routing
  FallbackCard(fallbackData) {
    const groupLeader = fallbackData.group_leader || {
      name: "Shanmukha Sasi Sadineni",
      role: "AWS Student Builder Group Leader",
      email: "sadinenisasi@gmail.com",
      phone: "7396025334"
    };

    const techLead = fallbackData.tech_lead || {
      name: "Revan Kumar Goud Bommagoni",
      role: "Technical Lead",
      email: "brevankumargoud@gmail.com",
      phone: "8106105746"
    };

    const relevantDirector = fallbackData.relevant_director;

    const div = document.createElement('div');
    div.className = 'fallback-card';

    const renderContactBox = (c, iconSymbol, labelTitle) => {
      if (!c) return '';
      const hasEmail = c.email && c.email !== '—' && c.email !== 'Contact via Group Lead';
      const emailLine = hasEmail
        ? `<span>📧 Email: <a href="mailto:${escapeHtml(c.email)}" class="contact-link">${escapeHtml(c.email)}</a></span>`
        : `<span style="color:var(--text-muted);">📧 Email: Contact via Group Lead</span>`;

      const phoneLine = c.phone && c.phone !== '—'
        ? `<span>📞 Phone: <a href="tel:${escapeHtml(c.phone)}" class="contact-link"><strong>${escapeHtml(c.phone)}</strong></a></span>`
        : '';

      return `
        <div class="contact-box" style="margin-top:0.6rem;">
          <div style="font-size:0.78rem; text-transform:uppercase; color:var(--aws-orange); font-weight:700; margin-bottom:0.2rem;">
            ${iconSymbol} ${escapeHtml(labelTitle)}
          </div>
          <div class="contact-name">${escapeHtml(c.name)}</div>
          <div class="contact-role">${escapeHtml(c.role)}</div>
          <div class="contact-details">
            ${phoneLine}
            ${emailLine}
          </div>
        </div>
      `;
    };

    div.innerHTML = `
      <div class="fallback-title">
        🛡️ Not answered from verified knowledge base
      </div>
      <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:0.75rem;">
        This question is outside the coverage of our 8 official starter documents.
      </p>

      ${fallbackData.detected_area ? `
        <div style="display:inline-block; font-size:0.8rem; background:rgba(255,153,0,0.12); border:1px solid rgba(255,153,0,0.3); color:var(--aws-orange); padding:0.25rem 0.65rem; border-radius:6px; font-weight:600; margin-bottom:0.85rem;">
          🎯 Detected Area: ${escapeHtml(fallbackData.detected_area)}
        </div>
      ` : ''}

      <div style="font-size:0.85rem; font-weight:700; color:var(--text-main); margin-top:0.5rem; margin-bottom:0.2rem;">
        Suggested official club contacts from directory:
      </div>
      
      ${relevantDirector ? renderContactBox(relevantDirector, '🎯', `Relevant Director — ${relevantDirector.department || 'Department'}`) : ''}
      ${renderContactBox(groupLeader, '👤', 'Group Leader — General Help')}
      ${renderContactBox(techLead, '💻', 'Technical Lead — Architecture & Code')}
    `;
    return div;
  },

  // 6. Chat Message Bubble
  ChatMessage(msg, onSourceClick, onFeedback) {
    const row = document.createElement('div');
    row.className = `chat-message-row ${msg.role}`;
    
    const isAssistant = msg.role === 'assistant';
    const avatarLetter = isAssistant ? 'AWS' : (msg.userName ? msg.userName[0].toUpperCase() : 'U');

    let bodyHTML = '';

    if (!isAssistant) {
      bodyHTML = `<p>${escapeHtml(msg.text)}</p>`;
    } else if (msg.fallback) {
      bodyHTML = Components.FallbackCard(msg).outerHTML;
    } else {
      bodyHTML = `
        <div class="grounded-badge">
          🛡️ 100% Grounded in Official Club Docs
        </div>
        <div>${formatMarkdownText(msg.text)}</div>
      `;
    }

    row.innerHTML = `
      <div class="msg-avatar">${avatarLetter}</div>
      <div class="msg-bubble">
        ${bodyHTML}
        ${isAssistant ? `
          <div class="feedback-container">
            <span>Was this answer helpful?</span>
            <button class="feedback-btn like-btn" title="Helpful">👍</button>
            <button class="feedback-btn dislike-btn" title="Not helpful">👎</button>
          </div>
        ` : ''}
      </div>
    `;

    if (isAssistant && onFeedback) {
      row.querySelector('.like-btn')?.addEventListener('click', (e) => {
        e.target.style.color = 'var(--aws-green)';
        onFeedback(msg.question, 'helpful');
      });
      row.querySelector('.dislike-btn')?.addEventListener('click', (e) => {
        e.target.style.color = '#F87171';
        onFeedback(msg.question, 'not_helpful');
      });
    }

    return row;
  },

  // 7. Document Card for Resource Library
  DocumentCard(doc, onOpen) {
    const div = document.createElement('div');
    div.className = 'document-card';
    div.innerHTML = `
      <div>
        <span class="category-badge">${escapeHtml(doc.category)}</span>
        <div class="doc-filename">📄 ${escapeHtml(doc.filename)}</div>
        <div class="doc-card-title">${escapeHtml(doc.title)}</div>
        <div class="doc-card-desc">${escapeHtml(doc.description)}</div>
      </div>
      <button class="btn btn-secondary btn-sm open-doc-btn">Read Document ↗</button>
    `;
    div.querySelector('.open-doc-btn').addEventListener('click', () => onOpen(doc));
    return div;
  },

  // 8. Workshop Card
  WorkshopCard(ws, onClick) {
    const div = document.createElement('div');
    div.className = `workshop-card ${ws.isNext ? 'featured' : ''}`;
    div.style.cursor = 'pointer';
    div.innerHTML = `
      <div class="workshop-date-badge">
        <div class="ws-month">${escapeHtml(ws.date.split(' ')[0])}</div>
        <div class="ws-day">${escapeHtml(ws.date.split(' ')[1] || '')}</div>
      </div>
      <div style="flex:1;">
        ${ws.isNext ? `<span class="workshop-next-badge">Next Scheduled Workshop</span>` : (ws.isPast ? `<span style="font-size:0.75rem; color:var(--text-muted); font-weight:700; text-transform:uppercase;">Past Session</span>` : '')}
        <h3 style="font-size:1.15rem; font-weight:700;">${escapeHtml(ws.topic)}</h3>
        <div style="font-size:0.88rem; color:var(--text-secondary); margin-top:0.3rem;">
          📍 Room: <strong>${escapeHtml(ws.room)}</strong> &nbsp;|&nbsp; 📊 Level: <strong>${escapeHtml(ws.level)}</strong>
        </div>
      </div>
      <button class="btn ${ws.isNext ? 'btn-primary' : 'btn-secondary'} btn-sm view-ws-btn">
        ${ws.isNext ? 'Join Session' : 'View Details'}
      </button>
    `;

    div.addEventListener('click', () => onClick(ws));
    return div;
  },

  // 9. AWS Production Architecture Diagram Component with Verified Links
  ArchitectureDiagram() {
    const div = document.createElement('div');
    div.className = 'arch-flow-diagram';
    div.innerHTML = `
      <h3 style="font-family:var(--font-heading); text-align:center; font-size:1.5rem; margin-bottom:0.5rem; color:var(--aws-orange);">
        AWS Production Architecture Pitch Visual
      </h3>
      <p style="text-align:center; color:var(--text-secondary); font-size:0.9rem; margin-bottom:2rem;">
        Click any service box to visit official AWS documentation resources.
      </p>
      <div class="arch-grid">
        <a href="https://aws.amazon.com" target="_blank" rel="noopener noreferrer" class="arch-card" style="text-decoration:none;">
          <div class="arch-icon">🌐</div>
          <div class="arch-service-title">Amazon CloudFront / S3 ↗</div>
          <div class="arch-local-standin">Local Prototype: Static Host</div>
          <div class="arch-service-desc">Delivers global SSL SPA frontend & assets</div>
        </a>
        <a href="https://builder.aws.com" target="_blank" rel="noopener noreferrer" class="arch-card" style="text-decoration:none;">
          <div class="arch-icon">⚡</div>
          <div class="arch-service-title">AWS Builder Center ↗</div>
          <div class="arch-local-standin">Local Prototype: Python HTTP</div>
          <div class="arch-service-desc">Official publishing hub for Student Builders</div>
        </a>
        <a href="https://docs.aws.amazon.com/bedrock/" target="_blank" rel="noopener noreferrer" class="arch-card" style="text-decoration:none;">
          <div class="arch-icon">🚀</div>
          <div class="arch-service-title">Amazon Bedrock Docs ↗</div>
          <div class="arch-local-standin">Local Prototype: RAG Engine</div>
          <div class="arch-service-desc">Managed API access to foundation models</div>
        </a>
        <a href="https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html" target="_blank" rel="noopener noreferrer" class="arch-card" style="text-decoration:none;">
          <div class="arch-icon">🔍</div>
          <div class="arch-service-title">Bedrock Knowledge Bases ↗</div>
          <div class="arch-local-standin">Local Prototype: TF-IDF Vector</div>
          <div class="arch-service-desc">Managed RAG retrieval & OpenSearch Serverless</div>
        </a>
      </div>
    `;
    return div;
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

function formatMarkdownText(text) {
  if (!text) return '';
  let formatted = escapeHtml(text);
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="ext-link">$1 ↗</a>');
  formatted = formatted.replace(/(?<!href=")(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="ext-link">$1 ↗</a>');
  formatted = formatted.replace(/\n/g, '<br>');
  return formatted;
}
