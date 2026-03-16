// ============================================================
// GAME INPUT - Interaction: interact(), targetNearestMonster(),
//   useSkillByIndex(), pickupLoot(), NPC interaction, context menu
// Adds methods to GameInput (defined in keyboard.js)
// ============================================================

// Target nearest monster with Space bar - sets auto-attack target
GameInput.targetNearestMonster = function() {
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
};

GameInput.interact = function() {
    const p = Game.player;
    if (!p) return;

    // If inside a building floor, check stairs on current tile
    if (World.activeBuildingFloor) {
        const curTile = World.getTile(p.x, p.y);
        if (curTile === World.T.STAIRS_UP) { World.goUpFloor(); GameRender.updateHUD(); return; }
        if (curTile === World.T.STAIRS_DOWN) { World.goDownFloor(); GameRender.updateHUD(); return; }
    }

    // Check if standing on stairs_up on overworld (e.g. starter island -> town)
    if (!World.activeBuildingFloor && !World.activeDungeon) {
        const curTile = World.getTile(p.x, p.y);
        if (curTile === World.T.STAIRS_UP) {
            // Check if this is the starter island town entrance
            const ic = World.getIslandCenter();
            if (Math.abs(p.x - ic.x) < 3 && Math.abs(p.y - ic.y) < 3) {
                World.enterStarterTown();
                GameRender.updateHUD();
                return;
            }
        }
    }

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
            Game.syncGold();
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
            Game.syncGold();
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

        // Starter island special NPCs (per-NPC quest system)
        if (quest.type === 'starter_island' || quest.type === 'starter_island_npc') {
            this.handleStarterIslandQuestNpc(quest.name || 'Mieszkaniec');
            return;
        }
        if (quest.type === 'starter_mentor') {
            const tips = [
                'Mentor: Witaj na Wyspie Początkowej! Poznaj świat w bezpiecznym otoczeniu.',
                'Mentor: Zbieraj doświadczenie walcząc z potworami. Klawisze WASD do ruchu.',
                'Mentor: Na poziomie 20 będziesz mógł opuścić wyspę i wybrać klasę!',
                'Mentor: Pamiętaj o miksturach - kupuj je u Znachora.',
                'Mentor: Im dalej od wioski, tym silniejsze potwory!',
                'Mentor: Naciśnij I aby otworzyć ekwipunek, T dla statystyk.',
            ];
            Game.log(tips[Math.min(p.level - 1, tips.length - 1)], 'info');
            return;
        }
        if (quest.type === 'starter_captain') {
            if (p.level < 20) {
                Game.log(`Kapitan: Musisz osiągnąć poziom 20 aby opuścić wyspę! (Twój: ${p.level})`, 'info');
            } else {
                Game.log('Kapitan: Jesteś gotowy na kontynent! Wybierz swoją klasę!', 'loot');
                GameUI.showClassSelectForIsland();
            }
            return;
        }
        if (quest.type === 'quest_board') {
            this.handleQuestBoard();
            return;
        }
        if (quest.type === 'daily_quest') {
            this.handleDailyQuestBoard();
            return;
        }
        if (quest.type === 'town_npc') {
            const npcName = quest.name || 'Mieszkaniec';
            if (npcName === 'Bankier') {
                GameUI.openBank();
                return;
            }
            if (npcName === 'Stajennik') {
                const mountPrice = 500;
                if (p.ownedMounts && p.ownedMounts.length > 0) {
                    Game.log(`Stajennik: Twój koń czeka! Naciśnij R by wsiadać/zsiadać.`, 'info');
                } else {
                    GameUI.confirmAction(`Kupić wierzchowca za ${mountPrice} złota?`, () => {
                        if (p.gold >= mountPrice) {
                            p.gold -= mountPrice;
                            Game.syncGold();
                            p.ownedMounts = p.ownedMounts || [];
                            p.ownedMounts.push('horse');
                            Game.log(`Kupiono wierzchowca! Naciśnij R.`, 'loot');
                            GameRender.updateHUD();
                        } else {
                            Game.log(`Za mało złota! (${mountPrice})`, 'info');
                        }
                    });
                }
                return;
            }
            const dialogues = [
                `${npcName}: Witaj podróżniku!`,
                `${npcName}: Miło cię widzieć!`,
                `${npcName}: Powodzenia w przygodach!`,
                `${npcName}: Uważaj za murami, pełno tam potworów.`,
            ];
            Game.log(dialogues[Math.floor(Math.random() * dialogues.length)], 'info');
            return;
        }

        const existing = Game.quests.find(q => q.id === quest.id);
        if (existing) {
            if (existing.completed && !existing.turned_in) {
                existing.turned_in = true;
                p.gold += existing.reward.gold;
                Game.syncGold();
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

    // Town building door (NPC inside) - check multi-story first
    if (tile === T.TOWN_BUILDING_DOOR) {
        const bKey = `${tx},${ty}`;
        const bldg = World.townBuildings && World.townBuildings[bKey];
        const npcName = bldg ? bldg.npcName : 'Mieszkaniec';

        // Multi-story building: enter upper floors
        if (bldg && bldg.multiStory && World.buildingFloors[bKey]) {
            World.enterBuildingFloor(bKey, 0);
            GameRender.updateHUD();
            return;
        }
        // Special NPCs
        if (npcName === 'Bankier') {
            GameUI.openBank();
            return;
        }
        if (npcName === 'Stajennik') {
            const mountPrice = 500;
            if (p.ownedMounts && p.ownedMounts.length > 0) {
                Game.log(`Stajennik: Twój koń czeka! Naciśnij R by wsiadać/zsiadać.`, 'info');
            } else {
                GameUI.confirmAction(`Kupić wierzchowca za ${mountPrice} złota? (+40% szybkości ruchu)`, () => {
                    if (p.gold >= mountPrice) {
                        p.gold -= mountPrice;
                        Game.syncGold();
                        p.ownedMounts = p.ownedMounts || [];
                        p.ownedMounts.push('horse');
                        Game.log(`Kupiono wierzchowca! Naciśnij R by wsiadać/zsiadać.`, 'loot');
                        GameRender.updateHUD();
                    } else {
                        Game.log(`Za mało złota! (potrzeba ${mountPrice})`, 'info');
                    }
                });
            }
            return;
        }
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

    // Buyable house door - interact to buy or enter (if owned)
    if (tile === T.HOUSE_DOOR) {
        const houseKey = `${tx},${ty}`;
        const house = World.houses[houseKey];
        if (house) {
            if (house.owned || (p.ownedHouses && p.ownedHouses.includes(houseKey))) {
                // Check if multi-story
                if (World.buildingFloors[houseKey]) {
                    World.enterBuildingFloor(houseKey, 0);
                    GameRender.updateHUD();
                } else {
                    Game.log(`${house.name} - Twój dom! Wejdź naciskając klawisz ruchu w stronę drzwi.`, 'info');
                }
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
        // Starter island well
        if (World.isStarterIslandChunk(cx, cy)) {
            Game.lastVillageWell = { x: tx, y: ty };
            Game.log('Punkt odrodzenia: Wyspa Początkowa', 'info');
            Game.save();
        } else if (World.villages[vk]) {
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
            Game.syncGold();
            p.hp = p.maxHp;
            p.mp = p.maxMp;
            Game.log(`Odpoczynek w karczmie. Pełne HP i MP! (-${cost}zł)`, 'heal');
            GameRender.updateHUD();
        } else {
            Game.log(`Za mało złota na odpoczynek (${cost}zł).`, 'info');
        }
        return;
    }
};

// Try to pick up ONE item: first under player, then surrounding tiles
GameInput.tryPickupOneItem = function() {
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
};

// Pick up exactly ONE item from a specific position
GameInput.pickupOneItemAt = function(wx, wy) {
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
};

GameInput.useSkillByIndex = function(idx) {
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
};

GameInput.checkCollectQuest = function() {
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
};
