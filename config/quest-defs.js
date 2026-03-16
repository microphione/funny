// ============================================================
// QUEST DEFINITIONS - Starter island, main quests, daily quests
// Extracted from items.js. All quest-related data and generators.
// ============================================================

// ========== STARTER ISLAND ==========
// Starter island config: small island for levels 1-20, no class choice
const STARTER_ISLAND = {
    // Island center in world coords (chunk 8,8 = tile 160,160)
    cx: 8, cy: 8,
    radius: 25, // island radius in tiles
    monsters: [
        { name: 'Szczur',         sprite: 'slime',    hp: 12, atk: 2,  armor: 0,  xp: 5,  gold: [1,3],  minDiff: 1, maxDiff: 5 },
        { name: 'Krab',           sprite: 'beetle',   hp: 18, atk: 3,  armor: 2,  xp: 8,  gold: [1,4],  minDiff: 1, maxDiff: 8 },
        { name: 'Meduza',         sprite: 'ghost',    hp: 15, atk: 5,  armor: 0,  xp: 10, gold: [2,5],  minDiff: 2, maxDiff: 10 },
        { name: 'Dziki Królik',   sprite: 'wolf',     hp: 22, atk: 4,  armor: 1,  xp: 12, gold: [2,6],  minDiff: 2, maxDiff: 12 },
        { name: 'Bies Plażowy',   sprite: 'goblin',   hp: 30, atk: 6,  armor: 3,  xp: 18, gold: [3,8],  minDiff: 4, maxDiff: 14 },
        { name: 'Pirat',          sprite: 'bandit',   hp: 40, atk: 8,  armor: 4,  xp: 25, gold: [5,12], minDiff: 6, maxDiff: 18 },
        { name: 'Kapitan Piratów',sprite: 'dark_knight', hp: 65, atk: 12, armor: 6, xp: 45, gold: [10,20], minDiff: 10, maxDiff: 20 },
    ],
    quests: [
        { id: 'si_q1', title: 'Pierwsze Kroki', desc: 'Zabij 3 Szczury.', type: 'kill', target: 'Szczur', count: 3, xp: 20, gold: 10, minLevel: 1 },
        { id: 'si_q2', title: 'Obrona Plaży', desc: 'Zabij 5 Krabów.', type: 'kill', target: 'Krab', count: 5, xp: 35, gold: 15, minLevel: 3 },
        { id: 'si_q3', title: 'Morski Koszmar', desc: 'Zabij 5 Meduz.', type: 'kill', target: 'Meduza', count: 5, xp: 50, gold: 20, minLevel: 5 },
        { id: 'si_q4', title: 'Polowanie', desc: 'Zabij 8 Dzikich Królików.', type: 'kill', target: 'Dziki Królik', count: 8, xp: 70, gold: 30, minLevel: 7 },
        { id: 'si_q5', title: 'Zagrożenie Wyspy', desc: 'Zabij 6 Biesów Plażowych.', type: 'kill', target: 'Bies Plażowy', count: 6, xp: 100, gold: 45, minLevel: 9 },
        { id: 'si_q6', title: 'Piraci!', desc: 'Zabij 8 Piratów.', type: 'kill', target: 'Pirat', count: 8, xp: 150, gold: 60, minLevel: 12 },
        { id: 'si_q7', title: 'Kapitan', desc: 'Pokonaj Kapitana Piratów.', type: 'kill', target: 'Kapitan Piratów', count: 1, xp: 250, gold: 100, minLevel: 16 },
        { id: 'si_q8', title: 'Gotowy na Świat', desc: 'Osiągnij poziom 20.', type: 'level', count: 20, xp: 0, gold: 200, minLevel: 18 },
    ],
};

// ========== LEVEL-GATED UNIQUE QUESTS (one-time, from quest boards in cities) ==========
const MAIN_QUESTS = [
    // Early game (20-30)
    { id: 'mq_wolves', title: 'Wilcze Zagrożenie', desc: 'Zabij 15 Wilków w okolicach Stolicy.', type: 'kill', target: 'Wilk', count: 15, xp: 300, gold: 80, minLevel: 20 },
    { id: 'mq_goblins', title: 'Goblinowy Problem', desc: 'Zabij 20 Goblinów.', type: 'kill', target: 'Goblin', count: 20, xp: 500, gold: 120, minLevel: 22 },
    { id: 'mq_explore1', title: 'Odkrywca Lasu', desc: 'Odwiedź Leśny Gród.', type: 'visit_city', target: 'Leśny Gród', count: 1, xp: 400, gold: 100, minLevel: 25 },
    { id: 'mq_spiders', title: 'Pajęcze Gniazdo', desc: 'Zabij 15 Pająków.', type: 'kill', target: 'Pająk', count: 15, xp: 600, gold: 150, minLevel: 28 },
    // Mid game (30-50)
    { id: 'mq_bandits', title: 'Bandyci na Szlaku', desc: 'Zabij 25 Bandytów.', type: 'kill', target: 'Bandyta', count: 25, xp: 800, gold: 200, minLevel: 30 },
    { id: 'mq_explore2', title: 'Port Morski', desc: 'Odwiedź Port Morski.', type: 'visit_city', target: 'Port Morski', count: 1, xp: 600, gold: 200, minLevel: 32 },
    { id: 'mq_orks', title: 'Orkowy Najazd', desc: 'Zabij 20 Orków.', type: 'kill', target: 'Ork', count: 20, xp: 1200, gold: 300, minLevel: 35 },
    { id: 'mq_dungeon1', title: 'Jaskinia Goblinów', desc: 'Pokonaj bossa Jaskini Goblinów.', type: 'dungeon', target: 'goblin_cave', count: 1, xp: 1500, gold: 400, minLevel: 38 },
    { id: 'mq_explore3', title: 'Górska Twierdza', desc: 'Odwiedź Górską Twierdzę.', type: 'visit_city', target: 'Górska Twierdza', count: 1, xp: 800, gold: 250, minLevel: 40 },
    { id: 'mq_trolls', title: 'Trolle pod Mostem', desc: 'Zabij 15 Trolli.', type: 'kill', target: 'Troll', count: 15, xp: 1800, gold: 500, minLevel: 45 },
    // Late game (50-70)
    { id: 'mq_explore4', title: 'Pustynny Bazar', desc: 'Odwiedź Pustynny Bazar.', type: 'visit_city', target: 'Pustynny Bazar', count: 1, xp: 1200, gold: 400, minLevel: 50 },
    { id: 'mq_golems', title: 'Kamienny Strażnik', desc: 'Zabij 10 Golemów.', type: 'kill', target: 'Golem', count: 10, xp: 2500, gold: 600, minLevel: 55 },
    { id: 'mq_dungeon2', title: 'Krypta Nieumarłych', desc: 'Pokonaj bossa Krypty Nieumarłych.', type: 'dungeon', target: 'undead_crypt', count: 1, xp: 3000, gold: 800, minLevel: 58 },
    { id: 'mq_demons', title: 'Demon Piasków', desc: 'Zabij 8 Demonów Piasków.', type: 'kill', target: 'Demon Piasków', count: 8, xp: 3500, gold: 900, minLevel: 62 },
    // Endgame (70-100)
    { id: 'mq_explore5', title: 'Mroźna Cytadela', desc: 'Odwiedź Mroźną Cytadelę.', type: 'visit_city', target: 'Mroźna Cytadela', count: 1, xp: 2000, gold: 600, minLevel: 70 },
    { id: 'mq_wyrms', title: 'Polowanie na Wyrmy', desc: 'Zabij 10 Mroźnych Wyrmów.', type: 'kill', target: 'Mroźny Wyrm', count: 10, xp: 5000, gold: 1200, minLevel: 75 },
    { id: 'mq_dungeon3', title: 'Gniazdo Pająków', desc: 'Pokonaj bossa Gniazda Pająków.', type: 'dungeon', target: 'spider_nest', count: 1, xp: 6000, gold: 1500, minLevel: 80 },
    { id: 'mq_dragons', title: 'Smocze Wyzwanie', desc: 'Zabij 5 Młodych Smoków.', type: 'kill', target: 'Smok Młody', count: 5, xp: 8000, gold: 2000, minLevel: 85 },
    { id: 'mq_dungeon4', title: 'Smocza Jama', desc: 'Pokonaj bossa Smoczej Jamy.', type: 'dungeon', target: 'dragon_lair', count: 1, xp: 10000, gold: 3000, minLevel: 90 },
    { id: 'mq_final', title: 'Władca Cieni', desc: 'Pokonaj Władcę Cieni i uratuj świat!', type: 'dungeon', target: 'shadow_realm', count: 1, xp: 20000, gold: 5000, minLevel: 95 },
];

// ========== DAILY QUESTS (repeatable, level-scaled) ==========
const DAILY_QUEST_TEMPLATES = [
    { id: 'dq_kill', title: 'Łowca Dnia', type: 'kill_any', desc: 'Zabij {count} potworów.', baseCount: 10, countPerLevel: 1, xpMult: 0.5, goldMult: 0.3 },
    { id: 'dq_elite', title: 'Elitarny Łowca', type: 'kill_elite', desc: 'Zabij {count} elitarnych potworów.', baseCount: 2, countPerLevel: 0.1, xpMult: 1.0, goldMult: 0.5 },
    { id: 'dq_explore', title: 'Odkrywca', type: 'explore', desc: 'Odkryj {count} nowych obszarów.', baseCount: 3, countPerLevel: 0.1, xpMult: 0.4, goldMult: 0.2 },
];

function generateDailyQuest(playerLevel) {
    const template = DAILY_QUEST_TEMPLATES[Math.floor(Math.random() * DAILY_QUEST_TEMPLATES.length)];
    const count = Math.floor(template.baseCount + playerLevel * template.countPerLevel);
    const xp = Math.floor(xpToNextLevel(playerLevel) * template.xpMult * 0.1);
    const gold = Math.floor(playerLevel * 10 * template.goldMult);
    return {
        id: `daily_${template.id}_${Date.now()}`,
        title: template.title,
        desc: template.desc.replace('{count}', count),
        type: template.type,
        count,
        required: count,
        progress: 0,
        xp, gold,
        isDaily: true,
        completed: false,
        turned_in: false,
    };
}
