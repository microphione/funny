// ============================================================
// GAME UI - Core panel management, overlays, confirm
// ============================================================

const GameUI = {
    // ========== PANEL TOGGLE (minimize/expand) ==========
    togglePanel(panelId) {
        const panel = document.getElementById(panelId);
        if (!panel) return;
        const content = panel.querySelector('.panel-content');
        const btn = panel.querySelector('.panel-minimize');
        if (!content) return;
        if (content.style.display === 'none') {
            content.style.display = '';
            if (btn) btn.textContent = '[-]';
        } else {
            content.style.display = 'none';
            if (btn) btn.textContent = '[+]';
        }
    },

    // ========== PANEL CLOSE / REOPEN ==========
    closedPanels: new Set(),

    closePanel(panelId) {
        const panel = document.getElementById(panelId);
        if (!panel) return;
        panel.classList.add('panel-closed');
        this.closedPanels.add(panelId);
    },

    reopenPanel(panelId) {
        const panel = document.getElementById(panelId);
        if (!panel) return;
        panel.classList.remove('panel-closed');
        this.closedPanels.delete(panelId);
    },

    reopenAllPanels() {
        this.closedPanels.forEach(id => this.reopenPanel(id));
        this.closedPanels.clear();
    },

    initDraggablePanels() {
        // Panels are no longer draggable - they stay in the side panel
    },

    // ========== OVERLAY HELPERS ==========
    hideAllOverlays() {
        document.querySelectorAll('.overlay').forEach(o => o.classList.remove('active'));
        const deathEl = document.getElementById('death-overlay');
        if (deathEl) deathEl.classList.remove('active');
        const classEl = document.getElementById('class-select');
        if (classEl) classEl.style.display = 'none';
    },

    showOverlay(id) {
        this.hideAllOverlays();
        const el = document.getElementById(id);
        if (el) el.classList.add('active');
        Game.activeOverlay = id;
    },

    // ========== CONFIRMATION POPUP ==========
    confirmAction(message, onConfirm) {
        const existing = document.getElementById('confirm-popup');
        if (existing) existing.remove();

        const popup = document.createElement('div');
        popup.id = 'confirm-popup';
        popup.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1a1a2e;border:2px solid #f1c40f;padding:16px 20px;z-index:10000;font-family:"Press Start 2P";text-align:center;min-width:200px;box-shadow:0 0 20px rgba(0,0,0,0.8)';

        const msg = document.createElement('div');
        msg.style.cssText = 'color:#ddd;font-size:8px;margin-bottom:14px;line-height:1.6';
        msg.textContent = message;
        popup.appendChild(msg);

        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex;gap:10px;justify-content:center';

        const yesBtn = document.createElement('button');
        yesBtn.textContent = 'Tak';
        yesBtn.style.cssText = 'font-family:"Press Start 2P";font-size:8px;padding:6px 16px;background:#2ecc71;color:#000;border:none;cursor:pointer';
        yesBtn.onclick = () => { popup.remove(); onConfirm(); };

        const noBtn = document.createElement('button');
        noBtn.textContent = 'Nie';
        noBtn.style.cssText = 'font-family:"Press Start 2P";font-size:8px;padding:6px 16px;background:#e74c3c;color:#fff;border:none;cursor:pointer';
        noBtn.onclick = () => popup.remove();

        btnRow.appendChild(yesBtn);
        btnRow.appendChild(noBtn);
        popup.appendChild(btnRow);
        document.body.appendChild(popup);
    },
};
