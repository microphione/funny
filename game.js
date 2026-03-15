// ============================================================
// PIXEL QUEST - Main Game Engine (v2 - Major Rewrite)
// Item tiers, skill tree, quests, loot, improved combat
// ============================================================

// ========== ITEM TIER SYSTEM ==========
const TIERS = {
    normal:    { name: 'Zwykły',      color: '#aaa',    mult: 1.0, dropWeight: 50 },
    uncommon:  { name: 'Niezwykły',   color: '#2ecc71', mult: 1.3, dropWeight: 25 },
    rare:      { name: 'Rzadki',      color: '#3498db', mult: 1.7, dropWeight: 12 },
    epic:      { name: 'Epicki',      color: '#9b59b6', mult: 2.2, dropWeight: 5 },
    legendary: { name: 'Legendarny',  color: '#f39c12', mult: 3.0, dropWeight: 2 },
    mythic:    { name: 'Mityczny',    color: '#e74c3c', mult: 4.0, dropWeight: 0.5 },
};

const TIER_ORDER = ['normal','uncommon','rare','epic','legendary','mythic'];

function rollTier(luck = 0) {
    const r = Math.random() * 100 - luck * 5;
    let acc = 0;
    for (const t of TIER_ORDER) {
        acc += TIERS[t].dropWeight;
        if (r < acc) return t;
    }
    return 'normal';
}

function tierColor(tier) { return TIERS[tier]?.color || '#aaa'; }
function tierName(tier) { return TIERS[tier]?.name || 'Zwykły'; }

// ========== SKILL TREE ==========
const SKILL_TREE = {
    might:    { name: 'Siła',        desc: '+2 ATK za punkt',    icon: '⚔️', maxLevel: 10, effect: (lv) => ({ atk: lv * 2 }) },
    armor:    { name: 'Pancerz',     desc: '+2 DEF za punkt',    icon: '🛡️', maxLevel: 10, effect: (lv) => ({ def: lv * 2 }) },
    vitality: { name: 'Witalność',   desc: '+10 Max HP za punkt',icon: '❤️', maxLevel: 10, effect: (lv) => ({ maxHp: lv * 10 }) },
    luck:     { name: 'Szczęście',   desc: 'Lepszy loot',        icon: '🍀', maxLevel: 5,  effect: (lv) => ({ luck: lv }) },
    crit:     { name: 'Krytyk',      desc: '+3% szansy na kryt.',icon: '💥', maxLevel: 10, effect: (lv) => ({ crit: lv * 3 }) },
    haggle:   { name: 'Targowanie',  desc: '-5% ceny w sklepie', icon: '💰', maxLevel: 5,  effect: (lv) => ({ haggle: lv * 5 }) },
};

// ========== LOOT TABLES ==========
const WEAPON_BASES = [
    { name: 'Sztylet',    atkBase: 2, icon: '🗡️' },
    { name: 'Miecz',      atkBase: 4, icon: '⚔️' },
    { name: 'Topór',      atkBase: 5, icon: '🪓' },
    { name: 'Młot',       atkBase: 6, icon: '🔨' },
    { name: 'Włócznia',   atkBase: 3, icon: '🔱' },
    { name: 'Kostur',     atkBase: 3, icon: '🪄' },
];

const ARMOR_BASES = [
    { name: 'Skórzana Zbroja',  defBase: 2, icon: '🥋' },
    { name: 'Kolczuga',         defBase: 3, icon: '🛡️' },
    { name: 'Zbroja Płytowa',   defBase: 5, icon: '⛓️' },
    { name: 'Szata Magiczna',   defBase: 2, icon: '🧥' },
    { name: 'Tarcza',           defBase: 4, icon: '🛡️' },
];

function generateWeapon(level, forceTier) {
    const tier = forceTier || rollTier();
    const base = WEAPON_BASES[Math.floor(Math.random() * WEAPON_BASES.length)];
    const mult = TIERS[tier].mult;
    const atk = Math.floor((base.atkBase + level * 2) * mult);
    const prefixes = { normal: '', uncommon: 'Dobry ', rare: 'Wyborny ', epic: 'Doskonały ', legendary: 'Legendarny ', mythic: 'Mityczny ' };
    return {
        id: `weapon_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
        name: prefixes[tier] + base.name,
        type: 'weapon', tier, atk,
        desc: `ATK +${atk}`,
        icon: base.icon,
        price: Math.floor(20 * mult * (1 + level * 0.5)),
    };
}

function generateArmor(level, forceTier) {
    const tier = forceTier || rollTier();
    const base = ARMOR_BASES[Math.floor(Math.random() * ARMOR_BASES.length)];
    const mult = TIERS[tier].mult;
    const def = Math.floor((base.defBase + level * 1.5) * mult);
    const prefixes = { normal: '', uncommon: 'Dobra ', rare: 'Wyborna ', epic: 'Doskonała ', legendary: 'Legendarna ', mythic: 'Mityczna ' };
    return {
        id: `armor_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
        name: prefixes[tier] + base.name,
        type: 'armor', tier, def,
        desc: `DEF +${def}`,
        icon: base.icon,
        price: Math.floor(25 * mult * (1 + level * 0.5)),
    };
}

function generatePotion(level) {
    const heal = 15 + level * 8;
    const r = Math.random();
    if (r < 0.6) return { id: 'potion', name: 'Mikstura HP', type: 'consumable', heal, count: 1, price: 8 + level * 2, desc: `Leczy ${heal} HP`, icon: '🧪' };
    if (r < 0.85) return { id: 'big_potion', name: 'Duża Mikstura', type: 'consumable', heal: heal * 3, count: 1, price: 25 + level * 5, desc: `Leczy ${heal*3} HP`, icon: '🧪' };
    return { id: 'full_potion', name: 'Pełna Mikstura', type: 'consumable', heal: 99999, count: 1, price: 60 + level * 10, desc: 'Pełne HP', icon: '🧪' };
}

// ========== MAIN GAME ==========
const Game = {
    canvas: null, ctx: null,
    miniCanvas: null, miniCtx: null,
    TILE: 32,
    running: false, lastTime: 0,
    animFrame: 0, animTimer: 0,
    isMobile: false,
    canvasW: 640, canvasH: 480,

    // ========== PLAYER ==========
    player: {
        x: 0, y: 0,
        level: 1, xp: 0, xpNext: 30,
        hp: 50, maxHp: 50,
        baseAtk: 5, baseDef: 2,
        gold: 20,
        inventory: [],
        weapon: { id: 'starter_sword', name: 'Drewniany Miecz', type: 'weapon', tier: 'normal', atk: 2, desc: 'ATK +2', icon: '🗡️', price: 5 },
        armor: { id: 'starter_armor', name: 'Skórzana Zbroja', type: 'armor', tier: 'normal', def: 1, desc: 'DEF +1', icon: '🥋', price: 5 },
        facing: 'down',
        moveTimer: 0,
        kills: 0,
        stepCount: 0,
        skillPoints: 0,
        skills: { might: 0, armor: 0, vitality: 0, luck: 0, crit: 0, haggle: 0 },
        quests: [],
        lastVillageWellX: 0,
        lastVillageWellY: 0,
    },

    // Computed stats with skills
    getAtk() {
        const p = this.player;
        const skillBonus = SKILL_TREE.might.effect(p.skills.might).atk || 0;
        return p.baseAtk + p.weapon.atk + skillBonus;
    },
    getDef() {
        const p = this.player;
        const skillBonus = SKILL_TREE.armor.effect(p.skills.armor).def || 0;
        return p.baseDef + p.armor.def + skillBonus;
    },
    getMaxHp() {
        const p = this.player;
        const skillBonus = SKILL_TREE.vitality.effect(p.skills.vitality).maxHp || 0;
        return p.maxHp + skillBonus;
    },
    getLuck() {
        return this.player.skills.luck || 0;
    },
    getCritChance() {
        return (this.player.skills.crit || 0) * 3;
    },
    getHaggle() {
        return (this.player.skills.haggle || 0) * 5;
    },

    // ========== MONSTERS ==========
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
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); this.toggleFullscreen(); }, { passive: false });
        document.addEventListener('fullscreenchange', () => this.onFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.onFullscreenChange());
    },

    toggleFullscreen() {
        const doc = document.documentElement;
        const isFS = document.fullscreenElement || document.webkitFullscreenElement;
        if (!isFS) {
            const request = doc.requestFullscreen || doc.webkitRequestFullscreen;
            if (request) request.call(doc);
            if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {});
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
                container.style.width = w + 'px';
                container.style.height = (window.innerHeight - 140) + 'px';
            } else {
                const h = window.innerHeight - 200;
                container.style.width = w + 'px';
                container.style.height = Math.min(h, w * 0.75) + 'px';
            }
        }
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
            if (e.key.toLowerCase() === 'k' && !this.isAnyOverlayOpen()) { this.openSkillTree(); return; }
            if (e.key.toLowerCase() === 'j' && !this.isAnyOverlayOpen()) { this.openQuestLog(); return; }
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

        document.querySelector('.dpad-center').addEventListener('touchstart', (e) => {
            e.preventDefault(); this.interact();
        }, { passive: false });

        document.getElementById('mobile-interact').addEventListener('touchstart', (e) => {
            e.preventDefault(); this.interact();
        }, { passive: false });

        document.getElementById('mobile-inventory').addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.isAnyOverlayOpen()) this.closeAllOverlays();
            else this.openInventory();
        }, { passive: false });

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
        // Give starter items
        this.player.inventory = [
            { id: 'potion', name: 'Mikstura HP', desc: 'Leczy 20 HP', type: 'consumable', heal: 20, count: 3, price: 10, icon: '🧪' }
        ];
        document.getElementById('title-screen').style.display = 'none';
        this.running = true;
        this.log('Witaj w świecie Pixel Quest!', 'info');
        this.log('Eksploruj, walcz i handluj. Świat jest nieskończony!', 'info');
        this.log(this.isMobile ? 'Użyj D-pad do ruchu, ACT by rozmawiać.' : 'WASD=ruch, SPACJA=interakcja, I=ekwipunek, K=umiejętności, J=questy', 'info');
        this.gameLoop(0);
    },

    loadGame() {
        const save = localStorage.getItem('pq_save_v3');
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
        localStorage.setItem('pq_save_v3', JSON.stringify(data));
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

            // Track village visits for respawn
            const cx = Math.floor(nx / World.CHUNK_SIZE);
            const cy = Math.floor(ny / World.CHUNK_SIZE);
            const vKey = World.getChunkKey(cx, cy);
            if (World.villages[vKey]) {
                this.player.lastVillageWellX = World.villages[vKey].wellX;
                this.player.lastVillageWellY = World.villages[vKey].wellY;
            }

            // Check for collect quest items (random chance in wilderness)
            this.checkCollectQuests(nx, ny);

            // Random encounter
            const chance = World.getEncounterChance(nx, ny);
            if (chance > 0 && Math.random() < chance) {
                this.startCombat();
            }

            if (this.player.stepCount % 30 === 0) {
                this.saveGame();
                World.cleanupChunks(this.player.x, this.player.y);
            }
        }
    },

    checkCollectQuests(wx, wy) {
        const tile = World.getTile(wx, wy);
        const T = World.T;
        if ([T.PATH, T.STONE_FLOOR, T.BRIDGE, T.SHOP_FLOOR].includes(tile)) return;

        this.player.quests.forEach(q => {
            if (q.type === 'collect' && !q.completed && !q.turned_in) {
                // Small chance to find quest item while exploring
                if (Math.random() < 0.06) {
                    q.progress = Math.min(q.progress + 1, q.required);
                    this.log(`Znaleziono ${q.itemName}! (${q.progress}/${q.required})`, 'loot');
                    if (q.progress >= q.required) {
                        q.completed = true;
                        this.log(`Quest "${q.title}" ukończony! Wróć do zleceniodawcy.`, 'info');
                    }
                }
            }
        });
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
            case T.SHOP_WEAPON:
            case T.SHOP_ARMOR:
            case T.SHOP_POTION: {
                const types = { [T.SHOP_WEAPON]: 'weapon', [T.SHOP_ARMOR]: 'armor', [T.SHOP_POTION]: 'potion' };
                this.openShop(types[tile], diff);
                break;
            }
            case T.NPC_SHOPKEEPER: {
                const npcKey = `${tx},${ty}`;
                const npc = World.npcs[npcKey];
                if (npc && npc.type === 'shop') {
                    this.openShop(npc.shopType, npc.difficulty);
                }
                break;
            }
            case T.INN: {
                const cost = Math.max(5, diff * 3);
                if (this.player.gold >= cost) {
                    this.player.gold -= cost;
                    this.player.hp = this.getMaxHp();
                    this.log(`Odpoczywasz w gospodzie. HP pełne! (-${cost} Zł)`, 'heal');
                    this.saveGame();
                } else {
                    this.log(`Nie stać cię na nocleg! (${cost} Zł)`, 'combat');
                }
                break;
            }
            case T.SIGN: {
                const key = `${tx},${ty}`;
                if (World.signTexts[key]) {
                    this.showDialog('Tablica', World.signTexts[key].replace(/\n/g, '<br>'));
                }
                break;
            }
            case T.CHEST: this.openChest(tx, ty); break;
            case T.WELL: {
                const maxHp = this.getMaxHp();
                if (this.player.hp < maxHp) {
                    const heal = Math.min(10, maxHp - this.player.hp);
                    this.player.hp += heal;
                    this.log(`Pijesz ze studni. +${heal} HP`, 'heal');
                } else {
                    this.log('Woda ze studni jest orzeźwiająca!', 'info');
                }
                break;
            }
            case T.CAVE_ENTRY: {
                this.log('Wchodzisz do mrocznej jaskini...', 'info');
                if (Math.random() < 0.5) this.startCombat();
                break;
            }
            case T.NPC_QUEST:
            case T.NPC_QUEST2: {
                const qKey = `${tx},${ty}`;
                const questData = World.questNpcs[qKey];
                if (questData) this.interactQuestNpc(questData, qKey);
                break;
            }
        }
    },

    // ============================================================
    // QUEST NPC INTERACTION
    // ============================================================
    interactQuestNpc(questData, npcKey) {
        const existing = this.player.quests.find(q => q.id === questData.id);

        if (existing && existing.completed && !existing.turned_in) {
            // Turn in quest
            existing.turned_in = true;
            this.player.gold += existing.reward.gold;
            this.player.xp += existing.reward.xp;
            this.log(`Quest ukończony! +${existing.reward.gold} Zł, +${existing.reward.xp} XP`, 'loot');
            this.checkLevelUp();
            this.saveGame();

            this.showDialog('Quest Ukończony!',
                `<div style="font-size:9px;line-height:1.8;padding:6px;">
                    <div style="color:#2ecc71;margin-bottom:8px;">Doskonała robota!</div>
                    <div>Nagroda: <span style="color:#f1c40f">${existing.reward.gold} Zł</span>, <span style="color:#3498db">${existing.reward.xp} XP</span></div>
                </div>`);
            return;
        }

        if (existing && !existing.completed) {
            // Show progress
            const pct = Math.floor((existing.progress / existing.required) * 100);
            this.showDialog(existing.title,
                `<div style="font-size:9px;line-height:1.8;padding:6px;">
                    <div style="margin-bottom:8px;">${existing.desc}</div>
                    <div>Postęp: <span style="color:#f1c40f">${existing.progress}/${existing.required}</span> (${pct}%)</div>
                    <div style="background:#222;border-radius:4px;height:8px;margin-top:6px;overflow:hidden;">
                        <div style="background:#e67e22;height:100%;width:${pct}%"></div>
                    </div>
                </div>`);
            return;
        }

        if (existing && existing.turned_in) {
            this.showDialog('NPC', `<div style="font-size:9px;line-height:1.8;padding:6px;color:#888;">Dziękuję za pomoc! Nie mam teraz więcej zadań.</div>`);
            return;
        }

        // Offer new quest
        const q = questData;
        this.showDialog(q.title,
            `<div style="font-size:9px;line-height:1.8;padding:6px;">
                <div style="margin-bottom:8px;">${q.desc}</div>
                <div>Nagroda: <span style="color:#f1c40f">${q.reward.gold} Zł</span>, <span style="color:#3498db">${q.reward.xp} XP</span></div>
                <button class="close-btn" onclick="Game.acceptQuest('${q.id}')" style="background:#27ae60;margin-top:10px;">Przyjmij Quest</button>
            </div>`);
    },

    acceptQuest(questId) {
        // Find quest data in world
        for (const key in World.questNpcs) {
            const q = World.questNpcs[key];
            if (q.id === questId && !this.player.quests.find(pq => pq.id === questId)) {
                this.player.quests.push({ ...q });
                this.log(`Nowy quest: ${q.title}`, 'info');
                this.closeAllOverlays();
                this.saveGame();
                return;
            }
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
            // Chance for equipment drop from chest
            if (Math.random() < 0.3) {
                const item = Math.random() < 0.5 ? generateWeapon(diff) : generateArmor(diff);
                this.addToInventory(item);
                this.log(`Znaleziono: <span style="color:${tierColor(item.tier)}">${item.name}</span>!`, 'loot');
            }
        }
        this.saveGame();
    },

    // ============================================================
    // SHOPS (improved with NPC, tiered items, area-scaled)
    // ============================================================
    getShopItems(type, difficulty) {
        const haggle = this.getHaggle();
        const priceDiscount = (100 - haggle) / 100;

        if (type === 'weapon') {
            return TIER_ORDER.slice(0, Math.min(3 + Math.floor(difficulty / 3), 6)).map(tier => {
                const w = generateWeapon(difficulty, tier);
                w.price = Math.floor(w.price * priceDiscount);
                return w;
            });
        } else if (type === 'armor') {
            return TIER_ORDER.slice(0, Math.min(3 + Math.floor(difficulty / 3), 6)).map(tier => {
                const a = generateArmor(difficulty, tier);
                a.price = Math.floor(a.price * priceDiscount);
                return a;
            });
        } else {
            const healBase = 15 + Math.floor(difficulty / 2) * 10;
            return [
                { id: 'potion', name: 'Mikstura HP', desc: `Leczy ${healBase} HP`, type: 'consumable', heal: healBase, price: Math.floor(8 * (1 + difficulty * 0.3) * priceDiscount), icon: '🧪' },
                { id: 'big_potion', name: 'Duża Mikstura', desc: `Leczy ${healBase * 3} HP`, type: 'consumable', heal: healBase * 3, price: Math.floor(25 * (1 + difficulty * 0.3) * priceDiscount), icon: '🧪' },
                { id: 'full_potion', name: 'Pełna Mikstura', desc: 'Pełne HP', type: 'consumable', heal: 99999, price: Math.floor(70 * (1 + difficulty * 0.3) * priceDiscount), icon: '🧪' },
            ];
        }
    },

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
            const tColor = item.tier ? tierColor(item.tier) : '#aaa';
            const tName = item.tier ? tierName(item.tier) : '';

            if (item.type === 'weapon') {
                const diff = item.atk - this.player.weapon.atk;
                if (diff > 0) compare = `<span class="stat-up">+${diff} ATK</span>`;
                else if (diff < 0) compare = `<span class="stat-down">${diff} ATK</span>`;
                else compare = '<span style="color:#888">=</span>';
            } else if (item.type === 'armor') {
                const diff = item.def - this.player.armor.def;
                if (diff > 0) compare = `<span class="stat-up">+${diff} DEF</span>`;
                else if (diff < 0) compare = `<span class="stat-down">${diff} DEF</span>`;
                else compare = '<span style="color:#888">=</span>';
            }

            const tierBadge = tName ? `<span style="color:${tColor};font-size:6px;"> [${tName}]</span>` : '';

            html += `<div class="shop-item ${canAfford ? '' : 'cannot-afford'}" onclick="Game.buyItem('${type}',${difficulty},${i})">
                <div>
                    <div class="item-name" style="color:${tColor}">${item.icon || ''} ${item.name}${tierBadge}</div>
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
            sellables.forEach((item) => {
                const sellPrice = Math.floor(item.price * 0.5);
                const origIdx = this.player.inventory.indexOf(item);
                const tColor = item.tier ? tierColor(item.tier) : '#aaa';
                html += `<div class="shop-item" onclick="Game.sellItem(${origIdx})" style="border-left:2px solid #e67e22">
                    <div><span class="item-name" style="color:${tColor}">${item.icon || ''} ${item.name} ${item.count ? 'x'+item.count : ''}</span></div>
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
            // Put old weapon in inventory
            if (this.player.weapon.id !== 'starter_sword') {
                this.addToInventory({ ...this.player.weapon, count: 1 });
            }
            this.player.weapon = { ...item };
            this.log(`Wyposażono: ${item.name}!`, 'shop');
        } else if (item.type === 'armor') {
            if (this.player.armor.id !== 'starter_armor') {
                this.addToInventory({ ...this.player.armor, count: 1 });
            }
            this.player.armor = { ...item };
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
        if (item.count && item.count > 1) {
            item.count--;
        } else {
            this.player.inventory.splice(index, 1);
        }
        this.log(`Sprzedano ${item.name}. +${sellPrice} Zł`, 'shop');
        const diff = World.getDifficulty(this.player.x, this.player.y);
        this.openShop('potion', diff);
    },

    // ============================================================
    // INVENTORY (improved with equipment slots and tiers)
    // ============================================================
    addToInventory(item) {
        if (item.type === 'consumable') {
            const existing = this.player.inventory.find(i => i.id === item.id);
            if (existing) { existing.count += (item.count || 1); }
            else { this.player.inventory.push({ ...item, count: item.count || 1 }); }
        } else {
            // Equipment items are unique
            this.player.inventory.push({ ...item, count: 1 });
        }
    },

    openInventory() {
        const overlay = document.getElementById('inventory-overlay');
        const content = document.getElementById('inventory-content');
        const p = this.player;

        let html = '<div style="font-size:8px;color:#f1c40f;margin-bottom:6px;">WYPOSAŻENIE</div>';
        html += `<div class="inv-item equipped"><span style="color:${tierColor(p.weapon.tier)}">${p.weapon.icon||'⚔️'} ${p.weapon.name} (ATK +${p.weapon.atk}) <span style="font-size:6px">[${tierName(p.weapon.tier)}]</span></span></div>`;
        html += `<div class="inv-item equipped"><span style="color:${tierColor(p.armor.tier)}">${p.armor.icon||'🛡️'} ${p.armor.name} (DEF +${p.armor.def}) <span style="font-size:6px">[${tierName(p.armor.tier)}]</span></span></div>`;
        html += '<hr style="border-color:#333;margin:6px 0">';
        html += '<div style="font-size:8px;color:#3498db;margin-bottom:6px;">PLECAK</div>';

        if (p.inventory.length === 0) {
            html += '<div style="text-align:center;color:#555;font-size:8px;padding:12px;">Plecak pusty</div>';
        }
        p.inventory.forEach((item, i) => {
            const tColor = item.tier ? tierColor(item.tier) : '#aaa';
            let actionBtn = '';
            if (item.type === 'consumable') {
                actionBtn = `<button class="use-btn" onclick="Game.useItem(${i})">Użyj</button>`;
            } else if (item.type === 'weapon' || item.type === 'armor') {
                actionBtn = `<button class="use-btn" onclick="Game.equipItem(${i})" style="background:#e67e22">Załóż</button>`;
            }
            html += `<div class="inv-item">
                <span style="color:${tColor}">${item.icon||''} ${item.name} ${item.count > 1 ? 'x'+item.count : ''} <span style="font-size:6px;color:${tColor}">${item.tier ? '['+tierName(item.tier)+']' : ''}</span></span>
                ${actionBtn}
            </div>`;
        });

        content.innerHTML = html;
        overlay.classList.add('active');
    },

    equipItem(index) {
        const item = this.player.inventory[index];
        if (!item) return;
        if (item.type === 'weapon') {
            // Swap
            const old = { ...this.player.weapon };
            this.player.weapon = { ...item };
            this.player.inventory.splice(index, 1);
            if (old.id !== 'starter_sword') this.addToInventory(old);
            this.log(`Wyposażono: ${item.name}!`, 'shop');
        } else if (item.type === 'armor') {
            const old = { ...this.player.armor };
            this.player.armor = { ...item };
            this.player.inventory.splice(index, 1);
            if (old.id !== 'starter_armor') this.addToInventory(old);
            this.log(`Wyposażono: ${item.name}!`, 'shop');
        }
        this.openInventory();
        this.saveGame();
    },

    useItem(index) {
        const item = this.player.inventory[index];
        if (!item) return;
        if (item.type === 'consumable' && item.heal) {
            const maxHp = this.getMaxHp();
            const healed = Math.min(item.heal, maxHp - this.player.hp);
            this.player.hp = Math.min(this.player.hp + item.heal, maxHp);
            this.log(`Użyto ${item.name}. +${healed} HP`, 'heal');
            item.count--;
            if (item.count <= 0) this.player.inventory.splice(index, 1);
        }
        this.openInventory();
    },

    // ============================================================
    // SKILL TREE
    // ============================================================
    openSkillTree() {
        const overlay = document.getElementById('inventory-overlay');
        const content = document.getElementById('inventory-content');
        document.querySelector('#inventory-overlay h2').textContent = 'Drzewko Umiejętności';

        let html = `<div style="font-size:8px;color:#f1c40f;margin-bottom:8px;text-align:center">Punkty: ${this.player.skillPoints}</div>`;

        for (const [key, skill] of Object.entries(SKILL_TREE)) {
            const lv = this.player.skills[key] || 0;
            const canUpgrade = this.player.skillPoints > 0 && lv < skill.maxLevel;
            const barWidth = (lv / skill.maxLevel) * 100;

            html += `<div class="inv-item" style="flex-direction:column;align-items:stretch;padding:8px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span>${skill.icon} ${skill.name} (${lv}/${skill.maxLevel})</span>
                    ${canUpgrade ? `<button class="use-btn" onclick="Game.upgradeSkill('${key}')" style="background:#27ae60">+1</button>` : ''}
                </div>
                <div style="font-size:7px;color:#888;margin-top:2px;">${skill.desc}</div>
                <div style="background:#222;border-radius:3px;height:4px;margin-top:4px;overflow:hidden;">
                    <div style="background:#e67e22;height:100%;width:${barWidth}%"></div>
                </div>
            </div>`;
        }

        content.innerHTML = html;
        overlay.classList.add('active');
    },

    upgradeSkill(key) {
        if (this.player.skillPoints <= 0) return;
        const skill = SKILL_TREE[key];
        if (!skill) return;
        if (this.player.skills[key] >= skill.maxLevel) return;
        this.player.skills[key]++;
        this.player.skillPoints--;
        this.log(`${skill.name} ulepszone do poziomu ${this.player.skills[key]}!`, 'info');
        this.openSkillTree();
        this.saveGame();
    },

    // ============================================================
    // QUEST LOG
    // ============================================================
    openQuestLog() {
        const overlay = document.getElementById('inventory-overlay');
        const content = document.getElementById('inventory-content');
        document.querySelector('#inventory-overlay h2').textContent = 'Dziennik Questów';

        const activeQuests = this.player.quests.filter(q => !q.turned_in);
        let html = '';

        if (activeQuests.length === 0) {
            html = '<div style="text-align:center;color:#555;font-size:8px;padding:20px;">Brak aktywnych questów.<br>Rozmawiaj z NPC w miastach!</div>';
        }

        activeQuests.forEach((q, idx) => {
            const pct = Math.floor((q.progress / q.required) * 100);
            const statusColor = q.completed ? '#2ecc71' : '#e67e22';
            const statusText = q.completed ? 'UKOŃCZONY - wróć do NPC' : `${q.progress}/${q.required}`;
            const isTracked = this.trackedQuestIdx === idx;

            html += `<div class="inv-item" style="flex-direction:column;align-items:stretch;padding:8px;border-left:3px solid ${statusColor}">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="color:#fff;font-size:8px;">${q.title}</span>
                    <button class="use-btn" onclick="Game.trackQuest(${idx})" style="background:${isTracked ? '#e67e22' : '#555'};font-size:6px;">
                        ${isTracked ? 'Śledzony' : 'Śledź'}
                    </button>
                </div>
                <div style="font-size:7px;color:#888;margin-top:2px;">${q.villageName} - ${q.desc.substring(0, 60)}...</div>
                <div style="font-size:7px;color:${statusColor};margin-top:2px;">${statusText}</div>
                <div style="background:#222;border-radius:3px;height:4px;margin-top:4px;overflow:hidden;">
                    <div style="background:${statusColor};height:100%;width:${pct}%"></div>
                </div>
            </div>`;
        });

        content.innerHTML = html;
        overlay.classList.add('active');
    },

    trackedQuestIdx: -1,

    trackQuest(idx) {
        this.trackedQuestIdx = this.trackedQuestIdx === idx ? -1 : idx;
        this.openQuestLog();
    },

    // ============================================================
    // COMBAT (with loot drops)
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

            const scale = 1 + (diff - 1) * 0.4;
            const isElite = Math.random() < 0.08;
            const eliteMult = isElite ? 2.5 : 1;

            this.enemy = {
                name: (isElite ? '★ ' : '') + def.name,
                baseName: def.name,
                emoji: def.emoji,
                hp: Math.floor(def.hp * scale * eliteMult),
                maxHp: Math.floor(def.hp * scale * eliteMult),
                atk: Math.floor(def.atk * scale * eliteMult),
                def: Math.floor(def.def * scale),
                xp: Math.floor(def.xp * scale * eliteMult),
                gold: [Math.floor(def.gold[0] * scale * eliteMult), Math.floor(def.gold[1] * scale * eliteMult)],
                level: diff,
                isElite,
                area,
            };
            this.active = true;

            document.getElementById('combat-overlay').classList.add('active');
            document.getElementById('enemy-display').textContent = this.enemy.emoji;
            document.getElementById('enemy-name').textContent = `${this.enemy.name} (Lv.${diff})`;
            document.getElementById('combat-log').innerHTML = '';
            this.updateEnemyHP();

            Game.log(`Napotkano: ${this.enemy.name}!`, 'combat');

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
            const base = Math.max(1, atk - def + Math.floor(Math.random() * 3) - 1);
            // Crit check
            if (Math.random() * 100 < Game.getCritChance()) {
                this.combatLog('<span style="color:#f1c40f">KRYTYK!</span>');
                return Math.floor(base * 2);
            }
            return base;
        },

        doAttack() {
            if (!this.active) return;
            const totalAtk = Game.getAtk();
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
            const totalAtk = Game.getAtk();
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
            const maxHp = Game.getMaxHp();
            const healed = Math.min(potion.heal, maxHp - Game.player.hp);
            Game.player.hp = Math.min(Game.player.hp + potion.heal, maxHp);
            potion.count--;
            if (potion.count <= 0) Game.player.inventory = Game.player.inventory.filter(i => i.count > 0 || !i.count);
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
            const totalDef = Game.getDef();
            const dmg = Math.max(1, this.enemy.atk - totalDef + Math.floor(Math.random() * 3) - 1);
            Game.player.hp -= dmg;
            this.combatLog(`${this.enemy.name} zadaje ${dmg} obrażeń!`);
            if (Game.player.hp <= 0) this.defeat();
        },

        victory() {
            const enemy = this.enemy;
            const gold = enemy.gold[0] + Math.floor(Math.random() * (enemy.gold[1] - enemy.gold[0] + 1));
            Game.player.gold += gold;
            Game.player.xp += enemy.xp;
            Game.player.kills++;

            Game.log(`Pokonano ${enemy.name}! +${enemy.xp} XP, +${gold} Zł`, 'loot');

            // === LOOT DROPS ===
            const luck = Game.getLuck();
            const dropChance = 0.15 + luck * 0.03 + (enemy.isElite ? 0.3 : 0);

            if (Math.random() < dropChance) {
                const r = Math.random();
                let loot;
                if (r < 0.4) {
                    loot = generatePotion(enemy.level);
                } else if (r < 0.7) {
                    loot = generateWeapon(enemy.level);
                } else {
                    loot = generateArmor(enemy.level);
                }
                Game.addToInventory(loot);
                const colorStyle = loot.tier ? `style="color:${tierColor(loot.tier)}"` : '';
                Game.log(`Loot: <span ${colorStyle}>${loot.icon||''} ${loot.name}</span>!`, 'loot');
            }

            // === QUEST PROGRESS (kill quests) ===
            Game.player.quests.forEach(q => {
                if (q.type === 'kill' && !q.completed && !q.turned_in && q.target === enemy.baseName) {
                    q.progress = Math.min(q.progress + 1, q.required);
                    Game.log(`Quest: ${q.target} (${q.progress}/${q.required})`, 'info');
                    if (q.progress >= q.required) {
                        q.completed = true;
                        Game.log(`Quest "${q.title}" ukończony! Wróć do zleceniodawcy.`, 'info');
                    }
                }
            });

            Game.checkLevelUp();
            setTimeout(() => this.endCombat(), 600);
            Game.saveGame();
        },

        defeat() {
            const lostGold = Math.floor(Game.player.gold * 0.15);
            const maxHp = Game.getMaxHp();
            Game.player.hp = Math.floor(maxHp * 0.3);
            Game.player.gold = Math.max(0, Game.player.gold - lostGold);

            // Respawn at last visited village well
            if (Game.player.lastVillageWellX || Game.player.lastVillageWellY) {
                Game.player.x = Game.player.lastVillageWellX;
                Game.player.y = Game.player.lastVillageWellY;
                Game.log(`Poległeś! Stracono ${lostGold} Zł. Odradzasz się przy studni.`, 'combat');
            } else {
                Game.player.x = 0;
                Game.player.y = 0;
                Game.log(`Poległeś! Stracono ${lostGold} Zł. Wracasz do spawnu.`, 'combat');
            }

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

    checkLevelUp() {
        while (this.player.xp >= this.player.xpNext) {
            this.player.xp -= this.player.xpNext;
            this.player.level++;
            this.player.xpNext = Math.floor(this.player.xpNext * 1.4);
            this.player.maxHp += 6 + Math.floor(this.player.level * 0.5);
            this.player.hp = this.getMaxHp();
            this.player.baseAtk += 1 + Math.floor(this.player.level / 5);
            this.player.baseDef += 1;
            this.player.skillPoints += 1;
            this.log(`LEVEL UP! Poziom ${this.player.level}! +1 punkt umiejętności`, 'loot');

            const text = document.createElement('div');
            text.className = 'float-text';
            text.textContent = `LEVEL ${this.player.level}!`;
            text.style.left = '50%'; text.style.top = '40%';
            text.style.color = '#f1c40f';
            document.getElementById('game-container').appendChild(text);
            setTimeout(() => text.remove(), 1500);
        }
    },

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
        // Reset inventory overlay title
        const invH2 = document.querySelector('#inventory-overlay h2');
        if (invH2) invH2.textContent = 'Ekwipunek';
    },

    isAnyOverlayOpen() {
        return document.querySelector('.overlay.active') !== null;
    },

    log(msg, type = 'info') {
        const log = document.getElementById('message-log');
        const div = document.createElement('div');
        div.className = `msg-${type}`;
        div.innerHTML = `> ${msg}`;
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

                let key = null;
                const v = ((wx + wy) & 3);

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
                    case TT.NPC_QUEST: key = 'npc_quest'; break;
                    case TT.NPC_QUEST2: key = 'npc_quest2'; break;
                    case TT.NPC_SHOPKEEPER: key = 'npc_shopkeeper'; break;
                    case TT.SHOP_COUNTER: key = 'shop_counter'; break;
                    case TT.SHOP_FLOOR: key = 'shop_floor'; break;
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
    // MINIMAP (with quest direction arrow)
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
                else if (tile === TT.STONE_FLOOR || tile === TT.SHOP_FLOOR) color = '#909090';
                else if (tile === TT.CHEST) color = '#daa520';
                else if (tile === TT.SWAMP) color = '#3a5a3a';
                else if (tile === TT.MOUNTAIN) color = '#808080';
                else if (tile === TT.DESERT) color = '#d4b86a';
                else if (tile === TT.CACTUS) color = '#2d8a4e';
                else if (tile === TT.NPC_QUEST || tile === TT.NPC_QUEST2) color = '#f1c40f';
                else if (tile === TT.NPC_SHOPKEEPER) color = '#e67e22';
                else if (tile === TT.WELL) color = '#3498db';

                ctx.fillStyle = color;
                ctx.fillRect((dx + halfW) * scale, (dy + halfH) * scale, scale, scale);
            }
        }

        // Player dot
        ctx.fillStyle = this.animFrame % 2 === 0 ? '#fff' : '#e74c3c';
        ctx.fillRect(halfW * scale - 1, halfH * scale - 1, 3, 3);

        // Quest direction arrow
        const activeQuests = this.player.quests.filter(q => !q.turned_in);
        const trackedIdx = this.trackedQuestIdx;
        if (trackedIdx >= 0 && trackedIdx < activeQuests.length) {
            const q = activeQuests[trackedIdx];
            let targetX, targetY;

            if (q.completed) {
                // Point back to quest NPC (village)
                // Find the NPC position
                for (const key in World.questNpcs) {
                    if (World.questNpcs[key].id === q.id) {
                        const [nx, ny] = key.split(',').map(Number);
                        targetX = nx;
                        targetY = ny;
                        break;
                    }
                }
            } else if (q.type === 'collect' && q.targetX !== undefined) {
                targetX = q.targetX;
                targetY = q.targetY;
            } else if (q.type === 'kill') {
                // Point to nearest wilderness in correct biome
                const angle = Math.atan2(1, 1);
                targetX = this.player.x + Math.cos(angle) * 30;
                targetY = this.player.y + Math.sin(angle) * 30;
            }

            if (targetX !== undefined && targetY !== undefined) {
                const adx = targetX - this.player.x;
                const ady = targetY - this.player.y;
                const dist = Math.sqrt(adx * adx + ady * ady);

                if (dist > 3) {
                    const angle = Math.atan2(ady, adx);
                    const arrowDist = Math.min(18, halfW - 3);
                    const ax = halfW * scale + Math.cos(angle) * arrowDist;
                    const ay = halfH * scale + Math.sin(angle) * arrowDist;

                    // Draw arrow
                    ctx.fillStyle = '#f1c40f';
                    ctx.beginPath();
                    ctx.arc(ax, ay, 3, 0, Math.PI * 2);
                    ctx.fill();

                    // Arrow head
                    ctx.strokeStyle = '#f1c40f';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(ax - Math.cos(angle) * 4, ay - Math.sin(angle) * 4);
                    ctx.lineTo(ax, ay);
                    ctx.stroke();
                }
            }
        }
    },

    // ============================================================
    // UI UPDATE
    // ============================================================
    updateUI() {
        const p = this.player;
        const maxHp = this.getMaxHp();
        document.getElementById('stat-level').textContent = p.level;
        document.getElementById('stat-hp').textContent = `${Math.max(0,p.hp)}/${maxHp}`;
        document.getElementById('hp-bar').style.width = `${Math.max(0,(p.hp/maxHp)*100)}%`;
        document.getElementById('xp-bar').style.width = `${(p.xp/p.xpNext)*100}%`;
        document.getElementById('stat-gold').textContent = p.gold;
        document.getElementById('stat-atk').textContent = this.getAtk();
        document.getElementById('stat-def').textContent = this.getDef();

        // Skill points indicator
        const spEl = document.getElementById('stat-sp');
        if (spEl) spEl.textContent = p.skillPoints > 0 ? `SP:${p.skillPoints}` : '';

        // Quest indicator
        const qEl = document.getElementById('stat-quests');
        const activeQ = p.quests.filter(q => !q.turned_in).length;
        if (qEl) qEl.textContent = activeQ > 0 ? `Q:${activeQ}` : '';
    },
};

// ============================================================
// BOOT
// ============================================================
window.addEventListener('load', () => Game.init());
