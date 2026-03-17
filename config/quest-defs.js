// ============================================================
// QUEST DEFINITIONS - Starter island, main quests, daily quests
// Extracted from items.js. All quest-related data and generators.
// ============================================================

// ========== STARTER ISLAND ==========
// Starter island config: large island for levels 1-20
const STARTER_ISLAND = {
    // Island center in world coords (chunk 20,20 = tile 400,400)
    cx: 20, cy: 20,
    radius: 500, // island radius in tiles (1000x1000)

    // Zone definitions for different areas of the island
    zones: {
        town: { x: 0, y: 0, radius: 60 },                // Center - walled town 120x120
        beach_south: { x: 0, y: 312, radius: 150 },      // Southern beach
        forest_east: { x: 250, y: -62, radius: 188 },    // Eastern forest
        swamp_nw: { x: -250, y: -188, radius: 150 },     // Northwest swamp
        ruins_north: { x: 0, y: -312, radius: 125 },     // Northern ruins
        pirate_bay: { x: -250, y: 250, radius: 125 },    // Southwest pirate bay
        druid_clearing: { x: 188, y: 188, radius: 50 },  // Southeast druid area
        lighthouse: { x: -375, y: 0, radius: 38 },       // Western lighthouse
        port: { x: 0, y: 375, radius: 50 },              // Southern port
        mine_entrance: { x: 312, y: -250, radius: 20 },  // Mine dungeon entrance
        crab_cave: { x: 125, y: 350, radius: 15 },       // Mini dungeon under beach
        pirate_tunnel: { x: -312, y: 312, radius: 15 },  // Pirate mini dungeon
        crypt_entrance: { x: 62, y: -350, radius: 15 },  // Crypt dungeon entrance
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
        { name: 'Dziki Królik',   sprite: 'rabbit',       hp: 18, atk: 3,  armor: 1,  xp: 8,  gold: [1,4],  minDiff: 1, maxDiff: 8,  zone: 'any' },
        { name: 'Nietoperz',      sprite: 'ghost',      hp: 14, atk: 5,  armor: 0,  xp: 10, gold: [1,3],  minDiff: 2, maxDiff: 8,  zone: 'cave' },
    ],

    // Starter island dungeon definitions
    dungeons: [
        { id: 'si_crab_cave', name: 'Grota Krabów', monsters: ['beetle','slime'], boss: { name: 'Krabowy Patriarcha', sprite: 'beetle', hpMult: 6, atkMult: 2, defMult: 2, xpMult: 8, goldMult: 10 }, floors: 2, biome: 'cave', minLevel: 3 },
        { id: 'si_pirate_tunnel', name: 'Tunele Piratów', monsters: ['bandit','skeleton'], boss: { name: 'Piracki Skarbnik', sprite: 'bandit', hpMult: 7, atkMult: 3, defMult: 2, xpMult: 10, goldMult: 15 }, floors: 2, biome: 'cave', minLevel: 8 },
        { id: 'si_crypt', name: 'Krypta pod Ruinami', monsters: ['skeleton','ghost'], boss: { name: 'Strażnik Krypty', sprite: 'dark_knight', hpMult: 10, atkMult: 4, defMult: 3, xpMult: 15, goldMult: 20 }, floors: 3, biome: 'crypt', minLevel: 12 },
        { id: 'si_mine', name: 'Kopalnia Krasnoludów', monsters: ['golem','skeleton'], boss: { name: 'Kamienny Król', sprite: 'golem', hpMult: 12, atkMult: 4, defMult: 5, xpMult: 18, goldMult: 25 }, floors: 4, biome: 'cave', minLevel: 15 },
    ],

    // Quest system supports:
    //  type: 'kill'    - kill target monsters (count)
    //  type: 'collect' - gather items (count, spawned near targetZone)
    //  type: 'dungeon' - complete dungeon boss (target = dungeon id)
    //  type: 'visit'   - visit a zone on the island (target = zone name)
    //  type: 'level'   - reach a level (count)
    //  type: 'chain'   - multi-step quest with steps[] array
    //
    //  requires: ['quest_id'] - prerequisite quests (must be turned_in)
    //  steps[]: array of sub-objectives for chain quests, each step has its own type/target/count
    //
    // Chain quest step types: kill, collect, visit, dungeon
    // Chain quests track: _step (current index), _progress (progress in current step)

    quests: [
        // ===== PROSTE QUESTY (simple, early game) =====

        // Rybak - prosty quest na start
        { id: 'si_rybak1', title: 'Pierwszy Połów', desc: 'Zabij 5 Krabów na plaży.',
          type: 'kill', target: 'Krab', count: 5, xp: 25, gold: 10, minLevel: 1, npc: 'Rybak' },

        // Karczmarka - prosty collect
        { id: 'si_karczmarka1', title: 'Prowiant na Wieczór', desc: 'Upoluj 5 sztuk Mięsa.',
          type: 'collect', target: 'Mięso', count: 5, xp: 30, gold: 15, minLevel: 1, npc: 'Karczmarka',
          targetZone: 'forest_east' },

        // Strażnik - prosty quest, ale wymaga żeby rybak/karczmarka byli zrobieni
        { id: 'si_straznik1', title: 'Patrole Leśne', desc: 'Zabij 6 Wilków w lesie na wschodzie.',
          type: 'kill', target: 'Wilk', count: 6, xp: 50, gold: 25, minLevel: 3, npc: 'Strażnik',
          requires: ['si_rybak1'] },

        // ===== ŚREDNIE QUESTY (medium, multi-step or with requirements) =====

        // Rybak chain: kraby -> meduzy -> odwiedź Grotę Krabów
        { id: 'si_rybak2', title: 'Zagadka Plaży', desc: 'Rybak potrzebuje pomocy z narastającym zagrożeniem na plaży.',
          type: 'chain', xp: 80, gold: 40, minLevel: 3, npc: 'Rybak',
          requires: ['si_rybak1'],
          steps: [
            { desc: 'Zabij 5 Meduz zatruwających wody.', type: 'kill', target: 'Meduza', count: 5 },
            { desc: 'Zbadaj Grotę Krabów - wejdź do środka.', type: 'visit', target: 'crab_cave' },
          ]},

        // Zielarka chain: zbierz zioła, potem zabij żaby co je strzegą
        { id: 'si_zielarka1', title: 'Receptura Zielarki', desc: 'Zielarka potrzebuje składników na nową miksturę.',
          type: 'chain', xp: 70, gold: 35, minLevel: 3, npc: 'Zielarka',
          steps: [
            { desc: 'Zbierz 5 Ziół Bagiennych na bagnach (NW).', type: 'collect', target: 'Zioło Bagienne', count: 5 },
            { desc: 'Zabij 3 Żaby Trujące strzegące polany z ziołami.', type: 'kill', target: 'Żaba Trująca', count: 3 },
          ],
          targetZone: 'swamp_nw' },

        // Żona Zielarki - szukaj kwiatu + odwiedź polanę druida
        { id: 'si_zona_ziel1', title: 'Kwiat dla Ukochanej', desc: 'Żona Zielarki marzy o rzadkim kwiecie z Polany Druida.',
          type: 'chain', xp: 60, gold: 30, minLevel: 4, npc: 'Żona Zielarki',
          steps: [
            { desc: 'Odwiedź Polanę Druida na południowym wschodzie.', type: 'visit', target: 'druid_clearing' },
            { desc: 'Zbierz Kwiat Polany.', type: 'collect', target: 'Kwiat Polany', count: 1 },
          ],
          targetZone: 'druid_clearing' },

        // Kupiec chain: najpierw zwiad, potem walka, potem odzyskaj
        { id: 'si_kupiec1', title: 'Skradzione Towary', desc: 'Kupiec stracił towar przez bandytów. Pomóż go odzyskać.',
          type: 'chain', xp: 90, gold: 45, minLevel: 5, npc: 'Kupiec',
          steps: [
            { desc: 'Idź na Piracką Zatokę i rozejrzyj się.', type: 'visit', target: 'pirate_bay' },
            { desc: 'Zabij 6 Bandytów pilnujących towaru.', type: 'kill', target: 'Bandyta', count: 6 },
            { desc: 'Odzyskaj 3 Skrzynie Kupca.', type: 'collect', target: 'Skrzynia Kupca', count: 3 },
          ],
          targetZone: 'pirate_bay' },

        // Strażnik chain: wilki -> pająki -> bandyci (eskalacja zagrożeń)
        { id: 'si_straznik2', title: 'Zagrożenie z Lasu', desc: 'Lasy stają się coraz bardziej niebezpieczne. Sprawdź co się dzieje.',
          type: 'chain', xp: 120, gold: 60, minLevel: 6, npc: 'Strażnik',
          requires: ['si_straznik1'],
          steps: [
            { desc: 'Zabij 5 Pająków w głębi lasu.', type: 'kill', target: 'Pająk', count: 5 },
            { desc: 'Zbadaj głąb lasu szukając źródła zagrożenia.', type: 'visit', target: 'forest_east' },
            { desc: 'Zabij 4 Bandytów ukrywających się w lesie.', type: 'kill', target: 'Bandyta', count: 4 },
          ]},

        // ===== ZAWIŁE QUESTY (complex, long chains, prerequisites) =====

        // Burmistrz epicka linia questów: wywiad -> piraci -> kapitan -> tunel
        { id: 'si_burmistrz1', title: 'Problem Piracki', desc: 'Burmistrz ma poważny problem z piratami najeżdżającymi południowe wybrzeże.',
          type: 'chain', xp: 200, gold: 100, minLevel: 6, npc: 'Burmistrz',
          steps: [
            { desc: 'Zbadaj Piracką Zatokę na południu.', type: 'visit', target: 'pirate_bay' },
            { desc: 'Zabij 8 Piratów stacjonujących w zatoce.', type: 'kill', target: 'Pirat', count: 8 },
            { desc: 'Znajdź Rozkazy Piratów upuszczone przez piratów.', type: 'collect', target: 'Rozkazy Piratów', count: 1 },
          ],
          targetZone: 'pirate_bay' },

        // Burmistrz 2: kontynuacja - kapitan i tunel
        { id: 'si_burmistrz2', title: 'Zemsta Kapitana', desc: 'Rozkazy wskazują na Kapitana Piratów. Trzeba go powstrzymać!',
          type: 'chain', xp: 300, gold: 150, minLevel: 10, npc: 'Burmistrz',
          requires: ['si_burmistrz1'],
          steps: [
            { desc: 'Pokonaj Kapitana Piratów w Pirackiej Zatoce.', type: 'kill', target: 'Pirat Kapitan', count: 1 },
            { desc: 'Przeszukaj Tunele Piratów - pokonaj bossa.', type: 'dungeon', target: 'si_pirate_tunnel', count: 1 },
          ]},

        // Uczony: wieloetapowa ekspedycja naukowa
        { id: 'si_uczony1', title: 'Ekspedycja Archeologiczna', desc: 'Uczony potrzebuje pomocy w badaniu starożytnych ruin na północy.',
          type: 'chain', xp: 250, gold: 120, minLevel: 10, npc: 'Uczony',
          steps: [
            { desc: 'Odwiedź Ruiny na północy wyspy.', type: 'visit', target: 'ruins_north' },
            { desc: 'Zabij 6 Szkieletów strzegących wejścia do ruin.', type: 'kill', target: 'Szkielet', count: 6 },
            { desc: 'Zbierz 3 Fragmenty Inskrypcji wśród ruin.', type: 'collect', target: 'Fragment Inskrypcji', count: 3 },
            { desc: 'Zanurz się w Krypcie pod Ruinami i pokonaj Strażnika.', type: 'dungeon', target: 'si_crypt', count: 1 },
          ],
          targetZone: 'ruins_north' },

        // Kapłan: linia oczyszczania wyspy z nieumarłych
        { id: 'si_kaplan1', title: 'Klątwa Nieumarłych', desc: 'Kapłan wyczuwa mroczną energię z północy. Trzeba oczyścić wyspę.',
          type: 'chain', xp: 280, gold: 140, minLevel: 11, npc: 'Kapłan',
          steps: [
            { desc: 'Zabij 8 Duchów Bagna na bagnach.', type: 'kill', target: 'Duch Bagna', count: 8 },
            { desc: 'Odwiedź Ruiny i znajdź źródło klątwy.', type: 'visit', target: 'ruins_north' },
            { desc: 'Oczyść Kryptę pod Ruinami - pokonaj bossa.', type: 'dungeon', target: 'si_crypt', count: 1 },
          ]},

        // Druid: poznanie wyspy + ochrona natury
        { id: 'si_druid1', title: 'Harmonia Wyspy', desc: 'Druid prosi o przywrócenie równowagi na wyspie.',
          type: 'chain', xp: 180, gold: 90, minLevel: 7, npc: 'Druid',
          steps: [
            { desc: 'Odwiedź Latarnię Morską na zachodzie.', type: 'visit', target: 'lighthouse' },
            { desc: 'Odwiedź Bagno na północnym zachodzie.', type: 'visit', target: 'swamp_nw' },
            { desc: 'Zabij 5 Węży Jadowitych zatruwających bagno.', type: 'kill', target: 'Wąż Jadowity', count: 5 },
            { desc: 'Zbierz 3 Kryształy Natury z polany.', type: 'collect', target: 'Kryształ Natury', count: 3 },
          ],
          targetZone: 'druid_clearing' },

        // Kowal: kopalnia - wymaga questów strażnika
        { id: 'si_kowal1', title: 'Ruda i Ogień', desc: 'Kowal potrzebuje rudy z opuszczonej Kopalni Krasnoludów.',
          type: 'chain', xp: 350, gold: 180, minLevel: 13, npc: 'Kowal',
          requires: ['si_straznik2'],
          steps: [
            { desc: 'Zbadaj wejście do Kopalni na wschodzie.', type: 'visit', target: 'mine_entrance' },
            { desc: 'Zabij 5 Golemów Kamiennych pilnujących kopalni.', type: 'kill', target: 'Golem Kamienny', count: 5 },
            { desc: 'Zbierz 8 Rud Żelaza wewnątrz kopalni.', type: 'collect', target: 'Ruda Żelaza', count: 8 },
            { desc: 'Pokonaj Kamiennego Króla w Kopalni Krasnoludów.', type: 'dungeon', target: 'si_mine', count: 1 },
          ],
          targetZone: 'mine_entrance' },

        // Żeglarz: piracki skarb - zagadka eksploracyjna
        { id: 'si_zeglarz1', title: 'Legenda o Skarbie', desc: 'Stary Żeglarz zna legendę o pirackim skarbie ukrytym na wyspie.',
          type: 'chain', xp: 200, gold: 100, minLevel: 8, npc: 'Stary Żeglarz',
          steps: [
            { desc: 'Odwiedź Piracką Zatokę i szukaj wskazówek.', type: 'visit', target: 'pirate_bay' },
            { desc: 'Zabij 4 Piratów i znajdź fragment Mapy Skarbów.', type: 'kill', target: 'Pirat', count: 4 },
            { desc: 'Zbierz Mapę Skarbów.', type: 'collect', target: 'Mapa Skarbów', count: 1 },
            { desc: 'Odwiedź Latarnię Morską - tam wskazuje mapa.', type: 'visit', target: 'lighthouse' },
          ],
          targetZone: 'pirate_bay' },

        // Karczmarka 2: wymaga karczmarki 1 i strażnika 1
        { id: 'si_karczmarka2', title: 'Bankiet Bohaterów', desc: 'Karczmarka organizuje ucztę, ale potrzebuje egzotycznych składników.',
          type: 'chain', xp: 100, gold: 50, minLevel: 6, npc: 'Karczmarka',
          requires: ['si_karczmarka1', 'si_straznik1'],
          steps: [
            { desc: 'Zbierz 3 Grzyby Leśne w lesie na wschodzie.', type: 'collect', target: 'Grzyb Leśny', count: 3 },
            { desc: 'Zabij 3 Kraby na plaży po Krabowe Mięso.', type: 'kill', target: 'Krab', count: 3 },
            { desc: 'Odwiedź Polanę Druida po zioła.', type: 'visit', target: 'druid_clearing' },
          ],
          targetZone: 'forest_east' },

        // Zielarka 2: zaawansowana alchemia - wymaga zielarki 1
        { id: 'si_zielarka2', title: 'Eliksir Ochrony', desc: 'Zielarka opracowała przepis na potężny eliksir, ale brakuje składników.',
          type: 'chain', xp: 150, gold: 75, minLevel: 8, npc: 'Zielarka',
          requires: ['si_zielarka1'],
          steps: [
            { desc: 'Zabij 4 Węże Jadowite i zbierz ich jad.', type: 'kill', target: 'Wąż Jadowity', count: 4 },
            { desc: 'Zbierz 3 Kwiaty Bagna w bagnie.', type: 'collect', target: 'Kwiat Bagna', count: 3 },
            { desc: 'Odwiedź Ruiny po Starożytny Katalizator.', type: 'visit', target: 'ruins_north' },
            { desc: 'Zbierz 1 Starożytny Katalizator wśród ruin.', type: 'collect', target: 'Starożytny Katalizator', count: 1 },
          ],
          targetZone: 'swamp_nw' },

        // Kapitan statku - zawsze ostatni quest
        { id: 'si_kapitan', title: 'Gotowy na Świat', desc: 'Osiągnij poziom 20 aby opuścić wyspę.',
          type: 'level', count: 20, xp: 0, gold: 200, minLevel: 18, npc: 'Kapitan Statku' },
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
