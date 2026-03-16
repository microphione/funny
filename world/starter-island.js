// ============================================================
// STARTER ISLAND - Large 800x800 island with multiple zones,
// town on level +1, dungeons, and unique NPCs
// ============================================================

// Get the island center in world coordinates
World.getIslandCenter = function() {
    return {
        x: STARTER_ISLAND.cx * this.CHUNK_SIZE + Math.floor(this.CHUNK_SIZE / 2),
        y: STARTER_ISLAND.cy * this.CHUNK_SIZE + Math.floor(this.CHUNK_SIZE / 2)
    };
};

// Check if a chunk is part of the starter island
World.isStarterIslandChunk = function(cx, cy) {
    const ic = this.getIslandCenter();
    const chunkCenterX = cx * this.CHUNK_SIZE + this.CHUNK_SIZE / 2;
    const chunkCenterY = cy * this.CHUNK_SIZE + this.CHUNK_SIZE / 2;
    const dist = Math.sqrt((chunkCenterX - ic.x) ** 2 + (chunkCenterY - ic.y) ** 2);
    return dist <= STARTER_ISLAND.radius + this.CHUNK_SIZE;
};

// Get the zone at a given world position (relative to island center)
World.getIslandZone = function(wx, wy) {
    const ic = this.getIslandCenter();
    const rx = wx - ic.x;
    const ry = wy - ic.y;
    const distFromCenter = Math.sqrt(rx * rx + ry * ry);

    // Edge = beach
    if (distFromCenter > STARTER_ISLAND.radius - 30) return 'beach';

    // Check named zones
    const zones = STARTER_ISLAND.zones;
    for (const [zName, z] of Object.entries(zones)) {
        const dx = rx - z.x;
        const dy = ry - z.y;
        if (Math.sqrt(dx * dx + dy * dy) <= z.radius) return zName;
    }

    // Biome based on position
    const angle = Math.atan2(ry, rx);
    if (angle > -0.5 && angle < 0.8 && distFromCenter > 100) return 'forest';
    if (angle > 2.0 || angle < -2.5) return 'swamp';
    if (angle < -1.0 && angle > -2.5 && distFromCenter > 150) return 'ruins';
    if (angle > 0.8 && angle < 2.0 && distFromCenter > 100) return 'pirate';

    return 'plains'; // Default
};

// Generate terrain for a starter island chunk
World.generateIslandChunkTerrain = function(tiles, cx, cy, ox, oy) {
    const CS = this.CHUNK_SIZE;
    const T = this.T;
    const ic = this.getIslandCenter();

    for (let ly = 0; ly < CS; ly++) {
        for (let lx = 0; lx < CS; lx++) {
            const wx = ox + lx;
            const wy = oy + ly;
            const dist = Math.sqrt((wx - ic.x) ** 2 + (wy - ic.y) ** 2);

            // Outside island = water
            if (dist > STARTER_ISLAND.radius) {
                tiles[ly * CS + lx] = T.WATER;
                continue;
            }

            // Beach ring (outer 30 tiles)
            if (dist > STARTER_ISLAND.radius - 30) {
                const beachNoise = this.rng(wx, wy, 900);
                if (dist > STARTER_ISLAND.radius - 5) {
                    tiles[ly * CS + lx] = T.WATER;
                } else if (dist > STARTER_ISLAND.radius - 15) {
                    tiles[ly * CS + lx] = T.DESERT; // Sand
                    if (beachNoise < 0.03) tiles[ly * CS + lx] = T.ROCK;
                } else {
                    tiles[ly * CS + lx] = T.DESERT;
                    if (beachNoise < 0.05) tiles[ly * CS + lx] = T.FLOWER;
                    if (beachNoise > 0.95) tiles[ly * CS + lx] = T.ROCK;
                }
                continue;
            }

            const zone = this.getIslandZone(wx, wy);
            let tile = T.GRASS;

            switch (zone) {
                case 'forest':
                case 'forest_east': {
                    tile = T.DARK_GRASS;
                    const fn = this.rng(wx, wy, 3);
                    if (fn < 0.20) tile = T.TREE;
                    else if (fn < 0.22) tile = T.FLOWER;
                    break;
                }
                case 'swamp':
                case 'swamp_nw': {
                    tile = T.SWAMP;
                    const sn = this.rng(wx, wy, 5);
                    if (sn < 0.08) tile = T.SWAMP_TREE;
                    const elev = Perlin.fbm(wx * 0.06, wy * 0.06, 2);
                    if (elev < -0.25) tile = T.WATER;
                    break;
                }
                case 'ruins':
                case 'ruins_north': {
                    tile = T.MOUNTAIN;
                    const rn = this.rng(wx, wy, 7);
                    if (rn < 0.05) tile = T.ROCK;
                    else if (rn < 0.15) tile = T.STONE_FLOOR;
                    else if (rn < 0.18) tile = T.CAVE_WALL;
                    break;
                }
                case 'pirate':
                case 'pirate_bay': {
                    tile = T.DESERT;
                    const pn = this.rng(wx, wy, 9);
                    if (pn < 0.03) tile = T.ROCK;
                    else if (pn < 0.05) tile = T.TREE;
                    break;
                }
                case 'druid_clearing': {
                    tile = T.GRASS;
                    const dn = this.rng(wx, wy, 11);
                    if (dn < 0.08) tile = T.FLOWER;
                    break;
                }
                case 'lighthouse': {
                    tile = T.STONE_FLOOR;
                    break;
                }
                case 'port': {
                    tile = T.STONE_FLOOR;
                    const portn = this.rng(wx, wy, 13);
                    if (portn < 0.02) tile = T.FENCE;
                    break;
                }
                default: {
                    // Plains with variety
                    tile = T.GRASS;
                    const gn = this.rng(wx, wy, 1);
                    if (gn < 0.02) tile = T.FLOWER;
                    if (gn > 0.97) tile = T.TREE;
                    break;
                }
            }

            // Natural paths connecting areas (using noise)
            const pathNoise = Perlin.noise2d(wx * 0.1, wy * 0.1);
            const rx = wx - ic.x, ry = wy - ic.y;
            // Main paths from center to edges
            if ((Math.abs(rx) < 2 || Math.abs(ry) < 2) && dist < STARTER_ISLAND.radius - 30 && dist > 5) {
                tile = T.PATH;
            }
            // Diagonal paths
            if (Math.abs(Math.abs(rx) - Math.abs(ry)) < 2 && dist < 200 && dist > 5 && this.rng(wx, wy, 50) < 0.5) {
                tile = T.PATH;
            }
            // Noise-based paths
            if (Math.abs(pathNoise) < 0.02 && tile !== T.WATER && dist > 10 && dist < STARTER_ISLAND.radius - 35) {
                tile = T.PATH;
            }

            tiles[ly * CS + lx] = tile;
        }
    }
};

// Place special locations on the island
World.placeIslandLocations = function(tiles, cx, cy, ox, oy) {
    const CS = this.CHUNK_SIZE;
    const T = this.T;
    const ic = this.getIslandCenter();

    // Check each tile for proximity to special locations
    for (let ly = 0; ly < CS; ly++) {
        for (let lx = 0; lx < CS; lx++) {
            const wx = ox + lx;
            const wy = oy + ly;
            const rx = wx - ic.x;
            const ry = wy - ic.y;

            // Town stairs at center (exact center tile)
            if (rx === 0 && ry === 0) {
                tiles[ly * CS + lx] = T.STAIRS_UP;
                this.signTexts[`${wx},${wy}`] = 'Schody do Miasta Szmaragdowego';
            }
            // Sign near stairs
            if (rx === 0 && ry === -1) {
                tiles[ly * CS + lx] = T.SIGN;
                this.signTexts[`${wx},${wy}`] = 'Miasto Szmaragdowe - Wejście (SPACJA)';
            }
            // Well near center for respawn
            if (rx === 2 && ry === 0) {
                tiles[ly * CS + lx] = T.WELL;
            }
            // Stone floor around center
            if (Math.abs(rx) <= 4 && Math.abs(ry) <= 4 && tiles[ly * CS + lx] !== T.STAIRS_UP && tiles[ly * CS + lx] !== T.SIGN && tiles[ly * CS + lx] !== T.WELL) {
                tiles[ly * CS + lx] = T.STONE_FLOOR;
            }
        }
    }

    // Place dungeon entrances
    const dungeonLocations = [
        { zone: 'crab_cave', dx: 100, dy: 280, dungeon: STARTER_ISLAND.dungeons[0] },
        { zone: 'pirate_tunnel', dx: -250, dy: 250, dungeon: STARTER_ISLAND.dungeons[1] },
        { zone: 'crypt_entrance', dx: 50, dy: -280, dungeon: STARTER_ISLAND.dungeons[2] },
        { zone: 'mine_entrance', dx: 250, dy: -200, dungeon: STARTER_ISLAND.dungeons[3] },
    ];

    for (const dl of dungeonLocations) {
        const dwx = ic.x + dl.dx;
        const dwy = ic.y + dl.dy;
        const dcx = Math.floor(dwx / CS);
        const dcy = Math.floor(dwy / CS);
        if (dcx === cx && dcy === cy) {
            const localX = ((dwx % CS) + CS) % CS;
            const localY = ((dwy % CS) + CS) % CS;
            if (localX >= 0 && localX < CS && localY >= 0 && localY < CS) {
                tiles[localY * CS + localX] = T.CAVE_ENTRY;
                // Store dungeon type for this entrance
                this.islandDungeons = this.islandDungeons || {};
                this.islandDungeons[`${dwx},${dwy}`] = dl.dungeon;
                // Cave walls around entrance
                for (let d = -1; d <= 1; d++) for (let e = -1; e <= 1; e++) {
                    if (d === 0 && e === 0) continue;
                    const nx = localX + d, ny = localY + e;
                    if (nx >= 0 && nx < CS && ny >= 0 && ny < CS) {
                        if (tiles[ny * CS + nx] !== T.CAVE_ENTRY) tiles[ny * CS + nx] = T.CAVE_WALL;
                    }
                }
                // Sign near dungeon
                const signX = localX, signY = localY - 2;
                if (signX >= 0 && signX < CS && signY >= 0 && signY < CS) {
                    tiles[signY * CS + signX] = T.SIGN;
                    this.signTexts[`${ox + signX},${oy + signY}`] = `${dl.dungeon.name} (Lv.${dl.dungeon.minLevel}+)`;
                }
            }
        }
    }

    // Place lighthouse
    const lhx = ic.x - 300, lhy = ic.y;
    const lhcx = Math.floor(lhx / CS), lhcy = Math.floor(lhy / CS);
    if (lhcx === cx && lhcy === cy) {
        const llx = ((lhx % CS) + CS) % CS;
        const lly = ((lhy % CS) + CS) % CS;
        if (llx >= 0 && llx < CS && lly >= 0 && lly < CS) {
            // Lighthouse structure (3x3 stone with well on top)
            for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
                const nx = llx + dx, ny = lly + dy;
                if (nx >= 0 && nx < CS && ny >= 0 && ny < CS) {
                    if (dx === 0 && dy === 0) tiles[ny * CS + nx] = T.STATUE; // Lighthouse tower
                    else if (dy === 1 && dx === 0) tiles[ny * CS + nx] = T.STONE_FLOOR; // Entrance
                    else tiles[ny * CS + nx] = T.HOUSE_WALL;
                }
            }
            // Żeglarz NPC
            const npcX = llx, npcY = lly + 2;
            if (npcX >= 0 && npcX < CS && npcY >= 0 && npcY < CS) {
                tiles[npcY * CS + npcX] = T.NPC_QUEST;
                this.questNpcs[`${ox + npcX},${oy + npcY}`] = {
                    id: 'si_zeglarz', type: 'starter_island_npc',
                    name: 'Stary Żeglarz',
                };
            }
            const signNX = llx + 1, signNY = lly + 2;
            if (signNX >= 0 && signNX < CS && signNY >= 0 && signNY < CS) {
                tiles[signNY * CS + signNX] = T.SIGN;
                this.signTexts[`${ox + signNX},${oy + signNY}`] = 'Latarnia Morska - Stary Żeglarz opowie o świecie';
            }
        }
    }

    // Place Druid on clearing
    const drx = ic.x + 150, dry = ic.y + 150;
    const drcx = Math.floor(drx / CS), drcy = Math.floor(dry / CS);
    if (drcx === cx && drcy === cy) {
        const dlx = ((drx % CS) + CS) % CS;
        const dly = ((dry % CS) + CS) % CS;
        if (dlx >= 0 && dlx < CS && dly >= 0 && dly < CS) {
            tiles[dly * CS + dlx] = T.NPC_QUEST;
            this.questNpcs[`${ox + dlx},${oy + dly}`] = {
                id: 'si_druid', type: 'starter_island_npc',
                name: 'Druid',
            };
            // Stone circle around druid
            for (let a = 0; a < 8; a++) {
                const sx = Math.round(Math.cos(a * Math.PI / 4) * 5);
                const sy = Math.round(Math.sin(a * Math.PI / 4) * 5);
                const snx = dlx + sx, sny = dly + sy;
                if (snx >= 0 && snx < CS && sny >= 0 && sny < CS) {
                    tiles[sny * CS + snx] = T.ROCK;
                }
            }
        }
    }

    // Place port with Captain
    const portX = ic.x, portY = ic.y + 300;
    const pcx2 = Math.floor(portX / CS), pcy2 = Math.floor(portY / CS);
    if (pcx2 === cx && pcy2 === cy) {
        const plx = ((portX % CS) + CS) % CS;
        const ply = ((portY % CS) + CS) % CS;
        if (plx >= 0 && plx < CS && ply >= 0 && ply < CS) {
            // Port dock
            for (let dx = -3; dx <= 3; dx++) {
                const nx = plx + dx;
                if (nx >= 0 && nx < CS) {
                    tiles[ply * CS + nx] = T.BRIDGE;
                    if (ply - 1 >= 0) tiles[(ply - 1) * CS + nx] = T.STONE_FLOOR;
                }
            }
            // Captain NPC
            if (ply - 2 >= 0) {
                tiles[(ply - 2) * CS + plx] = T.NPC_QUEST;
                this.questNpcs[`${ox + plx},${oy + ply - 2}`] = {
                    id: 'si_kapitan_statku', type: 'starter_captain',
                    name: 'Kapitan Statku',
                };
            }
            // Sign
            if (plx + 2 < CS && ply - 2 >= 0) {
                tiles[(ply - 2) * CS + (plx + 2)] = T.SIGN;
                this.signTexts[`${ox + plx + 2},${oy + ply - 2}`] = 'Port - Statek do Kontynentu (Lv.20)';
            }
        }
    }

    // Pirate camp
    const pirX = ic.x - 200, pirY = ic.y + 200;
    const pircx = Math.floor(pirX / CS), pircy = Math.floor(pirY / CS);
    if (pircx === cx && pircy === cy) {
        const plx2 = ((pirX % CS) + CS) % CS;
        const ply2 = ((pirY % CS) + CS) % CS;
        if (plx2 >= 0 && plx2 < CS && ply2 >= 0 && ply2 < CS) {
            // Pirate camp: tent, fire, chests
            for (let dy = -2; dy <= 2; dy++) for (let dx = -3; dx <= 3; dx++) {
                const nx = plx2 + dx, ny = ply2 + dy;
                if (nx >= 0 && nx < CS && ny >= 0 && ny < CS) {
                    tiles[ny * CS + nx] = T.DESERT;
                }
            }
            // Fence around camp
            for (let dx = -3; dx <= 3; dx++) {
                const nx = plx2 + dx;
                if (nx >= 0 && nx < CS) {
                    if (ply2 - 2 >= 0) tiles[(ply2 - 2) * CS + nx] = T.FENCE;
                    if (ply2 + 2 < CS) tiles[(ply2 + 2) * CS + nx] = T.FENCE;
                }
            }
            // Chest in camp
            if (plx2 - 2 >= 0 && ply2 >= 0) {
                tiles[ply2 * CS + (plx2 - 2)] = T.CHEST;
                this.chests[`${ox + plx2 - 2},${oy + ply2}`] = { gold: 50 };
            }
        }
    }
};

// Spawn monsters appropriate to the zone
World.spawnStarterIslandMonsters = function(cx, cy, ox, oy, tiles) {
    const CS = this.CHUNK_SIZE;
    const pool = STARTER_ISLAND.monsters;
    const ic = this.getIslandCenter();

    // Difficulty based on distance from island center
    const chunkCenterX = ox + Math.floor(CS / 2);
    const chunkCenterY = oy + Math.floor(CS / 2);
    const distFromCenter = Math.sqrt((chunkCenterX - ic.x) ** 2 + (chunkCenterY - ic.y) ** 2);
    const diff = Math.max(1, Math.min(15, Math.floor(distFromCenter / 25) + 1));

    // Get zone for this chunk
    const zone = this.getIslandZone(chunkCenterX, chunkCenterY);

    // Skip monster spawning near town stairs
    if (zone === 'town_stairs' || zone === 'port' || zone === 'lighthouse') return;

    // Map zones to monster zone tags
    const zoneToMonsterZone = {
        'beach': 'beach', 'beach_south': 'beach',
        'forest': 'forest', 'forest_east': 'forest',
        'swamp': 'swamp', 'swamp_nw': 'swamp',
        'ruins': 'ruins', 'ruins_north': 'ruins',
        'pirate': 'pirate', 'pirate_bay': 'pirate',
        'druid_clearing': 'forest',
        'plains': 'any',
    };
    const monsterZone = zoneToMonsterZone[zone] || 'any';

    // Filter monsters by difficulty and zone
    const validPool = pool.filter(m => {
        if (diff < m.minDiff || diff > m.maxDiff) return false;
        return m.zone === monsterZone || m.zone === 'any';
    });
    if (validPool.length === 0) return;

    const count = 2 + Math.floor(this.rng(cx, cy, 600) * 4);
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
        const scale = 1 + (diff - 1) * 0.2;
        const isElite = this.rng(cx, cy, 640 + sp) < 0.06;
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
            armor: Math.floor((base.armor || 0) * scale),
            def: Math.floor((base.armor || 0) * scale),
            xp: Math.floor(base.xp * scale * eMult),
            gold: [Math.floor(base.gold[0] * scale * eMult), Math.floor(base.gold[1] * scale * eMult)],
            level: diff,
            isElite,
            biome: 'plains',
            stunDuration: 0, poisonDuration: 0, frozenDuration: 0, poisonTimer: 0,
            moveTimer: Math.random() * 0.5,
            attackTimer: 0,
            alive: true,
            spawnX: wx, spawnY: wy,
        };
    }
};

// ========== STARTER TOWN (Building Floor on +1) ==========
World.generateStarterTown = function() {
    const T = this.T;
    const W = 100, H = 80; // Town dimensions
    const tiles = new Array(W * H).fill(T.STONE_FLOOR);

    // Town boundary - walls with organic shape
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            const cx = x - W / 2, cy = y - H / 2;
            const dist = Math.sqrt(cx * cx * 1.3 + cy * cy);
            const noise = Math.sin(Math.atan2(cy, cx) * 8) * 5;

            if (dist > 35 + noise) {
                tiles[y * W + x] = T.GRASS;
                if (this.rng(x, y, 2000) < 0.05) tiles[y * W + x] = T.TREE;
                if (this.rng(x, y, 2001) < 0.02) tiles[y * W + x] = T.FLOWER;
            }
        }
    }

    // Main streets
    const centerX = Math.floor(W / 2), centerY = Math.floor(H / 2);

    // Main vertical street (north-south)
    for (let y = centerY - 25; y <= centerY + 25; y++) {
        for (let dx = -2; dx <= 2; dx++) {
            if (y >= 0 && y < H) tiles[y * W + (centerX + dx)] = T.PATH;
        }
    }
    // Main horizontal street (east-west)
    for (let x = centerX - 25; x <= centerX + 25; x++) {
        for (let dy = -2; dy <= 2; dy++) {
            if (x >= 0 && x < W) tiles[(centerY + dy) * W + x] = T.PATH;
        }
    }
    // Side street 1 (NE diagonal-ish)
    for (let i = 0; i < 20; i++) {
        const sx = centerX + 5 + i;
        const sy = centerY - 3 - Math.floor(i * 0.7);
        for (let dx = -1; dx <= 1; dx++) {
            if (sx + dx >= 0 && sx + dx < W && sy >= 0 && sy < H)
                tiles[sy * W + (sx + dx)] = T.PATH;
        }
    }
    // Side street 2 (SW)
    for (let i = 0; i < 18; i++) {
        const sx = centerX - 5 - i;
        const sy = centerY + 3 + Math.floor(i * 0.5);
        for (let dx = -1; dx <= 1; dx++) {
            if (sx + dx >= 0 && sx + dx < W && sy >= 0 && sy < H)
                tiles[sy * W + (sx + dx)] = T.PATH;
        }
    }
    // Side street 3 (NW)
    for (let i = 0; i < 15; i++) {
        const sx = centerX - 4 - i;
        const sy = centerY - 4 - Math.floor(i * 0.6);
        for (let dx = -1; dx <= 1; dx++) {
            if (sx + dx >= 0 && sx + dx < W && sy >= 0 && sy < H)
                tiles[sy * W + (sx + dx)] = T.PATH;
        }
    }

    // Central plaza with fountain
    for (let dy = -4; dy <= 4; dy++) {
        for (let dx = -4; dx <= 4; dx++) {
            if (Math.abs(dx) + Math.abs(dy) <= 5) {
                tiles[(centerY + dy) * W + (centerX + dx)] = T.STONE_FLOOR;
            }
        }
    }
    tiles[centerY * W + centerX] = T.WELL; // Central fountain/well

    // Stairs down (exit) at south
    tiles[(centerY + 25) * W + centerX] = T.STAIRS_DOWN;
    tiles[(centerY + 24) * W + centerX] = T.SIGN;
    this._townSignTexts = this._townSignTexts || {};
    this._townSignTexts[`${centerX},${centerY + 24}`] = 'Wyjście z Miasta';

    // ===== BUILDINGS =====
    const buildings = [];

    // Helper to place a building in the town
    const placeBld = (bx, by, w, h, name, isShop) => {
        const doorX = bx + Math.floor(w / 2);
        const doorY = by + h - 1;

        for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) {
                const tx = bx + dx, ty = by + dy;
                if (tx < 0 || tx >= W || ty < 0 || ty >= H) continue;
                const isEdge = dy === 0 || dy === h - 1 || dx === 0 || dx === w - 1;
                const isDoor = tx === doorX && ty === doorY;

                if (isDoor) {
                    tiles[ty * W + tx] = T.TOWN_BUILDING_DOOR;
                } else if (isEdge) {
                    const isMidH = dx === Math.floor(w / 2) && dy === 0;
                    const isMidV = dy === Math.floor(h / 2) && (dx === 0 || dx === w - 1);
                    if ((isMidH || isMidV) && w >= 4) {
                        tiles[ty * W + tx] = T.HOUSE_WINDOW;
                    } else {
                        tiles[ty * W + tx] = T.HOUSE_WALL;
                    }
                } else {
                    tiles[ty * W + tx] = T.HOUSE_FLOOR;
                }
            }
        }
        buildings.push({ bx, by, w, h, name, doorX, doorY, isShop });
    };

    // ŚWIĄTYNIA (Temple) - large, north of center
    placeBld(centerX - 5, centerY - 18, 11, 8, 'Świątynia', false);

    // SKLEP Z BRONIĄ (Weapon shop) - east of center
    placeBld(centerX + 8, centerY - 5, 7, 6, 'Sklep z Bronią', true);

    // SKLEP ZE ZBROJAMI (Armor shop) - east, south of weapon shop
    placeBld(centerX + 8, centerY + 3, 7, 6, 'Sklep ze Zbrojami', true);

    // SKLEP Z MIKSTURAMI (Potion shop) - west of center
    placeBld(centerX - 14, centerY - 4, 7, 6, 'Apteka Zielarki', true);

    // SKLEP Z NARZĘDZIAMI (Tool shop) - west, south
    placeBld(centerX - 14, centerY + 4, 7, 5, 'Sklep z Narzędziami', true);

    // KARCZMA (Tavern/Meeting hall) - large, south-east
    placeBld(centerX + 6, centerY + 10, 12, 8, 'Karczma "Pod Złotym Kuflem"', false);

    // RATUSZ (Town hall) - north-east
    placeBld(centerX + 6, centerY - 14, 9, 7, 'Ratusz', false);

    // KUŹNIA (Smithy) - near weapon shop
    placeBld(centerX + 17, centerY - 3, 6, 5, 'Kuźnia', false);

    // Player houses (buyable)
    const housePositions = [
        { x: centerX - 20, y: centerY - 12, w: 5, h: 5, price: 500, name: 'Chatka Rybacka' },
        { x: centerX - 20, y: centerY - 5, w: 5, h: 5, price: 500, name: 'Domek Leśny' },
        { x: centerX + 20, y: centerY - 12, w: 5, h: 5, price: 800, name: 'Dom Mieszczański' },
        { x: centerX + 20, y: centerY + 2, w: 6, h: 5, price: 1000, name: 'Rezydencja' },
        { x: centerX - 8, y: centerY + 16, w: 5, h: 5, price: 600, name: 'Domek przy Placu' },
        { x: centerX + 2, y: centerY + 16, w: 5, h: 5, price: 600, name: 'Domek Kupca' },
    ];

    for (const hp of housePositions) {
        const doorX = hp.x + Math.floor(hp.w / 2);
        const doorY = hp.y + hp.h - 1;
        for (let dy = 0; dy < hp.h; dy++) {
            for (let dx = 0; dx < hp.w; dx++) {
                const tx = hp.x + dx, ty = hp.y + dy;
                if (tx < 0 || tx >= W || ty < 0 || ty >= H) continue;
                const isEdge = dy === 0 || dy === hp.h - 1 || dx === 0 || dx === hp.w - 1;
                const isDoor = tx === doorX && ty === doorY;
                if (isDoor) {
                    tiles[ty * W + tx] = T.HOUSE_DOOR;
                } else if (isEdge) {
                    if ((dx === Math.floor(hp.w / 2) && dy === 0) || (dy === Math.floor(hp.h / 2) && (dx === 0 || dx === hp.w - 1))) {
                        tiles[ty * W + tx] = T.HOUSE_WINDOW;
                    } else {
                        tiles[ty * W + tx] = T.HOUSE_WALL;
                    }
                } else {
                    tiles[ty * W + tx] = T.HOUSE_FLOOR;
                }
            }
        }
    }

    // Decorations
    // Trees in corners
    const decorPositions = [
        [centerX - 3, centerY - 3], [centerX + 3, centerY - 3],
        [centerX - 3, centerY + 3], [centerX + 3, centerY + 3],
    ];
    for (const [dx, dy] of decorPositions) {
        if (dx >= 0 && dx < W && dy >= 0 && dy < H && tiles[dy * W + dx] === T.STONE_FLOOR) {
            tiles[dy * W + dx] = T.TREE;
        }
    }

    // Flowers along streets
    for (let i = 0; i < 30; i++) {
        const fx = Math.floor(Math.random() * W);
        const fy = Math.floor(Math.random() * H);
        if (tiles[fy * W + fx] === T.STONE_FLOOR) tiles[fy * W + fx] = T.FLOWER;
    }

    // Register town as a building floor
    const ic = this.getIslandCenter();
    const doorKey = `${ic.x},${ic.y}`;
    this.buildingFloors[doorKey] = {
        name: 'Miasto Szmaragdowe',
        floors: [{ tiles, w: W, h: H }],
        numFloors: 1,
        isTown: true,
    };

    // Store building/NPC data for the town
    this._townBuildings = buildings;
    this._townHouses = housePositions;

    return { tiles, w: W, h: H, buildings };
};

// Enter the starter town
World.enterStarterTown = function() {
    const ic = this.getIslandCenter();
    const doorKey = `${ic.x},${ic.y}`;

    // Generate town if not done yet
    if (!this.buildingFloors[doorKey]) {
        this.generateStarterTown();
    }

    const building = this.buildingFloors[doorKey];
    const p = Game.player;
    const floorData = building.floors[0];

    this.activeBuildingFloor = {
        key: doorKey,
        floor: 0,
        tiles: floorData.tiles,
        w: floorData.w,
        h: floorData.h,
        name: building.name,
        numFloors: 1,
        savedPos: { x: p.x, y: p.y },
        isTown: true,
    };

    // Place player at stairs (south entrance)
    p.x = Math.floor(floorData.w / 2);
    p.y = Math.floor(floorData.h / 2) + 25;
    p.visualX = p.x;
    p.visualY = p.y;

    // Register town NPCs
    this.registerTownNpcs(floorData.w, floorData.h);

    Game.log('Wchodzisz do Miasta Szmaragdowego.', 'info');
    Game.log('Bezpieczna strefa - tu nie ma potworów.', 'info');
};

// Register NPCs in the town
World.registerTownNpcs = function(w, h) {
    const centerX = Math.floor(w / 2), centerY = Math.floor(h / 2);
    const T = this.T;

    // Town NPC definitions
    const townNpcs = [
        // Temple
        { x: centerX, y: centerY - 15, name: 'Kapłan', id: 'si_kaplan', type: 'starter_island_npc', sprite: 'npc_quest' },
        // Weapon shop
        { x: centerX + 11, y: centerY - 3, name: 'Zbrojmistrz', id: 'si_zbrojmistrz', type: 'town_shop_weapon', sprite: 'npc_shopkeeper' },
        // Armor shop
        { x: centerX + 11, y: centerY + 5, name: 'Płatnerz', id: 'si_platnerz', type: 'town_shop_armor', sprite: 'npc_shopkeeper' },
        // Potion shop
        { x: centerX - 11, y: centerY - 2, name: 'Zielarka', id: 'si_zielarka', type: 'town_shop_potion', sprite: 'npc_shopkeeper' },
        { x: centerX - 12, y: centerY - 2, name: 'Żona Zielarki', id: 'si_zona_zielarki', type: 'starter_island_npc', sprite: 'npc_quest' },
        // Tool shop
        { x: centerX - 11, y: centerY + 6, name: 'Narzędziowiec', id: 'si_narzedziowiec', type: 'town_shop_tool', sprite: 'npc_shopkeeper' },
        // Tavern
        { x: centerX + 11, y: centerY + 13, name: 'Karczmarka', id: 'si_karczmarka', type: 'starter_island_npc', sprite: 'npc_quest' },
        // Town hall
        { x: centerX + 10, y: centerY - 12, name: 'Burmistrz', id: 'si_burmistrz', type: 'starter_island_npc', sprite: 'npc_quest' },
        { x: centerX + 12, y: centerY - 12, name: 'Uczony', id: 'si_uczony', type: 'starter_island_npc', sprite: 'npc_quest2' },
        // Smithy
        { x: centerX + 19, y: centerY - 1, name: 'Kowal', id: 'si_kowal', type: 'starter_island_npc', sprite: 'npc_quest' },
        // Guard near entrance
        { x: centerX + 2, y: centerY + 22, name: 'Strażnik', id: 'si_straznik', type: 'starter_island_npc', sprite: 'npc_quest2' },
        // Merchant at plaza
        { x: centerX - 2, y: centerY + 1, name: 'Kupiec', id: 'si_kupiec', type: 'starter_island_npc', sprite: 'npc_quest' },
        // Rybak near entrance
        { x: centerX - 2, y: centerY + 22, name: 'Rybak', id: 'si_rybak', type: 'starter_island_npc', sprite: 'npc_quest' },
    ];

    // Place NPCs as quest NPCs
    for (const npc of townNpcs) {
        const key = `${npc.x},${npc.y}`;
        this.questNpcs[key] = {
            id: npc.id,
            type: npc.type,
            name: npc.name,
        };
        // Set tile to NPC type
        if (npc.x >= 0 && npc.x < w && npc.y >= 0 && npc.y < h) {
            const bf = this.activeBuildingFloor;
            if (bf) {
                const tileType = npc.type.startsWith('town_shop') ? T.SHOP_POTION_NPC : T.NPC_QUEST;
                bf.tiles[npc.y * w + npc.x] = tileType;
                if (npc.type === 'town_shop_weapon') bf.tiles[npc.y * w + npc.x] = T.SHOP_WEAPON_NPC;
                if (npc.type === 'town_shop_armor') bf.tiles[npc.y * w + npc.x] = T.SHOP_ARMOR_NPC;

                // Register shop NPCs
                if (npc.type.startsWith('town_shop')) {
                    this.npcs[key] = { name: npc.name, difficulty: 1 };
                }
            }
        }
    }
};
