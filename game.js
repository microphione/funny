// ============================================================
// PIXEL QUEST - Main Game Engine
// Depends on: perlin.js, sprites.js, world.js
// ============================================================

const Game = {
    canvas: null,
    ctx: null,
    miniCanvas: null,
    miniCtx: null,
    TILE: 32,
    running: false,
    lastTime: 0,
    animFrame: 0,
    animTimer: 0,
    isMobile: false,
    canvasW: 640,
    canvasH: 480,

    // ========== PLAYER ==========
    player: {
        x: 0, y: 0,
        level: 1, xp: 0, xpNext: 30,
        hp: 50, maxHp: 50,
        atk: 5, def: 2,
        gold: 20,
        inventory: [
            { id: 'potion', name: 'Mikstura HP', desc: 'Leczy 20 HP', type: 'consumable', heal: 20, count: 3, price: 10 }
        ],
        weapon: { name: 'Drewniany Miecz', atk: 2, tier: 0 },
        armor: { name: 'Skórzana Zbroja', def: 1, tier: 0 },
        facing: 'down',
        moveTimer: 0,
        kills: 0,
        stepCount: 0,
    },

    // ========== MONSTERS (scaled by difficulty) ==========
    monsterPools: {
        plains: [
            { name: 'Slime', emoji: '🟢', hp: 10, atk: 2, def: 0, xp: 5, gold: [2, 5] },
            { name: 'Goblin', emoji: '👺', hp: 15, atk: 3, def: 1, xp: 8, gold: [3, 8] },
            { name: 'Wilk', emoji: '🐺', hp: 18, atk: 5, def: 1, xp: 10, gold: [2, 6] },
        ],
        forest: [
            { name: 'Leśny Pająk', emoji: '🕷️', hp: 12, atk: 6, def: 0, xp: 10, gold: [2, 5] },
            { name: 'Ork Zwiadowca', emoji: '👹', hp: 25, atk: 7, def: 2, xp: 18, gold: [5, 12] },
            { name: 'Bandyta', emoji: '🗡️', hp: 22, atk: 6, def: 3, xp: 15, gold: [8, 15] },
            { name: 'Drzewiec', emoji: '🌳', hp: 35, atk: 5, def: 5, xp: 20, gold: [4, 10] },
        ],
        swamp: [
            { name: 'Trujący Żuk', emoji: '🪲', hp: 14, atk: 8, def: 1, xp: 12, gold: [3, 7] },
            { name: 'Bagienne Widmo', emoji: '👻', hp: 20, atk: 10, def: 0, xp: 18, gold: [5, 12] },
            { name: 'Troll Bagienny', emoji: '🧌', hp: 40, atk: 7, def: 4, xp: 25, gold: [8, 18] },
        ],
        mountain: [
            { name: 'Golem', emoji: '🗿', hp: 45, atk: 8, def: 6, xp: 30, gold: [10, 20] },
            { name: 'Gryf', emoji: '🦅', hp: 30, atk: 12, def: 3, xp: 25, gold: [8, 16] },
            { name: 'Mroczny Rycerz', emoji: '⚔️', hp: 35, atk: 14, def: 5, xp: 35, gold: [12, 25] },
        ],
        desert: [
            { name: 'Skorpion', emoji: '🦂', hp: 18, atk: 9, def: 2, xp: 14, gold: [4, 10] },
            { name: 'Mumia', emoji: '🧟', hp: 30, atk: 8, def: 3, xp: 20, gold: [6, 14] },
            { name: 'Dżinn', emoji: '🧞', hp: 25, atk: 15, def: 2, xp: 30, gold: [10, 22] },
        ],
    },

    // ========== SHOP GENERATION ==========
    getShopItems(type, difficulty) {
        const tier = Math.floor((difficulty - 1) / 3);
        const baseMult = 1 + tier * 0.8;

        if (type === 'weapon') {
            return [
                { id: `sword_t${tier}`, name: this.weaponName(tier), desc: `ATK +${Math.floor(3 + tier * 4)}`, type: 'weapon', atk: Math.floor(3 + tier * 4), tier, price: Math.floor(40 * baseMult) },
                { id: `sword_t${tier+1}`, name: this.weaponName(tier+1), desc: `ATK +${Math.floor(3 + (tier+1) * 4)}`, type: 'weapon', atk: Math.floor(3 + (tier+1) * 4), tier: tier+1, price: Math.floor(100 * baseMult) },
                { id: `sword_t${tier+2}`, name: this.weaponName(tier+2), desc: `ATK +${Math.floor(3 + (tier+2) * 4)}`, type: 'weapon', atk: Math.floor(3 + (tier+2) * 4), tier: tier+2, price: Math.floor(250 * baseMult) },
            ];
        } else if (type === 'armor') {
            return [
                { id: `armor_t${tier}`, name: this.armorName(tier), desc: `DEF +${Math.floor(2 + tier * 3)}`, type: 'armor', def: Math.floor(2 + tier * 3), tier, price: Math.floor(45 * baseMult) },
                { id: `armor_t${tier+1}`, name: this.armorName(tier+1), desc: `DEF +${Math.floor(2 + (tier+1) * 3)}`, type: 'armor', def: Math.floor(2 + (tier+1) * 3), tier: tier+1, price: Math.floor(110 * baseMult) },
                { id: `armor_t${tier+2}`, name: this.armorName(tier+2), desc: `DEF +${Math.floor(2 + (tier+2) * 3)}`, type: 'armor', def: Math.floor(2 + (tier+2) * 3), tier: tier+2, price: Math.floor(260 * baseMult) },
            ];
        } else {
            const healBase = 15 + tier * 10;
            return [
                { id: 'potion', name: 'Mikstura HP', desc: `Leczy ${healBase} HP`, type: 'consumable', heal: healBase, price: Math.floor(8 * baseMult) },
                { id: 'big_potion', name: 'Duża Mikstura', desc: `Leczy ${healBase * 3} HP`, type: 'consumable', heal: healBase * 3, price: Math.floor(25 * baseMult) },
                { id: 'full_potion', name: 'Pełna Mikstura', desc: 'Leczy całe HP', type: 'consumable', heal: 99999, price: Math.floor(70 * baseMult) },
            ];
        }
    },

    weaponName(tier) {
        const names = ['Drewniany Miecz','Żelazny Miecz','Stalowy Miecz','Mithrilowy Miecz',
                       'Magiczny Miecz','Płonący Miecz','Miecz Cieni','Miecz Legendy',
                       'Ostrze Burzy','Miecz Bogów','Kosmiczny Miecz','Ostrze Wieczności'];
        return names[Math.min(tier, names.length - 1)];
    },

    armorName(tier) {
        const names = ['Skórzana Zbroja','Kolczuga','Zbroja Płytowa','Mithrilowa Zbroja',
                       'Magiczna Zbroja','Zbroja Płomieni','Zbroja Cieni','Zbroja Legendy',
                       'Zbroja Burzy','Zbroja Bogów','Kosmiczna Zbroja','Zbroja Wieczności'];
        return names[Math.min(tier, names.length - 1)];
    },

    // ============================================================
    // INITIALIZATION
    // ============================================================
    init() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.miniCanvas = document.getElementById('minimap');
        this.miniCtx = this.miniCanvas.getContext('2d');

        this.detectDevice();
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.ctx.imageSmoothingEnabled = false;
        this.miniCtx.imageSmoothingEnabled = false;

        Sprites.init();
        this.setupInput();
        this.setupMobileControls();
        this.setupUI();
    },

    detectDevice() {
        this.isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.innerWidth < 768;
        document.getElementById('mobile-controls').style.display = this.isMobile ? 'block' : 'none';
        document.getElementById('controls-hint').style.display = this.isMobile ? 'none' : 'block';
        if (this.isMobile) {
            document.body.style.overflow = 'hidden';
            this.setupFullscreen();
        }
    },

    setupFullscreen() {
        const btn = document.getElementById('fullscreen-btn');
        btn.style.display = 'flex';

        btn.addEventListener('click', () => this.toggleFullscreen());
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.toggleFullscreen();
        }, { passive: false });

        document.addEventListener('fullscreenchange', () => this.onFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.onFullscreenChange());
    },

    toggleFullscreen() {
        const doc = document.documentElement;
        const isFS = document.fullscreenElement || document.webkitFullscreenElement;
        if (!isFS) {
            const request = doc.requestFullscreen || doc.webkitRequestFullscreen;
            if (request) request.call(doc);
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('landscape').catch(() => {});
            }
        } else {
            const exit = document.exitFullscreen || document.webkitExitFullscreen;
            if (exit) exit.call(document);
        }
    },

    onFullscreenChange() {
        const isFS = document.fullscreenElement || document.webkitFullscreenElement;
        const btn = document.getElementById('fullscreen-btn');
        btn.textContent = isFS ? '✕' : '⛶';
        btn.classList.toggle('is-fullscreen', !!isFS);
        setTimeout(() => this.resizeCanvas(), 100);
    },

    resizeCanvas() {
        const container = document.getElementById('game-container');
        const isFS = document.fullscreenElement || document.webkitFullscreenElement;
        if (this.isMobile) {
            const w = window.innerWidth;
            if (isFS) {
                const h = window.innerHeight - 140;
                container.style.width = w + 'px';
                container.style.height = h + 'px';
            } else {
                const h = window.innerHeight - 200;
                container.style.width = w + 'px';
                container.style.height = Math.min(h, w * 0.75) + 'px';
            }
        }
        // Internal resolution stays fixed
        this.canvas.width = this.canvasW;
        this.canvas.height = this.canvasH;
        if (this.ctx) this.ctx.imageSmoothingEnabled = false;
    },

    // ============================================================
    // INPUT
    // ============================================================
    setupInput() {
        document.addEventListener('keydown', (e) => {
            if (!this.running) return;

            if (this.combat.active) {
                if (e.key.toLowerCase() === 'a') this.combat.doAttack();
                else if (e.key.toLowerCase() === 's') this.combat.doSkill();
                else if (e.key.toLowerCase() === 'd') this.combat.doPotion();
                else if (e.key.toLowerCase() === 'f') this.combat.doFlee();
                return;
            }

            if (e.key === 'Escape') { this.closeAllOverlays(); return; }
            if (e.key.toLowerCase() === 'i' && !this.isAnyOverlayOpen()) { this.openInventory(); return; }
            if (e.key === ' ' && !this.isAnyOverlayOpen()) { e.preventDefault(); this.interact(); return; }

            if (!this.isAnyOverlayOpen()) {
                const dirs = {
                    'arrowup': [0,-1,'up'], 'w': [0,-1,'up'],
                    'arrowdown': [0,1,'down'], 's': [0,1,'down'],
                    'arrowleft': [-1,0,'left'], 'a': [-1,0,'left'],
                    'arrowright': [1,0,'right'], 'd': [1,0,'right'],
                };
                const dir = dirs[e.key.toLowerCase()];
                if (dir && this.player.moveTimer <= 0) {
                    this.movePlayer(dir[0], dir[1], dir[2]);
                }
            }
        });
    },

    // ============================================================
    // MOBILE CONTROLS
    // ============================================================
    setupMobileControls() {
        // D-pad buttons
        document.querySelectorAll('.dpad-btn[data-dir]').forEach(btn => {
            const dir = btn.dataset.dir;
            const dirs = { up: [0,-1,'up'], down: [0,1,'down'], left: [-1,0,'left'], right: [1,0,'right'] };

            let interval = null;

            const startMove = (e) => {
                e.preventDefault();
                btn.classList.add('pressed');
                if (this.combat.active || this.isAnyOverlayOpen()) return;
                const d = dirs[dir];
                if (d && this.player.moveTimer <= 0) this.movePlayer(d[0], d[1], d[2]);
                interval = setInterval(() => {
                    if (this.player.moveTimer <= 0 && !this.combat.active && !this.isAnyOverlayOpen()) {
                        this.movePlayer(d[0], d[1], d[2]);
                    }
                }, 200);
            };

            const stopMove = (e) => {
                e.preventDefault();
                btn.classList.remove('pressed');
                if (interval) { clearInterval(interval); interval = null; }
            };

            btn.addEventListener('touchstart', startMove, { passive: false });
            btn.addEventListener('touchend', stopMove, { passive: false });
            btn.addEventListener('touchcancel', stopMove, { passive: false });
        });

        // Center button = interact
        document.querySelector('.dpad-center').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.interact();
        }, { passive: false });

        // Action buttons
        document.getElementById('mobile-interact').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.interact();
        }, { passive: false });

        document.getElementById('mobile-inventory').addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.isAnyOverlayOpen()) this.closeAllOverlays();
            else this.openInventory();
        }, { passive: false });

        // Combat mobile buttons
        document.querySelectorAll('#mobile-combat .mobile-combat-btn').forEach(btn => {
            btn.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
        });
    },

    // ============================================================
    // UI SETUP
    // ============================================================
    setupUI() {
        document.getElementById('btn-new-game').addEventListener('click', () => this.startNewGame());
        document.getElementById('btn-load-game').addEventListener('click', () => this.loadGame());
    },

    // ============================================================
    // GAME START
    // ============================================================
    startNewGame() {
        World.init();
        this.player.x = 0;
        this.player.y = 0;
        document.getElementById('title-screen').style.display = 'none';
        this.running = true;
        this.log('Witaj w świecie Pixel Quest!', 'info');
        this.log('Eksploruj, walcz i handluj. Świat jest nieskończony!', 'info');
        this.log(this.isMobile ? 'Użyj D-pad do ruchu, ACT by rozmawiać.' : 'WASD/strzałki = ruch, SPACJA = interakcja, I = ekwipunek.', 'info');
        this.gameLoop(0);
    },

    loadGame() {
        const save = localStorage.getItem('pq_save_v2');
        if (save) {
            try {
                const data = JSON.parse(save);
                Object.assign(this.player, data.player);
                World.init(data.worldSeed);
                World.openedChests = new Set(data.openedChests || []);
                document.getElementById('title-screen').style.display = 'none';
                this.running = true;
                this.log('Gra wczytana!', 'info');
                this.gameLoop(0);
            } catch(e) {
                this.log('Błąd wczytywania. Nowa gra...', 'combat');
                this.startNewGame();
            }
        } else {
            this.log('Brak zapisu. Nowa gra...', 'info');
            this.startNewGame();
        }
    },

    saveGame() {
        const data = {
            player: { ...this.player },
            worldSeed: World.worldSeed,
            openedChests: [...World.openedChests],
        };
        localStorage.setItem('pq_save_v2', JSON.stringify(data));
    },

    // ============================================================
    // GAME LOOP
    // ============================================================
    gameLoop(timestamp) {
        if (!this.running) return;
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
        this.lastTime = timestamp;

        this.animTimer += dt;
        if (this.animTimer > 0.3) { this.animTimer = 0; this.animFrame = (this.animFrame + 1) % 4; }
        if (this.player.moveTimer > 0) this.player.moveTimer -= dt;

        this.render();
        this.renderMinimap();
        this.updateUI();

        requestAnimationFrame((t) => this.gameLoop(t));
    },

    // ============================================================
    // MOVEMENT
    // ============================================================
    movePlayer(dx, dy, facing) {
        this.player.facing = facing;
        const nx = this.player.x + dx;
        const ny = this.player.y + dy;

        if (World.isWalkable(nx, ny)) {
            this.player.x = nx;
            this.player.y = ny;
            this.player.moveTimer = 0.15;
            this.player.stepCount++;

            // Random encounter
            const chance = World.getEncounterChance(nx, ny);
            if (chance > 0 && Math.random() < chance) {
                this.startCombat();
            }

            // Periodic save & cleanup
            if (this.player.stepCount % 30 === 0) {
                this.saveGame();
                World.cleanupChunks(this.player.x, this.player.y);
            }
        }
    },

    // ============================================================
    // INTERACTION
    // ============================================================
    interact() {
        const faceDirs = { up: [0,-1], down: [0,1], left: [-1,0], right: [1,0] };
        const [dx, dy] = faceDirs[this.player.facing];
        const tx = this.player.x + dx;
        const ty = this.player.y + dy;
        const tile = World.getTile(tx, ty);
        const T = World.T;

        const diff = World.getDifficulty(tx, ty);

        switch(tile) {
            case T.SHOP_WEAPON: this.openShop('weapon', diff); break;
            case T.SHOP_ARMOR: this.openShop('armor', diff); break;
            case T.SHOP_POTION: this.openShop('potion', diff); break;
            case T.INN:
                const cost = Math.max(5, diff * 3);
                if (this.player.gold >= cost) {
                    this.player.gold -= cost;
                    this.player.hp = this.player.maxHp;
                    this.log(`Odpoczywasz w gospodzie. HP pełne! (-${cost} Zł)`, 'heal');
                    this.saveGame();
                } else {
                    this.log(`Nie stać cię na nocleg! (${cost} Zł)`, 'combat');
                }
                break;
            case T.SIGN:
                const key = `${tx},${ty}`;
                if (World.signTexts[key]) {
                    this.showDialog('Tablica', World.signTexts[key].replace(/\n/g, '<br>'));
                }
                break;
            case T.CHEST:
                this.openChest(tx, ty);
                break;
            case T.WELL:
                if (this.player.hp < this.player.maxHp) {
                    const heal = Math.min(10, this.player.maxHp - this.player.hp);
                    this.player.hp += heal;
                    this.log(`Pijesz ze studni. +${heal} HP`, 'heal');
                } else {
                    this.log('Woda ze studni jest orzeźwiająca!', 'info');
                }
                break;
            case T.CAVE_ENTRY:
                this.log('Wchodzisz do mrocznej jaskini...', 'info');
                // Treat as dungeon encounter trigger
                if (Math.random() < 0.5) this.startCombat();
                break;
        }
    },

    openChest(x, y) {
        const key = `${x},${y}`;
        if (World.openedChests.has(key)) {
            this.log('Skrzynia jest pusta.', 'info');
            return;
        }
        World.openedChests.add(key);
        const chest = World.chests[key];
        if (chest) {
            if (chest.gold > 0) {
                this.player.gold += chest.gold;
                this.log(`Znaleziono ${chest.gold} Zł!`, 'loot');
            }
            if (chest.item) {
                this.addToInventory(chest.item);
                this.log(`Znaleziono: ${chest.item.name}!`, 'loot');
            }
        } else {
            const diff = World.getDifficulty(x, y);
            const gold = Math.floor(5 + diff * 10 * Math.random());
            this.player.gold += gold;
            this.log(`Znaleziono ${gold} Zł!`, 'loot');
        }
        this.saveGame();
    },

    // ============================================================
    // SHOPS (improved with comparison)
    // ============================================================
    openShop(type, difficulty) {
        const items = this.getShopItems(type, difficulty);
        const overlay = document.getElementById('dialog-overlay');
        const title = document.getElementById('dialog-title');
        const content = document.getElementById('dialog-content');

        const shopNames = { weapon: 'Kowalnia - Oręż', armor: 'Kowalnia - Zbroje', potion: 'Apteka' };
        title.textContent = shopNames[type];

        let html = '<div class="shop-tabs">';
        html += `<div class="shop-tab ${type==='weapon'?'active':''}" onclick="Game.openShop('weapon',${difficulty})">Broń</div>`;
        html += `<div class="shop-tab ${type==='armor'?'active':''}" onclick="Game.openShop('armor',${difficulty})">Zbroje</div>`;
        html += `<div class="shop-tab ${type==='potion'?'active':''}" onclick="Game.openShop('potion',${difficulty})">Mikstury</div>`;
        html += '</div>';

        items.forEach((item, i) => {
            const canAfford = this.player.gold >= item.price;
            let compare = '';

            if (item.type === 'weapon') {
                const diff = item.atk - this.player.weapon.atk;
                const isEquipped = this.player.weapon.name === item.name;
                if (isEquipped) {
                    compare = '<span class="equipped-tag">[WYPOSAŻONY]</span>';
                } else if (diff > 0) {
                    compare = `<span class="stat-up">+${diff} ATK</span>`;
                } else if (diff < 0) {
                    compare = `<span class="stat-down">${diff} ATK</span>`;
                } else {
                    compare = '<span style="color:#888">=</span>';
                }
            } else if (item.type === 'armor') {
                const diff = item.def - this.player.armor.def;
                const isEquipped = this.player.armor.name === item.name;
                if (isEquipped) {
                    compare = '<span class="equipped-tag">[WYPOSAŻONY]</span>';
                } else if (diff > 0) {
                    compare = `<span class="stat-up">+${diff} DEF</span>`;
                } else if (diff < 0) {
                    compare = `<span class="stat-down">${diff} DEF</span>`;
                } else {
                    compare = '<span style="color:#888">=</span>';
                }
            }

            html += `<div class="shop-item ${canAfford ? '' : 'cannot-afford'}" onclick="Game.buyItem('${type}',${difficulty},${i})">
                <div>
                    <div class="item-name">${item.name}</div>
                    <div class="item-desc">${item.desc}</div>
                    <div class="item-compare">${compare}</div>
                </div>
                <div class="item-price">${item.price} Zł</div>
            </div>`;
        });

        // Sell section
        const sellables = this.player.inventory.filter(i => i.price > 0);
        if (sellables.length > 0) {
            html += '<hr style="border-color:#333;margin:10px 0">';
            html += '<div style="font-size:8px;color:#e67e22;margin-bottom:6px;text-align:center">SPRZEDAJ</div>';
            sellables.forEach((item, i) => {
                const sellPrice = Math.floor(item.price * 0.5);
                const origIdx = this.player.inventory.indexOf(item);
                html += `<div class="shop-item" onclick="Game.sellItem(${origIdx})" style="border-left:2px solid #e67e22">
                    <div><span class="item-name">${item.name} x${item.count}</span></div>
                    <div class="item-price" style="color:#2ecc71">+${sellPrice} Zł</div>
                </div>`;
            });
        }

        content.innerHTML = html;
        overlay.classList.add('active');
    },

    buyItem(shopType, difficulty, index) {
        const items = this.getShopItems(shopType, difficulty);
        const item = items[index];
        if (this.player.gold < item.price) { this.log('Nie stać cię!', 'combat'); return; }

        this.player.gold -= item.price;
        if (item.type === 'weapon') {
            this.player.weapon = { name: item.name, atk: item.atk, tier: item.tier || 0 };
            this.log(`Wyposażono: ${item.name}!`, 'shop');
        } else if (item.type === 'armor') {
            this.player.armor = { name: item.name, def: item.def, tier: item.tier || 0 };
            this.log(`Wyposażono: ${item.name}!`, 'shop');
        } else {
            this.addToInventory({ ...item, count: 1 });
            this.log(`Kupiono: ${item.name}!`, 'shop');
        }
        this.openShop(shopType, difficulty);
        this.saveGame();
    },

    sellItem(index) {
        const item = this.player.inventory[index];
        if (!item) return;
        const sellPrice = Math.floor(item.price * 0.5);
        this.player.gold += sellPrice;
        item.count--;
        if (item.count <= 0) this.player.inventory.splice(index, 1);
        this.log(`Sprzedano ${item.name}. +${sellPrice} Zł`, 'shop');
        // Refresh - find current shop type from dialog title
        const diff = World.getDifficulty(this.player.x, this.player.y);
        this.openShop('potion', diff);
    },

    // ============================================================
    // INVENTORY
    // ============================================================
    addToInventory(item) {
        const existing = this.player.inventory.find(i => i.id === item.id);
        if (existing) { existing.count += (item.count || 1); }
        else { this.player.inventory.push({ ...item, count: item.count || 1 }); }
    },

    openInventory() {
        const overlay = document.getElementById('inventory-overlay');
        const content = document.getElementById('inventory-content');
        const p = this.player;

        let html = `<div class="inv-item equipped"><span>Broń: ${p.weapon.name} (ATK +${p.weapon.atk})</span></div>`;
        html += `<div class="inv-item equipped"><span>Zbroja: ${p.armor.name} (DEF +${p.armor.def})</span></div>`;
        html += `<hr style="border-color:#333;margin:6px 0">`;

        if (p.inventory.length === 0) {
            html += '<div style="text-align:center;color:#555;font-size:8px;padding:12px;">Plecak pusty</div>';
        }
        p.inventory.forEach((item, i) => {
            html += `<div class="inv-item">
                <span>${item.name} x${item.count}</span>
                ${item.type === 'consumable' ? `<button class="use-btn" onclick="Game.useItem(${i})">Użyj</button>` : ''}
            </div>`;
        });

        content.innerHTML = html;
        overlay.classList.add('active');
    },

    useItem(index) {
        const item = this.player.inventory[index];
        if (!item) return;
        if (item.type === 'consumable' && item.heal) {
            const healed = Math.min(item.heal, this.player.maxHp - this.player.hp);
            this.player.hp = Math.min(this.player.hp + item.heal, this.player.maxHp);
            this.log(`Użyto ${item.name}. +${healed} HP`, 'heal');
            item.count--;
            if (item.count <= 0) this.player.inventory.splice(index, 1);
        }
        this.openInventory();
    },

    // ============================================================
    // COMBAT (sinusoidal difficulty scaling)
    // ============================================================
    combat: {
        active: false,
        enemy: null,

        start() {
            const px = Game.player.x;
            const py = Game.player.y;
            const area = World.getMonsterArea(px, py);
            const diff = World.getDifficulty(px, py);

            const pool = Game.monsterPools[area] || Game.monsterPools.plains;
            const def = pool[Math.floor(Math.random() * pool.length)];

            // Scale monster by difficulty (sinusoidal already baked into getDifficulty)
            const scale = 1 + (diff - 1) * 0.4;
            const isElite = Math.random() < 0.08;
            const eliteMult = isElite ? 2.5 : 1;

            this.enemy = {
                name: (isElite ? '★ ' : '') + def.name,
                emoji: def.emoji,
                hp: Math.floor(def.hp * scale * eliteMult),
                maxHp: Math.floor(def.hp * scale * eliteMult),
                atk: Math.floor(def.atk * scale * eliteMult),
                def: Math.floor(def.def * scale),
                xp: Math.floor(def.xp * scale * eliteMult),
                gold: [Math.floor(def.gold[0] * scale * eliteMult), Math.floor(def.gold[1] * scale * eliteMult)],
                level: diff,
                isElite,
            };
            this.active = true;

            document.getElementById('combat-overlay').classList.add('active');
            document.getElementById('enemy-display').textContent = this.enemy.emoji;
            document.getElementById('enemy-name').textContent = `${this.enemy.name} (Lv.${diff})`;
            document.getElementById('combat-log').innerHTML = '';
            this.updateEnemyHP();

            Game.log(`Napotkano: ${this.enemy.name}!`, 'combat');

            // Show mobile combat buttons
            if (Game.isMobile) {
                document.getElementById('mobile-actions').style.display = 'none';
                document.getElementById('mobile-combat').classList.add('active');
            }
        },

        updateEnemyHP() {
            const pct = Math.max(0, (this.enemy.hp / this.enemy.maxHp) * 100);
            document.getElementById('enemy-hp-bar').style.width = pct + '%';
            document.getElementById('enemy-hp-text').textContent = `HP: ${Math.max(0,this.enemy.hp)}/${this.enemy.maxHp}`;
        },

        combatLog(msg) {
            const div = document.getElementById('combat-log');
            div.innerHTML = msg + '<br>' + div.innerHTML;
        },

        calcDamage(atk, def) {
            return Math.max(1, atk - def + Math.floor(Math.random() * 3) - 1);
        },

        doAttack() {
            if (!this.active) return;
            const totalAtk = Game.player.atk + Game.player.weapon.atk;
            const dmg = this.calcDamage(totalAtk, this.enemy.def);
            this.enemy.hp -= dmg;
            this.combatLog(`Zadajesz ${dmg} obrażeń!`);
            this.updateEnemyHP();
            document.getElementById('enemy-display').classList.add('damage-flash');
            setTimeout(() => document.getElementById('enemy-display').classList.remove('damage-flash'), 200);
            if (this.enemy.hp <= 0) this.victory();
            else this.enemyTurn();
        },

        doSkill() {
            if (!this.active) return;
            if (Math.random() < 0.25) { this.combatLog('Umiejętność chybiona!'); this.enemyTurn(); return; }
            const totalAtk = Game.player.atk + Game.player.weapon.atk;
            const dmg = Math.floor(this.calcDamage(totalAtk, this.enemy.def) * 1.8);
            this.enemy.hp -= dmg;
            this.combatLog(`Potężne uderzenie! ${dmg} obrażeń!`);
            this.updateEnemyHP();
            document.getElementById('enemy-display').classList.add('damage-flash');
            setTimeout(() => document.getElementById('enemy-display').classList.remove('damage-flash'), 200);
            if (this.enemy.hp <= 0) this.victory();
            else this.enemyTurn();
        },

        doPotion() {
            if (!this.active) return;
            const potion = Game.player.inventory.find(i => i.type === 'consumable' && i.heal);
            if (!potion) { this.combatLog('Brak mikstur!'); return; }
            const healed = Math.min(potion.heal, Game.player.maxHp - Game.player.hp);
            Game.player.hp = Math.min(Game.player.hp + potion.heal, Game.player.maxHp);
            potion.count--;
            if (potion.count <= 0) Game.player.inventory = Game.player.inventory.filter(i => i.count > 0);
            this.combatLog(`Użyto ${potion.name}. +${healed} HP`);
            this.enemyTurn();
        },

        doFlee() {
            if (!this.active) return;
            if (Math.random() < 0.45) {
                this.combatLog('Uciekasz!');
                this.endCombat();
                Game.log('Udało się uciec!', 'info');
            } else {
                this.combatLog('Nie udało się uciec!');
                this.enemyTurn();
            }
        },

        enemyTurn() {
            const totalDef = Game.player.def + Game.player.armor.def;
            const dmg = this.calcDamage(this.enemy.atk, totalDef);
            Game.player.hp -= dmg;
            this.combatLog(`${this.enemy.name} zadaje ${dmg} obrażeń!`);
            if (Game.player.hp <= 0) this.defeat();
        },

        victory() {
            const gold = this.enemy.gold[0] + Math.floor(Math.random() * (this.enemy.gold[1] - this.enemy.gold[0] + 1));
            Game.player.gold += gold;
            Game.player.xp += this.enemy.xp;
            Game.player.kills++;

            Game.log(`Pokonano ${this.enemy.name}! +${this.enemy.xp} XP, +${gold} Zł`, 'loot');

            // Level up check
            while (Game.player.xp >= Game.player.xpNext) {
                Game.player.xp -= Game.player.xpNext;
                Game.player.level++;
                Game.player.xpNext = Math.floor(Game.player.xpNext * 1.4);
                Game.player.maxHp += 6 + Math.floor(Game.player.level * 0.5);
                Game.player.hp = Game.player.maxHp;
                Game.player.atk += 1 + Math.floor(Game.player.level / 5);
                Game.player.def += 1;
                Game.log(`LEVEL UP! Poziom ${Game.player.level}!`, 'loot');

                const text = document.createElement('div');
                text.className = 'float-text';
                text.textContent = `LEVEL ${Game.player.level}!`;
                text.style.left = '50%'; text.style.top = '40%';
                text.style.color = '#f1c40f';
                document.getElementById('game-container').appendChild(text);
                setTimeout(() => text.remove(), 1500);
            }

            setTimeout(() => this.endCombat(), 600);
            Game.saveGame();
        },

        defeat() {
            const lostGold = Math.floor(Game.player.gold * 0.15);
            Game.player.hp = Math.floor(Game.player.maxHp * 0.3);
            Game.player.gold = Math.max(0, Game.player.gold - lostGold);
            // Respawn at nearest village or origin
            Game.player.x = 0; Game.player.y = 0;
            Game.log(`Poległeś! Stracono ${lostGold} Zł. Wracasz do spawnu.`, 'combat');
            setTimeout(() => this.endCombat(), 600);
            Game.saveGame();
        },

        endCombat() {
            this.active = false;
            document.getElementById('combat-overlay').classList.remove('active');
            if (Game.isMobile) {
                document.getElementById('mobile-actions').style.display = '';
                document.getElementById('mobile-combat').classList.remove('active');
            }
        }
    },

    startCombat() { this.combat.start(); },

    // ============================================================
    // DIALOGS
    // ============================================================
    showDialog(title, content) {
        document.getElementById('dialog-title').textContent = title;
        document.getElementById('dialog-content').innerHTML = `<div style="font-size:9px;line-height:1.8;padding:6px;">${content}</div>`;
        document.getElementById('dialog-overlay').classList.add('active');
    },

    closeAllOverlays() {
        document.querySelectorAll('.overlay').forEach(o => o.classList.remove('active'));
    },

    isAnyOverlayOpen() {
        return document.querySelector('.overlay.active') !== null;
    },

    log(msg, type = 'info') {
        const log = document.getElementById('message-log');
        const div = document.createElement('div');
        div.className = `msg-${type}`;
        div.textContent = `> ${msg}`;
        log.appendChild(div);
        log.scrollTop = log.scrollHeight;
        while (log.children.length > 50) log.removeChild(log.firstChild);
    },

    // ============================================================
    // RENDERING
    // ============================================================
    render() {
        const ctx = this.ctx;
        const T = this.TILE;
        const W = this.canvasW;
        const H = this.canvasH;
        const tilesX = Math.ceil(W / T) + 1;
        const tilesY = Math.ceil(H / T) + 1;

        // Camera centered on player
        const camX = this.player.x - Math.floor(tilesX / 2);
        const camY = this.player.y - Math.floor(tilesY / 2);

        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, W, H);

        const TT = World.T;
        const af = this.animFrame;

        for (let dy = 0; dy < tilesY; dy++) {
            for (let dx = 0; dx < tilesX; dx++) {
                const wx = camX + dx;
                const wy = camY + dy;
                const px = dx * T;
                const py = dy * T;
                const tile = World.getTile(wx, wy);

                // Map tile to sprite key
                let key = null;
                const v = ((wx + wy) & 3); // variation based on position

                switch(tile) {
                    case TT.GRASS: key = `grass_${v}`; break;
                    case TT.DARK_GRASS: key = `darkgrass_${v}`; break;
                    case TT.PATH: key = `path_${v}`; break;
                    case TT.WATER: key = `water_${af}`; break;
                    case TT.TREE: key = 'tree'; break;
                    case TT.HOUSE: key = 'house'; break;
                    case TT.DOOR: key = 'door'; break;
                    case TT.SHOP_WEAPON: key = 'shop_weapon'; break;
                    case TT.SHOP_ARMOR: key = 'shop_armor'; break;
                    case TT.SHOP_POTION: key = 'shop_potion'; break;
                    case TT.INN: key = 'inn'; break;
                    case TT.BRIDGE: key = `bridge_${af}`; break;
                    case TT.CAVE_FLOOR: key = `cave_floor_${v % 3}`; break;
                    case TT.CAVE_WALL: key = `cave_wall_${v % 3}`; break;
                    case TT.CAVE_ENTRY: key = 'cave_entry'; break;
                    case TT.FOREST_ENTRY: key = 'forest_entry'; break;
                    case TT.FLOWER: key = `flower_${v}`; break;
                    case TT.SIGN: key = 'sign'; break;
                    case TT.CHEST:
                        key = World.openedChests.has(`${wx},${wy}`) ? 'chest_open' : 'chest_closed';
                        // Draw ground under chest
                        Sprites.draw(ctx, `grass_${v}`, px, py);
                        break;
                    case TT.STONE_FLOOR: key = 'stone_floor'; break;
                    case TT.FENCE: key = 'fence'; break;
                    case TT.WELL: key = 'well'; break;
                    case TT.STATUE: key = 'statue'; break;
                    case TT.SWAMP: key = `swamp_${v}`; break;
                    case TT.MOUNTAIN: key = `mountain_${v}`; break;
                    case TT.DESERT: key = `desert_${v}`; break;
                    case TT.ROCK: key = 'rock'; break;
                    case TT.SWAMP_TREE: key = 'swamp_tree'; break;
                    case TT.CACTUS: key = 'cactus'; break;
                    case TT.VILLAGE_HUT: key = 'village_hut'; break;
                }

                if (key) Sprites.draw(ctx, key, px, py);
            }
        }

        // Draw player
        const ppx = (this.player.x - camX) * T;
        const ppy = (this.player.y - camY) * T;
        const walkFrame = this.player.moveTimer > 0 ? this.animFrame : 0;
        Sprites.draw(ctx, `player_${this.player.facing}_${walkFrame}`, ppx, ppy);

        // Location label
        document.getElementById('location-label').textContent = World.getAreaName(this.player.x, this.player.y);
    },

    // ============================================================
    // MINIMAP
    // ============================================================
    renderMinimap() {
        const ctx = this.miniCtx;
        const w = this.miniCanvas.width;
        const h = this.miniCanvas.height;
        const scale = 2;
        const halfW = Math.floor(w / scale / 2);
        const halfH = Math.floor(h / scale / 2);

        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, w, h);

        const TT = World.T;

        for (let dy = -halfH; dy <= halfH; dy++) {
            for (let dx = -halfW; dx <= halfW; dx++) {
                const wx = this.player.x + dx;
                const wy = this.player.y + dy;
                const tile = World.getTile(wx, wy);

                let color = '#4a8c3f';
                if (tile === TT.DARK_GRASS) color = '#2d5a2a';
                else if (tile === TT.PATH || tile === TT.BRIDGE) color = '#c4a663';
                else if (tile === TT.WATER) color = '#2980b9';
                else if (tile === TT.TREE || tile === TT.SWAMP_TREE) color = '#1a6b30';
                else if (tile === TT.HOUSE || tile === TT.DOOR || tile === TT.VILLAGE_HUT) color = '#d4a574';
                else if (tile === TT.SHOP_WEAPON || tile === TT.SHOP_ARMOR || tile === TT.SHOP_POTION || tile === TT.INN) color = '#e67e22';
                else if (tile === TT.FENCE) color = '#8B6914';
                else if (tile === TT.CAVE_FLOOR || tile === TT.CAVE_ENTRY) color = '#4a4a5a';
                else if (tile === TT.CAVE_WALL || tile === TT.ROCK) color = '#2a2a3a';
                else if (tile === TT.STONE_FLOOR) color = '#909090';
                else if (tile === TT.CHEST) color = '#daa520';
                else if (tile === TT.SWAMP) color = '#3a5a3a';
                else if (tile === TT.MOUNTAIN) color = '#808080';
                else if (tile === TT.DESERT) color = '#d4b86a';
                else if (tile === TT.CACTUS) color = '#2d8a4e';

                ctx.fillStyle = color;
                ctx.fillRect((dx + halfW) * scale, (dy + halfH) * scale, scale, scale);
            }
        }

        // Player dot
        ctx.fillStyle = this.animFrame % 2 === 0 ? '#fff' : '#e74c3c';
        ctx.fillRect(halfW * scale - 1, halfH * scale - 1, 3, 3);
    },

    // ============================================================
    // UI UPDATE
    // ============================================================
    updateUI() {
        const p = this.player;
        document.getElementById('stat-level').textContent = p.level;
        document.getElementById('stat-hp').textContent = `${Math.max(0,p.hp)}/${p.maxHp}`;
        document.getElementById('hp-bar').style.width = `${Math.max(0,(p.hp/p.maxHp)*100)}%`;
        document.getElementById('xp-bar').style.width = `${(p.xp/p.xpNext)*100}%`;
        document.getElementById('stat-gold').textContent = p.gold;
        document.getElementById('stat-atk').textContent = p.atk + p.weapon.atk;
        document.getElementById('stat-def').textContent = p.def + p.armor.def;
    },
};

// ============================================================
// BOOT
// ============================================================
window.addEventListener('load', () => Game.init());
