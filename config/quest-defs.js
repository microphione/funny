// ============================================================
// QUEST DEFINITIONS - Starter island, main quests, daily quests
// Extracted from items.js. All quest-related data and generators.
// ============================================================

// ========== STARTER ISLAND ==========
// Starter island config: large island for levels 1-20
const STARTER_ISLAND = {
    // Island center in world coords (chunk 20,20 = tile 400,400)
    cx: 20, cy: 20,
    radius: 400, // island radius in tiles (800x800)

    // Zone definitions for different areas of the island
    zones: {
        town_stairs: { x: 0, y: 0, radius: 3 },        // Center - stairs to town on +1
        beach_south: { x: 0, y: 250, radius: 120 },     // Southern beach
        forest_east: { x: 200, y: -50, radius: 150 },   // Eastern forest
        swamp_nw: { x: -200, y: -150, radius: 120 },    // Northwest swamp
        ruins_north: { x: 0, y: -250, radius: 100 },    // Northern ruins
        pirate_bay: { x: -200, y: 200, radius: 100 },   // Southwest pirate bay
        druid_clearing: { x: 150, y: 150, radius: 40 }, // Southeast druid area
        lighthouse: { x: -300, y: 0, radius: 30 },      // Western lighthouse
        port: { x: 0, y: 300, radius: 40 },             // Southern port
        mine_entrance: { x: 250, y: -200, radius: 20 }, // Mine dungeon entrance
        crab_cave: { x: 100, y: 280, radius: 15 },      // Mini dungeon under beach
        pirate_tunnel: { x: -250, y: 250, radius: 15 }, // Pirate mini dungeon
        crypt_entrance: { x: 50, y: -280, radius: 15 }, // Crypt dungeon entrance
    },

    monsters: [
        // Beach (lv 1-4)
        { name: 'Krab',           sprite: 'beetle',     hp: 15, atk: 2,  armor: 2,  xp: 6,  gold: [1,3],  minDiff: 1, maxDiff: 5,  zone: 'beach' },
        { name: 'Meduza',         sprite: 'ghost',      hp: 12, atk: 4,  armor: 0,  xp: 8,  gold: [1,4],  minDiff: 1, maxDiff: 6,  zone: 'beach' },
        { name: 'Szczur',         sprite: 'slime',      hp: 10, atk: 2,  armor: 0,  xp: 4,  gold: [1,2],  minDiff: 1, maxDiff: 4,  zone: 'any' },
        // Forest (lv 4-10)
        { name: 'Wilk',           sprite: 'wolf',       hp: 28, atk: 6,  armor: 2,  xp: 15, gold: [2,6],  minDiff: 3, maxDiff: 10, zone: 'forest' },
        { name: 'Pająk',          sprite: 'spider',     hp: 22, atk: 8,  armor: 1,  xp: 12, gold: [2,5],  minDiff: 3, maxDiff: 9,  zone: 'forest' },
        { name: 'Bandyta',        sprite: 'bandit',     hp: 35, atk: 7,  armor: 3,  xp: 18, gold: [4,10], minDiff: 4, maxDiff: 12, zone: 'forest' },
        // Swamp (lv 6-12)
        { name: 'Żaba Trująca',   sprite: 'slime',      hp: 25, atk: 5,  armor: 1,  xp: 14, gold: [2,6],  minDiff: 4, maxDiff: 10, zone: 'swamp' },
        { name: 'Wąż Jadowity',   sprite: 'spider',     hp: 30, atk: 9,  armor: 2,  xp: 20, gold: [3,8],  minDiff: 5, maxDiff: 12, zone: 'swamp' },
        { name: 'Duch Bagna',     sprite: 'ghost',      hp: 35, atk: 11, armor: 0,  xp: 25, gold: [4,10], minDiff: 6, maxDiff: 14, zone: 'swamp' },
        // Pirates (lv 6-12)
        { name: 'Pirat',          sprite: 'bandit',     hp: 38, atk: 8,  armor: 4,  xp: 22, gold: [5,12], minDiff: 5, maxDiff: 14, zone: 'pirate' },
        { name: 'Pirat Kapitan',  sprite: 'dark_knight',hp: 60, atk: 12, armor: 6,  xp: 40, gold: [8,18], minDiff: 8, maxDiff: 18, zone: 'pirate' },
        // Ruins (lv 10-18)
        { name: 'Szkielet',       sprite: 'skeleton',   hp: 40, atk: 10, armor: 5,  xp: 28, gold: [4,12], minDiff: 7, maxDiff: 16, zone: 'ruins' },
        { name: 'Golem Kamienny', sprite: 'golem',      hp: 65, atk: 14, armor: 10, xp: 45, gold: [8,18], minDiff: 10, maxDiff: 20, zone: 'ruins' },
        { name: 'Ożywiona Zbroja',sprite: 'dark_knight',hp: 55, atk: 16, armor: 8,  xp: 50, gold: [10,22],minDiff: 12, maxDiff: 20, zone: 'ruins' },
        // General (scaling)
        { name: 'Dziki Królik',   sprite: 'wolf',       hp: 18, atk: 3,  armor: 1,  xp: 8,  gold: [1,4],  minDiff: 1, maxDiff: 8,  zone: 'any' },
        { name: 'Nietoperz',      sprite: 'ghost',      hp: 14, atk: 5,  armor: 0,  xp: 10, gold: [1,3],  minDiff: 2, maxDiff: 8,  zone: 'cave' },
    ],

    // Starter island dungeon definitions
    dungeons: [
        { id: 'si_crab_cave', name: 'Grota Krabów', monsters: ['beetle','slime'], boss: { name: 'Krabowy Patriarcha', sprite: 'beetle', hpMult: 6, atkMult: 2, defMult: 2, xpMult: 8, goldMult: 10 }, floors: 2, biome: 'cave', minLevel: 3 },
        { id: 'si_pirate_tunnel', name: 'Tunele Piratów', monsters: ['bandit','skeleton'], boss: { name: 'Piracki Skarbnik', sprite: 'bandit', hpMult: 7, atkMult: 3, defMult: 2, xpMult: 10, goldMult: 15 }, floors: 2, biome: 'cave', minLevel: 8 },
        { id: 'si_crypt', name: 'Krypta pod Ruinami', monsters: ['skeleton','ghost'], boss: { name: 'Strażnik Krypty', sprite: 'dark_knight', hpMult: 10, atkMult: 4, defMult: 3, xpMult: 15, goldMult: 20 }, floors: 3, biome: 'crypt', minLevel: 12 },
        { id: 'si_mine', name: 'Kopalnia Krasnoludów', monsters: ['golem','skeleton'], boss: { name: 'Kamienny Król', sprite: 'golem', hpMult: 12, atkMult: 4, defMult: 5, xpMult: 18, goldMult: 25 }, floors: 4, biome: 'cave', minLevel: 15 },
    ],

    quests: [
        // Quest NPC quests - assigned to specific NPCs in the town
        { id: 'si_rybak', title: 'Pierwsza Przysługa', desc: 'Zabij 8 Krabów na plaży dla Rybaka.', type: 'kill', target: 'Krab', count: 8, xp: 30, gold: 15, minLevel: 1, npc: 'Rybak' },
        { id: 'si_straznik', title: 'Obrona Dróg', desc: 'Zabij 10 Wilków zagrażających leśnej drodze.', type: 'kill', target: 'Wilk', count: 10, xp: 60, gold: 30, minLevel: 4, npc: 'Strażnik' },
        { id: 'si_zielarka', title: 'Zioła z Bagna', desc: 'Zbierz 5 Ziół Bagiennych w bagnie na północnym zachodzie.', type: 'collect', target: 'Zioło Bagienne', count: 5, xp: 50, gold: 25, minLevel: 3, npc: 'Zielarka' },
        { id: 'si_zona_ziel', title: 'Rzadki Kwiat', desc: 'Znajdź Kwiat Polany w Lesie Szeptów.', type: 'collect', target: 'Kwiat Polany', count: 1, xp: 45, gold: 20, minLevel: 5, npc: 'Żona Zielarki' },
        { id: 'si_kowal', title: 'Ruda z Kopalni', desc: 'Przynieś 10 Rud Żelaza z Kopalni Krasnoludów.', type: 'collect', target: 'Ruda Żelaza', count: 10, xp: 100, gold: 60, minLevel: 8, npc: 'Kowal' },
        { id: 'si_burmistrz1', title: 'Zagrożenie Pirackie', desc: 'Zabij 8 Piratów w Pirackiej Zatoce.', type: 'kill', target: 'Pirat', count: 8, xp: 80, gold: 40, minLevel: 6, npc: 'Burmistrz' },
        { id: 'si_burmistrz2', title: 'Kapitan Piratów', desc: 'Pokonaj Kapitana Piratów.', type: 'kill', target: 'Pirat Kapitan', count: 1, xp: 150, gold: 80, minLevel: 10, npc: 'Burmistrz' },
        { id: 'si_kaplan', title: 'Oczyść Kryptę', desc: 'Pokonaj bossa Krypty pod Ruinami.', type: 'dungeon', target: 'si_crypt', count: 1, xp: 200, gold: 100, minLevel: 12, npc: 'Kapłan' },
        { id: 'si_kupiec', title: 'Odzyskaj Towary', desc: 'Zabij 6 Bandytów i odzyskaj skradziony towar.', type: 'kill', target: 'Bandyta', count: 6, xp: 70, gold: 35, minLevel: 5, npc: 'Kupiec' },
        { id: 'si_uczony', title: 'Tajemnice Ruin', desc: 'Zbadaj Ruiny na północy i przynieś Artefakt Starożytnych.', type: 'collect', target: 'Artefakt Starożytnych', count: 1, xp: 120, gold: 60, minLevel: 10, npc: 'Uczony' },
        { id: 'si_druid', title: 'Oczyść Bagno', desc: 'Zabij 8 Duchów Bagna.', type: 'kill', target: 'Duch Bagna', count: 8, xp: 100, gold: 50, minLevel: 8, npc: 'Druid' },
        { id: 'si_zeglarz', title: 'Piracki Skarb', desc: 'Znajdź Mapę Skarbów w Tunelach Piratów.', type: 'collect', target: 'Mapa Skarbów', count: 1, xp: 90, gold: 45, minLevel: 9, npc: 'Stary Żeglarz' },
        { id: 'si_karczmarka', title: 'Prowiant', desc: 'Przynieś 5 Mięs z polowania na zwierzęta.', type: 'collect', target: 'Mięso', count: 5, xp: 40, gold: 20, minLevel: 2, npc: 'Karczmarka' },
        { id: 'si_kapitan', title: 'Gotowy na Świat', desc: 'Osiągnij poziom 20 aby opuścić wyspę.', type: 'level', count: 20, xp: 0, gold: 200, minLevel: 18, npc: 'Kapitan Statku' },
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
