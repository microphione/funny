// ============================================================
// GAME INPUT - Keyboard, touch, movement, interactions
// ============================================================

const GameInput = {
    keys: {},
    moveRepeatTimer: 0,
    moveRepeatDelay: 0.18,
    selectedSkill: null,

    init() {
        window.addEventListener('keydown', e => this.onKeyDown(e));
        window.addEventListener('keyup', e => { this.keys[e.code] = false; });
        this.initMobileControls();
    },

    onKeyDown(e) {
        if (Game.state !== 'playing') return;
        this.keys[e.code] = true;

        // Overlays open - ESC to close
        if (Game.activeOverlay) {
            if (e.code === 'Escape') Game.closeAllOverlays();
            return;
        }

        // Movement
        if (['KeyW','ArrowUp'].includes(e.code)) { this.tryMove(0, -1, 'up'); e.preventDefault(); }
        else if (['KeyS','ArrowDown'].includes(e.code)) { this.tryMove(0, 1, 'down'); e.preventDefault(); }
        else if (['KeyA','ArrowLeft'].includes(e.code)) { this.tryMove(-1, 0, 'left'); e.preventDefault(); }
        else if (['KeyD','ArrowRight'].includes(e.code)) { this.tryMove(1, 0, 'right'); e.preventDefault(); }
        // Interact
        else if (e.code === 'Space') { this.interact(); e.preventDefault(); }
        // Inventory
        else if (e.code === 'KeyI') { GameUI.openInventory(); e.preventDefault(); }
        // Skills
        else if (e.code === 'KeyK') { GameUI.openSkillTree(); e.preventDefault(); }
        // Quests
        else if (e.code === 'KeyJ') { GameUI.openQuests(); e.preventDefault(); }
        // World map
        else if (e.code === 'KeyN') { GameUI.openWorldMap(); e.preventDefault(); }
        // Quick save
        else if (e.code === 'KeyP') { Game.save(); e.preventDefault(); }
        // Music toggle
        else if (e.code === 'KeyM') { this.toggleMusic(); e.preventDefault(); }
        // Skill shortcuts (1-5)
        else if (e.code >= 'Digit1' && e.code <= 'Digit5') {
            const idx = parseInt(e.code.charAt(5)) - 1;
            this.useSkillByIndex(idx);
            e.preventDefault();
        }
        // Attack (Enter or E)
        else if (e.code === 'Enter' || e.code === 'KeyE') {
            this.attackInDirection();
            e.preventDefault();
        }
        // Targeting cancel
        else if (e.code === 'Escape') {
            if (Game.targeting) { Game.targeting = false; this.selectedSkill = null; }
        }
    },

    tryMove(dx, dy, dir) {
        const p = Game.player;
        if (!p || Game.animating) return;
        if (Game.state !== 'playing') return;

        p.dir = dir;

        const nx = p.x + dx;
        const ny = p.y + dy;

        // Check for monster - bump attack
        const monster = World.getMonsterAt(nx, ny);
        if (monster) {
            this.performPlayerTurn(() => GameCombat.playerAttack(nx, ny));
            return;
        }

        // Check walkable
        if (!World.isWalkable(nx, ny)) return;

        // Start smooth movement
        Game.animFromX = p.visualX;
        Game.animFromY = p.visualY;
        Game.animToX = nx;
        Game.animToY = ny;
        Game.animProgress = 0;
        Game.animating = true;
        p.x = nx;
        p.y = ny;

        // Track explored chunks (overworld only)
        if (!World.activeDungeon) {
            const ecx = Math.floor(nx / World.CHUNK_SIZE);
            const ecy = Math.floor(ny / World.CHUNK_SIZE);
            Game.exploredChunks.add(`${ecx},${ecy}`);
        }

        // Stealth step counter
        if (Game.player.stealth && Game.player.stealthSteps > 0) {
            Game.player.stealthSteps--;
            if (Game.player.stealthSteps <= 0) {
                Game.player.stealth = false;
                Game.log('Niewidzialność się skończyła.', 'info');
            }
        }

        // After movement - end turn
        this.endPlayerTurn();

        // Collect quest items (overworld only)
        if (!World.activeDungeon) this.checkCollectQuest();

        // Music update
        if (!World.activeDungeon) {
            const biome = World.getBiome(nx, ny);
            const inVillage = World.isVillageChunk(Math.floor(nx / World.CHUNK_SIZE), Math.floor(ny / World.CHUNK_SIZE));
            const monstersNear = World.getMonstersNear(nx, ny, 3).length > 0;
            Music.updateBiome(biome, inVillage, monstersNear);
        }

        // Cleanup far chunks periodically
        if (!World.activeDungeon && Game.turnNumber % 20 === 0) World.cleanupChunks(nx, ny);
    },

    performPlayerTurn(action) {
        const p = Game.player;
        const cls = CLASSES[p.classId];
        if (Game.turnPhase !== 'player') return;

        if (Game.playerActionsLeft <= 0) {
            Game.playerActionsLeft = cls.attacksPerTurn;
        }

        const result = action();
        if (!result) return;

        Game.playerActionsLeft--;
        if (Game.playerActionsLeft <= 0) {
            this.endPlayerTurn();
        }
    },

    endPlayerTurn() {
        Game.turnNumber++;
        Game.turnPhase = 'monsters';
        GameCombat.monstersTurn();
        Game.turnPhase = 'player';
        const cls = CLASSES[Game.player.classId];
        Game.playerActionsLeft = cls.attacksPerTurn;
        GameRender.updateHUD();
        // Periodic main quest check
        if (Game.turnNumber % 10 === 0) Game.checkMainQuest();
    },

    interact() {
        const p = Game.player;
        if (!p) return;
        const dirs = { up: {dx:0,dy:-1}, down: {dx:0,dy:1}, left: {dx:-1,dy:0}, right: {dx:1,dy:0} };
        const d = dirs[p.dir] || {dx:0,dy:1};
        const tx = p.x + d.dx;
        const ty = p.y + d.dy;
        const tile = World.getTile(tx, ty);
        const T = World.T;

        // Cave entry - enter/navigate dungeon
        if (tile === T.CAVE_ENTRY) {
            if (World.activeDungeon) {
                const d = World.activeDungeon;
                if (tx === d.entryX && ty === d.entryY) {
                    // Exit dungeon
                    World.exitDungeon();
                } else if (tx === d.exitX && ty === d.exitY) {
                    // Next floor
                    World.nextDungeonFloor();
                }
            } else {
                // Enter dungeon from overworld
                World.enterDungeon(tx, ty);
            }
            GameRender.updateHUD();
            return;
        }

        // Chest
        if (tile === T.CHEST) {
            const key = `${tx},${ty}`;
            // Dungeon chests
            if (World.activeDungeon) {
                const dc = World.activeDungeon.chests && World.activeDungeon.chests[key];
                if (!dc) { Game.log('Ta skrzynia jest już pusta.', 'info'); return; }
                p.gold += dc.gold;
                Game.log(`Skrzynia: +${dc.gold} złota!`, 'loot');
                delete World.activeDungeon.chests[key];
                if (Math.random() < 0.6) {
                    const loot = generateLootForClass(p.classId, World.activeDungeon.difficulty + World.activeDungeon.floor);
                    if (loot) { p.inventory.push(loot); Game.log(`Znaleziono: ${loot.name}!`, 'loot'); }
                }
                GameRender.updateHUD();
                return;
            }
            if (World.openedChests.has(key)) {
                Game.log('Ta skrzynia jest już pusta.', 'info');
                return;
            }
            World.openedChests.add(key);
            const chest = World.chests[key];
            if (chest) {
                p.gold += chest.gold;
                Game.log(`Skrzynia: +${chest.gold} złota!`, 'loot');

                // Chance for item
                if (Math.random() < 0.5) {
                    const loot = generateLootForClass(p.classId, World.getDifficulty(tx, ty));
                    if (loot) {
                        p.inventory.push(loot);
                        Game.log(`Znaleziono: ${loot.name}!`, 'loot');
                    }
                }
            }
            GameRender.updateHUD();
            return;
        }

        // Sign
        if (tile === T.SIGN) {
            const text = World.signTexts[`${tx},${ty}`];
            if (text) Game.log(text, 'info');
            return;
        }

        // Shop NPCs
        if (tile === T.SHOP_WEAPON_NPC) {
            const npc = World.npcs[`${tx},${ty}`];
            if (npc) GameUI.openShop('weapon', npc.difficulty);
            return;
        }
        if (tile === T.SHOP_ARMOR_NPC) {
            const npc = World.npcs[`${tx},${ty}`];
            if (npc) GameUI.openShop('armor', npc.difficulty);
            return;
        }
        if (tile === T.SHOP_POTION_NPC) {
            const npc = World.npcs[`${tx},${ty}`];
            if (npc) GameUI.openShop('potion', npc.difficulty);
            return;
        }

        // Quest NPCs
        if (tile === T.NPC_QUEST || tile === T.NPC_QUEST2) {
            const quest = World.questNpcs[`${tx},${ty}`];
            if (!quest) return;

            // Check if already accepted
            const existing = Game.quests.find(q => q.id === quest.id);
            if (existing) {
                if (existing.completed && !existing.turned_in) {
                    // Turn in
                    existing.turned_in = true;
                    p.gold += existing.reward.gold;
                    Game.addXp(existing.reward.xp);
                    Game.log(`Quest oddany! +${existing.reward.gold}zł, +${existing.reward.xp} XP`, 'loot');
                    GameRender.updateHUD();
                } else if (existing.turned_in) {
                    Game.log('Ten quest został już ukończony.', 'info');
                } else {
                    Game.log(`Quest w toku: ${existing.progress}/${existing.required}`, 'info');
                }
            } else {
                // Accept quest
                const q = { ...quest, progress: 0, completed: false, turned_in: false };
                Game.quests.push(q);
                if (q.type === 'collect') World.spawnQuestItems(q);
                Game.log(`Nowy quest: ${q.title}`, 'info');
            }
            return;
        }

        // Well - save point + register for teleport
        if (tile === T.WELL) {
            const cx = Math.floor(tx / World.CHUNK_SIZE);
            const cy = Math.floor(ty / World.CHUNK_SIZE);
            const vk = World.getChunkKey(cx, cy);
            if (World.villages[vk]) {
                Game.lastVillageWell = { x: tx, y: ty };
                Game.usedWells.add(vk);
                Game.log(`Punkt odrodzenia: ${World.villages[vk].name}`, 'info');
                Game.save();
            }
            return;
        }

        // Inn - heal
        if (tile === T.INN) {
            const cost = 5 + p.level * 2;
            if (p.gold >= cost) {
                p.gold -= cost;
                p.hp = p.maxHp;
                p.mp = p.maxMp;
                Game.log(`Odpoczynek w karczmie. Pełne HP i MP! (-${cost}zł)`, 'heal');
                GameRender.updateHUD();
            } else {
                Game.log(`Za mało złota na odpoczynek (${cost}zł).`, 'info');
            }
            return;
        }

        // Attack in direction (for ranged)
        this.attackInDirection();
    },

    attackInDirection() {
        const p = Game.player;
        const cls = CLASSES[p.classId];
        const range = cls.attackRange || 1;
        const dirs = { up: {dx:0,dy:-1}, down: {dx:0,dy:1}, left: {dx:-1,dy:0}, right: {dx:1,dy:0} };
        const d = dirs[p.dir] || {dx:0,dy:1};

        // Find first monster in line of sight within range
        for (let i = 1; i <= range; i++) {
            const tx = p.x + d.dx * i;
            const ty = p.y + d.dy * i;
            const m = World.getMonsterAt(tx, ty);
            if (m) {
                this.performPlayerTurn(() => GameCombat.playerAttack(tx, ty));
                return;
            }
            // Stop if wall
            if (World.isTileBlocked(World.getTile(tx, ty))) break;
        }
    },

    useSkillByIndex(idx) {
        const p = Game.player;
        const cls = CLASSES[p.classId];
        // Use active skill slots (3 slots max)
        if (idx >= 3) return;
        const skillId = p.activeSkills[idx];
        if (!skillId) { Game.log('Brak umiejętności w tym slocie.', 'info'); return; }
        const skill = cls.skills.find(s => s.id === skillId);
        if (!skill) return;

        if (p.mp < skill.cost) {
            Game.log(`Za mało many na ${skill.name} (${skill.cost} MP)`, 'info');
            return;
        }

        // For targeted skills, find target
        if (['melee','ranged','ranged_aoe'].includes(skill.type)) {
            const target = GameCombat.getTargetTile();
            // For ranged, search in direction
            if (skill.type === 'ranged' || skill.type === 'ranged_aoe') {
                const range = cls.attackRange || 3;
                const dirs = { up: {dx:0,dy:-1}, down: {dx:0,dy:1}, left: {dx:-1,dy:0}, right: {dx:1,dy:0} };
                const d = dirs[p.dir] || {dx:0,dy:1};
                for (let i = 1; i <= range; i++) {
                    const tx = p.x + d.dx * i;
                    const ty = p.y + d.dy * i;
                    const m = World.getMonsterAt(tx, ty);
                    if (m) {
                        this.performPlayerTurn(() => GameCombat.useSkill(skill.id, tx, ty));
                        return;
                    }
                    if (World.isTileBlocked(World.getTile(tx, ty))) break;
                }
                // For AOE, use target tile even without monster
                if (skill.type === 'ranged_aoe') {
                    this.performPlayerTurn(() => GameCombat.useSkill(skill.id, target.x, target.y));
                    return;
                }
                Game.log('Brak celu w zasięgu.', 'info');
            } else {
                // Melee - check adjacent
                const m = World.getMonsterAt(target.x, target.y);
                if (m) {
                    this.performPlayerTurn(() => GameCombat.useSkill(skill.id, target.x, target.y));
                } else {
                    Game.log('Brak wroga w tym kierunku.', 'info');
                }
            }
        } else if (skill.type === 'buff') {
            this.performPlayerTurn(() => GameCombat.useSkill(skill.id, p.x, p.y));
        } else if (skill.type === 'aoe') {
            this.performPlayerTurn(() => GameCombat.useSkill(skill.id, p.x, p.y));
        }
    },

    checkCollectQuest() {
        const p = Game.player;
        const key = `${p.x},${p.y}`;
        const qi = World.questItems[key];
        if (qi) {
            const q = Game.quests.find(q => q.id === qi.questId && !q.completed);
            if (q) {
                q.progress++;
                delete World.questItems[key];
                Game.log(`Zebrano ${qi.itemName} (${q.progress}/${q.required})`, 'loot');
                if (q.progress >= q.required) {
                    q.completed = true;
                    Game.log(`Quest "${q.title}" ukończony! Wróć do zleceniodawcy.`, 'info');
                    // Clean up remaining items for this quest
                    for (const k in World.questItems) {
                        if (World.questItems[k].questId === q.id) delete World.questItems[k];
                    }
                }
            }
        }
    },

    toggleMusic() {
        const muted = Music.toggle();
        Game.log(muted ? 'Muzyka wyłączona.' : 'Muzyka włączona.', 'info');
        const btn = document.getElementById('music-btn');
        if (btn) btn.textContent = muted ? '🔇' : '🔊';
    },

    // ========== MOBILE CONTROLS ==========
    initMobileControls() {
        const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const mobileEl = document.getElementById('mobile-controls');
        const fsBtn = document.getElementById('fullscreen-btn');

        if (isMobile) {
            if (mobileEl) mobileEl.style.display = 'block';
            if (fsBtn) fsBtn.style.display = 'flex';
        }

        // D-pad
        document.querySelectorAll('.dpad-btn[data-dir]').forEach(btn => {
            const handler = (e) => {
                e.preventDefault();
                const dir = btn.dataset.dir;
                if (Game.state === 'dead') return;
                const map = { up: [0,-1,'up'], down: [0,1,'down'], left: [-1,0,'left'], right: [1,0,'right'] };
                const [dx, dy, d] = map[dir] || [0,0,'down'];
                this.tryMove(dx, dy, d);
            };
            btn.addEventListener('touchstart', handler, { passive: false });
            btn.addEventListener('mousedown', handler);
        });

        // Center = interact
        const center = document.querySelector('.dpad-center');
        if (center) {
            const handler = (e) => { e.preventDefault(); this.interact(); };
            center.addEventListener('touchstart', handler, { passive: false });
            center.addEventListener('mousedown', handler);
        }

        // Action buttons
        const interactBtn = document.getElementById('mobile-interact');
        if (interactBtn) {
            const handler = (e) => { e.preventDefault(); this.interact(); };
            interactBtn.addEventListener('touchstart', handler, { passive: false });
        }

        const invBtn = document.getElementById('mobile-inventory');
        if (invBtn) {
            const handler = (e) => { e.preventDefault(); GameUI.openInventory(); };
            invBtn.addEventListener('touchstart', handler, { passive: false });
        }

        // Fullscreen
        if (fsBtn) {
            fsBtn.addEventListener('click', () => {
                if (document.fullscreenElement || document.webkitFullscreenElement) {
                    (document.exitFullscreen || document.webkitExitFullscreen).call(document);
                    fsBtn.classList.remove('is-fullscreen');
                } else {
                    const el = document.documentElement;
                    (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
                    fsBtn.classList.add('is-fullscreen');
                    try { screen.orientation.lock('landscape').catch(()=>{}); } catch(e) {}
                }
            });
        }
    },
};
