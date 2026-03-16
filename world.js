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
    },

    BIOME: { PLAINS: 0, FOREST: 1, SWAMP: 2, MOUNTAIN: 3, DESERT: 4, SNOW: 5 },

    // Monster definitions per biome with level tiers
    MONSTERS: {
        plains: [
            { name: 'Slime',       sprite: 'slime',   hp: 10, atk: 2,  def: 0, xp: 5,  gold: [2,5],   minDiff: 1, maxDiff: 6 },
            { name: 'Goblin',      sprite: 'goblin',  hp: 15, atk: 3,  def: 1, xp: 8,  gold: [3,8],   minDiff: 1, maxDiff: 10 },
            { name: 'Wilk',        sprite: 'wolf',    hp: 18, atk: 5,  def: 1, xp: 10, gold: [2,6],   minDiff: 2, maxDiff: 12 },
            { name: 'Szkielet',    sprite: 'skeleton', hp: 22, atk: 7, def: 2, xp: 15, gold: [4,10],  minDiff: 4, maxDiff: 14 },
            { name: 'Dziki Koń',   sprite: 'wolf',    hp: 30, atk: 8,  def: 3, xp: 20, gold: [5,12],  minDiff: 6, maxDiff: 20 },
            { name: 'Centaur',     sprite: 'bandit',  hp: 50, atk: 14, def: 5, xp: 35, gold: [10,20], minDiff: 12, maxDiff: 99 },
        ],
        forest: [
            { name: 'Pająk',       sprite: 'spider',  hp: 12, atk: 6,  def: 0, xp: 10, gold: [2,5],   minDiff: 1, maxDiff: 8 },
            { name: 'Ork',         sprite: 'orc',     hp: 25, atk: 7,  def: 2, xp: 18, gold: [5,12],  minDiff: 3, maxDiff: 14 },
            { name: 'Bandyta',     sprite: 'bandit',  hp: 22, atk: 6,  def: 3, xp: 15, gold: [8,15],  minDiff: 2, maxDiff: 10 },
            { name: 'Drzewiec',    sprite: 'treant',  hp: 35, atk: 5,  def: 5, xp: 20, gold: [4,10],  minDiff: 5, maxDiff: 16 },
            { name: 'Leśny Mag',   sprite: 'djinn',   hp: 45, atk: 15, def: 4, xp: 40, gold: [12,25], minDiff: 10, maxDiff: 99 },
            { name: 'Wyrm Leśny',  sprite: 'wyrm',    hp: 70, atk: 18, def: 6, xp: 55, gold: [18,35], minDiff: 14, maxDiff: 99 },
        ],
        swamp: [
            { name: 'Żuk',         sprite: 'beetle',  hp: 14, atk: 8,  def: 1, xp: 12, gold: [3,7],   minDiff: 2, maxDiff: 10 },
            { name: 'Szkielet',    sprite: 'skeleton', hp: 20, atk: 9, def: 1, xp: 15, gold: [5,10],  minDiff: 3, maxDiff: 12 },
            { name: 'Widmo',       sprite: 'ghost',   hp: 20, atk: 10, def: 0, xp: 18, gold: [5,12],  minDiff: 4, maxDiff: 14 },
            { name: 'Troll',       sprite: 'troll',   hp: 40, atk: 7,  def: 4, xp: 25, gold: [8,18],  minDiff: 6, maxDiff: 18 },
            { name: 'Bagiennik',   sprite: 'troll',   hp: 55, atk: 12, def: 6, xp: 35, gold: [10,22], minDiff: 10, maxDiff: 99 },
            { name: 'Demon Bagien',sprite: 'demon',   hp: 75, atk: 16, def: 5, xp: 50, gold: [15,30], minDiff: 14, maxDiff: 99 },
        ],
        mountain: [
            { name: 'Golem',       sprite: 'golem',   hp: 45, atk: 8,  def: 6, xp: 30, gold: [10,20], minDiff: 5, maxDiff: 18 },
            { name: 'Gryf',        sprite: 'griffin',  hp: 30, atk: 12, def: 3, xp: 25, gold: [8,16],  minDiff: 6, maxDiff: 20 },
            { name: 'Rycerz Cieni',sprite: 'dark_knight', hp: 35, atk: 14, def: 5, xp: 35, gold: [12,25], minDiff: 8, maxDiff: 99 },
            { name: 'Lodowy Golem',sprite: 'ice_golem', hp: 55, atk: 11, def: 8, xp: 40, gold: [14,28], minDiff: 10, maxDiff: 99 },
            { name: 'Smok Młody',  sprite: 'wyrm',    hp: 80, atk: 20, def: 8, xp: 60, gold: [20,40], minDiff: 14, maxDiff: 99 },
        ],
        desert: [
            { name: 'Skorpion',    sprite: 'scorpion', hp: 18, atk: 9,  def: 2, xp: 14, gold: [4,10],  minDiff: 3, maxDiff: 12 },
            { name: 'Mumia',       sprite: 'mummy',    hp: 30, atk: 8,  def: 3, xp: 20, gold: [6,14],  minDiff: 5, maxDiff: 16 },
            { name: 'Dżinn',       sprite: 'djinn',    hp: 25, atk: 15, def: 2, xp: 30, gold: [10,22], minDiff: 7, maxDiff: 20 },
            { name: 'Ognisty Elem',sprite: 'fire_elemental', hp: 40, atk: 16, def: 3, xp: 38, gold: [12,24], minDiff: 9, maxDiff: 22 },
            { name: 'Sfinks',      sprite: 'djinn',    hp: 60, atk: 18, def: 6, xp: 50, gold: [15,35], minDiff: 12, maxDiff: 99 },
            { name: 'Demon Piasków',sprite: 'demon',   hp: 85, atk: 22, def: 7, xp: 65, gold: [22,45], minDiff: 16, maxDiff: 99 },
        ],
        snow: [
            { name: 'Wilk Śnieżny',sprite: 'wolf',     hp: 24, atk: 8,  def: 2, xp: 16, gold: [4,10],  minDiff: 3, maxDiff: 14 },
            { name: 'Lodowy Golem', sprite: 'ice_golem', hp: 50, atk: 10, def: 7, xp: 32, gold: [10,20], minDiff: 6, maxDiff: 20 },
            { name: 'Szkielet Mróz',sprite: 'skeleton',  hp: 28, atk: 10, def: 3, xp: 20, gold: [6,14],  minDiff: 4, maxDiff: 16 },
            { name: 'Widmo Zimy',   sprite: 'ghost',     hp: 35, atk: 14, def: 2, xp: 28, gold: [8,18],  minDiff: 8, maxDiff: 22 },
            { name: 'Mroźny Wyrm',  sprite: 'wyrm',      hp: 90, atk: 22, def: 9, xp: 70, gold: [25,50], minDiff: 15, maxDiff: 99 },
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

    getBiome(wx, wy) {
        const scale = 0.02;
        const temp = Perlin.fbm(wx * scale + 100, wy * scale + 100, 3);
        const moisture = Perlin.fbm(wx * scale + 500, wy * scale + 500, 3);
        const dist = Math.sqrt(wx * wx + wy * wy);
        if (dist < 40) return this.BIOME.PLAINS; // Starting area is plains (larger safe zone for capital)
        if (temp > 0.25) return this.BIOME.DESERT;
        if (temp < -0.35) return this.BIOME.SNOW;
        if (temp < -0.25) return this.BIOME.MOUNTAIN;
        if (moisture > 0.2) return this.BIOME.SWAMP;
        if (moisture < -0.1) return this.BIOME.FOREST;
        return this.BIOME.PLAINS;
    },

    getDifficulty(wx, wy) {
        const dist = Math.sqrt(wx * wx + wy * wy);
        return Math.max(1, Math.floor(dist / 25) + 1);
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

    generateChunk(cx, cy) {
        const CS = this.CHUNK_SIZE;
        const T = this.T;
        const tiles = new Array(CS * CS);
        const ox = cx * CS;
        const oy = cy * CS;

        // Check if this is the capital city area (3x3 chunks)
        const isStartingCity = this.isCapitalChunk(cx, cy);
        const isVillage = this.isVillageChunk(cx, cy);

        for (let ly = 0; ly < CS; ly++) {
            for (let lx = 0; lx < CS; lx++) {
                const wx = ox + lx;
                const wy = oy + ly;
                const biome = this.getBiome(wx, wy);
                let tile = T.GRASS;
                const elev = Perlin.fbm(wx * 0.05, wy * 0.05, 3);

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

        // Spawn monsters (not in villages or starting city)
        if (!isVillage && !isStartingCity) this.spawnChunkMonsters(cx, cy, ox, oy, tiles);

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

        // Main paths through center of chunk (connecting to neighbors)
        for (let i = 0; i < CS; i++) {
            tiles[center * CS + i] = T.PATH;
            tiles[i * CS + center] = T.PATH;
        }

        // Outer wall only on edges of the 3x3 area
        if (cx === -1) { for (let dy = 0; dy < CS; dy++) tiles[dy * CS + 0] = T.FENCE; tiles[center * CS + 0] = T.PATH; }
        if (cx === 1)  { for (let dy = 0; dy < CS; dy++) tiles[dy * CS + (CS-1)] = T.FENCE; tiles[center * CS + (CS-1)] = T.PATH; }
        if (cy === -1) { for (let dx = 0; dx < CS; dx++) tiles[0 * CS + dx] = T.FENCE; tiles[0 * CS + center] = T.PATH; }
        if (cy === 1)  { for (let dx = 0; dx < CS; dx++) tiles[(CS-1) * CS + dx] = T.FENCE; tiles[(CS-1) * CS + center] = T.PATH; }
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

    // Helper: place a town building with door and NPC inside
    placeTownBuilding(tiles, ox, oy, bx, by, w, h, npcName) {
        const CS = this.CHUNK_SIZE;
        const T = this.T;
        // Walls
        for (let ddy = 0; ddy < h; ddy++)
            for (let ddx = 0; ddx < w; ddx++) {
                const ty = by + ddy, tx = bx + ddx;
                if (ty >= 0 && ty < CS && tx >= 0 && tx < CS)
                    tiles[ty * CS + tx] = T.TOWN_BUILDING;
            }
        // Door at bottom center
        const doorX = bx + Math.floor(w / 2);
        const doorY = by + h - 1;
        if (doorX >= 0 && doorX < CS && doorY >= 0 && doorY < CS) {
            tiles[doorY * CS + doorX] = T.TOWN_BUILDING_DOOR;
            // Store NPC info for this building door
            const doorKey = `${ox + doorX},${oy + doorY}`;
            this.townBuildings = this.townBuildings || {};
            this.townBuildings[doorKey] = { npcName: npcName || 'Mieszkaniec' };
        }
    },

    // Helper: place a buyable house
    placeBuyableHouse(tiles, ox, oy, bx, by, w, h, price, name) {
        const CS = this.CHUNK_SIZE;
        const T = this.T;
        for (let ddy = 0; ddy < h; ddy++)
            for (let ddx = 0; ddx < w; ddx++) {
                const ty = by + ddy, tx = bx + ddx;
                if (ty >= 0 && ty < CS && tx >= 0 && tx < CS)
                    tiles[ty * CS + tx] = T.HOUSE;
            }
        // Door
        const doorX = bx + Math.floor(w / 2);
        const doorY = by + h - 1;
        if (doorX >= 0 && doorX < CS && doorY >= 0 && doorY < CS) {
            tiles[doorY * CS + doorX] = T.HOUSE_DOOR;
            this.houses[`${ox + doorX},${oy + doorY}`] = {
                price, name, owned: false,
                floorTiles: []
            };
            // Mark interior floor tiles
            for (let ddy = 1; ddy < h - 1; ddy++)
                for (let ddx = 0; ddx < w; ddx++) {
                    const fy = by + ddy, fx = bx + ddx;
                    if (fy >= 0 && fy < CS && fx >= 0 && fx < CS && tiles[fy * CS + fx] === T.HOUSE) {
                        tiles[fy * CS + fx] = T.SHOP_FLOOR; // reuse as interior floor
                        this.houses[`${ox + doorX},${oy + doorY}`].floorTiles.push(`${ox+fx},${oy+fy}`);
                    }
                }
        }
    },

    // Center (0,0): Town square, well, statue, main crossroads
    placeCapitalCenter(tiles, ox, oy) {
        const CS = this.CHUNK_SIZE;
        const T = this.T;
        const c = Math.floor(CS / 2);

        tiles[c * CS + c] = T.WELL;
        tiles[(c - 2) * CS + c] = T.STATUE;
        tiles[(c + 2) * CS + c] = T.STATUE;
        tiles[c * CS + (c - 2)] = T.STATUE;
        tiles[c * CS + (c + 2)] = T.STATUE;

        // Decorative flowers around square
        for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) {
            if (Math.abs(i) + Math.abs(j) === 3) {
                const fx = c + i, fy = c + j;
                if (fx > 0 && fx < CS-1 && fy > 0 && fy < CS-1 && tiles[fy*CS+fx] === T.STONE_FLOOR)
                    tiles[fy * CS + fx] = T.FLOWER;
            }
        }

        // Welcome sign
        tiles[(c - 1) * CS + (c + 1)] = T.SIGN;
        this.signTexts[`${ox + c + 1},${oy + c - 1}`] = 'Witaj w Stolicy Krainy!\nTo twój dom. Bezpieczne miejsce.';

        // Town buildings on corners of center chunk with NPCs inside
        this.placeTownBuilding(tiles, ox, oy, 2, 2, 3, 3, 'Bibliotekarz');
        this.placeTownBuilding(tiles, ox, oy, CS-5, 2, 3, 3, 'Kartograf');
        this.placeTownBuilding(tiles, ox, oy, 2, CS-5, 3, 3, 'Alchemik');
        this.placeTownBuilding(tiles, ox, oy, CS-5, CS-5, 3, 3, 'Jubiler');
    },

    // West (-1,0): Market, weapon shop, food stalls
    placeCapitalWest(tiles, ox, oy) {
        const CS = this.CHUNK_SIZE;
        const T = this.T;

        // Weapon shop (large)
        const ws = { npcTile: T.SHOP_WEAPON_NPC, shopType: 'weapon' };
        for (let ddy = 0; ddy < 4; ddy++)
            for (let ddx = 0; ddx < 5; ddx++)
                tiles[(3 + ddy) * CS + (3 + ddx)] = T.HOUSE;
        tiles[4 * CS + 5] = T.SHOP_FLOOR;
        tiles[4 * CS + 6] = T.SHOP_FLOOR;
        tiles[5 * CS + 5] = T.SHOP_FLOOR;
        tiles[6 * CS + 5] = ws.npcTile;
        tiles[2 * CS + 5] = T.SIGN;
        this.signTexts[`${ox + 5},${oy + 2}`] = 'Kowalnia "Stalowe Ostrze"';
        this.npcs[`${ox + 5},${oy + 6}`] = { type: 'shop', shopType: 'weapon', difficulty: 1, villageName: 'Stolica' };

        // Market stalls (town buildings with NPCs)
        this.placeTownBuilding(tiles, ox, oy, 3, 10, 4, 3, 'Handlarz Warzyw');
        this.placeTownBuilding(tiles, ox, oy, 3, 14, 4, 3, 'Piekarz');
        tiles[9 * CS + 4] = T.SIGN;
        this.signTexts[`${ox + 4},${oy + 9}`] = 'Targ Miejski';

        // Buyable houses
        this.placeBuyableHouse(tiles, ox, oy, 12, 3, 3, 3, 200, 'Dom przy Targu #1');
        this.placeBuyableHouse(tiles, ox, oy, 12, 8, 3, 3, 250, 'Dom przy Targu #2');
        this.placeBuyableHouse(tiles, ox, oy, 12, 13, 3, 3, 200, 'Dom przy Targu #3');

        // Trees for decoration
        tiles[17 * CS + 2] = T.TREE;
        tiles[17 * CS + 5] = T.TREE;
    },

    // East (1,0): Armor shop, potion shop
    placeCapitalEast(tiles, ox, oy) {
        const CS = this.CHUNK_SIZE;
        const T = this.T;

        // Armor shop
        for (let ddy = 0; ddy < 4; ddy++)
            for (let ddx = 0; ddx < 5; ddx++)
                tiles[(3 + ddy) * CS + (12 + ddx)] = T.HOUSE;
        tiles[4 * CS + 14] = T.SHOP_FLOOR;
        tiles[5 * CS + 14] = T.SHOP_FLOOR;
        tiles[6 * CS + 14] = T.SHOP_ARMOR_NPC;
        tiles[2 * CS + 14] = T.SIGN;
        this.signTexts[`${ox + 14},${oy + 2}`] = 'Płatnerz "Żelazny Mur"';
        this.npcs[`${ox + 14},${oy + 6}`] = { type: 'shop', shopType: 'armor', difficulty: 1, villageName: 'Stolica' };

        // Potion shop
        for (let ddy = 0; ddy < 4; ddy++)
            for (let ddx = 0; ddx < 5; ddx++)
                tiles[(12 + ddy) * CS + (12 + ddx)] = T.HOUSE;
        tiles[13 * CS + 14] = T.SHOP_FLOOR;
        tiles[14 * CS + 14] = T.SHOP_FLOOR;
        tiles[15 * CS + 14] = T.SHOP_POTION_NPC;
        tiles[11 * CS + 14] = T.SIGN;
        this.signTexts[`${ox + 14},${oy + 11}`] = 'Alchemik "Złoty Eliksir"';
        this.npcs[`${ox + 14},${oy + 15}`] = { type: 'shop', shopType: 'potion', difficulty: 1, villageName: 'Stolica' };

        // Buyable houses
        this.placeBuyableHouse(tiles, ox, oy, 3, 3, 3, 3, 300, 'Dom Wschodni #1');
        this.placeBuyableHouse(tiles, ox, oy, 3, 8, 3, 3, 300, 'Dom Wschodni #2');
        this.placeBuyableHouse(tiles, ox, oy, 3, 14, 3, 3, 350, 'Dom Wschodni #3');
    },

    // North (0,-1): Temple area, quest NPCs
    placeCapitalNorth(tiles, ox, oy) {
        const CS = this.CHUNK_SIZE;
        const T = this.T;
        const c = Math.floor(CS / 2);

        // Temple building (large)
        for (let ddy = 0; ddy < 5; ddy++)
            for (let ddx = 0; ddx < 7; ddx++)
                tiles[(3 + ddy) * CS + (c - 3 + ddx)] = T.HOUSE;
        tiles[7 * CS + c] = T.DOOR;
        tiles[2 * CS + c] = T.SIGN;
        this.signTexts[`${ox + c},${oy + 2}`] = 'Świątynia Światła';

        // Statues flanking temple
        tiles[7 * CS + (c - 4)] = T.STATUE;
        tiles[7 * CS + (c + 4)] = T.STATUE;

        // Quest NPCs
        const q1x = c - 3, q1y = 12;
        tiles[q1y * CS + q1x] = T.NPC_QUEST;
        this.questNpcs[`${ox+q1x},${oy+q1y}`] = this.generateQuest(0, -1, 0, 1, 'Stolica');
        const q2x = c + 3, q2y = 12;
        tiles[q2y * CS + q2x] = T.NPC_QUEST2;
        this.questNpcs[`${ox+q2x},${oy+q2y}`] = this.generateQuest(0, -1, 1, 1, 'Stolica');

        // Training ground sign
        tiles[14 * CS + 3] = T.SIGN;
        this.signTexts[`${ox + 3},${oy + 14}`] = 'Pole Treningowe\nBij potwory aby\npoprawić umiejętności!';

        // Buyable house
        this.placeBuyableHouse(tiles, ox, oy, 2, 14, 3, 3, 400, 'Dom Kapłański #1');
        this.placeBuyableHouse(tiles, ox, oy, CS - 5, 14, 3, 3, 400, 'Dom Kapłański #2');
    },

    // South (0,1): Residential, inn, medium buyable houses
    placeCapitalSouth(tiles, ox, oy) {
        const CS = this.CHUNK_SIZE;
        const T = this.T;
        const c = Math.floor(CS / 2);

        // Inn (large)
        for (let ddy = 0; ddy < 4; ddy++)
            for (let ddx = 0; ddx < 6; ddx++)
                tiles[(2 + ddy) * CS + (c - 3 + ddx)] = T.HOUSE;
        tiles[5 * CS + c] = T.INN;
        tiles[1 * CS + c] = T.SIGN;
        this.signTexts[`${ox + c},${oy + 1}`] = 'Karczma "Pod Złotym Smokiem"';

        // Buyable houses (residential area)
        this.placeBuyableHouse(tiles, ox, oy, 2, 8, 4, 3, 500, 'Kamienica Południowa #1');
        this.placeBuyableHouse(tiles, ox, oy, 8, 8, 4, 3, 500, 'Kamienica Południowa #2');
        this.placeBuyableHouse(tiles, ox, oy, 14, 8, 4, 3, 500, 'Kamienica Południowa #3');
        this.placeBuyableHouse(tiles, ox, oy, 2, 13, 4, 3, 600, 'Willa Południowa #1');
        this.placeBuyableHouse(tiles, ox, oy, 8, 13, 4, 3, 600, 'Willa Południowa #2');
        this.placeBuyableHouse(tiles, ox, oy, 14, 13, 4, 3, 650, 'Willa Południowa #3');
    },

    // NW (-1,-1): Park/garden
    placeCapitalNW(tiles, ox, oy) {
        const CS = this.CHUNK_SIZE;
        const T = this.T;

        // Park with trees and flowers
        const parkTrees = [[3,3],[5,2],[8,4],[3,7],[6,6],[4,10],[7,9],[2,14],[5,13],[8,12],[11,3],[13,5],[11,8],[14,11],[12,15]];
        parkTrees.forEach(([px, py]) => { if (px < CS && py < CS) tiles[py * CS + px] = T.TREE; });

        const flowers = [[4,4],[6,3],[7,5],[4,8],[5,11],[9,3],[12,4],[13,7],[10,10],[14,13]];
        flowers.forEach(([px, py]) => { if (px < CS && py < CS) tiles[py * CS + px] = T.FLOWER; });

        // Fountain (well)
        tiles[8 * CS + 8] = T.WELL;
        tiles[7 * CS + 8] = T.SIGN;
        this.signTexts[`${ox + 8},${oy + 7}`] = 'Park Królewski\nMiejsce spokoju i odpoczynku.';

        // Bench statues
        tiles[8 * CS + 6] = T.STATUE;
        tiles[8 * CS + 10] = T.STATUE;
    },

    // NE (1,-1): Noble district, expensive buyable houses
    placeCapitalNE(tiles, ox, oy) {
        const CS = this.CHUNK_SIZE;
        const T = this.T;

        tiles[2 * CS + 5] = T.SIGN;
        this.signTexts[`${ox + 5},${oy + 2}`] = 'Dzielnica Szlachecka';

        // Expensive buyable houses
        this.placeBuyableHouse(tiles, ox, oy, 2, 3, 5, 4, 1000, 'Rezydencja Szlachecka #1');
        this.placeBuyableHouse(tiles, ox, oy, 10, 3, 5, 4, 1200, 'Rezydencja Szlachecka #2');
        this.placeBuyableHouse(tiles, ox, oy, 2, 10, 5, 4, 1000, 'Rezydencja Szlachecka #3');
        this.placeBuyableHouse(tiles, ox, oy, 10, 10, 5, 4, 1500, 'Pałacyk Szlachecki');

        // Garden decorations
        tiles[8 * CS + 8] = T.STATUE;
        tiles[15 * CS + 4] = T.FLOWER;
        tiles[15 * CS + 12] = T.FLOWER;
        tiles[16 * CS + 8] = T.TREE;
    },

    // SW (-1,1): Poor district, cheap buyable houses
    placeCapitalSW(tiles, ox, oy) {
        const CS = this.CHUNK_SIZE;
        const T = this.T;

        tiles[2 * CS + 5] = T.SIGN;
        this.signTexts[`${ox + 5},${oy + 2}`] = 'Dzielnica Robotnicza';

        // Cheap buyable houses (small, tightly packed)
        this.placeBuyableHouse(tiles, ox, oy, 2, 3, 3, 3, 100, 'Chata Robotnicza #1');
        this.placeBuyableHouse(tiles, ox, oy, 7, 3, 3, 3, 100, 'Chata Robotnicza #2');
        this.placeBuyableHouse(tiles, ox, oy, 12, 3, 3, 3, 100, 'Chata Robotnicza #3');
        this.placeBuyableHouse(tiles, ox, oy, 2, 8, 3, 3, 120, 'Chata Robotnicza #4');
        this.placeBuyableHouse(tiles, ox, oy, 7, 8, 3, 3, 120, 'Chata Robotnicza #5');
        this.placeBuyableHouse(tiles, ox, oy, 12, 8, 3, 3, 120, 'Chata Robotnicza #6');
        this.placeBuyableHouse(tiles, ox, oy, 2, 13, 3, 3, 150, 'Domek Robotniczy #1');
        this.placeBuyableHouse(tiles, ox, oy, 7, 13, 3, 3, 150, 'Domek Robotniczy #2');
        this.placeBuyableHouse(tiles, ox, oy, 12, 13, 3, 3, 150, 'Domek Robotniczy #3');
    },

    // SE (1,1): Farm/harbor area
    placeCapitalSE(tiles, ox, oy) {
        const CS = this.CHUNK_SIZE;
        const T = this.T;

        tiles[2 * CS + 5] = T.SIGN;
        this.signTexts[`${ox + 5},${oy + 2}`] = 'Farmy i Stajnie';

        // Farm buildings with NPCs
        this.placeTownBuilding(tiles, ox, oy, 2, 3, 4, 3, 'Rolnik');
        this.placeTownBuilding(tiles, ox, oy, 8, 3, 4, 3, 'Stajennik');
        this.placeTownBuilding(tiles, ox, oy, 14, 3, 4, 3, 'Ogrodnik');

        // Farm fields (flowers = crops)
        for (let dy = 8; dy < 16; dy++)
            for (let dx = 2; dx < 8; dx++)
                if (this.rng(ox+dx, oy+dy, 800) < 0.4) tiles[dy * CS + dx] = T.FLOWER;

        // Buyable farmhouses
        this.placeBuyableHouse(tiles, ox, oy, 10, 10, 4, 3, 300, 'Farma #1');
        this.placeBuyableHouse(tiles, ox, oy, 10, 15, 4, 3, 350, 'Farma #2');
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

        for (let i = 0; i < count; i++) {
            const mx = Math.floor(this.rng(cx, cy, 510 + i) * (CS - 4)) + 2;
            const my = Math.floor(this.rng(cx, cy, 520 + i) * (CS - 4)) + 2;
            const wx = ox + mx;
            const wy = oy + my;
            const mKey = `${wx},${wy}`;

            if (this.monsters[mKey]) continue;
            const tile = tiles[my * CS + mx];
            if (this.isTileBlocked(tile)) continue;

            const base = validPool[Math.floor(this.rng(cx, cy, 530 + i) * validPool.length)];
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
                def: Math.floor(base.def * scale),
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
            };
        }
    },

    isTileBlocked(t) {
        const T = this.T;
        return [T.WATER, T.WALL, T.TREE, T.HOUSE, T.CAVE_WALL, T.FENCE,
                T.WELL, T.STATUE, T.ROCK, T.SWAMP_TREE, T.CACTUS, T.VILLAGE_HUT,
                T.NPC_QUEST, T.NPC_QUEST2, T.NPC_SHOPKEEPER, T.SHOP_WEAPON_NPC,
                T.SHOP_ARMOR_NPC, T.SHOP_POTION_NPC, T.INN, T.CHEST, T.HOUSE_DOOR,
                T.TOWN_BUILDING, T.TOWN_BUILDING_DOOR, T.LAVA, T.SNOW_PINE].includes(t);
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
                def: Math.floor(base.def * scale),
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
