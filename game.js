// ============================================================
// PIXEL QUEST - 16-bit RPG Game Engine
// ============================================================

const Game = {
    canvas: null,
    ctx: null,
    miniCanvas: null,
    miniCtx: null,
    TILE: 32,
    MAP_W: 40,
    MAP_H: 30,
    viewX: 0,
    viewY: 0,
    running: false,
    lastTime: 0,
    animFrame: 0,
    animTimer: 0,

    // ========== PLAYER ==========
    player: {
        x: 18, y: 14,  // grid position (town center)
        level: 1,
        xp: 0,
        xpNext: 30,
        hp: 50, maxHp: 50,
        atk: 5, def: 2,
        gold: 20,
        inventory: [
            { id: 'potion', name: 'Mikstura HP', desc: 'Leczy 20 HP', type: 'consumable', heal: 20, count: 3, price: 10 }
        ],
        weapon: { name: 'Drewniany Miecz', atk: 2 },
        armor: { name: 'Skórzana Zbroja', def: 1 },
        facing: 'down',
        moveTimer: 0,
        kills: 0,
    },

    // ========== TILE TYPES ==========
    tiles: {
        GRASS: 0,
        PATH: 1,
        WATER: 2,
        WALL: 3,
        TREE: 4,
        HOUSE: 5,
        DOOR: 6,
        SHOP_WEAPON: 7,
        SHOP_ARMOR: 8,
        SHOP_POTION: 9,
        INN: 10,
        BRIDGE: 11,
        DARK_GRASS: 12,
        CAVE_FLOOR: 13,
        CAVE_WALL: 14,
        CAVE_ENTRY: 15,
        FOREST_ENTRY: 16,
        FLOWER: 17,
        SIGN: 18,
        CHEST: 19,
        STONE_FLOOR: 20,
        FENCE: 21,
        WELL: 22,
        STATUE: 23,
    },

    // ========== AREAS ==========
    areas: {
        town: { name: 'Miasto Eldoria', monsterChance: 0 },
        forest: { name: 'Mroczny Las', monsterChance: 0.18 },
        dungeon: { name: 'Jaskinia Cieni', monsterChance: 0.25 },
    },

    // ========== MONSTERS ==========
    monsterDefs: {
        forest: [
            { name: 'Goblin', emoji: '👺', hp: 15, atk: 3, def: 1, xp: 8, gold: [3, 8], level: 1 },
            { name: 'Wilk', emoji: '🐺', hp: 20, atk: 5, def: 1, xp: 12, gold: [2, 6], level: 1 },
            { name: 'Ork Zwiadowca', emoji: '👹', hp: 30, atk: 7, def: 2, xp: 18, gold: [5, 12], level: 2 },
            { name: 'Leśny Pająk', emoji: '🕷️', hp: 12, atk: 6, def: 0, xp: 10, gold: [2, 5], level: 1 },
            { name: 'Bandyta', emoji: '🗡️', hp: 25, atk: 6, def: 3, xp: 15, gold: [8, 15], level: 2 },
        ],
        dungeon: [
            { name: 'Szkielet', emoji: '💀', hp: 25, atk: 6, def: 3, xp: 15, gold: [5, 12], level: 2 },
            { name: 'Zombie', emoji: '🧟', hp: 35, atk: 8, def: 2, xp: 20, gold: [6, 14], level: 3 },
            { name: 'Mroczny Mag', emoji: '🧙', hp: 20, atk: 12, def: 1, xp: 25, gold: [10, 20], level: 3 },
            { name: 'Golem', emoji: '🗿', hp: 50, atk: 10, def: 6, xp: 35, gold: [12, 25], level: 4 },
            { name: 'Demon', emoji: '😈', hp: 45, atk: 14, def: 4, xp: 40, gold: [15, 30], level: 5 },
        ]
    },

    // ========== SHOP ITEMS ==========
    shops: {
        weapon: {
            name: 'Kowalnia - Oręż',
            items: [
                { id: 'iron_sword', name: 'Żelazny Miecz', desc: 'ATK +5', type: 'weapon', atk: 5, price: 50 },
                { id: 'steel_sword', name: 'Stalowy Miecz', desc: 'ATK +9', type: 'weapon', atk: 9, price: 150 },
                { id: 'magic_sword', name: 'Magiczny Miecz', desc: 'ATK +15', type: 'weapon', atk: 15, price: 400 },
                { id: 'legend_sword', name: 'Miecz Legendy', desc: 'ATK +25', type: 'weapon', atk: 25, price: 1000 },
            ]
        },
        armor: {
            name: 'Kowalnia - Zbroje',
            items: [
                { id: 'chain_armor', name: 'Kolczuga', desc: 'DEF +4', type: 'armor', def: 4, price: 60 },
                { id: 'plate_armor', name: 'Zbroja Płytowa', desc: 'DEF +8', type: 'armor', def: 8, price: 180 },
                { id: 'magic_armor', name: 'Magiczna Zbroja', desc: 'DEF +13', type: 'armor', def: 13, price: 450 },
                { id: 'legend_armor', name: 'Zbroja Legendy', desc: 'DEF +20', type: 'armor', def: 20, price: 1100 },
            ]
        },
        potion: {
            name: 'Apteka',
            items: [
                { id: 'potion', name: 'Mikstura HP', desc: 'Leczy 20 HP', type: 'consumable', heal: 20, price: 10 },
                { id: 'big_potion', name: 'Duża Mikstura HP', desc: 'Leczy 50 HP', type: 'consumable', heal: 50, price: 30 },
                { id: 'full_potion', name: 'Pełna Mikstura HP', desc: 'Leczy całe HP', type: 'consumable', heal: 9999, price: 80 },
                { id: 'antidote', name: 'Antidotum', desc: 'Leczy status', type: 'consumable', heal: 10, price: 15 },
            ]
        }
    },

    // ========== SIGNS ==========
    signTexts: {},

    // ========== CHESTS ==========
    chests: {},
    openedChests: new Set(),

    // ========== MAP DATA ==========
    mapData: null,

    // ========== SPRITE COLORS ==========
    colors: {
        // Terrain
        grass: ['#4a8c3f', '#5a9c4f', '#4a8c3f', '#3d7a34'],
        darkGrass: ['#2d5a2a', '#356b32', '#2a5227', '#244a22'],
        path: ['#c4a663', '#b89a57', '#d1b36f', '#c4a663'],
        water: ['#2980b9', '#3498db', '#2471a3', '#2980b9'],
        wall: ['#7f8c8d', '#95a5a6', '#6d7b7c', '#7f8c8d'],
        tree_trunk: '#8B4513',
        tree_leaves: ['#27ae60', '#2ecc71', '#1e8449', '#239b56'],
        house_wall: ['#d4a574', '#c69463'],
        house_roof: ['#c0392b', '#e74c3c'],
        door: '#8B4513',
        wood: '#a0522d',
        stone: ['#808080', '#909090', '#707070'],
        caveFloor: ['#4a4a5a', '#3d3d4d', '#555565'],
        caveWall: ['#2a2a3a', '#333345', '#222233'],
        flower: ['#e74c3c', '#f1c40f', '#9b59b6', '#e67e22'],
        fence: '#8B6914',

        // Player
        skin: '#fdbcb4',
        hair: '#5c3317',
        shirt: '#2980b9',
        pants: '#2c3e50',
        boots: '#6d4c1d',

        // UI
        shopSign: '#e67e22',
    },

    // ============================================================
    // INITIALIZATION
    // ============================================================
    init() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.miniCanvas = document.getElementById('minimap');
        this.miniCtx = this.miniCanvas.getContext('2d');

        this.ctx.imageSmoothingEnabled = false;
        this.miniCtx.imageSmoothingEnabled = false;

        this.generateMap();
        this.setupInput();
        this.setupUI();
    },

    // ============================================================
    // MAP GENERATION
    // ============================================================
    generateMap() {
        const T = this.tiles;
        const W = this.MAP_W;
        const H = this.MAP_H;
        this.mapData = new Array(H).fill(null).map(() => new Array(W).fill(T.GRASS));

        // === TOWN (center-left area, roughly cols 10-25, rows 8-22) ===
        // Town paths
        for (let x = 12; x <= 26; x++) { this.mapData[14][x] = T.PATH; this.mapData[15][x] = T.PATH; } // main horizontal road
        for (let y = 8; y <= 22; y++) { this.mapData[y][18] = T.PATH; this.mapData[y][19] = T.PATH; } // main vertical road

        // Town square (center)
        for (let y = 13; y <= 16; y++)
            for (let x = 16; x <= 21; x++)
                this.mapData[y][x] = T.STONE_FLOOR;

        // Well in center
        this.mapData[14][18] = T.WELL;

        // Statue
        this.mapData[13][19] = T.STATUE;

        // Town border - fences
        for (let x = 11; x <= 27; x++) {
            if (this.mapData[7][x] === T.GRASS) this.mapData[7][x] = T.FENCE;
            if (this.mapData[23][x] === T.GRASS) this.mapData[23][x] = T.FENCE;
        }
        for (let y = 7; y <= 23; y++) {
            if (this.mapData[y][11] === T.GRASS) this.mapData[y][11] = T.FENCE;
            if (this.mapData[y][27] === T.GRASS) this.mapData[y][27] = T.FENCE;
        }
        // Town gates
        this.mapData[7][18] = T.PATH; this.mapData[7][19] = T.PATH;  // north gate
        this.mapData[23][18] = T.PATH; this.mapData[23][19] = T.PATH; // south gate
        this.mapData[14][11] = T.PATH; this.mapData[15][11] = T.PATH; // west gate
        this.mapData[14][27] = T.PATH; this.mapData[15][27] = T.PATH; // east gate

        // Houses
        this._placeBuilding(13, 9, 3, 3, T.HOUSE, T.DOOR);   // house 1
        this._placeBuilding(21, 9, 3, 3, T.HOUSE, T.DOOR);   // house 2
        this._placeBuilding(13, 18, 3, 3, T.HOUSE, T.DOOR);  // house 3
        this._placeBuilding(23, 18, 3, 3, T.HOUSE, T.DOOR);  // house 4

        // Shops
        this.mapData[12][14] = T.SHOP_WEAPON; this.mapData[11][14] = T.HOUSE; this.mapData[11][15] = T.HOUSE; this.mapData[12][15] = T.HOUSE;
        this.mapData[12][22] = T.SHOP_ARMOR;  this.mapData[11][22] = T.HOUSE; this.mapData[11][23] = T.HOUSE; this.mapData[12][23] = T.HOUSE;
        this.mapData[17][14] = T.SHOP_POTION; this.mapData[17][15] = T.HOUSE; this.mapData[18][14] = T.HOUSE; this.mapData[18][15] = T.HOUSE;

        // Inn
        this.mapData[17][22] = T.INN; this.mapData[17][23] = T.HOUSE; this.mapData[18][22] = T.HOUSE; this.mapData[18][23] = T.HOUSE;

        // Flowers around town
        const flowerSpots = [[9,13],[9,24],[20,9],[10,20],[22,13],[20,25],[10,16],[22,21]];
        flowerSpots.forEach(([y,x]) => { if(this.mapData[y][x] === T.GRASS) this.mapData[y][x] = T.FLOWER; });

        // Signs
        this.mapData[13][17] = T.SIGN;
        this.signTexts['17,13'] = 'Witaj w Eldorii!\nPółnoc: Mroczny Las\nWschód: Jaskinia Cieni';

        this.mapData[8][18] = T.SIGN;
        this.signTexts['18,8'] = 'UWAGA! Mroczny Las\nNiebezpieczne potwory!';

        this.mapData[14][28] = T.SIGN;
        this.signTexts['28,14'] = 'UWAGA! Jaskinia Cieni\nTylko dla odważnych!';

        // === PATH TO FOREST (north) ===
        for (let y = 1; y <= 7; y++) { this.mapData[y][18] = T.PATH; this.mapData[y][19] = T.PATH; }

        // === FOREST (top area, rows 0-6, cols 0-39) ===
        for (let y = 0; y <= 6; y++) {
            for (let x = 0; x < W; x++) {
                if (this.mapData[y][x] === T.GRASS && !(x >= 17 && x <= 20)) {
                    this.mapData[y][x] = T.DARK_GRASS;
                }
            }
        }
        this.mapData[0][18] = T.DARK_GRASS; this.mapData[0][19] = T.DARK_GRASS;

        // Forest entry markers
        this.mapData[6][17] = T.FOREST_ENTRY; this.mapData[6][20] = T.FOREST_ENTRY;

        // Trees scattered in forest
        const treePosForest = [
            [0,2],[0,5],[0,8],[0,12],[0,15],[0,23],[0,27],[0,31],[0,35],[0,38],
            [1,0],[1,4],[1,9],[1,14],[1,22],[1,25],[1,30],[1,34],[1,37],
            [2,1],[2,6],[2,11],[2,16],[2,21],[2,24],[2,28],[2,33],[2,39],
            [3,3],[3,7],[3,13],[3,17],[3,23],[3,26],[3,31],[3,36],
            [4,0],[4,5],[4,10],[4,15],[4,21],[4,25],[4,29],[4,34],[4,38],
            [5,2],[5,8],[5,12],[5,16],[5,22],[5,27],[5,32],[5,37],
            [6,0],[6,4],[6,9],[6,13],[6,24],[6,28],[6,33],[6,38],
        ];
        treePosForest.forEach(([y,x]) => {
            if (this.mapData[y][x] !== T.PATH) this.mapData[y][x] = T.TREE;
        });

        // Chests in forest
        this.mapData[2][20] = T.CHEST;
        this.chests['20,2'] = { gold: 25, item: null };
        this.mapData[4][32] = T.CHEST;
        this.chests['32,4'] = { gold: 0, item: { id: 'big_potion', name: 'Duża Mikstura HP', desc: 'Leczy 50 HP', type: 'consumable', heal: 50, count: 1, price: 30 } };

        // === PATH TO DUNGEON (east) ===
        for (let x = 28; x < W; x++) { this.mapData[14][x] = T.PATH; this.mapData[15][x] = T.PATH; }

        // === DUNGEON (right area, rows 8-22, cols 30-39) ===
        for (let y = 8; y <= 22; y++) {
            for (let x = 30; x < W; x++) {
                if (this.mapData[y][x] === T.GRASS) {
                    this.mapData[y][x] = T.CAVE_FLOOR;
                }
            }
        }
        // Cave walls border
        for (let x = 30; x < W; x++) {
            this.mapData[8][x] = T.CAVE_WALL;
            this.mapData[22][x] = T.CAVE_WALL;
        }
        for (let y = 8; y <= 22; y++) {
            if (y !== 14 && y !== 15) this.mapData[y][30] = T.CAVE_WALL;
            this.mapData[y][W-1] = T.CAVE_WALL;
        }

        // Cave entry
        this.mapData[14][30] = T.CAVE_ENTRY; this.mapData[15][30] = T.CAVE_ENTRY;

        // Internal cave walls (maze-like)
        for (let y = 10; y <= 13; y++) this.mapData[y][33] = T.CAVE_WALL;
        for (let y = 16; y <= 20; y++) this.mapData[y][33] = T.CAVE_WALL;
        for (let y = 10; y <= 14; y++) this.mapData[y][36] = T.CAVE_WALL;
        for (let y = 17; y <= 21; y++) this.mapData[y][36] = T.CAVE_WALL;
        this.mapData[12][34] = T.CAVE_WALL;
        this.mapData[19][34] = T.CAVE_WALL;
        this.mapData[19][35] = T.CAVE_WALL;

        // Chests in dungeon
        this.mapData[10][38] = T.CHEST;
        this.chests['38,10'] = { gold: 50, item: null };
        this.mapData[20][37] = T.CHEST;
        this.chests['37,20'] = { gold: 0, item: { id: 'full_potion', name: 'Pełna Mikstura HP', desc: 'Leczy całe HP', type: 'consumable', heal: 9999, count: 2, price: 80 } };

        // === WATER features ===
        // River south of town
        for (let x = 0; x < W; x++) {
            this.mapData[25][x] = T.WATER;
            this.mapData[26][x] = T.WATER;
        }
        // Bridge
        this.mapData[25][18] = T.BRIDGE; this.mapData[25][19] = T.BRIDGE;
        this.mapData[26][18] = T.BRIDGE; this.mapData[26][19] = T.BRIDGE;

        // Pond in the southwest
        for (let y = 27; y <= 29; y++)
            for (let x = 3; x <= 6; x++)
                this.mapData[y][x] = T.WATER;

        // Trees scattered elsewhere
        const extraTrees = [
            [24,3],[24,8],[24,14],[24,25],[24,32],
            [27,10],[28,12],[29,8],[27,20],[28,25],[29,30],
            [27,35],[28,37],[29,15],[27,15],[29,35],
            [8,2],[10,5],[12,3],[14,5],[16,2],[18,4],[20,3],[22,5],
            [8,35],[10,37],[12,35],[16,37],[20,36],[22,38],
        ];
        extraTrees.forEach(([y,x]) => {
            if (this.mapData[y][x] === T.GRASS) this.mapData[y][x] = T.TREE;
        });

        // South area flowers
        for (let i = 0; i < 12; i++) {
            const fx = Math.floor(Math.random() * 38) + 1;
            const fy = Math.floor(Math.random() * 3) + 27;
            if (this.mapData[fy][fx] === T.GRASS) this.mapData[fy][fx] = T.FLOWER;
        }
    },

    _placeBuilding(x, y, w, h, wallTile, doorTile) {
        for (let dy = 0; dy < h; dy++)
            for (let dx = 0; dx < w; dx++)
                this.mapData[y + dy][x + dx] = wallTile;
        // Door at bottom-center
        this.mapData[y + h - 1][x + Math.floor(w / 2)] = doorTile;
    },

    // ============================================================
    // GET AREA AT POSITION
    // ============================================================
    getArea(x, y) {
        if (y <= 6) return 'forest';
        if (x >= 30 && y >= 8 && y <= 22) return 'dungeon';
        return 'town';
    },

    getAreaInfo(x, y) {
        return this.areas[this.getArea(x, y)];
    },

    // ============================================================
    // TILE PROPERTIES
    // ============================================================
    isWalkable(x, y) {
        if (x < 0 || x >= this.MAP_W || y < 0 || y >= this.MAP_H) return false;
        const t = this.mapData[y][x];
        const T = this.tiles;
        const blocked = [T.WATER, T.WALL, T.TREE, T.HOUSE, T.CAVE_WALL, T.FENCE, T.WELL, T.STATUE];
        return !blocked.includes(t);
    },

    isInteractable(x, y) {
        if (x < 0 || x >= this.MAP_W || y < 0 || y >= this.MAP_H) return false;
        const t = this.mapData[y][x];
        const T = this.tiles;
        return [T.SHOP_WEAPON, T.SHOP_ARMOR, T.SHOP_POTION, T.INN, T.SIGN, T.CHEST, T.WELL].includes(t);
    },

    // ============================================================
    // INPUT HANDLING
    // ============================================================
    keys: {},
    setupInput() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;

            if (!this.running) return;

            // Combat keys
            if (this.combat.active) {
                if (e.key.toLowerCase() === 'a') this.combat.doAttack();
                else if (e.key.toLowerCase() === 's') this.combat.doSkill();
                else if (e.key.toLowerCase() === 'd') this.combat.doPotion();
                else if (e.key.toLowerCase() === 'f') this.combat.doFlee();
                return;
            }

            // UI keys
            if (e.key === 'Escape') {
                this.closeAllOverlays();
            }
            if (e.key.toLowerCase() === 'i' && !this.isAnyOverlayOpen()) {
                this.openInventory();
            }
            if (e.key === ' ' && !this.isAnyOverlayOpen()) {
                e.preventDefault();
                this.interact();
            }

            // Movement
            if (!this.isAnyOverlayOpen()) {
                const dirs = {
                    'arrowup': [0, -1, 'up'], 'w': [0, -1, 'up'],
                    'arrowdown': [0, 1, 'down'], 's': [0, 1, 'down'],
                    'arrowleft': [-1, 0, 'left'], 'a': [-1, 0, 'left'],
                    'arrowright': [1, 0, 'right'], 'd': [1, 0, 'right'],
                };
                const dir = dirs[e.key.toLowerCase()];
                if (dir && this.player.moveTimer <= 0) {
                    this.movePlayer(dir[0], dir[1], dir[2]);
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    },

    // ============================================================
    // UI SETUP
    // ============================================================
    setupUI() {
        document.getElementById('btn-new-game').addEventListener('click', () => this.startNewGame());
        document.getElementById('btn-load-game').addEventListener('click', () => this.loadGame());
        document.getElementById('dialog-close').addEventListener('click', () => this.closeAllOverlays());
        document.getElementById('dialog-close-inv').addEventListener('click', () => this.closeAllOverlays());
    },

    // ============================================================
    // GAME START
    // ============================================================
    startNewGame() {
        document.getElementById('title-screen').style.display = 'none';
        this.running = true;
        this.log('Witaj w Eldorii, bohaterze!', 'info');
        this.log('Użyj WASD/strzałek by się poruszać, SPACJA by rozmawiać.', 'info');
        this.gameLoop(0);
    },

    loadGame() {
        const save = localStorage.getItem('pixelquest_save');
        if (save) {
            try {
                const data = JSON.parse(save);
                Object.assign(this.player, data.player);
                this.openedChests = new Set(data.openedChests || []);
                document.getElementById('title-screen').style.display = 'none';
                this.running = true;
                this.log('Gra wczytana!', 'info');
                this.gameLoop(0);
            } catch(e) {
                this.log('Błąd wczytywania!', 'combat');
                this.startNewGame();
            }
        } else {
            this.log('Brak zapisanej gry. Zaczynam nową...', 'info');
            this.startNewGame();
        }
    },

    saveGame() {
        const data = {
            player: { ...this.player },
            openedChests: [...this.openedChests],
        };
        localStorage.setItem('pixelquest_save', JSON.stringify(data));
        this.log('Gra zapisana!', 'info');
    },

    // ============================================================
    // GAME LOOP
    // ============================================================
    gameLoop(timestamp) {
        if (!this.running) return;

        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        // Animation timer
        this.animTimer += dt;
        if (this.animTimer > 0.4) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }

        // Move cooldown
        if (this.player.moveTimer > 0) this.player.moveTimer -= dt;

        this.updateCamera();
        this.render();
        this.renderMinimap();
        this.updateUI();

        requestAnimationFrame((t) => this.gameLoop(t));
    },

    // ============================================================
    // PLAYER MOVEMENT
    // ============================================================
    movePlayer(dx, dy, facing) {
        this.player.facing = facing;
        const nx = this.player.x + dx;
        const ny = this.player.y + dy;

        if (this.isWalkable(nx, ny)) {
            this.player.x = nx;
            this.player.y = ny;
            this.player.moveTimer = 0.15; // movement cooldown

            // Check for random encounter
            const area = this.getArea(nx, ny);
            const chance = this.areas[area].monsterChance;
            if (chance > 0 && Math.random() < chance) {
                this.startCombat(area);
            }

            // Auto-save every 20 steps
            if (Math.random() < 0.05) this.saveGame();
        }
    },

    // ============================================================
    // INTERACTION
    // ============================================================
    interact() {
        const dirs = { up: [0,-1], down: [0,1], left: [-1,0], right: [1,0] };
        const [dx, dy] = dirs[this.player.facing];
        const tx = this.player.x + dx;
        const ty = this.player.y + dy;

        if (tx < 0 || tx >= this.MAP_W || ty < 0 || ty >= this.MAP_H) return;

        const tile = this.mapData[ty][tx];
        const T = this.tiles;

        switch(tile) {
            case T.SHOP_WEAPON: this.openShop('weapon'); break;
            case T.SHOP_ARMOR: this.openShop('armor'); break;
            case T.SHOP_POTION: this.openShop('potion'); break;
            case T.INN:
                if (this.player.gold >= 5) {
                    this.player.gold -= 5;
                    this.player.hp = this.player.maxHp;
                    this.log('Odpoczywasz w gospodzie. HP pełne! (-5 Zł)', 'heal');
                    this.saveGame();
                } else {
                    this.log('Nie stać cię na nocleg! (5 Zł)', 'combat');
                }
                break;
            case T.SIGN:
                const key = `${tx},${ty}`;
                if (this.signTexts[key]) {
                    this.showDialog('Tablica', this.signTexts[key].replace(/\n/g, '<br>'));
                }
                break;
            case T.CHEST:
                this.openChest(tx, ty);
                break;
            case T.WELL:
                if (this.player.hp < this.player.maxHp) {
                    this.player.hp = Math.min(this.player.hp + 5, this.player.maxHp);
                    this.log('Pijesz ze studni. +5 HP', 'heal');
                } else {
                    this.log('Woda ze studni jest orzeźwiająca!', 'info');
                }
                break;
        }
    },

    // ============================================================
    // CHEST SYSTEM
    // ============================================================
    openChest(x, y) {
        const key = `${x},${y}`;
        if (this.openedChests.has(key)) {
            this.log('Skrzynia jest już pusta.', 'info');
            return;
        }
        const chest = this.chests[key];
        if (!chest) return;

        this.openedChests.add(key);
        if (chest.gold > 0) {
            this.player.gold += chest.gold;
            this.log(`Znaleziono ${chest.gold} Zł w skrzyni!`, 'loot');
        }
        if (chest.item) {
            this.addToInventory(chest.item);
            this.log(`Znaleziono: ${chest.item.name}!`, 'loot');
        }
    },

    // ============================================================
    // SHOP SYSTEM
    // ============================================================
    openShop(type) {
        const shop = this.shops[type];
        const overlay = document.getElementById('dialog-overlay');
        const title = document.getElementById('dialog-title');
        const content = document.getElementById('dialog-content');

        title.textContent = shop.name;

        let html = '';
        shop.items.forEach((item, i) => {
            const canAfford = this.player.gold >= item.price;
            html += `<div class="shop-item ${canAfford ? '' : 'cannot-afford'}" onclick="Game.buyItem('${type}', ${i})">
                <div>
                    <div class="item-name">${item.name}</div>
                    <div class="item-desc">${item.desc}</div>
                </div>
                <div class="item-price">${item.price} Zł</div>
            </div>`;
        });
        content.innerHTML = html;
        overlay.classList.add('active');
    },

    buyItem(shopType, index) {
        const item = this.shops[shopType].items[index];
        if (this.player.gold < item.price) {
            this.log('Nie stać cię!', 'combat');
            return;
        }

        this.player.gold -= item.price;

        if (item.type === 'weapon') {
            this.player.weapon = { name: item.name, atk: item.atk };
            this.log(`Kupiono i wyposażono: ${item.name}!`, 'shop');
        } else if (item.type === 'armor') {
            this.player.armor = { name: item.name, def: item.def };
            this.log(`Kupiono i wyposażono: ${item.name}!`, 'shop');
        } else {
            this.addToInventory({ ...item, count: 1 });
            this.log(`Kupiono: ${item.name}!`, 'shop');
        }

        // Refresh shop display
        this.openShop(shopType);
        this.saveGame();
    },

    // ============================================================
    // INVENTORY
    // ============================================================
    addToInventory(item) {
        const existing = this.player.inventory.find(i => i.id === item.id);
        if (existing) {
            existing.count += (item.count || 1);
        } else {
            this.player.inventory.push({ ...item, count: item.count || 1 });
        }
    },

    openInventory() {
        const overlay = document.getElementById('inventory-overlay');
        const content = document.getElementById('inventory-content');
        const p = this.player;

        let html = `<div class="inv-item equipped"><span>Broń: ${p.weapon.name} (ATK +${p.weapon.atk})</span></div>`;
        html += `<div class="inv-item equipped"><span>Zbroja: ${p.armor.name} (DEF +${p.armor.def})</span></div>`;
        html += `<hr style="border-color:#333;margin:8px 0;">`;

        if (p.inventory.length === 0) {
            html += '<div style="text-align:center;color:#666;font-size:9px;padding:16px;">Plecak jest pusty</div>';
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
            if (item.count <= 0) {
                this.player.inventory.splice(index, 1);
            }
        }
        this.openInventory(); // refresh
    },

    // ============================================================
    // COMBAT SYSTEM
    // ============================================================
    combat: {
        active: false,
        enemy: null,
        turnCount: 0,

        start(area) {
            const defs = Game.monsterDefs[area];
            // Filter by approximate level
            const eligible = defs.filter(m => m.level <= Game.player.level + 2);
            const def = eligible[Math.floor(Math.random() * eligible.length)];

            // Scale monster slightly with player level
            const scale = 1 + (Game.player.level - 1) * 0.1;
            this.enemy = {
                ...def,
                hp: Math.floor(def.hp * scale),
                maxHp: Math.floor(def.hp * scale),
                atk: Math.floor(def.atk * scale),
                def: Math.floor(def.def * scale),
            };
            this.active = true;
            this.turnCount = 0;

            document.getElementById('combat-overlay').classList.add('active');
            document.getElementById('enemy-display').textContent = this.enemy.emoji;
            document.getElementById('enemy-name').textContent = `${this.enemy.name} (Lv.${this.enemy.level})`;
            document.getElementById('combat-log').innerHTML = '';
            this.updateEnemyHP();

            Game.log(`Napotkano: ${this.enemy.name}!`, 'combat');
        },

        updateEnemyHP() {
            const pct = Math.max(0, (this.enemy.hp / this.enemy.maxHp) * 100);
            document.getElementById('enemy-hp-bar').style.width = pct + '%';
            document.getElementById('enemy-hp-text').textContent = `HP: ${Math.max(0, this.enemy.hp)}/${this.enemy.maxHp}`;
        },

        combatLog(msg) {
            const div = document.getElementById('combat-log');
            div.innerHTML = msg + '<br>' + div.innerHTML;
        },

        calcDamage(atk, def) {
            const base = Math.max(1, atk - def);
            const variance = Math.floor(Math.random() * 3) - 1; // -1 to +1
            return Math.max(1, base + variance);
        },

        doAttack() {
            if (!this.active) return;
            const totalAtk = Game.player.atk + Game.player.weapon.atk;
            const dmg = this.calcDamage(totalAtk, this.enemy.def);
            this.enemy.hp -= dmg;
            this.combatLog(`Zadajesz ${dmg} obrażeń!`);
            this.updateEnemyHP();

            // Flash effect
            document.getElementById('enemy-display').classList.add('damage-flash');
            setTimeout(() => document.getElementById('enemy-display').classList.remove('damage-flash'), 200);

            if (this.enemy.hp <= 0) {
                this.victory();
            } else {
                this.enemyTurn();
            }
        },

        doSkill() {
            if (!this.active) return;
            // Power strike - 1.5x damage but can miss
            if (Math.random() < 0.3) {
                this.combatLog('Umiejętność chybiona!');
                this.enemyTurn();
                return;
            }
            const totalAtk = Game.player.atk + Game.player.weapon.atk;
            const dmg = Math.floor(this.calcDamage(totalAtk, this.enemy.def) * 1.8);
            this.enemy.hp -= dmg;
            this.combatLog(`Potężne uderzenie! ${dmg} obrażeń!`);
            this.updateEnemyHP();

            document.getElementById('enemy-display').classList.add('damage-flash');
            setTimeout(() => document.getElementById('enemy-display').classList.remove('damage-flash'), 200);

            if (this.enemy.hp <= 0) {
                this.victory();
            } else {
                this.enemyTurn();
            }
        },

        doPotion() {
            if (!this.active) return;
            const potion = Game.player.inventory.find(i => i.type === 'consumable' && i.heal);
            if (!potion) {
                this.combatLog('Brak mikstur!');
                return;
            }
            const healed = Math.min(potion.heal, Game.player.maxHp - Game.player.hp);
            Game.player.hp = Math.min(Game.player.hp + potion.heal, Game.player.maxHp);
            potion.count--;
            if (potion.count <= 0) {
                Game.player.inventory = Game.player.inventory.filter(i => i.count > 0);
            }
            this.combatLog(`Użyto ${potion.name}. +${healed} HP`);
            this.enemyTurn();
        },

        doFlee() {
            if (!this.active) return;
            if (Math.random() < 0.5) {
                this.combatLog('Uciekasz!');
                this.active = false;
                document.getElementById('combat-overlay').classList.remove('active');
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

            if (Game.player.hp <= 0) {
                this.defeat();
            }
        },

        victory() {
            this.active = false;
            const goldEarned = this.enemy.gold[0] + Math.floor(Math.random() * (this.enemy.gold[1] - this.enemy.gold[0] + 1));
            Game.player.gold += goldEarned;
            Game.player.xp += this.enemy.xp;
            Game.player.kills++;

            Game.log(`Pokonano ${this.enemy.name}! +${this.enemy.xp} XP, +${goldEarned} Zł`, 'loot');

            // Check level up
            while (Game.player.xp >= Game.player.xpNext) {
                Game.player.xp -= Game.player.xpNext;
                Game.player.level++;
                Game.player.xpNext = Math.floor(Game.player.xpNext * 1.5);
                Game.player.maxHp += 8;
                Game.player.hp = Game.player.maxHp;
                Game.player.atk += 2;
                Game.player.def += 1;
                Game.log(`LEVEL UP! Poziom ${Game.player.level}!`, 'loot');

                // Show level up text
                const text = document.createElement('div');
                text.className = 'level-up-text';
                text.textContent = `LEVEL ${Game.player.level}!`;
                text.style.left = '50%';
                text.style.top = '50%';
                document.getElementById('game-container').appendChild(text);
                setTimeout(() => text.remove(), 2000);
            }

            setTimeout(() => {
                document.getElementById('combat-overlay').classList.remove('active');
            }, 800);

            Game.saveGame();
        },

        defeat() {
            this.active = false;
            Game.player.hp = Math.floor(Game.player.maxHp * 0.3);
            const lostGold = Math.floor(Game.player.gold * 0.2);
            Game.player.gold -= lostGold;
            Game.player.x = 18;
            Game.player.y = 14;

            Game.log(`Poległeś! Budzisz się w mieście. Stracono ${lostGold} Zł.`, 'combat');

            setTimeout(() => {
                document.getElementById('combat-overlay').classList.remove('active');
            }, 600);

            Game.saveGame();
        }
    },

    startCombat(area) {
        this.combat.start(area);
    },

    // ============================================================
    // DIALOG SYSTEM
    // ============================================================
    showDialog(title, content) {
        document.getElementById('dialog-title').textContent = title;
        document.getElementById('dialog-content').innerHTML = `<div style="font-size:10px;line-height:1.8;padding:8px;">${content}</div>`;
        document.getElementById('dialog-overlay').classList.add('active');
    },

    closeAllOverlays() {
        document.getElementById('dialog-overlay').classList.remove('active');
        document.getElementById('combat-overlay').classList.remove('active');
        document.getElementById('inventory-overlay').classList.remove('active');
    },

    isAnyOverlayOpen() {
        return document.getElementById('dialog-overlay').classList.contains('active') ||
               document.getElementById('combat-overlay').classList.contains('active') ||
               document.getElementById('inventory-overlay').classList.contains('active');
    },

    // ============================================================
    // MESSAGE LOG
    // ============================================================
    log(msg, type = 'info') {
        const log = document.getElementById('message-log');
        const div = document.createElement('div');
        div.className = `msg-${type}`;
        div.textContent = `> ${msg}`;
        log.appendChild(div);
        log.scrollTop = log.scrollHeight;

        // Keep max 50 messages
        while (log.children.length > 50) log.removeChild(log.firstChild);
    },

    // ============================================================
    // CAMERA
    // ============================================================
    updateCamera() {
        const screenTilesX = Math.floor(640 / this.TILE);
        const screenTilesY = Math.floor(480 / this.TILE);

        this.viewX = Math.max(0, Math.min(this.player.x - Math.floor(screenTilesX / 2), this.MAP_W - screenTilesX));
        this.viewY = Math.max(0, Math.min(this.player.y - Math.floor(screenTilesY / 2), this.MAP_H - screenTilesY));
    },

    // ============================================================
    // RENDERING
    // ============================================================
    render() {
        const ctx = this.ctx;
        const T = this.TILE;
        const screenTilesX = Math.ceil(640 / T) + 1;
        const screenTilesY = Math.ceil(480 / T) + 1;

        // Clear
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, 640, 480);

        // Draw tiles
        for (let dy = 0; dy < screenTilesY; dy++) {
            for (let dx = 0; dx < screenTilesX; dx++) {
                const mx = this.viewX + dx;
                const my = this.viewY + dy;
                if (mx >= this.MAP_W || my >= this.MAP_H) continue;

                const px = dx * T;
                const py = dy * T;
                const tile = this.mapData[my][mx];

                this.drawTile(ctx, tile, px, py, mx, my);
            }
        }

        // Draw player
        const px = (this.player.x - this.viewX) * T;
        const py = (this.player.y - this.viewY) * T;
        this.drawPlayer(ctx, px, py);

        // Draw location label
        const areaInfo = this.getAreaInfo(this.player.x, this.player.y);
        document.getElementById('location-label').textContent = areaInfo.name;
    },

    // ============================================================
    // TILE DRAWING (Pixel Art Style)
    // ============================================================
    drawTile(ctx, tile, x, y, mx, my) {
        const T = this.TILE;
        const TI = this.tiles;
        const af = this.animFrame;

        switch(tile) {
            case TI.GRASS:
                ctx.fillStyle = this.colors.grass[((mx + my) % 4)];
                ctx.fillRect(x, y, T, T);
                // Grass detail
                if ((mx * 7 + my * 13) % 5 === 0) {
                    ctx.fillStyle = '#6aac5f';
                    ctx.fillRect(x + 8, y + 12, 2, 6);
                    ctx.fillRect(x + 20, y + 8, 2, 5);
                }
                break;

            case TI.DARK_GRASS:
                ctx.fillStyle = this.colors.darkGrass[((mx + my) % 4)];
                ctx.fillRect(x, y, T, T);
                if ((mx * 3 + my * 7) % 4 === 0) {
                    ctx.fillStyle = '#1a3a18';
                    ctx.fillRect(x + 6, y + 14, 2, 5);
                    ctx.fillRect(x + 22, y + 10, 2, 4);
                }
                break;

            case TI.PATH:
                ctx.fillStyle = this.colors.path[((mx + my) % 4)];
                ctx.fillRect(x, y, T, T);
                // Path detail - pebbles
                if ((mx + my * 3) % 3 === 0) {
                    ctx.fillStyle = '#a08850';
                    ctx.fillRect(x + 10, y + 14, 3, 3);
                }
                if ((mx * 5 + my) % 4 === 0) {
                    ctx.fillStyle = '#b09860';
                    ctx.fillRect(x + 22, y + 8, 2, 2);
                }
                break;

            case TI.STONE_FLOOR:
                ctx.fillStyle = '#909090';
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = '#808080';
                ctx.fillRect(x, y, T, 1);
                ctx.fillRect(x, y, 1, T);
                ctx.fillStyle = '#a0a0a0';
                ctx.fillRect(x + T - 1, y, 1, T);
                ctx.fillRect(x, y + T - 1, T, 1);
                break;

            case TI.WATER:
                ctx.fillStyle = this.colors.water[((mx + my + af) % 4)];
                ctx.fillRect(x, y, T, T);
                // Wave effect
                ctx.fillStyle = '#5dade2';
                const waveOffset = (af * 4 + mx * 3) % T;
                ctx.fillRect(x + waveOffset, y + 8, 8, 2);
                ctx.fillRect(x + (waveOffset + 16) % T, y + 20, 6, 2);
                break;

            case TI.TREE:
                // Ground
                const isForestArea = my <= 6;
                ctx.fillStyle = isForestArea ? this.colors.darkGrass[0] : this.colors.grass[0];
                ctx.fillRect(x, y, T, T);
                // Trunk
                ctx.fillStyle = this.colors.tree_trunk;
                ctx.fillRect(x + 12, y + 18, 8, 14);
                // Leaves (layered for depth)
                ctx.fillStyle = this.colors.tree_leaves[2];
                ctx.fillRect(x + 4, y + 2, 24, 18);
                ctx.fillStyle = this.colors.tree_leaves[0];
                ctx.fillRect(x + 6, y + 0, 20, 16);
                ctx.fillStyle = this.colors.tree_leaves[1];
                ctx.fillRect(x + 8, y + 2, 16, 12);
                // Highlight
                ctx.fillStyle = this.colors.tree_leaves[3];
                ctx.fillRect(x + 10, y + 4, 6, 4);
                break;

            case TI.WALL:
                ctx.fillStyle = this.colors.wall[0];
                ctx.fillRect(x, y, T, T);
                break;

            case TI.HOUSE:
                // Wall
                ctx.fillStyle = this.colors.house_wall[(mx + my) % 2];
                ctx.fillRect(x, y, T, T);
                // Roof top
                ctx.fillStyle = this.colors.house_roof[0];
                ctx.fillRect(x, y, T, 10);
                ctx.fillStyle = this.colors.house_roof[1];
                ctx.fillRect(x + 2, y + 2, T - 4, 6);
                // Window
                ctx.fillStyle = '#f7dc6f';
                ctx.fillRect(x + 12, y + 16, 8, 8);
                ctx.fillStyle = '#85929e';
                ctx.fillRect(x + 15, y + 16, 2, 8);
                ctx.fillRect(x + 12, y + 19, 8, 2);
                break;

            case TI.DOOR:
                ctx.fillStyle = this.colors.house_wall[0];
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = this.colors.door;
                ctx.fillRect(x + 8, y + 4, 16, 28);
                ctx.fillStyle = '#d4a017';
                ctx.fillRect(x + 20, y + 16, 3, 3);
                break;

            case TI.SHOP_WEAPON:
                // Building base
                ctx.fillStyle = '#c69463';
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = '#a0522d';
                ctx.fillRect(x, y, T, 10);
                // Sword sign
                ctx.fillStyle = '#e67e22';
                ctx.fillRect(x + 10, y + 14, 2, 14);
                ctx.fillRect(x + 6, y + 12, 10, 2);
                ctx.fillRect(x + 20, y + 14, 2, 10);
                // Label
                ctx.fillStyle = '#f1c40f';
                ctx.font = '7px monospace';
                ctx.fillText('⚔', x + 18, y + 28);
                break;

            case TI.SHOP_ARMOR:
                ctx.fillStyle = '#c69463';
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = '#4a6fa5';
                ctx.fillRect(x, y, T, 10);
                // Shield sign
                ctx.fillStyle = '#3498db';
                ctx.fillRect(x + 10, y + 14, 12, 14);
                ctx.fillStyle = '#2980b9';
                ctx.fillRect(x + 12, y + 16, 8, 10);
                ctx.fillStyle = '#f1c40f';
                ctx.font = '7px monospace';
                ctx.fillText('🛡', x + 18, y + 28);
                break;

            case TI.SHOP_POTION:
                ctx.fillStyle = '#c69463';
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = '#27ae60';
                ctx.fillRect(x, y, T, 10);
                // Potion bottle
                ctx.fillStyle = '#2ecc71';
                ctx.fillRect(x + 12, y + 18, 8, 10);
                ctx.fillStyle = '#27ae60';
                ctx.fillRect(x + 14, y + 14, 4, 4);
                ctx.fillStyle = '#f1c40f';
                ctx.font = '7px monospace';
                ctx.fillText('🧪', x + 18, y + 28);
                break;

            case TI.INN:
                ctx.fillStyle = '#c69463';
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = '#8e44ad';
                ctx.fillRect(x, y, T, 10);
                // Bed icon
                ctx.fillStyle = '#f0e68c';
                ctx.fillRect(x + 8, y + 18, 16, 8);
                ctx.fillStyle = '#daa520';
                ctx.fillRect(x + 8, y + 16, 4, 10);
                ctx.fillStyle = '#f1c40f';
                ctx.font = '7px monospace';
                ctx.fillText('🏨', x + 18, y + 28);
                break;

            case TI.BRIDGE:
                ctx.fillStyle = this.colors.water[af % 4];
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = this.colors.wood;
                ctx.fillRect(x + 2, y, T - 4, T);
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x + 2, y + 4, T - 4, 2);
                ctx.fillRect(x + 2, y + 14, T - 4, 2);
                ctx.fillRect(x + 2, y + 24, T - 4, 2);
                break;

            case TI.CAVE_FLOOR:
                ctx.fillStyle = this.colors.caveFloor[((mx + my) % 3)];
                ctx.fillRect(x, y, T, T);
                if ((mx * 5 + my * 3) % 7 === 0) {
                    ctx.fillStyle = '#3a3a4a';
                    ctx.fillRect(x + 8, y + 12, 4, 3);
                }
                break;

            case TI.CAVE_WALL:
                ctx.fillStyle = this.colors.caveWall[((mx + my) % 3)];
                ctx.fillRect(x, y, T, T);
                // Rock texture
                ctx.fillStyle = '#3d3d4d';
                ctx.fillRect(x + 4, y + 4, 8, 6);
                ctx.fillRect(x + 18, y + 14, 6, 8);
                ctx.fillStyle = '#252535';
                ctx.fillRect(x + 12, y + 20, 10, 4);
                break;

            case TI.CAVE_ENTRY:
                ctx.fillStyle = '#1a1a2a';
                ctx.fillRect(x, y, T, T);
                // Archway
                ctx.fillStyle = '#444458';
                ctx.fillRect(x, y, T, 4);
                ctx.fillRect(x, y, 4, T);
                ctx.fillRect(x + T - 4, y, 4, T);
                break;

            case TI.FOREST_ENTRY:
                ctx.fillStyle = this.colors.darkGrass[0];
                ctx.fillRect(x, y, T, T);
                // Decorative pillars
                ctx.fillStyle = '#666';
                ctx.fillRect(x + 4, y, 6, T);
                ctx.fillRect(x + 22, y, 6, T);
                ctx.fillStyle = '#888';
                ctx.fillRect(x + 5, y, 4, T);
                break;

            case TI.FLOWER:
                ctx.fillStyle = this.colors.grass[0];
                ctx.fillRect(x, y, T, T);
                // Flowers
                const fc = this.colors.flower[((mx * 3 + my * 7) % 4)];
                ctx.fillStyle = '#2ecc71';
                ctx.fillRect(x + 10, y + 14, 2, 10);
                ctx.fillRect(x + 22, y + 16, 2, 8);
                ctx.fillStyle = fc;
                ctx.fillRect(x + 8, y + 10, 6, 6);
                ctx.fillStyle = this.colors.flower[((mx * 7 + my) % 4)];
                ctx.fillRect(x + 20, y + 12, 5, 5);
                break;

            case TI.SIGN:
                ctx.fillStyle = this.colors.path[0];
                ctx.fillRect(x, y, T, T);
                // Sign post
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x + 14, y + 14, 4, 18);
                ctx.fillStyle = '#d4a574';
                ctx.fillRect(x + 6, y + 6, 20, 12);
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x + 6, y + 6, 20, 2);
                // Exclamation
                ctx.fillStyle = '#333';
                ctx.fillRect(x + 14, y + 9, 4, 5);
                break;

            case TI.CHEST:
                const area = this.getArea(mx, my);
                ctx.fillStyle = area === 'dungeon' ? this.colors.caveFloor[0] : (area === 'forest' ? this.colors.darkGrass[0] : this.colors.grass[0]);
                ctx.fillRect(x, y, T, T);
                const opened = this.openedChests.has(`${mx},${my}`);
                if (opened) {
                    ctx.fillStyle = '#8B6914';
                    ctx.fillRect(x + 6, y + 14, 20, 14);
                    ctx.fillStyle = '#a08020';
                    ctx.fillRect(x + 6, y + 8, 20, 8);
                } else {
                    ctx.fillStyle = '#daa520';
                    ctx.fillRect(x + 6, y + 10, 20, 16);
                    ctx.fillStyle = '#b8860b';
                    ctx.fillRect(x + 6, y + 10, 20, 4);
                    ctx.fillStyle = '#ffd700';
                    ctx.fillRect(x + 14, y + 12, 4, 6);
                    // Sparkle animation
                    if (af % 2 === 0) {
                        ctx.fillStyle = '#fff';
                        ctx.fillRect(x + 22, y + 8, 2, 2);
                    }
                }
                break;

            case TI.FENCE:
                ctx.fillStyle = this.colors.grass[0];
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = this.colors.fence;
                // Posts
                ctx.fillRect(x + 2, y + 8, 4, 24);
                ctx.fillRect(x + 26, y + 8, 4, 24);
                // Rails
                ctx.fillStyle = '#a07818';
                ctx.fillRect(x, y + 12, T, 3);
                ctx.fillRect(x, y + 22, T, 3);
                break;

            case TI.WELL:
                ctx.fillStyle = this.colors.stone[0];
                ctx.fillRect(x, y, T, T);
                // Well structure
                ctx.fillStyle = '#666';
                ctx.fillRect(x + 4, y + 8, 24, 20);
                ctx.fillStyle = '#2980b9';
                ctx.fillRect(x + 8, y + 12, 16, 12);
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x + 6, y + 4, 2, 8);
                ctx.fillRect(x + 24, y + 4, 2, 8);
                ctx.fillRect(x + 6, y + 4, 20, 2);
                // Bucket
                ctx.fillStyle = '#888';
                ctx.fillRect(x + 14, y + 6, 4, 6);
                break;

            case TI.STATUE:
                ctx.fillStyle = '#909090';
                ctx.fillRect(x, y, T, T);
                // Pedestal
                ctx.fillStyle = '#666';
                ctx.fillRect(x + 6, y + 22, 20, 10);
                // Statue figure
                ctx.fillStyle = '#aaa';
                ctx.fillRect(x + 12, y + 4, 8, 18);
                ctx.fillStyle = '#bbb';
                ctx.fillRect(x + 14, y + 2, 4, 4);
                // Sword
                ctx.fillStyle = '#ccc';
                ctx.fillRect(x + 22, y + 6, 2, 14);
                ctx.fillRect(x + 20, y + 10, 6, 2);
                break;
        }
    },

    // ============================================================
    // PLAYER SPRITE DRAWING
    // ============================================================
    drawPlayer(ctx, x, y) {
        const T = this.TILE;
        const c = this.colors;
        const f = this.player.facing;
        const bobY = (this.player.moveTimer > 0) ? Math.sin(Date.now() / 80) * 2 : 0;

        const py = y + bobY;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(x + 6, y + 28, 20, 4);

        // Body base
        // Boots
        ctx.fillStyle = c.boots;
        ctx.fillRect(x + 8, py + 26, 6, 6);
        ctx.fillRect(x + 18, py + 26, 6, 6);

        // Pants
        ctx.fillStyle = c.pants;
        ctx.fillRect(x + 10, py + 20, 12, 8);

        // Shirt
        ctx.fillStyle = c.shirt;
        ctx.fillRect(x + 8, py + 10, 16, 12);

        // Arms
        if (f === 'left') {
            ctx.fillStyle = c.shirt;
            ctx.fillRect(x + 4, py + 12, 4, 8);
            ctx.fillStyle = c.skin;
            ctx.fillRect(x + 4, py + 20, 4, 3);
        } else if (f === 'right') {
            ctx.fillStyle = c.shirt;
            ctx.fillRect(x + 24, py + 12, 4, 8);
            ctx.fillStyle = c.skin;
            ctx.fillRect(x + 24, py + 20, 4, 3);
        } else {
            ctx.fillStyle = c.shirt;
            ctx.fillRect(x + 4, py + 12, 4, 8);
            ctx.fillRect(x + 24, py + 12, 4, 8);
            ctx.fillStyle = c.skin;
            ctx.fillRect(x + 4, py + 20, 4, 3);
            ctx.fillRect(x + 24, py + 20, 4, 3);
        }

        // Head
        ctx.fillStyle = c.skin;
        ctx.fillRect(x + 10, py + 2, 12, 10);

        // Hair
        ctx.fillStyle = c.hair;
        ctx.fillRect(x + 8, py, 16, 5);
        if (f === 'left' || f === 'up') {
            ctx.fillRect(x + 8, py, 4, 8);
        }
        if (f === 'right' || f === 'up') {
            ctx.fillRect(x + 20, py, 4, 8);
        }

        // Eyes
        if (f !== 'up') {
            ctx.fillStyle = '#fff';
            if (f === 'left') {
                ctx.fillRect(x + 10, py + 5, 4, 3);
                ctx.fillStyle = '#333';
                ctx.fillRect(x + 10, py + 5, 2, 3);
            } else if (f === 'right') {
                ctx.fillRect(x + 18, py + 5, 4, 3);
                ctx.fillStyle = '#333';
                ctx.fillRect(x + 20, py + 5, 2, 3);
            } else {
                ctx.fillRect(x + 11, py + 5, 3, 3);
                ctx.fillRect(x + 18, py + 5, 3, 3);
                ctx.fillStyle = '#333';
                ctx.fillRect(x + 12, py + 6, 2, 2);
                ctx.fillRect(x + 19, py + 6, 2, 2);
            }
        }

        // Weapon (small sword)
        if (f === 'right' || f === 'down') {
            ctx.fillStyle = '#bbb';
            ctx.fillRect(x + 26, py + 14, 2, 10);
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(x + 25, py + 12, 4, 3);
        } else if (f === 'left') {
            ctx.fillStyle = '#bbb';
            ctx.fillRect(x + 4, py + 14, 2, 10);
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(x + 3, py + 12, 4, 3);
        }
    },

    // ============================================================
    // MINIMAP
    // ============================================================
    renderMinimap() {
        const ctx = this.miniCtx;
        const scale = 2;
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, 80, 60);

        for (let y = 0; y < this.MAP_H; y++) {
            for (let x = 0; x < this.MAP_W; x++) {
                const tile = this.mapData[y][x];
                const T = this.tiles;
                let color = '#4a8c3f'; // grass

                if (tile === T.DARK_GRASS) color = '#2d5a2a';
                else if (tile === T.PATH || tile === T.BRIDGE) color = '#c4a663';
                else if (tile === T.WATER) color = '#2980b9';
                else if (tile === T.TREE) color = '#1a6b30';
                else if (tile === T.HOUSE || tile === T.DOOR) color = '#d4a574';
                else if (tile === T.SHOP_WEAPON || tile === T.SHOP_ARMOR || tile === T.SHOP_POTION || tile === T.INN) color = '#e67e22';
                else if (tile === T.WALL || tile === T.FENCE) color = '#7f8c8d';
                else if (tile === T.CAVE_FLOOR || tile === T.CAVE_ENTRY) color = '#4a4a5a';
                else if (tile === T.CAVE_WALL) color = '#2a2a3a';
                else if (tile === T.STONE_FLOOR) color = '#909090';
                else if (tile === T.CHEST) color = '#daa520';

                ctx.fillStyle = color;
                ctx.fillRect(x * scale, y * scale, scale, scale);
            }
        }

        // Player dot (blinking)
        if (this.animFrame % 2 === 0) {
            ctx.fillStyle = '#fff';
        } else {
            ctx.fillStyle = '#e74c3c';
        }
        ctx.fillRect(this.player.x * scale - 1, this.player.y * scale - 1, 3, 3);
    },

    // ============================================================
    // UI UPDATE
    // ============================================================
    updateUI() {
        const p = this.player;
        document.getElementById('stat-level').textContent = p.level;
        document.getElementById('stat-hp').textContent = `${Math.max(0, p.hp)}/${p.maxHp}`;
        document.getElementById('hp-bar').style.width = `${Math.max(0, (p.hp / p.maxHp) * 100)}%`;
        document.getElementById('xp-bar').style.width = `${(p.xp / p.xpNext) * 100}%`;
        document.getElementById('stat-gold').textContent = p.gold;
        document.getElementById('stat-atk').textContent = p.atk + p.weapon.atk;
        document.getElementById('stat-def').textContent = p.def + p.armor.def;
    },
};

// ============================================================
// BOOT
// ============================================================
window.addEventListener('load', () => Game.init());
