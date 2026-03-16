// ============================================================
// HEIGHT SYSTEM - 3 height levels for terrain traversal
// ============================================================
// Height 0 = low (water, swamp, plains)
// Height 1 = mid (forest, hills, normal terrain)
// Height 2 = high (mountains, snow peaks, elevated plateaus)

World.getHeight = function(wx, wy) {
    // Inside dungeons or houses: flat (no height)
    if (this.activeDungeon) return 0;
    const tile = this.getTile(wx, wy);
    const T = this.T;

    // Explicit tile heights
    if (tile === T.WATER || tile === T.LAVA || tile === T.SWAMP) return 0;
    if (tile === T.MOUNTAIN || tile === T.SNOW) return 2;
    if (tile === T.ROCK) return 2;

    // Biome-based heights
    const biome = this.getBiome(wx, wy);
    if (biome === this.BIOME.MOUNTAIN) return 2;
    if (biome === this.BIOME.SNOW) return 2;
    if (biome === this.BIOME.SWAMP) return 0;

    // Village/town areas always at mid level
    const cx = Math.floor(wx / this.CHUNK_SIZE);
    const cy = Math.floor(wy / this.CHUNK_SIZE);
    if (this.isVillageChunk(cx, cy)) return 1;

    // Paths and bridges are always traversable (act as ramps)
    if (tile === T.PATH || tile === T.BRIDGE || tile === T.STONE_FLOOR ||
        tile === T.CAVE_ENTRY || tile === T.FOREST_ENTRY) return -1; // -1 = "any height" (ramp)

    // Forest = mid
    if (biome === this.BIOME.FOREST) return 1;
    // Desert = mid
    if (biome === this.BIOME.DESERT) return 1;

    // Default plains = mid
    return 1;
};

// Check if movement between two heights is allowed
World.canTraverseHeight = function(fromX, fromY, toX, toY) {
    const h1 = this.getHeight(fromX, fromY);
    const h2 = this.getHeight(toX, toY);
    // Ramp tiles (-1) connect to any height
    if (h1 === -1 || h2 === -1) return true;
    // Can move between adjacent height levels (diff <= 1)
    return Math.abs(h1 - h2) <= 1;
};
