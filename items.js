// ============================================================
// ITEMS, CLASSES, EQUIPMENT SYSTEM
// ============================================================

// ========== TIERS ==========
const TIERS = {
    normal:    { name: 'Zwykły',      color: '#aaa',    mult: 1.0, dropWeight: 50 },
    uncommon:  { name: 'Niezwykły',   color: '#2ecc71', mult: 1.3, dropWeight: 25 },
    rare:      { name: 'Rzadki',      color: '#3498db', mult: 1.7, dropWeight: 12 },
    epic:      { name: 'Epicki',      color: '#9b59b6', mult: 2.2, dropWeight: 5 },
    legendary: { name: 'Legendarny',  color: '#f39c12', mult: 3.0, dropWeight: 2 },
    mythic:    { name: 'Mityczny',    color: '#e74c3c', mult: 4.0, dropWeight: 0.5 },
};
const TIER_ORDER = ['normal','uncommon','rare','epic','legendary','mythic'];

function rollTier(luck) {
    const r = Math.random() * 100 - (luck || 0) * 5;
    let acc = 0;
    for (const t of TIER_ORDER) { acc += TIERS[t].dropWeight; if (r < acc) return t; }
    return 'normal';
}

// ========== EQUIPMENT SLOTS ==========
const EQUIP_SLOTS = {
    weapon:  'Broń',
    head:    'Głowa',
    chest:   'Tors',
    legs:    'Nogi',
    feet:    'Stopy',
    offhand: 'Lewa ręka',
};

// ========== CHARACTER CLASSES ==========
const CLASSES = {
    knight: {
        name: 'Rycerz',
        icon: '⚔️',
        desc: 'Silny w obronie i ataku z bliska.',
        color: '#e74c3c',
        baseStats: { hp: 60, mp: 20, atk: 7, def: 5, agi: 2 },
        hpPerLevel: 8, mpPerLevel: 2, atkPerLevel: 2, defPerLevel: 2, agiPerLevel: 0.3,
        attacksPerTurn: 1,
        allowedItems: ['sword','axe','mace','helmet','armor','pants','boots','shield'],
        skills: [
            { level: 1,  id: 'shield_bash', name: 'Uderzenie Tarczą', desc: 'Ogłusza wroga. Obrażenia 1.2x (+0.2x/lv)', cost: 8, type: 'melee', baseMult: 1.2, multPerLv: 0.2 },
            { level: 2,  id: 'power_strike', name: 'Potężne Uderzenie', desc: 'Obrażenia 2x ATK (+0.3x/lv)', cost: 12, type: 'melee', baseMult: 2.0, multPerLv: 0.3 },
            { level: 4,  id: 'iron_skin', name: 'Żelazna Skóra', desc: '+50% DEF na 3 tury (+1 tura/lv)', cost: 15, type: 'buff' },
            { level: 6,  id: 'whirlwind', name: 'Wir Ostrza', desc: 'Uderza wszystkich dookoła 1.5x (+0.2x/lv)', cost: 20, type: 'aoe', baseMult: 1.5, multPerLv: 0.2 },
            { level: 8,  id: 'taunt', name: 'Prowokacja', desc: 'Wszystkie potwory atakują ciebie (+1 tura/lv)', cost: 10, type: 'aoe' },
            { level: 10, id: 'execute', name: 'Egzekucja', desc: '3x dmg jeśli wróg <30% HP (+0.5x/lv)', cost: 25, type: 'melee', baseMult: 3.0, multPerLv: 0.5 },
            { level: 13, id: 'war_cry', name: 'Okrzyk Wojenny', desc: '+30% ATK na 3 tury (+5%/lv)', cost: 18, type: 'buff' },
            { level: 16, id: 'shield_wall', name: 'Mur Tarcz', desc: 'Blokuje 80% dmg przez 2 tury (+1/lv)', cost: 22, type: 'buff' },
            { level: 19, id: 'ground_slam', name: 'Trzęsienie', desc: 'Ogłusza i zadaje 2x w promieniu 2 (+0.3x/lv)', cost: 30, type: 'aoe', baseMult: 2.0, multPerLv: 0.3 },
            { level: 22, id: 'last_stand', name: 'Ostatnia Szansa', desc: 'Nie możesz zginąć przez 3 tury (+1/lv)', cost: 35, type: 'buff' },
        ],
        tree: {
            defense: { name: 'Obrona', nodes: [
                { id: 'thick_skin', name: 'Gruba Skóra', desc: '+3 DEF', stat: 'def', val: 3 },
                { id: 'vitality', name: 'Witalność', desc: '+15 HP', stat: 'maxHp', val: 15 },
                { id: 'block', name: 'Blok', desc: '+5 DEF', stat: 'def', val: 5 },
                { id: 'fortify', name: 'Fortyfikacja', desc: '+25 HP', stat: 'maxHp', val: 25 },
                { id: 'unbreakable', name: 'Niezłomny', desc: '+8 DEF', stat: 'def', val: 8 },
            ]},
            offense: { name: 'Atak', nodes: [
                { id: 'sharp_edge', name: 'Ostre Ostrze', desc: '+3 ATK', stat: 'atk', val: 3 },
                { id: 'brutal', name: 'Brutalność', desc: '+5 ATK', stat: 'atk', val: 5 },
                { id: 'rage', name: 'Furia', desc: '+8 ATK', stat: 'atk', val: 8 },
                { id: 'berserk', name: 'Berserk', desc: '+12 ATK', stat: 'atk', val: 12 },
                { id: 'warlord', name: 'Pan Wojny', desc: '+15 ATK', stat: 'atk', val: 15 },
            ]},
        },
    },
    rogue: {
        name: 'Łotrzyk',
        icon: '🗡️',
        desc: 'Zwinny, 2 ataki na turę, niewidzialność.',
        color: '#2ecc71',
        baseStats: { hp: 40, mp: 30, atk: 6, def: 2, agi: 5 },
        hpPerLevel: 5, mpPerLevel: 3, atkPerLevel: 1.5, defPerLevel: 1, agiPerLevel: 1,
        attacksPerTurn: 2,
        allowedItems: ['dagger','sword','hood','cape','leggings','boots','offhand_dagger'],
        skills: [
            { level: 1,  id: 'stealth', name: 'Niewidzialność', desc: 'Niewidzialny na 5 kratek (+2/lv)', cost: 10, type: 'buff' },
            { level: 2,  id: 'backstab', name: 'Cios w Plecy', desc: '2x obrażenia (+0.3x/lv)', cost: 12, type: 'melee', baseMult: 2.0, multPerLv: 0.3 },
            { level: 4,  id: 'poison_blade', name: 'Zatrute Ostrze', desc: 'Obrażenia + trucizna 3 tury (+1/lv)', cost: 15, type: 'melee', baseMult: 1.5, multPerLv: 0.2 },
            { level: 6,  id: 'shadow_step', name: 'Krok Cienia', desc: 'Teleport za wroga + 2x atak (+0.3x/lv)', cost: 18, type: 'melee', baseMult: 2.0, multPerLv: 0.3 },
            { level: 8,  id: 'smoke_bomb', name: 'Bomba Dymna', desc: 'Ogłusza wrogów dookoła na 2 tury (+1/lv)', cost: 14, type: 'aoe' },
            { level: 10, id: 'assassinate', name: 'Zamach', desc: '4x dmg jeśli niewidzialny (+0.5x/lv)', cost: 25, type: 'melee', baseMult: 4.0, multPerLv: 0.5 },
            { level: 13, id: 'blade_fury', name: 'Furia Ostrzy', desc: 'Atak 3x na losowych wrogów (+1 atak/lv)', cost: 20, type: 'aoe', baseMult: 1.0, multPerLv: 0.15 },
            { level: 16, id: 'mark_death', name: 'Znak Śmierci', desc: 'Oznaczony wróg dostaje +50% dmg (+10%/lv)', cost: 16, type: 'melee' },
            { level: 19, id: 'vanish', name: 'Zniknięcie', desc: 'Natychmiastowa niewidzialność + leczenie 20% HP (+5%/lv)', cost: 22, type: 'buff' },
            { level: 22, id: 'death_blossom', name: 'Kwiat Śmierci', desc: 'Masowy atak 3x na wszystkich (+0.4x/lv)', cost: 35, type: 'aoe', baseMult: 3.0, multPerLv: 0.4 },
        ],
        tree: {
            agility: { name: 'Zwinność', nodes: [
                { id: 'quick_feet', name: 'Szybkie Nogi', desc: '+2 AGI', stat: 'agi', val: 2 },
                { id: 'evasion', name: 'Uniki', desc: '+3 AGI', stat: 'agi', val: 3 },
                { id: 'swift', name: 'Błyskawica', desc: '+5 AGI', stat: 'agi', val: 5 },
                { id: 'ghost', name: 'Duch', desc: '+8 AGI', stat: 'agi', val: 8 },
                { id: 'phantom', name: 'Fantom', desc: '+10 AGI', stat: 'agi', val: 10 },
            ]},
            lethality: { name: 'Morderczość', nodes: [
                { id: 'keen_edge', name: 'Celny Cios', desc: '+3 ATK', stat: 'atk', val: 3 },
                { id: 'exploit', name: 'Eksploatacja', desc: '+5 ATK', stat: 'atk', val: 5 },
                { id: 'critical', name: 'Krytyczny', desc: '+8 ATK', stat: 'atk', val: 8 },
                { id: 'deadly', name: 'Śmiercionośny', desc: '+10 ATK', stat: 'atk', val: 10 },
                { id: 'master', name: 'Mistrz Cieni', desc: '+15 ATK', stat: 'atk', val: 15 },
            ]},
        },
    },
    mage: {
        name: 'Mag',
        icon: '🪄',
        desc: 'Ataki dystansowe (3 kratki), kula ognia.',
        color: '#3498db',
        baseStats: { hp: 35, mp: 60, atk: 3, def: 1, agi: 3 },
        hpPerLevel: 4, mpPerLevel: 6, atkPerLevel: 1, defPerLevel: 0.5, agiPerLevel: 0.5,
        attacksPerTurn: 1,
        attackRange: 3,
        allowedItems: ['wand','staff','hat','robe','pants','shoes','tome'],
        skills: [
            { level: 1,  id: 'fireball', name: 'Kula Ognia', desc: 'Obszarowe 1.5x w promieniu 1 (+0.2x/lv)', cost: 12, type: 'ranged_aoe', baseMult: 1.5, multPerLv: 0.2 },
            { level: 2,  id: 'ice_bolt', name: 'Lodowy Pocisk', desc: '2x ATK + zamrożenie (+0.3x/lv)', cost: 10, type: 'ranged', baseMult: 2.0, multPerLv: 0.3 },
            { level: 4,  id: 'mana_shield', name: 'Tarcza Many', desc: 'Absorbuje dmg za MP przez 3 tury (+1/lv)', cost: 20, type: 'buff' },
            { level: 6,  id: 'lightning', name: 'Błyskawica', desc: '2.5x ATK natychmiastowe (+0.4x/lv)', cost: 18, type: 'ranged', baseMult: 2.5, multPerLv: 0.4 },
            { level: 8,  id: 'arcane_blast', name: 'Fala Arkany', desc: 'Odpycha i zadaje 1.5x (+0.2x/lv)', cost: 14, type: 'aoe', baseMult: 1.5, multPerLv: 0.2 },
            { level: 10, id: 'frost_nova', name: 'Mroźna Nova', desc: 'Zamraża wszystkich na 2 tury (+1/lv)', cost: 22, type: 'aoe' },
            { level: 13, id: 'chain_lightning', name: 'Łańcuch Błyskawic', desc: 'Uderza 3 wrogów po kolei 2x (+0.3x/lv)', cost: 24, type: 'ranged', baseMult: 2.0, multPerLv: 0.3 },
            { level: 16, id: 'teleport', name: 'Teleportacja', desc: 'Teleportuj się 5 kratek (+1/lv) w kierunku', cost: 15, type: 'buff' },
            { level: 19, id: 'meteor', name: 'Meteor', desc: '4x ATK obszarowe w promieniu 2 (+0.5x/lv)', cost: 35, type: 'ranged_aoe', baseMult: 4.0, multPerLv: 0.5 },
            { level: 22, id: 'time_stop', name: 'Zatrzymanie Czasu', desc: 'Zamraża WSZYSTKO na 3 tury (+1/lv)', cost: 40, type: 'aoe' },
        ],
        tree: {
            power: { name: 'Moc', nodes: [
                { id: 'arcane_power', name: 'Moc Arkany', desc: '+4 ATK', stat: 'atk', val: 4 },
                { id: 'empower', name: 'Wzmocnienie', desc: '+6 ATK', stat: 'atk', val: 6 },
                { id: 'surge', name: 'Fala Mocy', desc: '+10 ATK', stat: 'atk', val: 10 },
                { id: 'overcharge', name: 'Przeciążenie', desc: '+14 ATK', stat: 'atk', val: 14 },
                { id: 'archmage', name: 'Arcymag', desc: '+20 ATK', stat: 'atk', val: 20 },
            ]},
            wisdom: { name: 'Mądrość', nodes: [
                { id: 'meditation', name: 'Medytacja', desc: '+15 MP', stat: 'maxMp', val: 15 },
                { id: 'insight', name: 'Wgląd', desc: '+20 MP', stat: 'maxMp', val: 20 },
                { id: 'clarity', name: 'Jasność', desc: '+30 MP', stat: 'maxMp', val: 30 },
                { id: 'enlighten', name: 'Oświecenie', desc: '+40 MP', stat: 'maxMp', val: 40 },
                { id: 'transcend', name: 'Transcendencja', desc: '+60 MP', stat: 'maxMp', val: 60 },
            ]},
        },
    },
};

// ========== ITEM BASES ==========
const ITEM_BASES = {
    // Weapons
    sword:   { slot: 'weapon', stat: 'atk', base: 4, name: 'Miecz',    classes: ['knight','rogue'] },
    axe:     { slot: 'weapon', stat: 'atk', base: 5, name: 'Topór',     classes: ['knight'] },
    mace:    { slot: 'weapon', stat: 'atk', base: 6, name: 'Młot',      classes: ['knight'] },
    dagger:  { slot: 'weapon', stat: 'atk', base: 3, name: 'Sztylet',   classes: ['rogue'] },
    wand:    { slot: 'weapon', stat: 'atk', base: 4, name: 'Różdżka',   classes: ['mage'] },
    staff:   { slot: 'weapon', stat: 'atk', base: 5, name: 'Kostur',    classes: ['mage'] },
    // Head
    helmet:  { slot: 'head', stat: 'def', base: 3, name: 'Hełm',       classes: ['knight'] },
    hood:    { slot: 'head', stat: 'agi', base: 2, name: 'Kaptur',      classes: ['rogue'] },
    hat:     { slot: 'head', stat: 'atk', base: 2, name: 'Kapelusz',    classes: ['mage'] },
    // Chest
    armor:   { slot: 'chest', stat: 'def', base: 5, name: 'Zbroja',     classes: ['knight'] },
    cape:    { slot: 'chest', stat: 'agi', base: 3, name: 'Peleryna',   classes: ['rogue'] },
    robe:    { slot: 'chest', stat: 'def', base: 2, name: 'Szata',      classes: ['mage'] },
    // Legs
    pants:   { slot: 'legs', stat: 'def', base: 2, name: 'Spodnie',     classes: ['knight','mage'] },
    leggings:{ slot: 'legs', stat: 'agi', base: 2, name: 'Nogawice',    classes: ['rogue'] },
    // Feet
    boots:   { slot: 'feet', stat: 'def', base: 2, name: 'Buty',        classes: ['knight','rogue'] },
    shoes:   { slot: 'feet', stat: 'agi', base: 1, name: 'Trzewiki',    classes: ['mage'] },
    // Offhand
    shield:  { slot: 'offhand', stat: 'def', base: 4, name: 'Tarcza',   classes: ['knight'] },
    tome:    { slot: 'offhand', stat: 'atk', base: 3, name: 'Grimuar',  classes: ['mage'] },
    offhand_dagger: { slot: 'offhand', stat: 'atk', base: 2, name: 'Lewak',  classes: ['rogue'] },
};

const TIER_PREFIXES = {
    normal: '', uncommon: 'Dobr', rare: 'Wyborn', epic: 'Doskonal', legendary: 'Legendarn', mythic: 'Mityczn'
};

function genderSuffix(name, tier) {
    if (tier === 'normal') return '';
    const prefix = TIER_PREFIXES[tier];
    // Polish gender - rough approximation
    const feminine = ['Różdżka','Zbroja','Peleryna','Szata','Tarcza'];
    const neuter = [];
    if (feminine.some(f => name.includes(f))) return prefix + 'a ';
    const mascPlural = ['Buty','Spodnie','Nogawice','Trzewiki'];
    if (mascPlural.some(m => name.includes(m))) return prefix + 'e ';
    return prefix + 'y ';
}

function generateItem(itemType, level, forceTier, playerClass) {
    const base = ITEM_BASES[itemType];
    if (!base) return null;
    const tier = forceTier || rollTier();
    const mult = TIERS[tier].mult;
    const statVal = Math.max(1, Math.floor((base.base + level * 1.2) * mult));
    const reqLevel = Math.max(1, level - 1);

    const prefix = genderSuffix(base.name, tier);
    const item = {
        id: `${itemType}_${Date.now()}_${Math.random().toString(36).slice(2,5)}`,
        name: prefix + base.name,
        type: 'equipment',
        itemType,
        slot: base.slot,
        tier,
        level: reqLevel,
        classes: base.classes,
        price: Math.floor(25 * mult * (1 + level * 0.8)),
    };
    item[base.stat] = statVal;
    item.desc = `${base.stat.toUpperCase()} +${statVal} (Lv.${reqLevel})`;
    return item;
}

function generateItemForClass(playerClass, level, slot) {
    const classData = CLASSES[playerClass];
    if (!classData) return null;
    // Find valid item types for this class and slot
    const valid = Object.entries(ITEM_BASES).filter(([type, b]) =>
        b.classes.includes(playerClass) && (!slot || b.slot === slot)
    );
    if (valid.length === 0) return null;
    const [type] = valid[Math.floor(Math.random() * valid.length)];
    return generateItem(type, level);
}

function generateLootForClass(playerClass, level, luck) {
    const tier = rollTier(luck);
    // Random variation in level: -2 to +2
    const itemLevel = Math.max(1, level + Math.floor(Math.random() * 5) - 2);
    return generateItemForClass(playerClass, itemLevel);
}

function generatePotion(level) {
    const heal = 20 + level * 8;
    const r = Math.random();
    if (r < 0.5) return { id: 'hp_potion', name: 'Mikstura HP', type: 'consumable', subtype: 'hp', heal, count: 1, price: 15 + level * 4, desc: `Leczy ${heal} HP` };
    if (r < 0.75) return { id: 'big_hp_potion', name: 'Duża Mikstura HP', type: 'consumable', subtype: 'hp', heal: heal * 3, count: 1, price: 50 + level * 10, desc: `Leczy ${heal*3} HP` };
    if (r < 0.9) return { id: 'mp_potion', name: 'Mikstura Many', type: 'consumable', subtype: 'mp', mana: 20 + level * 5, count: 1, price: 20 + level * 5, desc: `+${20+level*5} MP` };
    return { id: 'big_mp_potion', name: 'Duża Mikstura Many', type: 'consumable', subtype: 'mp', mana: 50 + level * 10, count: 1, price: 60 + level * 12, desc: `+${50+level*10} MP` };
}

function canEquip(item, playerClass, playerLevel) {
    if (!item || item.type !== 'equipment') return false;
    if (item.level > playerLevel) return false;
    if (item.classes && !item.classes.includes(playerClass)) return false;
    // Rogue can't equip shields
    if (playerClass === 'rogue' && item.itemType === 'shield') return false;
    return true;
}
