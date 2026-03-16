// ============================================================
// GAME INPUT - Mobile: touch controls, initMobileControls()
// Adds methods to GameInput (defined in keyboard.js)
// ============================================================

GameInput.initMobileControls = function() {
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const mobileEl = document.getElementById('mobile-controls');
    const fsBtn = document.getElementById('fullscreen-btn');

    if (isMobile) {
        if (mobileEl) mobileEl.style.display = 'block';
        if (fsBtn) fsBtn.style.display = 'flex';
    }

    document.querySelectorAll('.dpad-btn[data-dir]').forEach(btn => {
        const handler = (e) => {
            e.preventDefault();
            const dir = btn.dataset.dir;
            if (Game.state === 'dead') return;
            const map = { up: [0,-1,'up'], down: [0,1,'down'], left: [-1,0,'left'], right: [1,0,'right'] };
            const [dx, dy, d] = map[dir] || [0,0,'down'];
            this.tryMove(dx, dy, d);
        };
        btn.addEventListener('touchstart', handler, { passive: false });
        btn.addEventListener('mousedown', handler);
    });

    const center = document.querySelector('.dpad-center');
    if (center) {
        const handler = (e) => { e.preventDefault(); this.interact(); };
        center.addEventListener('touchstart', handler, { passive: false });
        center.addEventListener('mousedown', handler);
    }

    const interactBtn = document.getElementById('mobile-interact');
    if (interactBtn) {
        const handler = (e) => { e.preventDefault(); this.interact(); };
        interactBtn.addEventListener('touchstart', handler, { passive: false });
    }

    const invBtn = document.getElementById('mobile-inventory');
    if (invBtn) {
        const handler = (e) => { e.preventDefault(); GameUI.openInventory(); };
        invBtn.addEventListener('touchstart', handler, { passive: false });
    }

    if (fsBtn) {
        fsBtn.addEventListener('click', () => {
            if (document.fullscreenElement || document.webkitFullscreenElement) {
                (document.exitFullscreen || document.webkitExitFullscreen).call(document);
                fsBtn.classList.remove('is-fullscreen');
            } else {
                const el = document.documentElement;
                (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
                fsBtn.classList.add('is-fullscreen');
                try { screen.orientation.lock('landscape').catch(()=>{}); } catch(e) {}
            }
        });
    }
};
