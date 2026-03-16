// ============================================================
// ITEM FACTORY - Generation functions for equipment, loot,
// potions, and monster drops. Depends on item-defs.js and
// class-defs.js being loaded first (shared global scope).
// ============================================================

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
    // New monsters
    'Szczur Gigant':  { items: ['dagger','sandals','club'], potionChance: 0.3 },
    'Rycerz Rozbójnik':{ items: ['sword','longsword','armor','helmet','shield'], potionChance: 0.2 },
    'Centaur Weteran':{ items: ['spear','longbow','plate_armor','great_helm'], potionChance: 0.1 },
    'Rycerz Zagłady': { items: ['warhammer','battleaxe','plate_armor','tower_shield','great_helm'], potionChance: 0.05 },
    'Wielki Pająk':   { items: ['cape','shadow_vest','offhand_dagger','kris'], potionChance: 0.2 },
    'Ork Szaman':     { items: ['staff','scepter','robe','hat'], potionChance: 0.2 },
    'Starożytny Drzewiec': { items: ['staff','scepter','arcane_robe','circlet','orb'], potionChance: 0.05 },
    'Trujący Żuk':    { items: ['dagger','kris','hood','mask','leggings'], potionChance: 0.2 },
    'Troll Szaman':   { items: ['staff','wand','robe','hat','tome'], potionChance: 0.15 },
    'Hydra Bagienna': { items: ['battleaxe','warhammer','plate_armor','tower_shield'], potionChance: 0.05 },
    'Kamieniak':      { items: ['mace','helmet','shield','boots'], potionChance: 0.15 },
    'Jaskiniowy Niedźwiedź':{ items: ['leather_armor','ranger_vest','boots','leggings'], potionChance: 0.15 },
    'Gigant Górski':  { items: ['warhammer','battleaxe','plate_armor','great_helm'], potionChance: 0.1 },
    'Prasmok':        { items: ['longsword','warhammer','plate_armor','tower_shield','circlet','scepter'], potionChance: 0.05 },
    'Piaskowy Robak': { items: ['dagger','kris','leggings','boots'], potionChance: 0.2 },
    'Faraon Nieumarły':{ items: ['scepter','circlet','arcane_robe','orb','tome'], potionChance: 0.1 },
    'Wieczny Sfinks': { items: ['scepter','staff','arcane_robe','circlet','orb'], potionChance: 0.05 },
    'Yeti':           { items: ['mace','leather_armor','boots','plate_legs'], potionChance: 0.15 },
    'Lodowy Rycerz':  { items: ['longsword','armor','shield','helmet','plate_boots'], potionChance: 0.1 },
    'Mroźny Smok':    { items: ['longbow','heavy_crossbow','plate_armor','great_helm','tower_shield'], potionChance: 0.05 },
    'Król Zimy':      { items: ['warhammer','plate_armor','tower_shield','great_helm','circlet','scepter'], potionChance: 0.03 },
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
