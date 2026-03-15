// ============================================================
// INFINITE WORLD - Chunk-based procedural generation
// ============================================================

const World = {
    CHUNK_SIZE: 20,
    chunks: {},
    worldSeed: 42,
    spawnX: 0,
    spawnY: 0,

    // Tile constants
    T: {
        GRASS: 0, PATH: 1, WATER: 2, WALL: 3, TREE: 4,
        HOUSE: 5, DOOR: 6, SHOP_WEAPON: 7, SHOP_ARMOR: 8,
        SHOP_POTION: 9, INN: 10, BRIDGE: 11, DARK_GRASS: 12,
        CAVE_FLOOR: 13, CAVE_WALL: 14, CAVE_ENTRY: 15,
        FOREST_ENTRY: 16, FLOWER: 17, SIGN: 18, CHEST: 19,
        STONE_FLOOR: 20, FENCE: 21, WELL: 22, STATUE: 23,
        SWAMP: 24, MOUNTAIN: 25, DESERT: 26, ROCK: 27,
        SWAMP_TREE: 28, CACTUS: 29, VILLAGE_HUT: 30,
    },

    // Biome types
    BIOME: {
        PLAINS: 0,
        FOREST: 1,
        SWAMP: 2,
        MOUNTAIN: 3,
        DESERT: 4,
    },

    init(seed) {
        this.worldSeed = seed || Math.floor(Math.random() * 999999);
        Perlin.seed(this.worldSeed);
        this.chunks = {};
        this.signTexts = {};
        this.chests = {};
        this.openedChests = new Set();
        this.villages = {};
    },

    // Seeded RNG for a specific position
    rng(x, y, extra = 0) {
        let s = (x * 374761 + y * 668265 + this.worldSeed + extra * 93487) & 0x7fffffff;
        s = ((s * 16807) + 0) % 2147483647;
        return (s - 1) / 2147483646;
    },

    // ========== BIOME DETERMINATION ==========
    getBiome(wx, wy) {
        const scale = 0.02;
        const temp = Perlin.fbm(wx * scale + 100, wy * scale + 100, 3);
        const moisture = Perlin.fbm(wx * scale + 500, wy * scale + 500, 3);

        // Spawn area is always plains
        const dist = Math.sqrt(wx * wx + wy * wy);
        if (dist < 12) return this.BIOME.PLAINS;

        if (temp > 0.25) return this.BIOME.DESERT;
        if (temp < -0.25) return this.BIOME.MOUNTAIN;
        if (moisture > 0.2) return this.BIOME.SWAMP;
        if (moisture < -0.1) return this.BIOME.FOREST;
        return this.BIOME.PLAINS;
    },

    // ========== DIFFICULTY ==========
    getDifficulty(wx, wy) {
        const dist = Math.sqrt(wx * wx + wy * wy);
        const base = Math.floor(dist / 15) + 1;
        const wave = Math.sin(dist * 0.08) * 2;
        return Math.max(1, Math.floor(base + wave));
    },

    // ========== CHUNK GENERATION ==========
    getChunkKey(cx, cy) {
        return `${cx},${cy}`;
    },

    getChunk(cx, cy) {
        const key = this.getChunkKey(cx, cy);
        if (!this.chunks[key]) {
            this.chunks[key] = this.generateChunk(cx, cy);
        }
        return this.chunks[key];
    },

    generateChunk(cx, cy) {
        const CS = this.CHUNK_SIZE;
        const T = this.T;
        const tiles = new Array(CS * CS);

        // World coordinates of chunk origin
        const ox = cx * CS;
        const oy = cy * CS;

        // Check if this chunk has a village
        const isVillage = this.isVillageChunk(cx, cy);

        for (let ly = 0; ly < CS; ly++) {
            for (let lx = 0; lx < CS; lx++) {
                const wx = ox + lx;
                const wy = oy + ly;
                const biome = this.getBiome(wx, wy);

                let tile = T.GRASS;

                // Elevation noise for water/obstacles
                const elev = Perlin.fbm(wx * 0.05, wy * 0.05, 3);

                // Water
                if (elev < -0.35) {
                    tile = T.WATER;
                } else {
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
                    }
                }

                // Paths connecting villages (use noise-based roads)
                const pathNoise = Perlin.noise2d(wx * 0.15, wy * 0.15);
                if (Math.abs(pathNoise) < 0.03 && tile !== T.WATER) {
                    tile = T.PATH;
                }

                tiles[ly * CS + lx] = tile;
            }
        }

        // Place village structures if this is a village chunk
        if (isVillage) {
            this.placeVillage(tiles, cx, cy, ox, oy);
        }

        // Random dungeon entrance
        if (!isVillage && this.rng(cx, cy, 100) < 0.06) {
            const dx = Math.floor(this.rng(cx, cy, 101) * (CS - 4)) + 2;
            const dy = Math.floor(this.rng(cx, cy, 102) * (CS - 4)) + 2;
            const idx = dy * CS + dx;
            if (tiles[idx] !== T.WATER) {
                tiles[idx] = T.CAVE_ENTRY;
                // Surround with cave walls
                for (let d = -1; d <= 1; d++) {
                    for (let e = -1; e <= 1; e++) {
                        if (d === 0 && e === 0) continue;
                        const ni = (dy + e) * CS + (dx + d);
                        if (ni >= 0 && ni < CS * CS && tiles[ni] !== T.CAVE_ENTRY) {
                            tiles[ni] = T.CAVE_WALL;
                        }
                    }
                }
            }
        }

        // Random chests
        if (this.rng(cx, cy, 200) < 0.15) {
            const chx = Math.floor(this.rng(cx, cy, 201) * (CS - 2)) + 1;
            const chy = Math.floor(this.rng(cx, cy, 202) * (CS - 2)) + 1;
            const cidx = chy * CS + chx;
            if (tiles[cidx] !== T.WATER && tiles[cidx] !== T.ROCK && tiles[cidx] !== T.CAVE_WALL) {
                tiles[cidx] = T.CHEST;
                const diff = this.getDifficulty(ox + chx, oy + chy);
                const chestKey = `${ox + chx},${oy + chy}`;
                this.chests[chestKey] = {
                    gold: Math.floor(10 + diff * 15 * this.rng(cx, cy, 203)),
                    item: this.rng(cx, cy, 204) < 0.4 ? {
                        id: 'potion', name: 'Mikstura HP', desc: 'Leczy 20 HP',
                        type: 'consumable', heal: 20 + diff * 5, count: 1 + Math.floor(diff / 3), price: 10
                    } : null
                };
            }
        }

        return { tiles, biome: this.getBiome(ox + CS/2, oy + CS/2) };
    },

    // ========== VILLAGE DETECTION ==========
    isVillageChunk(cx, cy) {
        // Village every ~7-10 chunks in a grid pattern with noise offset
        const vgrid = 8;
        const vcx = Math.round(cx / vgrid);
        const vcy = Math.round(cy / vgrid);
        const targetCx = vcx * vgrid + Math.floor(this.rng(vcx, vcy, 300) * 3 - 1);
        const targetCy = vcy * vgrid + Math.floor(this.rng(vcx, vcy, 301) * 3 - 1);
        return cx === targetCx && cy === targetCy;
    },

    // ========== VILLAGE PLACEMENT ==========
    placeVillage(tiles, cx, cy, ox, oy) {
        const CS = this.CHUNK_SIZE;
        const T = this.T;
        const key = this.getChunkKey(cx, cy);

        // Clear center area for village
        const center = Math.floor(CS / 2);
        const size = 3 + Math.floor(this.rng(cx, cy, 310) * 3); // 3-5 buildings

        // Village square
        for (let dy = center - 3; dy <= center + 3; dy++) {
            for (let dx = center - 3; dx <= center + 3; dx++) {
                if (dy >= 0 && dy < CS && dx >= 0 && dx < CS) {
                    tiles[dy * CS + dx] = T.STONE_FLOOR;
                }
            }
        }

        // Paths from square
        for (let i = 0; i < CS; i++) {
            if (i >= 0 && i < CS) {
                tiles[center * CS + i] = T.PATH;
                tiles[i * CS + center] = T.PATH;
            }
        }

        // Well in center
        tiles[center * CS + center] = T.WELL;

        // Sign
        tiles[(center - 1) * CS + (center + 1)] = T.SIGN;
        const diff = this.getDifficulty(ox + center, oy + center);
        const villageName = this.getVillageName(cx, cy);
        this.signTexts[`${ox + center + 1},${oy + center - 1}`] = `Witaj w ${villageName}!\nPoziom okolicy: ${diff}`;

        // Buildings placement
        const buildings = [T.SHOP_WEAPON, T.SHOP_ARMOR, T.SHOP_POTION, T.INN, T.HOUSE, T.HOUSE, T.HOUSE, T.VILLAGE_HUT];
        const positions = [
            [center - 4, center - 4], [center + 2, center - 4],
            [center - 4, center + 2], [center + 2, center + 2],
            [center - 5, center - 1], [center + 4, center - 1],
            [center - 5, center + 1], [center + 4, center + 1],
        ];

        for (let i = 0; i < size && i < positions.length; i++) {
            const [bx, by] = positions[i];
            if (bx >= 0 && bx + 2 < CS && by >= 0 && by + 2 < CS) {
                // Building footprint
                const buildingType = buildings[i];
                for (let ddy = 0; ddy < 2; ddy++) {
                    for (let ddx = 0; ddx < 2; ddx++) {
                        tiles[(by + ddy) * CS + (bx + ddx)] = T.HOUSE;
                    }
                }
                // Main tile (shop/inn door)
                tiles[(by + 1) * CS + bx] = buildingType;
            }
        }

        // Fence around village
        for (let dx = center - 6; dx <= center + 6; dx++) {
            if (dx >= 0 && dx < CS) {
                const topY = center - 6;
                const botY = center + 6;
                if (topY >= 0 && tiles[topY * CS + dx] === T.STONE_FLOOR) tiles[topY * CS + dx] = T.FENCE;
                if (topY >= 0 && tiles[topY * CS + dx] === T.GRASS) tiles[topY * CS + dx] = T.FENCE;
                if (botY < CS && tiles[botY * CS + dx] === T.STONE_FLOOR) tiles[botY * CS + dx] = T.FENCE;
                if (botY < CS && tiles[botY * CS + dx] === T.GRASS) tiles[botY * CS + dx] = T.FENCE;
            }
        }
        for (let dy = center - 6; dy <= center + 6; dy++) {
            if (dy >= 0 && dy < CS) {
                const leftX = center - 6;
                const rightX = center + 6;
                if (leftX >= 0) { const t = tiles[dy * CS + leftX]; if (t !== T.PATH) tiles[dy * CS + leftX] = T.FENCE; }
                if (rightX < CS) { const t = tiles[dy * CS + rightX]; if (t !== T.PATH) tiles[dy * CS + rightX] = T.FENCE; }
            }
        }
        // Gate openings
        tiles[center * CS + (center - 6)] = T.PATH;
        tiles[center * CS + (center + 6)] = T.PATH;
        tiles[(center - 6) * CS + center] = T.PATH;
        tiles[(center + 6) * CS + center] = T.PATH;

        this.villages[key] = { name: villageName, difficulty: diff };
    },

    // Village name generator
    getVillageName(cx, cy) {
        const prefixes = ['El','Ald','Kor','Myr','Dra','Val','Syl','Gor','Tar','Nol','Bel','Ith','Zar','Mor','Fen','Ash'];
        const suffixes = ['doria','heim','wald','grad','burg','ton','ria','lund','gar','mir','oth','ven','dal','sten','rok','vik'];
        const pi = Math.floor(this.rng(cx, cy, 350) * prefixes.length);
        const si = Math.floor(this.rng(cx, cy, 351) * suffixes.length);
        return prefixes[pi] + suffixes[si];
    },

    // ========== TILE ACCESS ==========
    getTile(wx, wy) {
        const cx = Math.floor(wx / this.CHUNK_SIZE);
        const cy = Math.floor(wy / this.CHUNK_SIZE);
        const lx = ((wx % this.CHUNK_SIZE) + this.CHUNK_SIZE) % this.CHUNK_SIZE;
        const ly = ((wy % this.CHUNK_SIZE) + this.CHUNK_SIZE) % this.CHUNK_SIZE;
        const chunk = this.getChunk(cx, cy);
        return chunk.tiles[ly * this.CHUNK_SIZE + lx];
    },

    setTile(wx, wy, tile) {
        const cx = Math.floor(wx / this.CHUNK_SIZE);
        const cy = Math.floor(wy / this.CHUNK_SIZE);
        const lx = ((wx % this.CHUNK_SIZE) + this.CHUNK_SIZE) % this.CHUNK_SIZE;
        const ly = ((wy % this.CHUNK_SIZE) + this.CHUNK_SIZE) % this.CHUNK_SIZE;
        const chunk = this.getChunk(cx, cy);
        chunk.tiles[ly * this.CHUNK_SIZE + lx] = tile;
    },

    isWalkable(wx, wy) {
        const t = this.getTile(wx, wy);
        const T = this.T;
        const blocked = [T.WATER, T.WALL, T.TREE, T.HOUSE, T.CAVE_WALL, T.FENCE,
                         T.WELL, T.STATUE, T.ROCK, T.SWAMP_TREE, T.CACTUS, T.VILLAGE_HUT];
        return !blocked.includes(t);
    },

    isInteractable(wx, wy) {
        const t = this.getTile(wx, wy);
        const T = this.T;
        return [T.SHOP_WEAPON, T.SHOP_ARMOR, T.SHOP_POTION, T.INN, T.SIGN, T.CHEST, T.WELL, T.CAVE_ENTRY].includes(t);
    },

    getAreaName(wx, wy) {
        // Check if in village
        const cx = Math.floor(wx / this.CHUNK_SIZE);
        const cy = Math.floor(wy / this.CHUNK_SIZE);
        const key = this.getChunkKey(cx, cy);
        if (this.villages[key]) return this.villages[key].name;

        const biome = this.getBiome(wx, wy);
        const names = ['Równiny','Mroczny Las','Bagno','Góry','Pustkowia'];
        const diff = this.getDifficulty(wx, wy);
        return `${names[biome]} (Lv.${diff})`;
    },

    getMonsterArea(wx, wy) {
        const biome = this.getBiome(wx, wy);
        // Map biomes to monster pool types
        const map = {
            [this.BIOME.PLAINS]: 'plains',
            [this.BIOME.FOREST]: 'forest',
            [this.BIOME.SWAMP]: 'swamp',
            [this.BIOME.MOUNTAIN]: 'mountain',
            [this.BIOME.DESERT]: 'desert',
        };
        return map[biome] || 'plains';
    },

    getEncounterChance(wx, wy) {
        const biome = this.getBiome(wx, wy);
        const t = this.getTile(wx, wy);
        const T = this.T;
        // No encounters on paths, in buildings, or on special tiles
        if ([T.PATH, T.STONE_FLOOR, T.BRIDGE].includes(t)) return 0;
        // No encounters in village chunks
        const cx = Math.floor(wx / this.CHUNK_SIZE);
        const cy = Math.floor(wy / this.CHUNK_SIZE);
        if (this.villages[this.getChunkKey(cx, cy)]) return 0;

        const rates = { 0: 0.08, 1: 0.16, 2: 0.14, 3: 0.18, 4: 0.12 };
        return rates[biome] || 0.1;
    },

    // Cleanup distant chunks to save memory
    cleanupChunks(playerX, playerY) {
        const maxDist = 5; // chunks
        const pcx = Math.floor(playerX / this.CHUNK_SIZE);
        const pcy = Math.floor(playerY / this.CHUNK_SIZE);

        for (const key in this.chunks) {
            const [cx, cy] = key.split(',').map(Number);
            if (Math.abs(cx - pcx) > maxDist || Math.abs(cy - pcy) > maxDist) {
                delete this.chunks[key];
            }
        }
    }
};
