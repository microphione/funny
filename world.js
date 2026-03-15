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
        NPC_QUEST: 31, NPC_QUEST2: 32, NPC_SHOPKEEPER: 33,
        SHOP_COUNTER: 34, SHOP_FLOOR: 35,
    },

    BIOME: {
        PLAINS: 0, FOREST: 1, SWAMP: 2, MOUNTAIN: 3, DESERT: 4,
    },

    init(seed) {
        this.worldSeed = seed || Math.floor(Math.random() * 999999);
        Perlin.seed(this.worldSeed);
        this.chunks = {};
        this.signTexts = {};
        this.chests = {};
        this.openedChests = new Set();
        this.villages = {};
        this.npcs = {};         // NPC data per village
        this.questNpcs = {};    // Quest NPC positions -> quest data
    },

    rng(x, y, extra = 0) {
        let s = (x * 374761 + y * 668265 + this.worldSeed + extra * 93487) & 0x7fffffff;
        s = ((s * 16807) + 0) % 2147483647;
        return (s - 1) / 2147483646;
    },

    // ========== BIOME ==========
    getBiome(wx, wy) {
        const scale = 0.02;
        const temp = Perlin.fbm(wx * scale + 100, wy * scale + 100, 3);
        const moisture = Perlin.fbm(wx * scale + 500, wy * scale + 500, 3);
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
    getChunkKey(cx, cy) { return `${cx},${cy}`; },

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
        const ox = cx * CS;
        const oy = cy * CS;
        const isVillage = this.isVillageChunk(cx, cy);

        for (let ly = 0; ly < CS; ly++) {
            for (let lx = 0; lx < CS; lx++) {
                const wx = ox + lx;
                const wy = oy + ly;
                const biome = this.getBiome(wx, wy);
                let tile = T.GRASS;
                const elev = Perlin.fbm(wx * 0.05, wy * 0.05, 3);

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

                const pathNoise = Perlin.noise2d(wx * 0.15, wy * 0.15);
                if (Math.abs(pathNoise) < 0.03 && tile !== T.WATER) {
                    tile = T.PATH;
                }
                tiles[ly * CS + lx] = tile;
            }
        }

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
        const vgrid = 8;
        const vcx = Math.round(cx / vgrid);
        const vcy = Math.round(cy / vgrid);
        const targetCx = vcx * vgrid + Math.floor(this.rng(vcx, vcy, 300) * 3 - 1);
        const targetCy = vcy * vgrid + Math.floor(this.rng(vcx, vcy, 301) * 3 - 1);
        return cx === targetCx && cy === targetCy;
    },

    // ========== VILLAGE PLACEMENT (improved with interior shops & NPCs) ==========
    placeVillage(tiles, cx, cy, ox, oy) {
        const CS = this.CHUNK_SIZE;
        const T = this.T;
        const key = this.getChunkKey(cx, cy);
        const center = Math.floor(CS / 2);
        const diff = this.getDifficulty(ox + center, oy + center);
        const villageName = this.getVillageName(cx, cy);

        // Clear center area for village square
        for (let dy = center - 4; dy <= center + 4; dy++) {
            for (let dx = center - 4; dx <= center + 4; dx++) {
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
        this.signTexts[`${ox + center + 1},${oy + center - 1}`] = `Witaj w ${villageName}!\nPoziom okolicy: ${diff}`;

        // === BUILDINGS ===
        // Each building is 3x3 with an interior: walls, floor, counter, NPC
        const buildingDefs = [
            { type: 'weapon', tile: T.SHOP_WEAPON, pos: [center - 5, center - 5] },
            { type: 'armor',  tile: T.SHOP_ARMOR,  pos: [center + 3, center - 5] },
            { type: 'potion', tile: T.SHOP_POTION, pos: [center - 5, center + 3] },
            { type: 'inn',    tile: T.INN,         pos: [center + 3, center + 3] },
        ];

        buildingDefs.forEach(bdef => {
            const [bx, by] = bdef.pos;
            if (bx < 0 || bx + 3 >= CS || by < 0 || by + 3 >= CS) return;

            // 3x3 building footprint
            // Top row: HOUSE HOUSE HOUSE
            // Mid row: HOUSE SHOPKEEPER HOUSE
            // Bot row: HOUSE DOOR HOUSE
            for (let ddy = 0; ddy < 3; ddy++) {
                for (let ddx = 0; ddx < 3; ddx++) {
                    tiles[(by + ddy) * CS + (bx + ddx)] = T.HOUSE;
                }
            }
            // Interior floor
            tiles[(by + 1) * CS + (bx + 1)] = T.SHOP_FLOOR;
            // Door at bottom center
            tiles[(by + 2) * CS + (bx + 1)] = bdef.tile;
            // NPC shopkeeper inside (above door)
            tiles[(by) * CS + (bx + 1)] = T.NPC_SHOPKEEPER;

            // Store NPC shop data
            const npcKey = `${ox + bx + 1},${oy + by}`;
            this.npcs[npcKey] = {
                type: 'shop',
                shopType: bdef.type,
                difficulty: diff,
                villageName
            };
        });

        // === QUEST NPCs ===
        // NPC 1 - near center-left
        const q1x = center - 2;
        const q1y = center - 2;
        if (q1x >= 0 && q1x < CS && q1y >= 0 && q1y < CS) {
            tiles[q1y * CS + q1x] = T.NPC_QUEST;
            const qKey = `${ox + q1x},${oy + q1y}`;
            this.questNpcs[qKey] = this.generateQuest(cx, cy, 0, diff, villageName);
        }

        // NPC 2 - near center-right
        const q2x = center + 2;
        const q2y = center + 2;
        if (q2x >= 0 && q2x < CS && q2y >= 0 && q2y < CS) {
            tiles[q2y * CS + q2x] = T.NPC_QUEST2;
            const qKey = `${ox + q2x},${oy + q2y}`;
            this.questNpcs[qKey] = this.generateQuest(cx, cy, 1, diff, villageName);
        }

        // Decorative buildings (houses)
        const housePosns = [
            [center - 5, center - 1], [center + 4, center - 1],
            [center - 5, center + 1], [center + 4, center + 1],
        ];
        housePosns.forEach((pos, i) => {
            const [hx, hy] = pos;
            if (hx >= 0 && hx + 1 < CS && hy >= 0 && hy + 1 < CS) {
                tiles[hy * CS + hx] = T.HOUSE;
                tiles[hy * CS + (hx + 1)] = T.HOUSE;
                tiles[(hy + 1) * CS + hx] = T.VILLAGE_HUT;
                tiles[(hy + 1) * CS + (hx + 1)] = T.HOUSE;
            }
        });

        // Fence around village
        for (let dx = center - 7; dx <= center + 7; dx++) {
            if (dx >= 0 && dx < CS) {
                const topY = center - 7;
                const botY = center + 7;
                if (topY >= 0 && topY < CS) tiles[topY * CS + dx] = T.FENCE;
                if (botY >= 0 && botY < CS) tiles[botY * CS + dx] = T.FENCE;
            }
        }
        for (let dy = center - 7; dy <= center + 7; dy++) {
            if (dy >= 0 && dy < CS) {
                const leftX = center - 7;
                const rightX = center + 7;
                if (leftX >= 0) tiles[dy * CS + leftX] = T.FENCE;
                if (rightX < CS) tiles[dy * CS + rightX] = T.FENCE;
            }
        }
        // Gate openings on paths
        tiles[center * CS + (center - 7)] = T.PATH;
        tiles[center * CS + (center + 7)] = T.PATH;
        if (center - 7 >= 0) tiles[(center - 7) * CS + center] = T.PATH;
        if (center + 7 < CS) tiles[(center + 7) * CS + center] = T.PATH;

        this.villages[key] = {
            name: villageName,
            difficulty: diff,
            wellX: ox + center,
            wellY: oy + center
        };
    },

    // ========== QUEST GENERATION ==========
    generateQuest(cx, cy, idx, difficulty, villageName) {
        const isKillQuest = this.rng(cx, cy, 400 + idx) > 0.5;
        const biome = this.getBiome(cx * this.CHUNK_SIZE + 10, cy * this.CHUNK_SIZE + 10);
        const biomeNames = { 0: 'plains', 1: 'forest', 2: 'swamp', 3: 'mountain', 4: 'desert' };
        const area = biomeNames[biome] || 'plains';

        if (isKillQuest) {
            const monsterNames = {
                plains: ['Slime', 'Goblin', 'Wilk'],
                forest: ['Leśny Pająk', 'Ork Zwiadowca', 'Bandyta'],
                swamp: ['Trujący Żuk', 'Bagienne Widmo', 'Troll Bagienny'],
                mountain: ['Golem', 'Gryf', 'Mroczny Rycerz'],
                desert: ['Skorpion', 'Mumia', 'Dżinn'],
            };
            const pool = monsterNames[area] || monsterNames.plains;
            const target = pool[Math.floor(this.rng(cx, cy, 410 + idx) * pool.length)];
            const count = 3 + Math.floor(this.rng(cx, cy, 420 + idx) * 5);
            const goldReward = Math.floor((20 + difficulty * 15) * (1 + this.rng(cx, cy, 430 + idx)));
            const xpReward = Math.floor(15 + difficulty * 10);

            return {
                id: `kill_${cx}_${cy}_${idx}`,
                type: 'kill',
                title: `Zabij ${count}x ${target}`,
                desc: `Okolica ${villageName} jest terroryzowana przez potwory. Pokonaj ${count} potworów typu ${target}.`,
                target,
                required: count,
                progress: 0,
                reward: { gold: goldReward, xp: xpReward },
                villageName,
                area,
                completed: false,
                turned_in: false,
            };
        } else {
            const items = [
                { name: 'Zioła Lecznicze', id: 'herb' },
                { name: 'Grzyby Świecące', id: 'mushroom' },
                { name: 'Kryształy Magiczne', id: 'crystal' },
                { name: 'Stare Monety', id: 'old_coin' },
                { name: 'Skóry Potworów', id: 'hide' },
            ];
            const itemIdx = Math.floor(this.rng(cx, cy, 440 + idx) * items.length);
            const item = items[itemIdx];
            const count = 3 + Math.floor(this.rng(cx, cy, 450 + idx) * 5);
            const goldReward = Math.floor((15 + difficulty * 12) * (1 + this.rng(cx, cy, 460 + idx)));
            const xpReward = Math.floor(10 + difficulty * 8);

            // Target area - point towards nearby wilderness
            const angle = this.rng(cx, cy, 470 + idx) * Math.PI * 2;
            const dist = 30 + Math.floor(this.rng(cx, cy, 480 + idx) * 40);
            const targetX = Math.floor(cx * this.CHUNK_SIZE + 10 + Math.cos(angle) * dist);
            const targetY = Math.floor(cy * this.CHUNK_SIZE + 10 + Math.sin(angle) * dist);

            return {
                id: `collect_${cx}_${cy}_${idx}`,
                type: 'collect',
                title: `Zbierz ${count}x ${item.name}`,
                desc: `Mieszkańcy ${villageName} potrzebują ${count} sztuk "${item.name}". Szukaj w okolicznych terenach.`,
                itemId: item.id,
                itemName: item.name,
                required: count,
                progress: 0,
                reward: { gold: goldReward, xp: xpReward },
                villageName,
                targetX,
                targetY,
                completed: false,
                turned_in: false,
            };
        }
    },

    // ========== VILLAGE NAME ==========
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
                         T.WELL, T.STATUE, T.ROCK, T.SWAMP_TREE, T.CACTUS, T.VILLAGE_HUT,
                         T.NPC_QUEST, T.NPC_QUEST2, T.NPC_SHOPKEEPER, T.SHOP_COUNTER];
        return !blocked.includes(t);
    },

    isInteractable(wx, wy) {
        const t = this.getTile(wx, wy);
        const T = this.T;
        return [T.SHOP_WEAPON, T.SHOP_ARMOR, T.SHOP_POTION, T.INN, T.SIGN, T.CHEST,
                T.WELL, T.CAVE_ENTRY, T.NPC_QUEST, T.NPC_QUEST2, T.NPC_SHOPKEEPER].includes(t);
    },

    getAreaName(wx, wy) {
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
        if ([T.PATH, T.STONE_FLOOR, T.BRIDGE, T.SHOP_FLOOR].includes(t)) return 0;
        const cx = Math.floor(wx / this.CHUNK_SIZE);
        const cy = Math.floor(wy / this.CHUNK_SIZE);
        if (this.villages[this.getChunkKey(cx, cy)]) return 0;
        const rates = { 0: 0.08, 1: 0.16, 2: 0.14, 3: 0.18, 4: 0.12 };
        return rates[biome] || 0.1;
    },

    // Find nearest village well for respawn
    findNearestVillageWell(wx, wy) {
        let best = null;
        let bestDist = Infinity;
        for (const key in this.villages) {
            const v = this.villages[key];
            const dx = v.wellX - wx;
            const dy = v.wellY - wy;
            const d = dx * dx + dy * dy;
            if (d < bestDist) {
                bestDist = d;
                best = v;
            }
        }
        return best;
    },

    cleanupChunks(playerX, playerY) {
        const maxDist = 5;
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
