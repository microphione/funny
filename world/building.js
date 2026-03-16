// ============================================================
// BUILDING SYSTEM - Houses, multi-story buildings, placement helpers
// ============================================================

// Helper: place a decorative building (not enterable, just visual)
World.placeBuilding = function(tiles, ox, oy, bx, by, w, h) {
    const CS = this.CHUNK_SIZE;
    const T = this.T;
    for (let ddy = 0; ddy < h; ddy++)
        for (let ddx = 0; ddx < w; ddx++) {
            const ty = by + ddy, tx = bx + ddx;
            if (ty >= 0 && ty < CS && tx >= 0 && tx < CS)
                tiles[ty * CS + tx] = T.HOUSE;
        }
};

// Helper: place a town building with proper walls, roof, floor, door + NPC inside
World.placeTownBuilding = function(tiles, ox, oy, bx, by, w, h, npcName, numFloors) {
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

    // Register multi-story building if specified
    if (numFloors && numFloors > 1) {
        this.registerMultiStoryBuilding(doorKey, `${npcName}`, numFloors, w, h);
        this.townBuildings[doorKey].multiStory = true;
        this.townBuildings[doorKey].numFloors = numFloors;
    }
};

// Helper: place a buyable house with proper walls, roof, floor, door
World.placeBuyableHouse = function(tiles, ox, oy, bx, by, w, h, price, name) {
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
                const isMidH = ddx === Math.floor(w / 2) && (ddy === 0);
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
        }
    }

    // Roof tiles cover the interior
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
};

// Check if world position is inside any house, returns house key or null
World.getHouseAt = function(wx, wy) {
    const key = `${wx},${wy}`;
    for (const hk in this.houses) {
        const h = this.houses[hk];
        if (h.floorTiles && h.floorTiles.includes(key)) return hk;
    }
    return null;
};

// Check if player is inside a house
World.getPlayerHouse = function() {
    const p = Game.player;
    if (!p) return null;
    return this.getHouseAt(p.x, p.y);
};

// ========== MULTI-STORY BUILDING SYSTEM ==========
World.registerMultiStoryBuilding = function(doorKey, name, numFloors, w, h) {
    const T = this.T;
    const floors = [];
    for (let f = 0; f < numFloors; f++) {
        const tiles = new Array(w * h).fill(T.HOUSE_FLOOR);
        // Walls around the perimeter
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const isEdge = y === 0 || y === h - 1 || x === 0 || x === w - 1;
                if (isEdge) tiles[y * w + x] = T.HOUSE_WALL;
            }
        }
        // Windows on walls
        if (w >= 5) {
            tiles[Math.floor(w / 2)] = T.HOUSE_WINDOW; // top wall center
            tiles[Math.floor(h / 2) * w] = T.HOUSE_WINDOW; // left wall middle
            tiles[Math.floor(h / 2) * w + (w - 1)] = T.HOUSE_WINDOW; // right wall middle
        }
        // Stairs up (except top floor)
        if (f < numFloors - 1) {
            tiles[(h - 2) * w + (w - 2)] = T.STAIRS_UP;
        }
        // Stairs down (except ground floor)
        if (f > 0) {
            tiles[1 * w + 1] = T.STAIRS_DOWN;
        }
        // Ground floor: entrance tile
        if (f === 0) {
            tiles[(h - 1) * w + Math.floor(w / 2)] = T.STAIRS_DOWN; // exit back outside
        }
        floors.push({ tiles, w, h });
    }
    this.buildingFloors[doorKey] = { name, floors, numFloors };
};

World.enterBuildingFloor = function(doorKey, floor) {
    const building = this.buildingFloors[doorKey];
    if (!building || floor < 0 || floor >= building.numFloors) return false;

    const p = Game.player;
    const floorData = building.floors[floor];

    // Save position for returning
    if (!this.activeBuildingFloor) {
        this.activeBuildingFloor = {
            key: doorKey,
            floor: floor,
            tiles: floorData.tiles,
            w: floorData.w,
            h: floorData.h,
            name: building.name,
            numFloors: building.numFloors,
            savedPos: { x: p.x, y: p.y }
        };
    } else {
        this.activeBuildingFloor.floor = floor;
        this.activeBuildingFloor.tiles = floorData.tiles;
        this.activeBuildingFloor.w = floorData.w;
        this.activeBuildingFloor.h = floorData.h;
    }

    // Place player at stairs down (entry point)
    if (floor === 0) {
        p.x = Math.floor(floorData.w / 2);
        p.y = floorData.h - 2;
    } else {
        p.x = 1; p.y = 1;
    }
    p.visualX = p.x;
    p.visualY = p.y;

    Game.log(`${building.name} - Piętro ${floor + 1}/${building.numFloors}`, 'info');
    return true;
};

World.exitBuildingFloor = function() {
    if (!this.activeBuildingFloor) return;
    const saved = this.activeBuildingFloor.savedPos;
    const p = Game.player;
    p.x = saved.x;
    p.y = saved.y;
    p.visualX = p.x;
    p.visualY = p.y;
    this.activeBuildingFloor = null;
    Game.log('Wychodzisz z budynku.', 'info');
};

World.goUpFloor = function() {
    if (!this.activeBuildingFloor) return;
    const building = this.buildingFloors[this.activeBuildingFloor.key];
    const nextFloor = this.activeBuildingFloor.floor + 1;
    if (nextFloor < building.numFloors) {
        this.enterBuildingFloor(this.activeBuildingFloor.key, nextFloor);
    }
};

World.goDownFloor = function() {
    if (!this.activeBuildingFloor) return;
    const prevFloor = this.activeBuildingFloor.floor - 1;
    if (prevFloor >= 0) {
        this.enterBuildingFloor(this.activeBuildingFloor.key, prevFloor);
    } else {
        this.exitBuildingFloor();
    }
};

// Get tile inside a building floor
World.getBuildingTile = function(x, y) {
    const bf = this.activeBuildingFloor;
    if (!bf) return this.T.HOUSE_WALL;
    if (x < 0 || x >= bf.w || y < 0 || y >= bf.h) return this.T.HOUSE_WALL;
    return bf.tiles[y * bf.w + x];
};
