// ============================================================
// GAME INPUT - Movement: tryMove(), handleHeldKeys(), walk cooldown
// Adds methods to GameInput (defined in keyboard.js)
// ============================================================

// Called every frame for held movement keys (realtime movement)
GameInput.handleHeldKeys = function(dt) {
    if (Game.state !== 'playing' || Game.activeOverlay) return;
    const dir = this.getHeldDirection();
    if (!dir) return;
    if (Game.walkCooldown > 0) return;
    this.tryMove(dir.dx, dir.dy, dir.dir);
};

GameInput.tryMove = function(dx, dy, dir) {
    const p = Game.player;
    if (!p || Game.animating) return;
    if (Game.state !== 'playing') return;
    if (Game.walkCooldown > 0) return;

    p.dir = dir;

    const nx = p.x + dx;
    const ny = p.y + dy;

    // Monster on target tile - block movement (no bump attack)
    const monster = World.getMonsterAt(nx, ny);
    if (monster) {
        return;
    }

    // Check walkable (pass current position for height check)
    if (!World.isWalkable(nx, ny, p.x, p.y)) return;

    // Set walk cooldown
    Game.walkCooldown = Game.getWalkSpeed();

    // Start smooth movement
    Game.animFromX = p.visualX;
    Game.animFromY = p.visualY;
    Game.animToX = nx;
    Game.animToY = ny;
    Game.animProgress = 0;
    Game.animating = true;
    p.x = nx;
    p.y = ny;

    // Track explored chunks - reveal full viewport area (overworld only)
    if (!World.activeDungeon) {
        const halfW = Math.floor(Game.VIEW_W / 2 / World.CHUNK_SIZE) + 1;
        const halfH = Math.floor(Game.VIEW_H / 2 / World.CHUNK_SIZE) + 1;
        const pcx = Math.floor(nx / World.CHUNK_SIZE);
        const pcy = Math.floor(ny / World.CHUNK_SIZE);
        for (let dy = -halfH; dy <= halfH; dy++) {
            for (let dx = -halfW; dx <= halfW; dx++) {
                Game.exploredChunks.add(`${pcx + dx},${pcy + dy}`);
            }
        }
    }

    // Stealth is now time-based (handled in realtimeTick)

    // Check for ground loot at destination or surrounding
    const lootKey = `${nx},${ny}`;
    const groundLoot = World.groundLoot[lootKey];
    if (groundLoot && groundLoot.length > 0) {
        GameUI.showLootTooltip(groundLoot);
    } else {
        // Check if any loot nearby
        let nearbyLoot = null;
        const surr = [{dx:0,dy:-1},{dx:1,dy:0},{dx:0,dy:1},{dx:-1,dy:0},{dx:-1,dy:-1},{dx:1,dy:-1},{dx:1,dy:1},{dx:-1,dy:1}];
        for (const s of surr) {
            const sk = `${nx+s.dx},${ny+s.dy}`;
            if (World.groundLoot[sk] && World.groundLoot[sk].length > 0) { nearbyLoot = World.groundLoot[sk]; break; }
        }
        if (nearbyLoot) GameUI.showLootTooltip(nearbyLoot);
        else GameUI.hideLootTooltip();
    }

    // Walk-through dungeon entry: stepping on cave/forest entry = auto-enter
    const destTile = World.getTile(nx, ny);

    // Stairs in multi-story buildings
    if (World.activeBuildingFloor) {
        if (destTile === World.T.STAIRS_UP) {
            World.goUpFloor();
            GameRender.updateHUD();
            return;
        }
        if (destTile === World.T.STAIRS_DOWN) {
            World.goDownFloor();
            GameRender.updateHUD();
            return;
        }
    }

    if (destTile === World.T.CAVE_ENTRY || destTile === World.T.FOREST_ENTRY) {
        if (World.activeDungeon) {
            const dd = World.activeDungeon;
            if (nx === dd.entryX && ny === dd.entryY) {
                World.exitDungeon();
            } else if (nx === dd.exitX && ny === dd.exitY) {
                World.nextDungeonFloor();
            }
        } else {
            World.enterDungeon(nx, ny);
        }
        GameRender.updateHUD();
    }

    // Collect quest items (overworld only)
    if (!World.activeDungeon) this.checkCollectQuest();

    // Zone visit tracking for starter island quests
    if (!World.activeDungeon && !World.activeBuildingFloor && Game.starterIslandQuests) {
        this.checkZoneVisit(nx, ny);
    }

    // Music update
    if (!World.activeDungeon) {
        const biome = World.getBiome(nx, ny);
        const inVillage = World.isVillageChunk(Math.floor(nx / World.CHUNK_SIZE), Math.floor(ny / World.CHUNK_SIZE));
        const monstersNear = World.getMonstersNear(nx, ny, 3).length > 0;
        Music.updateBiome(biome, inVillage, monstersNear);
    }

    // Cleanup far chunks periodically
    if (!World.activeDungeon && Math.random() < 0.05) World.cleanupChunks(nx, ny);
};

// Check if player entered a zone relevant to active quests
GameInput.checkZoneVisit = function(wx, wy) {
    const siq = Game.starterIslandQuests;
    if (!siq) return;

    const zone = World.getIslandZone(wx, wy);
    if (!zone || zone === 'plains' || zone === 'town') return;

    // Check all active starter island quests
    for (const q of STARTER_ISLAND.quests) {
        if (siq[q.id] !== 'active') continue;

        if (q.type === 'chain') {
            const stepIdx = siq[q.id + '_step'] || 0;
            const step = q.steps[stepIdx];
            if (step && step.type === 'visit' && !siq[q.id + '_visited_' + step.target]) {
                // Check if player is in the target zone
                if (zone === step.target || zone.startsWith(step.target)) {
                    siq[q.id + '_visited_' + step.target] = true;
                    Game.log(`Odkryto lokację: ${step.target}! Etap ukończony.`, 'info');
                    Game.log(`Wróć do ${q.npc} aby kontynuować quest.`, 'info');
                }
            }
        } else if (q.type === 'visit') {
            if (!siq[q.id + '_visited_' + q.target]) {
                if (zone === q.target || zone.startsWith(q.target)) {
                    siq[q.id + '_visited_' + q.target] = true;
                    Game.log(`Odkryto lokację: ${q.target}!`, 'info');
                    Game.log(`Wróć do ${q.npc} aby zdać quest.`, 'info');
                }
            }
        }
    }
};
