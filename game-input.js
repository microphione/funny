// ============================================================
// GAME INPUT - Keyboard, touch, movement (realtime Tibia-style)
// ============================================================

const GameInput = {
    keys: {},
    heldDir: null, // currently held movement direction
    selectedSkill: null,

    init() {
        window.addEventListener('keydown', e => this.onKeyDown(e));
        window.addEventListener('keyup', e => {
            this.keys[e.code] = false;
            // Clear held direction when key released
            if (['KeyW','ArrowUp','KeyS','ArrowDown','KeyA','ArrowLeft','KeyD','ArrowRight'].includes(e.code)) {
                this.heldDir = this.getHeldDirection();
            }
        });
        this.initMobileControls();
    },

    getHeldDirection() {
        if (this.keys['KeyW'] || this.keys['ArrowUp']) return { dx: 0, dy: -1, dir: 'up' };
        if (this.keys['KeyS'] || this.keys['ArrowDown']) return { dx: 0, dy: 1, dir: 'down' };
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) return { dx: -1, dy: 0, dir: 'left' };
        if (this.keys['KeyD'] || this.keys['ArrowRight']) return { dx: 1, dy: 0, dir: 'right' };
        return null;
    },

    onKeyDown(e) {
        if (Game.state !== 'playing') return;
        this.keys[e.code] = true;

        // Overlays open - ESC to close
        if (Game.activeOverlay) {
            if (e.code === 'Escape') Game.closeAllOverlays();
            return;
        }

        // Movement keys - set held direction for continuous movement
        if (['KeyW','ArrowUp'].includes(e.code)) { this.heldDir = { dx: 0, dy: -1, dir: 'up' }; this.tryMove(0, -1, 'up'); e.preventDefault(); }
        else if (['KeyS','ArrowDown'].includes(e.code)) { this.heldDir = { dx: 0, dy: 1, dir: 'down' }; this.tryMove(0, 1, 'down'); e.preventDefault(); }
        else if (['KeyA','ArrowLeft'].includes(e.code)) { this.heldDir = { dx: -1, dy: 0, dir: 'left' }; this.tryMove(-1, 0, 'left'); e.preventDefault(); }
        else if (['KeyD','ArrowRight'].includes(e.code)) { this.heldDir = { dx: 1, dy: 0, dir: 'right' }; this.tryMove(1, 0, 'right'); e.preventDefault(); }
        // Target nearest monster (Space) - Tibia-style: mark for auto-attack
        else if (e.code === 'Space') { this.targetNearestMonster(); e.preventDefault(); }
        // Interact / Pick up loot (E or Enter)
        else if (e.code === 'Enter' || e.code === 'KeyE') { this.interact(); e.preventDefault(); }
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
        // Skill shortcuts (1-3)
        else if (e.code >= 'Digit1' && e.code <= 'Digit3') {
            const idx = parseInt(e.code.charAt(5)) - 1;
            this.useSkillByIndex(idx);
            e.preventDefault();
        }
        // Quick potions: F1 = HP potion, F2 = MP potion
        else if (e.code === 'F1') { this.useQuickPotion('hp'); e.preventDefault(); }
        else if (e.code === 'F2') { this.useQuickPotion('mp'); e.preventDefault(); }
        // Escape
        else if (e.code === 'Escape') {
            if (Game.targeting) { Game.targeting = false; this.selectedSkill = null; }
            Game.autoAttackTarget = null;
        }
    },

    // Called every frame for held movement keys (realtime movement)
    handleHeldKeys(dt) {
        if (Game.state !== 'playing' || Game.activeOverlay) return;
        const dir = this.getHeldDirection();
        if (!dir) return;
        if (Game.walkCooldown > 0) return;
        this.tryMove(dir.dx, dir.dy, dir.dir);
    },

    tryMove(dx, dy, dir) {
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

        // Check walkable
        if (!World.isWalkable(nx, ny)) return;

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

        // Music update
        if (!World.activeDungeon) {
            const biome = World.getBiome(nx, ny);
            const inVillage = World.isVillageChunk(Math.floor(nx / World.CHUNK_SIZE), Math.floor(ny / World.CHUNK_SIZE));
            const monstersNear = World.getMonstersNear(nx, ny, 3).length > 0;
            Music.updateBiome(biome, inVillage, monstersNear);
        }

        // Cleanup far chunks periodically
        if (!World.activeDungeon && Math.random() < 0.05) World.cleanupChunks(nx, ny);
    },

    // Target nearest monster with Space bar - sets auto-attack target
    targetNearestMonster() {
        const p = Game.player;
        if (!p) return;

        const cls = CLASSES[p.classId];
        const range = cls.attackRange || 1;

        // Find nearest monster within attack range
        const nearby = World.getMonstersNear(p.x, p.y, range);
        if (nearby.length === 0) {
            // Try slightly larger search radius for feedback
            const wider = World.getMonstersNear(p.x, p.y, range + 2);
            if (wider.length > 0) {
                Game.log('Potwór poza zasięgiem ataku.', 'info');
            } else {
                // No monster around - fall back to interact/pickup
                this.interact();
            }
            return;
        }

        // Sort by distance, pick closest
        nearby.sort((a, b) => {
            const da = Math.abs(a.x - p.x) + Math.abs(a.y - p.y);
            const db = Math.abs(b.x - p.x) + Math.abs(b.y - p.y);
            return da - db;
        });

        const target = nearby[0];
        Game.autoAttackTarget = target;
        Game.log(`Cel: ${target.name}`, 'combat');

        // Immediate first attack if cooldown ready
        if (Game.attackCooldown <= 0) {
            GameCombat.playerAttack(target.x, target.y);
            Game.attackCooldown = Game.getAttackSpeed();
        }
    },

    interact() {
        const p = Game.player;
        if (!p) return;

        // Pickup flow: first under player, then surrounding tiles (one item at a time)
        if (this.tryPickupOneItem()) return;

        // Check adjacent tile in facing direction
        const dirs = { up: {dx:0,dy:-1}, down: {dx:0,dy:1}, left: {dx:-1,dy:0}, right: {dx:1,dy:0} };
        const d = dirs[p.dir] || {dx:0,dy:1};
        const tx = p.x + d.dx;
        const ty = p.y + d.dy;

        const tile = World.getTile(tx, ty);
        const T = World.T;

        // Cave entry is now walk-through (handled in tryMove)

        // Chest
        if (tile === T.CHEST) {
            const key = `${tx},${ty}`;
            if (World.activeDungeon) {
                const dc = World.activeDungeon.chests && World.activeDungeon.chests[key];
                if (!dc) { Game.log('Ta skrzynia jest już pusta.', 'info'); return; }
                p.gold += dc.gold;
                Game.log(`Skrzynia: +${dc.gold} złota!`, 'loot');
                Music.playGoldDrop();
                delete World.activeDungeon.chests[key];
                if (Math.random() < 0.6) {
                    const loot = generateLootForClass(p.classId, World.activeDungeon.difficulty + World.activeDungeon.floor);
                    if (loot) World.dropGroundLoot(tx, ty, [loot]);
                }
                GameRender.updateHUD();
                return;
            }
            if (World.openedChests.has(key)) { Game.log('Ta skrzynia jest już pusta.', 'info'); return; }
            World.openedChests.add(key);
            const chest = World.chests[key];
            if (chest) {
                p.gold += chest.gold;
                Game.log(`Skrzynia: +${chest.gold} złota!`, 'loot');
                Music.playGoldDrop();
                if (Math.random() < 0.5) {
                    const loot = generateLootForClass(p.classId, World.getDifficulty(tx, ty));
                    if (loot) World.dropGroundLoot(tx, ty, [loot]);
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
            const existing = Game.quests.find(q => q.id === quest.id);
            if (existing) {
                if (existing.completed && !existing.turned_in) {
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
                const q = { ...quest, progress: 0, completed: false, turned_in: false };
                Game.quests.push(q);
                if (q.type === 'collect') World.spawnQuestItems(q);
                Game.log(`Nowy quest: ${q.title}`, 'info');
            }
            return;
        }

        // Town building door (NPC inside)
        if (tile === T.TOWN_BUILDING_DOOR) {
            const bKey = `${tx},${ty}`;
            const bldg = World.townBuildings && World.townBuildings[bKey];
            const npcName = bldg ? bldg.npcName : 'Mieszkaniec';
            const dialogues = [
                `${npcName}: Witaj podróżniku! Czym mogę służyć?`,
                `${npcName}: Miło cię widzieć w naszym mieście!`,
                `${npcName}: Powodzenia w twoich przygodach!`,
                `${npcName}: Uważaj za murami miasta, pełno tam potworów.`,
                `${npcName}: Wróć kiedy będziesz potrzebować pomocy!`,
            ];
            Game.log(dialogues[Math.floor(Math.random() * dialogues.length)], 'info');
            return;
        }

        // Buyable house door - interact to buy (if not owned)
        if (tile === T.HOUSE_DOOR) {
            const houseKey = `${tx},${ty}`;
            const house = World.houses[houseKey];
            if (house) {
                if (house.owned || (p.ownedHouses && p.ownedHouses.includes(houseKey))) {
                    Game.log(`${house.name} - Twój dom! Wejdź do środka.`, 'info');
                } else {
                    GameUI.showHouseBuyDialog(houseKey, house);
                }
            }
            return;
        }

        // City NPC interaction
        const cityNpc = World.getCityNpcAt(tx, ty);
        if (cityNpc) {
            const greetings = [
                'Dzień dobry, podróżniku!',
                'Witaj w Stolicy!',
                'Uważaj na potwory za murami!',
                'Słyszałeś o dungeonach na pustyni?',
                'Kupuj mikstury zanim wyruszysz!',
                'Powodzenia w przygodzie!',
                'Handlarze mają nowe towary!',
                'Piękny dzień, nieprawdaż?',
            ];
            const msg = greetings[Math.floor(Math.random() * greetings.length)];
            Game.log(`${cityNpc.name}: "${msg}"`, 'info');
            return;
        }

        // Well
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

        // Inn
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
    },

    // Try to pick up ONE item: first under player, then surrounding tiles
    tryPickupOneItem() {
        const p = Game.player;
        if (!p) return false;

        // 1. Check under player
        if (this.pickupOneItemAt(p.x, p.y)) return true;

        // 2. Check all 8 surrounding tiles
        const surroundOrder = [
            {dx:0,dy:-1}, {dx:1,dy:0}, {dx:0,dy:1}, {dx:-1,dy:0},
            {dx:-1,dy:-1}, {dx:1,dy:-1}, {dx:1,dy:1}, {dx:-1,dy:1}
        ];
        for (const d of surroundOrder) {
            if (this.pickupOneItemAt(p.x + d.dx, p.y + d.dy)) return true;
        }

        return false;
    },

    // Pick up exactly ONE item from a specific position
    pickupOneItemAt(wx, wy) {
        const key = `${wx},${wy}`;
        const loot = World.groundLoot[key];
        if (!loot || loot.length === 0) return false;

        const p = Game.player;
        const equippedIds = new Set(Object.values(p.equipment).filter(e => e).map(e => e.id));
        const backpackCount = p.inventory.filter(item => !equippedIds.has(item.id) || item.type === 'consumable').length;

        // Take the first item
        const item = loot[0];

        // Check backpack space
        if (item.type === 'consumable') {
            const existing = p.inventory.find(i => i.id === item.id);
            if (existing) {
                existing.count = (existing.count || 1) + (item.count || 1);
                loot.shift();
                Game.log(`Podniesiono: ${item.name}`, 'loot');
            } else if (backpackCount < 20) {
                p.inventory.push(item);
                loot.shift();
                Game.log(`Podniesiono: ${item.name}`, 'loot');
            } else {
                Game.log('Plecak pełny!', 'info');
                return true; // still "handled" the interaction
            }
        } else {
            if (backpackCount < 20) {
                p.inventory.push(item);
                loot.shift();
                Game.log(`Podniesiono: ${item.name}`, 'loot');
            } else {
                Game.log('Plecak pełny!', 'info');
                return true;
            }
        }

        if (loot.length === 0) {
            delete World.groundLoot[key];
            GameUI.hideLootTooltip();
        }
        GameUI.updateSidePanel();
        return true;
    },

    useSkillByIndex(idx) {
        const p = Game.player;
        const cls = CLASSES[p.classId];
        if (idx >= 3) return;
        const skillId = p.activeSkills[idx];
        if (!skillId) { Game.log('Brak umiejętności w tym slocie.', 'info'); return; }
        const skill = cls.skills.find(s => s.id === skillId);
        if (!skill) return;

        if (p.mp < skill.cost) {
            Game.log(`Za mało many na ${skill.name} (${skill.cost} MP)`, 'info');
            return;
        }
        if (Game.skillCooldowns[skillId] > 0) {
            Game.log(`${skill.name} się ładuje!`, 'info');
            return;
        }

        if (['melee','ranged','ranged_aoe'].includes(skill.type)) {
            // Range-based targeting: use autoAttackTarget or find nearest monster in range
            const skillRange = skill.type === 'melee' ? (cls.attackRange || 1) : (cls.attackRange || 3);
            let target = null;

            // First check current auto-attack target
            if (Game.autoAttackTarget && Game.autoAttackTarget.alive) {
                const dist = Math.abs(Game.autoAttackTarget.x - p.x) + Math.abs(Game.autoAttackTarget.y - p.y);
                if (dist <= skillRange) target = Game.autoAttackTarget;
            }

            // If no valid target, find nearest in range
            if (!target) {
                const nearby = World.getMonstersNear(p.x, p.y, skillRange);
                if (nearby.length > 0) {
                    nearby.sort((a, b) => {
                        const da = Math.abs(a.x - p.x) + Math.abs(a.y - p.y);
                        const db = Math.abs(b.x - p.x) + Math.abs(b.y - p.y);
                        return da - db;
                    });
                    target = nearby[0];
                }
            }

            if (target) {
                GameCombat.useSkill(skill.id, target.x, target.y);
            } else if (skill.type === 'ranged_aoe') {
                // AoE ranged can target a direction even without a specific monster
                const dirTarget = GameCombat.getTargetTile();
                GameCombat.useSkill(skill.id, dirTarget.x, dirTarget.y);
            } else {
                Game.log('Brak celu w zasięgu.', 'info');
            }
        } else if (skill.type === 'buff') {
            GameCombat.useSkill(skill.id, p.x, p.y);
        } else if (skill.type === 'aoe') {
            GameCombat.useSkill(skill.id, p.x, p.y);
        }
    },

    useQuickPotion(subtype) {
        const p = Game.player;
        if (!p) return;
        const idx = p.inventory.findIndex(i => i.type === 'consumable' && i.subtype === subtype);
        if (idx === -1) {
            Game.log(`Brak mikstur ${subtype === 'hp' ? 'HP' : 'MP'}!`, 'info');
            return;
        }
        GameUI.useConsumable(idx);
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

        const center = document.querySelector('.dpad-center');
        if (center) {
            const handler = (e) => { e.preventDefault(); this.interact(); };
            center.addEventListener('touchstart', handler, { passive: false });
            center.addEventListener('mousedown', handler);
        }

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
