// ============================================================
// ITEMS, CLASSES, EQUIPMENT SYSTEM
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

// ========== BASE ATTRIBUTES ==========
// STR: phys damage, crit damage
// DEX: accuracy, crit chance
// AGI: move speed, dodge
// VIT: HP, armor
// INT: CDR, mana
const BASE_ATTRIBUTES = ['str', 'dex', 'agi', 'vit', 'int'];
const ATTRIBUTE_NAMES = { str: 'Siła', dex: 'Zręczność', agi: 'Zwinność', vit: 'Wytrzymałość', int: 'Inteligencja' };
const MAX_STAT_POINTS = 20; // max points per attribute

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

// ========== 3-TIER CURRENCY ==========
const CURRENCY = {
    gold: { name: 'Złoto', color: '#f1c40f', value: 1 },
    platinum: { name: 'Platyna', color: '#bdc3c7', value: 100 },
    crystal: { name: 'Kryształ', color: '#9b59b6', value: 10000 },
};

function formatCurrency(goldAmount) {
    if (goldAmount >= 10000) {
        const crystals = Math.floor(goldAmount / 10000);
        const remainder = goldAmount % 10000;
        const plat = Math.floor(remainder / 100);
        const gold = remainder % 100;
        let parts = [];
        if (crystals > 0) parts.push(`${crystals}cc`);
        if (plat > 0) parts.push(`${plat}pp`);
        if (gold > 0) parts.push(`${gold}gp`);
        return parts.join(' ') || '0gp';
    }
    if (goldAmount >= 100) {
        const plat = Math.floor(goldAmount / 100);
        const gold = goldAmount % 100;
        return plat > 0 && gold > 0 ? `${plat}pp ${gold}gp` : plat > 0 ? `${plat}pp` : `${gold}gp`;
    }
    return `${goldAmount}gp`;
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

// ========== CHARACTER CLASSES ==========
const CLASSES = {
    knight: {
        name: 'Rycerz',
        icon: '⚔️',
        desc: 'Silny w obronie i ataku z bliska.',
        color: '#e74c3c',
        baseStats: { hp: 150, mp: 30, damage: 8, armor: 5, accuracy: 10, dodge: 2 },
        baseAttributes: { str: 3, dex: 1, agi: 1, vit: 3, int: 0 },
        hpPerLevel: 12, mpPerLevel: 3,
        attacksPerTurn: 1,
        baseAttackSpeed: 1.5,
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
                { id: 'thick_skin', name: 'Gruba Skóra', desc: '+3 Pancerz', stat: 'armor', val: 3 },
                { id: 'vitality', name: 'Witalność', desc: '+15 HP', stat: 'maxHp', val: 15 },
                { id: 'block', name: 'Blok', desc: '+5 Pancerz', stat: 'armor', val: 5 },
                { id: 'fortify', name: 'Fortyfikacja', desc: '+25 HP', stat: 'maxHp', val: 25 },
                { id: 'unbreakable', name: 'Niezłomny', desc: '+8 Pancerz', stat: 'armor', val: 8 },
            ]},
            offense: { name: 'Atak', nodes: [
                { id: 'sharp_edge', name: 'Ostre Ostrze', desc: '+3 Obrażenia', stat: 'damage', val: 3 },
                { id: 'brutal', name: 'Brutalność', desc: '+5 Obrażenia', stat: 'damage', val: 5 },
                { id: 'rage', name: 'Furia', desc: '+8 Obrażenia', stat: 'damage', val: 8 },
                { id: 'berserk', name: 'Berserk', desc: '+12 Obrażenia', stat: 'damage', val: 12 },
                { id: 'warlord', name: 'Pan Wojny', desc: '+15 Obrażenia', stat: 'damage', val: 15 },
            ]},
        },
    },
    rogue: {
        name: 'Łotrzyk',
        icon: '🗡️',
        desc: 'Zwinny, 2 ataki na turę, niewidzialność.',
        color: '#2ecc71',
        baseStats: { hp: 100, mp: 50, damage: 6, armor: 2, accuracy: 12, dodge: 8 },
        baseAttributes: { str: 1, dex: 3, agi: 3, vit: 1, int: 0 },
        hpPerLevel: 8, mpPerLevel: 4,
        attacksPerTurn: 2,
        baseAttackSpeed: 1.0,
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
                { id: 'quick_feet', name: 'Szybkie Nogi', desc: '+2 Unik', stat: 'dodge', val: 2 },
                { id: 'evasion', name: 'Uniki', desc: '+3 Unik', stat: 'dodge', val: 3 },
                { id: 'swift', name: 'Błyskawica', desc: '+5 Unik', stat: 'dodge', val: 5 },
                { id: 'ghost', name: 'Duch', desc: '+8 Unik', stat: 'dodge', val: 8 },
                { id: 'phantom', name: 'Fantom', desc: '+10 Unik', stat: 'dodge', val: 10 },
            ]},
            lethality: { name: 'Morderczość', nodes: [
                { id: 'keen_edge', name: 'Celny Cios', desc: '+3 Obrażenia', stat: 'damage', val: 3 },
                { id: 'exploit', name: 'Eksploatacja', desc: '+5 Obrażenia', stat: 'damage', val: 5 },
                { id: 'critical', name: 'Krytyczny', desc: '+8 Obrażenia', stat: 'damage', val: 8 },
                { id: 'deadly', name: 'Śmiercionośny', desc: '+10 Obrażenia', stat: 'damage', val: 10 },
                { id: 'master', name: 'Mistrz Cieni', desc: '+15 Obrażenia', stat: 'damage', val: 15 },
            ]},
        },
    },
    mage: {
        name: 'Mag',
        icon: '🪄',
        desc: 'Ataki dystansowe (3 kratki), kula ognia.',
        color: '#3498db',
        baseStats: { hp: 80, mp: 120, damage: 5, armor: 1, accuracy: 8, dodge: 3 },
        baseAttributes: { str: 0, dex: 1, agi: 1, vit: 1, int: 5 },
        hpPerLevel: 6, mpPerLevel: 8,
        attacksPerTurn: 1,
        baseAttackSpeed: 2.0,
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
                { id: 'arcane_power', name: 'Moc Arkany', desc: '+4 Obrażenia', stat: 'damage', val: 4 },
                { id: 'empower', name: 'Wzmocnienie', desc: '+6 Obrażenia', stat: 'damage', val: 6 },
                { id: 'surge', name: 'Fala Mocy', desc: '+10 Obrażenia', stat: 'damage', val: 10 },
                { id: 'overcharge', name: 'Przeciążenie', desc: '+14 Obrażenia', stat: 'damage', val: 14 },
                { id: 'archmage', name: 'Arcymag', desc: '+20 Obrażenia', stat: 'damage', val: 20 },
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
    archer: {
        name: 'Łucznik',
        icon: '🏹',
        desc: 'Ataki dystansowe (4 kratki), włócznie, łuki.',
        color: '#e67e22',
        baseStats: { hp: 110, mp: 50, damage: 6, armor: 3, accuracy: 14, dodge: 5 },
        baseAttributes: { str: 2, dex: 3, agi: 2, vit: 1, int: 0 },
        hpPerLevel: 8, mpPerLevel: 4,
        attacksPerTurn: 1,
        baseAttackSpeed: 1.3,
        attackRange: 4,
        allowedItems: ['bow','crossbow','spear','hood','leather_armor','leggings','boots','quiver'],
        skills: [
            { level: 1,  id: 'aimed_shot', name: 'Celny Strzał', desc: '2x ATK dystansowy (+0.3x/lv)', cost: 10, type: 'ranged', baseMult: 2.0, multPerLv: 0.3 },
            { level: 2,  id: 'multi_shot', name: 'Wielostrzał', desc: 'Strzela w 3 wrogów 1x (+0.15x/lv)', cost: 14, type: 'ranged_aoe', baseMult: 1.0, multPerLv: 0.15 },
            { level: 4,  id: 'dodge_roll', name: 'Unik', desc: '+30% AGI na 5s (+1s/lv)', cost: 12, type: 'buff' },
            { level: 6,  id: 'piercing_arrow', name: 'Przebijający Strzał', desc: '2.5x ATK ignoruje DEF (+0.4x/lv)', cost: 18, type: 'ranged', baseMult: 2.5, multPerLv: 0.4 },
            { level: 8,  id: 'rain_arrows', name: 'Deszcz Strzał', desc: 'Obszarowe 1.5x w promieniu 2 (+0.2x/lv)', cost: 22, type: 'ranged_aoe', baseMult: 1.5, multPerLv: 0.2 },
            { level: 10, id: 'spear_throw', name: 'Rzut Włócznią', desc: '3x ATK na 1 cel + ogłuszenie (+0.5x/lv)', cost: 20, type: 'ranged', baseMult: 3.0, multPerLv: 0.5 },
            { level: 13, id: 'hawk_eye', name: 'Sokolie Oko', desc: '+50% crit na 6s (+1s/lv)', cost: 16, type: 'buff' },
            { level: 16, id: 'trap', name: 'Pułapka', desc: 'Ogłusza wrogów w promieniu 1 na 3s (+1s/lv)', cost: 18, type: 'aoe' },
            { level: 19, id: 'sniper_shot', name: 'Snajperski Strzał', desc: '5x ATK na 1 cel (+0.8x/lv)', cost: 30, type: 'ranged', baseMult: 5.0, multPerLv: 0.8 },
            { level: 22, id: 'arrow_storm', name: 'Burza Strzał', desc: 'Masowy 3x na wszystkich w zasięgu (+0.4x/lv)', cost: 40, type: 'ranged_aoe', baseMult: 3.0, multPerLv: 0.4 },
        ],
        tree: {
            precision: { name: 'Precyzja', nodes: [
                { id: 'steady_aim', name: 'Pewna Ręka', desc: '+3 Obrażenia', stat: 'damage', val: 3 },
                { id: 'focus', name: 'Skupienie', desc: '+5 Obrażenia', stat: 'damage', val: 5 },
                { id: 'marksman', name: 'Strzelec', desc: '+8 Obrażenia', stat: 'damage', val: 8 },
                { id: 'sharpshooter', name: 'Snajper', desc: '+12 Obrażenia', stat: 'damage', val: 12 },
                { id: 'deadeye', name: 'Śmiertelne Oko', desc: '+15 Obrażenia', stat: 'damage', val: 15 },
            ]},
            survival: { name: 'Przetrwanie', nodes: [
                { id: 'tough_skin', name: 'Twarda Skóra', desc: '+10 HP', stat: 'maxHp', val: 10 },
                { id: 'nimble', name: 'Zwinność', desc: '+3 Unik', stat: 'dodge', val: 3 },
                { id: 'hardened', name: 'Zahartowany', desc: '+20 HP', stat: 'maxHp', val: 20 },
                { id: 'wind_runner', name: 'Biegacz', desc: '+5 Unik', stat: 'dodge', val: 5 },
                { id: 'ranger', name: 'Strażnik', desc: '+30 HP', stat: 'maxHp', val: 30 },
            ]},
        },
    },
    novice: {
        name: 'Nowicjusz',
        icon: '🌱',
        desc: 'Początkujący poszukiwacz przygód. Wybierz klasę na poziomie 20.',
        color: '#95a5a6',
        baseStats: { hp: 120, mp: 40, damage: 5, armor: 2, accuracy: 10, dodge: 3 },
        baseAttributes: { str: 2, dex: 2, agi: 2, vit: 2, int: 0 },
        hpPerLevel: 8, mpPerLevel: 4,
        attacksPerTurn: 1,
        baseAttackSpeed: 1.4,
        allowedItems: ['sword','dagger','club','tunic','simple_pants','sandals','wooden_shield'],
        skills: [
            { level: 1, id: 'basic_strike', name: 'Prosty Cios', desc: '1.5x obrażenia (+0.2x/lv)', cost: 6, type: 'melee', baseMult: 1.5, multPerLv: 0.2 },
            { level: 3, id: 'bandage', name: 'Opatrunek', desc: 'Leczy 15% HP (+3%/lv)', cost: 10, type: 'buff' },
            { level: 6, id: 'battle_shout', name: 'Okrzyk Bitewny', desc: '+20% DMG na 5s (+1s/lv)', cost: 12, type: 'buff' },
            { level: 10, id: 'desperate_blow', name: 'Desperacki Cios', desc: '2x DMG (+0.3x/lv)', cost: 15, type: 'melee', baseMult: 2.0, multPerLv: 0.3 },
            { level: 15, id: 'survivor', name: 'Instynkt Przetrwania', desc: '+25% HP na 5s (+1s/lv)', cost: 14, type: 'buff' },
        ],
        tree: {
            combat: { name: 'Walka', nodes: [
                { id: 'n_str', name: 'Siła', desc: '+2 Obrażenia', stat: 'damage', val: 2 },
                { id: 'n_tough', name: 'Twardość', desc: '+10 HP', stat: 'maxHp', val: 10 },
                { id: 'n_power', name: 'Moc', desc: '+3 Obrażenia', stat: 'damage', val: 3 },
                { id: 'n_endure', name: 'Wytrzymałość', desc: '+15 HP', stat: 'maxHp', val: 15 },
                { id: 'n_might', name: 'Potęga', desc: '+5 Obrażenia', stat: 'damage', val: 5 },
            ]},
            survival: { name: 'Przetrwanie', nodes: [
                { id: 'n_dodge', name: 'Unik', desc: '+2 Unik', stat: 'dodge', val: 2 },
                { id: 'n_armor', name: 'Pancerz', desc: '+2 Pancerz', stat: 'armor', val: 2 },
                { id: 'n_nimble', name: 'Zwinność', desc: '+3 Unik', stat: 'dodge', val: 3 },
                { id: 'n_shield', name: 'Ochrona', desc: '+3 Pancerz', stat: 'armor', val: 3 },
                { id: 'n_iron', name: 'Żelazo', desc: '+5 Pancerz', stat: 'armor', val: 5 },
            ]},
        },
    },
};

// ========== ITEM BASES ==========
const ITEM_BASES = {
    // Weapons - primary stat is damage
    sword:   { slot: 'weapon', primaryStat: 'damage', base: 4, name: 'Miecz',    classes: ['knight','rogue'] },
    axe:     { slot: 'weapon', primaryStat: 'damage', base: 5, name: 'Topór',     classes: ['knight'] },
    mace:    { slot: 'weapon', primaryStat: 'damage', base: 6, name: 'Młot',      classes: ['knight'] },
    dagger:  { slot: 'weapon', primaryStat: 'damage', base: 3, name: 'Sztylet',   classes: ['rogue'] },
    wand:    { slot: 'weapon', primaryStat: 'damage', base: 4, name: 'Różdżka',   classes: ['mage'] },
    staff:   { slot: 'weapon', primaryStat: 'damage', base: 5, name: 'Kostur',    classes: ['mage'] },
    // Head - primary stat is armor
    helmet:  { slot: 'head', primaryStat: 'armor', base: 3, name: 'Hełm',       classes: ['knight'] },
    hood:    { slot: 'head', primaryStat: 'dodge', base: 2, name: 'Kaptur',      classes: ['rogue','archer'] },
    hat:     { slot: 'head', primaryStat: 'maxMp', base: 5, name: 'Kapelusz',    classes: ['mage'] },
    // Chest - primary stat is armor
    armor:   { slot: 'chest', primaryStat: 'armor', base: 5, name: 'Zbroja',     classes: ['knight'] },
    cape:    { slot: 'chest', primaryStat: 'dodge', base: 3, name: 'Peleryna',   classes: ['rogue'] },
    robe:    { slot: 'chest', primaryStat: 'armor', base: 2, name: 'Szata',      classes: ['mage'] },
    // Legs
    pants:   { slot: 'legs', primaryStat: 'armor', base: 2, name: 'Spodnie',     classes: ['knight','mage'] },
    leggings:{ slot: 'legs', primaryStat: 'dodge', base: 2, name: 'Nogawice',    classes: ['rogue','archer'] },
    // Feet
    boots:   { slot: 'feet', primaryStat: 'moveSpeed', base: 2, name: 'Buty',    classes: ['knight','rogue','archer'] },
    shoes:   { slot: 'feet', primaryStat: 'moveSpeed', base: 1, name: 'Trzewiki', classes: ['mage'] },
    // Offhand
    shield:  { slot: 'offhand', primaryStat: 'armor', base: 4, name: 'Tarcza',   classes: ['knight'] },
    tome:    { slot: 'offhand', primaryStat: 'damage', base: 3, name: 'Grimuar',  classes: ['mage'] },
    offhand_dagger: { slot: 'offhand', primaryStat: 'damage', base: 2, name: 'Lewak',  classes: ['rogue'] },
    // Archer
    bow:     { slot: 'weapon', primaryStat: 'damage', base: 4, name: 'Łuk',       classes: ['archer'] },
    crossbow:{ slot: 'weapon', primaryStat: 'damage', base: 5, name: 'Kusza',     classes: ['archer'] },
    spear:   { slot: 'weapon', primaryStat: 'damage', base: 6, name: 'Włócznia',  classes: ['archer'] },
    leather_armor: { slot: 'chest', primaryStat: 'armor', base: 3, name: 'Skórzana Zbroja', classes: ['archer','rogue'] },
    quiver:  { slot: 'offhand', primaryStat: 'accuracy', base: 3, name: 'Kołczan',  classes: ['archer'] },
    // Novice items
    club:    { slot: 'weapon', primaryStat: 'damage', base: 3, name: 'Maczuga',   classes: ['novice'] },
    tunic:   { slot: 'chest',  primaryStat: 'armor',  base: 2, name: 'Tunika',    classes: ['novice'] },
    simple_pants: { slot: 'legs', primaryStat: 'armor', base: 1, name: 'Proste Spodnie', classes: ['novice'] },
    sandals: { slot: 'feet', primaryStat: 'moveSpeed', base: 1, name: 'Sandały',  classes: ['novice'] },
    wooden_shield: { slot: 'offhand', primaryStat: 'armor', base: 2, name: 'Drewniana Tarcza', classes: ['novice'] },
};

const TIER_PREFIXES = {
    normal: '', uncommon: 'Dobr', rare: 'Wyborn', epic: 'Doskonal', legendary: 'Legendarn', mythic: 'Mityczn'
};

function genderSuffix(name, tier) {
    if (tier === 'normal') return '';
    const prefix = TIER_PREFIXES[tier];
    // Polish gender - rough approximation
    const feminine = ['Różdżka','Zbroja','Peleryna','Szata','Tarcza','Kusza','Włócznia','Skórzana Zbroja'];
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
    const tierData = TIERS[tier];
    const mult = tierData.mult;
    const statCount = tierData.statCount; // number of stats based on rarity
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
        stats: {}, // multi-stat object
    };

    // Primary stat always present
    const primaryVal = Math.max(1, Math.floor((base.base + level * 1.2) * mult));
    item.stats[base.primaryStat] = primaryVal;

    // Roll additional stats based on tier stat count
    const availableStats = ITEM_STAT_POOL.filter(s => s.id !== base.primaryStat);
    for (let i = 1; i < statCount && availableStats.length > 0; i++) {
        // Weighted random pick
        const totalWeight = availableStats.reduce((s, st) => s + st.weight, 0);
        let roll = Math.random() * totalWeight;
        let picked = null;
        for (let j = 0; j < availableStats.length; j++) {
            roll -= availableStats[j].weight;
            if (roll <= 0) { picked = j; break; }
        }
        if (picked === null) picked = 0;
        const stat = availableStats.splice(picked, 1)[0];
        item.stats[stat.id] = getStatValue(stat.id, level, mult * 0.6); // secondary stats lower
    }

    // Build description from stats
    const descParts = [];
    for (const [k, v] of Object.entries(item.stats)) {
        const statInfo = ITEM_STAT_POOL.find(s => s.id === k);
        const name = statInfo ? statInfo.name : k.toUpperCase();
        descParts.push(`${name} +${v}`);
    }
    item.desc = descParts.join(', ') + ` (Lv.${reqLevel})`;

    // Backward compat: set flat stat properties too
    for (const [k, v] of Object.entries(item.stats)) {
        item[k] = v;
    }

    return item;
}

function generateItemForClass(playerClass, level, slot, maxTier) {
    const classData = CLASSES[playerClass];
    if (!classData) return null;
    // Find valid item types for this class and slot
    const valid = Object.entries(ITEM_BASES).filter(([type, b]) =>
        b.classes.includes(playerClass) && (!slot || b.slot === slot)
    );
    if (valid.length === 0) return null;
    const [type] = valid[Math.floor(Math.random() * valid.length)];
    const tier = maxTier ? rollTier(0, maxTier) : undefined;
    return generateItem(type, level, tier);
}

function generateLootForClass(playerClass, level, luck, playerLevel) {
    const maxTier = getMaxTierForLevel(playerLevel || level);
    const tier = rollTier(luck, maxTier);
    const itemLevel = Math.max(1, level + Math.floor(Math.random() * 5) - 2);
    return generateItemForClass(playerClass, itemLevel, undefined, maxTier);
}

function generatePotion(level) {
    const heal = 20 + level * 8;
    const r = Math.random();
    if (r < 0.5) return { id: 'hp_potion', name: 'Mikstura HP', type: 'consumable', subtype: 'hp', heal, count: 1, stackable: true, maxStack: 100, price: 15 + level * 4, desc: `Leczy ${heal} HP` };
    if (r < 0.75) return { id: 'big_hp_potion', name: 'Duża Mikstura HP', type: 'consumable', subtype: 'hp', heal: heal * 3, count: 1, stackable: true, maxStack: 100, price: 50 + level * 10, desc: `Leczy ${heal*3} HP` };
    if (r < 0.9) return { id: 'mp_potion', name: 'Mikstura Many', type: 'consumable', subtype: 'mp', mana: 20 + level * 5, count: 1, stackable: true, maxStack: 100, price: 20 + level * 5, desc: `+${20+level*5} MP` };
    return { id: 'big_mp_potion', name: 'Duża Mikstura Many', type: 'consumable', subtype: 'mp', mana: 50 + level * 10, count: 1, stackable: true, maxStack: 100, price: 60 + level * 12, desc: `+${50+level*10} MP` };
}

function canEquip(item, playerClass, playerLevel) {
    if (!item || item.type !== 'equipment') return false;
    if (item.level > playerLevel) return false;
    if (item.classes) {
        // Novice can equip novice items + sword/dagger (shared)
        if (playerClass === 'novice') {
            if (!item.classes.includes('novice') && !['sword','dagger'].includes(item.itemType)) return false;
        } else if (!item.classes.includes(playerClass)) return false;
    }
    if (playerClass === 'rogue' && item.itemType === 'shield') return false;
    return true;
}

// ========== PREDETERMINED MONSTER LOOT TABLES ==========
// Each monster type has specific drops to encourage exploration
const MONSTER_LOOT_TABLES = {
    'Slime':          { items: ['dagger','sword'], potionChance: 0.3 },
    'Goblin':         { items: ['dagger','hood','cape'], potionChance: 0.2 },
    'Wilk':           { items: ['leather_armor','leggings'], potionChance: 0.15 },
    'Szkielet':       { items: ['sword','helmet','shield','pants'], potionChance: 0.2 },
    'Dziki Koń':      { items: ['boots','leggings','leather_armor'], potionChance: 0.1 },
    'Centaur':        { items: ['bow','spear','armor'], potionChance: 0.15 },
    'Pająk':          { items: ['cape','hood','offhand_dagger'], potionChance: 0.25 },
    'Ork':            { items: ['axe','mace','armor','helmet'], potionChance: 0.15 },
    'Bandyta':        { items: ['dagger','sword','offhand_dagger','cape'], potionChance: 0.3 },
    'Drzewiec':       { items: ['staff','wand','robe'], potionChance: 0.2 },
    'Leśny Mag':      { items: ['staff','wand','hat','tome','robe'], potionChance: 0.25 },
    'Wyrm Leśny':     { items: ['crossbow','spear','armor','shield'], potionChance: 0.1 },
    'Żuk':            { items: ['helmet','boots','pants'], potionChance: 0.2 },
    'Widmo':          { items: ['wand','tome','hat','robe'], potionChance: 0.2 },
    'Troll':          { items: ['mace','axe','armor','pants'], potionChance: 0.15 },
    'Bagiennik':      { items: ['staff','leather_armor','leggings'], potionChance: 0.15 },
    'Demon Bagien':   { items: ['staff','tome','robe','hat'], potionChance: 0.1 },
    'Golem':          { items: ['mace','shield','armor','helmet'], potionChance: 0.1 },
    'Gryf':           { items: ['bow','crossbow','quiver','leather_armor'], potionChance: 0.15 },
    'Rycerz Cieni':   { items: ['sword','shield','armor','helmet','pants','boots'], potionChance: 0.15 },
    'Lodowy Golem':   { items: ['mace','shield','armor'], potionChance: 0.1 },
    'Smok Młody':     { items: ['sword','axe','armor','shield','tome'], potionChance: 0.1 },
    'Skorpion':       { items: ['dagger','offhand_dagger','leggings'], potionChance: 0.2 },
    'Mumia':          { items: ['staff','wand','robe','hat'], potionChance: 0.15 },
    'Dżinn':          { items: ['wand','staff','tome','hat','robe'], potionChance: 0.2 },
    'Ognisty Elem':   { items: ['staff','wand','tome'], potionChance: 0.15 },
    'Sfinks':         { items: ['tome','staff','hat','robe'], potionChance: 0.1 },
    'Demon Piasków':  { items: ['axe','mace','armor','shield'], potionChance: 0.1 },
    'Wilk Śnieżny':   { items: ['leather_armor','boots','leggings'], potionChance: 0.2 },
    'Szkielet Mróz':  { items: ['sword','helmet','shield'], potionChance: 0.2 },
    'Widmo Zimy':     { items: ['wand','tome','hat'], potionChance: 0.2 },
    'Mroźny Wyrm':    { items: ['crossbow','spear','armor','shield','helmet'], potionChance: 0.1 },
    // Starter island monsters
    'Szczur':          { items: ['club','sandals'], potionChance: 0.35 },
    'Krab':            { items: ['wooden_shield','sandals'], potionChance: 0.3 },
    'Meduza':          { items: ['tunic','simple_pants'], potionChance: 0.25 },
    'Dziki Królik':    { items: ['sandals','simple_pants','club'], potionChance: 0.3 },
    'Bies Plażowy':    { items: ['club','tunic','wooden_shield'], potionChance: 0.25 },
    'Pirat':           { items: ['sword','dagger','tunic','simple_pants'], potionChance: 0.2 },
    'Kapitan Piratów': { items: ['sword','dagger','tunic','wooden_shield'], potionChance: 0.15 },
};

function generateMonsterLoot(monsterName, monsterLevel, playerLevel) {
    const table = MONSTER_LOOT_TABLES[monsterName];
    if (!table) return null;
    const maxTier = getMaxTierForLevel(playerLevel || monsterLevel);
    const itemType = table.items[Math.floor(Math.random() * table.items.length)];
    return generateItem(itemType, monsterLevel, rollTier(0, maxTier));
}

// ========== STACKABLE ITEMS ==========
function isStackable(item) {
    return item && (item.stackable || item.type === 'consumable');
}

function tryStackItem(inventory, newItem) {
    if (!isStackable(newItem)) return false;
    const existing = inventory.find(i => i.id === newItem.id && isStackable(i));
    if (existing) {
        const maxStack = existing.maxStack || 100;
        const canAdd = Math.min(newItem.count || 1, maxStack - (existing.count || 1));
        if (canAdd > 0) {
            existing.count = (existing.count || 1) + canAdd;
            return true;
        }
    }
    return false;
}

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
