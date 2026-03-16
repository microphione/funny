// ============================================================
// ITEM DEFINITIONS - Tiers, stats, equipment slots, item bases
// Extracted from items.js. Contains all item-related constants
// and utility functions for equipment configuration.
// ============================================================

// ========== TIERS ==========
const TIERS = {
    normal:    { name: 'Zwykły',      color: '#aaaaaa', mult: 1.0, dropWeight: 70,   statCount: 1 },
    uncommon:  { name: 'Niezwykły',   color: '#2ecc71', mult: 1.3, dropWeight: 20,   statCount: 2 },
    rare:      { name: 'Rzadki',      color: '#3498db', mult: 1.7, dropWeight: 7,    statCount: 3 },
    epic:      { name: 'Epicki',      color: '#a855f7', mult: 2.2, dropWeight: 2.2,  statCount: 4 },
    legendary: { name: 'Legendarny',  color: '#f59e0b', mult: 3.0, dropWeight: 0.6,  statCount: 5, glow: true },
    mythic:    { name: 'Mityczny',    color: '#ef4444', mult: 4.5, dropWeight: 0.08, statCount: 6, glow: true, unique: true },
};
const TIER_ORDER = ['normal','uncommon','rare','epic','legendary','mythic'];

// BASE_ATTRIBUTES, ATTRIBUTE_NAMES, MAX_STAT_POINTS defined in tile-types.js

// ========== ITEM STAT POOL ==========
// Stats that can roll on items (derived stats)
const ITEM_STAT_POOL = [
    { id: 'damage', name: 'Obrażenia', weight: 10 },
    { id: 'armor', name: 'Pancerz', weight: 10 },
    { id: 'maxHp', name: 'HP', weight: 8 },
    { id: 'maxMp', name: 'MP', weight: 6 },
    { id: 'accuracy', name: 'Celność', weight: 7 },
    { id: 'attackSpeed', name: 'Szybkość Ataku', weight: 5 },
    { id: 'moveSpeed', name: 'Szybkość Ruchu', weight: 4 },
    { id: 'critChance', name: 'Szansa Kryty', weight: 6 },
    { id: 'critMult', name: 'Mnożnik Kryty', weight: 4 },
    { id: 'cdr', name: 'Redukcja CD', weight: 5 },
    { id: 'dodge', name: 'Unik', weight: 6 },
    { id: 'stunChance', name: 'Szansa Ogłusz.', weight: 3 },
];

// Stat value ranges per level multiplier
function getStatValue(statId, level, tierMult) {
    const base = Math.max(1, Math.floor(level * 0.8));
    switch (statId) {
        case 'damage': return Math.max(1, Math.floor((2 + base * 1.2) * tierMult));
        case 'armor': return Math.max(1, Math.floor((1 + base * 0.8) * tierMult));
        case 'maxHp': return Math.max(3, Math.floor((5 + base * 2.5) * tierMult));
        case 'maxMp': return Math.max(2, Math.floor((3 + base * 1.5) * tierMult));
        case 'accuracy': return Math.max(1, Math.floor((2 + base * 0.6) * tierMult));
        case 'attackSpeed': return Math.max(1, Math.floor((1 + base * 0.3) * tierMult));
        case 'moveSpeed': return Math.max(1, Math.floor((1 + base * 0.2) * tierMult));
        case 'critChance': return Math.max(1, Math.floor((1 + base * 0.4) * tierMult));
        case 'critMult': return Math.max(1, Math.floor((2 + base * 0.3) * tierMult));
        case 'cdr': return Math.max(1, Math.floor((1 + base * 0.3) * tierMult));
        case 'dodge': return Math.max(1, Math.floor((1 + base * 0.4) * tierMult));
        case 'stunChance': return Math.max(1, Math.floor((1 + base * 0.2) * tierMult));
        default: return 1;
    }
}

// ========== TIBIA XP FORMULA ==========
// Total XP needed to reach level x: 50x³/3 - 100x² + 850x/3 - 200
function xpForLevel(level) {
    if (level <= 1) return 0;
    return Math.floor(50 * level * level * level / 3 - 100 * level * level + 850 * level / 3 - 200);
}
function xpToNextLevel(level) {
    return xpForLevel(level + 1) - xpForLevel(level);
}

// ========== PROGRESSIVE CONTENT UNLOCKING ==========
function getMaxTierForLevel(playerLevel) {
    if (playerLevel >= 100) return 'mythic';
    if (playerLevel >= 80) return 'legendary';
    if (playerLevel >= 60) return 'epic';
    if (playerLevel >= 40) return 'rare';
    if (playerLevel >= 20) return 'uncommon';
    return 'normal';
}

function rollTier(luck, maxTier) {
    const maxIdx = maxTier ? TIER_ORDER.indexOf(maxTier) : TIER_ORDER.length - 1;
    const r = Math.random() * 100 - (luck || 0) * 5;
    let acc = 0;
    for (let i = 0; i < TIER_ORDER.length; i++) {
        const t = TIER_ORDER[i];
        acc += TIERS[t].dropWeight;
        if (r < acc) return i <= maxIdx ? t : TIER_ORDER[maxIdx];
    }
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

// ========== ITEM BASES ==========
const ITEM_BASES = {
    // ---- Weapons ----
    sword:       { slot: 'weapon', primaryStat: 'damage', base: 4, name: 'Miecz',        classes: ['knight','rogue'] },
    longsword:   { slot: 'weapon', primaryStat: 'damage', base: 5, name: 'Długi Miecz',  classes: ['knight'] },
    axe:         { slot: 'weapon', primaryStat: 'damage', base: 5, name: 'Topór',         classes: ['knight'] },
    battleaxe:   { slot: 'weapon', primaryStat: 'damage', base: 7, name: 'Topór Bojowy',  classes: ['knight'] },
    mace:        { slot: 'weapon', primaryStat: 'damage', base: 6, name: 'Młot',          classes: ['knight'] },
    warhammer:   { slot: 'weapon', primaryStat: 'damage', base: 8, name: 'Młot Wojenny',  classes: ['knight'] },
    dagger:      { slot: 'weapon', primaryStat: 'damage', base: 3, name: 'Sztylet',       classes: ['rogue'] },
    kris:        { slot: 'weapon', primaryStat: 'damage', base: 4, name: 'Kris',          classes: ['rogue'] },
    rapier:      { slot: 'weapon', primaryStat: 'damage', base: 5, name: 'Rapier',        classes: ['rogue'] },
    wand:        { slot: 'weapon', primaryStat: 'damage', base: 4, name: 'Różdżka',       classes: ['mage'] },
    staff:       { slot: 'weapon', primaryStat: 'damage', base: 5, name: 'Kostur',        classes: ['mage'] },
    scepter:     { slot: 'weapon', primaryStat: 'damage', base: 6, name: 'Berło',         classes: ['mage'] },
    // ---- Head ----
    helmet:      { slot: 'head', primaryStat: 'armor', base: 3, name: 'Hełm',         classes: ['knight'] },
    great_helm:  { slot: 'head', primaryStat: 'armor', base: 5, name: 'Wielki Hełm',  classes: ['knight'] },
    hood:        { slot: 'head', primaryStat: 'dodge', base: 2, name: 'Kaptur',        classes: ['rogue','archer'] },
    mask:        { slot: 'head', primaryStat: 'dodge', base: 3, name: 'Maska',         classes: ['rogue'] },
    hat:         { slot: 'head', primaryStat: 'maxMp', base: 5, name: 'Kapelusz',      classes: ['mage'] },
    circlet:     { slot: 'head', primaryStat: 'maxMp', base: 7, name: 'Diadem',        classes: ['mage'] },
    ranger_hat:  { slot: 'head', primaryStat: 'accuracy', base: 3, name: 'Kapelusz Łowcy', classes: ['archer'] },
    // ---- Chest ----
    armor:       { slot: 'chest', primaryStat: 'armor', base: 5, name: 'Zbroja',       classes: ['knight'] },
    plate_armor: { slot: 'chest', primaryStat: 'armor', base: 7, name: 'Pełna Zbroja', classes: ['knight'] },
    cape:        { slot: 'chest', primaryStat: 'dodge', base: 3, name: 'Peleryna',     classes: ['rogue'] },
    shadow_vest: { slot: 'chest', primaryStat: 'dodge', base: 4, name: 'Kamizelka Cieni', classes: ['rogue'] },
    robe:        { slot: 'chest', primaryStat: 'armor', base: 2, name: 'Szata',        classes: ['mage'] },
    arcane_robe: { slot: 'chest', primaryStat: 'maxMp', base: 8, name: 'Szata Arkany', classes: ['mage'] },
    leather_armor: { slot: 'chest', primaryStat: 'armor', base: 3, name: 'Skórzana Zbroja', classes: ['archer','rogue'] },
    ranger_vest: { slot: 'chest', primaryStat: 'armor', base: 4, name: 'Kamizelka Łowcy', classes: ['archer'] },
    // ---- Legs ----
    pants:       { slot: 'legs', primaryStat: 'armor', base: 2, name: 'Spodnie',       classes: ['knight','mage'] },
    plate_legs:  { slot: 'legs', primaryStat: 'armor', base: 4, name: 'Nagolenniki',   classes: ['knight'] },
    leggings:    { slot: 'legs', primaryStat: 'dodge', base: 2, name: 'Nogawice',      classes: ['rogue','archer'] },
    shadow_legs: { slot: 'legs', primaryStat: 'dodge', base: 3, name: 'Spodnie Cieni', classes: ['rogue'] },
    ranger_legs: { slot: 'legs', primaryStat: 'dodge', base: 3, name: 'Spodnie Łowcy', classes: ['archer'] },
    // ---- Feet ----
    boots:       { slot: 'feet', primaryStat: 'moveSpeed', base: 2, name: 'Buty',      classes: ['knight','rogue','archer'] },
    plate_boots: { slot: 'feet', primaryStat: 'armor', base: 3, name: 'Ciężkie Buty',  classes: ['knight'] },
    shoes:       { slot: 'feet', primaryStat: 'moveSpeed', base: 1, name: 'Trzewiki',  classes: ['mage'] },
    arcane_boots:{ slot: 'feet', primaryStat: 'maxMp', base: 4, name: 'Buty Arkany',   classes: ['mage'] },
    swift_boots: { slot: 'feet', primaryStat: 'moveSpeed', base: 3, name: 'Szybkie Buty', classes: ['rogue','archer'] },
    // ---- Offhand ----
    shield:      { slot: 'offhand', primaryStat: 'armor', base: 4, name: 'Tarcza',     classes: ['knight'] },
    tower_shield:{ slot: 'offhand', primaryStat: 'armor', base: 6, name: 'Tarcza Wieżowa', classes: ['knight'] },
    tome:        { slot: 'offhand', primaryStat: 'damage', base: 3, name: 'Grimuar',   classes: ['mage'] },
    orb:         { slot: 'offhand', primaryStat: 'maxMp', base: 5, name: 'Kula Mocy',  classes: ['mage'] },
    offhand_dagger: { slot: 'offhand', primaryStat: 'damage', base: 2, name: 'Lewak',  classes: ['rogue'] },
    buckler:     { slot: 'offhand', primaryStat: 'dodge', base: 3, name: 'Puklerz',    classes: ['rogue'] },
    // ---- Archer ----
    bow:         { slot: 'weapon', primaryStat: 'damage', base: 4, name: 'Łuk',        classes: ['archer'] },
    longbow:     { slot: 'weapon', primaryStat: 'damage', base: 6, name: 'Długi Łuk',  classes: ['archer'] },
    crossbow:    { slot: 'weapon', primaryStat: 'damage', base: 5, name: 'Kusza',      classes: ['archer'] },
    heavy_crossbow: { slot: 'weapon', primaryStat: 'damage', base: 7, name: 'Ciężka Kusza', classes: ['archer'] },
    spear:       { slot: 'weapon', primaryStat: 'damage', base: 6, name: 'Włócznia',   classes: ['archer'] },
    javelin:     { slot: 'weapon', primaryStat: 'damage', base: 5, name: 'Oszczep',    classes: ['archer'] },
    quiver:      { slot: 'offhand', primaryStat: 'accuracy', base: 3, name: 'Kołczan', classes: ['archer'] },
    enchanted_quiver: { slot: 'offhand', primaryStat: 'accuracy', base: 5, name: 'Magiczny Kołczan', classes: ['archer'] },
    // ---- Novice ----
    club:        { slot: 'weapon', primaryStat: 'damage', base: 3, name: 'Maczuga',    classes: ['novice'] },
    tunic:       { slot: 'chest',  primaryStat: 'armor',  base: 2, name: 'Tunika',     classes: ['novice'] },
    simple_pants:{ slot: 'legs', primaryStat: 'armor', base: 1, name: 'Proste Spodnie',classes: ['novice'] },
    sandals:     { slot: 'feet', primaryStat: 'moveSpeed', base: 1, name: 'Sandały',   classes: ['novice'] },
    wooden_shield: { slot: 'offhand', primaryStat: 'armor', base: 2, name: 'Drewniana Tarcza', classes: ['novice'] },
};

const TIER_PREFIXES = {
    normal: '', uncommon: 'Dobr', rare: 'Wyborn', epic: 'Doskonal', legendary: 'Legendarn', mythic: 'Mityczn'
};

function genderSuffix(name, tier) {
    if (tier === 'normal') return '';
    const prefix = TIER_PREFIXES[tier];
    // Polish gender - rough approximation
    const feminine = ['Różdżka','Zbroja','Peleryna','Szata','Tarcza','Kusza','Włócznia','Skórzana Zbroja','Maczuga','Tunika','Maska','Kamizelka','Kula'];
    const neuter = ['Berło'];
    if (feminine.some(f => name.includes(f))) return prefix + 'a ';
    if (neuter.some(n => name.includes(n))) return prefix + 'e ';
    const mascPlural = ['Buty','Spodnie','Nogawice','Trzewiki','Nagolenniki'];
    if (mascPlural.some(m => name.includes(m))) return prefix + 'e ';
    return prefix + 'y ';
}
