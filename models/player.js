// ============================================================
// PLAYER - Creation, stats, leveling, class change
// Adds methods to the global Game object (defined in config/game-init.js)
// ============================================================

Game.createPlayer = function(classId) {
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
        gold: 0,
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
    // Starting gold (as inventory item)
    this.player.inventory.push({ id: 'gold_coins', name: 'Złote Monety', type: 'currency', count: 20, stackable: true, maxStack: 999999, price: 0, desc: 'Złote monety - waluta świata' });
    this.player.gold = 20;
    // Starting potions (stackable)
    this.player.inventory.push({ id: 'hp_potion', name: 'Mikstura HP', type: 'consumable', subtype: 'hp', heal: 25, count: 5, stackable: true, maxStack: 100, price: 10, desc: 'Leczy 25 HP' });
    this.player.inventory.push({ id: 'mp_potion', name: 'Mikstura Many', type: 'consumable', subtype: 'mp', mana: 20, count: 3, stackable: true, maxStack: 100, price: 12, desc: '+20 MP' });
};

// Sync gold between p.gold number and inventory gold_coins item
Game.syncGold = function() {
    const p = this.player;
    if (!p) return;
    let goldItem = p.inventory.find(i => i.id === 'gold_coins');
    if (!goldItem) {
        goldItem = { id: 'gold_coins', name: 'Złote Monety', type: 'currency', count: 0, stackable: true, maxStack: 999999, price: 0, desc: 'Złote monety - waluta świata' };
        p.inventory.push(goldItem);
    }
    goldItem.count = Math.max(0, p.gold);
};

Game.getStats = function() {
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
};

Game.getAttackSpeed = function() {
    const p = this.player;
    if (!p) return 1.0;
    const cls = CLASSES[p.classId];
    const stats = this.getStats();
    let speed = cls.baseAttackSpeed || 1.5;
    // attackSpeed stat reduces cooldown (each point = 0.5% reduction)
    speed *= Math.max(0.3, 1 - stats.attackSpeed * 0.005);
    if (p.classId === 'rogue') speed *= 0.7;
    return speed;
};

Game.getWalkSpeed = function() {
    const p = this.player;
    if (!p) return 0.15;
    const stats = this.getStats();
    let speed = 0.18;
    // moveSpeed stat reduces walk time
    speed *= Math.max(0.08, 1 - stats.moveSpeed * 0.004);
    if (p.mounted) speed *= 0.6;
    return speed;
};

// Tibia-style skill advancement
// Tries needed formula: floor(50 * 1.1^(skill_level - offset))
// offset is 10 for melee/shielding, 0 for magic
Game.getTriesNeeded = function(skillName, level) {
    const offset = (skillName === 'magic') ? 0 : 10;
    const base = (skillName === 'magic') ? 30 : (skillName === 'distance') ? 45 : 50;
    return Math.floor(base * Math.pow(1.1, level - offset));
};

Game.advanceCombatSkill = function(skillName) {
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
};

Game.refreshStats = function() {
    const p = this.player;
    if (!p) return;
    const s = this.getStats();
    p.maxHp = s.maxHp;
    p.maxMp = s.maxMp;
    p.hp = Math.floor(p.hp);
    p.mp = Math.floor(p.mp);
    if (p.hp > p.maxHp) p.hp = p.maxHp;
    if (p.mp > p.maxMp) p.mp = p.maxMp;
    this.syncGold();
};

Game.addXp = function(amount) {
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
};

// ========== CLASS CHANGE (from novice) ==========
Game.changeClass = function(newClassId) {
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
};
