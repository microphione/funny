// ============================================================
// SPRITE TERRAIN - Tiles, buildings, objects, terrain features
// ============================================================

// ========== TILE SPRITES ==========
Sprites.initTiles = function() {
    const S = this.SPRITE_SIZE;
    const px = this.px;

    // --- GRASS variations ---
    for (let v = 0; v < 4; v++) {
        this.create(`grass_${v}`, (ctx) => {
            const greens = ['#4a8c3f','#52944a','#489038','#3f8435'];
            ctx.fillStyle = greens[v];
            ctx.fillRect(0, 0, S, S);
            // Subtle texture
            const detail = ['#5ca050','#62a858','#58a04c','#4e9842'];
            for (let i = 0; i < 12; i++) {
                const gx = ((v * 7 + i * 5) % 28) + 1;
                const gy = ((v * 3 + i * 7) % 28) + 1;
                px(ctx, gx, gy, detail[i % 2], 2, 1);
            }
            // Grass blades
            px(ctx, 6 + v, 16, '#5ca050', 1, 4);
            px(ctx, 7 + v, 15, '#5ca050', 1, 3);
            px(ctx, 20 - v, 8, '#62a858', 1, 5);
            px(ctx, 21 - v, 9, '#62a858', 1, 3);
            px(ctx, 14 + v, 24, '#58a04c', 1, 4);
            if (v === 0) { px(ctx, 26, 4, '#5ca050', 1, 3); px(ctx, 3, 22, '#62a858', 2, 1); }
            if (v === 1) { px(ctx, 10, 5, '#58a04c', 1, 3); }
            if (v === 2) { px(ctx, 2, 26, '#62a858', 3, 1); px(ctx, 24, 12, '#5ca050', 1, 4); }
            if (v === 3) { px(ctx, 18, 3, '#58a04c', 1, 4); px(ctx, 8, 28, '#5ca050', 2, 1); }
        });
    }

    // --- DARK GRASS (forest) ---
    for (let v = 0; v < 4; v++) {
        this.create(`darkgrass_${v}`, (ctx) => {
            const greens = ['#2d5a2a','#335f30','#295626','#244f22'];
            ctx.fillStyle = greens[v];
            ctx.fillRect(0, 0, S, S);
            // More texture for forest floor
            px(ctx, 8, 12, '#1e4a1c', 2, 4);
            px(ctx, 22, 20, '#1e4a1c', 2, 3);
            px(ctx, 16, 4, '#234e20', 3, 2);
            px(ctx, 4, 24, '#1e4a1c', 3, 2);
            // Fallen leaves
            px(ctx, 12, 8, '#3a5a2a', 2, 1);
            px(ctx, 24, 16, '#2a4a1c', 2, 1);
            px(ctx, 6, 18, '#1e3a18', 2, 2);
        });
    }

    // --- PATH ---
    for (let v = 0; v < 4; v++) {
        this.create(`path_${v}`, (ctx) => {
            const browns = ['#c4a663','#b89a57','#d1b36f','#bfa060'];
            ctx.fillStyle = browns[v];
            ctx.fillRect(0, 0, S, S);
            // Pebbles and texture
            px(ctx, 10, 14, '#a08850', 3, 3);
            px(ctx, 22, 6, '#b09860', 2, 2);
            px(ctx, 4, 24, '#a89050', 4, 2);
            px(ctx, 16, 20, '#a08850', 2, 2);
            px(ctx, 8, 4, '#b09860', 3, 2);
            px(ctx, 26, 22, '#a08850', 2, 2);
            // Small stones
            px(ctx, 14, 10, '#9a8048', 2, 1);
            px(ctx, 6, 16, '#b09860', 1, 1);
            px(ctx, 20, 28, '#a89050', 2, 1);
        });
    }

    // --- WATER (animated) ---
    for (let f = 0; f < 4; f++) {
        this.create(`water_${f}`, (ctx) => {
            const blues = ['#2980b9','#2471a3','#3498db','#2573a7'];
            ctx.fillStyle = blues[f];
            ctx.fillRect(0, 0, S, S);
            // Wave patterns
            const off = f * 6;
            ctx.fillStyle = '#5dade2';
            px(ctx, (off) % 32, 8, '#5dade2', 8, 2);
            px(ctx, (off + 16) % 32, 20, '#4fa3d9', 6, 2);
            px(ctx, (off + 8) % 32, 14, '#5dade2', 5, 1);
            // Deep water patches
            px(ctx, 12, 26, '#1a6090', 4, 3);
            px(ctx, 4, 6, '#1a6090', 3, 2);
            // Sparkle
            px(ctx, (off + 4) % 32, 4, '#8ecae6', 2, 1);
            px(ctx, (off + 20) % 32, 24, '#8ecae6', 1, 1);
        });
    }

    // --- TREE (much more detailed) ---
    this.create('tree', (ctx) => {
        // Trunk
        px(ctx, 12, 20, '#5a2d0e', 8, 12);
        px(ctx, 13, 21, '#6B3410', 6, 10);
        px(ctx, 14, 22, '#7B4420', 4, 8);
        // Trunk texture
        px(ctx, 14, 24, '#4a2008', 2, 3);
        px(ctx, 17, 26, '#4a2008', 1, 4);
        // Roots
        px(ctx, 10, 30, '#5a2d0e', 3, 2);
        px(ctx, 19, 30, '#5a2d0e', 3, 2);
        // Crown - layered for depth
        px(ctx, 4, 4, '#1a6b30', 24, 18);
        px(ctx, 6, 2, '#1e8449', 20, 16);
        px(ctx, 8, 0, '#27ae60', 16, 14);
        px(ctx, 10, 2, '#2ecc71', 12, 10);
        // Highlight clusters
        px(ctx, 10, 4, '#3ddc84', 6, 4);
        px(ctx, 18, 6, '#3ddc84', 4, 3);
        px(ctx, 8, 10, '#34d474', 5, 3);
        // Shadow on crown bottom
        px(ctx, 6, 18, '#155d30', 20, 4);
        px(ctx, 4, 20, '#0e4a25', 24, 2);
        // Dark depth spots
        px(ctx, 18, 8, '#1a6b30', 4, 3);
        px(ctx, 8, 6, '#1a6b30', 3, 4);
        px(ctx, 22, 12, '#155d30', 3, 3);
    });

    // --- HOUSE (detailed with chimney, bricks, windows) ---
    this.create('house', (ctx) => {
        // Wall base
        ctx.fillStyle = '#d4a574';
        ctx.fillRect(0, 10, S, 22);
        // Brick lines
        for (let by = 12; by < 32; by += 4) {
            px(ctx, 0, by, '#c89a68', S, 1);
        }
        for (let bx = 0; bx < 32; bx += 6) {
            const yoff = (bx / 6 % 2 === 0) ? 12 : 14;
            px(ctx, bx, yoff, '#c89a68', 1, 4);
        }
        // Roof
        px(ctx, 0, 0, '#b03030', 32, 12);
        px(ctx, 2, 2, '#cc4040', 28, 8);
        px(ctx, 4, 3, '#d45050', 24, 6);
        px(ctx, 6, 4, '#e06060', 20, 4);
        // Roof tiles
        for (let rx = 0; rx < 32; rx += 4) {
            px(ctx, rx, 10, '#a02828', 2, 2);
        }
        // Chimney
        px(ctx, 24, 0, '#666', 4, 6);
        px(ctx, 24, 0, '#555', 4, 2);
        px(ctx, 25, 1, '#777', 2, 1);
        // Left window
        px(ctx, 4, 16, '#87ceeb', 6, 6);
        px(ctx, 4, 16, '#5a5a5a', 6, 1);
        px(ctx, 4, 16, '#5a5a5a', 1, 6);
        px(ctx, 9, 16, '#5a5a5a', 1, 6);
        px(ctx, 4, 19, '#5a5a5a', 6, 1);
        px(ctx, 6, 16, '#5a5a5a', 1, 6);
        px(ctx, 5, 17, '#f7dc6f', 1, 2);
        px(ctx, 7, 17, '#ffeaa7', 2, 2);
        // Right window
        px(ctx, 22, 16, '#87ceeb', 6, 6);
        px(ctx, 22, 16, '#5a5a5a', 6, 1);
        px(ctx, 22, 16, '#5a5a5a', 1, 6);
        px(ctx, 27, 16, '#5a5a5a', 1, 6);
        px(ctx, 22, 19, '#5a5a5a', 6, 1);
        px(ctx, 24, 16, '#5a5a5a', 1, 6);
        px(ctx, 23, 17, '#f7dc6f', 1, 2);
        px(ctx, 25, 17, '#ffeaa7', 2, 2);
        // Wall shadow at bottom
        px(ctx, 0, 30, '#b89060', S, 2);
    });

    // --- DOOR ---
    this.create('door', (ctx) => {
        ctx.fillStyle = '#d4a574';
        ctx.fillRect(0, 0, S, S);
        // Brick texture
        for (let by = 0; by < 32; by += 4) {
            px(ctx, 0, by, '#c89a68', S, 1);
        }
        // Door frame
        px(ctx, 8, 4, '#4a2008', 16, 28);
        // Door wood
        px(ctx, 9, 5, '#5a2d0e', 14, 26);
        px(ctx, 10, 6, '#6B3410', 12, 24);
        px(ctx, 11, 7, '#7B4420', 10, 22);
        // Wood grain
        px(ctx, 13, 8, '#6B3410', 1, 20);
        px(ctx, 18, 8, '#6B3410', 1, 20);
        // Handle
        px(ctx, 20, 16, '#d4a017', 3, 3);
        px(ctx, 21, 17, '#ffd700', 1, 1);
        // Arch top
        px(ctx, 10, 4, '#3a1808', 12, 2);
        px(ctx, 8, 4, '#3a1808', 2, 28);
        px(ctx, 22, 4, '#3a1808', 2, 28);
        // Step
        px(ctx, 6, 30, '#999', 20, 2);
    });

    // --- HOUSE_DOOR (buyable house door) ---
    this.create('house_door', (ctx) => {
        ctx.fillStyle = '#d4a574';
        ctx.fillRect(0, 0, S, S);
        for (let by = 0; by < 32; by += 4) {
            px(ctx, 0, by, '#c89a68', S, 1);
        }
        // Fancy door frame
        px(ctx, 7, 3, '#8B6914', 18, 29);
        px(ctx, 8, 4, '#5a2d0e', 16, 27);
        px(ctx, 9, 5, '#6B3410', 14, 25);
        px(ctx, 10, 6, '#7B4420', 12, 23);
        // Wood panels
        px(ctx, 12, 8, '#6B3410', 1, 20);
        px(ctx, 19, 8, '#6B3410', 1, 20);
        px(ctx, 10, 16, '#6B3410', 12, 1);
        // Handle - gold
        px(ctx, 21, 16, '#ffd700', 3, 3);
        px(ctx, 22, 17, '#fff', 1, 1);
        // Nameplate
        px(ctx, 11, 8, '#8B6914', 10, 4);
        px(ctx, 12, 9, '#d4a017', 8, 2);
        // Step
        px(ctx, 5, 30, '#aaa', 22, 2);
    });

    // --- STONE FLOOR ---
    this.create('stone_floor', (ctx) => {
        ctx.fillStyle = '#909090';
        ctx.fillRect(0, 0, S, S);
        // Stone blocks
        px(ctx, 0, 0, '#808080', S, 1);
        px(ctx, 0, 0, '#808080', 1, S);
        px(ctx, 0, 16, '#858585', S, 1);
        px(ctx, 16, 0, '#858585', 1, S);
        // Block detail
        px(ctx, 8, 8, '#9a9a9a', 4, 4);
        px(ctx, 24, 24, '#888', 4, 4);
        px(ctx, 4, 20, '#9a9a9a', 3, 3);
        px(ctx, 20, 4, '#888', 3, 3);
        // Cracks
        px(ctx, 12, 12, '#7a7a7a', 1, 4);
        px(ctx, 26, 8, '#7a7a7a', 4, 1);
    });

    // --- FENCE ---
    this.create('fence', (ctx) => {
        ctx.fillStyle = '#4a8c3f';
        ctx.fillRect(0, 0, S, S);
        // Grass base under fence
        px(ctx, 0, 28, '#3f8435', S, 4);
        // Posts
        px(ctx, 2, 6, '#7a5a14', 4, 26);
        px(ctx, 26, 6, '#7a5a14', 4, 26);
        // Post tops (pointed)
        px(ctx, 3, 4, '#8B6914', 2, 3);
        px(ctx, 27, 4, '#8B6914', 2, 3);
        // Cross beams
        px(ctx, 0, 12, '#a07818', S, 3);
        px(ctx, 0, 22, '#a07818', S, 3);
        // Beam highlights
        px(ctx, 0, 12, '#b08828', S, 1);
        px(ctx, 0, 22, '#b08828', S, 1);
        // Nails
        px(ctx, 3, 13, '#666', 2, 1);
        px(ctx, 27, 13, '#666', 2, 1);
        px(ctx, 3, 23, '#666', 2, 1);
        px(ctx, 27, 23, '#666', 2, 1);
    });

    // --- SHOP WEAPON (anvil sign, detailed) ---
    this.create('shop_weapon', (ctx) => {
        // Wall
        ctx.fillStyle = '#c69463';
        ctx.fillRect(0, 10, S, 22);
        for (let by = 12; by < 32; by += 4) { px(ctx, 0, by, '#b88855', S, 1); }
        // Roof - dark wood
        px(ctx, 0, 0, '#7a3a13', 32, 12);
        px(ctx, 2, 2, '#8B4513', 28, 8);
        px(ctx, 4, 3, '#9a5523', 24, 6);
        px(ctx, 6, 4, '#a56530', 20, 4);
        // Sword sign on wall
        px(ctx, 14, 14, '#ccc', 4, 14);
        px(ctx, 10, 18, '#ccc', 12, 2);
        px(ctx, 12, 14, '#f1c40f', 2, 4);
        px(ctx, 18, 18, '#f1c40f', 2, 2);
        px(ctx, 10, 18, '#f1c40f', 2, 2);
        // Sign board
        px(ctx, 4, 24, '#8B4513', 24, 6);
        px(ctx, 5, 25, '#a0522d', 22, 4);
        px(ctx, 8, 26, '#e67e22', 16, 2);
    });

    // --- SHOP ARMOR ---
    this.create('shop_armor', (ctx) => {
        ctx.fillStyle = '#c69463';
        ctx.fillRect(0, 10, S, 22);
        for (let by = 12; by < 32; by += 4) { px(ctx, 0, by, '#b88855', S, 1); }
        // Blue roof
        px(ctx, 0, 0, '#3a5a8a', 32, 12);
        px(ctx, 2, 2, '#4a6fa5', 28, 8);
        px(ctx, 4, 3, '#5a7fb5', 24, 6);
        px(ctx, 6, 4, '#6a8fc5', 20, 4);
        // Shield emblem
        px(ctx, 10, 14, '#3498db', 12, 14);
        px(ctx, 12, 16, '#5dade2', 8, 10);
        px(ctx, 14, 18, '#f1c40f', 4, 6);
        px(ctx, 15, 19, '#e67e22', 2, 4);
        // Sign board
        px(ctx, 4, 24, '#3a5a8a', 24, 6);
        px(ctx, 5, 25, '#4a6fa5', 22, 4);
        px(ctx, 8, 26, '#5dade2', 16, 2);
    });

    // --- SHOP POTION ---
    this.create('shop_potion', (ctx) => {
        ctx.fillStyle = '#c69463';
        ctx.fillRect(0, 10, S, 22);
        for (let by = 12; by < 32; by += 4) { px(ctx, 0, by, '#b88855', S, 1); }
        // Green roof
        px(ctx, 0, 0, '#1e7a40', 32, 12);
        px(ctx, 2, 2, '#27ae60', 28, 8);
        px(ctx, 4, 3, '#2ecc71', 24, 6);
        px(ctx, 6, 4, '#3ddc84', 20, 4);
        // Potion bottle
        px(ctx, 12, 18, '#e74c3c', 8, 10);
        px(ctx, 14, 14, '#c0392b', 4, 4);
        px(ctx, 15, 12, '#85929e', 2, 2);
        // Bubbles
        px(ctx, 14, 20, '#ff6b6b', 2, 2);
        px(ctx, 17, 24, '#ff6b6b', 2, 2);
        px(ctx, 13, 26, '#ff9999', 1, 1);
        // Sign board
        px(ctx, 4, 24, '#1e7a40', 24, 6);
        px(ctx, 5, 25, '#27ae60', 22, 4);
        px(ctx, 8, 26, '#2ecc71', 16, 2);
    });

    // --- INN ---
    this.create('inn', (ctx) => {
        ctx.fillStyle = '#c69463';
        ctx.fillRect(0, 10, S, 22);
        for (let by = 12; by < 32; by += 4) { px(ctx, 0, by, '#b88855', S, 1); }
        // Purple roof
        px(ctx, 0, 0, '#6a3490', 32, 12);
        px(ctx, 2, 2, '#8e44ad', 28, 8);
        px(ctx, 4, 3, '#a055c0', 24, 6);
        px(ctx, 6, 4, '#b066d0', 20, 4);
        // Moon/star sign
        px(ctx, 12, 16, '#f1c40f', 8, 8);
        px(ctx, 14, 14, '#f1c40f', 4, 2);
        px(ctx, 16, 18, '#c69463', 4, 4);
        // Stars
        px(ctx, 10, 15, '#f1c40f', 2, 2);
        px(ctx, 22, 17, '#f1c40f', 2, 2);
        // Sign board
        px(ctx, 4, 24, '#6a3490', 24, 6);
        px(ctx, 5, 25, '#8e44ad', 22, 4);
        px(ctx, 8, 26, '#a055c0', 16, 2);
    });

    // --- NPC_QUEST (quest giver) ---
    this.create('npc_quest', (ctx) => {
        ctx.fillStyle = '#909090';
        ctx.fillRect(0, 0, S, S);
        // Shadow
        px(ctx, 8, 28, 'rgba(0,0,0,0.3)', 16, 4);
        // Body - green robe
        px(ctx, 10, 14, '#27ae60', 12, 12);
        px(ctx, 8, 16, '#27ae60', 4, 8);
        px(ctx, 20, 16, '#27ae60', 4, 8);
        // Robe folds
        px(ctx, 12, 18, '#1e8449', 2, 8);
        px(ctx, 18, 16, '#1e8449', 2, 8);
        // Belt
        px(ctx, 10, 20, '#8B4513', 12, 2);
        px(ctx, 14, 20, '#d4a017', 4, 2);
        // Hands
        px(ctx, 8, 22, '#fdbcb4', 2, 2);
        px(ctx, 22, 22, '#fdbcb4', 2, 2);
        // Head
        px(ctx, 12, 6, '#fdbcb4', 8, 8);
        // Hood
        px(ctx, 10, 4, '#1e8449', 12, 6);
        px(ctx, 10, 4, '#1e8449', 2, 8);
        px(ctx, 20, 4, '#1e8449', 2, 8);
        px(ctx, 11, 3, '#1e8449', 10, 2);
        // Eyes
        px(ctx, 14, 8, '#333', 2, 2);
        px(ctx, 18, 8, '#333', 2, 2);
        // Nose
        px(ctx, 16, 10, '#e8a890', 1, 1);
        // Feet
        px(ctx, 11, 26, '#5a2d0e', 4, 2);
        px(ctx, 17, 26, '#5a2d0e', 4, 2);
    });

    // --- NPC_QUEST2 (second quest giver - wizard) ---
    this.create('npc_quest2', (ctx) => {
        ctx.fillStyle = '#909090';
        ctx.fillRect(0, 0, S, S);
        px(ctx, 8, 28, 'rgba(0,0,0,0.3)', 16, 4);
        // Body - blue robe
        px(ctx, 10, 14, '#2980b9', 12, 12);
        px(ctx, 8, 16, '#2980b9', 4, 8);
        px(ctx, 20, 16, '#2980b9', 4, 8);
        // Robe details
        px(ctx, 12, 18, '#2471a3', 2, 8);
        px(ctx, 18, 16, '#2471a3', 2, 8);
        // Stars on robe
        px(ctx, 14, 16, '#f1c40f', 1, 1);
        px(ctx, 18, 20, '#f1c40f', 1, 1);
        // Head
        px(ctx, 12, 6, '#e8c4a0', 8, 8);
        // Wizard hat
        px(ctx, 10, 2, '#8e44ad', 12, 6);
        px(ctx, 12, 0, '#8e44ad', 8, 4);
        px(ctx, 14, 0, '#9b59b6', 4, 2);
        // Hat band
        px(ctx, 10, 6, '#f1c40f', 12, 1);
        // Eyes
        px(ctx, 14, 8, '#333', 2, 2);
        px(ctx, 18, 8, '#333', 2, 2);
        // Beard
        px(ctx, 14, 12, '#aaa', 4, 4);
        px(ctx, 15, 14, '#ccc', 2, 3);
        // Staff
        px(ctx, 6, 8, '#5a2d0e', 2, 20);
        px(ctx, 5, 6, '#9b59b6', 4, 3);
        px(ctx, 6, 5, '#e74c3c', 2, 2);
        // Feet
        px(ctx, 11, 26, '#5a2d0e', 4, 2);
        px(ctx, 17, 26, '#5a2d0e', 4, 2);
    });

    // --- NPC_QUEST_DONE ---
    this.create('npc_quest_done', (ctx) => {
        ctx.fillStyle = '#909090';
        ctx.fillRect(0, 0, S, S);
        px(ctx, 8, 28, 'rgba(0,0,0,0.3)', 16, 4);
        px(ctx, 10, 14, '#27ae60', 12, 12);
        px(ctx, 8, 16, '#27ae60', 4, 8);
        px(ctx, 20, 16, '#27ae60', 4, 8);
        px(ctx, 12, 18, '#1e8449', 2, 8);
        px(ctx, 18, 16, '#1e8449', 2, 8);
        px(ctx, 10, 20, '#8B4513', 12, 2);
        px(ctx, 8, 22, '#fdbcb4', 2, 2);
        px(ctx, 22, 22, '#fdbcb4', 2, 2);
        px(ctx, 12, 6, '#fdbcb4', 8, 8);
        px(ctx, 10, 4, '#1e8449', 12, 6);
        px(ctx, 10, 4, '#1e8449', 2, 8);
        px(ctx, 20, 4, '#1e8449', 2, 8);
        px(ctx, 11, 3, '#1e8449', 10, 2);
        px(ctx, 14, 8, '#333', 2, 2);
        px(ctx, 18, 8, '#333', 2, 2);
        px(ctx, 11, 26, '#5a2d0e', 4, 2);
        px(ctx, 17, 26, '#5a2d0e', 4, 2);
    });

    // --- SHOPKEEPER NPC ---
    this.create('npc_shopkeeper', (ctx) => {
        ctx.fillStyle = '#c69463';
        ctx.fillRect(0, 0, S, S);
        px(ctx, 8, 28, 'rgba(0,0,0,0.2)', 16, 4);
        // Body - brown apron
        px(ctx, 10, 14, '#8B4513', 12, 12);
        px(ctx, 12, 16, '#a0522d', 8, 8);
        px(ctx, 8, 16, '#8B4513', 4, 8);
        px(ctx, 20, 16, '#8B4513', 4, 8);
        // Apron
        px(ctx, 11, 16, '#d4a574', 10, 10);
        px(ctx, 12, 17, '#e8c4a0', 8, 8);
        // Hands
        px(ctx, 8, 22, '#fdbcb4', 2, 2);
        px(ctx, 22, 22, '#fdbcb4', 2, 2);
        // Head
        px(ctx, 12, 6, '#fdbcb4', 8, 8);
        // Headband
        px(ctx, 10, 4, '#e67e22', 12, 3);
        px(ctx, 11, 3, '#e67e22', 10, 2);
        // Eyes
        px(ctx, 14, 8, '#333', 2, 2);
        px(ctx, 18, 8, '#333', 2, 2);
        // Smile
        px(ctx, 14, 12, '#c0392b', 4, 1);
        // Nose
        px(ctx, 16, 10, '#e8a890', 1, 1);
        // Feet
        px(ctx, 11, 26, '#5a2d0e', 4, 2);
        px(ctx, 17, 26, '#5a2d0e', 4, 2);
    });

    // --- BRIDGE ---
    for (let f = 0; f < 4; f++) {
        this.create(`bridge_${f}`, (ctx) => {
            const blues = ['#2980b9','#2471a3','#3498db','#2573a7'];
            ctx.fillStyle = blues[f];
            ctx.fillRect(0, 0, S, S);
            // Bridge planks
            px(ctx, 2, 0, '#a0522d', 28, S);
            for (let py = 0; py < 32; py += 4) {
                px(ctx, 2, py, '#8B4513', 28, 1);
            }
            // Plank grain
            px(ctx, 8, 2, '#7B4420', 1, 28);
            px(ctx, 16, 2, '#7B4420', 1, 28);
            px(ctx, 24, 2, '#7B4420', 1, 28);
            // Rails
            px(ctx, 0, 0, '#6B3410', 2, S);
            px(ctx, 30, 0, '#6B3410', 2, S);
            // Rail posts
            for (let ry = 0; ry < 32; ry += 8) {
                px(ctx, 0, ry, '#5a2d0e', 2, 3);
                px(ctx, 30, ry, '#5a2d0e', 2, 3);
            }
            // Nail details
            px(ctx, 1, 4, '#444', 1, 1);
            px(ctx, 30, 12, '#444', 1, 1);
        });
    }

    // --- CAVE FLOOR ---
    for (let v = 0; v < 3; v++) {
        this.create(`cave_floor_${v}`, (ctx) => {
            const grays = ['#4a4a5a','#3d3d4d','#454558'];
            ctx.fillStyle = grays[v];
            ctx.fillRect(0, 0, S, S);
            // Rock texture
            px(ctx, 8, 12, '#3a3a4a', 4, 4);
            px(ctx, 22, 22, '#3a3a4a', 4, 2);
            px(ctx, 4, 24, '#3a3a4a', 3, 3);
            px(ctx, 18, 6, '#505068', 3, 2);
            // Cracks
            px(ctx, 12, 20, '#333348', 1, 6);
            px(ctx, 6, 8, '#333348', 6, 1);
            // Pebbles
            px(ctx, 16, 16, '#555568', 2, 1);
            px(ctx, 26, 10, '#555568', 1, 2);
        });
    }

    // --- CAVE WALL ---
    for (let v = 0; v < 3; v++) {
        this.create(`cave_wall_${v}`, (ctx) => {
            const darks = ['#2a2a3a','#303045','#252538'];
            ctx.fillStyle = darks[v];
            ctx.fillRect(0, 0, S, S);
            // Rock formations
            px(ctx, 4, 4, '#3d3d4d', 8, 6);
            px(ctx, 18, 14, '#3d3d4d', 6, 8);
            px(ctx, 12, 24, '#333345', 10, 4);
            px(ctx, 2, 18, '#3d3d4d', 6, 4);
            // Highlights
            px(ctx, 6, 5, '#4a4a5a', 3, 2);
            px(ctx, 20, 16, '#4a4a5a', 3, 2);
            // Crystals
            if (v === 0) {
                px(ctx, 26, 8, '#5dade2', 2, 4);
                px(ctx, 27, 7, '#8ecae6', 1, 1);
            }
            if (v === 2) {
                px(ctx, 4, 26, '#a055c0', 2, 3);
                px(ctx, 5, 25, '#b066d0', 1, 1);
            }
        });
    }

    // --- CAVE ENTRY (much more prominent) ---
    this.create('cave_entry', (ctx) => {
        // Dark entrance
        ctx.fillStyle = '#111118';
        ctx.fillRect(4, 4, 24, 28);
        // Rocky frame
        px(ctx, 0, 0, '#666678', S, 4);
        px(ctx, 0, 0, '#666678', 4, S);
        px(ctx, 28, 0, '#666678', 4, S);
        px(ctx, 4, 28, '#555568', 24, 4);
        // Rock detail on frame
        px(ctx, 2, 2, '#777788', 4, 4);
        px(ctx, 26, 2, '#777788', 4, 4);
        px(ctx, 2, 26, '#555568', 4, 4);
        px(ctx, 26, 26, '#555568', 4, 4);
        // Stalactites
        px(ctx, 10, 4, '#555568', 2, 6);
        px(ctx, 20, 4, '#555568', 2, 5);
        px(ctx, 15, 4, '#444458', 2, 4);
        // Stalagmites
        px(ctx, 8, 26, '#555568', 2, 6);
        px(ctx, 22, 28, '#555568', 2, 4);
        // Glowing eyes inside
        px(ctx, 12, 14, '#ff0000', 2, 2);
        px(ctx, 20, 14, '#ff0000', 2, 2);
        // Torch glow on sides
        px(ctx, 1, 10, '#f39c12', 2, 3);
        px(ctx, 1, 11, '#e74c3c', 1, 1);
        px(ctx, 29, 10, '#f39c12', 2, 3);
        px(ctx, 30, 11, '#e74c3c', 1, 1);
    });

    // --- FOREST ENTRY ---
    this.create('forest_entry', (ctx) => {
        ctx.fillStyle = '#2d5a2a';
        ctx.fillRect(0, 0, S, S);
        // Stone pillars
        px(ctx, 4, 0, '#888', 6, S);
        px(ctx, 22, 0, '#888', 6, S);
        px(ctx, 5, 0, '#999', 4, S);
        px(ctx, 23, 0, '#999', 4, S);
        // Pillar detail
        px(ctx, 6, 4, '#aaa', 2, 2);
        px(ctx, 24, 4, '#aaa', 2, 2);
        px(ctx, 5, 28, '#777', 4, 4);
        px(ctx, 23, 28, '#777', 4, 4);
        // Vine on pillars
        px(ctx, 8, 6, '#1e8449', 2, 8);
        px(ctx, 22, 10, '#1e8449', 2, 10);
        // Dark path between
        px(ctx, 10, 0, '#1a3a18', 12, S);
    });

    // --- FLOWER ---
    for (let v = 0; v < 4; v++) {
        this.create(`flower_${v}`, (ctx) => {
            ctx.fillStyle = '#4a8c3f';
            ctx.fillRect(0, 0, S, S);
            const colors = ['#e74c3c','#f1c40f','#9b59b6','#e67e22'];
            // Stems
            px(ctx, 10, 14, '#2ecc71', 2, 10);
            px(ctx, 22, 16, '#27ae60', 2, 8);
            px(ctx, 6, 20, '#2ecc71', 2, 6);
            // Flower heads
            px(ctx, 8, 10, colors[v], 6, 6);
            px(ctx, 10, 12, '#fff', 2, 2);
            px(ctx, 20, 12, colors[(v+1)%4], 6, 6);
            px(ctx, 22, 14, '#fff', 2, 2);
            // Small flower
            px(ctx, 4, 18, colors[(v+2)%4], 4, 4);
            px(ctx, 5, 19, '#ffe', 2, 2);
            // Leaves
            px(ctx, 8, 20, '#2ecc71', 4, 2);
            px(ctx, 20, 22, '#27ae60', 4, 2);
        });
    }

    // --- SIGN ---
    this.create('sign', (ctx) => {
        ctx.fillStyle = '#c4a663';
        ctx.fillRect(0, 0, S, S);
        // Post
        px(ctx, 14, 16, '#5a2d0e', 4, 16);
        px(ctx, 15, 17, '#6B3410', 2, 14);
        // Sign board
        px(ctx, 4, 4, '#d4a574', 24, 14);
        px(ctx, 4, 4, '#8B4513', 24, 2);
        px(ctx, 4, 16, '#8B4513', 24, 2);
        px(ctx, 4, 4, '#8B4513', 2, 14);
        px(ctx, 26, 4, '#8B4513', 2, 14);
        // Text lines
        px(ctx, 8, 8, '#6B3410', 16, 2);
        px(ctx, 10, 12, '#6B3410', 12, 2);
    });

    // --- CHEST (closed) ---
    this.create('chest_closed', (ctx) => {
        // Chest body
        px(ctx, 6, 10, '#daa520', 20, 16);
        px(ctx, 6, 10, '#b8860b', 20, 4);
        px(ctx, 8, 14, '#c8961a', 16, 10);
        // Lock
        px(ctx, 14, 12, '#ffd700', 4, 6);
        px(ctx, 15, 16, '#fff', 2, 1);
        // Metal bands
        px(ctx, 6, 10, '#8B6914', 20, 1);
        px(ctx, 6, 18, '#8B6914', 20, 1);
        px(ctx, 6, 25, '#8B6914', 20, 1);
        // Corner rivets
        px(ctx, 7, 11, '#ffd700', 2, 2);
        px(ctx, 23, 11, '#ffd700', 2, 2);
        px(ctx, 7, 23, '#ffd700', 2, 2);
        px(ctx, 23, 23, '#ffd700', 2, 2);
        // Shadow
        px(ctx, 8, 26, 'rgba(0,0,0,0.2)', 16, 2);
    });

    // --- CHEST (open) ---
    this.create('chest_open', (ctx) => {
        // Chest body
        px(ctx, 6, 14, '#8B6914', 20, 14);
        px(ctx, 8, 16, '#a07818', 16, 10);
        // Open lid
        px(ctx, 6, 6, '#a08020', 20, 10);
        px(ctx, 8, 8, '#8B6914', 16, 6);
        // Interior glow
        px(ctx, 10, 16, '#f1c40f', 12, 6);
        px(ctx, 12, 18, '#ffd700', 8, 4);
        // Shadow
        px(ctx, 8, 28, 'rgba(0,0,0,0.2)', 16, 2);
    });

    // --- WELL ---
    this.create('well', (ctx) => {
        ctx.fillStyle = '#909090';
        ctx.fillRect(0, 0, S, S);
        // Stone circle
        px(ctx, 4, 8, '#777', 24, 20);
        px(ctx, 6, 10, '#666', 20, 16);
        // Water
        px(ctx, 8, 12, '#2980b9', 16, 12);
        px(ctx, 10, 14, '#3498db', 12, 8);
        px(ctx, 12, 16, '#5dade2', 8, 4);
        // Roof supports
        px(ctx, 6, 2, '#5a2d0e', 2, 10);
        px(ctx, 24, 2, '#5a2d0e', 2, 10);
        // Roof beam
        px(ctx, 6, 2, '#6B3410', 20, 4);
        px(ctx, 7, 3, '#7B4420', 18, 2);
        // Roof tiles
        px(ctx, 4, 0, '#b03030', 24, 3);
        px(ctx, 6, 0, '#cc4040', 20, 2);
        // Rope & bucket
        px(ctx, 14, 6, '#aa9060', 2, 6);
        px(ctx, 13, 10, '#888', 4, 4);
        px(ctx, 14, 11, '#666', 2, 2);
        // Crank
        px(ctx, 26, 4, '#5a2d0e', 4, 2);
        px(ctx, 28, 3, '#666', 2, 4);
    });

    // --- STATUE ---
    this.create('statue', (ctx) => {
        ctx.fillStyle = '#909090';
        ctx.fillRect(0, 0, S, S);
        // Pedestal
        px(ctx, 6, 24, '#777', 20, 8);
        px(ctx, 8, 22, '#888', 16, 4);
        // Body
        px(ctx, 12, 8, '#aaa', 8, 16);
        px(ctx, 13, 10, '#bbb', 6, 12);
        // Head
        px(ctx, 13, 4, '#bbb', 6, 6);
        px(ctx, 14, 2, '#ccc', 4, 4);
        // Sword
        px(ctx, 22, 6, '#ddd', 2, 14);
        px(ctx, 20, 10, '#ddd', 6, 2);
        px(ctx, 22, 5, '#f1c40f', 2, 2);
        // Shield
        px(ctx, 8, 10, '#999', 4, 8);
        px(ctx, 9, 12, '#aaa', 2, 4);
    });

    // --- BIOME: SWAMP ---
    for (let v = 0; v < 4; v++) {
        this.create(`swamp_${v}`, (ctx) => {
            const cols = ['#3a5a3a','#4a5a40','#3a5438','#3d5a35'];
            ctx.fillStyle = cols[v];
            ctx.fillRect(0, 0, S, S);
            // Murky water patches
            px(ctx, 6, 16, '#2a4a2a', 6, 4);
            px(ctx, 20, 8, '#506050', 4, 6);
            px(ctx, 12, 20, '#2980b9', 6, 4);
            px(ctx, 4, 6, '#2471a3', 4, 4);
            // Mud patches
            px(ctx, 2, 28, '#4a4030', 8, 4);
            px(ctx, 22, 24, '#4a4030', 6, 3);
            // Bubbles
            px(ctx, 14, 22, '#5ca050', 2, 2);
            px(ctx, 8, 10, '#5ca050', 1, 1);
            // Dead grass
            px(ctx, 18, 14, '#6a7a50', 1, 4);
            px(ctx, 26, 4, '#6a7a50', 1, 5);
        });
    }

    // --- BIOME: MOUNTAIN ---
    for (let v = 0; v < 4; v++) {
        this.create(`mountain_${v}`, (ctx) => {
            const cols = ['#808080','#888890','#787880','#858588'];
            ctx.fillStyle = cols[v];
            ctx.fillRect(0, 0, S, S);
            // Rock formations
            px(ctx, 4, 8, '#707078', 8, 6);
            px(ctx, 18, 16, '#6a6a70', 6, 8);
            px(ctx, 10, 2, '#999', 4, 6);
            px(ctx, 24, 12, '#959598', 4, 4);
            // Cracks
            px(ctx, 8, 10, '#606068', 1, 4);
            px(ctx, 22, 20, '#606068', 4, 1);
            // Snow caps
            px(ctx, 4, 6, '#ddd', 6, 2);
            px(ctx, 20, 14, '#ccc', 4, 2);
            // Gravel
            px(ctx, 14, 26, '#6a6a70', 3, 2);
            px(ctx, 2, 22, '#6a6a70', 2, 2);
        });
    }

    // --- BIOME: DESERT ---
    for (let v = 0; v < 4; v++) {
        this.create(`desert_${v}`, (ctx) => {
            const cols = ['#d4b86a','#ccb060','#dcc070','#c8a858'];
            ctx.fillStyle = cols[v];
            ctx.fillRect(0, 0, S, S);
            // Sand dune lines
            px(ctx, 2, 6, '#c8a858', 10, 1);
            px(ctx, 16, 14, '#bfa050', 8, 1);
            px(ctx, 6, 22, '#c4a858', 12, 1);
            px(ctx, 20, 28, '#bfa050', 6, 1);
            // Sand texture
            px(ctx, 8, 12, '#bfa050', 3, 2);
            px(ctx, 20, 8, '#c4a858', 4, 2);
            px(ctx, 4, 26, '#bfa050', 3, 2);
            // Tiny stones
            px(ctx, 14, 18, '#a09048', 2, 1);
            px(ctx, 26, 24, '#a09048', 1, 1);
        });
    }

    // --- MOUNTAIN ROCK ---
    this.create('rock', (ctx) => {
        ctx.fillStyle = '#707078';
        ctx.fillRect(0, 0, S, S);
        // Large rocks
        px(ctx, 2, 4, '#606068', 12, 10);
        px(ctx, 16, 12, '#5a5a62', 10, 8);
        px(ctx, 6, 18, '#656570', 16, 10);
        // Highlights
        px(ctx, 4, 6, '#888', 6, 4);
        px(ctx, 20, 14, '#888', 4, 2);
        px(ctx, 8, 20, '#757580', 8, 4);
        // Dark crevices
        px(ctx, 12, 8, '#505058', 2, 6);
        px(ctx, 6, 26, '#505058', 10, 1);
        px(ctx, 24, 18, '#505058', 1, 4);
    });

    // --- SWAMP TREE ---
    this.create('swamp_tree', (ctx) => {
        ctx.fillStyle = '#3a5a3a';
        ctx.fillRect(0, 0, S, S);
        // Trunk - twisted
        px(ctx, 12, 16, '#3a2a18', 8, 16);
        px(ctx, 14, 18, '#4a3a20', 4, 14);
        // Trunk twists
        px(ctx, 10, 20, '#3a2a18', 4, 6);
        px(ctx, 18, 22, '#3a2a18', 4, 4);
        // Crown - dark, sparse
        px(ctx, 4, 4, '#2a5a28', 24, 16);
        px(ctx, 6, 6, '#3a6a38', 20, 12);
        px(ctx, 10, 0, '#2a5a28', 6, 8);
        px(ctx, 18, 2, '#2a5a28', 6, 6);
        // Sparse patches (holes in canopy)
        px(ctx, 12, 8, '#3a5a3a', 4, 4);
        px(ctx, 22, 10, '#3a5a3a', 4, 4);
        // Hanging moss
        px(ctx, 4, 18, '#1a4a1c', 2, 6);
        px(ctx, 26, 16, '#1a4a1c', 2, 6);
        px(ctx, 16, 16, '#1a4a1c', 2, 4);
        // Roots in water
        px(ctx, 8, 28, '#3a2a18', 4, 4);
        px(ctx, 20, 30, '#3a2a18', 4, 2);
    });

    // --- CACTUS ---
    this.create('cactus', (ctx) => {
        ctx.fillStyle = '#d4b86a';
        ctx.fillRect(0, 0, S, S);
        // Main body
        px(ctx, 14, 6, '#2d8a4e', 6, 26);
        px(ctx, 15, 8, '#3a9a5e', 4, 22);
        px(ctx, 16, 10, '#4aaa6e', 2, 18);
        // Left arm
        px(ctx, 8, 12, '#2d8a4e', 6, 2);
        px(ctx, 8, 8, '#2d8a4e', 2, 6);
        px(ctx, 9, 9, '#3a9a5e', 1, 3);
        // Right arm
        px(ctx, 20, 16, '#2d8a4e', 4, 2);
        px(ctx, 22, 12, '#2d8a4e', 2, 6);
        px(ctx, 23, 13, '#3a9a5e', 1, 3);
        // Spines
        px(ctx, 13, 8, '#4a6a3e', 1, 1);
        px(ctx, 20, 10, '#4a6a3e', 1, 1);
        px(ctx, 14, 20, '#4a6a3e', 1, 1);
        px(ctx, 19, 14, '#4a6a3e', 1, 1);
        // Flower on top
        px(ctx, 15, 4, '#e74c3c', 4, 3);
        px(ctx, 16, 5, '#ff6b6b', 2, 1);
    });

    // --- VILLAGE HUT ---
    this.create('village_hut', (ctx) => {
        ctx.fillStyle = '#c69463';
        ctx.fillRect(0, 10, S, 22);
        for (let by = 12; by < 32; by += 4) { px(ctx, 0, by, '#b88855', S, 1); }
        // Thatched roof
        px(ctx, 0, 0, '#7a6030', 32, 12);
        px(ctx, 2, 2, '#8a7040', 28, 8);
        px(ctx, 4, 3, '#9a8050', 24, 6);
        px(ctx, 6, 1, '#a89060', 20, 4);
        // Straw detail
        for (let sx = 2; sx < 30; sx += 3) {
            px(ctx, sx, 8, '#6a5020', 1, 4);
        }
        // Window
        px(ctx, 20, 16, '#87ceeb', 6, 6);
        px(ctx, 22, 18, '#f7dc6f', 2, 2);
        px(ctx, 20, 16, '#5a5a5a', 6, 1);
        px(ctx, 20, 16, '#5a5a5a', 1, 6);
        px(ctx, 25, 16, '#5a5a5a', 1, 6);
    });

    // --- SHOP FLOOR ---
    this.create('shop_floor', (ctx) => {
        ctx.fillStyle = '#c69463';
        ctx.fillRect(0, 0, S, S);
        // Tile pattern
        px(ctx, 0, 0, '#b88855', S, 1);
        px(ctx, 0, 0, '#b88855', 1, S);
        px(ctx, 16, 0, '#b88855', 1, S);
        px(ctx, 0, 16, '#b88855', S, 1);
        // Tile highlights
        px(ctx, 2, 2, '#d4a574', 4, 4);
        px(ctx, 18, 18, '#d4a574', 4, 4);
    });

    // --- SHOP COUNTER ---
    this.create('shop_counter', (ctx) => {
        ctx.fillStyle = '#c69463';
        ctx.fillRect(0, 0, S, S);
        // Counter top
        px(ctx, 0, 8, '#5a2d0e', S, 16);
        px(ctx, 0, 8, '#6B3410', S, 4);
        px(ctx, 0, 20, '#6B3410', S, 4);
        px(ctx, 2, 10, '#7B4420', 28, 10);
        // Items on counter
        px(ctx, 6, 4, '#e74c3c', 4, 4);  // Potion
        px(ctx, 14, 2, '#ccc', 2, 6);     // Sword
        px(ctx, 22, 4, '#daa520', 4, 4);  // Gold
    });

    // --- NEW: TOWN BUILDING (generic building with NPC inside) ---
    this.create('town_building', (ctx) => {
        // Wall
        ctx.fillStyle = '#b8a088';
        ctx.fillRect(0, 10, S, 22);
        for (let by = 12; by < 32; by += 4) { px(ctx, 0, by, '#a89078', S, 1); }
        // Slate roof
        px(ctx, 0, 0, '#506070', 32, 12);
        px(ctx, 2, 2, '#607080', 28, 8);
        px(ctx, 4, 3, '#708090', 24, 6);
        // Window with warm glow
        px(ctx, 12, 16, '#87ceeb', 8, 8);
        px(ctx, 12, 16, '#5a5a5a', 8, 1);
        px(ctx, 12, 16, '#5a5a5a', 1, 8);
        px(ctx, 19, 16, '#5a5a5a', 1, 8);
        px(ctx, 12, 20, '#5a5a5a', 8, 1);
        px(ctx, 15, 16, '#5a5a5a', 1, 8);
        // Warm light
        px(ctx, 13, 17, '#f7dc6f', 2, 3);
        px(ctx, 16, 17, '#ffeaa7', 3, 3);
        // Sign
        px(ctx, 4, 24, '#5a2d0e', 8, 5);
        px(ctx, 5, 25, '#d4a574', 6, 3);
    });

    // --- NEW: TOWN BUILDING DOOR ---
    this.create('town_building_door', (ctx) => {
        ctx.fillStyle = '#b8a088';
        ctx.fillRect(0, 0, S, S);
        for (let by = 0; by < 32; by += 4) { px(ctx, 0, by, '#a89078', S, 1); }
        // Arched door
        px(ctx, 8, 4, '#3a1808', 16, 28);
        px(ctx, 9, 5, '#5a2d0e', 14, 26);
        px(ctx, 10, 6, '#6B3410', 12, 24);
        px(ctx, 11, 7, '#7B4420', 10, 22);
        // Arch detail
        px(ctx, 10, 4, '#3a1808', 12, 2);
        // Wood grain
        px(ctx, 14, 8, '#6B3410', 1, 20);
        px(ctx, 18, 8, '#6B3410', 1, 20);
        // Handle
        px(ctx, 20, 18, '#d4a017', 3, 3);
        px(ctx, 21, 19, '#ffd700', 1, 1);
        // Lantern above
        px(ctx, 4, 4, '#d4a017', 3, 4);
        px(ctx, 5, 3, '#f39c12', 1, 1);
        px(ctx, 5, 5, '#f1c40f', 1, 2);
        // Step
        px(ctx, 6, 30, '#999', 20, 2);
    });

    // --- NEW: COBBLESTONE (city path) ---
    for (let v = 0; v < 4; v++) {
        this.create(`cobble_${v}`, (ctx) => {
            ctx.fillStyle = '#888';
            ctx.fillRect(0, 0, S, S);
            // Cobblestone pattern
            for (let cy = 0; cy < 32; cy += 6) {
                const xoff = (cy / 6 % 2 === 0) ? 0 : 3;
                for (let cx = xoff; cx < 32; cx += 8) {
                    const shade = ['#7a7a7a','#8a8a8a','#909090','#828282'][(cx + cy + v) % 4];
                    px(ctx, cx, cy, shade, 6, 4);
                    px(ctx, cx, cy, '#777', 6, 1);
                    px(ctx, cx, cy, '#777', 1, 4);
                }
            }
        });
    }

    // --- NEW: LAVA terrain ---
    for (let f = 0; f < 4; f++) {
        this.create(`lava_${f}`, (ctx) => {
            ctx.fillStyle = '#c0392b';
            ctx.fillRect(0, 0, S, S);
            const off = f * 4;
            // Lava flows
            px(ctx, (off) % 32, 6, '#e74c3c', 10, 3);
            px(ctx, (off + 12) % 32, 18, '#f39c12', 8, 3);
            px(ctx, (off + 8) % 32, 26, '#e74c3c', 6, 2);
            // Hot spots
            px(ctx, (off + 4) % 32, 12, '#f1c40f', 4, 4);
            px(ctx, (off + 16) % 32, 22, '#f1c40f', 3, 2);
            // Dark crust
            px(ctx, 8, 4, '#922', 6, 2);
            px(ctx, 20, 14, '#922', 4, 3);
        });
    }

    // --- NEW: SNOW terrain ---
    for (let v = 0; v < 4; v++) {
        this.create(`snow_${v}`, (ctx) => {
            ctx.fillStyle = '#ecf0f1';
            ctx.fillRect(0, 0, S, S);
            // Snow texture
            px(ctx, 6, 8, '#dfe6e9', 4, 3);
            px(ctx, 20, 16, '#dfe6e9', 6, 2);
            px(ctx, 12, 24, '#d5dfe2', 4, 3);
            // Sparkle
            px(ctx, 8 + v * 3, 4, '#fff', 1, 1);
            px(ctx, 22 - v * 2, 20, '#fff', 1, 1);
            px(ctx, 14 + v, 28, '#fff', 1, 1);
            // Blue shadow
            px(ctx, 4, 14, '#b2bec3', 3, 2);
            px(ctx, 24, 6, '#b2bec3', 2, 3);
        });
    }

    // --- NEW: SNOW PINE tree ---
    this.create('snow_pine', (ctx) => {
        ctx.fillStyle = '#ecf0f1';
        ctx.fillRect(0, 0, S, S);
        // Trunk
        px(ctx, 14, 24, '#5a2d0e', 4, 8);
        // Tree layers (bottom to top, wider to narrower)
        px(ctx, 4, 18, '#1a6b30', 24, 8);
        px(ctx, 6, 12, '#1e8449', 20, 8);
        px(ctx, 8, 6, '#27ae60', 16, 8);
        px(ctx, 10, 2, '#2ecc71', 12, 6);
        px(ctx, 13, 0, '#3ddc84', 6, 4);
        // Snow on branches
        px(ctx, 4, 18, '#ecf0f1', 24, 2);
        px(ctx, 6, 12, '#ecf0f1', 20, 2);
        px(ctx, 8, 6, '#ecf0f1', 16, 2);
        px(ctx, 10, 2, '#ecf0f1', 12, 2);
        px(ctx, 13, 0, '#fff', 6, 1);
    });

    // --- HOUSE_WALL (proper brick/stone wall) ---
    this.create('house_wall', (ctx) => {
        // Stone wall with bricks
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(0, 0, S, S);
        // Brick rows
        for (let by = 0; by < S; by += 8) {
            const offset = (by % 16 === 0) ? 0 : 8;
            for (let bx = offset; bx < S; bx += 16) {
                px(ctx, bx, by, '#7B6345', 15, 7);
                px(ctx, bx + 1, by + 1, '#9B8365', 13, 5);
            }
            px(ctx, 0, by + 7, '#6B5335', S, 1); // mortar line
        }
        // Dark edges
        px(ctx, 0, 0, '#5a4a3a', S, 1);
        px(ctx, 0, 0, '#5a4a3a', 1, S);
        px(ctx, S - 1, 0, '#5a4a3a', 1, S);
        px(ctx, 0, S - 1, '#5a4a3a', S, 1);
    });

    // --- HOUSE_ROOF (brown/red roof tiles) ---
    this.create('house_roof', (ctx) => {
        ctx.fillStyle = '#8B2500';
        ctx.fillRect(0, 0, S, S);
        // Roof tile rows
        for (let ry = 0; ry < S; ry += 6) {
            const offset = (ry % 12 === 0) ? 0 : 8;
            for (let rx = offset; rx < S; rx += 16) {
                px(ctx, rx, ry, '#A52A00', 14, 5);
                px(ctx, rx + 1, ry + 1, '#B53A10', 12, 3);
            }
        }
        // Highlight on top row
        px(ctx, 0, 0, '#C54A20', S, 2);
    });

    // --- HOUSE_FLOOR (wooden floor planks) ---
    this.create('house_floor', (ctx) => {
        ctx.fillStyle = '#B8860B';
        ctx.fillRect(0, 0, S, S);
        // Wooden planks
        for (let py = 0; py < S; py += 8) {
            px(ctx, 0, py, '#A0760B', S, 1);
            px(ctx, 4 + (py % 16), py + 2, '#C8960B', 8, 1);
            px(ctx, 20 - (py % 16), py + 5, '#D0A020', 6, 1);
        }
        // Wood grain
        px(ctx, 8, 4, '#9a7000', 1, 6);
        px(ctx, 24, 12, '#9a7000', 1, 6);
        px(ctx, 16, 20, '#9a7000', 1, 6);
    });

    // --- HOUSE_WINDOW (wall with window opening) ---
    this.create('house_window', (ctx) => {
        // Base wall
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(0, 0, S, S);
        // Brick rows
        for (let by = 0; by < S; by += 8) {
            px(ctx, 0, by + 7, '#6B5335', S, 1);
        }
        // Window frame
        px(ctx, 8, 6, '#5a2d0e', 16, 20);
        px(ctx, 9, 7, '#3a1a00', 14, 18);
        // Glass panes
        px(ctx, 10, 8, '#5588aa', 6, 8);
        px(ctx, 16, 8, '#5588aa', 6, 8);
        px(ctx, 10, 17, '#5588aa', 6, 7);
        px(ctx, 16, 17, '#5588aa', 6, 7);
        // Cross frame
        px(ctx, 15, 8, '#5a2d0e', 2, 16);
        px(ctx, 10, 15, '#5a2d0e', 12, 2);
        // Glass shine
        px(ctx, 11, 9, '#88bbdd', 2, 2);
        px(ctx, 17, 9, '#88bbdd', 2, 2);
        // Sill
        px(ctx, 7, 25, '#6B5335', 18, 2);
        // Wall edges
        px(ctx, 0, 0, '#5a4a3a', S, 1);
        px(ctx, 0, S - 1, '#5a4a3a', S, 1);
    });

    // Stairs going up
    this.create('stairs_up', (ctx) => {
        ctx.fillStyle = '#B8860B';
        ctx.fillRect(0, 0, S, S);
        // Steps (going upward - top is higher)
        for (let i = 0; i < 5; i++) {
            const y = 4 + i * 5;
            const shade = Math.floor(180 - i * 20);
            ctx.fillStyle = `rgb(${shade},${shade - 40},${shade - 80})`;
            ctx.fillRect(4, y, 24, 4);
            ctx.fillStyle = `rgb(${shade + 20},${shade - 20},${shade - 60})`;
            ctx.fillRect(4, y, 24, 1);
        }
        // Side rails
        px(ctx, 2, 0, '#5a2d0e', 2, S);
        px(ctx, 28, 0, '#5a2d0e', 2, S);
        // Arrow up indicator
        px(ctx, 14, 1, '#2ecc71', 4, 2);
        px(ctx, 15, 0, '#2ecc71', 2, 1);
    });

    // Stairs going down
    this.create('stairs_down', (ctx) => {
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(0, 0, S, S);
        // Steps (going downward - bottom is lower/darker)
        for (let i = 0; i < 5; i++) {
            const y = 4 + i * 5;
            const shade = Math.floor(100 + i * 20);
            ctx.fillStyle = `rgb(${shade},${shade - 40},${shade - 80})`;
            ctx.fillRect(4, y, 24, 4);
            ctx.fillStyle = `rgb(${shade - 20},${shade - 60},${shade - 100})`;
            ctx.fillRect(4, y + 3, 24, 1);
        }
        // Side rails
        px(ctx, 2, 0, '#5a2d0e', 2, S);
        px(ctx, 28, 0, '#5a2d0e', 2, S);
        // Arrow down indicator
        px(ctx, 14, S - 3, '#e74c3c', 4, 2);
        px(ctx, 15, S - 1, '#e74c3c', 2, 1);
    });
};
