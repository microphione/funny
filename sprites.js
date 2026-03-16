// ============================================================
// SPRITE RENDERER - 32-bit style pixel art (HD upgrade)
// All sprites drawn at 32x32 native resolution
// ============================================================

const Sprites = {
    cache: {},
    SPRITE_SIZE: 32,

    create(key, drawFn) {
        if (this.cache[key]) return this.cache[key];
        const c = document.createElement('canvas');
        c.width = this.SPRITE_SIZE;
        c.height = this.SPRITE_SIZE;
        const ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        drawFn(ctx, this.SPRITE_SIZE);
        this.cache[key] = c;
        return c;
    },

    draw(gameCtx, key, x, y, scale = 1) {
        const sprite = this.cache[key];
        if (!sprite) return;
        gameCtx.drawImage(sprite, x, y, this.SPRITE_SIZE * scale, this.SPRITE_SIZE * scale);
    },

    px(ctx, x, y, color, w = 1, h = 1) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
    },

    // Helper: draw a filled rectangle with outline
    rect(ctx, x, y, w, h, fill, outline) {
        ctx.fillStyle = fill;
        ctx.fillRect(x, y, w, h);
        if (outline) {
            ctx.fillStyle = outline;
            ctx.fillRect(x, y, w, 1);
            ctx.fillRect(x, y, 1, h);
            ctx.fillRect(x + w - 1, y, 1, h);
            ctx.fillRect(x, y + h - 1, w, 1);
        }
    },

    // Helper: draw a simple circle approximation
    circle(ctx, cx, cy, r, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
    },

    // Helper: gradient fill
    grad(ctx, x, y, w, h, c1, c2, vertical = true) {
        const g = vertical ? ctx.createLinearGradient(x, y, x, y + h) : ctx.createLinearGradient(x, y, x + w, y);
        g.addColorStop(0, c1);
        g.addColorStop(1, c2);
        ctx.fillStyle = g;
        ctx.fillRect(x, y, w, h);
    },

    // ========== TILE SPRITES ==========
    initTiles() {
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
    },

    // ========== PLAYER SPRITES (32x32 detailed) ==========
    initPlayer() {
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
    },

    // ========== MONSTER SPRITES (32x32 detailed) ==========
    initMonsters() {
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

        // ---- GRIFFIN ----
        for (let dir = 0; dir < 2; dir++) {
            this.create(`mob_griffin_${dir}`, (ctx) => {
                const bob = dir === 1 ? -2 : 0;
                px(ctx, 6, 28, 'rgba(0,0,0,0.3)', 20, 4);
                // Talons
                px(ctx, 10 + dir, 26, '#daa520', 4, 4);
                px(ctx, 18 - dir, 26, '#daa520', 4, 4);
                px(ctx, 9 + dir, 28, '#c8961a', 2, 3);
                px(ctx, 22 - dir, 28, '#c8961a', 2, 3);
                // Body - lion
                px(ctx, 8, 14 + bob, '#daa520', 16, 14);
                px(ctx, 10, 16 + bob, '#e8b830', 12, 10);
                // Wings
                px(ctx, 0, 6 + bob, '#c8961a', 8, 14);
                px(ctx, 24, 6 + bob, '#c8961a', 8, 14);
                px(ctx, 2, 8 + bob, '#daa520', 4, 10);
                px(ctx, 26, 8 + bob, '#daa520', 4, 10);
                // Wing feathers
                px(ctx, 0, 10 + bob, '#b08818', 2, 8);
                px(ctx, 30, 10 + bob, '#b08818', 2, 8);
                // Head - eagle
                px(ctx, 10, 4 + bob, '#daa520', 12, 10);
                px(ctx, 12, 6 + bob, '#e8b830', 8, 6);
                // Beak
                px(ctx, 8, 8 + bob, '#f39c12', 4, 4);
                px(ctx, 8, 8 + bob, '#e67e22', 2, 2);
                // Eyes
                px(ctx, 12, 6 + bob, '#f00', 2, 2);
                px(ctx, 18, 6 + bob, '#f00', 2, 2);
                // Ear tufts
                px(ctx, 10, 2 + bob, '#c8961a', 3, 4);
                px(ctx, 19, 2 + bob, '#c8961a', 3, 4);
                // Mane
                px(ctx, 10, 12 + bob, '#b08818', 12, 4);
            });
        }

        // ---- DARK KNIGHT ----
        for (let dir = 0; dir < 2; dir++) {
            this.create(`mob_dark_knight_${dir}`, (ctx) => {
                const bob = dir === 1 ? -1 : 0;
                px(ctx, 8, 28, 'rgba(0,0,0,0.3)', 16, 4);
                // Boots
                px(ctx, 10 + dir, 26, '#1a1a1a', 4, 6);
                px(ctx, 18 - dir, 26, '#1a1a1a', 4, 6);
                // Leg armor
                px(ctx, 10, 20, '#2c2c2c', 12, 8);
                px(ctx, 12, 22, '#333', 8, 4);
                // Body armor
                px(ctx, 8, 8 + bob, '#2c2c2c', 16, 14);
                px(ctx, 10, 10 + bob, '#333', 12, 10);
                // Chest detail
                px(ctx, 12, 12 + bob, '#444', 8, 6);
                px(ctx, 14, 14 + bob, '#c0392b', 4, 2);
                // Shoulder pads
                px(ctx, 4, 8 + bob, '#2c2c2c', 6, 6);
                px(ctx, 22, 8 + bob, '#2c2c2c', 6, 6);
                px(ctx, 5, 9 + bob, '#444', 4, 4);
                px(ctx, 23, 9 + bob, '#444', 4, 4);
                // Spikes on shoulders
                px(ctx, 6, 6 + bob, '#555', 2, 3);
                px(ctx, 24, 6 + bob, '#555', 2, 3);
                // Arms
                px(ctx, 4, 14 + bob, '#2c2c2c', 4, 8);
                px(ctx, 24, 14 + bob, '#2c2c2c', 4, 8);
                // Helmet
                px(ctx, 10, 0 + bob, '#2c2c2c', 12, 10);
                px(ctx, 8, 2 + bob, '#333', 16, 6);
                // Visor
                px(ctx, 12, 4 + bob, '#111', 8, 3);
                // Eyes behind visor
                px(ctx, 13, 5 + bob, '#f00', 2, 1);
                px(ctx, 18, 5 + bob, '#f00', 2, 1);
                // Helmet crest
                px(ctx, 14, 0 + bob, '#c0392b', 4, 2);
                // Sword - large dark blade
                px(ctx, 26, 4 + bob, '#555', 3, 20);
                px(ctx, 27, 6 + bob, '#777', 1, 16);
                px(ctx, 26, 2 + bob, '#333', 3, 3);
                px(ctx, 25, 22 + bob, '#d4a017', 5, 2);
            });
        }

        // ---- SCORPION ----
        for (let dir = 0; dir < 2; dir++) {
            this.create(`mob_scorpion_${dir}`, (ctx) => {
                const bob = dir === 1 ? -1 : 0;
                px(ctx, 6, 28, 'rgba(0,0,0,0.3)', 20, 4);
                // Legs (8)
                for (let i = 0; i < 4; i++) {
                    const loff = (dir === 1 && i % 2 === 0) ? -1 : 0;
                    px(ctx, 4 + i * 4, 24 + loff, '#b8960e', 2, 6);
                    px(ctx, 18 + i * 4, 24 + loff, '#b8960e', 2, 6);
                }
                // Body
                px(ctx, 8, 16 + bob, '#c4a858', 16, 12);
                px(ctx, 10, 18 + bob, '#d4b868', 12, 8);
                // Segmented body
                px(ctx, 8, 20 + bob, '#b89848', 16, 1);
                px(ctx, 8, 24 + bob, '#b89848', 16, 1);
                // Head
                px(ctx, 10, 12 + bob, '#c4a858', 12, 6);
                // Pincers
                px(ctx, 4, 10 + bob, '#c4a858', 6, 4);
                px(ctx, 22, 10 + bob, '#c4a858', 6, 4);
                px(ctx, 2, 8 + bob, '#d4b868', 4, 4);
                px(ctx, 26, 8 + bob, '#d4b868', 4, 4);
                // Pincer tips
                px(ctx, 2, 8 + bob, '#b89848', 2, 2);
                px(ctx, 28, 8 + bob, '#b89848', 2, 2);
                // Eyes
                px(ctx, 12, 13 + bob, '#f00', 2, 2);
                px(ctx, 18, 13 + bob, '#f00', 2, 2);
                // Tail (curving up)
                px(ctx, 14, 26 + bob, '#c4a858', 4, 2);
                px(ctx, 16, 24 + bob, '#c4a858', 4, 2);
                px(ctx, 18, 20 + bob, '#c4a858', 4, 2);
                px(ctx, 18, 16 + bob, '#c4a858', 4, 2);
                // Stinger
                px(ctx, 19, 14 + bob, '#e74c3c', 2, 3);
            });
        }

        // ---- MUMMY ----
        for (let dir = 0; dir < 2; dir++) {
            this.create(`mob_mummy_${dir}`, (ctx) => {
                const bob = dir === 1 ? -1 : 0;
                px(ctx, 8, 28, 'rgba(0,0,0,0.3)', 16, 4);
                // Feet (wrapped)
                px(ctx, 10 + dir, 26, '#c4b080', 4, 6);
                px(ctx, 18 - dir, 26, '#c4b080', 4, 6);
                // Legs
                px(ctx, 10, 20, '#d4c090', 12, 8);
                // Body - wrapped
                px(ctx, 8, 8 + bob, '#d4c090', 16, 14);
                px(ctx, 10, 10 + bob, '#ddd0a0', 12, 10);
                // Bandage lines
                for (let by = 10; by < 22; by += 3) {
                    px(ctx, 8, by + bob, '#c4b080', 16, 1);
                }
                px(ctx, 14, 8 + bob, '#c4b080', 1, 14);
                // Arms (outstretched)
                px(ctx, 4, 10 + bob, '#d4c090', 4, 10);
                px(ctx, 24, 10 + bob, '#d4c090', 4, 10);
                // Dangling bandage
                px(ctx, 4, 18 + bob, '#c4b080', 2, 6);
                px(ctx, 26, 16 + bob, '#c4b080', 2, 8);
                // Head
                px(ctx, 10, 0 + bob, '#d4c090', 12, 10);
                px(ctx, 12, 2 + bob, '#ddd0a0', 8, 6);
                // Head bandages
                px(ctx, 10, 2 + bob, '#c4b080', 12, 1);
                px(ctx, 10, 5 + bob, '#c4b080', 12, 1);
                // Eyes - glowing green
                px(ctx, 12, 4 + bob, '#0f0', 3, 2);
                px(ctx, 18, 4 + bob, '#0f0', 3, 2);
                px(ctx, 13, 4 + bob, '#0a0', 1, 2);
                px(ctx, 19, 4 + bob, '#0a0', 1, 2);
                // Dark mouth opening
                px(ctx, 14, 7 + bob, '#333', 4, 2);
            });
        }

        // ---- DJINN ----
        for (let dir = 0; dir < 2; dir++) {
            this.create(`mob_djinn_${dir}`, (ctx) => {
                const bob = dir === 1 ? -2 : 0;
                // No feet - floating smoke tail
                ctx.globalAlpha = 0.6;
                px(ctx, 12, 24 + bob, '#5dade2', 8, 8);
                px(ctx, 10, 26 + bob, '#3498db', 12, 4);
                px(ctx, 14, 28 + bob, '#2980b9', 6, 4);
                ctx.globalAlpha = 1;
                // Body
                px(ctx, 8, 10 + bob, '#5dade2', 16, 16);
                px(ctx, 10, 12 + bob, '#6bc1ed', 12, 12);
                // Vest
                px(ctx, 10, 12 + bob, '#8e44ad', 12, 8);
                px(ctx, 12, 14 + bob, '#9b59b6', 8, 4);
                // Arms crossed
                px(ctx, 4, 12 + bob, '#5dade2', 4, 8);
                px(ctx, 24, 12 + bob, '#5dade2', 4, 8);
                // Gold bracelets
                px(ctx, 4, 14 + bob, '#f1c40f', 4, 2);
                px(ctx, 24, 14 + bob, '#f1c40f', 4, 2);
                // Head
                px(ctx, 10, 2 + bob, '#5dade2', 12, 10);
                px(ctx, 12, 4 + bob, '#6bc1ed', 8, 6);
                // Turban
                px(ctx, 10, 0 + bob, '#f1c40f', 12, 4);
                px(ctx, 12, 0 + bob, '#e67e22', 8, 2);
                // Turban gem
                px(ctx, 14, 2 + bob, '#e74c3c', 4, 2);
                px(ctx, 15, 2 + bob, '#ff6b6b', 2, 1);
                // Eyes
                px(ctx, 12, 6 + bob, '#fff', 3, 2);
                px(ctx, 18, 6 + bob, '#fff', 3, 2);
                px(ctx, 13, 6 + bob, '#000', 1, 2);
                px(ctx, 19, 6 + bob, '#000', 1, 2);
                // Beard
                px(ctx, 14, 10 + bob, '#3498db', 4, 3);
                // Smoke wisps around
                ctx.globalAlpha = 0.4;
                px(ctx, 2, 18 + bob, '#5dade2', 4, 4);
                px(ctx, 26, 14 + bob, '#5dade2', 4, 4);
                ctx.globalAlpha = 1;
            });
        }

        // ---- NEW MONSTERS ----

        // ---- SKELETON ----
        for (let dir = 0; dir < 2; dir++) {
            this.create(`mob_skeleton_${dir}`, (ctx) => {
                const bob = dir === 1 ? -1 : 0;
                px(ctx, 8, 28, 'rgba(0,0,0,0.3)', 16, 4);
                // Feet
                px(ctx, 10 + dir, 28, '#ddd', 4, 3);
                px(ctx, 18 - dir, 28, '#ddd', 4, 3);
                // Leg bones
                px(ctx, 12, 20, '#ddd', 2, 8);
                px(ctx, 18, 20, '#ddd', 2, 8);
                // Pelvis
                px(ctx, 10, 18, '#ccc', 12, 4);
                // Spine
                px(ctx, 14, 8 + bob, '#ddd', 4, 12);
                px(ctx, 15, 10 + bob, '#ccc', 2, 8);
                // Ribcage
                px(ctx, 10, 10 + bob, '#ddd', 12, 6);
                px(ctx, 10, 12 + bob, '#111', 2, 2);
                px(ctx, 14, 12 + bob, '#111', 4, 2);
                px(ctx, 20, 12 + bob, '#111', 2, 2);
                // Arms
                px(ctx, 6, 10 + bob, '#ddd', 4, 2);
                px(ctx, 4, 12 + bob, '#ddd', 2, 8);
                px(ctx, 22, 10 + bob, '#ddd', 4, 2);
                px(ctx, 26, 12 + bob, '#ddd', 2, 8);
                // Skull
                px(ctx, 10, 0 + bob, '#eee', 12, 10);
                px(ctx, 12, 2 + bob, '#fff', 8, 6);
                // Eye sockets
                px(ctx, 12, 4 + bob, '#111', 3, 3);
                px(ctx, 18, 4 + bob, '#111', 3, 3);
                // Eye glow
                px(ctx, 13, 5 + bob, '#f00', 1, 1);
                px(ctx, 19, 5 + bob, '#f00', 1, 1);
                // Nose hole
                px(ctx, 15, 6 + bob, '#222', 2, 2);
                // Teeth
                px(ctx, 12, 8 + bob, '#fff', 2, 1);
                px(ctx, 15, 8 + bob, '#fff', 2, 1);
                px(ctx, 18, 8 + bob, '#fff', 2, 1);
                // Sword
                px(ctx, 2, 14 + bob, '#bbb', 2, 10);
                px(ctx, 2, 12 + bob, '#888', 2, 3);
            });
        }

        // ---- DEMON ----
        for (let dir = 0; dir < 2; dir++) {
            this.create(`mob_demon_${dir}`, (ctx) => {
                const bob = dir === 1 ? -1 : 0;
                px(ctx, 6, 28, 'rgba(0,0,0,0.3)', 20, 4);
                // Hooves
                px(ctx, 8 + dir, 26, '#333', 5, 6);
                px(ctx, 19 - dir, 26, '#333', 5, 6);
                // Legs
                px(ctx, 10, 20, '#8b0000', 12, 8);
                // Body
                px(ctx, 8, 8 + bob, '#8b0000', 16, 14);
                px(ctx, 10, 10 + bob, '#a00', 12, 10);
                // Chest
                px(ctx, 12, 12 + bob, '#c00', 8, 4);
                // Wings
                px(ctx, 0, 4 + bob, '#550000', 8, 16);
                px(ctx, 24, 4 + bob, '#550000', 8, 16);
                px(ctx, 2, 6 + bob, '#770000', 4, 12);
                px(ctx, 26, 6 + bob, '#770000', 4, 12);
                // Wing ribs
                px(ctx, 1, 8 + bob, '#440000', 1, 10);
                px(ctx, 4, 6 + bob, '#440000', 1, 12);
                px(ctx, 30, 8 + bob, '#440000', 1, 10);
                px(ctx, 27, 6 + bob, '#440000', 1, 12);
                // Arms
                px(ctx, 4, 10 + bob, '#8b0000', 4, 8);
                px(ctx, 24, 10 + bob, '#8b0000', 4, 8);
                // Head
                px(ctx, 10, 2 + bob, '#8b0000', 12, 8);
                px(ctx, 12, 4 + bob, '#a00', 8, 4);
                // Horns
                px(ctx, 8, 0 + bob, '#333', 4, 4);
                px(ctx, 20, 0 + bob, '#333', 4, 4);
                px(ctx, 8, 0 + bob, '#444', 2, 2);
                px(ctx, 22, 0 + bob, '#444', 2, 2);
                // Eyes
                px(ctx, 12, 4 + bob, '#f1c40f', 3, 2);
                px(ctx, 18, 4 + bob, '#f1c40f', 3, 2);
                // Mouth
                px(ctx, 14, 8 + bob, '#000', 4, 2);
                px(ctx, 14, 8 + bob, '#f00', 2, 1);
                // Tail
                px(ctx, 14, 26, '#8b0000', 2, 4);
                px(ctx, 12, 28, '#8b0000', 2, 2);
                px(ctx, 10, 30, '#c00', 3, 2);
            });
        }

        // ---- WYRM (dragon-like) ----
        for (let dir = 0; dir < 2; dir++) {
            this.create(`mob_wyrm_${dir}`, (ctx) => {
                const bob = dir === 1 ? -1 : 0;
                px(ctx, 4, 28, 'rgba(0,0,0,0.3)', 24, 4);
                // Talons
                px(ctx, 8 + dir, 26, '#2d5a2a', 5, 6);
                px(ctx, 20 - dir, 26, '#2d5a2a', 5, 6);
                // Body - serpentine
                px(ctx, 6, 10 + bob, '#2d8a4e', 20, 18);
                px(ctx, 8, 12 + bob, '#3a9a5e', 16, 14);
                // Belly scales
                px(ctx, 10, 14 + bob, '#5aaa6e', 12, 10);
                for (let sy = 16; sy < 24; sy += 3) {
                    px(ctx, 10, sy + bob, '#4a9a5e', 12, 1);
                }
                // Wings (small)
                px(ctx, 0, 8 + bob, '#2d5a2a', 6, 10);
                px(ctx, 26, 8 + bob, '#2d5a2a', 6, 10);
                px(ctx, 2, 10 + bob, '#3a7a4e', 2, 6);
                px(ctx, 28, 10 + bob, '#3a7a4e', 2, 6);
                // Head - dragon
                px(ctx, 8, 2 + bob, '#2d8a4e', 16, 10);
                px(ctx, 10, 4 + bob, '#3a9a5e', 12, 6);
                // Snout
                px(ctx, 6, 6 + bob, '#2d8a4e', 6, 6);
                px(ctx, 6, 8 + bob, '#1e6a38', 4, 3);
                // Nostrils
                px(ctx, 7, 7 + bob, '#c0392b', 1, 1);
                px(ctx, 10, 7 + bob, '#c0392b', 1, 1);
                // Eyes
                px(ctx, 12, 4 + bob, '#f1c40f', 3, 3);
                px(ctx, 19, 4 + bob, '#f1c40f', 3, 3);
                px(ctx, 13, 5 + bob, '#000', 1, 1);
                px(ctx, 20, 5 + bob, '#000', 1, 1);
                // Horns
                px(ctx, 10, 0 + bob, '#2d5a2a', 2, 4);
                px(ctx, 20, 0 + bob, '#2d5a2a', 2, 4);
                // Spines down back
                px(ctx, 14, 0 + bob, '#1e6a38', 4, 2);
                px(ctx, 15, 10 + bob, '#1e6a38', 2, 2);
            });
        }

        // ---- FIRE ELEMENTAL ----
        for (let dir = 0; dir < 2; dir++) {
            this.create(`mob_fire_elemental_${dir}`, (ctx) => {
                const bob = dir === 1 ? -2 : 0;
                // No shadow - it IS fire
                // Base flames
                ctx.globalAlpha = 0.8;
                px(ctx, 6, 20 + bob, '#e74c3c', 20, 12);
                px(ctx, 8, 22 + bob, '#c0392b', 16, 8);
                ctx.globalAlpha = 1;
                // Core body
                px(ctx, 8, 10 + bob, '#f39c12', 16, 18);
                px(ctx, 10, 12 + bob, '#f1c40f', 12, 14);
                px(ctx, 12, 14 + bob, '#ffd700', 8, 10);
                // Arms of flame
                px(ctx, 2, 12 + bob, '#e74c3c', 6, 8);
                px(ctx, 24, 12 + bob, '#e74c3c', 6, 8);
                px(ctx, 4, 10 + bob, '#f39c12', 4, 4);
                px(ctx, 24, 10 + bob, '#f39c12', 4, 4);
                // Head
                px(ctx, 10, 4 + bob, '#f39c12', 12, 8);
                px(ctx, 12, 2 + bob, '#f1c40f', 8, 6);
                // Flame crown
                px(ctx, 10, 0 + bob, '#e74c3c', 4, 4);
                px(ctx, 18, 0 + bob, '#e74c3c', 4, 4);
                px(ctx, 14, 0 + bob, '#f39c12', 4, 2);
                // Eyes
                px(ctx, 12, 6 + bob, '#fff', 3, 2);
                px(ctx, 18, 6 + bob, '#fff', 3, 2);
                // Hot core
                px(ctx, 14, 16 + bob, '#fff', 4, 4);
                px(ctx, 15, 17 + bob, '#ffd700', 2, 2);
                // Ember particles
                ctx.globalAlpha = 0.7;
                px(ctx, 6 + dir * 4, 6 + bob, '#f1c40f', 2, 2);
                px(ctx, 22 - dir * 4, 4 + bob, '#e74c3c', 2, 2);
                ctx.globalAlpha = 1;
            });
        }

        // ---- ICE GOLEM ----
        for (let dir = 0; dir < 2; dir++) {
            this.create(`mob_ice_golem_${dir}`, (ctx) => {
                const bob = dir === 1 ? -1 : 0;
                px(ctx, 6, 28, 'rgba(0,0,0,0.3)', 20, 4);
                // Feet
                px(ctx, 8 + dir, 26, '#8ecae6', 6, 6);
                px(ctx, 18 - dir, 26, '#8ecae6', 6, 6);
                // Legs
                px(ctx, 10, 20, '#a8d8ea', 12, 8);
                // Body - crystalline
                px(ctx, 6, 6 + bob, '#b2e0f0', 20, 16);
                px(ctx, 8, 8 + bob, '#c8eeff', 16, 12);
                // Crystal facets
                px(ctx, 10, 10 + bob, '#dff4ff', 4, 6);
                px(ctx, 18, 10 + bob, '#dff4ff', 4, 6);
                px(ctx, 14, 14 + bob, '#eef8ff', 4, 4);
                // Arms
                px(ctx, 2, 8 + bob, '#a8d8ea', 4, 14);
                px(ctx, 26, 8 + bob, '#a8d8ea', 4, 14);
                px(ctx, 3, 9 + bob, '#b2e0f0', 2, 12);
                px(ctx, 27, 9 + bob, '#b2e0f0', 2, 12);
                // Icicle fists
                px(ctx, 1, 22 + bob, '#dff4ff', 5, 4);
                px(ctx, 26, 22 + bob, '#dff4ff', 5, 4);
                // Head
                px(ctx, 10, 0 + bob, '#b2e0f0', 12, 8);
                px(ctx, 12, 2 + bob, '#c8eeff', 8, 4);
                // Ice crown
                px(ctx, 10, 0 + bob, '#dff4ff', 2, 2);
                px(ctx, 14, 0 + bob, '#eef8ff', 4, 2);
                px(ctx, 20, 0 + bob, '#dff4ff', 2, 2);
                // Eyes
                px(ctx, 12, 2 + bob, '#2980b9', 3, 2);
                px(ctx, 18, 2 + bob, '#2980b9', 3, 2);
                // Frost aura
                ctx.globalAlpha = 0.3;
                px(ctx, 4, 4 + bob, '#dff4ff', 24, 22);
                ctx.globalAlpha = 1;
            });
        }

        // ---- ELITE VARIANTS (generated from base sprites with star marker) ----
        const allMonsters = ['slime','goblin','wolf','spider','orc','bandit','treant','beetle',
            'ghost','troll','golem','griffin','dark_knight','scorpion','mummy','djinn',
            'skeleton','demon','wyrm','fire_elemental','ice_golem'];

        for (const key of allMonsters) {
            this.create(`mob_${key}_elite`, (ctx) => {
                // Draw frame 0 as base
                const base = this.cache[`mob_${key}_0`];
                if (base) {
                    ctx.drawImage(base, 0, 0);
                }
                // Elite star crown
                px(ctx, 13, 0, '#f1c40f', 6, 2);
                px(ctx, 14, 0, '#ffd700', 4, 1);
                px(ctx, 15, 0, '#fff', 2, 1);
                // Side sparkles
                px(ctx, 11, 2, '#f1c40f', 2, 2);
                px(ctx, 19, 2, '#f1c40f', 2, 2);
                // Crown points
                px(ctx, 12, 0, '#e67e22', 2, 1);
                px(ctx, 18, 0, '#e67e22', 2, 1);
            });
        }

        // ---- CITY NPC SPRITES (wandering NPCs) ----
        // Guard
        this.create('city_guard', (ctx) => {
            px(ctx, 8, 28, 'rgba(0,0,0,0.3)', 16, 4);
            px(ctx, 10, 26, '#5a3d12', 4, 4);
            px(ctx, 18, 26, '#5a3d12', 4, 4);
            px(ctx, 10, 20, '#2c3e50', 12, 8);
            px(ctx, 8, 10, '#c0392b', 16, 12);
            px(ctx, 10, 12, '#e74c3c', 12, 8);
            // Armor
            px(ctx, 10, 10, '#888', 12, 2);
            px(ctx, 10, 16, '#888', 12, 2);
            // Arms
            px(ctx, 4, 12, '#c0392b', 4, 8);
            px(ctx, 24, 12, '#c0392b', 4, 8);
            // Head
            px(ctx, 10, 2, '#fdbcb4', 12, 10);
            // Helmet
            px(ctx, 8, 0, '#888', 16, 6);
            px(ctx, 10, 2, '#999', 12, 2);
            px(ctx, 14, 0, '#aaa', 4, 2);
            // Eyes
            px(ctx, 12, 6, '#333', 2, 2);
            px(ctx, 18, 6, '#333', 2, 2);
            // Spear
            px(ctx, 26, 0, '#5a2d0e', 2, 30);
            px(ctx, 25, 0, '#999', 4, 4);
            px(ctx, 26, 0, '#bbb', 2, 3);
        });

        // Merchant
        this.create('city_merchant', (ctx) => {
            px(ctx, 8, 28, 'rgba(0,0,0,0.3)', 16, 4);
            px(ctx, 10, 26, '#5a3d12', 4, 4);
            px(ctx, 18, 26, '#5a3d12', 4, 4);
            px(ctx, 10, 20, '#8B4513', 12, 8);
            px(ctx, 8, 10, '#e67e22', 16, 12);
            px(ctx, 10, 12, '#f39c12', 12, 8);
            // Apron
            px(ctx, 10, 14, '#fff', 12, 8);
            px(ctx, 12, 16, '#eee', 8, 4);
            // Arms
            px(ctx, 4, 12, '#e67e22', 4, 8);
            px(ctx, 24, 12, '#e67e22', 4, 8);
            px(ctx, 4, 20, '#fdbcb4', 4, 2);
            px(ctx, 24, 20, '#fdbcb4', 4, 2);
            // Head
            px(ctx, 10, 2, '#fdbcb4', 12, 10);
            // Hat
            px(ctx, 8, 0, '#8B4513', 16, 4);
            px(ctx, 6, 2, '#8B4513', 20, 2);
            // Eyes
            px(ctx, 12, 6, '#333', 2, 2);
            px(ctx, 18, 6, '#333', 2, 2);
            // Mustache
            px(ctx, 12, 9, '#5c3317', 8, 2);
        });

        // Priest
        this.create('city_priest', (ctx) => {
            px(ctx, 8, 28, 'rgba(0,0,0,0.3)', 16, 4);
            px(ctx, 10, 26, '#444', 4, 4);
            px(ctx, 18, 26, '#444', 4, 4);
            px(ctx, 10, 14, '#fff', 12, 14);
            px(ctx, 8, 10, '#fff', 16, 12);
            px(ctx, 10, 12, '#eee', 12, 8);
            // Cross
            px(ctx, 14, 14, '#f1c40f', 4, 8);
            px(ctx, 12, 16, '#f1c40f', 8, 4);
            // Arms
            px(ctx, 4, 12, '#fff', 4, 8);
            px(ctx, 24, 12, '#fff', 4, 8);
            // Head
            px(ctx, 10, 2, '#fdbcb4', 12, 10);
            // Bald top with ring of hair
            px(ctx, 8, 6, '#5c3317', 2, 4);
            px(ctx, 22, 6, '#5c3317', 2, 4);
            px(ctx, 10, 0, '#fdbcb4', 12, 4);
            // Eyes
            px(ctx, 12, 6, '#333', 2, 2);
            px(ctx, 18, 6, '#333', 2, 2);
            // Gentle smile
            px(ctx, 14, 10, '#d4a574', 4, 1);
        });

        // Bard
        this.create('city_bard', (ctx) => {
            px(ctx, 8, 28, 'rgba(0,0,0,0.3)', 16, 4);
            px(ctx, 10, 26, '#5a3d12', 4, 4);
            px(ctx, 18, 26, '#5a3d12', 4, 4);
            px(ctx, 10, 20, '#2c3e50', 12, 8);
            px(ctx, 8, 10, '#e74c3c', 16, 12);
            px(ctx, 10, 12, '#c0392b', 12, 8);
            // Feathered collar
            px(ctx, 8, 10, '#f1c40f', 16, 2);
            // Arms
            px(ctx, 4, 12, '#e74c3c', 4, 8);
            px(ctx, 24, 12, '#e74c3c', 4, 8);
            // Head
            px(ctx, 10, 2, '#fdbcb4', 12, 10);
            // Beret
            px(ctx, 8, 0, '#9b59b6', 16, 4);
            px(ctx, 10, 0, '#8e44ad', 12, 3);
            // Feather
            px(ctx, 22, 0, '#2ecc71', 2, 4);
            px(ctx, 23, 0, '#27ae60', 1, 2);
            // Eyes
            px(ctx, 12, 6, '#333', 2, 2);
            px(ctx, 18, 6, '#333', 2, 2);
            // Smile
            px(ctx, 14, 10, '#c0392b', 4, 1);
            // Lute
            px(ctx, 24, 14, '#d4a574', 6, 8);
            px(ctx, 26, 16, '#c69463', 3, 4);
            px(ctx, 25, 12, '#5a2d0e', 1, 4);
        });

        // Woman villager
        this.create('city_woman', (ctx) => {
            px(ctx, 8, 28, 'rgba(0,0,0,0.3)', 16, 4);
            px(ctx, 12, 26, '#5a3d12', 3, 4);
            px(ctx, 18, 26, '#5a3d12', 3, 4);
            // Dress
            px(ctx, 8, 14, '#3498db', 16, 14);
            px(ctx, 6, 20, '#3498db', 20, 8);
            px(ctx, 10, 16, '#5dade2', 12, 10);
            // Bodice
            px(ctx, 10, 10, '#2980b9', 12, 6);
            // Arms
            px(ctx, 4, 12, '#3498db', 4, 6);
            px(ctx, 24, 12, '#3498db', 4, 6);
            px(ctx, 4, 18, '#fdbcb4', 3, 2);
            px(ctx, 25, 18, '#fdbcb4', 3, 2);
            // Head
            px(ctx, 10, 2, '#fdbcb4', 12, 10);
            // Long hair
            px(ctx, 8, 0, '#d4a017', 16, 6);
            px(ctx, 8, 4, '#d4a017', 2, 8);
            px(ctx, 22, 4, '#d4a017', 2, 8);
            // Eyes
            px(ctx, 12, 6, '#2ecc71', 2, 2);
            px(ctx, 18, 6, '#2ecc71', 2, 2);
            // Lips
            px(ctx, 14, 10, '#c0392b', 4, 1);
        });

        // Old man
        this.create('city_elder', (ctx) => {
            px(ctx, 8, 28, 'rgba(0,0,0,0.3)', 16, 4);
            px(ctx, 10, 26, '#5a3d12', 4, 4);
            px(ctx, 18, 26, '#5a3d12', 4, 4);
            px(ctx, 10, 20, '#2c3e50', 12, 8);
            px(ctx, 8, 10, '#7f8c8d', 16, 12);
            px(ctx, 10, 12, '#95a5a6', 12, 8);
            // Arms
            px(ctx, 4, 12, '#7f8c8d', 4, 8);
            px(ctx, 24, 12, '#7f8c8d', 4, 8);
            // Walking stick
            px(ctx, 2, 8, '#5a2d0e', 2, 24);
            // Head
            px(ctx, 10, 2, '#fdbcb4', 12, 10);
            // Sparse grey hair
            px(ctx, 8, 0, '#bbb', 16, 4);
            px(ctx, 10, 0, '#ccc', 12, 2);
            // Eyes
            px(ctx, 12, 6, '#333', 2, 1);
            px(ctx, 18, 6, '#333', 2, 1);
            // Long beard
            px(ctx, 12, 10, '#ccc', 8, 6);
            px(ctx, 14, 14, '#ddd', 4, 4);
        });
    },

    init() {
        this.initTiles();
        this.initPlayer();
        this.initMonsters();
    }
};
