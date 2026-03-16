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

// ========== STARTER ISLAND QUEST SYSTEM (Per-NPC) ==========
GameInput.handleStarterIslandQuestNpc = function(npcName) {
    const p = Game.player;
    if (!Game.starterIslandQuests) Game.starterIslandQuests = {};
    const siQuests = STARTER_ISLAND.quests;

    // Find quests assigned to this NPC
    const npcQuests = siQuests.filter(q => q.npc === npcName);
    if (npcQuests.length === 0) {
        // NPC has no quests - generic dialogue
        const greetings = [
            `${npcName}: Witaj, podróżniku!`,
            `${npcName}: Miło cię widzieć!`,
            `${npcName}: Powodzenia w przygodach!`,
        ];
        Game.log(greetings[Math.floor(Math.random() * greetings.length)], 'info');
        return;
    }

    // Check for active quest from this NPC that can be turned in
    for (const q of npcQuests) {
        const state = Game.starterIslandQuests[q.id];
        if (state !== 'active') continue;

        const progress = Game.starterIslandQuests[q.id + '_progress'] || 0;
        const needed = q.count;
        let completed = false;

        if (q.type === 'kill') completed = progress >= needed;
        else if (q.type === 'level') completed = p.level >= needed;
        else if (q.type === 'collect') completed = progress >= needed;
        else if (q.type === 'dungeon') completed = Game.dungeonBossesKilled && Game.dungeonBossesKilled.has(q.target);

        if (completed) {
            Game.starterIslandQuests[q.id] = 'turned_in';
            p.gold += q.gold;
            Game.syncGold();
            if (q.xp > 0) Game.addXp(q.xp);
            Game.log(`${npcName}: Świetna robota! Quest "${q.title}" ukończony!`, 'loot');
            Game.log(`+${q.gold}zł${q.xp ? ', +' + q.xp + ' XP' : ''}`, 'loot');
            GameRender.updateHUD();
            return;
        } else {
            if (q.type === 'kill') {
                Game.log(`${npcName}: Quest "${q.title}" - ${progress}/${needed}`, 'info');
            } else if (q.type === 'level') {
                Game.log(`${npcName}: ${q.desc} (Lv.${p.level}/${needed})`, 'info');
            } else if (q.type === 'collect') {
                Game.log(`${npcName}: Quest "${q.title}" - ${progress}/${needed}`, 'info');
            } else if (q.type === 'dungeon') {
                Game.log(`${npcName}: ${q.desc} (w toku)`, 'info');
            }
            return;
        }
    }

    // Find next available quest from this NPC
    const nextQuest = npcQuests.find(q => {
        const state = Game.starterIslandQuests[q.id];
        return !state && p.level >= q.minLevel;
    });

    if (nextQuest) {
        Game.starterIslandQuests[nextQuest.id] = 'active';
        Game.starterIslandQuests[nextQuest.id + '_progress'] = 0;

        // For dungeon quests, check if already completed
        if (nextQuest.type === 'dungeon' && Game.dungeonBossesKilled && Game.dungeonBossesKilled.has(nextQuest.target)) {
            Game.starterIslandQuests[nextQuest.id + '_progress'] = 1;
        }

        Game.log(`${npcName}: Mam dla ciebie zadanie!`, 'info');
        Game.log(`Nowy quest: ${nextQuest.title} - ${nextQuest.desc}`, 'info');

        // Spawn collect items if needed
        if (nextQuest.type === 'collect') {
            const q = { ...nextQuest, progress: 0, required: nextQuest.count, completed: false, turned_in: false, reward: { gold: nextQuest.gold, xp: nextQuest.xp } };
            Game.quests.push(q);
            World.spawnQuestItems(q);
        }
        return;
    }

    // All quests from this NPC done or locked
    const allDone = npcQuests.every(q => Game.starterIslandQuests[q.id] === 'turned_in');
    if (allDone) {
        Game.log(`${npcName}: Dziękuję za pomoc! Nie mam więcej zadań.`, 'info');
    } else {
        const locked = npcQuests.find(q => !Game.starterIslandQuests[q.id] && p.level < q.minLevel);
        if (locked) {
            Game.log(`${npcName}: Wróć na poziomie ${locked.minLevel}, będę mieć zadanie!`, 'info');
        } else {
            Game.log(`${npcName}: Witaj, podróżniku!`, 'info');
        }
    }
};
