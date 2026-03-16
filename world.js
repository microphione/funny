// ============================================================
// INFINITE WORLD - Chunk-based with overworld monsters
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
        const icx = STARTER_ISLAND.cx * this.CHUNK_SIZE + Math.floor(this.CHUNK_SIZE / 2);
        const icy = STARTER_ISLAND.cy * this.CHUNK_SIZE + Math.floor(this.CHUNK_SIZE / 2);
        const dist = Math.sqrt((wx - icx) ** 2 + (wy - icy) ** 2);
        return dist <= STARTER_ISLAND.radius;
    },

    isStarterIslandChunk(cx, cy) {
        return cx >= STARTER_ISLAND.cx - 1 && cx <= STARTER_ISLAND.cx + 1 &&
               cy >= STARTER_ISLAND.cy - 1 && cy <= STARTER_ISLAND.cy + 1;
    },

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

    generateChunk(cx, cy) {
        const CS = this.CHUNK_SIZE;
        const T = this.T;
        const tiles = new Array(CS * CS);
        const ox = cx * CS;
        const oy = cy * CS;

        // Check if this is a city chunk
        const isStartingCity = this.isCapitalChunk(cx, cy);
        const cityAt = this.getCityAt(cx, cy);
        const isVillage = !cityAt && this.isVillageChunk(cx, cy);
        const isIslandChunk = this.isStarterIslandChunk(cx, cy);

        for (let ly = 0; ly < CS; ly++) {
            for (let lx = 0; lx < CS; lx++) {
                const wx = ox + lx;
                const wy = oy + ly;
                const biome = this.getBiome(wx, wy);
                let tile = T.GRASS;
                const dist = Math.sqrt(wx * wx + wy * wy);
                const elev = Perlin.fbm(wx * 0.05, wy * 0.05, 3);

                // Starter island: surrounded by water
                if (isIslandChunk) {
                    const icx = STARTER_ISLAND.cx * CS + Math.floor(CS / 2);
                    const icy = STARTER_ISLAND.cy * CS + Math.floor(CS / 2);
                    const idist = Math.sqrt((wx - icx) ** 2 + (wy - icy) ** 2);
                    if (idist > STARTER_ISLAND.radius) {
                        tiles[ly * CS + lx] = T.WATER; continue;
                    }
                    if (idist > STARTER_ISLAND.radius - 3) {
                        tile = T.DESERT; // sandy beach edge
                        if (this.rng(wx, wy, 800) < 0.15) tile = T.FLOWER;
                        tiles[ly * CS + lx] = tile; continue;
                    }
                    // Island interior
                    tile = T.GRASS;
                    if (this.rng(wx, wy, 1) < 0.03) tile = T.FLOWER;
                    if (this.rng(wx, wy, 2) < 0.02) tile = T.TREE;
                    // Paths toward center
                    if (Math.abs(wx - icx) < 1 || Math.abs(wy - icy) < 1) tile = T.PATH;
                    tiles[ly * CS + lx] = tile; continue;
                }

                // World boundary - water beyond radius
                if (dist > this.WORLD_RADIUS) { tiles[ly * CS + lx] = T.WATER; continue; }
                // Shoreline transition
                if (dist > this.WORLD_RADIUS - 10) {
                    const shore = (dist - (this.WORLD_RADIUS - 10)) / 10;
                    if (this.rng(wx, wy, 999) < shore * 0.8) { tiles[ly * CS + lx] = T.WATER; continue; }
                }

                if (elev < -0.35) { tile = T.WATER; }
                else {
                    switch (biome) {
                        case this.BIOME.PLAINS:
                            tile = T.GRASS;
                            if (this.rng(wx, wy, 1) < 0.02) tile = T.FLOWER;
                            if (this.rng(wx, wy, 2) < 0.01) tile = T.TREE;
                            break;
                        case this.BIOME.FOREST:
                            tile = T.DARK_GRASS;
                            if (this.rng(wx, wy, 3) < 0.2) tile = T.TREE;
                            if (this.rng(wx, wy, 4) < 0.005) tile = T.FLOWER;
                            break;
                        case this.BIOME.SWAMP:
                            tile = T.SWAMP;
                            if (this.rng(wx, wy, 5) < 0.08) tile = T.SWAMP_TREE;
                            if (elev < -0.15) tile = T.WATER;
                            break;
                        case this.BIOME.MOUNTAIN:
                            tile = T.MOUNTAIN;
                            if (elev > 0.3) tile = T.ROCK;
                            if (this.rng(wx, wy, 6) < 0.03) tile = T.ROCK;
                            break;
                        case this.BIOME.DESERT:
                            tile = T.DESERT;
                            if (this.rng(wx, wy, 7) < 0.015) tile = T.CACTUS;
                            break;
                        case this.BIOME.SNOW:
                            tile = T.SNOW;
                            if (this.rng(wx, wy, 8) < 0.12) tile = T.SNOW_PINE;
                            if (elev > 0.3) tile = T.ROCK;
                            break;
                    }
                }

                const pathNoise = Perlin.noise2d(wx * 0.15, wy * 0.15);
                if (Math.abs(pathNoise) < 0.03 && tile !== T.WATER) tile = T.PATH;
                tiles[ly * CS + lx] = tile;
            }
        }

        // Starting city (large, covers 3x3 chunks around origin)
        if (isStartingCity) {
            this.placeCapitalChunk(tiles, cx, cy, ox, oy);
        } else if (isIslandChunk && cx === STARTER_ISLAND.cx && cy === STARTER_ISLAND.cy) {
            this.placeStarterIslandCenter(tiles, cx, cy, ox, oy);
        } else if (cityAt && cityAt.name !== 'Stolica') {
            this.placeSmallCity(tiles, cx, cy, ox, oy, cityAt);
        } else if (isVillage) {
            this.placeVillage(tiles, cx, cy, ox, oy);
        }

        // Dungeon entrance (not in villages or starting city)
        if (!isVillage && !isStartingCity && this.rng(cx, cy, 100) < 0.06) {
            const dx = Math.floor(this.rng(cx, cy, 101) * (CS - 4)) + 2;
            const dy = Math.floor(this.rng(cx, cy, 102) * (CS - 4)) + 2;
            if (tiles[dy * CS + dx] !== T.WATER) {
                tiles[dy * CS + dx] = T.CAVE_ENTRY;
                for (let d = -1; d <= 1; d++) for (let e = -1; e <= 1; e++) {
                    if (d === 0 && e === 0) continue;
                    const ni = (dy + e) * CS + (dx + d);
                    if (ni >= 0 && ni < CS * CS && tiles[ni] !== T.CAVE_ENTRY) tiles[ni] = T.CAVE_WALL;
                }
            }
        }

        // Chests
        if (this.rng(cx, cy, 200) < 0.15 && !isStartingCity) {
            const chx = Math.floor(this.rng(cx, cy, 201) * (CS - 2)) + 1;
            const chy = Math.floor(this.rng(cx, cy, 202) * (CS - 2)) + 1;
            const cidx = chy * CS + chx;
            if (tiles[cidx] !== T.WATER && tiles[cidx] !== T.ROCK && tiles[cidx] !== T.CAVE_WALL) {
                tiles[cidx] = T.CHEST;
                const diff = this.getDifficulty(ox + chx, oy + chy);
                this.chests[`${ox+chx},${oy+chy}`] = {
                    gold: Math.floor(5 + diff * 8 * this.rng(cx, cy, 203)),
                };
            }
        }

        // Spawn monsters (not in villages, cities, or starting city)
        if (isIslandChunk && !(cx === STARTER_ISLAND.cx && cy === STARTER_ISLAND.cy)) {
            this.spawnStarterIslandMonsters(cx, cy, ox, oy, tiles);
        } else if (!isVillage && !isStartingCity && !cityAt && !isIslandChunk) {
            this.spawnChunkMonsters(cx, cy, ox, oy, tiles);
        }

        return { tiles, biome: this.getBiome(ox + CS/2, oy + CS/2) };
    },

    // ========== CAPITAL CITY (3x3 chunks) ==========
    placeCapitalChunk(tiles, cx, cy, ox, oy) {
        const CS = this.CHUNK_SIZE;
        const T = this.T;
        const center = Math.floor(CS / 2);

        // Fill with stone floor
        for (let dy = 0; dy < CS; dy++)
            for (let dx = 0; dx < CS; dx++)
                tiles[dy * CS + dx] = T.STONE_FLOOR;

        // Wide main avenues (2 tiles wide) through center of chunk
        for (let i = 0; i < CS; i++) {
            tiles[center * CS + i] = T.PATH;
            tiles[(center - 1) * CS + i] = T.PATH;
            tiles[i * CS + center] = T.PATH;
            tiles[i * CS + (center - 1)] = T.PATH;
        }

        // Secondary streets at 1/3 and 2/3 positions
        const s1 = Math.floor(CS / 3), s2 = Math.floor(CS * 2 / 3);
        for (let i = 0; i < CS; i++) {
            if (tiles[s1 * CS + i] === T.STONE_FLOOR) tiles[s1 * CS + i] = T.PATH;
            if (tiles[s2 * CS + i] === T.STONE_FLOOR) tiles[s2 * CS + i] = T.PATH;
            if (tiles[i * CS + s1] === T.STONE_FLOOR) tiles[i * CS + s1] = T.PATH;
            if (tiles[i * CS + s2] === T.STONE_FLOOR) tiles[i * CS + s2] = T.PATH;
        }

        // Street lamps (signs) at intersections
        const lampSpots = [[s1 - 1, s1 - 1], [s2 + 1, s1 - 1], [s1 - 1, s2 + 1], [s2 + 1, s2 + 1]];
        for (const [lx, ly] of lampSpots) {
            if (lx > 0 && lx < CS - 1 && ly > 0 && ly < CS - 1 && tiles[ly * CS + lx] === T.STONE_FLOOR) {
                tiles[ly * CS + lx] = T.STATUE;
            }
        }

        // Outer wall only on edges of the 3x3 area (with 2-wide gates)
        if (cx === -1) { for (let dy = 0; dy < CS; dy++) tiles[dy * CS + 0] = T.FENCE; tiles[center * CS + 0] = T.PATH; tiles[(center-1) * CS + 0] = T.PATH; }
        if (cx === 1)  { for (let dy = 0; dy < CS; dy++) tiles[dy * CS + (CS-1)] = T.FENCE; tiles[center * CS + (CS-1)] = T.PATH; tiles[(center-1) * CS + (CS-1)] = T.PATH; }
        if (cy === -1) { for (let dx = 0; dx < CS; dx++) tiles[0 * CS + dx] = T.FENCE; tiles[0 * CS + center] = T.PATH; tiles[0 * CS + (center-1)] = T.PATH; }
        if (cy === 1)  { for (let dx = 0; dx < CS; dx++) tiles[(CS-1) * CS + dx] = T.FENCE; tiles[(CS-1) * CS + center] = T.PATH; tiles[(CS-1) * CS + (center-1)] = T.PATH; }
        // Corner fences
        if (cx === -1 && cy === -1) tiles[0] = T.FENCE;
        if (cx === 1 && cy === -1) tiles[CS - 1] = T.FENCE;
        if (cx === -1 && cy === 1) tiles[(CS-1) * CS] = T.FENCE;
        if (cx === 1 && cy === 1) tiles[(CS-1) * CS + (CS-1)] = T.FENCE;

        // Generate specific content based on chunk position
        if (cx === 0 && cy === 0) this.placeCapitalCenter(tiles, ox, oy);
        else if (cx === -1 && cy === 0) this.placeCapitalWest(tiles, ox, oy);
        else if (cx === 1 && cy === 0) this.placeCapitalEast(tiles, ox, oy);
        else if (cx === 0 && cy === -1) this.placeCapitalNorth(tiles, ox, oy);
        else if (cx === 0 && cy === 1) this.placeCapitalSouth(tiles, ox, oy);
        else if (cx === -1 && cy === -1) this.placeCapitalNW(tiles, ox, oy);
        else if (cx === 1 && cy === -1) this.placeCapitalNE(tiles, ox, oy);
        else if (cx === -1 && cy === 1) this.placeCapitalSW(tiles, ox, oy);
        else if (cx === 1 && cy === 1) this.placeCapitalSE(tiles, ox, oy);

        // Register all capital chunks under "Stolica" village
        // Well is in center of chunk (0,0) at world coords (center, center)
        const wellOx = Math.floor(this.CHUNK_SIZE / 2);
        const wellOy = Math.floor(this.CHUNK_SIZE / 2);
        this.villages[this.getChunkKey(cx, cy)] = {
            name: 'Stolica', difficulty: 1,
            wellX: wellOx, wellY: wellOy
        };

        // Spawn city NPCs once (when center chunk generates)
        if (cx === 0 && cy === 0 && !this.cityNpcsSpawned) {
            this.spawnCityNpcs();
            this.cityNpcsSpawned = true;
        }
    },

    // Helper: place a decorative building (not enterable, just visual)
    placeBuilding(tiles, ox, oy, bx, by, w, h) {
        const CS = this.CHUNK_SIZE;
        const T = this.T;
        for (let ddy = 0; ddy < h; ddy++)
            for (let ddx = 0; ddx < w; ddx++) {
                const ty = by + ddy, tx = bx + ddx;
                if (ty >= 0 && ty < CS && tx >= 0 && tx < CS)
                    tiles[ty * CS + tx] = T.HOUSE;
            }
    },

    // Helper: place a town building with proper walls, roof, floor, door + NPC inside
    placeTownBuilding(tiles, ox, oy, bx, by, w, h, npcName) {
        const CS = this.CHUNK_SIZE;
        const T = this.T;
        const doorX = bx + Math.floor(w / 2);
        const doorY = by + h - 1;
        const houseId = `tb_${ox + doorX},${oy + doorY}`;

        const floorTiles = [];
        const roofTiles = [];
        const wallTiles = [];

        for (let ddy = 0; ddy < h; ddy++) {
            for (let ddx = 0; ddx < w; ddx++) {
                const ty = by + ddy, tx = bx + ddx;
                if (ty < 0 || ty >= CS || tx < 0 || tx >= CS) continue;
                const idx = ty * CS + tx;
                const isEdge = ddy === 0 || ddy === h - 1 || ddx === 0 || ddx === w - 1;
                const isDoor = tx === doorX && ty === doorY;

                if (isDoor) {
                    tiles[idx] = T.TOWN_BUILDING_DOOR;
                } else if (isEdge) {
                    const isMidH = ddx === Math.floor(w / 2) && ddy === 0;
                    const isMidV = ddy === Math.floor(h / 2) && (ddx === 0 || ddx === w - 1);
                    if ((isMidH || isMidV) && w >= 4) {
                        tiles[idx] = T.HOUSE_WINDOW;
                    } else {
                        tiles[idx] = T.HOUSE_WALL;
                    }
                    wallTiles.push(`${ox + tx},${oy + ty}`);
                } else {
                    tiles[idx] = T.HOUSE_FLOOR;
                    floorTiles.push(`${ox + tx},${oy + ty}`);
                }
                roofTiles.push(`${ox + tx},${oy + ty}`);
            }
        }

        // Place NPC on interior tile
        const npcX = bx + Math.floor(w / 2);
        const npcY = by + 1;
        if (npcX >= 0 && npcX < CS && npcY >= 0 && npcY < CS) {
            tiles[npcY * CS + npcX] = T.NPC_QUEST;
            this.questNpcs[`${ox + npcX},${oy + npcY}`] = {
                id: `npc_${npcName}_${ox + npcX}`, type: 'town_npc',
                name: npcName || 'Mieszkaniec',
            };
        }

        // Register as house for roof hiding system
        this.houses[houseId] = {
            price: 0, name: `Budynek: ${npcName}`, owned: true,
            floorTiles, roofTiles, wallTiles,
            bx: ox + bx, by: oy + by, w, h, isTownBuilding: true,
        };

        // Store door info
        const doorKey = `${ox + doorX},${oy + doorY}`;
        this.townBuildings = this.townBuildings || {};
        this.townBuildings[doorKey] = { npcName: npcName || 'Mieszkaniec', houseId };
    },

    // Helper: place a buyable house with proper walls, roof, floor, door
    placeBuyableHouse(tiles, ox, oy, bx, by, w, h, price, name) {
        const CS = this.CHUNK_SIZE;
        const T = this.T;
        const doorX = bx + Math.floor(w / 2);
        const doorY = by + h - 1;
        const houseId = `${ox + doorX},${oy + doorY}`;

        const floorTiles = [];
        const roofTiles = [];
        const wallTiles = [];

        for (let ddy = 0; ddy < h; ddy++) {
            for (let ddx = 0; ddx < w; ddx++) {
                const ty = by + ddy, tx = bx + ddx;
                if (ty < 0 || ty >= CS || tx < 0 || tx >= CS) continue;
                const idx = ty * CS + tx;
                const isEdge = ddy === 0 || ddy === h - 1 || ddx === 0 || ddx === w - 1;
                const isDoor = tx === doorX && ty === doorY;

                if (isDoor) {
                    tiles[idx] = T.HOUSE_DOOR;
                } else if (isEdge) {
                    // Window on side walls (middle of each wall, not corners)
                    const isMidH = ddx === Math.floor(w / 2) && (ddy === 0);
                    const isMidV = ddy === Math.floor(h / 2) && (ddx === 0 || ddx === w - 1);
                    if ((isMidH || isMidV) && w >= 4) {
                        tiles[idx] = T.HOUSE_WINDOW;
                    } else {
                        tiles[idx] = T.HOUSE_WALL;
                    }
                    wallTiles.push(`${ox + tx},${oy + ty}`);
                } else {
                    // Interior floor
                    tiles[idx] = T.HOUSE_FLOOR;
                    floorTiles.push(`${ox + tx},${oy + ty}`);
                }
            }
        }

        // Roof tiles cover the interior (rendered as overlay, hidden when player inside)
        for (let ddy = 0; ddy < h; ddy++) {
            for (let ddx = 0; ddx < w; ddx++) {
                const ty = by + ddy, tx = bx + ddx;
                if (ty < 0 || ty >= CS || tx < 0 || tx >= CS) continue;
                roofTiles.push(`${ox + tx},${oy + ty}`);
            }
        }

        this.houses[houseId] = {
            price, name, owned: false,
            floorTiles, roofTiles, wallTiles,
            bx: ox + bx, by: oy + by, w, h
        };
    },

    // Center (0,0): Grand town square with fountain, quest boards, key NPCs
    placeCapitalCenter(tiles, ox, oy) {
        const CS = this.CHUNK_SIZE;
        const T = this.T;
        const c = Math.floor(CS / 2);

        // Grand fountain plaza (3x3 area around center)
        for (let dy = -2; dy <= 2; dy++)
            for (let dx = -2; dx <= 2; dx++) {
                const px = c + dx, py = c + dy;
                if (px > 0 && px < CS-1 && py > 0 && py < CS-1)
                    tiles[py * CS + px] = T.STONE_FLOOR;
            }
        tiles[c * CS + c] = T.WELL; // Central fountain / save point
        tiles[(c - 2) * CS + (c - 2)] = T.STATUE;
        tiles[(c - 2) * CS + (c + 2)] = T.STATUE;
        tiles[(c + 2) * CS + (c - 2)] = T.STATUE;
        tiles[(c + 2) * CS + (c + 2)] = T.STATUE;

        // Decorative flowers around plaza
        for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) {
            if (Math.abs(i) + Math.abs(j) === 3) {
                const fx = c + i, fy = c + j;
                if (fx > 0 && fx < CS-1 && fy > 0 && fy < CS-1 && tiles[fy*CS+fx] === T.STONE_FLOOR)
                    tiles[fy * CS + fx] = T.FLOWER;
            }
        }

        // Welcome sign
        tiles[(c - 3) * CS + c] = T.SIGN;
        this.signTexts[`${ox + c},${oy + c - 3}`] = 'Witaj w Stolicy Krainy!\nPlac Główny - serce miasta.';

        // Town buildings in the four quadrants
        this.placeTownBuilding(tiles, ox, oy, 1, 1, 4, 3, 'Bibliotekarz');
        this.placeTownBuilding(tiles, ox, oy, CS-5, 1, 4, 3, 'Kartograf');
        this.placeTownBuilding(tiles, ox, oy, 1, CS-4, 4, 3, 'Alchemik');
        this.placeTownBuilding(tiles, ox, oy, CS-5, CS-4, 4, 3, 'Jubiler');

        // Bankier building near center
        this.placeTownBuilding(tiles, ox, oy, 1, c - 1, 3, 3, 'Bankier');

        // Quest Board NPC (main quests)
        tiles[(c + 3) * CS + (c - 3)] = T.NPC_QUEST;
        this.questNpcs[`${ox + c - 3},${oy + c + 3}`] = {
            id: 'quest_board', type: 'quest_board', name: 'Tablica Questów',
        };
        // Daily quest NPC
        tiles[(c + 3) * CS + (c + 3)] = T.NPC_QUEST;
        this.questNpcs[`${ox + c + 3},${oy + c + 3}`] = {
            id: 'daily_board', type: 'daily_quest', name: 'Dzienny Zleceniodawca',
        };

        // Benches along the plaza
        tiles[(c - 1) * CS + (c - 3)] = T.STATUE;
        tiles[(c - 1) * CS + (c + 3)] = T.STATUE;
    },

    // West (-1,0): Market district - weapon shop, market stalls, food vendors
    placeCapitalWest(tiles, ox, oy) {
        const CS = this.CHUNK_SIZE;
        const T = this.T;

        // Weapon shop (proper building)
        this.placeTownBuilding(tiles, ox, oy, 2, 2, 5, 4, 'Kowal');
        // Register as weapon shop
        const wsNpcX = 2 + Math.floor(5 / 2), wsNpcY = 2 + 1;
        this.npcs[`${ox + wsNpcX},${oy + wsNpcY}`] = { type: 'shop', shopType: 'weapon', difficulty: 1, villageName: 'Stolica' };
        tiles[1 * CS + 4] = T.SIGN;
        this.signTexts[`${ox + 4},${oy + 1}`] = 'Kowalnia "Stalowe Ostrze"';

        // Market stalls (town buildings with NPCs)
        this.placeTownBuilding(tiles, ox, oy, 2, 8, 4, 3, 'Handlarz Warzyw');
        this.placeTownBuilding(tiles, ox, oy, 2, 12, 4, 3, 'Piekarz');
        this.placeTownBuilding(tiles, ox, oy, 2, 16, 4, 3, 'Rzeźnik');
        tiles[7 * CS + 3] = T.SIGN;
        this.signTexts[`${ox + 3},${oy + 7}`] = 'Targ Miejski';

        // Buyable houses (east side of chunk)
        this.placeBuyableHouse(tiles, ox, oy, 12, 2, 4, 3, 200, 'Dom przy Targu #1');
        this.placeBuyableHouse(tiles, ox, oy, 12, 7, 4, 3, 250, 'Dom przy Targu #2');
        this.placeBuyableHouse(tiles, ox, oy, 12, 12, 4, 3, 200, 'Dom przy Targu #3');

        // Market decorations - flower pots & trees
        tiles[17 * CS + 2] = T.TREE;
        tiles[17 * CS + 5] = T.TREE;
        tiles[7 * CS + 8] = T.FLOWER;
        tiles[11 * CS + 8] = T.FLOWER;
    },

    // East (1,0): Crafting district - armor shop, potion shop, enchanter
    placeCapitalEast(tiles, ox, oy) {
        const CS = this.CHUNK_SIZE;
        const T = this.T;

        // Armor shop (proper building)
        this.placeTownBuilding(tiles, ox, oy, 11, 2, 5, 4, 'Płatnerz');
        const asNpcX = 11 + Math.floor(5 / 2), asNpcY = 2 + 1;
        this.npcs[`${ox + asNpcX},${oy + asNpcY}`] = { type: 'shop', shopType: 'armor', difficulty: 1, villageName: 'Stolica' };
        tiles[1 * CS + 13] = T.SIGN;
        this.signTexts[`${ox + 13},${oy + 1}`] = 'Płatnerz "Żelazny Mur"';

        // Potion shop (proper building)
        this.placeTownBuilding(tiles, ox, oy, 11, 8, 5, 4, 'Aptekarz');
        const psNpcX = 11 + Math.floor(5 / 2), psNpcY = 8 + 1;
        this.npcs[`${ox + psNpcX},${oy + psNpcY}`] = { type: 'shop', shopType: 'potion', difficulty: 1, villageName: 'Stolica' };
        tiles[7 * CS + 13] = T.SIGN;
        this.signTexts[`${ox + 13},${oy + 7}`] = 'Alchemik "Złoty Eliksir"';

        // Enchanter building
        this.placeTownBuilding(tiles, ox, oy, 11, 14, 5, 4, 'Zaklinacz');

        // Buyable houses (west side)
        this.placeBuyableHouse(tiles, ox, oy, 2, 2, 4, 3, 300, 'Dom Wschodni #1');
        this.placeBuyableHouse(tiles, ox, oy, 2, 7, 4, 3, 300, 'Dom Wschodni #2');
        this.placeBuyableHouse(tiles, ox, oy, 2, 12, 4, 3, 350, 'Dom Wschodni #3');

        // Decorative trees
        tiles[17 * CS + 15] = T.TREE;
        tiles[17 * CS + 12] = T.TREE;
    },

    // North (0,-1): Temple district, quest NPCs, training ground
    placeCapitalNorth(tiles, ox, oy) {
        const CS = this.CHUNK_SIZE;
        const T = this.T;
        const c = Math.floor(CS / 2);

        // Temple building (large, proper building)
        this.placeTownBuilding(tiles, ox, oy, c - 3, 2, 7, 5, 'Kapłan');
        tiles[1 * CS + c] = T.SIGN;
        this.signTexts[`${ox + c},${oy + 1}`] = 'Świątynia Światła';

        // Statues flanking temple entrance
        tiles[6 * CS + (c - 4)] = T.STATUE;
        tiles[6 * CS + (c + 4)] = T.STATUE;

        // Quest NPCs (south half of chunk)
        const q1x = c - 4, q1y = 12;
        tiles[q1y * CS + q1x] = T.NPC_QUEST;
        this.questNpcs[`${ox+q1x},${oy+q1y}`] = this.generateQuest(0, -1, 0, 1, 'Stolica');
        const q2x = c + 4, q2y = 12;
        tiles[q2y * CS + q2x] = T.NPC_QUEST2;
        this.questNpcs[`${ox+q2x},${oy+q2y}`] = this.generateQuest(0, -1, 1, 1, 'Stolica');

        // Training ground area (bottom-left)
        tiles[14 * CS + 2] = T.SIGN;
        this.signTexts[`${ox + 2},${oy + 14}`] = 'Pole Treningowe\nBij potwory aby\npoprawić umiejętności!';
        // Training dummies (statues)
        tiles[15 * CS + 3] = T.STATUE;
        tiles[15 * CS + 5] = T.STATUE;
        tiles[16 * CS + 4] = T.STATUE;

        // Buyable houses along sides
        this.placeBuyableHouse(tiles, ox, oy, 1, 14, 4, 3, 400, 'Dom Kapłański #1');
        this.placeBuyableHouse(tiles, ox, oy, CS - 5, 14, 4, 3, 400, 'Dom Kapłański #2');
    },

    // South (0,1): Inn district, residential area
    placeCapitalSouth(tiles, ox, oy) {
        const CS = this.CHUNK_SIZE;
        const T = this.T;
        const c = Math.floor(CS / 2);

        // Inn (proper building, large)
        this.placeTownBuilding(tiles, ox, oy, c - 3, 1, 6, 4, 'Karczmarz');
        // Place inn tile at entrance for save functionality
        const innDoorX = c - 3 + Math.floor(6 / 2);
        tiles[4 * CS + innDoorX] = T.INN;
        tiles[0 * CS + c] = T.SIGN;
        this.signTexts[`${ox + c},${oy + 0}`] = 'Karczma "Pod Złotym Smokiem"';

        // Residential area - buyable houses in organized rows
        this.placeBuyableHouse(tiles, ox, oy, 1, 7, 4, 3, 500, 'Kamienica Południowa #1');
        this.placeBuyableHouse(tiles, ox, oy, 8, 7, 4, 3, 500, 'Kamienica Południowa #2');
        this.placeBuyableHouse(tiles, ox, oy, 15, 7, 4, 3, 500, 'Kamienica Południowa #3');
        this.placeBuyableHouse(tiles, ox, oy, 1, 12, 4, 3, 600, 'Willa Południowa #1');
        this.placeBuyableHouse(tiles, ox, oy, 8, 12, 4, 3, 600, 'Willa Południowa #2');
        this.placeBuyableHouse(tiles, ox, oy, 15, 12, 4, 3, 650, 'Willa Południowa #3');

        // Garden path between house rows
        tiles[11 * CS + 3] = T.FLOWER;
        tiles[11 * CS + 10] = T.FLOWER;
        tiles[11 * CS + 17] = T.FLOWER;
    },

    // NW (-1,-1): Royal Park with hedge maze and pond
    placeCapitalNW(tiles, ox, oy) {
        const CS = this.CHUNK_SIZE;
        const T = this.T;

        // Park paths in a cross pattern
        for (let i = 2; i < CS - 2; i++) {
            if (tiles[10 * CS + i] !== T.PATH) tiles[10 * CS + i] = T.PATH;
            if (tiles[i * CS + 10] !== T.PATH) tiles[i * CS + 10] = T.PATH;
        }

        // Trees arranged in park-like clusters
        const parkTrees = [[2,2],[4,2],[2,4],[5,5],[3,8],[7,3],[8,7],[3,14],[5,12],[7,15],
                           [12,2],[14,4],[12,7],[15,3],[14,14],[12,12],[15,8],[11,16]];
        parkTrees.forEach(([px, py]) => { if (px < CS && py < CS && tiles[py*CS+px] === T.STONE_FLOOR) tiles[py * CS + px] = T.TREE; });

        // Flower beds between trees
        const flowers = [[3,3],[5,3],[6,4],[4,6],[4,9],[6,8],[8,5],[13,3],[13,6],[11,5],
                         [13,13],[11,11],[4,13],[6,14],[15,10],[14,8]];
        flowers.forEach(([px, py]) => { if (px < CS && py < CS && tiles[py*CS+px] === T.STONE_FLOOR) tiles[py * CS + px] = T.FLOWER; });

        // Central fountain statue
        tiles[10 * CS + 10] = T.STATUE;
        tiles[8 * CS + 10] = T.SIGN;
        this.signTexts[`${ox + 10},${oy + 8}`] = 'Park Królewski\nMiejsce spokoju i odpoczynku.';

        // Benches (statues)
        tiles[10 * CS + 8] = T.STATUE;
        tiles[10 * CS + 12] = T.STATUE;
        tiles[12 * CS + 10] = T.STATUE;

        // Small pond (water)
        for (let dy = 4; dy <= 6; dy++)
            for (let dx = 13; dx <= 16; dx++)
                if (tiles[dy * CS + dx] === T.STONE_FLOOR) tiles[dy * CS + dx] = T.WATER;
    },

    // NE (1,-1): Noble district - grand residences with gardens
    placeCapitalNE(tiles, ox, oy) {
        const CS = this.CHUNK_SIZE;
        const T = this.T;

        tiles[1 * CS + 5] = T.SIGN;
        this.signTexts[`${ox + 5},${oy + 1}`] = 'Dzielnica Szlachecka';

        // Grand residences (larger, spaced out with gardens)
        this.placeBuyableHouse(tiles, ox, oy, 1, 2, 5, 4, 1000, 'Rezydencja Szlachecka #1');
        this.placeBuyableHouse(tiles, ox, oy, 11, 2, 5, 4, 1200, 'Rezydencja Szlachecka #2');
        this.placeBuyableHouse(tiles, ox, oy, 1, 11, 5, 4, 1000, 'Rezydencja Szlachecka #3');
        this.placeBuyableHouse(tiles, ox, oy, 11, 11, 5, 4, 1500, 'Pałacyk Szlachecki');

        // Private gardens between houses
        const gardenFlowers = [[3,7],[4,8],[5,7],[13,7],[14,8],[15,7],[8,4],[8,13],[7,5],[7,12]];
        gardenFlowers.forEach(([fx, fy]) => { if (tiles[fy*CS+fx] === T.STONE_FLOOR) tiles[fy*CS+fx] = T.FLOWER; });

        // Ornamental trees
        tiles[8 * CS + 2] = T.TREE;
        tiles[8 * CS + 16] = T.TREE;
        tiles[17 * CS + 5] = T.TREE;
        tiles[17 * CS + 13] = T.TREE;

        // Central statue/fountain
        tiles[8 * CS + 8] = T.STATUE;
    },

    // SW (-1,1): Worker district - cheap housing, workshops
    placeCapitalSW(tiles, ox, oy) {
        const CS = this.CHUNK_SIZE;
        const T = this.T;

        tiles[1 * CS + 4] = T.SIGN;
        this.signTexts[`${ox + 4},${oy + 1}`] = 'Dzielnica Robotnicza';

        // Workshop buildings
        this.placeTownBuilding(tiles, ox, oy, 1, 2, 4, 3, 'Cieśla');
        this.placeTownBuilding(tiles, ox, oy, 1, 7, 4, 3, 'Garncarz');

        // Cheap buyable houses (3x3 grid, tightly packed)
        this.placeBuyableHouse(tiles, ox, oy, 8, 2, 3, 3, 100, 'Chata Robotnicza #1');
        this.placeBuyableHouse(tiles, ox, oy, 13, 2, 3, 3, 100, 'Chata Robotnicza #2');
        this.placeBuyableHouse(tiles, ox, oy, 8, 7, 3, 3, 120, 'Chata Robotnicza #3');
        this.placeBuyableHouse(tiles, ox, oy, 13, 7, 3, 3, 120, 'Chata Robotnicza #4');
        this.placeBuyableHouse(tiles, ox, oy, 1, 12, 3, 3, 100, 'Chata Robotnicza #5');
        this.placeBuyableHouse(tiles, ox, oy, 6, 12, 3, 3, 120, 'Chata Robotnicza #6');
        this.placeBuyableHouse(tiles, ox, oy, 11, 12, 3, 3, 150, 'Domek Robotniczy #1');

        // Well for workers
        tiles[16 * CS + 4] = T.WELL;
    },

    // SE (1,1): Farm & stables district
    placeCapitalSE(tiles, ox, oy) {
        const CS = this.CHUNK_SIZE;
        const T = this.T;

        tiles[1 * CS + 5] = T.SIGN;
        this.signTexts[`${ox + 5},${oy + 1}`] = 'Farmy i Stajnie';

        // Farm buildings with NPCs
        this.placeTownBuilding(tiles, ox, oy, 1, 2, 4, 3, 'Rolnik');
        this.placeTownBuilding(tiles, ox, oy, 1, 7, 4, 3, 'Stajennik');
        this.placeTownBuilding(tiles, ox, oy, 1, 12, 4, 3, 'Ogrodnik');

        // Crop fields (organized rows of flowers)
        for (let dy = 2; dy < 8; dy++)
            for (let dx = 11; dx < 18; dx++)
                if ((dy + dx) % 2 === 0 && tiles[dy * CS + dx] === T.STONE_FLOOR) tiles[dy * CS + dx] = T.FLOWER;

        // Fence around fields
        for (let dx = 10; dx < 18; dx++) {
            if (tiles[1 * CS + dx] === T.STONE_FLOOR) tiles[1 * CS + dx] = T.FENCE;
            if (tiles[8 * CS + dx] === T.STONE_FLOOR) tiles[8 * CS + dx] = T.FENCE;
        }
        for (let dy = 1; dy <= 8; dy++) {
            if (tiles[dy * CS + 10] === T.STONE_FLOOR) tiles[dy * CS + 10] = T.FENCE;
        }
        tiles[4 * CS + 10] = T.PATH; // gate to fields

        // Buyable farmhouses
        this.placeBuyableHouse(tiles, ox, oy, 11, 11, 4, 3, 300, 'Farma #1');
        this.placeBuyableHouse(tiles, ox, oy, 11, 15, 4, 3, 350, 'Farma #2');

        // Hay bales (statues)
        tiles[15 * CS + 4] = T.STATUE;
        tiles[16 * CS + 5] = T.STATUE;
    },

    // ========== SMALL CITIES (non-capital, 1 chunk each) ==========
    placeSmallCity(tiles, cx, cy, ox, oy, city) {
        const CS = this.CHUNK_SIZE;
        const T = this.T;
        const center = Math.floor(CS / 2);

        // Fill with stone floor
        for (let dy = 1; dy < CS - 1; dy++)
            for (let dx = 1; dx < CS - 1; dx++)
                tiles[dy * CS + dx] = T.STONE_FLOOR;

        // Perimeter fence
        for (let i = 0; i < CS; i++) {
            tiles[i] = T.FENCE;
            tiles[(CS - 1) * CS + i] = T.FENCE;
            tiles[i * CS] = T.FENCE;
            tiles[i * CS + (CS - 1)] = T.FENCE;
        }
        // Gates (openings in fence)
        tiles[0 * CS + center] = T.PATH; // north gate
        tiles[(CS-1) * CS + center] = T.PATH; // south gate
        tiles[center * CS + 0] = T.PATH; // west gate
        tiles[center * CS + (CS-1)] = T.PATH; // east gate

        // Main crossroads
        for (let i = 1; i < CS - 1; i++) {
            tiles[center * CS + i] = T.PATH;
            tiles[i * CS + center] = T.PATH;
        }

        // Trees along paths
        const treeSpots = [
            [3, 3], [3, CS-4], [CS-4, 3], [CS-4, CS-4],
            [center-2, 3], [center+2, 3], [center-2, CS-4], [center+2, CS-4]
        ];
        for (const [tx, ty] of treeSpots) {
            if (tiles[ty * CS + tx] === T.STONE_FLOOR) tiles[ty * CS + tx] = T.TREE;
        }

        // Shops
        tiles[3 * CS + 3] = T.SHOP_WEAPON_NPC;
        this.npcs[`${ox+3},${oy+3}`] = { name: 'Kowal', difficulty: city.difficulty };
        tiles[3 * CS + 5] = T.SHOP_ARMOR_NPC;
        this.npcs[`${ox+5},${oy+3}`] = { name: 'Płatnerz', difficulty: city.difficulty };
        tiles[3 * CS + 7] = T.SHOP_POTION_NPC;
        this.npcs[`${ox+7},${oy+3}`] = { name: 'Alchemik', difficulty: city.difficulty };

        // Inn
        tiles[5 * CS + CS - 4] = T.INN;

        // Well (save point)
        tiles[(center + 2) * CS + center] = T.WELL;

        // Sign
        tiles[2 * CS + center] = T.SIGN;
        this.signTexts[`${ox + center},${oy + 2}`] = `Witamy w ${city.name}!`;

        // Statue
        tiles[center * CS + center] = T.STATUE;

        // Quest NPCs
        tiles[8 * CS + 4] = T.NPC_QUEST;
        const questId = `${city.name}_quest1`;
        this.questNpcs[`${ox + 4},${oy + 8}`] = {
            id: questId, title: `Zadanie z ${city.name}`,
            type: 'kill', target: this.getCityQuestTarget(city),
            required: 5 + city.difficulty * 2,
            reward: { gold: 50 * city.difficulty, xp: 30 * city.difficulty },
            targetX: ox + center, targetY: oy + center,
            itemName: null
        };

        // Town buildings with NPCs
        this.placeTownBuilding(tiles, ox, oy, CS - 7, 5, 4, 3, 'Bibliotekarz');
        this.placeTownBuilding(tiles, ox, oy, CS - 7, 10, 4, 3, 'Kupiec');
        this.placeTownBuilding(tiles, ox, oy, 3, 12, 3, 3, 'Bankier');

        // Buyable houses
        this.placeBuyableHouse(tiles, ox, oy, 3, CS - 7, 4, 3, 200 * city.difficulty, `Dom w ${city.name} #1`);
        this.placeBuyableHouse(tiles, ox, oy, 9, CS - 7, 4, 3, 250 * city.difficulty, `Dom w ${city.name} #2`);

        // Register as village
        this.villages[this.getChunkKey(cx, cy)] = {
            name: city.name, difficulty: city.difficulty,
            wellX: ox + center, wellY: oy + center + 2
        };
    },

    getCityQuestTarget(city) {
        const targets = {
            1: 'Szczur', 2: 'Wilk', 3: 'Pająk Leśny',
            4: 'Golem Skalny', 5: 'Skorpion', 6: 'Lodowy Golem'
        };
        return targets[city.difficulty] || 'Szczur';
    },

    // ========== CITY NPCs (wandering) ==========
    spawnCityNpcs() {
        const npcDefs = [
            { name: 'Strażnik Miejski', sprite: 'city_guard', role: 'guard', speed: 3.0 },
            { name: 'Strażnik Bramy', sprite: 'city_guard', role: 'guard', speed: 3.5 },
            { name: 'Strażnik Patrolu', sprite: 'city_guard', role: 'guard', speed: 2.5 },
            { name: 'Kupiec Tomasz', sprite: 'city_merchant', role: 'citizen', speed: 4.0 },
            { name: 'Rolnik Jan', sprite: 'city_elder', role: 'citizen', speed: 4.5 },
            { name: 'Kowalowa Anna', sprite: 'city_woman', role: 'citizen', speed: 5.0 },
            { name: 'Stary Mędrzec', sprite: 'city_elder', role: 'citizen', speed: 6.0 },
            { name: 'Młody Uczeń', sprite: 'city_bard', role: 'citizen', speed: 2.0 },
            { name: 'Pani Herbatka', sprite: 'city_woman', role: 'citizen', speed: 5.0 },
            { name: 'Łowca Nagród', sprite: 'city_merchant', role: 'citizen', speed: 3.0 },
            { name: 'Kapłan Świątyni', sprite: 'city_priest', role: 'citizen', speed: 6.0 },
            { name: 'Bard Podróżnik', sprite: 'city_bard', role: 'citizen', speed: 3.5 },
            { name: 'Kwiaciarka Ola', sprite: 'city_woman', role: 'citizen', speed: 4.0 },
            { name: 'Rycerz Honorowy', sprite: 'city_guard', role: 'guard', speed: 4.0 },
            { name: 'Złodziej Kieszonkowy', sprite: 'city_merchant', role: 'citizen', speed: 1.5 },
            { name: 'Dziecko', sprite: 'city_bard', role: 'child', speed: 1.2 },
            { name: 'Dziecko', sprite: 'city_bard', role: 'child', speed: 1.0 },
            { name: 'Posłaniec', sprite: 'city_merchant', role: 'citizen', speed: 1.8 },
        ];

        // Distribute NPCs across capital area (-20..20, -20..20)
        const positions = [
            [5, 5], [-5, -5], [10, 0], [0, 10], [-10, 5],
            [5, -10], [-15, 0], [15, 5], [0, -15], [-5, 15],
            [8, 8], [-8, -8], [12, -5], [-12, 10], [3, -3],
            [-3, 3], [7, -7], [-7, 7],
        ];

        npcDefs.forEach((def, i) => {
            const [px, py] = positions[i] || [Math.floor(Math.random() * 30 - 15), Math.floor(Math.random() * 30 - 15)];
            const key = `${px},${py}`;
            if (this.cityNpcs[key]) return;
            this.cityNpcs[key] = {
                id: `citizen_${i}`,
                name: def.name,
                sprite: def.sprite,
                role: def.role,
                x: px, y: py,
                homeX: px, homeY: py, // wander around home
                moveTimer: Math.random() * 2,
                moveSpeed: def.speed,
            };
        });
    },

    getCityNpcAt(wx, wy) {
        const npc = this.cityNpcs[`${wx},${wy}`];
        return npc || null;
    },

    moveCityNpc(npc, nx, ny) {
        if (!npc) return;
        // Stay within capital bounds (-20..19, -20..19)
        if (nx < -19 || nx > 19 || ny < -19 || ny > 19) return;
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

    // ========== MONSTER SPAWNING ==========
    // ========== STARTER ISLAND ==========
    placeStarterIslandCenter(tiles, cx, cy, ox, oy) {
        const CS = this.CHUNK_SIZE;
        const T = this.T;
        const center = Math.floor(CS / 2);

        // Place stone floor around the center village area
        for (let dy = center - 4; dy <= center + 4; dy++) {
            for (let dx = center - 5; dx <= center + 5; dx++) {
                if (dy >= 0 && dy < CS && dx >= 0 && dx < CS) {
                    tiles[dy * CS + dx] = T.STONE_FLOOR;
                }
            }
        }

        // Paths from center to edges
        for (let i = 0; i < CS; i++) {
            if (tiles[center * CS + i] !== T.WATER) tiles[center * CS + i] = T.PATH;
            if (tiles[i * CS + center] !== T.WATER) tiles[i * CS + center] = T.PATH;
        }

        // Well in center
        tiles[center * CS + center] = T.WELL;

        // Sign
        tiles[(center - 1) * CS + center] = T.SIGN;
        this.signTexts[`${ox + center},${oy + center - 1}`] = 'Wyspa Początkowa - osiągnij Lv.20 aby opuścić!';

        // Potion shop
        tiles[(center - 3) * CS + (center - 3)] = T.SHOP_POTION_NPC;
        this.npcs[`${ox + center - 3},${oy + center - 3}`] = { name: 'Znachor', difficulty: 1 };

        // Quest NPC - Stary Rybak (quest giver)
        tiles[(center + 2) * CS + (center - 3)] = T.NPC_QUEST;
        this.questNpcs[`${ox + center - 3},${oy + center + 2}`] = {
            id: 'si_quest_npc', type: 'starter_island',
            name: 'Stary Rybak',
        };

        // Mentor NPC - gives guidance
        tiles[(center + 2) * CS + (center + 3)] = T.NPC_QUEST;
        this.questNpcs[`${ox + center + 3},${oy + center + 2}`] = {
            id: 'si_mentor', type: 'starter_mentor',
            name: 'Mentor',
        };

        // Captain NPC - leave island at level 20
        tiles[(center - 3) * CS + (center + 4)] = T.NPC_QUEST;
        this.questNpcs[`${ox + center + 4},${oy + center - 3}`] = {
            id: 'si_captain', type: 'starter_captain',
            name: 'Kapitan',
        };

        // Ship visual near captain (a sign)
        tiles[(center - 4) * CS + (center + 5)] = T.SIGN;
        this.signTexts[`${ox + center + 5},${oy + center - 4}`] = 'Statek do Kontynentu - porozmawiaj z Kapitanem!';

        // Fence around village
        for (let dx = center - 5; dx <= center + 5; dx++) {
            if (tiles[(center - 4) * CS + dx] === T.STONE_FLOOR) tiles[(center - 4) * CS + dx] = T.FENCE;
            if (tiles[(center + 4) * CS + dx] === T.STONE_FLOOR) tiles[(center + 4) * CS + dx] = T.FENCE;
        }
        for (let dy = center - 4; dy <= center + 4; dy++) {
            if (tiles[dy * CS + (center - 5)] === T.STONE_FLOOR) tiles[dy * CS + (center - 5)] = T.FENCE;
            if (tiles[dy * CS + (center + 5)] === T.STONE_FLOOR) tiles[dy * CS + (center + 5)] = T.FENCE;
        }
        // Gates
        tiles[(center - 4) * CS + center] = T.PATH;
        tiles[(center + 4) * CS + center] = T.PATH;
        tiles[center * CS + (center - 5)] = T.PATH;
        tiles[center * CS + (center + 5)] = T.PATH;
    },

    spawnStarterIslandMonsters(cx, cy, ox, oy, tiles) {
        const CS = this.CHUNK_SIZE;
        const pool = STARTER_ISLAND.monsters;
        const icx = STARTER_ISLAND.cx * CS + Math.floor(CS / 2);
        const icy = STARTER_ISLAND.cy * CS + Math.floor(CS / 2);

        // Difficulty based on distance from island center
        const chunkCenterX = ox + Math.floor(CS / 2);
        const chunkCenterY = oy + Math.floor(CS / 2);
        const distFromCenter = Math.sqrt((chunkCenterX - icx) ** 2 + (chunkCenterY - icy) ** 2);
        const diff = Math.max(1, Math.min(10, Math.floor(distFromCenter / 3) + 1));

        const validPool = pool.filter(m => diff >= m.minDiff && diff <= m.maxDiff);
        if (validPool.length === 0) return;

        const count = 2 + Math.floor(this.rng(cx, cy, 600) * 3);
        let spawned = 0;
        for (let sp = 0; sp < count; sp++) {
            const mx = Math.floor(this.rng(cx, cy, 610 + sp) * (CS - 4)) + 2;
            const my = Math.floor(this.rng(cx, cy, 620 + sp) * (CS - 4)) + 2;
            const wx = ox + mx;
            const wy = oy + my;
            const mKey = `${wx},${wy}`;

            if (this.monsters[mKey]) continue;
            const tile = tiles[my * CS + mx];
            if (this.isTileBlocked(tile)) continue;
            if (!this.isStarterIsland(wx, wy)) continue;

            const base = validPool[Math.floor(this.rng(cx, cy, 630 + sp) * validPool.length)];
            const scale = 1 + (diff - 1) * 0.25;

            this.monsters[mKey] = {
                id: mKey,
                name: base.name,
                baseName: base.name,
                sprite: base.sprite,
                x: wx, y: wy,
                hp: Math.floor(base.hp * scale),
                maxHp: Math.floor(base.hp * scale),
                atk: Math.floor(base.atk * scale),
                armor: Math.floor((base.armor || 0) * scale),
                def: Math.floor((base.armor || 0) * scale),
                xp: Math.floor(base.xp * scale),
                gold: [Math.floor(base.gold[0] * scale), Math.floor(base.gold[1] * scale)],
                level: diff,
                isElite: false,
                biome: 'plains',
                stunDuration: 0, poisonDuration: 0, frozenDuration: 0, poisonTimer: 0,
                moveTimer: Math.random() * 0.5,
                attackTimer: 0,
            };
            spawned++;
        }
    },

    spawnChunkMonsters(cx, cy, ox, oy, tiles) {
        const CS = this.CHUNK_SIZE;
        const biome = this.getBiome(ox + CS/2, oy + CS/2);
        const biomeKey = ['plains','forest','swamp','mountain','desert','snow'][biome] || 'plains';
        const pool = this.MONSTERS[biomeKey];
        if (!pool) return;

        const diff = this.getDifficulty(ox + CS/2, oy + CS/2);
        const count = 3 + Math.floor(this.rng(cx, cy, 500) * 2);

        // Filter monsters by difficulty tier
        const validPool = pool.filter(m => diff >= m.minDiff && diff <= m.maxDiff);
        if (validPool.length === 0) return;

        // Spawn in groups at spawn points
        const spawnPoints = Math.max(1, Math.floor(count / 2));
        let spawned = 0;
        for (let sp = 0; sp < spawnPoints && spawned < count; sp++) {
            const mx = Math.floor(this.rng(cx, cy, 510 + sp) * (CS - 4)) + 2;
            const my = Math.floor(this.rng(cx, cy, 520 + sp) * (CS - 4)) + 2;
            const base = validPool[Math.floor(this.rng(cx, cy, 530 + sp) * validPool.length)];
            const groupSize = 1 + Math.floor(this.rng(cx, cy, 550 + sp) * 3); // 1-3 per group

            for (let gi = 0; gi < groupSize && spawned < count; gi++) {
            const gx = mx + Math.floor(this.rng(cx, cy, 560 + sp * 10 + gi) * 3) - 1;
            const gy = my + Math.floor(this.rng(cx, cy, 570 + sp * 10 + gi) * 3) - 1;
            if (gx < 1 || gx >= CS - 1 || gy < 1 || gy >= CS - 1) continue;
            const wx = ox + gx;
            const wy = oy + gy;
            const mKey = `${wx},${wy}`;

            if (this.monsters[mKey]) continue;
            const tile = tiles[gy * CS + gx];
            if (this.isTileBlocked(tile)) continue;
            const scale = 1 + (diff - 1) * 0.35;
            const isElite = this.rng(cx, cy, 540 + i) < 0.08;
            const eMult = isElite ? 2.5 : 1;

            this.monsters[mKey] = {
                id: mKey,
                name: (isElite ? '★ ' : '') + base.name,
                baseName: base.name,
                sprite: base.sprite,
                x: wx, y: wy,
                hp: Math.floor(base.hp * scale * eMult),
                maxHp: Math.floor(base.hp * scale * eMult),
                atk: Math.floor(base.atk * scale * eMult),
                armor: Math.floor((base.armor || base.def || 0) * scale),
                def: Math.floor((base.armor || base.def || 0) * scale),
                xp: Math.floor(base.xp * scale * eMult),
                gold: [Math.floor(base.gold[0] * scale * eMult), Math.floor(base.gold[1] * scale * eMult)],
                level: diff,
                isElite,
                biome: biomeKey,
                // Realtime timers
                stunDuration: 0,
                poisonDuration: 0,
                frozenDuration: 0,
                poisonTimer: 0,
                moveTimer: Math.random() * 0.5, // stagger initial movement
                attackTimer: 0,
                alive: true,
                spawnX: wx, spawnY: wy, // For patrol behavior
            };
            spawned++;
            } // end group loop
        } // end spawn points loop
    },

    // Check if world position is inside any house, returns house key or null
    getHouseAt(wx, wy) {
        const key = `${wx},${wy}`;
        for (const hk in this.houses) {
            const h = this.houses[hk];
            if (h.floorTiles && h.floorTiles.includes(key)) return hk;
        }
        return null;
    },

    // Check if player is inside a house
    getPlayerHouse() {
        const p = Game.player;
        if (!p) return null;
        return this.getHouseAt(p.x, p.y);
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

    placeVillage(tiles, cx, cy, ox, oy) {
        const CS = this.CHUNK_SIZE;
        const T = this.T;
        const center = Math.floor(CS / 2);
        const diff = this.getDifficulty(ox + center, oy + center);
        const villageName = this.getVillageName(cx, cy);

        for (let dy = center - 4; dy <= center + 4; dy++)
            for (let dx = center - 4; dx <= center + 4; dx++)
                if (dy >= 0 && dy < CS && dx >= 0 && dx < CS)
                    tiles[dy * CS + dx] = T.STONE_FLOOR;

        for (let i = 0; i < CS; i++) {
            tiles[center * CS + i] = T.PATH;
            tiles[i * CS + center] = T.PATH;
        }

        tiles[center * CS + center] = T.WELL;

        tiles[(center - 1) * CS + (center + 1)] = T.SIGN;
        this.signTexts[`${ox + center + 1},${oy + center - 1}`] = `Witaj w ${villageName}!\nPoziom: ${diff}`;

        const shops = [
            { npcTile: T.SHOP_WEAPON_NPC, shopType: 'weapon', pos: [center - 5, center - 5] },
            { npcTile: T.SHOP_ARMOR_NPC,  shopType: 'armor',  pos: [center + 3, center - 5] },
            { npcTile: T.SHOP_POTION_NPC, shopType: 'potion', pos: [center - 5, center + 3] },
        ];

        shops.forEach(s => {
            const [bx, by] = s.pos;
            if (bx < 0 || bx + 2 >= CS || by < 0 || by + 2 >= CS) return;
            for (let ddy = 0; ddy < 3; ddy++)
                for (let ddx = 0; ddx < 3; ddx++)
                    tiles[(by + ddy) * CS + (bx + ddx)] = T.HOUSE;
            tiles[(by + 1) * CS + (bx + 1)] = T.SHOP_FLOOR;
            tiles[(by + 2) * CS + (bx + 1)] = s.npcTile;
            tiles[(by) * CS + (bx + 1)] = T.HOUSE;

            this.npcs[`${ox + bx + 1},${oy + by + 2}`] = {
                type: 'shop', shopType: s.shopType, difficulty: diff, villageName
            };
        });

        // Inn
        const innPos = [center + 3, center + 3];
        if (innPos[0] + 2 < CS && innPos[1] + 2 < CS) {
            for (let ddy = 0; ddy < 3; ddy++)
                for (let ddx = 0; ddx < 3; ddx++)
                    tiles[(innPos[1] + ddy) * CS + (innPos[0] + ddx)] = T.HOUSE;
            tiles[(innPos[1] + 2) * CS + (innPos[0] + 1)] = T.INN;
        }

        // Quest NPCs
        const q1x = center - 2, q1y = center + 1;
        if (q1x >= 0 && q1x < CS && q1y >= 0 && q1y < CS) {
            tiles[q1y * CS + q1x] = T.NPC_QUEST;
            this.questNpcs[`${ox+q1x},${oy+q1y}`] = this.generateQuest(cx, cy, 0, diff, villageName);
        }
        const q2x = center + 2, q2y = center + 1;
        if (q2x >= 0 && q2x < CS && q2y >= 0 && q2y < CS) {
            tiles[q2y * CS + q2x] = T.NPC_QUEST2;
            this.questNpcs[`${ox+q2x},${oy+q2y}`] = this.generateQuest(cx, cy, 1, diff, villageName);
        }

        // Decorative houses
        [[center-5,center],[center+4,center]].forEach(([hx,hy]) => {
            if (hx >= 0 && hx+1 < CS && hy >= 0 && hy+1 < CS) {
                tiles[hy*CS+hx] = T.HOUSE;
                tiles[hy*CS+hx+1] = T.HOUSE;
                tiles[(hy+1)*CS+hx] = T.VILLAGE_HUT;
            }
        });

        // Fence
        for (let dx = center-7; dx <= center+7; dx++) {
            if (dx >= 0 && dx < CS) {
                if (center-7 >= 0) tiles[(center-7)*CS+dx] = T.FENCE;
                if (center+7 < CS) tiles[(center+7)*CS+dx] = T.FENCE;
            }
        }
        for (let dy = center-7; dy <= center+7; dy++) {
            if (dy >= 0 && dy < CS) {
                if (center-7 >= 0) tiles[dy*CS+(center-7)] = T.FENCE;
                if (center+7 < CS) tiles[dy*CS+(center+7)] = T.FENCE;
            }
        }
        tiles[center*CS+(center-7)] = T.PATH;
        tiles[center*CS+(center+7)] = T.PATH;
        if (center-7 >= 0) tiles[(center-7)*CS+center] = T.PATH;
        if (center+7 < CS) tiles[(center+7)*CS+center] = T.PATH;

        this.villages[this.getChunkKey(cx,cy)] = {
            name: villageName, difficulty: diff,
            wellX: ox + center, wellY: oy + center
        };
    },

    generateQuest(cx, cy, idx, difficulty, villageName) {
        const isKillQuest = this.rng(cx, cy, 400 + idx) > 0.5;
        const biome = this.getBiome(cx * this.CHUNK_SIZE + 10, cy * this.CHUNK_SIZE + 10);
        const area = ['plains','forest','swamp','mountain','desert'][biome] || 'plains';
        const pool = this.MONSTERS[area];

        if (isKillQuest && pool) {
            const validPool = pool.filter(m => difficulty >= m.minDiff && difficulty <= m.maxDiff);
            const usePool = validPool.length > 0 ? validPool : pool;
            const target = usePool[Math.floor(this.rng(cx,cy,410+idx) * usePool.length)].name;
            const count = 3 + Math.floor(this.rng(cx,cy,420+idx) * 5);
            return {
                id: `kill_${cx}_${cy}_${idx}`, type: 'kill',
                title: `Zabij ${count}x ${target}`,
                desc: `Pokonaj ${count} potworów "${target}" w okolicy.`,
                target, required: count, progress: 0,
                reward: { gold: Math.floor((20+difficulty*15)*(1+this.rng(cx,cy,430+idx))), xp: 15+difficulty*10 },
                villageName, completed: false, turned_in: false,
            };
        } else {
            const items = ['Zioła','Grzyby','Kryształy','Stare Monety','Skóry'];
            const itemName = items[Math.floor(this.rng(cx,cy,440+idx) * items.length)];
            const count = 3 + Math.floor(this.rng(cx,cy,450+idx) * 5);
            const angle = this.rng(cx,cy,470+idx) * Math.PI * 2;
            const dist = 30 + Math.floor(this.rng(cx,cy,480+idx) * 40);
            return {
                id: `collect_${cx}_${cy}_${idx}`, type: 'collect',
                title: `Zbierz ${count}x ${itemName}`,
                desc: `Zbierz ${count} sztuk "${itemName}" w okolicy.`,
                itemName, required: count, progress: 0,
                reward: { gold: Math.floor((15+difficulty*12)*(1+this.rng(cx,cy,460+idx))), xp: 10+difficulty*8 },
                villageName, completed: false, turned_in: false,
                targetX: Math.floor(cx*this.CHUNK_SIZE+10+Math.cos(angle)*dist),
                targetY: Math.floor(cy*this.CHUNK_SIZE+10+Math.sin(angle)*dist),
            };
        }
    },

    spawnQuestItems(quest) {
        if (quest.type !== 'collect' || !quest.targetX) return;
        const count = quest.required;
        for (let i = 0; i < count + 3; i++) {
            const angle = (i / (count + 3)) * Math.PI * 2 + this.rng(quest.targetX, i, 600) * 0.5;
            const dist = 2 + Math.floor(this.rng(quest.targetY, i, 601) * 6);
            const qx = quest.targetX + Math.floor(Math.cos(angle) * dist);
            const qy = quest.targetY + Math.floor(Math.sin(angle) * dist);
            const key = `${qx},${qy}`;
            if (!this.questItems[key] && !this.monsters[key]) {
                const tile = this.getTile(qx, qy);
                if (!this.isTileBlocked(tile) && tile !== this.T.WATER) {
                    this.questItems[key] = { questId: quest.id, itemName: quest.itemName };
                }
            }
        }
    },

    getVillageName(cx, cy) {
        if (this.isCapitalChunk(cx, cy)) return 'Stolica';
        const pre = ['El','Ald','Kor','Myr','Dra','Val','Syl','Gor','Tar','Nol','Bel','Ith','Zar','Mor','Fen','Ash'];
        const suf = ['doria','heim','wald','grad','burg','ton','ria','lund','gar','mir','oth','ven','dal','sten','rok','vik'];
        return pre[Math.floor(this.rng(cx,cy,350)*pre.length)] + suf[Math.floor(this.rng(cx,cy,351)*suf.length)];
    },

    getTile(wx, wy) {
        if (this.activeDungeon) return this.getDungeonTile(wx, wy);
        const cx = Math.floor(wx / this.CHUNK_SIZE);
        const cy = Math.floor(wy / this.CHUNK_SIZE);
        const lx = ((wx % this.CHUNK_SIZE) + this.CHUNK_SIZE) % this.CHUNK_SIZE;
        const ly = ((wy % this.CHUNK_SIZE) + this.CHUNK_SIZE) % this.CHUNK_SIZE;
        return this.getChunk(cx, cy).tiles[ly * this.CHUNK_SIZE + lx];
    },

    isWalkable(wx, wy) {
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

    // ========== DUNGEON SYSTEM ==========
    DUNGEON_TYPES: [
        { id: 'goblin_cave', name: 'Jaskinia Goblinów', monsters: ['goblin','spider'], boss: { name: 'Król Goblinów', sprite: 'goblin', hpMult: 8, atkMult: 3, defMult: 2, xpMult: 10, goldMult: 15 }, floors: 3, biome: 'cave' },
        { id: 'undead_crypt', name: 'Krypta Nieumarłych', monsters: ['ghost','mummy'], boss: { name: 'Lich', sprite: 'ghost', hpMult: 10, atkMult: 4, defMult: 3, xpMult: 15, goldMult: 20 }, floors: 4, biome: 'crypt' },
        { id: 'spider_nest', name: 'Gniazdo Pająków', monsters: ['spider','beetle'], boss: { name: 'Matka Pająków', sprite: 'spider', hpMult: 12, atkMult: 3, defMult: 2, xpMult: 12, goldMult: 18 }, floors: 3, biome: 'cave' },
        { id: 'dragon_lair', name: 'Smocze Leże', monsters: ['dark_knight','golem'], boss: { name: 'Prastarzy Smok', sprite: 'griffin', hpMult: 15, atkMult: 5, defMult: 4, xpMult: 25, goldMult: 30 }, floors: 5, biome: 'fire' },
        { id: 'shadow_realm', name: 'Kraina Cieni', monsters: ['ghost','djinn'], boss: { name: 'Władca Cieni', sprite: 'djinn', hpMult: 20, atkMult: 6, defMult: 5, xpMult: 30, goldMult: 40 }, floors: 5, biome: 'shadow' },
        { id: 'demon_pit', name: 'Otchłań Demonów', monsters: ['demon','skeleton'], boss: { name: 'Arcydemon', sprite: 'demon', hpMult: 18, atkMult: 7, defMult: 5, xpMult: 35, goldMult: 45 }, floors: 5, biome: 'fire' },
        { id: 'frozen_tomb', name: 'Lodowy Grobowiec', monsters: ['ice_golem','skeleton'], boss: { name: 'Mroźny Władca', sprite: 'ice_golem', hpMult: 16, atkMult: 5, defMult: 7, xpMult: 28, goldMult: 35 }, floors: 4, biome: 'cave' },
        { id: 'wyrm_nest', name: 'Gniazdo Wyrmów', monsters: ['wyrm','fire_elemental'], boss: { name: 'Pradawny Wyrm', sprite: 'wyrm', hpMult: 22, atkMult: 8, defMult: 6, xpMult: 40, goldMult: 50 }, floors: 6, biome: 'fire' },
    ],

    activeDungeon: null,
    dungeonReturnPos: null,

    getDungeonType(wx, wy) {
        const idx = Math.abs((wx * 13 + wy * 7 + this.worldSeed) % this.DUNGEON_TYPES.length);
        return this.DUNGEON_TYPES[idx];
    },

    enterDungeon(wx, wy) {
        const diff = this.getDifficulty(wx, wy);
        const dtype = this.getDungeonType(wx, wy);
        this.dungeonReturnPos = { x: Game.player.x, y: Game.player.y };
        this.activeDungeon = {
            type: dtype,
            floor: 1,
            difficulty: diff,
            size: 25,
        };
        this.generateDungeonFloor();
        Game.log(`Wchodzisz do: ${dtype.name} (Lv.${diff})`, 'info');
    },

    generateDungeonFloor() {
        const d = this.activeDungeon;
        if (!d) return;
        const S = d.size;
        const tiles = new Array(S * S).fill(this.T.CAVE_WALL);
        const isBossFloor = d.floor >= d.type.floors;

        const rooms = [];
        const roomCount = 4 + d.floor;
        for (let i = 0; i < roomCount; i++) {
            const rw = 4 + Math.floor(this.rng(d.floor, i, 700) * 4);
            const rh = 4 + Math.floor(this.rng(d.floor, i, 701) * 4);
            const rx = 1 + Math.floor(this.rng(d.floor, i, 702) * (S - rw - 2));
            const ry = 1 + Math.floor(this.rng(d.floor, i, 703) * (S - rh - 2));
            rooms.push({ x: rx, y: ry, w: rw, h: rh, cx: rx + Math.floor(rw/2), cy: ry + Math.floor(rh/2) });
            for (let y = ry; y < ry + rh; y++)
                for (let x = rx; x < rx + rw; x++)
                    tiles[y * S + x] = this.T.CAVE_FLOOR;
        }

        for (let i = 1; i < rooms.length; i++) {
            const a = rooms[i-1], b = rooms[i];
            let cx = a.cx, cy = a.cy;
            while (cx !== b.cx) {
                tiles[cy * S + cx] = this.T.CAVE_FLOOR;
                cx += cx < b.cx ? 1 : -1;
            }
            while (cy !== b.cy) {
                tiles[cy * S + cx] = this.T.CAVE_FLOOR;
                cy += cy < b.cy ? 1 : -1;
            }
        }

        const startRoom = rooms[0];
        tiles[startRoom.cy * S + startRoom.cx] = this.T.CAVE_ENTRY;
        d.entryX = startRoom.cx;
        d.entryY = startRoom.cy;

        const endRoom = rooms[rooms.length - 1];
        if (isBossFloor) {
            tiles[endRoom.cy * S + endRoom.cx] = this.T.CAVE_FLOOR;
        } else {
            tiles[endRoom.cy * S + endRoom.cx] = this.T.CAVE_ENTRY;
            d.exitX = endRoom.cx;
            d.exitY = endRoom.cy;
        }

        d.monsters = {};

        const monsterPool = d.type.monsters;
        const monsterCount = 3 + d.floor * 2;
        for (let i = 0; i < monsterCount; i++) {
            const room = rooms[1 + Math.floor(this.rng(d.floor, i, 710) * (rooms.length - 2))];
            if (!room) continue;
            const mx = room.x + 1 + Math.floor(this.rng(d.floor, i, 711) * (room.w - 2));
            const my = room.y + 1 + Math.floor(this.rng(d.floor, i, 712) * (room.h - 2));
            const mKey = `${mx},${my}`;
            if (d.monsters[mKey]) continue;
            if (tiles[my * S + mx] !== this.T.CAVE_FLOOR) continue;

            const spriteKey = monsterPool[Math.floor(this.rng(d.floor, i, 713) * monsterPool.length)];
            const allMobs = Object.values(this.MONSTERS).flat();
            const base = allMobs.find(m => m.sprite === spriteKey) || allMobs[0];
            const scale = 1 + (d.difficulty - 1) * 0.5 + d.floor * 0.3;
            const isElite = this.rng(d.floor, i, 714) < 0.12;
            const eMult = isElite ? 2.5 : 1;

            d.monsters[mKey] = {
                id: mKey, name: (isElite ? '★ ' : '') + base.name,
                baseName: base.name, sprite: base.sprite,
                x: mx, y: my,
                hp: Math.floor(base.hp * scale * eMult),
                maxHp: Math.floor(base.hp * scale * eMult),
                atk: Math.floor(base.atk * scale * eMult),
                armor: Math.floor((base.armor || base.def || 0) * scale),
                def: Math.floor((base.armor || base.def || 0) * scale),
                xp: Math.floor(base.xp * scale * eMult * 1.5),
                gold: [Math.floor(base.gold[0] * scale * eMult), Math.floor(base.gold[1] * scale * eMult * 1.5)],
                level: d.difficulty + d.floor,
                isElite, biome: 'dungeon',
                stunDuration: 0, poisonDuration: 0, frozenDuration: 0, poisonTimer: 0,
                moveTimer: Math.random() * 0.5, attackTimer: 0,
                alive: true,
            };
        }

        if (isBossFloor) {
            const boss = d.type.boss;
            const allMobs = Object.values(this.MONSTERS).flat();
            const base = allMobs.find(m => m.sprite === boss.sprite) || allMobs[0];
            const scale = 1 + (d.difficulty - 1) * 0.5;
            const bKey = `${endRoom.cx},${endRoom.cy}`;
            d.monsters[bKey] = {
                id: bKey, name: '⚔ ' + boss.name,
                baseName: boss.name, sprite: boss.sprite,
                x: endRoom.cx, y: endRoom.cy,
                hp: Math.floor(base.hp * scale * boss.hpMult),
                maxHp: Math.floor(base.hp * scale * boss.hpMult),
                atk: Math.floor(base.atk * scale * boss.atkMult),
                def: Math.floor(base.def * scale * boss.defMult),
                xp: Math.floor(base.xp * scale * boss.xpMult),
                gold: [Math.floor(base.gold[0] * scale * boss.goldMult), Math.floor(base.gold[1] * scale * boss.goldMult)],
                level: d.difficulty + d.floor + 2,
                isElite: false, isBoss: true, biome: 'dungeon',
                stunDuration: 0, poisonDuration: 0, frozenDuration: 0, poisonTimer: 0,
                moveTimer: 0, attackTimer: 0,
                alive: true,
            };
        }

        if (rooms.length > 2) {
            const chestRoom = rooms[Math.floor(rooms.length / 2)];
            tiles[chestRoom.cy * S + (chestRoom.cx + 1)] = this.T.CHEST;
            const ckey = `${chestRoom.cx + 1},${chestRoom.cy}`;
            d.chests = d.chests || {};
            d.chests[ckey] = { gold: Math.floor(15 + d.difficulty * 12 + d.floor * 8) };
        }

        d.tiles = tiles;

        Game.player.x = d.entryX;
        Game.player.y = d.entryY;
        Game.player.visualX = d.entryX;
        Game.player.visualY = d.entryY;
    },

    exitDungeon() {
        if (!this.dungeonReturnPos) return;
        const p = Game.player;
        p.x = this.dungeonReturnPos.x;
        p.y = this.dungeonReturnPos.y;
        p.visualX = p.x;
        p.visualY = p.y;
        this.activeDungeon = null;
        this.dungeonReturnPos = null;
        Game.log('Opuszczasz dungeon.', 'info');
    },

    nextDungeonFloor() {
        const d = this.activeDungeon;
        if (!d) return;
        d.floor++;
        if (d.floor > d.type.floors) {
            this.exitDungeon();
            Game.log('Dungeon ukończony! Gratulacje!', 'loot');
            return;
        }
        this.generateDungeonFloor();
        Game.log(`Piętro ${d.floor}/${d.type.floors}`, 'info');
    },

    getDungeonTile(x, y) {
        const d = this.activeDungeon;
        if (!d || x < 0 || y < 0 || x >= d.size || y >= d.size) return this.T.CAVE_WALL;
        return d.tiles[y * d.size + x];
    },

    getDungeonMonsterAt(x, y) {
        const d = this.activeDungeon;
        if (!d) return null;
        const m = d.monsters[`${x},${y}`];
        return (m && m.alive) ? m : null;
    },

    getDungeonMonstersNear(px, py, range) {
        const d = this.activeDungeon;
        if (!d) return [];
        const result = [];
        for (const key in d.monsters) {
            const m = d.monsters[key];
            if (!m.alive) continue;
            if (Math.abs(m.x - px) <= range && Math.abs(m.y - py) <= range) result.push(m);
        }
        return result;
    },

    moveDungeonMonster(m, nx, ny) {
        const d = this.activeDungeon;
        if (!d || !m || !m.alive) return;
        const oldKey = `${m.x},${m.y}`;
        const newKey = `${nx},${ny}`;
        if (d.monsters[newKey]) return;
        delete d.monsters[oldKey];
        m.x = nx; m.y = ny;
        d.monsters[newKey] = m;
    },

    removeDungeonMonster(m) {
        const d = this.activeDungeon;
        if (!d || !m) return;
        delete d.monsters[`${m.x},${m.y}`];
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
