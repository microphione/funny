// ============================================================
// WORLD CORE - Main World object, tile types, biomes, monsters,
// and core utility methods
// ============================================================

const World = {
    CHUNK_SIZE: 20,
    chunks: {},
    worldSeed: 42,

    T: {
        GRASS: 0, PATH: 1, WATER: 2, WALL: 3, TREE: 4,
        HOUSE: 5, DOOR: 6, SHOP_WEAPON: 7, SHOP_ARMOR: 8,
        SHOP_POTION: 9, INN: 10, BRIDGE: 11, DARK_GRASS: 12,
        CAVE_FLOOR: 13, CAVE_WALL: 14, CAVE_ENTRY: 15,
        FOREST_ENTRY: 16, FLOWER: 17, SIGN: 18, CHEST: 19,
        STONE_FLOOR: 20, FENCE: 21, WELL: 22, STATUE: 23,
        SWAMP: 24, MOUNTAIN: 25, DESERT: 26, ROCK: 27,
        SWAMP_TREE: 28, CACTUS: 29, VILLAGE_HUT: 30,
        NPC_QUEST: 31, NPC_QUEST2: 32, NPC_SHOPKEEPER: 33,
        SHOP_FLOOR: 35, SHOP_WEAPON_NPC: 36, SHOP_ARMOR_NPC: 37,
        SHOP_POTION_NPC: 38, QUEST_ITEM: 39,
        GROUND_LOOT: 40, // visual marker for ground loot
        HOUSE_DOOR: 41, // buyable house door
        TOWN_BUILDING: 42, // non-buyable building
        TOWN_BUILDING_DOOR: 43, // door to town building with NPC
        LAVA: 44,
        SNOW: 45,
        SNOW_PINE: 46,
        HOUSE_WALL: 47,   // proper wall (all sides)
        HOUSE_ROOF: 48,   // roof over interior (hidden when inside)
        HOUSE_FLOOR: 49,  // walkable interior floor
        HOUSE_WINDOW: 50, // window in wall (can see through)
        STAIRS_UP: 51,    // stairs going up (enter to go to upper floor)
        STAIRS_DOWN: 52,  // stairs going down (enter to return to lower floor)
    },

    BIOME: { PLAINS: 0, FOREST: 1, SWAMP: 2, MOUNTAIN: 3, DESERT: 4, SNOW: 5 },

    // Monster definitions per biome with level tiers (Tibia-inspired)
    // armor: reduces hit chance by 0.1% per point, reduces damage by 0.1 per point
    MONSTERS: {
        plains: [
            { name: 'Slime',       sprite: 'slime',   hp: 20, atk: 3,  armor: 0,  xp: 8,  gold: [2,6],   minDiff: 1, maxDiff: 6 },
            { name: 'Goblin',      sprite: 'goblin',  hp: 30, atk: 5,  armor: 2,  xp: 15, gold: [3,10],  minDiff: 1, maxDiff: 10 },
            { name: 'Wilk',        sprite: 'wolf',    hp: 35, atk: 8,  armor: 3,  xp: 20, gold: [3,8],   minDiff: 2, maxDiff: 12 },
            { name: 'Szczur Gigant',sprite: 'beetle',  hp: 28, atk: 6,  armor: 1,  xp: 12, gold: [2,7],  minDiff: 1, maxDiff: 8 },
            { name: 'Szkielet',    sprite: 'skeleton', hp: 50, atk: 12, armor: 5,  xp: 30, gold: [5,14],  minDiff: 4, maxDiff: 14 },
            { name: 'Dziki Koń',   sprite: 'wolf',    hp: 65, atk: 14, armor: 6,  xp: 45, gold: [8,18],  minDiff: 6, maxDiff: 20 },
            { name: 'Rycerz Rozbójnik', sprite: 'bandit', hp: 85, atk: 18, armor: 9, xp: 60, gold: [12,25], minDiff: 8, maxDiff: 22 },
            { name: 'Centaur',     sprite: 'bandit',  hp: 120, atk: 22, armor: 10, xp: 80, gold: [15,30], minDiff: 12, maxDiff: 28 },
            { name: 'Centaur Weteran',sprite:'bandit', hp: 180, atk: 30, armor: 14, xp: 120, gold: [22,45], minDiff: 18, maxDiff: 99 },
            { name: 'Rycerz Zagłady', sprite: 'dark_knight', hp: 250, atk: 42, armor: 22, xp: 200, gold: [40,80], minDiff: 25, maxDiff: 99, elite: true },
        ],
        forest: [
            { name: 'Pająk',       sprite: 'spider',  hp: 25, atk: 10, armor: 1,  xp: 18, gold: [3,7],   minDiff: 1, maxDiff: 8 },
            { name: 'Bandyta',     sprite: 'bandit',  hp: 45, atk: 10, armor: 6,  xp: 28, gold: [10,20], minDiff: 2, maxDiff: 10 },
            { name: 'Ork',         sprite: 'orc',     hp: 55, atk: 12, armor: 5,  xp: 35, gold: [6,16],  minDiff: 3, maxDiff: 14 },
            { name: 'Wielki Pająk',sprite: 'spider',  hp: 50, atk: 16, armor: 3,  xp: 32, gold: [5,12],  minDiff: 4, maxDiff: 12 },
            { name: 'Drzewiec',    sprite: 'treant',  hp: 80, atk: 8,  armor: 12, xp: 45, gold: [6,14],  minDiff: 5, maxDiff: 16 },
            { name: 'Ork Szaman',  sprite: 'orc',     hp: 75, atk: 20, armor: 6,  xp: 55, gold: [10,22], minDiff: 7, maxDiff: 18 },
            { name: 'Leśny Mag',   sprite: 'djinn',   hp: 100, atk: 25, armor: 8,  xp: 85, gold: [16,35], minDiff: 10, maxDiff: 24 },
            { name: 'Wyrm Leśny',  sprite: 'wyrm',    hp: 160, atk: 30, armor: 14, xp: 120, gold: [25,50], minDiff: 14, maxDiff: 30 },
            { name: 'Starożytny Drzewiec', sprite: 'treant', hp: 300, atk: 35, armor: 25, xp: 200, gold: [40,80], minDiff: 22, maxDiff: 99, elite: true },
        ],
        swamp: [
            { name: 'Żuk',         sprite: 'beetle',  hp: 30, atk: 12, armor: 3,  xp: 22, gold: [4,10],  minDiff: 2, maxDiff: 10 },
            { name: 'Szkielet',    sprite: 'skeleton', hp: 45, atk: 14, armor: 3,  xp: 30, gold: [6,14],  minDiff: 3, maxDiff: 12 },
            { name: 'Widmo',       sprite: 'ghost',   hp: 40, atk: 16, armor: 0,  xp: 35, gold: [6,16],  minDiff: 4, maxDiff: 14 },
            { name: 'Trujący Żuk', sprite: 'beetle',  hp: 55, atk: 18, armor: 5,  xp: 40, gold: [7,16],  minDiff: 5, maxDiff: 16 },
            { name: 'Troll',       sprite: 'troll',   hp: 90, atk: 12, armor: 10, xp: 55, gold: [10,24], minDiff: 6, maxDiff: 18 },
            { name: 'Troll Szaman',sprite: 'troll',   hp: 110, atk: 22, armor: 8,  xp: 70, gold: [12,26], minDiff: 8, maxDiff: 22 },
            { name: 'Bagiennik',   sprite: 'troll',   hp: 120, atk: 20, armor: 14, xp: 80, gold: [14,30], minDiff: 10, maxDiff: 26 },
            { name: 'Demon Bagien',sprite: 'demon',   hp: 170, atk: 28, armor: 12, xp: 110, gold: [20,45], minDiff: 14, maxDiff: 30 },
            { name: 'Hydra Bagienna', sprite: 'wyrm', hp: 350, atk: 40, armor: 20, xp: 220, gold: [45,90], minDiff: 24, maxDiff: 99, elite: true },
        ],
        mountain: [
            { name: 'Kamieniak',   sprite: 'golem',   hp: 60, atk: 10, armor: 12, xp: 40, gold: [8,18],  minDiff: 4, maxDiff: 14 },
            { name: 'Golem',       sprite: 'golem',   hp: 100, atk: 14, armor: 15, xp: 65, gold: [12,28], minDiff: 5, maxDiff: 18 },
            { name: 'Gryf',        sprite: 'griffin',  hp: 70, atk: 20, armor: 7,  xp: 55, gold: [10,22], minDiff: 6, maxDiff: 20 },
            { name: 'Jaskiniowy Niedźwiedź', sprite: 'troll', hp: 95, atk: 18, armor: 10, xp: 60, gold: [10,24], minDiff: 7, maxDiff: 18 },
            { name: 'Rycerz Cieni',sprite: 'dark_knight', hp: 80, atk: 24, armor: 12, xp: 75, gold: [16,35], minDiff: 8, maxDiff: 24 },
            { name: 'Lodowy Golem',sprite: 'ice_golem', hp: 130, atk: 18, armor: 20, xp: 90, gold: [18,38], minDiff: 10, maxDiff: 26 },
            { name: 'Smok Młody',  sprite: 'wyrm',    hp: 200, atk: 35, armor: 18, xp: 140, gold: [28,55], minDiff: 14, maxDiff: 30 },
            { name: 'Gigant Górski',sprite: 'golem',   hp: 280, atk: 38, armor: 24, xp: 180, gold: [35,70], minDiff: 20, maxDiff: 99 },
            { name: 'Prasmok',     sprite: 'wyrm',    hp: 400, atk: 50, armor: 28, xp: 280, gold: [55,110], minDiff: 28, maxDiff: 99, elite: true },
        ],
        desert: [
            { name: 'Skorpion',    sprite: 'scorpion', hp: 35, atk: 14, armor: 5,  xp: 28, gold: [5,14],  minDiff: 3, maxDiff: 12 },
            { name: 'Mumia',       sprite: 'mummy',    hp: 65, atk: 14, armor: 8,  xp: 42, gold: [8,20],  minDiff: 5, maxDiff: 16 },
            { name: 'Piaskowy Robak', sprite: 'beetle', hp: 50, atk: 16, armor: 4, xp: 35, gold: [6,15], minDiff: 4, maxDiff: 14 },
            { name: 'Dżinn',       sprite: 'djinn',    hp: 55, atk: 25, armor: 5,  xp: 65, gold: [14,30], minDiff: 7, maxDiff: 20 },
            { name: 'Ognisty Elem',sprite: 'fire_elemental', hp: 90, atk: 28, armor: 7,  xp: 85, gold: [16,35], minDiff: 9, maxDiff: 22 },
            { name: 'Sfinks',      sprite: 'djinn',    hp: 140, atk: 30, armor: 14, xp: 110, gold: [20,45], minDiff: 12, maxDiff: 28 },
            { name: 'Faraon Nieumarły', sprite: 'mummy', hp: 180, atk: 34, armor: 18, xp: 140, gold: [28,55], minDiff: 16, maxDiff: 30 },
            { name: 'Demon Piasków',sprite: 'demon',   hp: 200, atk: 38, armor: 16, xp: 150, gold: [30,60], minDiff: 18, maxDiff: 99 },
            { name: 'Wieczny Sfinks', sprite: 'djinn', hp: 380, atk: 45, armor: 26, xp: 260, gold: [50,100], minDiff: 26, maxDiff: 99, elite: true },
        ],
        snow: [
            { name: 'Wilk Śnieżny',sprite: 'wolf',     hp: 50, atk: 14, armor: 5,  xp: 32, gold: [5,14],  minDiff: 3, maxDiff: 14 },
            { name: 'Szkielet Mróz',sprite: 'skeleton',  hp: 60, atk: 16, armor: 7,  xp: 42, gold: [8,18],  minDiff: 4, maxDiff: 16 },
            { name: 'Lodowy Golem', sprite: 'ice_golem', hp: 110, atk: 16, armor: 18, xp: 70, gold: [14,28], minDiff: 6, maxDiff: 20 },
            { name: 'Yeti',         sprite: 'troll',     hp: 90, atk: 20, armor: 10, xp: 55, gold: [10,22], minDiff: 7, maxDiff: 18 },
            { name: 'Widmo Zimy',   sprite: 'ghost',     hp: 75, atk: 24, armor: 5,  xp: 60, gold: [10,25], minDiff: 8, maxDiff: 22 },
            { name: 'Lodowy Rycerz',sprite: 'dark_knight', hp: 130, atk: 28, armor: 16, xp: 95, gold: [18,38], minDiff: 12, maxDiff: 26 },
            { name: 'Mroźny Wyrm',  sprite: 'wyrm',      hp: 220, atk: 38, armor: 20, xp: 160, gold: [35,70], minDiff: 15, maxDiff: 30 },
            { name: 'Mroźny Smok',  sprite: 'wyrm',      hp: 300, atk: 44, armor: 24, xp: 220, gold: [45,85], minDiff: 22, maxDiff: 99 },
            { name: 'Król Zimy',    sprite: 'ice_golem',  hp: 420, atk: 52, armor: 30, xp: 300, gold: [60,120], minDiff: 28, maxDiff: 99, elite: true },
        ],
    },

    init(seed) {
        this.worldSeed = seed || Math.floor(Math.random() * 999999);
        Perlin.seed(this.worldSeed);
        this.chunks = {};
        this.signTexts = {};
        this.chests = {};
        this.openedChests = new Set();
        this.villages = {};
        this.npcs = {};
        this.questNpcs = {};
        this.monsters = {};
        this.questItems = {};
        this.groundLoot = {}; // "x,y" -> [items]
        this.cityNpcs = {}; // "x,y" -> npc object (wandering NPCs)
        this.houses = {}; // "x,y" -> { price, name, owned: false }
        this.townBuildings = {}; // "x,y" -> { npcName }
        this.cityNpcsSpawned = false;
        this.buildingFloors = {}; // "x,y" -> { floors: [{tiles, w, h}], name }
        this.activeBuildingFloor = null; // { key, floor, tiles, w, h, entryX, entryY, savedPos }
    },

    // ========== GROUND LOOT SYSTEM ==========
    dropGroundLoot(wx, wy, items) {
        const key = `${wx},${wy}`;
        if (!this.groundLoot[key]) this.groundLoot[key] = [];
        this.groundLoot[key].push(...items);
    },

    rng(x, y, extra) {
        let s = (x * 374761 + y * 668265 + this.worldSeed + (extra||0) * 93487) & 0x7fffffff;
        s = ((s * 16807) + 0) % 2147483647;
        return (s - 1) / 2147483646;
    },

    // 6 fixed cities defining the world
    CITIES: [
        { name: 'Stolica', cx: 0, cy: 0, biome: 0, difficulty: 1, size: 3 }, // 3x3 chunks
        { name: 'Leśny Gród', cx: -4, cy: -3, biome: 1, difficulty: 3, size: 1 },
        { name: 'Pustynny Bazar', cx: 5, cy: 2, biome: 4, difficulty: 5, size: 1 },
        { name: 'Górska Twierdza', cx: -2, cy: 4, biome: 3, difficulty: 4, size: 1 },
        { name: 'Port Morski', cx: 3, cy: -4, biome: 0, difficulty: 2, size: 1 },
        { name: 'Mroźna Cytadela', cx: -5, cy: -5, biome: 5, difficulty: 6, size: 1 },
    ],

    // World boundary radius (in tiles) - water beyond this
    WORLD_RADIUS: 140,

    // Check if position is on the starter island
    isStarterIsland(wx, wy) {
        const ic = this.getIslandCenter ? this.getIslandCenter() : {
            x: STARTER_ISLAND.cx * this.CHUNK_SIZE + Math.floor(this.CHUNK_SIZE / 2),
            y: STARTER_ISLAND.cy * this.CHUNK_SIZE + Math.floor(this.CHUNK_SIZE / 2)
        };
        const dist = Math.sqrt((wx - ic.x) ** 2 + (wy - ic.y) ** 2);
        return dist <= STARTER_ISLAND.radius;
    },

    // isStarterIslandChunk is defined in starter-island.js

    getBiome(wx, wy) {
        // Starter island is always plains biome
        if (this.isStarterIsland(wx, wy)) return this.BIOME.PLAINS;

        const scale = 0.02;
        const temp = Perlin.fbm(wx * scale + 100, wy * scale + 100, 3);
        const moisture = Perlin.fbm(wx * scale + 500, wy * scale + 500, 3);
        const dist = Math.sqrt(wx * wx + wy * wy);

        // World boundary
        if (dist > this.WORLD_RADIUS) return this.BIOME.PLAINS;

        // Near cities: use city's biome
        for (const city of this.CITIES) {
            const cdist = Math.sqrt((wx - city.cx * this.CHUNK_SIZE) ** 2 + (wy - city.cy * this.CHUNK_SIZE) ** 2);
            if (cdist < 30) return city.biome;
        }

        if (temp > 0.25) return this.BIOME.DESERT;
        if (temp < -0.35) return this.BIOME.SNOW;
        if (temp < -0.25) return this.BIOME.MOUNTAIN;
        if (moisture > 0.2) return this.BIOME.SWAMP;
        if (moisture < -0.1) return this.BIOME.FOREST;
        return this.BIOME.PLAINS;
    },

    // Fixed difficulty based on distance from nearest city
    getDifficulty(wx, wy) {
        let minDist = Infinity;
        for (const city of this.CITIES) {
            const d = Math.sqrt((wx - city.cx * this.CHUNK_SIZE) ** 2 + (wy - city.cy * this.CHUNK_SIZE) ** 2);
            minDist = Math.min(minDist, d);
        }
        // Closer to cities = easier, further = harder
        return Math.max(1, Math.min(10, Math.floor(minDist / 15) + 1));
    },

    getChunkKey(cx, cy) { return `${cx},${cy}`; },

    getChunk(cx, cy) {
        const key = this.getChunkKey(cx, cy);
        if (!this.chunks[key]) {
            this.chunks[key] = this.generateChunk(cx, cy);
        }
        return this.chunks[key];
    },

    isCapitalChunk(cx, cy) {
        return cx >= -1 && cx <= 1 && cy >= -1 && cy <= 1;
    },

    // Check if chunk belongs to any of the 6 cities
    getCityAt(cx, cy) {
        for (const city of this.CITIES) {
            const half = Math.floor(city.size / 2);
            if (cx >= city.cx - half && cx <= city.cx + half &&
                cy >= city.cy - half && cy <= city.cy + half) {
                return city;
            }
        }
        return null;
    },

    // ========== VILLAGE ==========
    isVillageChunk(cx, cy) {
        if (this.isCapitalChunk(cx, cy)) return true; // Capital city 3x3
        const vgrid = 8;
        const vcx = Math.round(cx / vgrid);
        const vcy = Math.round(cy / vgrid);
        const targetCx = vcx * vgrid + Math.floor(this.rng(vcx, vcy, 300) * 3 - 1);
        const targetCy = vcy * vgrid + Math.floor(this.rng(vcx, vcy, 301) * 3 - 1);
        return cx === targetCx && cy === targetCy;
    },

    isTileBlocked(t) {
        const T = this.T;
        return [T.WATER, T.WALL, T.TREE, T.HOUSE, T.CAVE_WALL, T.FENCE,
                T.WELL, T.STATUE, T.ROCK, T.SWAMP_TREE, T.CACTUS, T.VILLAGE_HUT,
                T.NPC_QUEST, T.NPC_QUEST2, T.NPC_SHOPKEEPER, T.SHOP_WEAPON_NPC,
                T.SHOP_ARMOR_NPC, T.SHOP_POTION_NPC, T.INN, T.CHEST,
                T.TOWN_BUILDING, T.LAVA, T.SNOW_PINE,
                T.HOUSE_WALL, T.HOUSE_ROOF, T.HOUSE_WINDOW].includes(t);
    },

    getMonsterAt(wx, wy) {
        if (this.activeDungeon) return this.getDungeonMonsterAt(wx, wy);
        const m = this.monsters[`${wx},${wy}`];
        return (m && m.alive) ? m : null;
    },

    moveMonster(m, nx, ny) {
        if (this.activeDungeon) { this.moveDungeonMonster(m, nx, ny); return; }
        if (!m || !m.alive) return;
        const oldKey = `${m.x},${m.y}`;
        const newKey = `${nx},${ny}`;
        if (this.monsters[newKey]) return;
        delete this.monsters[oldKey];
        m.x = nx;
        m.y = ny;
        this.monsters[newKey] = m;
    },

    removeMonster(m) {
        if (this.activeDungeon) { this.removeDungeonMonster(m); return; }
        if (!m) return;
        delete this.monsters[`${m.x},${m.y}`];
    },

    getMonstersNear(px, py, range) {
        if (this.activeDungeon) return this.getDungeonMonstersNear(px, py, range);
        const result = [];
        for (const key in this.monsters) {
            const m = this.monsters[key];
            if (!m.alive) continue;
            const dx = Math.abs(m.x - px);
            const dy = Math.abs(m.y - py);
            if (dx <= range && dy <= range) result.push(m);
        }
        return result;
    },

    getCityNpcAt(wx, wy) {
        const npc = this.cityNpcs[`${wx},${wy}`];
        return npc || null;
    },

    moveCityNpc(npc, nx, ny) {
        if (!npc) return;
        // Stay within bounds (home position ± wanderRange)
        const wr = npc.wanderRange || 20;
        if (Math.abs(nx - npc.homeX) > wr || Math.abs(ny - npc.homeY) > wr) return;
        const oldKey = `${npc.x},${npc.y}`;
        const newKey = `${nx},${ny}`;
        if (this.cityNpcs[newKey]) return;
        if (this.monsters[newKey]) return;
        const tile = this.getTile(nx, ny);
        if (this.isTileBlocked(tile)) return;
        delete this.cityNpcs[oldKey];
        npc.x = nx;
        npc.y = ny;
        this.cityNpcs[newKey] = npc;
    },

    getVillageName(cx, cy) {
        if (this.isCapitalChunk(cx, cy)) return 'Stolica';
        const pre = ['El','Ald','Kor','Myr','Dra','Val','Syl','Gor','Tar','Nol','Bel','Ith','Zar','Mor','Fen','Ash'];
        const suf = ['doria','heim','wald','grad','burg','ton','ria','lund','gar','mir','oth','ven','dal','sten','rok','vik'];
        return pre[Math.floor(this.rng(cx,cy,350)*pre.length)] + suf[Math.floor(this.rng(cx,cy,351)*suf.length)];
    },

    getTile(wx, wy) {
        if (this.activeBuildingFloor) return this.getBuildingTile(wx, wy);
        if (this.activeDungeon) return this.getDungeonTile(wx, wy);
        const cx = Math.floor(wx / this.CHUNK_SIZE);
        const cy = Math.floor(wy / this.CHUNK_SIZE);
        const lx = ((wx % this.CHUNK_SIZE) + this.CHUNK_SIZE) % this.CHUNK_SIZE;
        const ly = ((wy % this.CHUNK_SIZE) + this.CHUNK_SIZE) % this.CHUNK_SIZE;
        return this.getChunk(cx, cy).tiles[ly * this.CHUNK_SIZE + lx];
    },

    isWalkable(wx, wy, fromX, fromY) {
        const t = this.getTile(wx, wy);
        if (this.isTileBlocked(t)) return false;
        // House door: walkable only if owned
        if (t === this.T.HOUSE_DOOR) {
            const hk = `${wx},${wy}`;
            const house = this.houses[hk];
            if (!house) return false;
            const p = Game.player;
            if (house.owned || (p && p.ownedHouses && p.ownedHouses.includes(hk))) return true;
            return false;
        }
        if (this.getMonsterAt(wx, wy)) return false;
        if (this.getCityNpcAt(wx, wy)) return false;
        // Height check - can't climb cliffs (height diff > 1)
        if (fromX !== undefined && fromY !== undefined && !this.activeDungeon) {
            if (!this.canTraverseHeight(fromX, fromY, wx, wy)) return false;
        }
        return true;
    },

    getAreaName(wx, wy) {
        const cx = Math.floor(wx / this.CHUNK_SIZE);
        const cy = Math.floor(wy / this.CHUNK_SIZE);
        const key = this.getChunkKey(cx, cy);
        if (this.villages[key]) return this.villages[key].name;
        const biome = this.getBiome(wx, wy);
        const names = ['Równiny','Mroczny Las','Bagno','Góry','Pustkowia','Lodowe Pustkowia'];
        return `${names[biome]} (Lv.${this.getDifficulty(wx,wy)})`;
    },

    findNearestVillageWell(wx, wy) {
        let best = null, bestDist = Infinity;
        for (const key in this.villages) {
            const v = this.villages[key];
            const d = (v.wellX-wx)**2 + (v.wellY-wy)**2;
            if (d < bestDist) { bestDist = d; best = v; }
        }
        return best;
    },

    cleanupChunks(px, py) {
        const maxDist = 5;
        const pcx = Math.floor(px / this.CHUNK_SIZE);
        const pcy = Math.floor(py / this.CHUNK_SIZE);
        for (const key in this.chunks) {
            const [cx, cy] = key.split(',').map(Number);
            if (Math.abs(cx-pcx) > maxDist || Math.abs(cy-pcy) > maxDist) {
                delete this.chunks[key];
                const ox = cx * this.CHUNK_SIZE, oy = cy * this.CHUNK_SIZE;
                for (let y = oy; y < oy + this.CHUNK_SIZE; y++)
                    for (let x = ox; x < ox + this.CHUNK_SIZE; x++)
                        delete this.monsters[`${x},${y}`];
            }
        }
    },
};
