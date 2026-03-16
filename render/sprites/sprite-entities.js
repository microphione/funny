// ============================================================
// SPRITE ENTITIES - Player sprites
// ============================================================

// ========== PLAYER SPRITES (32x32 detailed) ==========
Sprites.initPlayer = function() {
    const dirs = ['down','up','left','right'];
    const px = this.px;

    dirs.forEach(dir => {
        for (let frame = 0; frame < 4; frame++) {
            this.create(`player_${dir}_${frame}`, (ctx) => {
                const S = 32;
                const walk = (frame === 1) ? -1 : (frame === 3) ? 1 : 0;
                const bob = (frame === 1 || frame === 3) ? -1 : 0;

                // Shadow
                px(ctx, 8, 28, 'rgba(0,0,0,0.3)', 16, 4);

                if (dir === 'up') {
                    // === BACK VIEW ===
                    // Boots
                    px(ctx, 10 + walk, 26, '#5a3d12', 5, 6);
                    px(ctx, 18 - walk, 26, '#5a3d12', 5, 6);
                    px(ctx, 11 + walk, 27, '#6d4c1d', 3, 4);
                    px(ctx, 19 - walk, 27, '#6d4c1d', 3, 4);
                    // Pants
                    px(ctx, 10, 20, '#2c3e50', 12, 8);
                    px(ctx, 12, 22, '#34495e', 8, 4);
                    // Belt
                    px(ctx, 10, 20, '#5a3d12', 12, 2);
                    // Shirt (back)
                    px(ctx, 8, 10 + bob, '#2573a7', 16, 12);
                    px(ctx, 10, 12 + bob, '#2980b9', 12, 8);
                    // Cape/pack
                    px(ctx, 10, 12 + bob, '#8B4513', 12, 6);
                    px(ctx, 12, 14 + bob, '#7B4420', 8, 2);
                    px(ctx, 11, 13 + bob, '#6B3410', 10, 1);
                    // Arms
                    px(ctx, 4, 12 + bob, '#2573a7', 4, 8);
                    px(ctx, 24, 12 + bob, '#2573a7', 4, 8);
                    // Head (back of hair)
                    px(ctx, 10, 2 + bob, '#5c3317', 12, 10);
                    px(ctx, 8, 0 + bob, '#5c3317', 16, 8);
                    px(ctx, 8, 0 + bob, '#4a2510', 16, 4);
                    px(ctx, 9, 1 + bob, '#3a1a08', 14, 2);
                } else if (dir === 'down') {
                    // === FRONT VIEW ===
                    // Boots
                    px(ctx, 8 + walk, 26, '#5a3d12', 6, 6);
                    px(ctx, 18 - walk, 26, '#5a3d12', 6, 6);
                    px(ctx, 10 + walk, 28, '#6d4c1d', 2, 2);
                    px(ctx, 20 - walk, 28, '#6d4c1d', 2, 2);
                    // Pants
                    px(ctx, 10, 20, '#2c3e50', 12, 8);
                    px(ctx, 14, 22, '#34495e', 4, 4);
                    // Belt
                    px(ctx, 10, 20, '#5a3d12', 12, 2);
                    px(ctx, 14, 20, '#d4a017', 4, 2);
                    // Shirt
                    px(ctx, 8, 10 + bob, '#2980b9', 16, 12);
                    px(ctx, 10, 12 + bob, '#3498db', 12, 8);
                    // Collar
                    px(ctx, 12, 10 + bob, '#34495e', 8, 2);
                    // Shirt detail
                    px(ctx, 14, 14 + bob, '#2471a3', 4, 4);
                    // Arms
                    px(ctx, 4, 12 + bob, '#2980b9', 4, 8);
                    px(ctx, 24, 12 + bob, '#2980b9', 4, 8);
                    px(ctx, 4, 20 + bob, '#fdbcb4', 4, 2);
                    px(ctx, 24, 20 + bob, '#fdbcb4', 4, 2);
                    // Head
                    px(ctx, 10, 2 + bob, '#fdbcb4', 12, 10);
                    // Hair
                    px(ctx, 8, 0 + bob, '#5c3317', 16, 6);
                    px(ctx, 8, 0 + bob, '#4a2510', 16, 2);
                    px(ctx, 9, 1 + bob, '#3a1a08', 14, 1);
                    // Side hair
                    px(ctx, 8, 4 + bob, '#5c3317', 2, 4);
                    px(ctx, 22, 4 + bob, '#5c3317', 2, 4);
                    // Eyes
                    px(ctx, 12, 6 + bob, '#fff', 3, 2);
                    px(ctx, 18, 6 + bob, '#fff', 3, 2);
                    px(ctx, 12, 6 + bob, '#2c3e50', 2, 2);
                    px(ctx, 20, 6 + bob, '#2c3e50', 2, 2);
                    // Eye highlights
                    px(ctx, 12, 6 + bob, '#fff', 1, 1);
                    px(ctx, 20, 6 + bob, '#fff', 1, 1);
                    // Nose
                    px(ctx, 15, 8 + bob, '#e8a890', 2, 2);
                    // Mouth
                    px(ctx, 14, 10 + bob, '#d4a574', 4, 1);
                } else if (dir === 'left') {
                    // === LEFT VIEW ===
                    // Boots
                    px(ctx, 8 + walk, 26, '#5a3d12', 5, 6);
                    px(ctx, 16 - walk, 26, '#5a3d12', 5, 6);
                    // Pants
                    px(ctx, 10, 20, '#2c3e50', 10, 8);
                    // Belt
                    px(ctx, 10, 20, '#5a3d12', 10, 2);
                    // Shirt
                    px(ctx, 8, 10 + bob, '#2980b9', 14, 12);
                    px(ctx, 10, 12 + bob, '#3498db', 10, 8);
                    // Front arm
                    px(ctx, 4, 12 + bob, '#2980b9', 6, 8);
                    px(ctx, 4, 20 + bob, '#fdbcb4', 4, 2);
                    // Weapon - sword pointing left
                    px(ctx, 2, 16 + bob, '#bbb', 2, 10);
                    px(ctx, 0, 14 + bob, '#8B4513', 4, 4);
                    px(ctx, 0, 14 + bob, '#d4a017', 4, 2);
                    px(ctx, 1, 15 + bob, '#ffd700', 2, 1);
                    // Head
                    px(ctx, 10, 2 + bob, '#fdbcb4', 10, 10);
                    // Hair
                    px(ctx, 10, 0 + bob, '#5c3317', 12, 6);
                    px(ctx, 8, 0 + bob, '#4a2510', 4, 2);
                    px(ctx, 18, 0 + bob, '#5c3317', 4, 10);
                    // Eye
                    px(ctx, 12, 6 + bob, '#fff', 3, 2);
                    px(ctx, 12, 6 + bob, '#2c3e50', 2, 2);
                    // Nose
                    px(ctx, 10, 8 + bob, '#e8a890', 2, 2);
                    // Ear
                    px(ctx, 19, 6 + bob, '#e8a890', 2, 2);
                } else {
                    // === RIGHT VIEW ===
                    // Boots
                    px(ctx, 10 + walk, 26, '#5a3d12', 5, 6);
                    px(ctx, 18 - walk, 26, '#5a3d12', 5, 6);
                    // Pants
                    px(ctx, 12, 20, '#2c3e50', 10, 8);
                    // Belt
                    px(ctx, 12, 20, '#5a3d12', 10, 2);
                    // Shirt
                    px(ctx, 10, 10 + bob, '#2980b9', 14, 12);
                    px(ctx, 12, 12 + bob, '#3498db', 10, 8);
                    // Front arm
                    px(ctx, 22, 12 + bob, '#2980b9', 6, 8);
                    px(ctx, 24, 20 + bob, '#fdbcb4', 4, 2);
                    // Weapon - sword pointing right
                    px(ctx, 28, 16 + bob, '#bbb', 2, 10);
                    px(ctx, 28, 14 + bob, '#8B4513', 4, 4);
                    px(ctx, 28, 14 + bob, '#d4a017', 4, 2);
                    px(ctx, 29, 15 + bob, '#ffd700', 2, 1);
                    // Head
                    px(ctx, 12, 2 + bob, '#fdbcb4', 10, 10);
                    // Hair
                    px(ctx, 10, 0 + bob, '#5c3317', 12, 6);
                    px(ctx, 20, 0 + bob, '#4a2510', 4, 2);
                    px(ctx, 10, 0 + bob, '#5c3317', 4, 10);
                    // Eye
                    px(ctx, 18, 6 + bob, '#fff', 3, 2);
                    px(ctx, 20, 6 + bob, '#2c3e50', 2, 2);
                    // Nose
                    px(ctx, 20, 8 + bob, '#e8a890', 2, 2);
                    // Ear
                    px(ctx, 11, 6 + bob, '#e8a890', 2, 2);
                }
            });
        }
    });
};
