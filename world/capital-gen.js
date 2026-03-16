// ============================================================
// CAPITAL CITY GENERATION - Capital districts, buildings, NPCs
// ============================================================

// ========== CAPITAL CITY (3x3 chunks) ==========
World.placeCapitalChunk = function(tiles, cx, cy, ox, oy) {
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
};

// Center (0,0): Grand town square with fountain, quest boards, key NPCs
World.placeCapitalCenter = function(tiles, ox, oy) {
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
    tiles[c * CS + c] = T.WELL;
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

    // Town buildings in the four quadrants (some multi-story)
    this.placeTownBuilding(tiles, ox, oy, 1, 1, 4, 3, 'Bibliotekarz', 3);
    this.placeTownBuilding(tiles, ox, oy, CS-5, 1, 4, 3, 'Kartograf', 2);
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
};

// West (-1,0): Market district
World.placeCapitalWest = function(tiles, ox, oy) {
    const CS = this.CHUNK_SIZE;
    const T = this.T;

    // Weapon shop (proper building)
    this.placeTownBuilding(tiles, ox, oy, 2, 2, 5, 4, 'Kowal');
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

    // Market decorations
    tiles[17 * CS + 2] = T.TREE;
    tiles[17 * CS + 5] = T.TREE;
    tiles[7 * CS + 8] = T.FLOWER;
    tiles[11 * CS + 8] = T.FLOWER;
};

// East (1,0): Crafting district
World.placeCapitalEast = function(tiles, ox, oy) {
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
};

// North (0,-1): Temple district
World.placeCapitalNorth = function(tiles, ox, oy) {
    const CS = this.CHUNK_SIZE;
    const T = this.T;
    const c = Math.floor(CS / 2);

    // Temple building (large, proper building, 3 floors)
    this.placeTownBuilding(tiles, ox, oy, c - 3, 2, 7, 5, 'Kapłan', 3);
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
    tiles[15 * CS + 3] = T.STATUE;
    tiles[15 * CS + 5] = T.STATUE;
    tiles[16 * CS + 4] = T.STATUE;

    // Buyable houses along sides
    this.placeBuyableHouse(tiles, ox, oy, 1, 14, 4, 3, 400, 'Dom Kapłański #1');
    this.placeBuyableHouse(tiles, ox, oy, CS - 5, 14, 4, 3, 400, 'Dom Kapłański #2');
};

// South (0,1): Inn district, residential area
World.placeCapitalSouth = function(tiles, ox, oy) {
    const CS = this.CHUNK_SIZE;
    const T = this.T;
    const c = Math.floor(CS / 2);

    // Inn (proper building, large)
    this.placeTownBuilding(tiles, ox, oy, c - 3, 1, 6, 4, 'Karczmarz');
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
};

// NW (-1,-1): Royal Park
World.placeCapitalNW = function(tiles, ox, oy) {
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

    // Benches
    tiles[10 * CS + 8] = T.STATUE;
    tiles[10 * CS + 12] = T.STATUE;
    tiles[12 * CS + 10] = T.STATUE;

    // Small pond (water)
    for (let dy = 4; dy <= 6; dy++)
        for (let dx = 13; dx <= 16; dx++)
            if (tiles[dy * CS + dx] === T.STONE_FLOOR) tiles[dy * CS + dx] = T.WATER;
};

// NE (1,-1): Noble district
World.placeCapitalNE = function(tiles, ox, oy) {
    const CS = this.CHUNK_SIZE;
    const T = this.T;

    tiles[1 * CS + 5] = T.SIGN;
    this.signTexts[`${ox + 5},${oy + 1}`] = 'Dzielnica Szlachecka';

    // Grand residences
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
};

// SW (-1,1): Worker district
World.placeCapitalSW = function(tiles, ox, oy) {
    const CS = this.CHUNK_SIZE;
    const T = this.T;

    tiles[1 * CS + 4] = T.SIGN;
    this.signTexts[`${ox + 4},${oy + 1}`] = 'Dzielnica Robotnicza';

    // Workshop buildings
    this.placeTownBuilding(tiles, ox, oy, 1, 2, 4, 3, 'Cieśla');
    this.placeTownBuilding(tiles, ox, oy, 1, 7, 4, 3, 'Garncarz');

    // Cheap buyable houses
    this.placeBuyableHouse(tiles, ox, oy, 8, 2, 3, 3, 100, 'Chata Robotnicza #1');
    this.placeBuyableHouse(tiles, ox, oy, 13, 2, 3, 3, 100, 'Chata Robotnicza #2');
    this.placeBuyableHouse(tiles, ox, oy, 8, 7, 3, 3, 120, 'Chata Robotnicza #3');
    this.placeBuyableHouse(tiles, ox, oy, 13, 7, 3, 3, 120, 'Chata Robotnicza #4');
    this.placeBuyableHouse(tiles, ox, oy, 1, 12, 3, 3, 100, 'Chata Robotnicza #5');
    this.placeBuyableHouse(tiles, ox, oy, 6, 12, 3, 3, 120, 'Chata Robotnicza #6');
    this.placeBuyableHouse(tiles, ox, oy, 11, 12, 3, 3, 150, 'Domek Robotniczy #1');

    // Well for workers
    tiles[16 * CS + 4] = T.WELL;
};

// SE (1,1): Farm & stables district
World.placeCapitalSE = function(tiles, ox, oy) {
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
    tiles[4 * CS + 10] = T.PATH;

    // Buyable farmhouses
    this.placeBuyableHouse(tiles, ox, oy, 11, 11, 4, 3, 300, 'Farma #1');
    this.placeBuyableHouse(tiles, ox, oy, 11, 15, 4, 3, 350, 'Farma #2');

    // Hay bales (statues)
    tiles[15 * CS + 4] = T.STATUE;
    tiles[16 * CS + 5] = T.STATUE;
};

// ========== CITY NPCs (wandering) ==========
World.spawnCityNpcs = function() {
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
            homeX: px, homeY: py,
            moveTimer: Math.random() * 2,
            moveSpeed: def.speed,
        };
    });
};
