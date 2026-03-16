// ============================================================
// CHUNK GENERATION - Terrain generation, biome tiles, monster spawning
// ============================================================

World.generateChunk = function(cx, cy) {
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

    if (isIslandChunk) {
        // Generate island terrain using the new system
        this.generateIslandChunkTerrain(tiles, cx, cy, ox, oy);
        // Place special locations (dungeons, NPCs, etc.)
        this.placeIslandLocations(tiles, cx, cy, ox, oy);
    } else {
        for (let ly = 0; ly < CS; ly++) {
            for (let lx = 0; lx < CS; lx++) {
                const wx = ox + lx;
                const wy = oy + ly;
                const biome = this.getBiome(wx, wy);
                let tile = T.GRASS;
                const dist = Math.sqrt(wx * wx + wy * wy);
                const elev = Perlin.fbm(wx * 0.05, wy * 0.05, 3);

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
    }

    // Starting city (large, covers 3x3 chunks around origin)
    if (isStartingCity) {
        this.placeCapitalChunk(tiles, cx, cy, ox, oy);
    } else if (cityAt && cityAt.name !== 'Stolica') {
        this.placeSmallCity(tiles, cx, cy, ox, oy, cityAt);
    } else if (isVillage && !isIslandChunk) {
        this.placeVillage(tiles, cx, cy, ox, oy);
    }

    // Dungeon entrance (not in villages, cities, or island)
    if (!isVillage && !isStartingCity && !isIslandChunk && this.rng(cx, cy, 100) < 0.06) {
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
    if (this.rng(cx, cy, 200) < 0.15 && !isStartingCity && !isIslandChunk) {
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

    // Spawn monsters
    if (isIslandChunk) {
        // Use zone-aware spawning for island chunks (skip center chunk)
        const ic = this.getIslandCenter();
        const distToCenter = Math.sqrt((ox + CS/2 - ic.x) ** 2 + (oy + CS/2 - ic.y) ** 2);
        if (distToCenter > 10) {
            this.spawnStarterIslandMonsters(cx, cy, ox, oy, tiles);
        }
    } else if (!isVillage && !isStartingCity && !cityAt) {
        this.spawnChunkMonsters(cx, cy, ox, oy, tiles);
    }

    return { tiles, biome: this.getBiome(ox + CS/2, oy + CS/2) };
};

World.spawnChunkMonsters = function(cx, cy, ox, oy, tiles) {
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
        const isElite = this.rng(cx, cy, 540 + sp) < 0.08;
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
};
