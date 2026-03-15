// ============================================================
// GAME CORE - Player state, stats, save/load
// ============================================================

const Game = {
    // State
    state: 'title', // title, class_select, playing, dead
    player: null,
    gameTime: 0,
    deathCount: 0,
    killCount: 0,
    startTime: 0,
    lastVillageWell: null,
    quests: [],
    combatLog: [],
    exploredChunks: new Set(), // tracks explored chunk keys for world map
    usedWells: new Set(), // tracks wells used for teleporting
    mainQuestStage: 0, // main story progression
    dungeonBossesKilled: new Set(), // track which dungeon bosses defeated

    // Canvas
    canvas: null,
    ctx: null,
    TILE: 32,
    VIEW_W: 20,
    VIEW_H: 15,

    // Camera & smooth movement
    cameraX: 0,
    cameraY: 0,
    animating: false,
    animProgress: 0,
    animSpeed: 8, // tiles per second for smooth move
    animFromX: 0,
    animFromY: 0,
    animToX: 0,
    animToY: 0,

    // Monster animation
    monsterAnimFrame: 0,
    monsterAnimTimer: 0,

    // Turn state
    turnPhase: 'player', // player, monsters
    playerActionsLeft: 0,
    turnNumber: 0,

    // Overlay state
    activeOverlay: null,
    shopItems: [],
    shopType: null,

    // Targeting (for mage ranged/skills)
    targeting: false,
    targetX: 0,
    targetY: 0,

    createPlayer(classId) {
        const cls = CLASSES[classId];
        if (!cls) return;
        this.player = {
            classId,
            x: 0, y: 0,
            visualX: 0, visualY: 0,
            dir: 'down',
            level: 1,
            xp: 0,
            xpToNext: 30,
            gold: 20,
            hp: cls.baseStats.hp,
            maxHp: cls.baseStats.hp,
            mp: cls.baseStats.mp,
            maxMp: cls.baseStats.mp,
            baseAtk: cls.baseStats.atk,
            baseDef: cls.baseStats.def,
            baseAgi: cls.baseStats.agi,
            equipment: { weapon: null, head: null, chest: null, legs: null, feet: null, offhand: null },
            inventory: [],
            skillPoints: 0,
            treeProgress: {}, // { nodeId: true }
            unlockedSkills: [],
            skillLevels: {}, // { skillId: level } - upgradeable
            activeSkills: [null, null, null], // 3 active skill slots
            buffs: [], // { id, turns }
            stealth: false,
            stealthSteps: 0, // remaining stealth steps
        };
        // Give starting items
        const startWeapon = generateItemForClass(classId, 1, 'weapon');
        if (startWeapon) {
            startWeapon.tier = 'normal';
            this.player.inventory.push(startWeapon);
            this.player.equipment.weapon = startWeapon;
        }
        // Starting potions
        this.player.inventory.push({ id: 'hp_potion', name: 'Mikstura HP', type: 'consumable', subtype: 'hp', heal: 25, count: 3, price: 10, desc: 'Leczy 25 HP' });
        this.player.inventory.push({ id: 'mp_potion', name: 'Mikstura Many', type: 'consumable', subtype: 'mp', mana: 20, count: 2, price: 12, desc: '+20 MP' });
    },

    getStats() {
        const p = this.player;
        if (!p) return { atk: 0, def: 0, agi: 0, maxHp: 0, maxMp: 0 };
        const cls = CLASSES[p.classId];

        let atk = p.baseAtk + (p.level - 1) * cls.atkPerLevel;
        let def = p.baseDef + (p.level - 1) * cls.defPerLevel;
        let agi = p.baseAgi + (p.level - 1) * cls.agiPerLevel;
        let maxHp = cls.baseStats.hp + (p.level - 1) * cls.hpPerLevel;
        let maxMp = cls.baseStats.mp + (p.level - 1) * cls.mpPerLevel;

        // Equipment bonuses
        for (const slot in p.equipment) {
            const item = p.equipment[slot];
            if (!item) continue;
            if (item.atk) atk += item.atk;
            if (item.def) def += item.def;
            if (item.agi) agi += item.agi;
        }

        // Skill tree bonuses
        for (const branchKey in cls.tree) {
            const branch = cls.tree[branchKey];
            for (const node of branch.nodes) {
                if (p.treeProgress[node.id]) {
                    if (node.stat === 'atk') atk += node.val;
                    if (node.stat === 'def') def += node.val;
                    if (node.stat === 'agi') agi += node.val;
                    if (node.stat === 'maxHp') maxHp += node.val;
                    if (node.stat === 'maxMp') maxMp += node.val;
                }
            }
        }

        return { atk: Math.floor(atk), def: Math.floor(def), agi: Math.floor(agi), maxHp: Math.floor(maxHp), maxMp: Math.floor(maxMp) };
    },

    refreshStats() {
        const p = this.player;
        if (!p) return;
        const s = this.getStats();
        p.maxHp = s.maxHp;
        p.maxMp = s.maxMp;
        if (p.hp > p.maxHp) p.hp = p.maxHp;
        if (p.mp > p.maxMp) p.mp = p.maxMp;
    },

    addXp(amount) {
        const p = this.player;
        p.xp += amount;
        while (p.xp >= p.xpToNext) {
            p.xp -= p.xpToNext;
            p.level++;
            p.skillPoints += 1;
            p.xpToNext = Math.floor(50 * Math.pow(1.6, p.level - 1));
            this.refreshStats();
            p.hp = p.maxHp;
            p.mp = p.maxMp;
            this.log(`Poziom ${p.level}! +1 Punkt Umiejętności`, 'info');
            // Check new skills
            const cls = CLASSES[p.classId];
            cls.skills.forEach(sk => {
                if (sk.level <= p.level && !p.unlockedSkills.includes(sk.id)) {
                    p.unlockedSkills.push(sk.id);
                    p.skillLevels[sk.id] = 1;
                    // Auto-assign to first empty active slot
                    const emptySlot = p.activeSkills.indexOf(null);
                    if (emptySlot !== -1) p.activeSkills[emptySlot] = sk.id;
                    this.log(`Nowa umiejętność: ${sk.name}!`, 'info');
                }
            });
        }
    },

    log(msg, type) {
        const el = document.getElementById('message-log');
        if (!el) return;
        const span = document.createElement('div');
        span.className = type ? `msg-${type}` : '';
        span.textContent = msg;
        el.appendChild(span);
        el.scrollTop = el.scrollHeight;
        // Keep max 50 messages
        while (el.children.length > 50) el.removeChild(el.firstChild);
    },

    getPlayTime() {
        if (!this.startTime) return '0:00';
        const secs = Math.floor((Date.now() - this.startTime) / 1000) + this.gameTime;
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    },

    // ========== SAVE / LOAD ==========
    save() {
        const p = this.player;
        if (!p) return;
        const data = {
            version: 'pq_save_v5',
            classId: p.classId,
            x: p.x, y: p.y, dir: p.dir,
            level: p.level, xp: p.xp, xpToNext: p.xpToNext,
            gold: p.gold, hp: p.hp, mp: p.mp,
            maxHp: p.maxHp, maxMp: p.maxMp,
            baseAtk: p.baseAtk, baseDef: p.baseDef, baseAgi: p.baseAgi,
            equipment: p.equipment,
            inventory: p.inventory,
            skillPoints: p.skillPoints,
            treeProgress: p.treeProgress,
            unlockedSkills: p.unlockedSkills,
            skillLevels: p.skillLevels,
            activeSkills: p.activeSkills,
            quests: this.quests,
            gameTime: Math.floor((Date.now() - this.startTime) / 1000) + this.gameTime,
            deathCount: this.deathCount,
            killCount: this.killCount,
            worldSeed: World.worldSeed,
            openedChests: [...World.openedChests],
            lastVillageWell: this.lastVillageWell,
            musicMuted: Music.muted,
            exploredChunks: [...this.exploredChunks],
            usedWells: [...this.usedWells],
            mainQuestStage: this.mainQuestStage,
            dungeonBossesKilled: [...this.dungeonBossesKilled],
        };
        localStorage.setItem('pq_save_v5', JSON.stringify(data));
        this.log('Gra zapisana!', 'info');
    },

    load() {
        const raw = localStorage.getItem('pq_save_v5');
        if (!raw) return false;
        try {
            const d = JSON.parse(raw);
            if (d.version !== 'pq_save_v5') return false;

            this.createPlayer(d.classId);
            const p = this.player;
            Object.assign(p, {
                x: d.x, y: d.y, dir: d.dir || 'down',
                level: d.level, xp: d.xp, xpToNext: d.xpToNext,
                gold: d.gold, hp: d.hp, mp: d.mp,
                maxHp: d.maxHp, maxMp: d.maxMp,
                baseAtk: d.baseAtk, baseDef: d.baseDef, baseAgi: d.baseAgi,
                equipment: d.equipment || {},
                inventory: d.inventory || [],
                skillPoints: d.skillPoints || 0,
                treeProgress: d.treeProgress || {},
                unlockedSkills: d.unlockedSkills || [],
                skillLevels: d.skillLevels || {},
                activeSkills: d.activeSkills || [null, null, null],
                visualX: d.x, visualY: d.y,
            });
            this.quests = d.quests || [];
            this.gameTime = d.gameTime || 0;
            this.deathCount = d.deathCount || 0;
            this.killCount = d.killCount || 0;
            this.lastVillageWell = d.lastVillageWell || null;
            this.startTime = Date.now();

            World.init(d.worldSeed);
            if (d.openedChests) World.openedChests = new Set(d.openedChests);
            if (d.musicMuted) Music.muted = true;
            if (d.exploredChunks) this.exploredChunks = new Set(d.exploredChunks);
            if (d.usedWells) this.usedWells = new Set(d.usedWells);
            this.mainQuestStage = d.mainQuestStage || 0;
            if (d.dungeonBossesKilled) this.dungeonBossesKilled = new Set(d.dungeonBossesKilled);

            this.refreshStats();
            return true;
        } catch(e) { return false; }
    },

    // ========== DEATH ==========
    die() {
        this.deathCount++;
        this.state = 'dead';
        const goldLoss = Math.floor(this.player.gold * 0.1 * this.player.level / 5);
        this.player.gold = Math.max(0, this.player.gold - goldLoss);
        Music.stopMelody();
        GameUI.showDeathScreen(goldLoss);
    },

    respawn() {
        const p = this.player;
        this.state = 'playing';
        this.refreshStats();
        p.hp = Math.floor(p.maxHp * 0.5);
        p.mp = Math.floor(p.maxMp * 0.5);

        // Respawn at last village well
        if (this.lastVillageWell) {
            p.x = this.lastVillageWell.x;
            p.y = this.lastVillageWell.y;
        } else {
            p.x = 0; p.y = 0;
        }
        p.visualX = p.x;
        p.visualY = p.y;
        p.stealth = false;
        p.buffs = [];
        this.turnPhase = 'player';
        this.activeOverlay = null;
        GameUI.hideAllOverlays();
        this.log('Odrodzono w wiosce.', 'info');
    },

    // ========== MAIN QUEST ==========
    MAIN_QUEST_STAGES: [
        { id: 0, title: 'Początek Przygody', desc: 'Eksploruj świat i osiągnij poziom 3.', check: (g) => g.player.level >= 3 },
        { id: 1, title: 'Pierwsza Wioska', desc: 'Odwiedź wioskę i użyj studni.', check: (g) => g.usedWells.size >= 1 },
        { id: 2, title: 'Łowca Potworów', desc: 'Zabij 20 potworów.', check: (g) => g.killCount >= 20 },
        { id: 3, title: 'Odkrywca', desc: 'Odkryj 3 różne wioski.', check: (g) => g.usedWells.size >= 3 },
        { id: 4, title: 'Poszukiwacz Przygód', desc: 'Ukończ 3 questy.', check: (g) => g.quests.filter(q => q.turned_in).length >= 3 },
        { id: 5, title: 'Wyprawa do Podziemi', desc: 'Pokonaj bossa w Jaskini Goblinów.', check: (g) => g.dungeonBossesKilled.has('goblin_cave') },
        { id: 6, title: 'Pogromca Nieumarłych', desc: 'Pokonaj bossa w Krypcie Nieumarłych.', check: (g) => g.dungeonBossesKilled.has('undead_crypt') },
        { id: 7, title: 'Pajączy Koszmar', desc: 'Pokonaj bossa w Gnieździe Pająków.', check: (g) => g.dungeonBossesKilled.has('spider_nest') },
        { id: 8, title: 'Smocze Wyzwanie', desc: 'Pokonaj Prastarego Smoka.', check: (g) => g.dungeonBossesKilled.has('dragon_lair') },
        { id: 9, title: 'Ostateczna Bitwa', desc: 'Pokonaj Władcę Cieni i uratuj świat!', check: (g) => g.dungeonBossesKilled.has('shadow_realm') },
        { id: 10, title: 'Bohater Krainy!', desc: 'Pokonałeś wszystkie zagrożenia. Świat jest bezpieczny!', check: () => false },
    ],

    checkMainQuest() {
        const stage = this.MAIN_QUEST_STAGES[this.mainQuestStage];
        if (stage && stage.check(this)) {
            this.mainQuestStage++;
            const next = this.MAIN_QUEST_STAGES[this.mainQuestStage];
            if (next) {
                this.log(`[Główny Quest] ${stage.title} - Ukończono!`, 'loot');
                this.log(`[Główny Quest] Nowy cel: ${next.title}`, 'info');
                // Reward
                this.player.gold += 50 + this.mainQuestStage * 30;
                this.addXp(30 + this.mainQuestStage * 20);
            }
        }
    },

    closeAllOverlays() {
        this.activeOverlay = null;
        this.targeting = false;
        GameUI.hideAllOverlays();
    },
};
