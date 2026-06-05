/* ================================================================
   TIGGER — Interaction Layer v3
   Auth: localStorage "tigger_session"
   Default: session active on first visit
================================================================ */

// ── AUTH ─────────────────────────────────────────────────────────
function getSession() {
  const s = localStorage.getItem('tigger_session');
  if (s === null) { localStorage.setItem('tigger_session','active'); return 'active'; }
  return s;
}

function renderAuthNav() {
  const container = document.getElementById('nav-auth');
  if (!container) return;
  if (getSession() === 'active') {
    container.innerHTML = `
      <button class="btn-nav-logout" onclick="handleLogout()">
        <i class="ph ph-sign-out"></i> SALIR
      </button>`;
  } else {
    container.innerHTML = `
      <a href="index.html" class="btn-nav-login">INICIAR SESIÓN</a>
      <a href="index.html" class="btn-nav-register">REGISTRARSE</a>`;
  }
}

function handleLogout() {
  localStorage.setItem('tigger_session','inactive');
  showToast('Sesión cerrada');
  setTimeout(() => window.location.href = 'index.html', 900);
}

// ── INIT ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  renderAuthNav();

  // Guard: redirect to login if no session on protected pages
  const publicPages = ['login.html','index.html'];
  const isPublic = publicPages.some(p => location.pathname.endsWith(p));
  if (!isPublic && getSession() !== 'active') {
    window.location.href = 'index.html';
    return;
  }

  // ── Navbar scroll ─────────────────────────────────────────────
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive:true });
    onScroll();
  }

  // ── Tab bar active state ──────────────────────────────────────
  const tabItems = document.querySelectorAll('.tab-item[data-tab], .nav-link[data-tab]');
  const currentTab = document.querySelector('.tab-item.active, .nav-link.active');
  // Already set via class in HTML; this ensures consistency

  // ── Card cursor glow ──────────────────────────────────────────
  document.querySelectorAll('.card-brand,.card-accent').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx',`${((e.clientX-r.left)/r.width)*100}%`);
      card.style.setProperty('--my',`${((e.clientY-r.top)/r.height)*100}%`);
    });
  });

  // ── Touch feedback on action buttons ─────────────────────────
  document.querySelectorAll('.action-btn,.vip-card,.menu-item,.currency-item').forEach(el => {
    el.addEventListener('touchstart', () => el.style.transform = 'scale(0.97)', { passive:true });
    el.addEventListener('touchend', () => el.style.transform = '', { passive:true });
  });

  // ── Radio label keyboard support ─────────────────────────────
  document.querySelectorAll('.radio-label').forEach(label => {
    label.setAttribute('tabindex','0');
    label.addEventListener('keydown', e => {
      if (e.key===' '||e.key==='Enter') {
        e.preventDefault();
        const input = label.querySelector('input[type="radio"]');
        if (input) { input.checked=true; input.dispatchEvent(new Event('change')); }
      }
    });
  });

  // ── OTP code input ────────────────────────────────────────────
  const codeInput = document.querySelector('.code-input');
  if (codeInput) {
    codeInput.addEventListener('input', e => {
      e.target.value = e.target.value.replace(/\D/g,'').slice(0,6);
    });
  }

  // ── Animate-in stagger ───────────────────────────────────────
  document.querySelectorAll('.animate-in').forEach((el,i) => {
    el.style.animationFillMode = 'both';
    el.style.animationDelay = `${i * 55}ms`;
  });

  // ── Modal: close on backdrop click + ESC ─────────────────────
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', e => {
      if (e.target === backdrop) backdrop.classList.remove('open');
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.open').forEach(m => m.classList.remove('open'));
    }
  });

  // ── Page transition: add class on navigation ─────────────────
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;
    a.addEventListener('click', e => {
      if (e.ctrlKey || e.metaKey || e.shiftKey) return;
      // native navigation; page-enter class on body handles the enter animation
    });
  });

  // Spin keyframe for loading buttons
  if (!document.getElementById('spin-style')) {
    const s = document.createElement('style');
    s.id = 'spin-style';
    s.textContent = '@keyframes spin { to { transform:rotate(360deg); } }';
    document.head.appendChild(s);
  }
});

// ── TOAST ────────────────────────────────────────────────────────
function showToast(message, duration=2800) {
  const toast = document.getElementById('toast');
  const msg   = document.getElementById('toast-msg');
  if (!toast) return;
  if (msg) msg.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), duration);
}

// ── COPY UTILS ────────────────────────────────────────────────────
function copyReferralLink() {
  const linkEl = document.getElementById('referral-link');
  const btn    = document.getElementById('copy-link-btn');
  if (!linkEl) return;
  const text = linkEl.textContent.trim();
  const original = btn ? btn.innerHTML : '';
  const onCopied = () => {
    showToast('Enlace copiado al portapapeles');
    if (btn) {
      btn.innerHTML = '<i class="ph ph-check"></i> COPIADO';
      btn.disabled = true;
      setTimeout(() => { btn.innerHTML=original; btn.disabled=false; }, 2000);
    }
  };
  navigator.clipboard
    ? navigator.clipboard.writeText(text).then(onCopied).catch(()=>fallbackCopy(text,onCopied))
    : fallbackCopy(text, onCopied);
}

function fallbackCopy(text, cb) {
  const ta = Object.assign(document.createElement('textarea'),
    { value:text, style:'position:fixed;opacity:0;' });
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  cb();
}

// ── AVATAR PREVIEW ────────────────────────────────────────────────
function previewAvatar(event) {
  const file = event.target.files[0];
  const preview = document.getElementById('avatar-preview');
  if (!file || !preview) return;
  const reader = new FileReader();
  reader.onload = e => {
    preview.innerHTML = `<img src="${e.target.result}" alt="Foto de perfil"
      style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`;
    preview.style.cssText = 'height:180px;overflow:hidden;';
  };
  reader.readAsDataURL(file);
}

// ── FORM SUBMISSION ───────────────────────────────────────────────
function handleSubmit(event, type) {
  event.preventDefault();
  const form = event.target;
  const btn  = form.querySelector('#submit-btn') || form.querySelector('[type="submit"]');
  if (!btn) return;
  const original = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="ph ph-circle-notch" style="animation:spin .7s linear infinite"></i> PROCESANDO…';
  setTimeout(() => {
    btn.innerHTML = original;
    btn.disabled = false;
    const messages = {
      deposit:  'Solicitud de depósito enviada',
      withdraw: 'Retiro confirmado correctamente',
      profile:  'Cuenta guardada y validada',
    };
    showToast(messages[type] || 'Operación completada');
  }, 1500);
}
