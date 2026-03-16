// ============================================================
// GAME UI - Core panel management, dragging, overlays, confirm
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

    // ========== DRAGGABLE PANELS ==========
    dragState: null,

    initDraggablePanels() {
        const panels = document.querySelectorAll('#side-panel .panel-box');
        panels.forEach(panel => {
            const title = panel.querySelector('.panel-title');
            if (!title) return;
            title.addEventListener('mousedown', (e) => {
                // Ignore clicks on minimize/close buttons
                if (e.target.classList.contains('panel-minimize') || e.target.classList.contains('panel-close')) return;
                e.preventDefault();
                const rect = panel.getBoundingClientRect();
                this.dragState = {
                    panel,
                    startX: e.clientX,
                    startY: e.clientY,
                    origLeft: rect.left,
                    origTop: rect.top,
                    origWidth: rect.width,
                    isDragging: false,
                    origParent: panel.parentNode,
                    origNext: panel.nextSibling,
                };
            });
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.dragState) return;
            const ds = this.dragState;
            const dx = e.clientX - ds.startX;
            const dy = e.clientY - ds.startY;

            // Start drag after 5px threshold
            if (!ds.isDragging && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
                ds.isDragging = true;
                ds.panel.classList.add('dragging');
                ds.panel.style.left = ds.origLeft + 'px';
                ds.panel.style.top = ds.origTop + 'px';
                ds.panel.style.width = ds.origWidth + 'px';
                document.body.appendChild(ds.panel);
            }

            if (ds.isDragging) {
                ds.panel.style.left = (ds.origLeft + dx) + 'px';
                ds.panel.style.top = (ds.origTop + dy) + 'px';
            }
        });

        document.addEventListener('mouseup', () => {
            if (!this.dragState) return;
            const ds = this.dragState;
            if (ds.isDragging) {
                ds.panel.classList.remove('dragging');
                // Check if dropped back near side panel
                const sidePanel = document.getElementById('side-panel');
                const spRect = sidePanel.getBoundingClientRect();
                const panelRect = ds.panel.getBoundingClientRect();
                const centerX = panelRect.left + panelRect.width / 2;

                if (centerX > spRect.left - 50 && centerX < spRect.right + 50) {
                    // Snap back to side panel
                    ds.panel.style.left = '';
                    ds.panel.style.top = '';
                    ds.panel.style.width = '';
                    ds.panel.style.position = '';
                    ds.panel.style.zIndex = '';
                    if (ds.origNext && ds.origNext.parentNode === ds.origParent) {
                        ds.origParent.insertBefore(ds.panel, ds.origNext);
                    } else {
                        ds.origParent.appendChild(ds.panel);
                    }
                }
                // Otherwise, panel stays floating where dropped
            }
            this.dragState = null;
        });
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
        // Remove any existing confirm popup
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
