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
    },

    BIOME: { PLAINS: 0, FOREST: 1, SWAMP: 2, MOUNTAIN: 3, DESERT: 4 },

    // Monster definitions per biome with sprite keys
    MONSTERS: {
        plains: [
            { name: 'Slime',  sprite: 'slime',  hp: 10, atk: 2, def: 0, xp: 5,  gold: [2,5] },
            { name: 'Goblin', sprite: 'goblin', hp: 15, atk: 3, def: 1, xp: 8,  gold: [3,8] },
            { name: 'Wilk',   sprite: 'wolf',   hp: 18, atk: 5, def: 1, xp: 10, gold: [2,6] },
        ],
        forest: [
            { name: 'Pająk',    sprite: 'spider',  hp: 12, atk: 6, def: 0, xp: 10, gold: [2,5] },
            { name: 'Ork',      sprite: 'orc',     hp: 25, atk: 7, def: 2, xp: 18, gold: [5,12] },
            { name: 'Bandyta',  sprite: 'bandit',   hp: 22, atk: 6, def: 3, xp: 15, gold: [8,15] },
            { name: 'Drzewiec', sprite: 'treant',   hp: 35, atk: 5, def: 5, xp: 20, gold: [4,10] },
        ],
        swamp: [
            { name: 'Żuk',    sprite: 'beetle', hp: 14, atk: 8, def: 1, xp: 12, gold: [3,7] },
            { name: 'Widmo',  sprite: 'ghost',  hp: 20, atk: 10,def: 0, xp: 18, gold: [5,12] },
            { name: 'Troll',  sprite: 'troll',  hp: 40, atk: 7, def: 4, xp: 25, gold: [8,18] },
        ],
        mountain: [
            { name: 'Golem',   sprite: 'golem',       hp: 45, atk: 8, def: 6, xp: 30, gold: [10,20] },
            { name: 'Gryf',    sprite: 'griffin',      hp: 30, atk: 12,def: 3, xp: 25, gold: [8,16] },
            { name: 'Rycerz',  sprite: 'dark_knight', hp: 35, atk: 14,def: 5, xp: 35, gold: [12,25] },
        ],
        desert: [
            { name: 'Skorpion', sprite: 'scorpion', hp: 18, atk: 9, def: 2, xp: 14, gold: [4,10] },
            { name: 'Mumia',    sprite: 'mummy',    hp: 30, atk: 8, def: 3, xp: 20, gold: [6,14] },
            { name: 'Dżinn',    sprite: 'djinn',    hp: 25, atk: 15,def: 2, xp: 30, gold: [10,22] },
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
        this.monsters = {};  // key: "x,y" -> monster object
        this.questItems = {}; // key: "x,y" -> { questId, itemName }
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
        if (dist < 12) return this.BIOME.PLAINS;
        if (temp > 0.25) return this.BIOME.DESERT;
        if (temp < -0.25) return this.BIOME.MOUNTAIN;
        if (moisture > 0.2) return this.BIOME.SWAMP;
        if (moisture < -0.1) return this.BIOME.FOREST;
        return this.BIOME.PLAINS;
    },

    // Normalized zone-based difficulty: each zone is a ring from center
    getDifficulty(wx, wy) {
        const dist = Math.sqrt(wx * wx + wy * wy);
        // Smooth rings, each 25 tiles wide = 1 level
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
                    }
                }

                const pathNoise = Perlin.noise2d(wx * 0.15, wy * 0.15);
                if (Math.abs(pathNoise) < 0.03 && tile !== T.WATER) tile = T.PATH;
                tiles[ly * CS + lx] = tile;
            }
        }

        if (isVillage) this.placeVillage(tiles, cx, cy, ox, oy);

        // Dungeon entrance
        if (!isVillage && this.rng(cx, cy, 100) < 0.06) {
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
        if (this.rng(cx, cy, 200) < 0.15) {
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

        // Spawn monsters in non-village chunks
        if (!isVillage) this.spawnChunkMonsters(cx, cy, ox, oy, tiles);

        return { tiles, biome: this.getBiome(ox + CS/2, oy + CS/2) };
    },

    // ========== MONSTER SPAWNING ==========
    spawnChunkMonsters(cx, cy, ox, oy, tiles) {
        const CS = this.CHUNK_SIZE;
        const biome = this.getBiome(ox + CS/2, oy + CS/2);
        const biomeKey = ['plains','forest','swamp','mountain','desert'][biome] || 'plains';
        const pool = this.MONSTERS[biomeKey];
        if (!pool) return;

        const diff = this.getDifficulty(ox + CS/2, oy + CS/2);
        const count = 3 + Math.floor(this.rng(cx, cy, 500) * 2); // 3-4 monsters

        for (let i = 0; i < count; i++) {
            const mx = Math.floor(this.rng(cx, cy, 510 + i) * (CS - 4)) + 2;
            const my = Math.floor(this.rng(cx, cy, 520 + i) * (CS - 4)) + 2;
            const wx = ox + mx;
            const wy = oy + my;
            const mKey = `${wx},${wy}`;

            // Don't spawn on blocked tiles or existing monsters
            if (this.monsters[mKey]) continue;
            const tile = tiles[my * CS + mx];
            if (this.isTileBlocked(tile)) continue;

            const base = pool[Math.floor(this.rng(cx, cy, 530 + i) * pool.length)];
            const scale = 1 + (diff - 1) * 0.4;
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
                stunned: 0,
                poisoned: 0,
                frozen: 0,
                alive: true,
            };
        }
    },

    isTileBlocked(t) {
        const T = this.T;
        return [T.WATER, T.WALL, T.TREE, T.HOUSE, T.CAVE_WALL, T.FENCE,
                T.WELL, T.STATUE, T.ROCK, T.SWAMP_TREE, T.CACTUS, T.VILLAGE_HUT,
                T.NPC_QUEST, T.NPC_QUEST2, T.NPC_SHOPKEEPER, T.SHOP_WEAPON_NPC,
                T.SHOP_ARMOR_NPC, T.SHOP_POTION_NPC, T.INN, T.CHEST].includes(t);
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

        // Village square
        for (let dy = center - 4; dy <= center + 4; dy++)
            for (let dx = center - 4; dx <= center + 4; dx++)
                if (dy >= 0 && dy < CS && dx >= 0 && dx < CS)
                    tiles[dy * CS + dx] = T.STONE_FLOOR;

        // Paths
        for (let i = 0; i < CS; i++) {
            tiles[center * CS + i] = T.PATH;
            tiles[i * CS + center] = T.PATH;
        }

        // Well
        tiles[center * CS + center] = T.WELL;

        // Sign
        tiles[(center - 1) * CS + (center + 1)] = T.SIGN;
        this.signTexts[`${ox + center + 1},${oy + center - 1}`] = `Witaj w ${villageName}!\nPoziom: ${diff}`;

        // === SEPARATE SHOP BUILDINGS (one NPC per shop type) ===
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
            tiles[(by + 2) * CS + (bx + 1)] = s.npcTile;  // NPC on exterior side
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
        // Gates
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
            const target = pool[Math.floor(this.rng(cx,cy,410+idx) * pool.length)].name;
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
        for (let i = 0; i < count + 3; i++) { // spawn a few extra
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
        return true;
    },

    getAreaName(wx, wy) {
        const cx = Math.floor(wx / this.CHUNK_SIZE);
        const cy = Math.floor(wy / this.CHUNK_SIZE);
        const key = this.getChunkKey(cx, cy);
        if (this.villages[key]) return this.villages[key].name;
        const biome = this.getBiome(wx, wy);
        const names = ['Równiny','Mroczny Las','Bagno','Góry','Pustkowia'];
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
    ],

    activeDungeon: null, // { type, floor, tiles, monsters, exitX, exitY, size }
    dungeonReturnPos: null, // { x, y } - where player was before entering

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

        // Simple room-based dungeon generation
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

        // Connect rooms with corridors
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

        // Place entrance in first room
        const startRoom = rooms[0];
        tiles[startRoom.cy * S + startRoom.cx] = this.T.CAVE_ENTRY;
        d.entryX = startRoom.cx;
        d.entryY = startRoom.cy;

        // Place exit/boss in last room
        const endRoom = rooms[rooms.length - 1];
        if (isBossFloor) {
            // Boss marker - just a floor tile, boss is a monster
            tiles[endRoom.cy * S + endRoom.cx] = this.T.CAVE_FLOOR;
        } else {
            // Stairs down
            tiles[endRoom.cy * S + endRoom.cx] = this.T.CAVE_ENTRY;
            d.exitX = endRoom.cx;
            d.exitY = endRoom.cy;
        }

        // Clear dungeon monsters
        d.monsters = {};

        // Spawn dungeon monsters
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
                stunned: 0, poisoned: 0, frozen: 0, alive: true,
            };
        }

        // Spawn boss on boss floor
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
                stunned: 0, poisoned: 0, frozen: 0, alive: true,
            };
        }

        // Place a chest in a random room
        if (rooms.length > 2) {
            const chestRoom = rooms[Math.floor(rooms.length / 2)];
            tiles[chestRoom.cy * S + (chestRoom.cx + 1)] = this.T.CHEST;
            const ckey = `${chestRoom.cx + 1},${chestRoom.cy}`;
            d.chests = d.chests || {};
            d.chests[ckey] = { gold: Math.floor(15 + d.difficulty * 12 + d.floor * 8) };
        }

        d.tiles = tiles;

        // Position player at entrance
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

    // Dungeon-aware tile/monster access
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
                // Clean up monsters in that chunk
                const ox = cx * this.CHUNK_SIZE, oy = cy * this.CHUNK_SIZE;
                for (let y = oy; y < oy + this.CHUNK_SIZE; y++)
                    for (let x = ox; x < ox + this.CHUNK_SIZE; x++)
                        delete this.monsters[`${x},${y}`];
            }
        }
    },
};
