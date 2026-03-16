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
                case 'town': {
                    // Walled town 120x120 on overworld
                    const trx = wx - ic.x, try_ = wy - ic.y;
                    const tdist = Math.sqrt(trx * trx + try_ * try_);

                    // Outside town walls - grassy buffer
                    if (tdist > 57) {
                        tile = T.GRASS;
                        if (this.rng(wx, wy, 2000) < 0.06) tile = T.TREE;
                        if (this.rng(wx, wy, 2001) < 0.02) tile = T.FLOWER;
                        break;
                    }

                    // Town walls (ring at radius 54-56)
                    if (tdist >= 54 && tdist <= 56) {
                        // Gates: N, S, E, W (3 tiles wide)
                        const isGateN = Math.abs(trx) <= 1 && try_ < -50;
                        const isGateS = Math.abs(trx) <= 1 && try_ > 50;
                        const isGateE = Math.abs(try_) <= 1 && trx > 50;
                        const isGateW = Math.abs(try_) <= 1 && trx < -50;
                        if (isGateN || isGateS || isGateE || isGateW) {
                            tile = T.PATH;
                        } else {
                            tile = T.HOUSE_WALL; // Solid defensive wall
                        }
                        break;
                    }

                    // Inside walls - stone floor base
                    tile = T.STONE_FLOOR;

                    // === STREET SYSTEM ===
                    // Main N-S street (width 3)
                    if (Math.abs(trx) <= 1 && Math.abs(try_) <= 52) {
                        tile = T.PATH;
                    }
                    // Main E-W street (width 3)
                    if (Math.abs(try_) <= 1 && Math.abs(trx) <= 52) {
                        tile = T.PATH;
                    }
                    // Ring road (inside walls, radius ~48)
                    const ringDist = Math.sqrt(trx * trx + try_ * try_);
                    if (ringDist >= 46 && ringDist <= 48 && tdist < 54) {
                        tile = T.PATH;
                    }
                    // NE diagonal street
                    if (Math.abs(trx - try_) <= 1 && trx > 5 && trx < 45 && try_ < -5 && try_ > -45) {
                        tile = T.PATH;
                    }
                    // SW diagonal street
                    if (Math.abs(trx - try_) <= 1 && trx < -5 && trx > -40 && try_ > 5 && try_ < 40) {
                        tile = T.PATH;
                    }

                    // === CENTRAL PLAZA (radius 8) ===
                    if (Math.abs(trx) + Math.abs(try_) <= 8) {
                        tile = T.STONE_FLOOR;
                    }

                    // === MARKET SQUARE (east of center) ===
                    if (trx >= 8 && trx <= 20 && Math.abs(try_) <= 4) {
                        tile = T.STONE_FLOOR;
                    }

                    // === SOUTH BRIDGE (main entrance - elevated) ===
                    if (Math.abs(trx) <= 2 && try_ >= 52 && try_ <= 58) {
                        tile = T.BRIDGE;
                    }

                    // === DECORATIONS ===
                    // Trees along streets (every ~12 tiles)
                    if (tile === T.STONE_FLOOR) {
                        const treeGrid = ((Math.abs(trx) + 3) % 12 === 0 && (Math.abs(try_) + 3) % 12 === 0);
                        if (treeGrid && Math.abs(trx) > 3 && Math.abs(try_) > 3 && tdist < 50) {
                            tile = T.TREE;
                        }
                    }
                    // Flowers scattered
                    if (tile === T.STONE_FLOOR && this.rng(wx, wy, 2100) < 0.015) {
                        tile = T.FLOWER;
                    }
                    // Lanterns (statues) at intersections
                    if (tile === T.STONE_FLOOR) {
                        const isIntersection = (Math.abs(trx) === 3 && Math.abs(try_) <= 1) ||
                                               (Math.abs(try_) === 3 && Math.abs(trx) <= 1);
                        if (isIntersection && (Math.abs(trx) + Math.abs(try_)) > 2) {
                            tile = T.STATUE;
                        }
                    }
                    break;
                }
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

            // Natural paths connecting areas (skip inside town walls)
            if (zone !== 'town') {
                const pathNoise = Perlin.noise2d(wx * 0.1, wy * 0.1);
                const rx = wx - ic.x, ry = wy - ic.y;
                // Main paths from center to edges
                if ((Math.abs(rx) < 2 || Math.abs(ry) < 2) && dist < STARTER_ISLAND.radius - 30 && dist > 60) {
                    tile = T.PATH;
                }
                // Diagonal paths
                if (Math.abs(Math.abs(rx) - Math.abs(ry)) < 2 && dist < 200 && dist > 60 && this.rng(wx, wy, 50) < 0.5) {
                    tile = T.PATH;
                }
                // Noise-based paths
                if (Math.abs(pathNoise) < 0.02 && tile !== T.WATER && dist > 60 && dist < STARTER_ISLAND.radius - 35) {
                    tile = T.PATH;
                }
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

            // Central plaza fountain/well
            if (rx === 0 && ry === 0) {
                tiles[ly * CS + lx] = T.WELL;
            }
            // Sign at center
            if (rx === 0 && ry === -3) {
                tiles[ly * CS + lx] = T.SIGN;
                this.signTexts[`${wx},${wy}`] = 'Miasto Szmaragdowe - Plac Centralny';
            }
        }
    }

    // Place town buildings on overworld
    this.placeTownOverworldBuildings(tiles, cx, cy, ox, oy);

    // Place dungeon entrances
    const dungeonLocations = [
        { zone: 'crab_cave', dx: 125, dy: 350, dungeon: STARTER_ISLAND.dungeons[0] },
        { zone: 'pirate_tunnel', dx: -312, dy: 312, dungeon: STARTER_ISLAND.dungeons[1] },
        { zone: 'crypt_entrance', dx: 62, dy: -350, dungeon: STARTER_ISLAND.dungeons[2] },
        { zone: 'mine_entrance', dx: 312, dy: -250, dungeon: STARTER_ISLAND.dungeons[3] },
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
    const lhx = ic.x - 375, lhy = ic.y;
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
    const drx = ic.x + 188, dry = ic.y + 188;
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
    const portX = ic.x, portY = ic.y + 375;
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
    const pirX = ic.x - 250, pirY = ic.y + 250;
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

    // Skip monster spawning in safe zones
    if (zone === 'town' || zone === 'port' || zone === 'lighthouse') return;

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

// ========== TOWN BUILDINGS ON OVERWORLD ==========
World.placeTownOverworldBuildings = function(tiles, cx, cy, ox, oy) {
    const CS = this.CHUNK_SIZE;
    const T = this.T;
    const ic = this.getIslandCenter();

    // Helper: place a single building in this chunk
    const placeBuilding = (bwx, bwy, w, h, doorTile) => {
        for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) {
                const wx = bwx + dx, wy = bwy + dy;
                const lx = wx - ox, ly = wy - oy;
                if (lx < 0 || lx >= CS || ly < 0 || ly >= CS) continue;
                const isEdge = dy === 0 || dy === h - 1 || dx === 0 || dx === w - 1;
                const isDoor = dx === Math.floor(w / 2) && dy === h - 1;
                if (isDoor) {
                    tiles[ly * CS + lx] = doorTile;
                } else if (isEdge) {
                    const isMidH = dx === Math.floor(w / 2) && dy === 0;
                    const isMidV = dy === Math.floor(h / 2) && (dx === 0 || dx === w - 1);
                    tiles[ly * CS + lx] = ((isMidH || isMidV) && w >= 5) ? T.HOUSE_WINDOW : T.HOUSE_WALL;
                } else {
                    tiles[ly * CS + lx] = T.HOUSE_FLOOR;
                }
            }
        }
    };

    // Helper: register building in roof system
    const registerHouse = (bwx, bwy, w, h, name, price, isTown) => {
        const doorWx = bwx + Math.floor(w / 2);
        const doorWy = bwy + h - 1;
        const houseId = isTown ? `tb_${doorWx},${doorWy}` : `${doorWx},${doorWy}`;
        const floorTiles = [], roofTiles = [], wallTiles = [];
        for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) {
                const key = `${bwx + dx},${bwy + dy}`;
                const isEdge = dy === 0 || dy === h - 1 || dx === 0 || dx === w - 1;
                roofTiles.push(key);
                if (isEdge) wallTiles.push(key); else floorTiles.push(key);
            }
        }
        this.houses[houseId] = {
            price: price || 0, name, owned: isTown || false,
            floorTiles, roofTiles, wallTiles,
            bx: bwx, by: bwy, w, h, isTownBuilding: !!isTown,
        };
        return houseId;
    };

    // Helper: place NPC in building
    const placeNpc = (bwx, bwy, w, h, npcId, npcName, npcType, isShop) => {
        const npcWx = bwx + Math.floor(w / 2);
        const npcWy = bwy + Math.floor(h / 2); // Center of building
        const lx = npcWx - ox, ly = npcWy - oy;
        if (lx >= 0 && lx < CS && ly >= 0 && ly < CS) {
            const tileType = isShop ?
                (npcType === 'town_shop_weapon' ? T.SHOP_WEAPON_NPC :
                 npcType === 'town_shop_armor' ? T.SHOP_ARMOR_NPC : T.SHOP_POTION_NPC) :
                T.NPC_QUEST;
            tiles[ly * CS + lx] = tileType;
            this.questNpcs[`${npcWx},${npcWy}`] = { id: npcId, type: npcType, name: npcName };
            if (isShop) this.npcs[`${npcWx},${npcWy}`] = { name: npcName, difficulty: 1 };
        }
        // Register door in townBuildings
        const doorWx = bwx + Math.floor(w / 2);
        const doorWy = bwy + h - 1;
        this.townBuildings = this.townBuildings || {};
        this.townBuildings[`${doorWx},${doorWy}`] = { npcName, houseId: `tb_${doorWx},${doorWy}` };
    };

    // ======= TOWN BUILDINGS (120x120 layout) =======
    // Positions relative to island center. Town radius ~55 inside walls.

    const townBuildings = [
        // === NORTH DISTRICT (temples, government) ===
        { rx: -7, ry: -38, w: 15, h: 9, name: 'Świątynia',             npcId: 'si_kaplan',        npcName: 'Kapłan',         npcType: 'starter_island_npc' },
        { rx: 12, ry: -38, w: 11, h: 8, name: 'Ratusz',                npcId: 'si_burmistrz',     npcName: 'Burmistrz',      npcType: 'starter_island_npc' },
        { rx: 26, ry: -32, w: 9,  h: 7, name: 'Akademia',              npcId: 'si_uczony',        npcName: 'Uczony',         npcType: 'starter_island_npc' },
        { rx: -28, ry: -28, w: 9, h: 7, name: 'Bank',                  npcId: 'si_bankier',       npcName: 'Bankier',        npcType: 'town_npc' },

        // === CENTRAL COMMERCE (shops around market square) ===
        { rx: 22, ry: -10, w: 9, h: 7, name: 'Sklep z Bronią',         npcId: 'si_zbrojmistrz',   npcName: 'Zbrojmistrz',    npcType: 'town_shop_weapon', isShop: true },
        { rx: 22, ry: 4,   w: 9, h: 7, name: 'Sklep ze Zbrojami',      npcId: 'si_platnerz',      npcName: 'Płatnerz',       npcType: 'town_shop_armor',  isShop: true },
        { rx: -28, ry: -10, w: 9, h: 7, name: 'Apteka Zielarki',       npcId: 'si_zielarka',      npcName: 'Zielarka',       npcType: 'town_shop_potion', isShop: true },
        { rx: -28, ry: 4,   w: 9, h: 7, name: 'Sklep z Narzędziami',   npcId: 'si_narzedziowiec', npcName: 'Narzędziowiec',  npcType: 'town_shop_tool',   isShop: true },

        // === SOUTH DISTRICT (tavern, smithy, stables) ===
        { rx: 14, ry: 18, w: 14, h: 9, name: 'Karczma "Pod Złotym Kuflem"', npcId: 'si_karczmarka', npcName: 'Karczmarka', npcType: 'starter_island_npc' },
        { rx: -8, ry: 22, w: 9, h: 7,  name: 'Kuźnia',                 npcId: 'si_kowal',         npcName: 'Kowal',          npcType: 'starter_island_npc' },
        { rx: 32, ry: 18, w: 9, h: 7,  name: 'Stajnia',                npcId: 'si_stajennik',     npcName: 'Stajennik',      npcType: 'town_npc' },
    ];

    // Standalone NPCs on streets
    const standAloneNpcs = [
        // Guards at gates
        { rx: 3,   ry: 52,  npcId: 'si_straznik',       npcName: 'Strażnik',       npcType: 'starter_island_npc' },
        { rx: 3,   ry: -52, npcId: 'si_straznik_n',     npcName: 'Strażnik',       npcType: 'starter_island_npc' },
        { rx: 52,  ry: 3,   npcId: 'si_straznik_e',     npcName: 'Strażnik',       npcType: 'starter_island_npc' },
        { rx: -52, ry: 3,   npcId: 'si_straznik_w',     npcName: 'Strażnik',       npcType: 'starter_island_npc' },
        // Plaza NPCs
        { rx: -3,  ry: 2,   npcId: 'si_kupiec',         npcName: 'Kupiec',         npcType: 'starter_island_npc' },
        { rx: 4,   ry: -3,  npcId: 'si_zona_zielarki',  npcName: 'Żona Zielarki',  npcType: 'starter_island_npc' },
        // Near south gate
        { rx: -3,  ry: 45,  npcId: 'si_rybak',          npcName: 'Rybak',          npcType: 'starter_island_npc' },
    ];

    // Buyable houses (residential district, south-east and south-west)
    const townHouses = [
        { rx: -38, ry: 20, w: 6, h: 5, price: 500,  name: 'Chatka Rybacka' },
        { rx: -38, ry: 30, w: 6, h: 5, price: 500,  name: 'Domek Leśny' },
        { rx: -38, ry: 40, w: 6, h: 5, price: 600,  name: 'Domek Ogrodnika' },
        { rx: -25, ry: 36, w: 6, h: 5, price: 700,  name: 'Dom Tkacza' },
        { rx: 36,  ry: 30, w: 7, h: 5, price: 800,  name: 'Dom Mieszczański' },
        { rx: 36,  ry: 38, w: 7, h: 5, price: 1000, name: 'Rezydencja' },
        { rx: -12, ry: 36, w: 6, h: 5, price: 600,  name: 'Domek przy Placu' },
        { rx: 5,   ry: 36, w: 6, h: 5, price: 650,  name: 'Domek Kupca' },
    ];

    // Place all town buildings
    for (const bld of townBuildings) {
        const bwx = ic.x + bld.rx, bwy = ic.y + bld.ry;
        placeBuilding(bwx, bwy, bld.w, bld.h, T.TOWN_BUILDING_DOOR);
        registerHouse(bwx, bwy, bld.w, bld.h, bld.name, 0, true);
        placeNpc(bwx, bwy, bld.w, bld.h, bld.npcId, bld.npcName, bld.npcType, bld.isShop);
    }

    // Place standalone NPCs
    for (const npc of standAloneNpcs) {
        const wx = ic.x + npc.rx, wy = ic.y + npc.ry;
        const lx = wx - ox, ly = wy - oy;
        if (lx >= 0 && lx < CS && ly >= 0 && ly < CS) {
            tiles[ly * CS + lx] = T.NPC_QUEST;
            this.questNpcs[`${wx},${wy}`] = { id: npc.npcId, type: npc.npcType, name: npc.npcName };
        }
    }

    // Place buyable houses
    for (const h of townHouses) {
        const hwx = ic.x + h.rx, hwy = ic.y + h.ry;
        placeBuilding(hwx, hwy, h.w, h.h, T.HOUSE_DOOR);
        registerHouse(hwx, hwy, h.w, h.h, h.name, h.price, false);
    }

    // Signs at gates and buildings
    const signPositions = [
        { rx: 0,   ry: 53,  text: 'Brama Południowa - Most Szmaragdowy' },
        { rx: 0,   ry: -53, text: 'Brama Północna' },
        { rx: 53,  ry: 0,   text: 'Brama Wschodnia' },
        { rx: -53, ry: 0,   text: 'Brama Zachodnia' },
        { rx: 0,   ry: -5,  text: 'Miasto Szmaragdowe - Plac Centralny' },
        { rx: 12,  ry: 0,   text: 'Targ Miejski →' },
    ];
    for (const sp of signPositions) {
        const wx = ic.x + sp.rx, wy = ic.y + sp.ry;
        const lx = wx - ox, ly = wy - oy;
        if (lx >= 0 && lx < CS && ly >= 0 && ly < CS) {
            tiles[ly * CS + lx] = T.SIGN;
            this.signTexts[`${wx},${wy}`] = sp.text;
        }
    }
};

// ========== TOWN WANDERING NPCs (life in the city) ==========
World.spawnTownWanderingNpcs = function() {
    const ic = this.getIslandCenter();
    const wanderers = [
        { rx: -5,  ry: -20, name: 'Mieszczanka',    sprite: 'npc_quest' },
        { rx: 8,   ry: -15, name: 'Kupiec Wędrowny', sprite: 'npc_shopkeeper' },
        { rx: -10, ry: 10,  name: 'Stary Człowiek',  sprite: 'npc_quest2' },
        { rx: 15,  ry: 5,   name: 'Dziecko',         sprite: 'npc_quest' },
        { rx: -15, ry: -5,  name: 'Kobieta',         sprite: 'npc_quest' },
        { rx: 5,   ry: 15,  name: 'Pijak',           sprite: 'npc_quest2' },
        { rx: -8,  ry: 30,  name: 'Ogrodnik',        sprite: 'npc_quest' },
        { rx: 20,  ry: -20, name: 'Student',         sprite: 'npc_quest2' },
        { rx: -20, ry: 15,  name: 'Rybacka Żona',    sprite: 'npc_quest' },
        { rx: 10,  ry: 35,  name: 'Złodziej',        sprite: 'npc_quest2' },
        { rx: -30, ry: 0,   name: 'Strażnik Miejski', sprite: 'npc_quest2' },
        { rx: 30,  ry: 0,   name: 'Strażnik Miejski', sprite: 'npc_quest2' },
        { rx: 0,   ry: 25,  name: 'Wędrowiec',       sprite: 'npc_quest' },
        { rx: -12, ry: -30, name: 'Mnich',           sprite: 'npc_quest' },
        { rx: 18,  ry: 25,  name: 'Bard',            sprite: 'npc_quest2' },
    ];

    for (const w of wanderers) {
        const wx = ic.x + w.rx;
        const wy = ic.y + w.ry;
        const key = `${wx},${wy}`;
        if (this.cityNpcs[key]) continue;
        this.cityNpcs[key] = {
            name: w.name,
            sprite: w.sprite,
            x: wx, y: wy,
            homeX: wx, homeY: wy,
            moveTimer: Math.random() * 3,
            moveSpeed: 2 + Math.random() * 3,
            wanderRange: 10,
        };
    }
};

// Legacy stubs (town is now on overworld, these are kept for old save compatibility)
World.generateStarterTown = function() { return null; };
World.enterStarterTown = function() { Game.log('Miasto jest teraz na świecie.', 'info'); };
World.registerTownNpcs = function() {};
