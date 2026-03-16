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

// ========== STARTER ISLAND QUEST SYSTEM ==========
GameInput.handleStarterIslandQuestNpc = function() {
    const p = Game.player;
    if (!Game.starterIslandQuests) Game.starterIslandQuests = {};
    const siQuests = STARTER_ISLAND.quests;

    // Find next available quest
    let activeQuest = null;
    let nextQuest = null;
    for (const q of siQuests) {
        const state = Game.starterIslandQuests[q.id];
        if (state === 'turned_in') continue;
        if (state === 'active') { activeQuest = q; break; }
        if (!state && p.level >= q.minLevel) { nextQuest = q; break; }
    }

    if (activeQuest) {
        const state = Game.starterIslandQuests[activeQuest.id];
        const progress = Game.starterIslandQuests[activeQuest.id + '_progress'] || 0;
        const needed = activeQuest.count;
        let completed = false;

        if (activeQuest.type === 'kill') {
            completed = progress >= needed;
        } else if (activeQuest.type === 'level') {
            completed = p.level >= needed;
        }

        if (completed) {
            Game.starterIslandQuests[activeQuest.id] = 'turned_in';
            p.gold += activeQuest.gold;
            if (activeQuest.xp > 0) Game.addXp(activeQuest.xp);
            Game.log(`Stary Rybak: Świetna robota! Quest "${activeQuest.title}" ukończony!`, 'loot');
            Game.log(`+${activeQuest.gold}zł${activeQuest.xp ? ', +' + activeQuest.xp + ' XP' : ''}`, 'loot');
            GameRender.updateHUD();
        } else {
            if (activeQuest.type === 'kill') {
                Game.log(`Stary Rybak: Quest "${activeQuest.title}" - ${progress}/${needed}`, 'info');
            } else {
                Game.log(`Stary Rybak: ${activeQuest.desc} (Lv.${p.level}/${needed})`, 'info');
            }
        }
    } else if (nextQuest) {
        Game.starterIslandQuests[nextQuest.id] = 'active';
        Game.starterIslandQuests[nextQuest.id + '_progress'] = 0;
        Game.log(`Stary Rybak: Mam dla ciebie zadanie!`, 'info');
        Game.log(`Nowy quest: ${nextQuest.title} - ${nextQuest.desc}`, 'info');
    } else {
        const allDone = siQuests.every(q => Game.starterIslandQuests[q.id] === 'turned_in');
        if (allDone) {
            Game.log('Stary Rybak: Ukończyłeś wszystkie zadania! Porozmawiaj z Kapitanem.', 'info');
        } else {
            const next = siQuests.find(q => !Game.starterIslandQuests[q.id] && p.level < q.minLevel);
            if (next) {
                Game.log(`Stary Rybak: Wróć na poziomie ${next.minLevel}, mam więcej zadań!`, 'info');
            } else {
                Game.log('Stary Rybak: Trenuj dalej, podróżniku!', 'info');
            }
        }
    }
};
