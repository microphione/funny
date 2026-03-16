// ============================================================
// SPRITE MONSTERS - Monster sprite definitions (Part 1)
// Slime, Goblin, Wolf, Spider, Orc, Bandit, Treant, Beetle,
// Ghost, Troll, Golem
// ============================================================

// ========== MONSTER SPRITES (32x32 detailed) ==========
Sprites.initMonsters = function() {
    const px = this.px;
    const S = 32;

    // ---- SLIME ----
    for (let dir = 0; dir < 2; dir++) {
        this.create(`mob_slime_${dir}`, (ctx) => {
            const bob = dir === 1 ? -2 : 0;
            const squish = dir === 1 ? 2 : 0;
            px(ctx, 8, 28, 'rgba(0,0,0,0.3)', 16, 4);
            // Body - gelatinous blob
            px(ctx, 6, 16 + bob - squish, '#2ecc71', 20, 14 + squish);
            px(ctx, 8, 14 + bob - squish, '#27ae60', 16, 14 + squish);
            px(ctx, 10, 12 + bob - squish, '#2ecc71', 12, 14 + squish);
            // Highlight
            px(ctx, 10, 14 + bob, '#3ddc84', 6, 4);
            px(ctx, 12, 12 + bob, '#58e89a', 4, 2);
            // Eyes
            px(ctx, 10, 18 + bob, '#fff', 4, 4);
            px(ctx, 18, 18 + bob, '#fff', 4, 4);
            px(ctx, 12, 20 + bob, '#333', 2, 2);
            px(ctx, 20, 20 + bob, '#333', 2, 2);
            // Mouth
            px(ctx, 13, 24 + bob, '#1e8449', 6, 2);
            // Drip
            if (dir === 0) { px(ctx, 6, 28, '#2ecc71', 2, 3); }
        });
    }

    // ---- GOBLIN ----
    for (let dir = 0; dir < 2; dir++) {
        this.create(`mob_goblin_${dir}`, (ctx) => {
            const bob = dir === 1 ? -1 : 0;
            px(ctx, 8, 28, 'rgba(0,0,0,0.3)', 16, 4);
            // Legs
            px(ctx, 10 + dir, 24, '#6a4a82', 4, 6);
            px(ctx, 18 - dir, 24, '#6a4a82', 4, 6);
            // Feet
            px(ctx, 9 + dir, 28, '#5a3d6a', 5, 3);
            px(ctx, 18 - dir, 28, '#5a3d6a', 5, 3);
            // Body
            px(ctx, 10, 12 + bob, '#9b59b6', 12, 14);
            px(ctx, 12, 14 + bob, '#8e44ad', 8, 10);
            // Arms
            px(ctx, 6, 14 + bob, '#9b59b6', 4, 8);
            px(ctx, 22, 14 + bob, '#9b59b6', 4, 8);
            // Hands
            px(ctx, 6, 22 + bob, '#7d3c98', 3, 2);
            px(ctx, 23, 22 + bob, '#7d3c98', 3, 2);
            // Head - large
            px(ctx, 8, 2 + bob, '#9b59b6', 16, 12);
            px(ctx, 10, 4 + bob, '#8e44ad', 12, 8);
            // Ears (pointy)
            px(ctx, 6, 4 + bob, '#9b59b6', 3, 4);
            px(ctx, 23, 4 + bob, '#9b59b6', 3, 4);
            // Eyes - big yellow
            px(ctx, 11, 6 + bob, '#ff0', 4, 3);
            px(ctx, 18, 6 + bob, '#ff0', 4, 3);
            px(ctx, 13, 7 + bob, '#000', 2, 2);
            px(ctx, 20, 7 + bob, '#000', 2, 2);
            // Nose
            px(ctx, 15, 9 + bob, '#7d3c98', 2, 2);
            // Teeth
            px(ctx, 13, 11 + bob, '#fff', 2, 1);
            px(ctx, 17, 11 + bob, '#fff', 2, 1);
            // Weapon - dagger
            px(ctx, 4, 18 + bob, '#999', 2, 8);
            px(ctx, 4, 16 + bob, '#5a2d0e', 2, 3);
        });
    }

    // ---- WOLF ----
    for (let dir = 0; dir < 2; dir++) {
        this.create(`mob_wolf_${dir}`, (ctx) => {
            const bob = dir === 1 ? -1 : 0;
            px(ctx, 6, 28, 'rgba(0,0,0,0.3)', 20, 4);
            // Legs
            px(ctx, 8 + dir, 24, '#777', 3, 6);
            px(ctx, 14 + dir, 24, '#777', 3, 6);
            px(ctx, 20 - dir, 24, '#777', 3, 6);
            px(ctx, 24 - dir, 24, '#777', 3, 6);
            // Body - horizontal
            px(ctx, 6, 14 + bob, '#888', 22, 12);
            px(ctx, 8, 16 + bob, '#999', 18, 8);
            // Belly
            px(ctx, 10, 22 + bob, '#aaa', 12, 4);
            // Head
            px(ctx, 2, 10 + bob, '#888', 10, 10);
            px(ctx, 4, 12 + bob, '#999', 6, 6);
            // Ears
            px(ctx, 4, 8 + bob, '#777', 3, 4);
            px(ctx, 9, 8 + bob, '#777', 3, 4);
            // Snout
            px(ctx, 0, 14 + bob, '#777', 4, 4);
            px(ctx, 0, 16 + bob, '#333', 2, 2);
            // Eye
            px(ctx, 4, 12 + bob, '#f00', 2, 2);
            px(ctx, 5, 12 + bob, '#ff0', 1, 1);
            // Tail
            px(ctx, 26, 12 + bob, '#777', 4, 3);
            px(ctx, 28, 10 + bob, '#888', 3, 3);
            // Teeth
            px(ctx, 2, 18 + bob, '#fff', 1, 2);
            px(ctx, 4, 18 + bob, '#fff', 1, 2);
        });
    }

    // ---- SPIDER ----
    for (let dir = 0; dir < 2; dir++) {
        this.create(`mob_spider_${dir}`, (ctx) => {
            const bob = dir === 1 ? -1 : 0;
            px(ctx, 8, 28, 'rgba(0,0,0,0.3)', 16, 4);
            // Legs (8 legs, 4 per side)
            for (let i = 0; i < 4; i++) {
                const lx = 6 + i * 4;
                const loff = (dir === 1 && i % 2 === 0) ? -1 : 0;
                px(ctx, lx - 4, 20 + loff, '#444', 2, 8);
                px(ctx, lx + 18, 20 + loff, '#444', 2, 8);
                px(ctx, lx - 4, 26 + loff, '#333', 3, 2);
                px(ctx, lx + 18, 26 + loff, '#333', 3, 2);
            }
            // Body - abdomen
            px(ctx, 8, 16 + bob, '#333', 16, 12);
            px(ctx, 10, 18 + bob, '#444', 12, 8);
            // Thorax
            px(ctx, 10, 10 + bob, '#333', 12, 8);
            px(ctx, 12, 12 + bob, '#444', 8, 4);
            // Eyes (multiple) - red
            px(ctx, 11, 11 + bob, '#f00', 2, 2);
            px(ctx, 15, 10 + bob, '#f00', 2, 2);
            px(ctx, 19, 11 + bob, '#f00', 2, 2);
            px(ctx, 13, 13 + bob, '#f00', 2, 1);
            px(ctx, 17, 13 + bob, '#f00', 2, 1);
            // Fangs
            px(ctx, 13, 16 + bob, '#ccc', 2, 3);
            px(ctx, 17, 16 + bob, '#ccc', 2, 3);
            // Markings
            px(ctx, 14, 20 + bob, '#c0392b', 4, 4);
            px(ctx, 15, 21 + bob, '#e74c3c', 2, 2);
        });
    }

    // ---- ORC ----
    for (let dir = 0; dir < 2; dir++) {
        this.create(`mob_orc_${dir}`, (ctx) => {
            const bob = dir === 1 ? -1 : 0;
            px(ctx, 8, 28, 'rgba(0,0,0,0.3)', 16, 4);
            // Boots
            px(ctx, 9 + dir, 26, '#3a2a18', 5, 6);
            px(ctx, 18 - dir, 26, '#3a2a18', 5, 6);
            // Legs
            px(ctx, 10, 20, '#4a3a18', 12, 8);
            // Body - big green
            px(ctx, 8, 10 + bob, '#2c8c3c', 16, 12);
            px(ctx, 10, 12 + bob, '#34a044', 12, 8);
            // Armor plates
            px(ctx, 8, 10 + bob, '#555', 16, 2);
            px(ctx, 10, 12 + bob, '#666', 4, 6);
            px(ctx, 18, 12 + bob, '#666', 4, 6);
            // Arms - muscular
            px(ctx, 4, 12 + bob, '#2c8c3c', 4, 10);
            px(ctx, 24, 12 + bob, '#2c8c3c', 4, 10);
            px(ctx, 5, 13 + bob, '#34a044', 2, 8);
            px(ctx, 25, 13 + bob, '#34a044', 2, 8);
            // Head
            px(ctx, 10, 2 + bob, '#2c8c3c', 12, 10);
            px(ctx, 12, 4 + bob, '#34a044', 8, 6);
            // Jaw
            px(ctx, 10, 8 + bob, '#248534', 12, 4);
            // Tusks
            px(ctx, 10, 8 + bob, '#fff', 2, 3);
            px(ctx, 20, 8 + bob, '#fff', 2, 3);
            // Eyes
            px(ctx, 12, 4 + bob, '#ff0', 3, 2);
            px(ctx, 18, 4 + bob, '#ff0', 3, 2);
            px(ctx, 13, 4 + bob, '#f00', 1, 2);
            px(ctx, 19, 4 + bob, '#f00', 1, 2);
            // Axe
            px(ctx, 26, 8 + bob, '#888', 4, 12);
            px(ctx, 26, 6 + bob, '#999', 6, 4);
            px(ctx, 28, 4 + bob, '#aaa', 4, 4);
        });
    }

    // ---- BANDIT ----
    for (let dir = 0; dir < 2; dir++) {
        this.create(`mob_bandit_${dir}`, (ctx) => {
            const bob = dir === 1 ? -1 : 0;
            px(ctx, 8, 28, 'rgba(0,0,0,0.3)', 16, 4);
            // Boots
            px(ctx, 10 + dir, 26, '#3a2a18', 4, 6);
            px(ctx, 18 - dir, 26, '#3a2a18', 4, 6);
            // Pants
            px(ctx, 10, 20, '#2c3e50', 12, 8);
            // Body
            px(ctx, 8, 10 + bob, '#8B4513', 16, 12);
            px(ctx, 10, 12 + bob, '#a0522d', 12, 8);
            // Hood
            px(ctx, 10, 2 + bob, '#5a2d0e', 12, 10);
            px(ctx, 8, 4 + bob, '#5a2d0e', 2, 6);
            px(ctx, 22, 4 + bob, '#5a2d0e', 2, 6);
            // Face (partially hidden)
            px(ctx, 12, 6 + bob, '#fdbcb4', 8, 4);
            // Mask
            px(ctx, 12, 8 + bob, '#333', 8, 3);
            // Eyes
            px(ctx, 13, 6 + bob, '#fff', 2, 2);
            px(ctx, 18, 6 + bob, '#fff', 2, 2);
            px(ctx, 14, 7 + bob, '#333', 1, 1);
            px(ctx, 19, 7 + bob, '#333', 1, 1);
            // Arms
            px(ctx, 4, 12 + bob, '#8B4513', 4, 8);
            px(ctx, 24, 12 + bob, '#8B4513', 4, 8);
            // Daggers (both hands)
            px(ctx, 2, 16 + bob, '#ccc', 2, 8);
            px(ctx, 28, 16 + bob, '#ccc', 2, 8);
            px(ctx, 2, 14 + bob, '#5a2d0e', 2, 3);
            px(ctx, 28, 14 + bob, '#5a2d0e', 2, 3);
        });
    }

    // ---- TREANT ----
    for (let dir = 0; dir < 2; dir++) {
        this.create(`mob_treant_${dir}`, (ctx) => {
            const bob = dir === 1 ? -1 : 0;
            px(ctx, 6, 28, 'rgba(0,0,0,0.3)', 20, 4);
            // Root legs
            px(ctx, 8 + dir, 24, '#5a2d0e', 6, 8);
            px(ctx, 18 - dir, 24, '#5a2d0e', 6, 8);
            px(ctx, 6, 28, '#4a2008', 4, 4);
            px(ctx, 22, 28, '#4a2008', 4, 4);
            // Trunk body
            px(ctx, 8, 8 + bob, '#5a2d0e', 16, 18);
            px(ctx, 10, 10 + bob, '#6B3410', 12, 14);
            // Bark texture
            px(ctx, 12, 12 + bob, '#4a2008', 2, 6);
            px(ctx, 18, 14 + bob, '#4a2008', 2, 4);
            // Branch arms
            px(ctx, 2, 10 + bob, '#5a2d0e', 6, 4);
            px(ctx, 24, 10 + bob, '#5a2d0e', 6, 4);
            px(ctx, 0, 8 + bob, '#5a2d0e', 4, 3);
            px(ctx, 28, 8 + bob, '#5a2d0e', 4, 3);
            // Leaf clusters
            px(ctx, 0, 6 + bob, '#1e8449', 6, 4);
            px(ctx, 26, 6 + bob, '#1e8449', 6, 4);
            px(ctx, 8, 2 + bob, '#27ae60', 16, 8);
            px(ctx, 10, 0 + bob, '#2ecc71', 12, 6);
            px(ctx, 12, 0 + bob, '#3ddc84', 8, 4);
            // Face in trunk
            px(ctx, 12, 14 + bob, '#ff0', 2, 2);
            px(ctx, 18, 14 + bob, '#ff0', 2, 2);
            px(ctx, 14, 18 + bob, '#3a1808', 4, 2);
        });
    }

    // ---- BEETLE ----
    for (let dir = 0; dir < 2; dir++) {
        this.create(`mob_beetle_${dir}`, (ctx) => {
            const bob = dir === 1 ? -1 : 0;
            px(ctx, 8, 28, 'rgba(0,0,0,0.3)', 16, 4);
            // Legs
            for (let i = 0; i < 3; i++) {
                const loff = (dir === 1 && i % 2 === 0) ? -1 : 0;
                px(ctx, 6 + i * 4, 24 + loff, '#2a5500', 2, 6);
                px(ctx, 18 + i * 4, 24 + loff, '#2a5500', 2, 6);
            }
            // Shell
            px(ctx, 6, 14 + bob, '#4a0', 20, 14);
            px(ctx, 8, 16 + bob, '#5b0', 16, 10);
            // Shell pattern
            px(ctx, 15, 14 + bob, '#3a0', 2, 14);
            px(ctx, 10, 18 + bob, '#6c0', 4, 4);
            px(ctx, 18, 18 + bob, '#6c0', 4, 4);
            // Head
            px(ctx, 10, 10 + bob, '#2a5500', 12, 6);
            px(ctx, 12, 12 + bob, '#3a6600', 8, 2);
            // Eyes
            px(ctx, 11, 11 + bob, '#f00', 2, 2);
            px(ctx, 19, 11 + bob, '#f00', 2, 2);
            // Mandibles
            px(ctx, 10, 14 + bob, '#2a5500', 2, 3);
            px(ctx, 20, 14 + bob, '#2a5500', 2, 3);
            // Antennae
            px(ctx, 12, 8 + bob, '#2a5500', 1, 3);
            px(ctx, 19, 8 + bob, '#2a5500', 1, 3);
        });
    }

    // ---- GHOST ----
    for (let dir = 0; dir < 2; dir++) {
        this.create(`mob_ghost_${dir}`, (ctx) => {
            const bob = dir === 1 ? -2 : 0;
            // No shadow for ghost
            // Ethereal body
            ctx.globalAlpha = 0.8;
            px(ctx, 8, 6 + bob, '#aaccff', 16, 22);
            px(ctx, 6, 8 + bob, '#aaccff', 20, 18);
            px(ctx, 10, 4 + bob, '#c8ddff', 12, 20);
            ctx.globalAlpha = 0.6;
            px(ctx, 12, 6 + bob, '#ddeeff', 8, 14);
            ctx.globalAlpha = 1;
            // Wavy bottom
            px(ctx, 6, 26 + bob, '#aaccff', 4, 4);
            px(ctx, 14, 28 + bob, '#aaccff', 4, 4);
            px(ctx, 22, 26 + bob, '#aaccff', 4, 4);
            // Face
            px(ctx, 11, 10 + bob, '#00f', 4, 4);
            px(ctx, 19, 10 + bob, '#00f', 4, 4);
            px(ctx, 12, 11 + bob, '#0044ff', 2, 2);
            px(ctx, 20, 11 + bob, '#0044ff', 2, 2);
            // Mouth
            px(ctx, 14, 18 + bob, '#6688cc', 4, 3);
            px(ctx, 15, 19 + bob, '#4466aa', 2, 1);
            // Glow
            ctx.globalAlpha = 0.3;
            px(ctx, 4, 4 + bob, '#aaccff', 24, 26);
            ctx.globalAlpha = 1;
        });
    }

    // ---- TROLL ----
    for (let dir = 0; dir < 2; dir++) {
        this.create(`mob_troll_${dir}`, (ctx) => {
            const bob = dir === 1 ? -1 : 0;
            px(ctx, 6, 28, 'rgba(0,0,0,0.3)', 20, 4);
            // Feet
            px(ctx, 8 + dir, 26, '#3a4a1f', 6, 6);
            px(ctx, 18 - dir, 26, '#3a4a1f', 6, 6);
            // Legs
            px(ctx, 10, 20, '#556b2f', 12, 8);
            // Body - massive
            px(ctx, 6, 8 + bob, '#556b2f', 20, 14);
            px(ctx, 8, 10 + bob, '#667f3f', 16, 10);
            // Belly
            px(ctx, 10, 14 + bob, '#6a8040', 12, 6);
            // Arms - long
            px(ctx, 2, 10 + bob, '#556b2f', 4, 14);
            px(ctx, 26, 10 + bob, '#556b2f', 4, 14);
            px(ctx, 3, 11 + bob, '#667f3f', 2, 12);
            px(ctx, 27, 11 + bob, '#667f3f', 2, 12);
            // Fists
            px(ctx, 1, 24 + bob, '#556b2f', 4, 4);
            px(ctx, 27, 24 + bob, '#556b2f', 4, 4);
            // Head - small relative to body
            px(ctx, 10, 2 + bob, '#556b2f', 12, 8);
            px(ctx, 12, 4 + bob, '#667f3f', 8, 4);
            // Eyes
            px(ctx, 12, 4 + bob, '#f00', 3, 2);
            px(ctx, 18, 4 + bob, '#f00', 3, 2);
            // Nose
            px(ctx, 15, 6 + bob, '#4a5a24', 2, 3);
            // Club
            px(ctx, 28, 4 + bob, '#5a2d0e', 4, 16);
            px(ctx, 26, 2 + bob, '#5a2d0e', 6, 4);
            px(ctx, 27, 3 + bob, '#666', 4, 2);
        });
    }

    // ---- GOLEM ----
    for (let dir = 0; dir < 2; dir++) {
        this.create(`mob_golem_${dir}`, (ctx) => {
            const bob = dir === 1 ? -1 : 0;
            px(ctx, 6, 28, 'rgba(0,0,0,0.3)', 20, 4);
            // Feet - stone blocks
            px(ctx, 8 + dir, 26, '#606068', 6, 6);
            px(ctx, 18 - dir, 26, '#606068', 6, 6);
            // Legs
            px(ctx, 10, 20, '#707078', 12, 8);
            // Body - massive stone
            px(ctx, 6, 6 + bob, '#808080', 20, 16);
            px(ctx, 8, 8 + bob, '#909098', 16, 12);
            // Chest plate
            px(ctx, 10, 10 + bob, '#999', 12, 8);
            px(ctx, 12, 12 + bob, '#aaa', 8, 4);
            // Rune on chest
            px(ctx, 14, 12 + bob, '#f1c40f', 4, 4);
            px(ctx, 15, 13 + bob, '#ffd700', 2, 2);
            // Arms - stone pillars
            px(ctx, 2, 8 + bob, '#707078', 4, 14);
            px(ctx, 26, 8 + bob, '#707078', 4, 14);
            px(ctx, 3, 9 + bob, '#808080', 2, 12);
            px(ctx, 27, 9 + bob, '#808080', 2, 12);
            // Fists
            px(ctx, 1, 22 + bob, '#606068', 5, 4);
            px(ctx, 26, 22 + bob, '#606068', 5, 4);
            // Head - stone block
            px(ctx, 10, 0 + bob, '#808080', 12, 8);
            px(ctx, 12, 2 + bob, '#909098', 8, 4);
            // Eyes - glowing
            px(ctx, 12, 2 + bob, '#ff0', 3, 2);
            px(ctx, 18, 2 + bob, '#ff0', 3, 2);
            // Cracks
            px(ctx, 10, 14 + bob, '#555', 1, 4);
            px(ctx, 22, 10 + bob, '#555', 1, 6);
            px(ctx, 14, 6 + bob, '#555', 4, 1);
        });
    }
};
