// ============================================================
// DUNGEON SYSTEM - Dungeon types, generation, navigation
// ============================================================

World.DUNGEON_TYPES = [
    { id: 'goblin_cave', name: 'Jaskinia Goblinów', monsters: ['goblin','spider'], boss: { name: 'Król Goblinów', sprite: 'goblin', hpMult: 8, atkMult: 3, defMult: 2, xpMult: 10, goldMult: 15 }, floors: 3, biome: 'cave' },
    { id: 'undead_crypt', name: 'Krypta Nieumarłych', monsters: ['ghost','mummy'], boss: { name: 'Lich', sprite: 'ghost', hpMult: 10, atkMult: 4, defMult: 3, xpMult: 15, goldMult: 20 }, floors: 4, biome: 'crypt' },
    { id: 'spider_nest', name: 'Gniazdo Pająków', monsters: ['spider','beetle'], boss: { name: 'Matka Pająków', sprite: 'spider', hpMult: 12, atkMult: 3, defMult: 2, xpMult: 12, goldMult: 18 }, floors: 3, biome: 'cave' },
    { id: 'dragon_lair', name: 'Smocze Leże', monsters: ['dark_knight','golem'], boss: { name: 'Prastarzy Smok', sprite: 'griffin', hpMult: 15, atkMult: 5, defMult: 4, xpMult: 25, goldMult: 30 }, floors: 5, biome: 'fire' },
    { id: 'shadow_realm', name: 'Kraina Cieni', monsters: ['ghost','djinn'], boss: { name: 'Władca Cieni', sprite: 'djinn', hpMult: 20, atkMult: 6, defMult: 5, xpMult: 30, goldMult: 40 }, floors: 5, biome: 'shadow' },
    { id: 'demon_pit', name: 'Otchłań Demonów', monsters: ['demon','skeleton'], boss: { name: 'Arcydemon', sprite: 'demon', hpMult: 18, atkMult: 7, defMult: 5, xpMult: 35, goldMult: 45 }, floors: 5, biome: 'fire' },
    { id: 'frozen_tomb', name: 'Lodowy Grobowiec', monsters: ['ice_golem','skeleton'], boss: { name: 'Mroźny Władca', sprite: 'ice_golem', hpMult: 16, atkMult: 5, defMult: 7, xpMult: 28, goldMult: 35 }, floors: 4, biome: 'cave' },
    { id: 'wyrm_nest', name: 'Gniazdo Wyrmów', monsters: ['wyrm','fire_elemental'], boss: { name: 'Pradawny Wyrm', sprite: 'wyrm', hpMult: 22, atkMult: 8, defMult: 6, xpMult: 40, goldMult: 50 }, floors: 6, biome: 'fire' },
];

World.getDungeonType = function(wx, wy) {
    const idx = Math.abs((wx * 13 + wy * 7 + this.worldSeed) % this.DUNGEON_TYPES.length);
    return this.DUNGEON_TYPES[idx];
};

World.enterDungeon = function(wx, wy) {
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
};

World.generateDungeonFloor = function() {
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
            armor: Math.floor((base.armor || base.def || 0) * scale),
            def: Math.floor((base.armor || base.def || 0) * scale),
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
};

World.exitDungeon = function() {
    if (!this.dungeonReturnPos) return;
    const p = Game.player;
    p.x = this.dungeonReturnPos.x;
    p.y = this.dungeonReturnPos.y;
    p.visualX = p.x;
    p.visualY = p.y;
    this.activeDungeon = null;
    this.dungeonReturnPos = null;
    Game.log('Opuszczasz dungeon.', 'info');
};

World.nextDungeonFloor = function() {
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
};

World.getDungeonTile = function(x, y) {
    const d = this.activeDungeon;
    if (!d || x < 0 || y < 0 || x >= d.size || y >= d.size) return this.T.CAVE_WALL;
    return d.tiles[y * d.size + x];
};

World.getDungeonMonsterAt = function(x, y) {
    const d = this.activeDungeon;
    if (!d) return null;
    const m = d.monsters[`${x},${y}`];
    return (m && m.alive) ? m : null;
};

World.getDungeonMonstersNear = function(px, py, range) {
    const d = this.activeDungeon;
    if (!d) return [];
    const result = [];
    for (const key in d.monsters) {
        const m = d.monsters[key];
        if (!m.alive) continue;
        if (Math.abs(m.x - px) <= range && Math.abs(m.y - py) <= range) result.push(m);
    }
    return result;
};

World.moveDungeonMonster = function(m, nx, ny) {
    const d = this.activeDungeon;
    if (!d || !m || !m.alive) return;
    const oldKey = `${m.x},${m.y}`;
    const newKey = `${nx},${ny}`;
    if (d.monsters[newKey]) return;
    delete d.monsters[oldKey];
    m.x = nx; m.y = ny;
    d.monsters[newKey] = m;
};

World.removeDungeonMonster = function(m) {
    const d = this.activeDungeon;
    if (!d || !m) return;
    delete d.monsters[`${m.x},${m.y}`];
};
