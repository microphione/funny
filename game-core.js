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
    exploredChunks: new Set(),
    usedWells: new Set(),
    mainQuestStage: 0,
    dungeonBossesKilled: new Set(),
    questCheckTimer: 0,
    bestiary: {}, // { monsterName: { kills: N, seen: true } }

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

    getAttackSpeed() {
        const p = this.player;
        if (!p) return 1.0;
        const cls = CLASSES[p.classId];
        const stats = this.getStats();
        let speed = cls.baseAttackSpeed || 1.5;
        // attackSpeed stat reduces cooldown (each point = 0.5% reduction)
        speed *= Math.max(0.3, 1 - stats.attackSpeed * 0.005);
        if (p.classId === 'rogue') speed *= 0.7;
        return speed;
    },

    getWalkSpeed() {
        const p = this.player;
        if (!p) return 0.15;
        const stats = this.getStats();
        let speed = 0.18;
        // moveSpeed stat reduces walk time
        speed *= Math.max(0.08, 1 - stats.moveSpeed * 0.004);
        if (p.mounted) speed *= 0.6;
        return speed;
    },

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
            xpToNext: xpToNextLevel(1),
            gold: 20,
            hp: cls.baseStats.hp,
            maxHp: cls.baseStats.hp,
            mp: cls.baseStats.mp,
            maxMp: cls.baseStats.mp,
            // Base attributes (STR, DEX, AGI, VIT, INT)
            attributes: { ...cls.baseAttributes },
            statPoints: 0,  // points to allocate to attributes (1 per level)
            equipment: { weapon: null, head: null, chest: null, legs: null, feet: null, offhand: null },
            inventory: [],
            skillPoints: 0,
            treeProgress: {},
            unlockedSkills: [],
            skillLevels: {},
            activeSkills: [null, null, null],
            buffs: [],
            stealth: false,
            stealthDuration: 0,
            combatSkills: {
                melee: { level: 10, tries: 0, triesNeeded: 50 },
                shielding: { level: 10, tries: 0, triesNeeded: 50 },
                magic: { level: 0, tries: 0, triesNeeded: 30 },
                distance: { level: 10, tries: 0, triesNeeded: 45 },
            },
            ownedHouses: [],
            mounted: false,
            ownedMounts: [],
            bankGold: 0, // gold stored in bank
        };
        // Starting weapon
        const startWeapon = generateItemForClass(classId, 1, 'weapon');
        if (startWeapon) {
            startWeapon.tier = 'normal';
            this.player.inventory.push(startWeapon);
            this.player.equipment.weapon = startWeapon;
        }
        // Starting potions (stackable)
        this.player.inventory.push({ id: 'hp_potion', name: 'Mikstura HP', type: 'consumable', subtype: 'hp', heal: 25, count: 5, stackable: true, maxStack: 100, price: 10, desc: 'Leczy 25 HP' });
        this.player.inventory.push({ id: 'mp_potion', name: 'Mikstura Many', type: 'consumable', subtype: 'mp', mana: 20, count: 3, stackable: true, maxStack: 100, price: 12, desc: '+20 MP' });
    },

    getStats() {
        const p = this.player;
        if (!p) return { damage: 0, armor: 0, accuracy: 10, maxHp: 100, maxMp: 30, attackSpeed: 0, moveSpeed: 0, critChance: 5, critMult: 150, cdr: 0, dodge: 0, stunChance: 0 };
        const cls = CLASSES[p.classId];
        const attr = p.attributes || cls.baseAttributes;

        // Base stats from class + level
        let maxHp = cls.baseStats.hp + (p.level - 1) * cls.hpPerLevel;
        let maxMp = cls.baseStats.mp + (p.level - 1) * cls.mpPerLevel;
        let damage = cls.baseStats.damage || 5;
        let armor = cls.baseStats.armor || 0;
        let accuracy = cls.baseStats.accuracy || 10;
        let dodge = cls.baseStats.dodge || 0;
        let attackSpeed = 0;
        let moveSpeed = 0;
        let critChance = 5; // base 5%
        let critMult = 150; // base 150% (1.5x)
        let cdr = 0;
        let stunChance = 0;

        // Attribute bonuses: STR, DEX, AGI, VIT, INT
        const str = attr.str || 0;
        const dex = attr.dex || 0;
        const agi = attr.agi || 0;
        const vit = attr.vit || 0;
        const int = attr.int || 0;

        damage += str * 2;       // STR: +2 phys damage per point
        critMult += str * 3;     // STR: +3% crit damage per point
        accuracy += dex * 3;     // DEX: +3 accuracy per point
        critChance += dex * 1;   // DEX: +1% crit chance per point
        moveSpeed += agi * 2;    // AGI: +2 move speed per point
        dodge += agi * 2;        // AGI: +2 dodge per point
        maxHp += vit * 8;        // VIT: +8 HP per point
        armor += vit * 1;        // VIT: +1 armor per point
        cdr += int * 2;          // INT: +2% CDR per point
        maxMp += int * 5;        // INT: +5 mana per point

        // Equipment bonuses (multi-stat items)
        for (const slot in p.equipment) {
            const item = p.equipment[slot];
            if (!item) continue;
            const stats = item.stats || item; // support both old and new format
            if (stats.damage) damage += stats.damage;
            if (stats.armor) armor += stats.armor;
            if (stats.maxHp) maxHp += stats.maxHp;
            if (stats.maxMp) maxMp += stats.maxMp;
            if (stats.accuracy) accuracy += stats.accuracy;
            if (stats.attackSpeed) attackSpeed += stats.attackSpeed;
            if (stats.moveSpeed) moveSpeed += stats.moveSpeed;
            if (stats.critChance) critChance += stats.critChance;
            if (stats.critMult) critMult += stats.critMult;
            if (stats.cdr) cdr += stats.cdr;
            if (stats.dodge) dodge += stats.dodge;
            if (stats.stunChance) stunChance += stats.stunChance;
            // Backward compat for old atk/def/agi items
            if (stats.atk) damage += stats.atk;
            if (stats.def) armor += stats.def;
        }

        // Skill tree bonuses
        for (const branchKey in cls.tree) {
            const branch = cls.tree[branchKey];
            for (const node of branch.nodes) {
                if (p.treeProgress[node.id]) {
                    if (node.stat === 'damage') damage += node.val;
                    if (node.stat === 'armor') armor += node.val;
                    if (node.stat === 'dodge') dodge += node.val;
                    if (node.stat === 'maxHp') maxHp += node.val;
                    if (node.stat === 'maxMp') maxMp += node.val;
                    // Backward compat
                    if (node.stat === 'atk') damage += node.val;
                    if (node.stat === 'def') armor += node.val;
                    if (node.stat === 'agi') dodge += node.val;
                }
            }
        }

        // Combat skill bonuses (Tibia-style)
        if (p.combatSkills) {
            const meleeBonus = Math.max(0, p.combatSkills.melee.level - 10);
            const shieldBonus = Math.max(0, p.combatSkills.shielding.level - 10);
            const magicBonus = p.combatSkills.magic.level;
            const distBonus = p.combatSkills.distance ? Math.max(0, p.combatSkills.distance.level - 10) : 0;
            if (p.classId === 'mage') {
                damage += magicBonus * 2;
                damage += Math.floor(meleeBonus * 0.3);
            } else if (p.classId === 'archer') {
                damage += Math.floor(distBonus * 1.5);
                damage += Math.floor(meleeBonus * 0.3);
            } else {
                damage += meleeBonus;
                damage += Math.floor(magicBonus * 0.3);
            }
            armor += Math.floor(shieldBonus * 0.7);
        }

        // Buff bonuses
        if (p.buffs) {
            const dodgeRollBuff = p.buffs.find(b => b.id === 'dodge_roll');
            if (dodgeRollBuff) dodge += dodgeRollBuff.agiBonus || 5;
            const hawkEye = p.buffs.find(b => b.id === 'hawk_eye');
            if (hawkEye) critChance += 15;
        }

        return {
            damage: Math.floor(damage),
            armor: Math.floor(armor),
            accuracy: Math.floor(accuracy),
            maxHp: Math.floor(maxHp),
            maxMp: Math.floor(maxMp),
            attackSpeed: Math.floor(attackSpeed),
            moveSpeed: Math.floor(moveSpeed),
            critChance: Math.min(75, Math.floor(critChance)),  // cap at 75%
            critMult: Math.floor(critMult),
            cdr: Math.min(50, Math.floor(cdr)),                // cap at 50%
            dodge: Math.min(60, Math.floor(dodge)),            // cap at 60%
            stunChance: Math.min(30, Math.floor(stunChance)),  // cap at 30%
        };
    },

    // Tibia-style skill advancement
    // Tries needed formula: floor(50 * 1.1^(skill_level - offset))
    // offset is 10 for melee/shielding, 0 for magic
    getTriesNeeded(skillName, level) {
        const offset = (skillName === 'magic') ? 0 : 10;
        const base = (skillName === 'magic') ? 30 : (skillName === 'distance') ? 45 : 50;
        return Math.floor(base * Math.pow(1.1, level - offset));
    },

    advanceCombatSkill(skillName) {
        const p = this.player;
        if (!p || !p.combatSkills) return;
        const skill = p.combatSkills[skillName];
        if (!skill) return;

        skill.tries++;
        const needed = this.getTriesNeeded(skillName, skill.level);
        skill.triesNeeded = needed;

        if (skill.tries >= needed) {
            skill.tries = 0;
            skill.level++;
            skill.triesNeeded = this.getTriesNeeded(skillName, skill.level);
            const names = { melee: 'Walka Wręcz', shielding: 'Obrona', magic: 'Magia', distance: 'Dystans' };
            this.log(`${names[skillName]} wzrosła do poziomu ${skill.level}!`, 'info');
            this.refreshStats();
        }
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
            // Stat points every level (allocate to attributes)
            p.statPoints = (p.statPoints || 0) + 1;
            // Skill points every 2 levels
            if (p.level % 2 === 0) {
                p.skillPoints += 1;
                this.log(`Poziom ${p.level}! +1 Punkt Statystyk, +1 Punkt Umiejętności`, 'info');
            } else {
                this.log(`Poziom ${p.level}! +1 Punkt Statystyk`, 'info');
            }
            p.xpToNext = xpToNextLevel(p.level);
            this.refreshStats();
            p.hp = p.maxHp;
            p.mp = p.maxMp;

            // Gradual complexity messages
            if (p.level === 20) {
                this.log('Odblokowano: Niezwykłe przedmioty mogą teraz padać!', 'loot');
                if (p.onStarterIsland) {
                    this.log('Osiągnąłeś poziom 20! Porozmawiaj z Kapitanem aby opuścić wyspę!', 'loot');
                }
            }
            if (p.level === 25) this.log('Odblokowano: Drzewko umiejętności! (K)', 'info');
            if (p.level === 40) this.log('Odblokowano: Rzadkie przedmioty mogą teraz padać!', 'loot');
            if (p.level === 60) this.log('Odblokowano: Epickie przedmioty mogą teraz padać!', 'loot');
            if (p.level === 80) this.log('Odblokowano: Legendarne przedmioty mogą teraz padać!', 'loot');
            if (p.level === 100) this.log('Odblokowano: Mityczne przedmioty mogą teraz padać!', 'loot');

            const cls = CLASSES[p.classId];
            if (cls) {
                cls.skills.forEach(sk => {
                    if (sk.level <= p.level && !p.unlockedSkills.includes(sk.id)) {
                        p.unlockedSkills.push(sk.id);
                        p.skillLevels[sk.id] = 1;
                        const emptySlot = p.activeSkills.indexOf(null);
                        if (emptySlot !== -1) p.activeSkills[emptySlot] = sk.id;
                        this.log(`Nowa umiejętność: ${sk.name}!`, 'info');
                    }
                });
            }
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
    },

    load() {
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
            const islandX = STARTER_ISLAND.cx * World.CHUNK_SIZE + Math.floor(World.CHUNK_SIZE / 2);
            const islandY = STARTER_ISLAND.cy * World.CHUNK_SIZE + Math.floor(World.CHUNK_SIZE / 2);
            p.x = islandX; p.y = islandY;
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

    // ========== CLASS CHANGE (from novice) ==========
    changeClass(newClassId) {
        const p = this.player;
        if (!p || p.classId === newClassId) return;
        const newCls = CLASSES[newClassId];
        if (!newCls) return;

        p.classId = newClassId;
        p.onStarterIsland = false;
        // Reset skill tree and skills for new class
        p.treeProgress = {};
        p.unlockedSkills = [];
        p.skillLevels = {};
        p.activeSkills = [null, null, null];
        // Recalculate attribute base from new class
        const oldAttr = { ...p.attributes };
        const noviceCls = CLASSES.novice;
        // Keep invested points, swap base attributes
        for (const attr of BASE_ATTRIBUTES) {
            const invested = (oldAttr[attr] || 0) - (noviceCls.baseAttributes[attr] || 0);
            p.attributes[attr] = (newCls.baseAttributes[attr] || 0) + Math.max(0, invested);
        }
        // Remove novice-only equipment
        for (const slot in p.equipment) {
            const item = p.equipment[slot];
            if (item && item.classes && item.classes.includes('novice') && !item.classes.includes(newClassId)) {
                p.equipment[slot] = null;
            }
        }
        // Generate starting weapon for new class
        const startWeapon = generateItemForClass(newClassId, p.level, 'weapon');
        if (startWeapon) {
            startWeapon.tier = 'normal';
            p.inventory.push(startWeapon);
            if (!p.equipment.weapon) p.equipment.weapon = startWeapon;
        }
        this.refreshStats();
        // Teleport to capital
        World.getChunk(0, 0);
        const wellX = Math.floor(World.CHUNK_SIZE / 2);
        const wellY = Math.floor(World.CHUNK_SIZE / 2);
        p.x = wellX; p.y = wellY;
        p.visualX = wellX; p.visualY = wellY;
        this.lastVillageWell = { x: wellX, y: wellY };
        this.usedWells.add('0,0');
        this.log(`Wybrano klasę: ${newCls.name}!`, 'loot');
        this.log('Witaj na kontynencie! Oto Stolica - centrum świata.', 'info');
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
