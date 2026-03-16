// ============================================================
// GAME INPUT - Quest board handlers
// Adds methods to GameInput (defined in keyboard.js)
// ============================================================

// ========== QUEST BOARD (level-gated main quests) ==========
GameInput.handleQuestBoard = function() {
    const p = Game.player;
    // Find next available quest for player level
    const available = MAIN_QUESTS.filter(q => {
        if (p.level < q.minLevel) return false;
        const existing = Game.quests.find(e => e.id === q.id);
        if (existing) return false; // already taken or completed
        return true;
    });

    if (available.length === 0) {
        const nextQuest = MAIN_QUESTS.find(q => !Game.quests.find(e => e.id === q.id) && p.level < q.minLevel);
        if (nextQuest) {
            Game.log(`Tablica Questów: Następny quest od poziomu ${nextQuest.minLevel}.`, 'info');
        } else {
            Game.log('Tablica Questów: Brak dostępnych questów!', 'info');
        }
        return;
    }

    // Check for completed quests to turn in
    for (const q of Game.quests) {
        if (q.completed && !q.turned_in && MAIN_QUESTS.find(m => m.id === q.id)) {
            q.turned_in = true;
            p.gold += q.gold;
            Game.syncGold();
            Game.addXp(q.xp);
            Game.log(`Quest "${q.title}" oddany! +${q.gold}zł, +${q.xp} XP`, 'loot');
            GameRender.updateHUD();
            return;
        }
    }

    // Give the first available quest
    const quest = available[0];
    const q = {
        ...quest,
        progress: 0,
        required: quest.count,
        completed: false,
        turned_in: false,
        reward: { gold: quest.gold, xp: quest.xp },
    };

    // Check dungeon/visit quests auto-completion
    if (q.type === 'dungeon') {
        q.progress = Game.dungeonBossesKilled.has(q.target) ? 1 : 0;
        if (q.progress >= q.required) q.completed = true;
    }
    if (q.type === 'visit_city') {
        const city = World.CITIES.find(c => c.name === q.target);
        if (city && Game.usedWells.has(World.getChunkKey(city.cx, city.cy))) {
            q.progress = 1;
            q.completed = true;
        }
    }

    Game.quests.push(q);
    Game.log(`Nowy quest: ${q.title} - ${q.desc}`, 'info');
};

// ========== DAILY QUEST BOARD ==========
GameInput.handleDailyQuestBoard = function() {
    const p = Game.player;
    if (p.level < 20) {
        Game.log('Zleceniodawca: Wróć na poziomie 20!', 'info');
        return;
    }

    // Check if player already has an active daily quest
    const activeDaily = Game.quests.find(q => q.isDaily && !q.turned_in);
    if (activeDaily) {
        if (activeDaily.completed) {
            activeDaily.turned_in = true;
            p.gold += activeDaily.gold;
            Game.syncGold();
            Game.addXp(activeDaily.xp);
            Game.log(`Dzienny quest oddany! +${activeDaily.gold}zł, +${activeDaily.xp} XP`, 'loot');
            GameRender.updateHUD();
        } else {
            Game.log(`Dzienny quest w toku: ${activeDaily.progress}/${activeDaily.required}`, 'info');
        }
        return;
    }

    // Generate new daily quest
    const daily = generateDailyQuest(p.level);
    Game.quests.push(daily);
    Game.log(`Nowy dzienny quest: ${daily.title} - ${daily.desc}`, 'info');
};

// ========== STARTER ISLAND QUEST SYSTEM (Per-NPC, Chain Quests) ==========

// Check if a single step objective is complete
GameInput._isStepComplete = function(step) {
    const p = Game.player;
    const siq = Game.starterIslandQuests;
    const stepKey = siq._currentQuestId + '_progress';
    const progress = siq[stepKey] || 0;

    switch (step.type) {
        case 'kill': return progress >= step.count;
        case 'collect': return progress >= step.count;
        case 'visit': return !!siq[siq._currentQuestId + '_visited_' + step.target];
        case 'dungeon': return Game.dungeonBossesKilled && Game.dungeonBossesKilled.has(step.target);
        case 'level': return p.level >= step.count;
        default: return false;
    }
};

// Get step progress description
GameInput._stepProgressText = function(step) {
    const siq = Game.starterIslandQuests;
    const progress = siq[siq._currentQuestId + '_progress'] || 0;

    switch (step.type) {
        case 'kill': return `${progress}/${step.count}`;
        case 'collect': return `${progress}/${step.count}`;
        case 'visit': return siq[siq._currentQuestId + '_visited_' + step.target] ? 'Gotowe' : 'Nie odwiedzono';
        case 'dungeon': return (Game.dungeonBossesKilled && Game.dungeonBossesKilled.has(step.target)) ? 'Gotowe' : 'Nie ukończono';
        case 'level': return `Lv.${Game.player.level}/${step.count}`;
        default: return '';
    }
};

// Spawn collect items for a chain step at the quest's targetZone
GameInput._spawnChainCollectItems = function(quest, step) {
    const ic = World.getIslandCenter();
    const zone = STARTER_ISLAND.zones[quest.targetZone];
    let targetX, targetY;
    if (zone) {
        targetX = ic.x + zone.x;
        targetY = ic.y + zone.y;
    } else {
        targetX = ic.x;
        targetY = ic.y;
    }
    const fakeQuest = {
        id: quest.id, type: 'collect',
        required: step.count,
        itemName: step.target,
        targetX, targetY,
    };
    World.spawnQuestItems(fakeQuest);
};

GameInput.handleStarterIslandQuestNpc = function(npcName) {
    const p = Game.player;
    if (!Game.starterIslandQuests) Game.starterIslandQuests = {};
    const siq = Game.starterIslandQuests;
    const siQuests = STARTER_ISLAND.quests;

    // Find quests assigned to this NPC
    const npcQuests = siQuests.filter(q => q.npc === npcName);
    if (npcQuests.length === 0) {
        const greetings = [
            `${npcName}: Witaj, podróżniku!`,
            `${npcName}: Miło cię widzieć!`,
            `${npcName}: Powodzenia w przygodach!`,
        ];
        Game.log(greetings[Math.floor(Math.random() * greetings.length)], 'info');
        return;
    }

    // Check for active quest from this NPC
    for (const q of npcQuests) {
        if (siq[q.id] !== 'active') continue;

        // ===== CHAIN QUEST =====
        if (q.type === 'chain') {
            const stepIdx = siq[q.id + '_step'] || 0;
            const step = q.steps[stepIdx];
            siq._currentQuestId = q.id;

            if (!step) {
                // All steps done - turn in
                siq[q.id] = 'turned_in';
                p.gold += q.gold;
                Game.syncGold();
                if (q.xp > 0) Game.addXp(q.xp);
                Game.log(`${npcName}: Wspaniale! Quest "${q.title}" ukończony!`, 'loot');
                Game.log(`+${q.gold}zł${q.xp ? ', +' + q.xp + ' XP' : ''}`, 'loot');
                GameRender.updateHUD();
                return;
            }

            if (this._isStepComplete(step)) {
                // Advance to next step
                const nextIdx = stepIdx + 1;
                siq[q.id + '_step'] = nextIdx;
                siq[q.id + '_progress'] = 0; // Reset progress for next step

                if (nextIdx >= q.steps.length) {
                    // All steps complete - turn in
                    siq[q.id] = 'turned_in';
                    p.gold += q.gold;
                    Game.syncGold();
                    if (q.xp > 0) Game.addXp(q.xp);
                    Game.log(`${npcName}: Wspaniale! Quest "${q.title}" ukończony!`, 'loot');
                    Game.log(`+${q.gold}zł${q.xp ? ', +' + q.xp + ' XP' : ''}`, 'loot');
                    GameRender.updateHUD();
                } else {
                    const nextStep = q.steps[nextIdx];
                    Game.log(`${npcName}: Świetnie! Etap ${stepIdx + 1} ukończony.`, 'info');
                    Game.log(`Następny etap: ${nextStep.desc}`, 'info');
                    // Auto-check visit/dungeon for new step
                    siq._currentQuestId = q.id;
                    if (nextStep.type === 'dungeon' && Game.dungeonBossesKilled && Game.dungeonBossesKilled.has(nextStep.target)) {
                        siq[q.id + '_progress'] = 1;
                    }
                    if (nextStep.type === 'collect') {
                        this._spawnChainCollectItems(q, nextStep);
                    }
                }
                return;
            } else {
                // Show current step progress
                Game.log(`${npcName}: Quest "${q.title}" - Etap ${stepIdx + 1}/${q.steps.length}`, 'info');
                Game.log(`${step.desc} (${this._stepProgressText(step)})`, 'info');
                return;
            }
        }

        // ===== SIMPLE QUEST TYPES =====
        const progress = siq[q.id + '_progress'] || 0;
        const needed = q.count;
        let completed = false;

        if (q.type === 'kill') completed = progress >= needed;
        else if (q.type === 'level') completed = p.level >= needed;
        else if (q.type === 'collect') completed = progress >= needed;
        else if (q.type === 'dungeon') completed = Game.dungeonBossesKilled && Game.dungeonBossesKilled.has(q.target);
        else if (q.type === 'visit') completed = !!siq[q.id + '_visited_' + q.target];

        if (completed) {
            siq[q.id] = 'turned_in';
            p.gold += q.gold;
            Game.syncGold();
            if (q.xp > 0) Game.addXp(q.xp);
            Game.log(`${npcName}: Świetna robota! Quest "${q.title}" ukończony!`, 'loot');
            Game.log(`+${q.gold}zł${q.xp ? ', +' + q.xp + ' XP' : ''}`, 'loot');
            GameRender.updateHUD();
            return;
        } else {
            if (q.type === 'kill') Game.log(`${npcName}: "${q.title}" - ${progress}/${needed}`, 'info');
            else if (q.type === 'level') Game.log(`${npcName}: ${q.desc} (Lv.${p.level}/${needed})`, 'info');
            else if (q.type === 'collect') Game.log(`${npcName}: "${q.title}" - ${progress}/${needed}`, 'info');
            else if (q.type === 'dungeon') Game.log(`${npcName}: ${q.desc} (w toku)`, 'info');
            else if (q.type === 'visit') Game.log(`${npcName}: ${q.desc} (nie odwiedzono)`, 'info');
            return;
        }
    }

    // ===== FIND NEXT AVAILABLE QUEST =====
    const nextQuest = npcQuests.find(q => {
        if (siq[q.id]) return false; // already taken or done
        if (p.level < q.minLevel) return false;
        // Check prerequisites
        if (q.requires) {
            for (const reqId of q.requires) {
                if (siq[reqId] !== 'turned_in') return false;
            }
        }
        return true;
    });

    if (nextQuest) {
        siq[nextQuest.id] = 'active';
        siq[nextQuest.id + '_progress'] = 0;

        Game.log(`${npcName}: Mam dla ciebie zadanie!`, 'info');
        Game.log(`Nowy quest: ${nextQuest.title}`, 'info');

        if (nextQuest.type === 'chain') {
            siq[nextQuest.id + '_step'] = 0;
            const firstStep = nextQuest.steps[0];
            Game.log(`${nextQuest.desc}`, 'info');
            Game.log(`Etap 1: ${firstStep.desc}`, 'info');
            // Auto-check and spawn for first step
            siq._currentQuestId = nextQuest.id;
            if (firstStep.type === 'dungeon' && Game.dungeonBossesKilled && Game.dungeonBossesKilled.has(firstStep.target)) {
                siq[nextQuest.id + '_progress'] = 1;
            }
            if (firstStep.type === 'collect') {
                this._spawnChainCollectItems(nextQuest, firstStep);
            }
        } else {
            Game.log(`${nextQuest.desc}`, 'info');
            // Simple quest setup
            if (nextQuest.type === 'dungeon' && Game.dungeonBossesKilled && Game.dungeonBossesKilled.has(nextQuest.target)) {
                siq[nextQuest.id + '_progress'] = 1;
            }
            if (nextQuest.type === 'collect') {
                const ic = World.getIslandCenter();
                const zone = STARTER_ISLAND.zones[nextQuest.targetZone];
                let targetX = ic.x, targetY = ic.y;
                if (zone) { targetX = ic.x + zone.x; targetY = ic.y + zone.y; }
                const fakeQ = { id: nextQuest.id, type: 'collect', required: nextQuest.count, itemName: nextQuest.target, targetX, targetY };
                World.spawnQuestItems(fakeQ);
            }
        }
        return;
    }

    // ===== NO QUEST AVAILABLE =====
    const allDone = npcQuests.every(q => siq[q.id] === 'turned_in');
    if (allDone) {
        Game.log(`${npcName}: Dziękuję za pomoc! Nie mam więcej zadań.`, 'info');
    } else {
        // Check what's blocking
        const locked = npcQuests.find(q => {
            if (siq[q.id]) return false;
            if (p.level < q.minLevel) return true;
            if (q.requires && q.requires.some(r => siq[r] !== 'turned_in')) return true;
            return false;
        });
        if (locked) {
            if (p.level < locked.minLevel) {
                Game.log(`${npcName}: Wróć na poziomie ${locked.minLevel}, będę mieć zadanie!`, 'info');
            } else if (locked.requires) {
                const missingReq = locked.requires.find(r => siq[r] !== 'turned_in');
                const reqQuest = siQuests.find(q => q.id === missingReq);
                if (reqQuest) {
                    Game.log(`${npcName}: Najpierw pomóż ${reqQuest.npc || 'komuś innemu'}... Potem pogadamy.`, 'info');
                } else {
                    Game.log(`${npcName}: Jeszcze nie czas. Wróć później.`, 'info');
                }
            }
        } else {
            Game.log(`${npcName}: Witaj, podróżniku!`, 'info');
        }
    }
};
