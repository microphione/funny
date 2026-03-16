// ============================================================
// SAVE / LOAD SYSTEM - Persistence and version compatibility
// ============================================================

Game.save = function() {
    const p = this.player;
    if (!p) return;
    const data = {
        version: 'pq_save_v8',
        classId: p.classId,
        x: p.x, y: p.y, dir: p.dir,
        level: p.level, xp: p.xp, xpToNext: p.xpToNext,
        gold: p.gold, hp: p.hp, mp: p.mp,
        maxHp: p.maxHp, maxMp: p.maxMp,
        attributes: p.attributes,
        statPoints: p.statPoints || 0,
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
        combatSkills: p.combatSkills,
        ownedHouses: p.ownedHouses || [],
        ownedMounts: p.ownedMounts || [],
        mounted: p.mounted || false,
        bankGold: p.bankGold || 0,
        onStarterIsland: p.onStarterIsland || false,
        starterIslandQuests: this.starterIslandQuests || {},
        bestiary: this.bestiary || {},
    };
    localStorage.setItem('pq_save_v8', JSON.stringify(data));
    this.log('Gra zapisana!', 'info');
};

Game.load = function() {
    const raw = localStorage.getItem('pq_save_v8') || localStorage.getItem('pq_save_v7') || localStorage.getItem('pq_save_v6') || localStorage.getItem('pq_save_v5');
    if (!raw) return false;
    try {
        const d = JSON.parse(raw);
        if (!['pq_save_v8','pq_save_v7','pq_save_v6','pq_save_v5'].includes(d.version)) return false;

        this.createPlayer(d.classId);
        const p = this.player;
        Object.assign(p, {
            x: d.x, y: d.y, dir: d.dir || 'down',
            level: d.level, xp: d.xp,
            xpToNext: d.xpToNext || xpToNextLevel(d.level),
            gold: d.gold, hp: d.hp, mp: d.mp,
            maxHp: d.maxHp, maxMp: d.maxMp,
            equipment: d.equipment || {},
            inventory: d.inventory || [],
            skillPoints: d.skillPoints || 0,
            treeProgress: d.treeProgress || {},
            unlockedSkills: d.unlockedSkills || [],
            skillLevels: d.skillLevels || {},
            activeSkills: d.activeSkills || [null, null, null],
            visualX: d.x, visualY: d.y,
        });
        // New attribute system - migrate from old saves
        if (d.attributes) {
            p.attributes = d.attributes;
        } else {
            const cls = CLASSES[d.classId];
            p.attributes = { ...cls.baseAttributes };
            // Give retroactive stat points for levels gained in old system
            p.statPoints = Math.max(0, d.level - 1);
        }
        p.statPoints = d.statPoints || p.statPoints || 0;
        p.bankGold = d.bankGold || 0;

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
        if (d.combatSkills) p.combatSkills = d.combatSkills;
        if (d.ownedMounts) p.ownedMounts = d.ownedMounts;
        if (d.mounted) p.mounted = d.mounted;
        if (!p.combatSkills.distance) p.combatSkills.distance = { level: 10, tries: 0, triesNeeded: 45 };
        p.onStarterIsland = d.onStarterIsland || false;
        this.starterIslandQuests = d.starterIslandQuests || {};
        this.bestiary = d.bestiary || {};
        if (d.ownedHouses) p.ownedHouses = d.ownedHouses;
        if (p.ownedHouses) {
            p.ownedHouses.forEach(key => {
                if (World.houses[key]) World.houses[key].owned = true;
            });
        }

        this.refreshStats();
        return true;
    } catch(e) { return false; }
};
