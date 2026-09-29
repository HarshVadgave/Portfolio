/* ═══════════════════════════════════════════════════════════════
   PORTFOLIO WINDOWS SYSTEM — desktop.js
   Self-contained IIFE. No framework, no build step.

   Architecture:
   ─ Single state object, persisted to localStorage['hv_desktop_v1']
   ─ setState() is the ONLY place that drives UI changes
   ─ Each subsystem (window, desktop, notepad, context menu …)
     has its own init() + render() pattern
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ───────────────────────────────────────────────────────────
     0. CONSTANTS & DEFAULT DATA
  ─────────────────────────────────────────────────────────── */
  const LS_KEY = 'hv_desktop_v1';
  const GRID_SIZE = 72;   // icon snap grid (px)
  const MAX_LABEL_LEN = 40;

  // Default playground code
  const DEFAULT_CODE = `<!-- Edit anything on the left and watch the right update live! -->
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  /* === Harsh's Code Editor — Edit me! === */
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #0C0C0E; color: #fff;
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    padding: 24px; min-height: 100vh;
    display: flex; flex-direction: column; gap: 20px;
  }
  h1 { color: #FFE600; font-size: 20px; border-bottom: 2px solid #FFE600; padding-bottom: 10px; }
  .card {
    background: #1F1F24; border: 2px solid #000;
    box-shadow: 4px 4px 0 #000; padding: 16px;
  }
  button {
    background: #C8F135; color: #000; border: 2px solid #000;
    box-shadow: 3px 3px 0 #000; padding: 8px 18px;
    font-family: inherit; font-weight: 700; font-size: 13px;
    cursor: pointer; text-transform: uppercase; margin-right: 8px;
  }
  button:hover { background: #FF007A; color: #fff; }
  input {
    background: #0C0C0E; border: 2px solid #555; color: #fff;
    font-family: inherit; padding: 8px 12px; width: 200px; font-size: 14px;
  }
  #greeting { color: #00F0FF; font-size: 18px; font-weight: 700; min-height: 28px; margin-top: 8px; }
  #color-swatch { width: 40px; height: 40px; border: 2px solid #000; background: #FFE600; display: inline-block; margin: 8px 0; vertical-align: middle; }
  .label { color: #A0A0A5; font-size: 12px; margin-bottom: 6px; }
</style>
</head>
<body>
<h1>You discovered it, welcome to Harsh's Code Editor \uD83C\uDF89</h1>

<!-- (a) Theme colour cycler -->
<div class="card">
  <p class="label">Theme accent:</p>
  <span id="color-swatch"></span>
  <button onclick="cycleTheme()">Change Theme Colour</button>
</div>

<!-- (b) Click counter -->
<div class="card">
  <button onclick="increment()">👆 Click me!</button>
  <p style="margin-top:10px;">Clicked: <strong id="count">0</strong> times</p>
</div>

<!-- (c) Name greeter -->
<div class="card">
  <input type="text" id="name-input" placeholder="Type your name..." oninput="greet()">
  <p id="greeting">Hello, stranger!</p>
</div>

<!-- (d) Dice roller -->
<div class="card">
  <button onclick="rollDice()">🎲 Roll a Dice</button>
  <p style="margin-top:10px; font-size: 36px;" id="dice">–</p>
</div>

<script>
  // (a) Theme colour cycler
  const accents = ['#FFE600', '#FF007A', '#C8F135', '#00F0FF', '#7000FF'];
  let themeIdx = 0;
  function cycleTheme() {
    themeIdx = (themeIdx + 1) % accents.length;
    document.getElementById('color-swatch').style.background = accents[themeIdx];
  }

  // (b) Click counter
  let count = 0;
  function increment() {
    count++;
    document.getElementById('count').textContent = count;
  }

  // (c) Live name greeter
  function greet() {
    const name = document.getElementById('name-input').value.trim();
    document.getElementById('greeting').textContent =
      name ? ('Hello, ' + name + '! 👋') : 'Hello, stranger!';
  }

  // (d) Dice roller
  function rollDice() {
    const faces = ['⚀','⚁','⚂','⚃','⚄','⚅'];
    const n = Math.floor(Math.random() * 6);
    document.getElementById('dice').textContent = faces[n] + ' (' + (n + 1) + ')';
  }
<\/script>
</body>
</html>`;

  // Default filesystem nodes
  function buildDefaultNodes() {
    return [
      {
        id: 'about', name: 'about.txt', type: 'file',
        content: "Hi, I'm Harsh Vadgave — Web Developer & Graphic Designer.\n\nBased wherever the Chai is good. ☕\n\nI build fast, clean, and detail-oriented web experiences\nthat are not just functional but genuinely satisfying to use.\n\n2+ years building for the web.\nCurrently available for freelance & full-time opportunities.",
        parentId: null, x: 8, y: 8, deleted: false, deletedAt: null, bundled: true
      },
      {
        id: 'skills', name: 'skills.txt', type: 'file',
        content: "=== SKILLS.TXT ===\n\nLanguages:\n  HTML5, CSS3, JavaScript (ES6+)\n\nTools & APIs:\n  Google Sheets API, WhatsApp API, Git / GitHub\n\nDesign:\n  Neo-Brutalism, Maximalist Design, Figma\n\nOther:\n  Responsive Web Design, SEO, Performance Optimisation",
        parentId: null, x: 8, y: 110, deleted: false, deletedAt: null, bundled: true
      },
      {
        id: 'projects', name: 'projects.txt', type: 'file',
        content: "=== 5 LIVE PROJECTS ===\n\n1. Demo Builders Website\n   harshvadgave.github.io/demobuilderwebsite/pages/\n   High-converting site for construction companies.\n\n2. CSSGen Studio\n   harshvadgave.github.io/cssgen/\n   Glassmorphism & CSS shadow generator.\n\n3. CypherBreach Game\n   harshvadgave.github.io/cypher-game/\n   Caesar cipher decryption puzzle.\n\n4-5. More projects at harshvadgave.fun",
        parentId: null, x: 8, y: 212, deleted: false, deletedAt: null, bundled: true
      },
      {
        id: 'contact', name: 'contact.txt', type: 'file',
        content: "=== CONTACT.TXT ===\n\nEmail:    harshvadgave169969@gmail.com\nWhatsApp: +91 7841811323\nGitHub:   github.com/HarshVadgave\nLinkedIn: linkedin.com/in/harsh-vadgave-79388b2a1/\nTwitter:  twitter.com/HarshVadgave\n\nStatus: AVAILABLE FOR FREELANCE & FULL-TIME",
        parentId: null, x: 80, y: 8, deleted: false, deletedAt: null, bundled: true
      },
      {
        id: 'chai', name: 'chai.txt', type: 'file',
        content: "Based wherever the Chai is good. ☕\n\nSeriously though — if you know a good tapri,\nI'm probably there right now.\n\nBuilding the web one cup at a time.\n\n— Harsh",
        parentId: null, x: 80, y: 110, deleted: false, deletedAt: null, bundled: true
      },
      {
        id: 'recycle', name: 'Recycle Bin', type: 'recycle',
        content: '', parentId: null, x: 80, y: 212, deleted: false, deletedAt: null, bundled: true
      }
    ];
  }

  const DEFAULT_STATE = {
    windowState: 'normal',   // 'normal' | 'maximized' | 'minimized' | 'closed'
    editorCode: DEFAULT_CODE,
    nodes: buildDefaultNodes()
  };

  /* ───────────────────────────────────────────────────────────
     1. PERSISTENCE
  ─────────────────────────────────────────────────────────── */
  let state = DEFAULT_STATE;

  function loadState() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      // Merge carefully: validate shape
      if (saved && typeof saved === 'object') {
        if (['normal','minimized','closed'].includes(saved.windowState)) {
          state.windowState = saved.windowState;
        }
        if (typeof saved.editorCode === 'string') {
          state.editorCode = saved.editorCode;
        }
        if (Array.isArray(saved.nodes) && saved.nodes.length > 0) {
          state.nodes = saved.nodes;
        }
      }
    } catch (e) {
      // localStorage unavailable or corrupt — use defaults silently
    }
  }

  function saveState() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch (e) { /* quota or unavailable — fail silently */ }
  }

  /* ───────────────────────────────────────────────────────────
     2. DOM REFERENCES
  ─────────────────────────────────────────────────────────── */
  // Resolved after DOMContentLoaded
  let winContainer, portfolioWindow, retroDesktop, overlay,
      btnClose, btnMax, btnMin,
      iconArea, taskbar, taskbarPortfolioBtn, clockEl,
      startBtn, startMenu,
      contextMenu,
      codeTextarea, lineNumbers, previewFrame, divider,
      editorPane, previewPane;

  /* ───────────────────────────────────────────────────────────
     3. STATE MACHINE — single source of truth
  ─────────────────────────────────────────────────────────── */
  // Maps state → which UI to show/hide
  function applyState(newState, animate) {
    const prev = state.windowState;
    state.windowState = newState;
    saveState();

    // Update container class (CSS drives visibility)
    winContainer.className = 'hw-state-' + newState;

    // Update ARIA on the overlay
    if (newState === 'maximized') {
      overlay.classList.add('hw-overlay-visible');
      overlay.removeAttribute('aria-hidden');
      document.body.style.overflow = 'hidden';
      // Focus first focusable element in overlay
      const focusable = overlay.querySelectorAll('button, textarea, [tabindex="0"]');
      if (focusable.length) focusable[0].focus();
    } else {
      overlay.classList.remove('hw-overlay-visible');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    // Animate window if in/out of normal
    if (animate) {
      portfolioWindow.classList.remove(
        'hw-anim-open', 'hw-anim-close', 'hw-anim-minimize', 'hw-anim-restore'
      );
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reduced) {
        void portfolioWindow.offsetWidth; // force reflow
        if (newState === 'normal' && (prev === 'closed' || prev === 'minimized')) {
          portfolioWindow.classList.add(prev === 'minimized' ? 'hw-anim-restore' : 'hw-anim-open');
        }
      }
    }

    // Update taskbar button highlight
    if (taskbarPortfolioBtn) {
      taskbarPortfolioBtn.classList.toggle('active', newState === 'minimized');
      // aria-pressed reflects active state
      taskbarPortfolioBtn.setAttribute('aria-pressed', newState === 'minimized' ? 'true' : 'false');
    }

    // Update yellow button aria-label (restore vs maximise)
    if (btnMax) {
      const isMaximized = (newState === 'maximized');
      btnMax.setAttribute('aria-label', isMaximized ? 'Restore' : 'Maximize');
      // Swap icon inside the button
      const iconEl = btnMax.querySelector('.hw-icon');
      if (iconEl) {
        iconEl.innerHTML = isMaximized ? ICONS.restore : ICONS.maximize;
      }
    }

    // Re-render desktop icons whenever desktop is shown
    if (newState === 'minimized' || newState === 'closed') {
      renderDesktopIcons();
    }
  }

  /* ───────────────────────────────────────────────────────────
     4. SVG ICONS for window buttons
  ─────────────────────────────────────────────────────────── */
  const ICONS = {
    close: `<svg viewBox="0 0 8 8" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round"><line x1="1" y1="1" x2="7" y2="7"/><line x1="7" y1="1" x2="1" y2="7"/></svg>`,
    maximize: `<svg viewBox="0 0 8 8" fill="none" stroke="#000" stroke-width="1.5"><rect x="1" y="1" width="6" height="6"/></svg>`,
    restore: `<svg viewBox="0 0 8 8" fill="none" stroke="#000" stroke-width="1.5"><rect x="2" y="1" width="5" height="5"/><polyline points="1,2 1,7 6,7"/></svg>`,
    minimize: `<svg viewBox="0 0 8 8" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round"><line x1="1" y1="7" x2="7" y2="7"/></svg>`
  };

  /* ───────────────────────────────────────────────────────────
     5. WINDOW TITLE BAR BUTTONS
  ─────────────────────────────────────────────────────────── */
  function initWindowButtons() {
    // RED — Close
    btnClose.addEventListener('click', () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reduced) {
        portfolioWindow.classList.add('hw-anim-close');
        portfolioWindow.addEventListener('animationend', () => {
          applyState('closed', false);
        }, { once: true });
      } else {
        applyState('closed', false);
      }
    });

    // YELLOW — Maximize / Restore
    btnMax.addEventListener('click', () => {
      if (state.windowState === 'maximized') {
        // Restore
        applyState('normal', false);
        // Return focus to yellow button
        btnMax.focus();
      } else {
        applyState('maximized', false);
      }
    });

    // GREEN — Minimize
    btnMin.addEventListener('click', () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reduced) {
        portfolioWindow.classList.add('hw-anim-minimize');
        portfolioWindow.addEventListener('animationend', () => {
          applyState('minimized', false);
        }, { once: true });
      } else {
        applyState('minimized', false);
      }
    });
  }

  /* ───────────────────────────────────────────────────────────
     6. CODE PLAYGROUND (Maximized overlay)
  ─────────────────────────────────────────────────────────── */
  let debounceTimer = null;

  function updatePreview() {
    // Save current code
    state.editorCode = codeTextarea.value;
    saveState();

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      // Update iframe using srcdoc (sandbox="allow-scripts" only — no allow-same-origin)
      previewFrame.srcdoc = codeTextarea.value;
    }, 250);
  }

  function syncLineNumbers() {
    const lines = codeTextarea.value.split('\n').length;
    let nums = '';
    for (let i = 1; i <= lines; i++) nums += i + '\n';
    lineNumbers.textContent = nums;
    // Sync scroll
    lineNumbers.scrollTop = codeTextarea.scrollTop;
  }

  function initPlayground() {
    // Load saved code
    codeTextarea.value = state.editorCode;
    syncLineNumbers();
    updatePreview();

    codeTextarea.addEventListener('input', () => {
      syncLineNumbers();
      updatePreview();
    });

    codeTextarea.addEventListener('scroll', () => {
      lineNumbers.scrollTop = codeTextarea.scrollTop;
    });

    // Tab key → insert 2 spaces (don't lose focus)
    codeTextarea.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = codeTextarea.selectionStart;
        const end   = codeTextarea.selectionEnd;
        const val   = codeTextarea.value;
        codeTextarea.value = val.slice(0, start) + '  ' + val.slice(end);
        codeTextarea.selectionStart = codeTextarea.selectionEnd = start + 2;
        syncLineNumbers();
        updatePreview();
      }
    });

    // Reset button
    const resetBtn = overlay.querySelector('#hw-reset-code');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        codeTextarea.value = DEFAULT_CODE;
        state.editorCode = DEFAULT_CODE;
        saveState();
        syncLineNumbers();
        updatePreview();
      });
    }

    // Restore button in overlay
    const restoreBtn = overlay.querySelector('#hw-overlay-restore');
    if (restoreBtn) {
      restoreBtn.addEventListener('click', () => {
        applyState('normal', false);
        btnMax.focus();
      });
    }

    // Esc key restores
    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        applyState('normal', false);
        btnMax.focus();
      }
      // Basic focus trap
      if (e.key === 'Tab') {
        const focusables = Array.from(
          overlay.querySelectorAll('button:not([disabled]), textarea, [tabindex="0"]')
        ).filter(el => !el.closest('[aria-hidden]'));
        if (!focusables.length) return;
        const first = focusables[0];
        const last  = focusables[focusables.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
        }
      }
    });

    // Draggable divider
    initDivider();
  }

  function initDivider() {
    let dragging = false;
    let startX, startEditorW;

    divider.addEventListener('pointerdown', (e) => {
      dragging = true;
      startX = e.clientX;
      startEditorW = editorPane.getBoundingClientRect().width;
      divider.classList.add('hw-dragging');
      divider.setPointerCapture(e.pointerId);
    });

    divider.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const container = divider.closest('.hw-split');
      const totalW = container.getBoundingClientRect().width;
      const newEditorW = Math.max(80, Math.min(totalW - 80 - 6, startEditorW + dx));
      editorPane.style.flex = 'none';
      editorPane.style.width = newEditorW + 'px';
      previewPane.style.flex = '1';
    });

    divider.addEventListener('pointerup', () => {
      dragging = false;
      divider.classList.remove('hw-dragging');
    });
  }

  /* ───────────────────────────────────────────────────────────
     7. DESKTOP ICONS
  ─────────────────────────────────────────────────────────── */
  // Node type → emoji icon
  function nodeIcon(node) {
    if (node.type === 'recycle') {
      const hasBin = state.nodes.some(n => n.deleted);
      return hasBin ? '🗑️' : '🗑️';
    }
    if (node.type === 'folder') return '📁';
    return '📄';
  }

  // Recycle bin: full vs empty — we just use a text indicator in the label
  function recycleBinLabel() {
    const full = state.nodes.some(n => n.deleted && n.type !== 'recycle');
    return full ? 'Recycle Bin\n(Full)' : 'Recycle Bin';
  }

  let selectedIconId = null;

  function renderDesktopIcons() {
    if (!iconArea) return;
    iconArea.innerHTML = '';

    // Desktop-level nodes only (parentId === null, not deleted, not the recycle bin handled separately)
    const desktopNodes = state.nodes.filter(n => n.parentId === null && !n.deleted);

    // Always render portfolio.js shortcut when window is closed
    const portfolioShortcut = {
      id: '__portfolio_shortcut__',
      name: 'portfolio.js',
      type: 'shortcut',
      x: 152, y: 8
    };

    const allIcons = [...desktopNodes];
    if (state.windowState === 'closed') allIcons.push(portfolioShortcut);

    allIcons.forEach(node => {
      const icon = document.createElement('div');
      icon.className = 'dt-icon';
      icon.dataset.id = node.id;
      icon.style.left = node.x + 'px';
      icon.style.top  = node.y + 'px';
      icon.setAttribute('tabindex', '0');
      icon.setAttribute('role', 'button');
      icon.setAttribute('aria-label', node.name + ', double-click to open');

      const imgEl = document.createElement('div');
      imgEl.className = 'dt-icon-img';

      if (node.type === 'recycle') {
        const full = state.nodes.some(n => n.deleted && n.id !== 'recycle');
        imgEl.textContent = full ? '🗑' : '🗑';
        // Full bin — add visual indicator
        if (full) imgEl.style.filter = 'sepia(1) saturate(3)';
      } else if (node.type === 'folder') {
        imgEl.textContent = '📁';
      } else if (node.type === 'shortcut') {
        imgEl.textContent = '📝';
      } else {
        imgEl.textContent = '📄';
      }

      const labelEl = document.createElement('div');
      labelEl.className = 'dt-icon-label';

      if (node.type === 'recycle') {
        const full = state.nodes.some(n => n.deleted && n.id !== 'recycle');
        labelEl.textContent = full ? 'Recycle Bin (Full)' : 'Recycle Bin';
      } else {
        labelEl.textContent = node.name;
      }

      icon.appendChild(imgEl);
      icon.appendChild(labelEl);
      iconArea.appendChild(icon);

      // ── Selection (single click / tap) ──
      let clickTimer = null;
      let lastClick = 0;

      icon.addEventListener('click', (e) => {
        e.stopPropagation();
        const now = Date.now();
        if (now - lastClick < 350) {
          // Double-click
          clearTimeout(clickTimer);
          lastClick = 0;
          openNode(node.id);
          return;
        }
        lastClick = now;
        clickTimer = setTimeout(() => {
          selectIcon(node.id);
        }, 350);
      });

      // Keyboard: Enter to open, context menu on right-click
      icon.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') openNode(node.id);
        if (e.key === 'Delete' && node.id !== 'recycle' && node.id !== '__portfolio_shortcut__') {
          deleteNode(node.id);
        }
      });

      // Long press for touch context menu
      let longPressTimer = null;
      icon.addEventListener('touchstart', (e) => {
        longPressTimer = setTimeout(() => {
          e.preventDefault();
          showContextMenu(e.touches[0].clientX, e.touches[0].clientY, node.id);
        }, 500);
      }, { passive: false });
      icon.addEventListener('touchend', () => clearTimeout(longPressTimer));
      icon.addEventListener('touchmove', () => clearTimeout(longPressTimer));

      // Right-click context menu
      icon.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = retroDesktop.getBoundingClientRect();
        showContextMenu(e.clientX - rect.left, e.clientY - rect.top, node.id);
      });

      // ── Drag ──
      makeDraggableIcon(icon, node);
    });

    // Click desktop bg to deselect
    iconArea.addEventListener('click', (e) => {
      if (e.target === iconArea) {
        selectIcon(null);
        closeContextMenu();
      }
    });
  }

  function selectIcon(id) {
    selectedIconId = id;
    iconArea.querySelectorAll('.dt-icon').forEach(el => {
      el.classList.toggle('selected', el.dataset.id === id);
    });
  }

  /* ───────────────────────────────────────────────────────────
     8. ICON DRAG (with grid snap + bounds constraint)
  ─────────────────────────────────────────────────────────── */
  function makeDraggableIcon(iconEl, node) {
    let dragging = false;
    let startX, startY, startLeft, startTop;

    iconEl.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseInt(iconEl.style.left, 10) || 0;
      startTop  = parseInt(iconEl.style.top, 10)  || 0;
      iconEl.style.zIndex = 50;
      iconEl.setPointerCapture(e.pointerId);
    });

    iconEl.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const areaRect = iconArea.getBoundingClientRect();
      const maxX = areaRect.width  - 64;
      const maxY = areaRect.height - 72;
      const newLeft = Math.max(0, Math.min(maxX, startLeft + dx));
      const newTop  = Math.max(0, Math.min(maxY, startTop  + dy));
      iconEl.style.left = newLeft + 'px';
      iconEl.style.top  = newTop  + 'px';
    });

    iconEl.addEventListener('pointerup', (e) => {
      if (!dragging) return;
      dragging = false;
      iconEl.style.zIndex = '';
      // Snap to grid
      let x = parseInt(iconEl.style.left, 10);
      let y = parseInt(iconEl.style.top, 10);
      x = Math.round(x / GRID_SIZE) * GRID_SIZE;
      y = Math.round(y / GRID_SIZE) * GRID_SIZE;
      iconEl.style.left = x + 'px';
      iconEl.style.top  = y + 'px';

      // Persist position
      if (node.id !== '__portfolio_shortcut__') {
        const n = state.nodes.find(n => n.id === node.id);
        if (n) { n.x = x; n.y = y; saveState(); }
      }
    });
  }

  /* ───────────────────────────────────────────────────────────
     9. OPEN NODE
  ─────────────────────────────────────────────────────────── */
  function openNode(id) {
    if (id === '__portfolio_shortcut__') {
      // Reopen window from closed state
      applyState('normal', true);
      return;
    }
    const node = state.nodes.find(n => n.id === id);
    if (!node) return;

    if (node.type === 'recycle') {
      openRecycleBin();
      return;
    }
    if (node.type === 'file') {
      openNotepad(node);
      return;
    }
    if (node.type === 'folder') {
      openFolderExplorer(node);
      return;
    }
  }

  /* ───────────────────────────────────────────────────────────
     10. NOTEPAD WINDOWS
  ─────────────────────────────────────────────────────────── */
  let notepadZBase = 100;
  const openNotepads = {}; // id → DOM element

  function openNotepad(node) {
    // If already open, bring to front
    if (openNotepads[node.id]) {
      bringToFront(openNotepads[node.id]);
      return;
    }

    const win = buildNotepadWindow(node.name, () => {
      // On close: check unsaved
      const ta = win.querySelector('.dt-notepad-textarea');
      const unsaved = ta && ta.value !== node.content;
      if (unsaved) {
        showDialog(retroDesktop,
          'Unsaved Changes',
          'Save changes to "' + node.name + '"?',
          ['Save', 'Discard', 'Cancel'],
          (choice) => {
            if (choice === 'Save')    { saveNotepadContent(node, ta.value); removeNotepad(win, node.id); }
            if (choice === 'Discard') { removeNotepad(win, node.id); }
            // Cancel: do nothing
          }
        );
      } else {
        removeNotepad(win, node.id);
      }
    });

    // Textarea with content
    const ta = win.querySelector('.dt-notepad-textarea');
    ta.value = node.content;

    // Unsaved indicator
    const badge = win.querySelector('.dt-unsaved-badge');
    ta.addEventListener('input', () => {
      const unsaved = ta.value !== node.content;
      badge.classList.toggle('visible', unsaved);
      const titleEl = win.querySelector('.dt-notepad-title');
      const baseName = node.name;
      titleEl.textContent = (unsaved ? '* ' : '') + baseName + ' - Notepad';
    });

    // Save shortcut Ctrl/Cmd + S
    ta.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveNotepadContent(node, ta.value);
        badge.classList.remove('visible');
        const titleEl = win.querySelector('.dt-notepad-title');
        titleEl.textContent = node.name + ' - Notepad';
      }
    });

    // Save toolbar button
    const saveBtn = win.querySelector('.dt-notepad-save-btn');
    saveBtn && saveBtn.addEventListener('click', () => {
      saveNotepadContent(node, ta.value);
      badge.classList.remove('visible');
      const titleEl = win.querySelector('.dt-notepad-title');
      titleEl.textContent = node.name + ' - Notepad';
    });

    positionWindow(win, 20 + Object.keys(openNotepads).length * 18,
                       20 + Object.keys(openNotepads).length * 18);
    makeNotepadDraggable(win);
    bringToFront(win);
    openNotepads[node.id] = win;
    iconArea.appendChild(win);
  }

  function saveNotepadContent(node, value) {
    node.content = value;
    saveState();
  }

  function removeNotepad(win, id) {
    win.remove();
    delete openNotepads[id];
  }

  function buildNotepadWindow(title, onClose) {
    const win = document.createElement('div');
    win.className = 'dt-notepad';

    win.innerHTML = `
      <div class="dt-notepad-titlebar">
        <span class="dt-notepad-title">${escHtml(title)} - Notepad</span>
        <button class="dt-notepad-close" aria-label="Close">&times;</button>
      </div>
      <div class="dt-notepad-toolbar">
        <button class="dt-notepad-toolbar-btn dt-notepad-save-btn" aria-label="Save">Save</button>
        <span class="dt-unsaved-badge" aria-live="polite"></span>
      </div>
      <textarea class="dt-notepad-textarea" spellcheck="false" aria-label="File content editor"></textarea>
    `;

    win.querySelector('.dt-notepad-close').addEventListener('click', onClose);
    win.addEventListener('pointerdown', () => bringToFront(win));
    return win;
  }

  function positionWindow(win, x, y) {
    const areaRect = iconArea.getBoundingClientRect();
    const clampX = Math.max(0, Math.min(x, areaRect.width  - 240));
    const clampY = Math.max(0, Math.min(y, areaRect.height - 150));
    win.style.left = clampX + 'px';
    win.style.top  = clampY + 'px';
    win.style.width  = '300px';
    win.style.height = '220px';
  }

  function bringToFront(win) {
    notepadZBase++;
    win.style.zIndex = notepadZBase;
    // Mark inactive all others
    iconArea.querySelectorAll('.dt-notepad').forEach(w => w.classList.add('inactive'));
    win.classList.remove('inactive');
  }

  function makeNotepadDraggable(win) {
    const titlebar = win.querySelector('.dt-notepad-titlebar');
    let dragging = false, ox, oy;

    titlebar.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) return;
      dragging = true;
      const rect = win.getBoundingClientRect();
      const areaRect = iconArea.getBoundingClientRect();
      ox = e.clientX - rect.left + areaRect.left;
      oy = e.clientY - rect.top  + areaRect.top;
      titlebar.setPointerCapture(e.pointerId);
      bringToFront(win);
    });

    titlebar.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const areaRect = iconArea.getBoundingClientRect();
      const winW = win.offsetWidth;
      const winH = win.offsetHeight;
      const areaH = areaRect.height;
      const areaW = areaRect.width;
      let nx = e.clientX - areaRect.left - (ox - areaRect.left);
      let ny = e.clientY - areaRect.top  - (oy - areaRect.top);
      nx = Math.max(0, Math.min(areaW - winW, nx));
      ny = Math.max(0, Math.min(areaH - winH, ny));
      win.style.left = nx + 'px';
      win.style.top  = ny + 'px';
    });

    titlebar.addEventListener('pointerup', () => { dragging = false; });

    // Make resizable via textarea min-height
    win.style.resize = 'both';
    win.style.overflow = 'auto';
  }

  /* ───────────────────────────────────────────────────────────
     11. RECYCLE BIN
  ─────────────────────────────────────────────────────────── */
  let recycleBinWin = null;

  function openRecycleBin() {
    if (recycleBinWin) { bringToFront(recycleBinWin); return; }

    const win = document.createElement('div');
    win.className = 'dt-notepad';

    win.innerHTML = `
      <div class="dt-notepad-titlebar" style="cursor:move;">
        <span class="dt-notepad-title">Recycle Bin</span>
        <button class="dt-notepad-close" aria-label="Close">&times;</button>
      </div>
      <div class="dt-notepad-toolbar">
        <button class="dt-notepad-toolbar-btn" id="rb-restore-sel">Restore Selected</button>
        <button class="dt-notepad-toolbar-btn" id="rb-restore-all">Restore All</button>
        <button class="dt-notepad-toolbar-btn" id="rb-delete-sel" style="color:#cc0000;">Delete Selected</button>
        <button class="dt-notepad-toolbar-btn" id="rb-empty" style="color:#cc0000;">Empty Bin</button>
      </div>
      <div class="dt-bin-list" role="listbox" aria-label="Deleted items" id="rb-list"></div>
    `;

    win.querySelector('.dt-notepad-close').addEventListener('click', () => {
      win.remove();
      recycleBinWin = null;
    });

    positionWindow(win, 40, 40);
    win.style.width  = '320px';
    win.style.height = '240px';
    makeNotepadDraggable(win);
    bringToFront(win);
    recycleBinWin = win;
    iconArea.appendChild(win);

    renderBinList(win);

    let selectedBinId = null;

    win.querySelector('#rb-restore-sel').addEventListener('click', () => {
      if (!selectedBinId) return;
      restoreFromBin(selectedBinId);
      selectedBinId = null;
      renderBinList(win);
      refreshBinIcon();
    });

    win.querySelector('#rb-restore-all').addEventListener('click', () => {
      state.nodes.filter(n => n.deleted && n.id !== 'recycle').forEach(n => {
        n.deleted = false; n.deletedAt = null;
      });
      saveState();
      renderBinList(win);
      refreshBinIcon();
      if (state.windowState === 'minimized' || state.windowState === 'closed') renderDesktopIcons();
    });

    win.querySelector('#rb-delete-sel').addEventListener('click', () => {
      if (!selectedBinId) return;
      showDialog(retroDesktop,
        'Delete Permanently',
        'Permanently delete this item? This cannot be undone.',
        ['Delete', 'Cancel'],
        (choice) => {
          if (choice === 'Delete') {
            state.nodes = state.nodes.filter(n => n.id !== selectedBinId);
            saveState();
            selectedBinId = null;
            renderBinList(win);
            refreshBinIcon();
          }
        }
      );
    });

    win.querySelector('#rb-empty').addEventListener('click', () => {
      showDialog(retroDesktop,
        'Empty Recycle Bin',
        'Permanently delete all items in the Recycle Bin? This cannot be undone.',
        ['Empty Bin', 'Cancel'],
        (choice) => {
          if (choice === 'Empty Bin') {
            state.nodes = state.nodes.filter(n => !n.deleted || n.id === 'recycle');
            saveState();
            renderBinList(win);
            refreshBinIcon();
          }
        }
      );
    });

    // Selection
    win.addEventListener('click', (e) => {
      const item = e.target.closest('.dt-bin-item');
      if (!item) return;
      selectedBinId = item.dataset.id;
      win.querySelectorAll('.dt-bin-item').forEach(el => el.classList.toggle('selected', el === item));
    });
  }

  function renderBinList(win) {
    const list = win.querySelector('#rb-list');
    if (!list) return;
    const deleted = state.nodes.filter(n => n.deleted && n.id !== 'recycle');
    if (!deleted.length) {
      list.innerHTML = '<div class="dt-bin-empty-msg">Recycle Bin is empty</div>';
      return;
    }
    list.innerHTML = '';
    deleted.forEach(n => {
      const item = document.createElement('div');
      item.className = 'dt-bin-item';
      item.dataset.id = n.id;
      const dateStr = n.deletedAt ? new Date(n.deletedAt).toLocaleDateString() : '?';
      item.innerHTML = `
        <span class="dt-bin-item-icon">${n.type === 'folder' ? '📁' : '📄'}</span>
        <span class="dt-bin-item-name">${escHtml(n.name)}</span>
        <span class="dt-bin-item-date">${escHtml(dateStr)}</span>
      `;
      list.appendChild(item);
    });
  }

  function restoreFromBin(id) {
    const n = state.nodes.find(n => n.id === id);
    if (!n) return;
    n.deleted = false;
    n.deletedAt = null;
    // Find free position
    n.x = findFreePosition(n.x, n.y).x;
    n.y = findFreePosition(n.x, n.y).y;
    saveState();
    if (state.windowState === 'minimized' || state.windowState === 'closed') renderDesktopIcons();
  }

  function findFreePosition(preferX, preferY) {
    const occupied = state.nodes
      .filter(n => !n.deleted && n.parentId === null)
      .map(n => ({ x: n.x, y: n.y }));
    let x = preferX, y = preferY;
    for (let tries = 0; tries < 50; tries++) {
      const clash = occupied.some(o => Math.abs(o.x - x) < GRID_SIZE && Math.abs(o.y - y) < GRID_SIZE);
      if (!clash) break;
      x += GRID_SIZE;
      if (x > 200) { x = 0; y += GRID_SIZE; }
    }
    return { x, y };
  }

  function refreshBinIcon() {
    renderDesktopIcons();
  }

  /* ───────────────────────────────────────────────────────────
     12. FOLDER EXPLORER
  ─────────────────────────────────────────────────────────── */
  function openFolderExplorer(folderNode) {
    const winId = 'folder_' + folderNode.id;
    if (openNotepads[winId]) { bringToFront(openNotepads[winId]); return; }

    const win = document.createElement('div');
    win.className = 'dt-notepad';

    win.innerHTML = `
      <div class="dt-notepad-titlebar" style="cursor:move;">
        <span class="dt-notepad-title">📁 ${escHtml(folderNode.name)}</span>
        <button class="dt-notepad-close" aria-label="Close">&times;</button>
      </div>
      <div class="dt-folder-list" id="folder-list-${escHtml(folderNode.id)}"></div>
    `;

    win.querySelector('.dt-notepad-close').addEventListener('click', () => {
      win.remove();
      delete openNotepads[winId];
    });

    renderFolderList(win, folderNode);
    positionWindow(win, 50, 50);
    win.style.width  = '280px';
    win.style.height = '200px';
    makeNotepadDraggable(win);
    bringToFront(win);
    openNotepads[winId] = win;
    iconArea.appendChild(win);
  }

  function renderFolderList(win, folderNode) {
    const list = win.querySelector('.dt-folder-list');
    if (!list) return;
    const children = state.nodes.filter(n => n.parentId === folderNode.id && !n.deleted);
    list.innerHTML = '';
    if (!children.length) {
      list.innerHTML = '<div style="font-family:VT323,monospace;font-size:15px;color:#808080;padding:8px">Empty folder</div>';
      return;
    }
    children.forEach(n => {
      const item = document.createElement('div');
      item.className = 'dt-folder-item';
      item.innerHTML = `${n.type === 'folder' ? '📁' : '📄'}<br>${escHtml(n.name)}`;
      item.addEventListener('dblclick', () => openNode(n.id));
      list.appendChild(item);
    });
  }

  /* ───────────────────────────────────────────────────────────
     13. DELETE NODE
  ─────────────────────────────────────────────────────────── */
  function deleteNode(id) {
    const node = state.nodes.find(n => n.id === id);
    if (!node) return;
    if (node.bundled) {
      showDialog(retroDesktop,
        'System File',
        'This file is part of the system and cannot be deleted.',
        ['OK'],
        () => {}
      );
      return;
    }
    // Move to recycle bin (soft delete)
    node.deleted = true;
    node.deletedAt = Date.now();
    saveState();
    renderDesktopIcons();
  }

  /* ───────────────────────────────────────────────────────────
     14. RENAME NODE (inline)
  ─────────────────────────────────────────────────────────── */
  function startRename(id) {
    const node = state.nodes.find(n => n.id === id);
    if (!node) return;
    const iconEl = iconArea.querySelector(`.dt-icon[data-id="${CSS.escape(id)}"]`);
    if (!iconEl) return;
    const labelEl = iconEl.querySelector('.dt-icon-label');
    const input = document.createElement('input');
    input.className = 'dt-icon-rename-input';
    input.value = node.name;
    input.maxLength = MAX_LABEL_LEN;
    labelEl.replaceWith(input);
    input.focus();
    input.select();

    function confirmRename() {
      const raw = input.value.trim();
      const sanitized = sanitizeFilename(raw) || node.name;
      node.name = deduplicateName(sanitized, id);
      saveState();
      renderDesktopIcons();
    }

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') confirmRename();
      if (e.key === 'Escape') renderDesktopIcons();
    });
    input.addEventListener('blur', confirmRename);
  }

  function sanitizeFilename(name) {
    // Strip path chars and control chars, cap length
    return name.replace(/[/\\:*?"<>|\x00-\x1f]/g, '').trim().slice(0, MAX_LABEL_LEN);
  }

  function deduplicateName(name, excludeId) {
    const siblings = state.nodes.filter(n => n.id !== excludeId && !n.deleted && n.parentId === null);
    const names = new Set(siblings.map(n => n.name));
    if (!names.has(name)) return name;
    let i = 2;
    const base = name.replace(/\s*\(\d+\)$/, '');
    while (names.has(base + ' (' + i + ')')) i++;
    return base + ' (' + i + ')';
  }

  /* ───────────────────────────────────────────────────────────
     15. CONTEXT MENU
  ─────────────────────────────────────────────────────────── */
  function showContextMenu(x, y, targetId) {
    closeContextMenu();

    // Build menu items based on context
    if (targetId) {
      // Icon context menu
      const node = state.nodes.find(n => n.id === targetId) ||
                   (targetId === '__portfolio_shortcut__' ? { id: '__portfolio_shortcut__', name: 'portfolio.js', bundled: true } : null);
      if (!node) return;

      contextMenu.innerHTML = '';
      contextMenu.setAttribute('role', 'menu');

      const items = [
        { label: 'Open', action: () => openNode(targetId) },
        { label: 'Rename', action: () => startRename(targetId),
          disabled: node.bundled || targetId === '__portfolio_shortcut__' },
        { label: 'Delete', action: () => deleteNode(targetId),
          disabled: targetId === 'recycle' || targetId === '__portfolio_shortcut__' }
      ];

      items.forEach(item => {
        const el = createMenuItem(item.label, item.action, item.disabled);
        contextMenu.appendChild(el);
      });

    } else {
      // Desktop background context menu
      contextMenu.innerHTML = '';
      contextMenu.setAttribute('role', 'menu');

      // "New ▸" with submenu
      const newItem = document.createElement('div');
      newItem.className = 'hw-ctx-item';
      newItem.setAttribute('role', 'menuitem');
      newItem.setAttribute('aria-haspopup', 'true');
      newItem.setAttribute('tabindex', '0');
      newItem.innerHTML = `New <span class="hw-ctx-arrow">▶</span>
        <div class="hw-ctx-submenu" role="menu">
          <div class="hw-ctx-submenu-item" role="menuitem" tabindex="0" data-action="new-txt">Text Document (.txt)</div>
          <div class="hw-ctx-submenu-item" role="menuitem" tabindex="0" data-action="new-folder">Folder</div>
        </div>`;
      newItem.querySelector('[data-action="new-txt"]').addEventListener('click', () => {
        closeContextMenu();
        createNewFile(x, y);
      });
      newItem.querySelector('[data-action="new-folder"]').addEventListener('click', () => {
        closeContextMenu();
        createNewFolder(x, y);
      });
      contextMenu.appendChild(newItem);

      contextMenu.appendChild(createSeparator());
      contextMenu.appendChild(createMenuItem('Refresh', () => { renderDesktopIcons(); closeContextMenu(); }));
      contextMenu.appendChild(createMenuItem('Restore default files', () => {
        state.nodes = buildDefaultNodes();
        saveState();
        renderDesktopIcons();
        closeContextMenu();
      }));
    }

    // Position within desktop bounds
    const areaRect = iconArea.getBoundingClientRect();
    const menuW = 170;
    const menuH = contextMenu.querySelectorAll('.hw-ctx-item').length * 26 + 10;
    const maxX  = iconArea.offsetWidth  - menuW;
    const maxY  = iconArea.offsetHeight - menuH;
    contextMenu.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
    contextMenu.style.top  = Math.max(0, Math.min(y, maxY)) + 'px';
    contextMenu.classList.add('open');

    // Close on outside click, Esc, scroll, resize
    requestAnimationFrame(() => {
      document.addEventListener('click', closeContextMenu, { once: true });
      document.addEventListener('keydown', onCtxKeydown);
      window.addEventListener('scroll', closeContextMenu, { once: true });
      window.addEventListener('resize', closeContextMenu, { once: true });
    });
  }

  function createMenuItem(label, action, disabled) {
    const el = document.createElement('div');
    el.className = 'hw-ctx-item' + (disabled ? ' disabled' : '');
    el.setAttribute('role', 'menuitem');
    el.setAttribute('tabindex', disabled ? '-1' : '0');
    el.textContent = label;
    if (!disabled) {
      el.addEventListener('click', (e) => { e.stopPropagation(); closeContextMenu(); action(); });
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter') { closeContextMenu(); action(); } });
    }
    return el;
  }

  function createSeparator() {
    const sep = document.createElement('div');
    sep.className = 'hw-ctx-sep';
    sep.setAttribute('role', 'separator');
    return sep;
  }

  function closeContextMenu() {
    contextMenu.classList.remove('open');
    document.removeEventListener('click', closeContextMenu);
    document.removeEventListener('keydown', onCtxKeydown);
  }

  function onCtxKeydown(e) {
    if (e.key === 'Escape') closeContextMenu();
    if (e.key === 'ArrowDown') {
      const items = Array.from(contextMenu.querySelectorAll('.hw-ctx-item:not(.disabled)'));
      const idx = items.indexOf(document.activeElement);
      if (idx < items.length - 1) items[idx + 1].focus();
    }
    if (e.key === 'ArrowUp') {
      const items = Array.from(contextMenu.querySelectorAll('.hw-ctx-item:not(.disabled)'));
      const idx = items.indexOf(document.activeElement);
      if (idx > 0) items[idx - 1].focus();
    }
  }

  /* ───────────────────────────────────────────────────────────
     16. CREATE NEW FILE / FOLDER
  ─────────────────────────────────────────────────────────── */
  function generateId() {
    return 'node_' + Date.now() + '_' + Math.floor(Math.random() * 9999);
  }

  function createNewFile(x, y) {
    const name = deduplicateName('New Text Document.txt', null);
    const node = {
      id: generateId(), name, type: 'file', content: '',
      parentId: null,
      x: snapToGrid(x), y: snapToGrid(y),
      deleted: false, deletedAt: null, bundled: false
    };
    state.nodes.push(node);
    saveState();
    renderDesktopIcons();
    // Start rename immediately
    setTimeout(() => startRename(node.id), 50);
  }

  function createNewFolder(x, y) {
    const name = deduplicateName('New Folder', null);
    const node = {
      id: generateId(), name, type: 'folder', content: '',
      parentId: null,
      x: snapToGrid(x), y: snapToGrid(y),
      deleted: false, deletedAt: null, bundled: false
    };
    state.nodes.push(node);
    saveState();
    renderDesktopIcons();
    setTimeout(() => startRename(node.id), 50);
  }

  function snapToGrid(v) { return Math.round(v / GRID_SIZE) * GRID_SIZE; }

  /* ───────────────────────────────────────────────────────────
     17. TASKBAR
  ─────────────────────────────────────────────────────────── */
  function initTaskbar() {
    // Clock
    function updateClock() {
      if (!clockEl) return;
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      const s = now.getSeconds().toString().padStart(2, '0');
      clockEl.textContent = h + ':' + m + ':' + s;
    }
    updateClock();
    setInterval(updateClock, 1000);

    // Taskbar portfolio.js button → restore window
    if (taskbarPortfolioBtn) {
      taskbarPortfolioBtn.addEventListener('click', () => {
        if (state.windowState === 'minimized') {
          applyState('normal', true);
        } else if (state.windowState === 'closed' || state.windowState === 'normal') {
          // toggle minimize/restore
          if (state.windowState === 'normal') {
            applyState('minimized', false);
          } else {
            applyState('normal', true);
          }
        }
      });
    }

    // Start button — toggle a simple menu
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        startMenu && startMenu.classList.toggle('open');
      });
    }

    // Close start menu on outside click
    document.addEventListener('click', (e) => {
      if (startMenu && !startBtn.contains(e.target)) {
        startMenu.classList.remove('open');
      }
    });
  }

  /* ───────────────────────────────────────────────────────────
     18. DESKTOP RIGHT-CLICK
  ─────────────────────────────────────────────────────────── */
  function initDesktopContextMenu() {
    retroDesktop.addEventListener('contextmenu', (e) => {
      // Only on the desktop background / icon area (not on windows/taskbar)
      if (e.target.closest('.dt-notepad') || e.target.closest('#dt-taskbar')) return;
      e.preventDefault();
      const rect = retroDesktop.getBoundingClientRect();
      showContextMenu(e.clientX - rect.left, e.clientY - rect.top, null);
    });

    // Long press on touch desktop
    let desktopLPTimer = null;
    retroDesktop.addEventListener('touchstart', (e) => {
      if (e.target.closest('.dt-notepad') || e.target.closest('#dt-taskbar') || e.target.closest('.dt-icon')) return;
      desktopLPTimer = setTimeout(() => {
        e.preventDefault();
        const rect = retroDesktop.getBoundingClientRect();
        showContextMenu(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top, null);
      }, 500);
    }, { passive: false });
    retroDesktop.addEventListener('touchend',  () => clearTimeout(desktopLPTimer));
    retroDesktop.addEventListener('touchmove', () => clearTimeout(desktopLPTimer));
  }

  /* ───────────────────────────────────────────────────────────
     19. WIN95 DIALOG
  ─────────────────────────────────────────────────────────── */
  function showDialog(container, title, message, buttons, callback) {
    const overlay = document.createElement('div');
    overlay.className = 'dt-dialog-overlay';

    const btnsHtml = buttons.map(b =>
      `<button class="dt-dialog-btn">${escHtml(b)}</button>`
    ).join('');

    overlay.innerHTML = `
      <div class="dt-dialog" role="dialog" aria-modal="true" aria-label="${escHtml(title)}">
        <div class="dt-dialog-titlebar">${escHtml(title)}</div>
        <div class="dt-dialog-body">${escHtml(message)}</div>
        <div class="dt-dialog-btns">${btnsHtml}</div>
      </div>
    `;

    const btnEls = overlay.querySelectorAll('.dt-dialog-btn');
    btnEls.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        overlay.remove();
        callback(buttons[i]);
      });
    });

    // Focus first button
    requestAnimationFrame(() => btnEls[0] && btnEls[0].focus());

    // Esc closes (triggers last button — typically Cancel/OK)
    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        overlay.remove();
        callback(buttons[buttons.length - 1]);
      }
    });

    container.appendChild(overlay);
  }

  /* ───────────────────────────────────────────────────────────
     20. UTILITY
  ─────────────────────────────────────────────────────────── */
  function escHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ───────────────────────────────────────────────────────────
     21. BUILD DOM — hero card replacement
     Called once at init. Injects the full widget markup.
  ─────────────────────────────────────────────────────────── */
  function buildDOM() {
    const heroVisual = document.querySelector('.hero-visual');
    if (!heroVisual) return false;

    // Remove old card and badge (we'll re-add badge inside win-container)
    const oldWindow = heroVisual.querySelector('.code-window');
    const oldBadge  = heroVisual.querySelector('.hero-badge');
    if (oldWindow) oldWindow.remove();
    if (oldBadge)  oldBadge.remove();

    heroVisual.innerHTML = `
      <!-- Win-container: state machine drives visibility -->
      <div id="win-container" class="hw-state-normal">

        <!-- ── PORTFOLIO WINDOW (Normal state) ──────────── -->
        <div id="portfolio-window">
          <!-- Title bar with real button elements -->
          <div class="hw-title-bar">
            <div class="hw-dots">
              <button class="hw-btn hw-btn-red"    id="hw-btn-close" aria-label="Close"    title="Close">
                <span class="hw-icon" aria-hidden="true">${ICONS.close}</span>
              </button>
              <button class="hw-btn hw-btn-yellow" id="hw-btn-max"   aria-label="Maximize" title="Maximize">
                <span class="hw-icon" aria-hidden="true">${ICONS.maximize}</span>
              </button>
              <button class="hw-btn hw-btn-green"  id="hw-btn-min"   aria-label="Minimize" title="Minimize">
                <span class="hw-icon" aria-hidden="true">${ICONS.minimize}</span>
              </button>
            </div>
            <span class="hw-file-name hw-title-bar">portfolio.js</span>
          </div>

          <!-- Code snippet body (same visual as before) -->
          <div class="hw-code-body">
            <div class="hw-code-line"><span class="hw-ln">1</span><span class="code-txt"><span class="cm">// who i am</span></span></div>
            <div class="hw-code-line"><span class="hw-ln">2</span><span class="code-txt"><span class="kw">const </span><span class="fn">developer</span><span class="tx"> = {</span></span></div>
            <div class="hw-code-line"><span class="hw-ln">3</span><span class="code-txt"><span class="tx">&nbsp;&nbsp;name: </span><span class="str">"Harsh Vadgave"</span><span class="tx">,</span></span></div>
            <div class="hw-code-line"><span class="hw-ln">4</span><span class="code-txt"><span class="tx">&nbsp;&nbsp;role: </span><span class="str">"Web Developer"</span><span class="tx">,</span></span></div>
            <div class="hw-code-line"><span class="hw-ln">5</span><span class="code-txt"><span class="tx">&nbsp;&nbsp;loves: [</span><span class="str">"clean code"</span><span class="tx">, </span><span class="str">"fast UX"</span><span class="tx">, </span><span class="str">"chai☕"</span><span class="tx">],</span></span></div>
            <div class="hw-code-line"><span class="hw-ln">6</span><span class="code-txt"><span class="tx">&nbsp;&nbsp;available: </span><span class="acc">true</span><span class="tx">,</span></span></div>
            <div class="hw-code-line"><span class="hw-ln">7</span><span class="code-txt"><span class="tx">};</span></span></div>
            <div class="hw-code-line"><span class="hw-ln">8</span><span class="code-txt"></span></div>
            <div class="hw-code-line"><span class="hw-ln">9</span><span class="code-txt"><span class="cm">// what i do</span></span></div>
            <div class="hw-code-line"><span class="hw-ln">10</span><span class="code-txt"><span class="kw">function </span><span class="fn">build</span><span class="tx">(</span><span class="pm">idea</span><span class="tx">) {</span></span></div>
            <div class="hw-code-line"><span class="hw-ln">11</span><span class="code-txt"><span class="tx">&nbsp;&nbsp;</span><span class="kw">return </span><span class="fn">ship</span><span class="tx">(</span></span></div>
            <div class="hw-code-line"><span class="hw-ln">12</span><span class="code-txt"><span class="tx">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="fn">design</span><span class="tx">(</span><span class="fn">code</span><span class="tx">(</span><span class="pm">idea</span><span class="tx">))</span></span></div>
            <div class="hw-code-line"><span class="hw-ln">13</span><span class="code-txt"><span class="tx">&nbsp;&nbsp;);</span></span></div>
            <div class="hw-code-line"><span class="hw-ln">14</span><span class="code-txt"><span class="tx">}</span></span></div>
            <div class="hw-code-line"><span class="hw-ln">15</span><span class="code-txt"></span></div>
            <div class="hw-code-line"><span class="hw-ln">16</span><span class="code-txt"><span class="fn">build</span><span class="tx">(</span><span class="str">"your next project"</span><span class="tx">); </span><span class="acc">▌</span></span></div>
          </div>
        </div>

        <!-- ── RETRO WIN95 DESKTOP ────────────────────── -->
        <div id="retro-desktop" aria-label="Retro desktop" role="region">
          <div id="dt-icon-area" aria-label="Desktop icons"></div>

          <!-- Context menu (appended to retro-desktop) -->
          <div id="hw-context-menu" role="menu" aria-label="Desktop context menu"></div>

          <!-- Taskbar -->
          <div id="dt-taskbar" role="toolbar" aria-label="Taskbar">
            <button id="dt-start-btn" aria-label="Start menu" aria-haspopup="true">
              <span>🪟</span> Start
            </button>
            <div id="dt-start-menu" role="menu" aria-label="Start menu">
              <div class="dt-start-menu-item" role="menuitem" tabindex="0">📄 portfolio.js</div>
              <div class="dt-start-menu-item" role="menuitem" tabindex="0">⚙️ System</div>
              <div class="dt-start-menu-item" role="menuitem" tabindex="0">❌ Shut Down</div>
            </div>
            <div class="dt-taskbar-sep"></div>
            <button class="dt-taskbar-btn" id="dt-taskbar-portfolio" aria-label="portfolio.js" aria-pressed="false">
              📝 portfolio.js
            </button>
            <div id="dt-clock" aria-live="off" aria-label="System clock">00:00:00</div>
          </div>
        </div>

        <!-- Badge (shown in Normal + Maximized, hidden otherwise via CSS) -->
        <div class="hero-badge">
          <div class="badge-icon">⚡</div>
          <div class="badge-text">
            <strong>5 Projects</strong>
            <span>are live &amp; active</span>
          </div>
        </div>

      </div><!-- #win-container -->
    `;

    // Build the maximized overlay (fixed, outside the hero)
    const overlayEl = document.createElement('div');
    overlayEl.id = 'hw-maximized-overlay';
    overlayEl.setAttribute('role', 'dialog');
    overlayEl.setAttribute('aria-modal', 'true');
    overlayEl.setAttribute('aria-label', 'Code Playground');
    overlayEl.setAttribute('aria-hidden', 'true');
    overlayEl.innerHTML = `
      <!-- Overlay title bar -->
      <div class="hw-overlay-titlebar">
        <div class="hw-dots">
          <button class="hw-btn hw-btn-red"    id="hw-overlay-close" aria-label="Close"   title="Close">
            <span class="hw-icon" aria-hidden="true">${ICONS.close}</span>
          </button>
          <button class="hw-btn hw-btn-yellow" id="hw-overlay-restore" aria-label="Restore" title="Restore">
            <span class="hw-icon" aria-hidden="true">${ICONS.restore}</span>
          </button>
          <button class="hw-btn hw-btn-green"  id="hw-overlay-min" aria-label="Minimize" title="Minimize">
            <span class="hw-icon" aria-hidden="true">${ICONS.minimize}</span>
          </button>
        </div>
        <span class="hw-overlay-title">portfolio.js — Code Playground (Maximized)</span>
        <div class="hw-overlay-actions">
          <button class="hw-reset-btn" id="hw-reset-code" aria-label="Reset code to default">Reset code</button>
        </div>
      </div>

      <!-- Split editor / preview -->
      <div class="hw-split">
        <div class="hw-editor-pane" id="hw-editor-pane">
          <div class="hw-editor-header">editor — HTML / CSS / JS</div>
          <div class="hw-editor-inner">
            <div class="hw-line-numbers" id="hw-line-numbers" aria-hidden="true">1</div>
            <textarea class="hw-code-textarea" id="hw-code-textarea"
              spellcheck="false"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              aria-label="Code editor"
              aria-multiline="true"
            ></textarea>
          </div>
        </div>

        <div class="hw-divider" id="hw-divider" title="Drag to resize" tabindex="0" role="separator" aria-label="Resize divider"></div>

        <div class="hw-preview-pane" id="hw-preview-pane">
          <div class="hw-preview-header">live preview</div>
          <iframe class="hw-preview-frame" id="hw-preview-frame"
            sandbox="allow-scripts"
            title="Live code preview"
            aria-label="Live preview iframe"
          ></iframe>
        </div>
      </div>
    `;
    document.body.appendChild(overlayEl);

    // Overlay close button (same as red in overlay)
    overlayEl.querySelector('#hw-overlay-close').addEventListener('click', () => {
      applyState('normal', false);
      btnMax.focus();
    });
    overlayEl.querySelector('#hw-overlay-min').addEventListener('click', () => {
      applyState('minimized', false);
    });

    return true;
  }

  /* ───────────────────────────────────────────────────────────
     22. MAIN INIT
  ─────────────────────────────────────────────────────────── */
  function init() {
    loadState();

    const built = buildDOM();
    if (!built) return; // hero-visual not found (shouldn't happen)

    // Resolve DOM refs
    winContainer         = document.getElementById('win-container');
    portfolioWindow      = document.getElementById('portfolio-window');
    retroDesktop         = document.getElementById('retro-desktop');
    overlay              = document.getElementById('hw-maximized-overlay');
    btnClose             = document.getElementById('hw-btn-close');
    btnMax               = document.getElementById('hw-btn-max');
    btnMin               = document.getElementById('hw-btn-min');
    iconArea             = document.getElementById('dt-icon-area');
    clockEl              = document.getElementById('dt-clock');
    taskbarPortfolioBtn  = document.getElementById('dt-taskbar-portfolio');
    startBtn             = document.getElementById('dt-start-btn');
    startMenu            = document.getElementById('dt-start-menu');
    contextMenu          = document.getElementById('hw-context-menu');
    codeTextarea         = document.getElementById('hw-code-textarea');
    lineNumbers          = document.getElementById('hw-line-numbers');
    previewFrame         = document.getElementById('hw-preview-frame');
    divider              = document.getElementById('hw-divider');
    editorPane           = document.getElementById('hw-editor-pane');
    previewPane          = document.getElementById('hw-preview-pane');

    // Init subsystems
    initWindowButtons();
    initPlayground();
    initTaskbar();
    initDesktopContextMenu();

    // Apply saved state (never restore 'maximized' on reload; treat as normal)
    const safeInitState = (state.windowState === 'maximized') ? 'normal' : state.windowState;
    applyState(safeInitState, false);

    // Ensure overlay is hidden on init
    overlay.classList.remove('hw-overlay-visible');

    console.log('[desktop.js] Windows portfolio system initialised. State:', state.windowState);
  }

  /* Boot after DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
