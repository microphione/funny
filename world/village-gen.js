// ============================================================
// VILLAGE GENERATION - Villages, quests, small cities
// ============================================================

World.getVillageName = function(cx, cy) {
    if (this.isCapitalChunk(cx, cy)) return 'Stolica';
    const pre = ['El','Ald','Kor','Myr','Dra','Val','Syl','Gor','Tar','Nol','Bel','Ith','Zar','Mor','Fen','Ash'];
    const suf = ['doria','heim','wald','grad','burg','ton','ria','lund','gar','mir','oth','ven','dal','sten','rok','vik'];
    return pre[Math.floor(this.rng(cx,cy,350)*pre.length)] + suf[Math.floor(this.rng(cx,cy,351)*suf.length)];
};

World.placeVillage = function(tiles, cx, cy, ox, oy) {
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
};

World.generateQuest = function(cx, cy, idx, difficulty, villageName) {
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
};

World.spawnQuestItems = function(quest) {
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
};

// ========== SMALL CITIES (non-capital, 1 chunk each) ==========
World.placeSmallCity = function(tiles, cx, cy, ox, oy, city) {
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
    tiles[0 * CS + center] = T.PATH;
    tiles[(CS-1) * CS + center] = T.PATH;
    tiles[center * CS + 0] = T.PATH;
    tiles[center * CS + (CS-1)] = T.PATH;

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
};

World.getCityQuestTarget = function(city) {
    const targets = {
        1: 'Szczur', 2: 'Wilk', 3: 'Pająk Leśny',
        4: 'Golem Skalny', 5: 'Skorpion', 6: 'Lodowy Golem'
    };
    return targets[city.difficulty] || 'Szczur';
};
