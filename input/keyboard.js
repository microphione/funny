// ============================================================
// GAME INPUT - Keyboard: GameInput object, init(), onKeyDown(), key bindings
// Must load FIRST - defines the GameInput object
// ============================================================

const GameInput = {
    keys: {},
    heldDir: null, // currently held movement direction
    selectedSkill: null,

    init() {
        window.addEventListener('keydown', e => this.onKeyDown(e));
        window.addEventListener('keyup', e => {
            this.keys[e.code] = false;
            // Clear held direction when key released
            if (['KeyW','ArrowUp','KeyS','ArrowDown','KeyA','ArrowLeft','KeyD','ArrowRight'].includes(e.code)) {
                this.heldDir = this.getHeldDirection();
            }
        });
        this.initMobileControls();
    },

    getHeldDirection() {
        if (this.keys['KeyW'] || this.keys['ArrowUp']) return { dx: 0, dy: -1, dir: 'up' };
        if (this.keys['KeyS'] || this.keys['ArrowDown']) return { dx: 0, dy: 1, dir: 'down' };
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) return { dx: -1, dy: 0, dir: 'left' };
        if (this.keys['KeyD'] || this.keys['ArrowRight']) return { dx: 1, dy: 0, dir: 'right' };
        return null;
    },

    onKeyDown(e) {
        if (Game.state !== 'playing') return;
        this.keys[e.code] = true;

        // Overlays open - ESC to close
        if (Game.activeOverlay) {
            if (e.code === 'Escape') Game.closeAllOverlays();
            return;
        }

        // Movement keys - set held direction for continuous movement
        if (['KeyW','ArrowUp'].includes(e.code)) { this.heldDir = { dx: 0, dy: -1, dir: 'up' }; this.tryMove(0, -1, 'up'); e.preventDefault(); }
        else if (['KeyS','ArrowDown'].includes(e.code)) { this.heldDir = { dx: 0, dy: 1, dir: 'down' }; this.tryMove(0, 1, 'down'); e.preventDefault(); }
        else if (['KeyA','ArrowLeft'].includes(e.code)) { this.heldDir = { dx: -1, dy: 0, dir: 'left' }; this.tryMove(-1, 0, 'left'); e.preventDefault(); }
        else if (['KeyD','ArrowRight'].includes(e.code)) { this.heldDir = { dx: 1, dy: 0, dir: 'right' }; this.tryMove(1, 0, 'right'); e.preventDefault(); }
        // Target nearest monster (Space) - Tibia-style: mark for auto-attack
        else if (e.code === 'Space') { this.targetNearestMonster(); e.preventDefault(); }
        // Interact / Pick up loot (E or Enter)
        else if (e.code === 'Enter' || e.code === 'KeyE') { this.interact(); e.preventDefault(); }
        // Inventory
        else if (e.code === 'KeyI') { GameUI.openInventory(); e.preventDefault(); }
        // Skills
        else if (e.code === 'KeyK') { GameUI.openSkillTree(); e.preventDefault(); }
        // Quests
        else if (e.code === 'KeyJ') { GameUI.openQuests(); e.preventDefault(); }
        // World map
        else if (e.code === 'KeyN') { GameUI.openWorldMap(); e.preventDefault(); }
        // Stat allocation (T)
        else if (e.code === 'KeyT') { GameUI.openStatAllocation(); e.preventDefault(); }
        // Bestiary
        else if (e.code === 'KeyB') { GameUI.openBestiary(); e.preventDefault(); }
        // Quick save
        else if (e.code === 'KeyP') { Game.save(); e.preventDefault(); }
        // Music toggle
        else if (e.code === 'KeyM') { this.toggleMusic(); e.preventDefault(); }
        // Skill shortcuts (1-3)
        else if (e.code >= 'Digit1' && e.code <= 'Digit3') {
            const idx = parseInt(e.code.charAt(5)) - 1;
            this.useSkillByIndex(idx);
            e.preventDefault();
        }
        // Mount toggle (R)
        else if (e.code === 'KeyR') {
            const p = Game.player;
            if (p && p.ownedMounts && p.ownedMounts.length > 0) {
                p.mounted = !p.mounted;
                Game.log(p.mounted ? 'Wsiadasz na wierzchowca!' : 'Zsiadasz z wierzchowca.', 'info');
            } else {
                Game.log('Nie posiadasz wierzchowca. Kup go w stajni!', 'info');
            }
            e.preventDefault();
        }
        // Quick potions: F1 = HP potion, F2 = MP potion
        else if (e.code === 'F1') { this.useQuickPotion('hp'); e.preventDefault(); }
        else if (e.code === 'F2') { this.useQuickPotion('mp'); e.preventDefault(); }
        // Escape
        else if (e.code === 'Escape') {
            if (Game.targeting) { Game.targeting = false; this.selectedSkill = null; }
            Game.autoAttackTarget = null;
        }
    },

    useQuickPotion(subtype) {
        const p = Game.player;
        if (!p) return;
        const idx = p.inventory.findIndex(i => i.type === 'consumable' && i.subtype === subtype);
        if (idx === -1) {
            Game.log(`Brak mikstur ${subtype === 'hp' ? 'HP' : 'MP'}!`, 'info');
            return;
        }
        GameUI.useConsumable(idx);
    },

    toggleMusic() {
        const muted = Music.toggle();
        Game.log(muted ? 'Muzyka wyłączona.' : 'Muzyka włączona.', 'info');
        const btn = document.getElementById('music-btn');
        if (btn) btn.textContent = muted ? '🔇' : '🔊';
    },
};
