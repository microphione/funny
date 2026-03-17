// ============================================================
// GAME CORE - Game object definition, init, utility methods
// Must load FIRST before other modules add methods to Game
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
    exploredChunks: new Set(),
    usedWells: new Set(),
    mainQuestStage: 0,
    dungeonBossesKilled: new Set(),
    questCheckTimer: 0,
    bestiary: {}, // { monsterName: { kills: N, seen: true } }

    // Canvas
    canvas: null,
    ctx: null,
    TILE: 64,
    VIEW_W: 17,
    VIEW_H: 13,

    // Camera & smooth movement
    cameraX: 0,
    cameraY: 0,
    animating: false,
    animProgress: 0,
    animSpeed: 8,
    animFromX: 0,
    animFromY: 0,
    animToX: 0,
    animToY: 0,

    // Monster animation
    monsterAnimFrame: 0,
    monsterAnimTimer: 0,

    // Realtime combat state
    walkCooldown: 0,        // current walk cooldown remaining
    walkSpeed: 0.15,        // seconds between steps (lower = faster)
    attackCooldown: 0,      // current attack cooldown remaining
    attackSpeed: 1.0,       // seconds between attacks (base, modified by class/agi)
    skillCooldowns: {},     // { skillId: remaining seconds }
    autoAttackTarget: null, // monster being auto-attacked
    combatTimer: 0,         // time in combat for buff ticking

    // Overlay state
    activeOverlay: null,
    shopItems: [],
    shopType: null,

    // Targeting (for mage ranged/skills)
    targeting: false,
    targetX: 0,
    targetY: 0,

    log(msg, type) {
        const el = document.getElementById('message-log');
        if (!el) return;
        const span = document.createElement('div');
        span.className = type ? `msg-${type}` : '';
        span.textContent = msg;
        el.appendChild(span);
        el.scrollTop = el.scrollHeight;
        while (el.children.length > 50) el.removeChild(el.firstChild);
    },

    getPlayTime() {
        if (!this.startTime) return '0:00';
        const secs = Math.floor((Date.now() - this.startTime) / 1000) + this.gameTime;
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    },

    closeAllOverlays() {
        this.activeOverlay = null;
        this.targeting = false;
        GameUI.hideAllOverlays();
    },

    // ========== DEATH ==========
    die() {
        this.deathCount++;
        this.state = 'dead';
        const p = this.player;

        // Drop all backpack items on the ground (Tibia-style death penalty)
        const equippedSet = new Set(Object.values(p.equipment).filter(e => e).map(e => e.id));
        const droppedItems = [];
        const keptItems = [];
        for (const item of p.inventory) {
            if (equippedSet.has(item.id) && item.type === 'equipment') {
                keptItems.push(item); // Keep equipped items
            } else {
                droppedItems.push(item);
            }
        }
        // Drop items on ground at death location
        if (droppedItems.length > 0) {
            World.dropGroundLoot(p.x, p.y, droppedItems);
        }
        p.inventory = keptItems;

        // Gold loss
        const goldLoss = Math.floor(p.gold * 0.15);
        p.gold = Math.max(0, p.gold - goldLoss);
        this.syncGold();

        Music.stopMelody();
        GameUI.showDeathScreen(goldLoss, droppedItems.length);
    },

    respawn() {
        const p = this.player;
        this.state = 'playing';
        this.refreshStats();
        p.hp = Math.floor(p.maxHp * 0.5);
        p.mp = Math.floor(p.maxMp * 0.5);

        // Exit dungeon if in one
        if (World.activeDungeon) {
            World.activeDungeon = null;
            World.dungeonReturnPos = null;
        }

        if (this.lastVillageWell) {
            p.x = this.lastVillageWell.x;
            p.y = this.lastVillageWell.y;
        } else if (p.onStarterIsland) {
            const ic = World.getIslandCenter();
            p.x = ic.x; p.y = ic.y + 2;
        } else {
            p.x = 0; p.y = 0;
        }
        p.visualX = p.x;
        p.visualY = p.y;
        p.stealth = false;
        p.buffs = [];
        this.attackCooldown = 0;
        this.walkCooldown = 0;
        this.autoAttackTarget = null;
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
                this.player.gold += 50 + this.mainQuestStage * 30;
                this.syncGold();
                this.addXp(30 + this.mainQuestStage * 20);
            }
        }
    },
};
