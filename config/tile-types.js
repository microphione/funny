// ============================================================
// TILE TYPES, BIOMES, AND BASE ATTRIBUTE DEFINITIONS
// Extracted from world.js and items.js - shared enums and
// constants used across the entire game.
// ============================================================

// Tile type enum - must match World.T (World.T references this)
const T = {
    GRASS: 0, PATH: 1, WATER: 2, WALL: 3, TREE: 4,
    HOUSE: 5, DOOR: 6, SHOP_WEAPON: 7, SHOP_ARMOR: 8,
    SHOP_POTION: 9, INN: 10, BRIDGE: 11, DARK_GRASS: 12,
    CAVE_FLOOR: 13, CAVE_WALL: 14, CAVE_ENTRY: 15,
    FOREST_ENTRY: 16, FLOWER: 17, SIGN: 18, CHEST: 19,
    STONE_FLOOR: 20, FENCE: 21, WELL: 22, STATUE: 23,
    SWAMP: 24, MOUNTAIN: 25, DESERT: 26, ROCK: 27,
    SWAMP_TREE: 28, CACTUS: 29, VILLAGE_HUT: 30,
    NPC_QUEST: 31, NPC_QUEST2: 32, NPC_SHOPKEEPER: 33,
    SHOP_FLOOR: 35, SHOP_WEAPON_NPC: 36, SHOP_ARMOR_NPC: 37,
    SHOP_POTION_NPC: 38, QUEST_ITEM: 39,
    GROUND_LOOT: 40, // visual marker for ground loot
    HOUSE_DOOR: 41, // buyable house door
    TOWN_BUILDING: 42, // non-buyable building
    TOWN_BUILDING_DOOR: 43, // door to town building with NPC
    LAVA: 44,
    SNOW: 45,
    SNOW_PINE: 46,
    HOUSE_WALL: 47,   // proper wall (all sides)
    HOUSE_ROOF: 48,   // roof over interior (hidden when inside)
    HOUSE_FLOOR: 49,  // walkable interior floor
    HOUSE_WINDOW: 50, // window in wall (can see through)
    STAIRS_UP: 51,    // stairs going up (enter to go to upper floor)
    STAIRS_DOWN: 52,  // stairs going down (enter to return to lower floor)
};

// Biome enum
const BIOME = { PLAINS: 0, FOREST: 1, SWAMP: 2, MOUNTAIN: 3, DESERT: 4, SNOW: 5 };

// ========== BASE ATTRIBUTES ==========
// STR: phys damage, crit damage
// DEX: accuracy, crit chance
// AGI: move speed, dodge
// VIT: HP, armor
// INT: CDR, mana
const BASE_ATTRIBUTES = ['str', 'dex', 'agi', 'vit', 'int'];
const ATTRIBUTE_NAMES = { str: 'Siła', dex: 'Zręczność', agi: 'Zwinność', vit: 'Wytrzymałość', int: 'Inteligencja' };
const MAX_STAT_POINTS = 20; // max points per attribute
