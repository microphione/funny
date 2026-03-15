// ============================================================
// SPRITE RENDERER - 16-bit style pixel art (improved)
// All sprites drawn at 16x16 then scaled 2x to 32x32
// ============================================================

const Sprites = {
    cache: {},
    SPRITE_SIZE: 16,

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

    draw(gameCtx, key, x, y, scale = 2) {
        const sprite = this.cache[key];
        if (!sprite) return;
        gameCtx.drawImage(sprite, x, y, this.SPRITE_SIZE * scale, this.SPRITE_SIZE * scale);
    },

    px(ctx, x, y, color, w = 1, h = 1) {
        ctx.fillStyle = color;
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
                const detail = ['#5ca050','#62a858'];
                px(ctx, 3 + v, 8, detail[v % 2], 1, 3);
                px(ctx, 10 - v, 4, detail[(v+1) % 2], 1, 2);
                px(ctx, 7 + v, 12, detail[v % 2], 1, 2);
                if (v === 0) { px(ctx, 13, 2, '#5ca050', 1, 2); }
                if (v === 2) { px(ctx, 1, 13, '#62a858', 2, 1); }
            });
        }

        // --- DARK GRASS (forest) ---
        for (let v = 0; v < 4; v++) {
            this.create(`darkgrass_${v}`, (ctx) => {
                const greens = ['#2d5a2a','#335f30','#295626','#244f22'];
                ctx.fillStyle = greens[v];
                ctx.fillRect(0, 0, S, S);
                px(ctx, 4, 6, '#1e4a1c', 1, 3);
                px(ctx, 11, 10, '#1e4a1c', 1, 2);
                px(ctx, 8, 2, '#234e20', 2, 1);
            });
        }

        // --- PATH ---
        for (let v = 0; v < 4; v++) {
            this.create(`path_${v}`, (ctx) => {
                const browns = ['#c4a663','#b89a57','#d1b36f','#bfa060'];
                ctx.fillStyle = browns[v];
                ctx.fillRect(0, 0, S, S);
                px(ctx, 5, 7, '#a08850', 2, 2);
                px(ctx, 11, 3, '#b09860', 1, 1);
                px(ctx, 2, 12, '#a89050', 3, 1);
            });
        }

        // --- WATER (animated) ---
        for (let f = 0; f < 4; f++) {
            this.create(`water_${f}`, (ctx) => {
                const blues = ['#2980b9','#2471a3','#3498db','#2573a7'];
                ctx.fillStyle = blues[f];
                ctx.fillRect(0, 0, S, S);
                ctx.fillStyle = '#5dade2';
                const off = f * 3;
                px(ctx, (off) % 16, 4, '#5dade2', 4, 1);
                px(ctx, (off + 8) % 16, 10, '#4fa3d9', 3, 1);
                px(ctx, 6, 13, '#1a6090', 2, 2);
            });
        }

        // --- TREE (improved with more detail) ---
        this.create('tree', (ctx) => {
            px(ctx, 6, 10, '#5a2d0e', 4, 6);
            px(ctx, 7, 11, '#6B3410', 2, 5);
            // Crown - layered for depth
            px(ctx, 2, 2, '#1a6b30', 12, 9);
            px(ctx, 3, 1, '#1e8449', 10, 8);
            px(ctx, 4, 0, '#27ae60', 8, 7);
            px(ctx, 5, 1, '#2ecc71', 6, 5);
            // Highlight
            px(ctx, 5, 2, '#3ddc84', 3, 2);
            // Shadow bottom
            px(ctx, 3, 9, '#155d30', 10, 2);
            // Dark spots
            px(ctx, 9, 4, '#1a6b30', 2, 2);
        });

        // --- HOUSE (improved with chimney and more detail) ---
        this.create('house', (ctx) => {
            // Wall
            ctx.fillStyle = '#d4a574';
            ctx.fillRect(0, 5, S, 11);
            // Wall detail - bricks
            px(ctx, 0, 7, '#c89a68', S, 1);
            px(ctx, 0, 11, '#c89a68', S, 1);
            px(ctx, 4, 5, '#c89a68', 1, S);
            px(ctx, 12, 5, '#c89a68', 1, S);
            // Roof
            px(ctx, 0, 0, '#b03030', 16, 6);
            px(ctx, 1, 1, '#cc4040', 14, 4);
            px(ctx, 3, 2, '#d45050', 10, 2);
            // Chimney
            px(ctx, 12, 0, '#666', 2, 3);
            px(ctx, 12, 0, '#555', 2, 1);
            // Window
            px(ctx, 6, 8, '#87ceeb', 4, 4);
            px(ctx, 6, 8, '#5a5a5a', 4, 1);
            px(ctx, 6, 8, '#5a5a5a', 1, 4);
            px(ctx, 9, 8, '#5a5a5a', 1, 4);
            px(ctx, 6, 10, '#5a5a5a', 4, 1);
            // Window glow
            px(ctx, 7, 9, '#f7dc6f', 2, 1);
        });

        // --- DOOR ---
        this.create('door', (ctx) => {
            ctx.fillStyle = '#d4a574';
            ctx.fillRect(0, 0, S, S);
            px(ctx, 4, 2, '#5a2d0e', 8, 14);
            px(ctx, 5, 3, '#6B3410', 6, 12);
            px(ctx, 6, 4, '#7B4420', 4, 10);
            px(ctx, 9, 8, '#d4a017', 2, 2); // handle
            // Arch
            px(ctx, 4, 2, '#4a2008', 1, 14);
            px(ctx, 11, 2, '#4a2008', 1, 14);
            px(ctx, 5, 2, '#4a2008', 6, 1);
        });

        // --- STONE FLOOR ---
        this.create('stone_floor', (ctx) => {
            ctx.fillStyle = '#909090';
            ctx.fillRect(0, 0, S, S);
            px(ctx, 0, 0, '#808080', S, 1);
            px(ctx, 0, 0, '#808080', 1, S);
            px(ctx, 0, 8, '#858585', S, 1);
            px(ctx, 8, 0, '#858585', 1, S);
            px(ctx, 4, 4, '#9a9a9a', 2, 2);
            px(ctx, 12, 12, '#888', 2, 2);
        });

        // --- FENCE ---
        this.create('fence', (ctx) => {
            ctx.fillStyle = '#4a8c3f';
            ctx.fillRect(0, 0, S, S);
            px(ctx, 1, 3, '#7a5a14', 2, 13);
            px(ctx, 13, 3, '#7a5a14', 2, 13);
            px(ctx, 0, 6, '#a07818', S, 2);
            px(ctx, 0, 11, '#a07818', S, 2);
            // Post tops
            px(ctx, 1, 2, '#8B6914', 2, 2);
            px(ctx, 13, 2, '#8B6914', 2, 2);
        });

        // --- SHOP WEAPON (improved - anvil sign) ---
        this.create('shop_weapon', (ctx) => {
            // Wall
            ctx.fillStyle = '#c69463';
            ctx.fillRect(0, 5, S, 11);
            px(ctx, 0, 7, '#b88855', S, 1);
            // Roof
            px(ctx, 0, 0, '#7a3a13', 16, 6);
            px(ctx, 1, 1, '#8B4513', 14, 4);
            px(ctx, 2, 2, '#9a5523', 12, 2);
            // Sword sign
            px(ctx, 7, 7, '#ccc', 2, 7);
            px(ctx, 5, 9, '#ccc', 6, 1);
            px(ctx, 6, 7, '#f1c40f', 1, 2);
            // Sign board
            px(ctx, 3, 12, '#8B4513', 10, 3);
            px(ctx, 4, 13, '#e67e22', 8, 1);
        });

        // --- SHOP ARMOR ---
        this.create('shop_armor', (ctx) => {
            ctx.fillStyle = '#c69463';
            ctx.fillRect(0, 5, S, 11);
            px(ctx, 0, 7, '#b88855', S, 1);
            px(ctx, 0, 0, '#3a5a8a', 16, 6);
            px(ctx, 1, 1, '#4a6fa5', 14, 4);
            px(ctx, 2, 2, '#5a7fb5', 12, 2);
            // Shield
            px(ctx, 5, 7, '#3498db', 6, 7);
            px(ctx, 6, 8, '#5dade2', 4, 5);
            px(ctx, 7, 9, '#f1c40f', 2, 3);
            px(ctx, 3, 12, '#3a5a8a', 10, 3);
            px(ctx, 4, 13, '#5dade2', 8, 1);
        });

        // --- SHOP POTION ---
        this.create('shop_potion', (ctx) => {
            ctx.fillStyle = '#c69463';
            ctx.fillRect(0, 5, S, 11);
            px(ctx, 0, 7, '#b88855', S, 1);
            px(ctx, 0, 0, '#1e7a40', 16, 6);
            px(ctx, 1, 1, '#27ae60', 14, 4);
            px(ctx, 2, 2, '#2ecc71', 12, 2);
            // Bottle
            px(ctx, 6, 9, '#e74c3c', 4, 5);
            px(ctx, 7, 7, '#c0392b', 2, 2);
            px(ctx, 7, 6, '#85929e', 2, 1);
            // Bubbles
            px(ctx, 7, 10, '#ff6b6b', 1, 1);
            px(ctx, 8, 12, '#ff6b6b', 1, 1);
            px(ctx, 3, 12, '#1e7a40', 10, 3);
            px(ctx, 4, 13, '#2ecc71', 8, 1);
        });

        // --- INN ---
        this.create('inn', (ctx) => {
            ctx.fillStyle = '#c69463';
            ctx.fillRect(0, 5, S, 11);
            px(ctx, 0, 7, '#b88855', S, 1);
            px(ctx, 0, 0, '#6a3490', 16, 6);
            px(ctx, 1, 1, '#8e44ad', 14, 4);
            px(ctx, 2, 2, '#a055c0', 12, 2);
            // Moon/star sign
            px(ctx, 6, 8, '#f1c40f', 4, 4);
            px(ctx, 7, 7, '#f1c40f', 2, 1);
            px(ctx, 8, 9, '#c69463', 2, 2);
            px(ctx, 3, 12, '#6a3490', 10, 3);
            px(ctx, 4, 13, '#a055c0', 8, 1);
        });

        // --- NPC_QUEST (quest giver - exclamation mark above) ---
        this.create('npc_quest', (ctx) => {
            // Stone floor background
            ctx.fillStyle = '#909090';
            ctx.fillRect(0, 0, S, S);
            // Shadow
            px(ctx, 4, 14, 'rgba(0,0,0,0.3)', 8, 2);
            // Body - green robe
            px(ctx, 5, 7, '#27ae60', 6, 6);
            px(ctx, 4, 8, '#27ae60', 2, 4);
            px(ctx, 10, 8, '#27ae60', 2, 4);
            // Head
            px(ctx, 6, 3, '#fdbcb4', 4, 4);
            // Hood
            px(ctx, 5, 2, '#1e8449', 6, 3);
            px(ctx, 5, 2, '#1e8449', 1, 4);
            px(ctx, 10, 2, '#1e8449', 1, 4);
            // Eyes
            px(ctx, 7, 4, '#333', 1, 1);
            px(ctx, 9, 4, '#333', 1, 1);
            // Exclamation mark
            px(ctx, 7, 0, '#f1c40f', 2, 1);
        });

        // --- NPC_QUEST2 (second quest giver) ---
        this.create('npc_quest2', (ctx) => {
            ctx.fillStyle = '#909090';
            ctx.fillRect(0, 0, S, S);
            px(ctx, 4, 14, 'rgba(0,0,0,0.3)', 8, 2);
            // Body - blue robe
            px(ctx, 5, 7, '#2980b9', 6, 6);
            px(ctx, 4, 8, '#2980b9', 2, 4);
            px(ctx, 10, 8, '#2980b9', 2, 4);
            // Head
            px(ctx, 6, 3, '#e8c4a0', 4, 4);
            // Hat
            px(ctx, 5, 1, '#8e44ad', 6, 3);
            px(ctx, 7, 0, '#8e44ad', 2, 2);
            // Eyes
            px(ctx, 7, 4, '#333', 1, 1);
            px(ctx, 9, 4, '#333', 1, 1);
            // Beard
            px(ctx, 7, 6, '#aaa', 2, 1);
            // Exclamation mark
            px(ctx, 7, 0, '#f1c40f', 2, 1);
        });

        // --- NPC_QUEST_DONE (quest completed indicator) ---
        this.create('npc_quest_done', (ctx) => {
            ctx.fillStyle = '#909090';
            ctx.fillRect(0, 0, S, S);
            px(ctx, 4, 14, 'rgba(0,0,0,0.3)', 8, 2);
            px(ctx, 5, 7, '#27ae60', 6, 6);
            px(ctx, 4, 8, '#27ae60', 2, 4);
            px(ctx, 10, 8, '#27ae60', 2, 4);
            px(ctx, 6, 3, '#fdbcb4', 4, 4);
            px(ctx, 5, 2, '#1e8449', 6, 3);
            px(ctx, 5, 2, '#1e8449', 1, 4);
            px(ctx, 10, 2, '#1e8449', 1, 4);
            px(ctx, 7, 4, '#333', 1, 1);
            px(ctx, 9, 4, '#333', 1, 1);
            // Question mark instead of exclamation
            px(ctx, 7, 0, '#aaa', 2, 1);
        });

        // --- SHOPKEEPER NPC ---
        this.create('npc_shopkeeper', (ctx) => {
            ctx.fillStyle = '#c69463';
            ctx.fillRect(0, 0, S, S);
            px(ctx, 4, 14, 'rgba(0,0,0,0.2)', 8, 2);
            // Body - brown apron
            px(ctx, 5, 7, '#8B4513', 6, 6);
            px(ctx, 6, 8, '#a0522d', 4, 4);
            px(ctx, 4, 8, '#8B4513', 2, 4);
            px(ctx, 10, 8, '#8B4513', 2, 4);
            // Head
            px(ctx, 6, 3, '#fdbcb4', 4, 4);
            // Headband
            px(ctx, 5, 2, '#e67e22', 6, 2);
            // Eyes
            px(ctx, 7, 4, '#333', 1, 1);
            px(ctx, 9, 4, '#333', 1, 1);
            // Smile
            px(ctx, 7, 6, '#c0392b', 2, 1);
        });

        // --- BRIDGE ---
        for (let f = 0; f < 4; f++) {
            this.create(`bridge_${f}`, (ctx) => {
                const blues = ['#2980b9','#2471a3','#3498db','#2573a7'];
                ctx.fillStyle = blues[f];
                ctx.fillRect(0, 0, S, S);
                px(ctx, 1, 0, '#a0522d', 14, S);
                px(ctx, 1, 2, '#8B4513', 14, 1);
                px(ctx, 1, 7, '#8B4513', 14, 1);
                px(ctx, 1, 12, '#8B4513', 14, 1);
                // Rails
                px(ctx, 0, 0, '#6B3410', 1, S);
                px(ctx, 15, 0, '#6B3410', 1, S);
            });
        }

        // --- CAVE FLOOR ---
        for (let v = 0; v < 3; v++) {
            this.create(`cave_floor_${v}`, (ctx) => {
                const grays = ['#4a4a5a','#3d3d4d','#454558'];
                ctx.fillStyle = grays[v];
                ctx.fillRect(0, 0, S, S);
                px(ctx, 4, 6, '#3a3a4a', 2, 2);
                px(ctx, 11, 11, '#3a3a4a', 2, 1);
            });
        }

        // --- CAVE WALL ---
        for (let v = 0; v < 3; v++) {
            this.create(`cave_wall_${v}`, (ctx) => {
                const darks = ['#2a2a3a','#303045','#252538'];
                ctx.fillStyle = darks[v];
                ctx.fillRect(0, 0, S, S);
                px(ctx, 2, 2, '#3d3d4d', 4, 3);
                px(ctx, 9, 7, '#3d3d4d', 3, 4);
                px(ctx, 6, 12, '#333345', 5, 2);
            });
        }

        // --- CAVE ENTRY ---
        this.create('cave_entry', (ctx) => {
            ctx.fillStyle = '#111118';
            ctx.fillRect(0, 0, S, S);
            px(ctx, 0, 0, '#555568', S, 2);
            px(ctx, 0, 0, '#555568', 2, S);
            px(ctx, 14, 0, '#555568', 2, S);
            px(ctx, 2, 14, '#444458', 12, 2);
            // Stalactites
            px(ctx, 5, 2, '#444458', 1, 3);
            px(ctx, 10, 2, '#444458', 1, 2);
        });

        // --- FOREST ENTRY ---
        this.create('forest_entry', (ctx) => {
            ctx.fillStyle = '#2d5a2a';
            ctx.fillRect(0, 0, S, S);
            px(ctx, 2, 0, '#666', 3, S);
            px(ctx, 11, 0, '#666', 3, S);
            px(ctx, 3, 0, '#888', 1, S);
            px(ctx, 12, 0, '#888', 1, S);
        });

        // --- FLOWER ---
        for (let v = 0; v < 4; v++) {
            this.create(`flower_${v}`, (ctx) => {
                ctx.fillStyle = '#4a8c3f';
                ctx.fillRect(0, 0, S, S);
                const colors = ['#e74c3c','#f1c40f','#9b59b6','#e67e22'];
                px(ctx, 5, 7, '#2ecc71', 1, 5);
                px(ctx, 11, 8, '#27ae60', 1, 4);
                px(ctx, 4, 5, colors[v], 3, 3);
                px(ctx, 10, 6, colors[(v+1)%4], 3, 3);
                px(ctx, 5, 6, '#fff', 1, 1);
                px(ctx, 11, 7, '#fff', 1, 1);
            });
        }

        // --- SIGN ---
        this.create('sign', (ctx) => {
            ctx.fillStyle = '#c4a663';
            ctx.fillRect(0, 0, S, S);
            px(ctx, 7, 8, '#5a2d0e', 2, 8);
            px(ctx, 3, 3, '#d4a574', 10, 6);
            px(ctx, 3, 3, '#8B4513', 10, 1);
            px(ctx, 3, 8, '#8B4513', 10, 1);
            px(ctx, 3, 3, '#8B4513', 1, 6);
            px(ctx, 12, 3, '#8B4513', 1, 6);
            px(ctx, 5, 5, '#6B3410', 6, 2);
        });

        // --- CHEST (closed) ---
        this.create('chest_closed', (ctx) => {
            px(ctx, 3, 5, '#daa520', 10, 8);
            px(ctx, 3, 5, '#b8860b', 10, 2);
            px(ctx, 4, 7, '#c8961a', 8, 5);
            px(ctx, 7, 6, '#ffd700', 2, 3);
            px(ctx, 7, 8, '#fff', 2, 1);
            px(ctx, 11, 3, '#fff', 1, 1);
            px(ctx, 12, 4, '#fff', 1, 1);
        });

        // --- CHEST (open) ---
        this.create('chest_open', (ctx) => {
            px(ctx, 3, 7, '#8B6914', 10, 7);
            px(ctx, 3, 3, '#a08020', 10, 5);
            px(ctx, 4, 4, '#8B6914', 8, 3);
        });

        // --- WELL (improved) ---
        this.create('well', (ctx) => {
            ctx.fillStyle = '#909090';
            ctx.fillRect(0, 0, S, S);
            // Stone circle
            px(ctx, 2, 4, '#777', 12, 10);
            px(ctx, 3, 5, '#666', 10, 8);
            // Water
            px(ctx, 4, 6, '#2980b9', 8, 6);
            px(ctx, 5, 7, '#3498db', 6, 4);
            // Roof supports
            px(ctx, 3, 1, '#5a2d0e', 1, 5);
            px(ctx, 12, 1, '#5a2d0e', 1, 5);
            // Roof beam
            px(ctx, 3, 1, '#6B3410', 10, 2);
            // Rope & bucket
            px(ctx, 7, 3, '#aa9060', 1, 3);
            px(ctx, 7, 5, '#888', 2, 2);
        });

        // --- STATUE ---
        this.create('statue', (ctx) => {
            ctx.fillStyle = '#909090';
            ctx.fillRect(0, 0, S, S);
            px(ctx, 4, 12, '#777', 8, 4);
            px(ctx, 6, 4, '#aaa', 4, 8);
            px(ctx, 7, 2, '#bbb', 2, 3);
            // Sword
            px(ctx, 11, 3, '#ddd', 1, 7);
            px(ctx, 10, 5, '#ddd', 3, 1);
        });

        // --- BIOME: SWAMP ---
        for (let v = 0; v < 4; v++) {
            this.create(`swamp_${v}`, (ctx) => {
                const cols = ['#3a5a3a','#4a5a40','#3a5438','#3d5a35'];
                ctx.fillStyle = cols[v];
                ctx.fillRect(0, 0, S, S);
                px(ctx, 3, 8, '#2a4a2a', 3, 2);
                px(ctx, 10, 4, '#506050', 2, 3);
                px(ctx, 6, 10, '#2980b9', 3, 2);
                // Mud
                px(ctx, 1, 14, '#4a4030', 4, 2);
            });
        }

        // --- BIOME: MOUNTAIN ---
        for (let v = 0; v < 4; v++) {
            this.create(`mountain_${v}`, (ctx) => {
                const cols = ['#808080','#888890','#787880','#858588'];
                ctx.fillStyle = cols[v];
                ctx.fillRect(0, 0, S, S);
                px(ctx, 2, 4, '#707078', 4, 3);
                px(ctx, 9, 8, '#6a6a70', 3, 4);
                px(ctx, 5, 1, '#999', 2, 3);
                px(ctx, 12, 6, '#959598', 2, 2);
            });
        }

        // --- BIOME: DESERT ---
        for (let v = 0; v < 4; v++) {
            this.create(`desert_${v}`, (ctx) => {
                const cols = ['#d4b86a','#ccb060','#dcc070','#c8a858'];
                ctx.fillStyle = cols[v];
                ctx.fillRect(0, 0, S, S);
                px(ctx, 4, 6, '#bfa050', 2, 1);
                px(ctx, 10, 11, '#c4a858', 3, 1);
                // Sand ripples
                px(ctx, 1, 3, '#c8a858', 5, 1);
                px(ctx, 8, 14, '#bfa050', 4, 1);
            });
        }

        // --- MOUNTAIN ROCK ---
        this.create('rock', (ctx) => {
            ctx.fillStyle = '#707078';
            ctx.fillRect(0, 0, S, S);
            px(ctx, 1, 2, '#606068', 6, 5);
            px(ctx, 8, 6, '#5a5a62', 5, 4);
            px(ctx, 3, 9, '#656570', 8, 5);
            px(ctx, 4, 3, '#888', 3, 2);
            px(ctx, 10, 7, '#888', 2, 1);
        });

        // --- SWAMP TREE ---
        this.create('swamp_tree', (ctx) => {
            ctx.fillStyle = '#3a5a3a';
            ctx.fillRect(0, 0, S, S);
            px(ctx, 6, 8, '#3a2a18', 4, 8);
            px(ctx, 7, 9, '#4a3a20', 2, 7);
            px(ctx, 2, 2, '#2a5a28', 12, 8);
            px(ctx, 3, 3, '#3a6a38', 10, 6);
            px(ctx, 5, 0, '#2a5a28', 3, 4);
            px(ctx, 9, 1, '#2a5a28', 3, 3);
            // Hanging moss
            px(ctx, 2, 9, '#1a4a1c', 1, 3);
            px(ctx, 13, 8, '#1a4a1c', 1, 3);
        });

        // --- CACTUS ---
        this.create('cactus', (ctx) => {
            ctx.fillStyle = '#d4b86a';
            ctx.fillRect(0, 0, S, S);
            px(ctx, 7, 3, '#2d8a4e', 3, 13);
            px(ctx, 8, 4, '#3a9a5e', 1, 11);
            px(ctx, 4, 6, '#2d8a4e', 3, 1);
            px(ctx, 4, 4, '#2d8a4e', 1, 3);
            px(ctx, 11, 8, '#2d8a4e', 2, 1);
            px(ctx, 12, 6, '#2d8a4e', 1, 3);
        });

        // --- VILLAGE HUT ---
        this.create('village_hut', (ctx) => {
            ctx.fillStyle = '#c69463';
            ctx.fillRect(0, 5, S, 11);
            px(ctx, 0, 7, '#b88855', S, 1);
            // Thatched roof
            px(ctx, 0, 0, '#7a6030', 16, 6);
            px(ctx, 1, 1, '#8a7040', 14, 4);
            px(ctx, 3, 0, '#9a8050', 10, 3);
            // Window
            px(ctx, 10, 8, '#87ceeb', 3, 3);
            px(ctx, 11, 9, '#f7dc6f', 1, 1);
        });

        // --- SHOP INTERIOR (floor tile for inside shops) ---
        this.create('shop_floor', (ctx) => {
            ctx.fillStyle = '#c69463';
            ctx.fillRect(0, 0, S, S);
            px(ctx, 0, 0, '#b88855', S, 1);
            px(ctx, 0, 0, '#b88855', 1, S);
            px(ctx, 8, 0, '#b88855', 1, S);
            px(ctx, 0, 8, '#b88855', S, 1);
        });

        // --- SHOP COUNTER ---
        this.create('shop_counter', (ctx) => {
            ctx.fillStyle = '#c69463';
            ctx.fillRect(0, 0, S, S);
            px(ctx, 0, 4, '#5a2d0e', S, 8);
            px(ctx, 0, 4, '#6B3410', S, 2);
            px(ctx, 0, 10, '#6B3410', S, 2);
            px(ctx, 1, 5, '#7B4420', 14, 5);
        });
    },

    // ========== PLAYER SPRITES (improved with better directional detail) ==========
    initPlayer() {
        const dirs = ['down','up','left','right'];
        const px = this.px;

        dirs.forEach(dir => {
            for (let frame = 0; frame < 4; frame++) {
                this.create(`player_${dir}_${frame}`, (ctx) => {
                    const S = 16;
                    const walk = (frame === 1) ? -1 : (frame === 3) ? 1 : 0;
                    const bob = (frame === 1 || frame === 3) ? -1 : 0;

                    // Shadow
                    px(ctx, 4, 14, 'rgba(0,0,0,0.3)', 8, 2);

                    if (dir === 'up') {
                        // === BACK VIEW ===
                        // Boots
                        px(ctx, 5 + walk, 13, '#5a3d12', 3, 3);
                        px(ctx, 9 - walk, 13, '#5a3d12', 3, 3);
                        // Pants
                        px(ctx, 5, 10, '#2c3e50', 6, 4);
                        // Belt
                        px(ctx, 5, 10, '#5a3d12', 6, 1);
                        // Shirt (back)
                        px(ctx, 4, 5 + bob, '#2573a7', 8, 6);
                        px(ctx, 5, 6 + bob, '#2980b9', 6, 4);
                        // Cape/pack
                        px(ctx, 5, 6 + bob, '#8B4513', 6, 3);
                        px(ctx, 6, 7 + bob, '#7B4420', 4, 1);
                        // Arms
                        px(ctx, 2, 6 + bob, '#2573a7', 2, 4);
                        px(ctx, 12, 6 + bob, '#2573a7', 2, 4);
                        // Head (back of hair)
                        px(ctx, 5, 1 + bob, '#5c3317', 6, 5);
                        px(ctx, 4, 0 + bob, '#5c3317', 8, 4);
                        px(ctx, 4, 0 + bob, '#4a2510', 8, 2);
                    } else if (dir === 'down') {
                        // === FRONT VIEW ===
                        // Boots
                        px(ctx, 4 + walk, 13, '#5a3d12', 3, 3);
                        px(ctx, 9 - walk, 13, '#5a3d12', 3, 3);
                        // Boot detail
                        px(ctx, 5 + walk, 14, '#6d4c1d', 1, 1);
                        px(ctx, 10 - walk, 14, '#6d4c1d', 1, 1);
                        // Pants
                        px(ctx, 5, 10, '#2c3e50', 6, 4);
                        px(ctx, 7, 11, '#34495e', 2, 2);
                        // Belt
                        px(ctx, 5, 10, '#5a3d12', 6, 1);
                        px(ctx, 7, 10, '#d4a017', 2, 1);
                        // Shirt
                        px(ctx, 4, 5 + bob, '#2980b9', 8, 6);
                        px(ctx, 5, 6 + bob, '#3498db', 6, 4);
                        // Collar
                        px(ctx, 6, 5 + bob, '#34495e', 4, 1);
                        // Arms
                        px(ctx, 2, 6 + bob, '#2980b9', 2, 4);
                        px(ctx, 12, 6 + bob, '#2980b9', 2, 4);
                        px(ctx, 2, 10 + bob, '#fdbcb4', 2, 1);
                        px(ctx, 12, 10 + bob, '#fdbcb4', 2, 1);
                        // Head
                        px(ctx, 5, 1 + bob, '#fdbcb4', 6, 5);
                        // Hair
                        px(ctx, 4, 0 + bob, '#5c3317', 8, 3);
                        px(ctx, 4, 0 + bob, '#4a2510', 8, 1);
                        // Eyes
                        px(ctx, 6, 3 + bob, '#fff', 2, 1);
                        px(ctx, 9, 3 + bob, '#fff', 2, 1);
                        px(ctx, 6, 3 + bob, '#2c3e50', 1, 1);
                        px(ctx, 10, 3 + bob, '#2c3e50', 1, 1);
                        // Mouth
                        px(ctx, 7, 5 + bob, '#d4a574', 2, 1);
                    } else if (dir === 'left') {
                        // === LEFT VIEW ===
                        // Boots
                        px(ctx, 4 + walk, 13, '#5a3d12', 3, 3);
                        px(ctx, 8 - walk, 13, '#5a3d12', 3, 3);
                        // Pants
                        px(ctx, 5, 10, '#2c3e50', 5, 4);
                        // Belt
                        px(ctx, 5, 10, '#5a3d12', 5, 1);
                        // Shirt
                        px(ctx, 4, 5 + bob, '#2980b9', 7, 6);
                        px(ctx, 5, 6 + bob, '#3498db', 5, 4);
                        // Front arm (with weapon)
                        px(ctx, 2, 6 + bob, '#2980b9', 3, 4);
                        px(ctx, 2, 10 + bob, '#fdbcb4', 2, 1);
                        // Weapon - sword pointing left
                        px(ctx, 1, 8 + bob, '#bbb', 1, 5);
                        px(ctx, 0, 7 + bob, '#8B4513', 2, 2);
                        px(ctx, 0, 7 + bob, '#d4a017', 2, 1);
                        // Head
                        px(ctx, 5, 1 + bob, '#fdbcb4', 5, 5);
                        // Hair
                        px(ctx, 5, 0 + bob, '#5c3317', 6, 3);
                        px(ctx, 4, 0 + bob, '#4a2510', 2, 1);
                        px(ctx, 9, 0 + bob, '#5c3317', 2, 5);
                        // Eye
                        px(ctx, 6, 3 + bob, '#fff', 2, 1);
                        px(ctx, 6, 3 + bob, '#2c3e50', 1, 1);
                        // Nose
                        px(ctx, 5, 4 + bob, '#e8a890', 1, 1);
                    } else {
                        // === RIGHT VIEW ===
                        // Boots
                        px(ctx, 5 + walk, 13, '#5a3d12', 3, 3);
                        px(ctx, 9 - walk, 13, '#5a3d12', 3, 3);
                        // Pants
                        px(ctx, 6, 10, '#2c3e50', 5, 4);
                        // Belt
                        px(ctx, 6, 10, '#5a3d12', 5, 1);
                        // Shirt
                        px(ctx, 5, 5 + bob, '#2980b9', 7, 6);
                        px(ctx, 6, 6 + bob, '#3498db', 5, 4);
                        // Front arm (with weapon)
                        px(ctx, 11, 6 + bob, '#2980b9', 3, 4);
                        px(ctx, 12, 10 + bob, '#fdbcb4', 2, 1);
                        // Weapon - sword pointing right
                        px(ctx, 14, 8 + bob, '#bbb', 1, 5);
                        px(ctx, 14, 7 + bob, '#8B4513', 2, 2);
                        px(ctx, 14, 7 + bob, '#d4a017', 2, 1);
                        // Head
                        px(ctx, 6, 1 + bob, '#fdbcb4', 5, 5);
                        // Hair
                        px(ctx, 5, 0 + bob, '#5c3317', 6, 3);
                        px(ctx, 10, 0 + bob, '#4a2510', 2, 1);
                        px(ctx, 5, 0 + bob, '#5c3317', 2, 5);
                        // Eye
                        px(ctx, 9, 3 + bob, '#fff', 2, 1);
                        px(ctx, 10, 3 + bob, '#2c3e50', 1, 1);
                        // Nose
                        px(ctx, 10, 4 + bob, '#e8a890', 1, 1);
                    }
                });
            }
        });
    },

    // ========== MONSTER SPRITES (for overworld) ==========
    initMonsters() {
        const px = this.px;

        // Generic monster sprite generator
        const monsterDefs = {
            slime:       { body: '#2ecc71', eye: '#fff', h: 8 },
            goblin:      { body: '#9b59b6', eye: '#ff0', h: 12 },
            wolf:        { body: '#888', eye: '#f00', h: 10 },
            spider:      { body: '#333', eye: '#f00', h: 8 },
            orc:         { body: '#2c8c3c', eye: '#ff0', h: 12 },
            bandit:      { body: '#8B4513', eye: '#fff', h: 12 },
            treant:      { body: '#2d8a4e', eye: '#ff0', h: 14 },
            beetle:      { body: '#4a0', eye: '#f00', h: 6 },
            ghost:       { body: '#aaccff', eye: '#00f', h: 12 },
            troll:       { body: '#556b2f', eye: '#f00', h: 14 },
            golem:       { body: '#808080', eye: '#ff0', h: 14 },
            griffin:     { body: '#daa520', eye: '#f00', h: 12 },
            dark_knight: { body: '#2c2c2c', eye: '#f00', h: 14 },
            scorpion:    { body: '#c4a858', eye: '#f00', h: 6 },
            mummy:       { body: '#d4c090', eye: '#0f0', h: 12 },
            djinn:       { body: '#5dade2', eye: '#fff', h: 12 },
        };

        for (const [key, def] of Object.entries(monsterDefs)) {
            for (let dir = 0; dir < 2; dir++) { // 0=frame1, 1=frame2
                this.create(`mob_${key}_${dir}`, (ctx) => {
                    const S = 16;
                    const y0 = S - def.h - 2;
                    const bob = dir === 1 ? -1 : 0;

                    // Shadow
                    px(ctx, 4, 14, 'rgba(0,0,0,0.3)', 8, 2);

                    if (def.h <= 8) {
                        // Small creature (slime, beetle, scorpion)
                        px(ctx, 4, y0 + 2 + bob, def.body, 8, def.h);
                        px(ctx, 5, y0 + 3 + bob, def.eye, 2, 2);
                        px(ctx, 9, y0 + 3 + bob, def.eye, 2, 2);
                        // Pupil
                        px(ctx, 5, y0 + 3 + bob, '#000', 1, 1);
                        px(ctx, 9, y0 + 3 + bob, '#000', 1, 1);
                    } else {
                        // Humanoid/large creature
                        // Body
                        px(ctx, 5, y0 + 4 + bob, def.body, 6, def.h - 4);
                        // Head
                        px(ctx, 6, y0 + bob, def.body, 4, 5);
                        // Eyes
                        px(ctx, 7, y0 + 2 + bob, def.eye, 1, 1);
                        px(ctx, 9, y0 + 2 + bob, def.eye, 1, 1);
                        // Legs
                        px(ctx, 5 + dir, 13, def.body, 2, 3);
                        px(ctx, 9 - dir, 13, def.body, 2, 3);
                    }
                });
            }
            // Elite version (with star)
            this.create(`mob_${key}_elite`, (ctx) => {
                const S = 16;
                const y0 = S - def.h - 2;
                px(ctx, 4, 14, 'rgba(0,0,0,0.3)', 8, 2);
                if (def.h <= 8) {
                    px(ctx, 4, y0 + 2, def.body, 8, def.h);
                    px(ctx, 5, y0 + 3, def.eye, 2, 2);
                    px(ctx, 9, y0 + 3, def.eye, 2, 2);
                } else {
                    px(ctx, 5, y0 + 4, def.body, 6, def.h - 4);
                    px(ctx, 6, y0, def.body, 4, 5);
                    px(ctx, 7, y0 + 2, def.eye, 1, 1);
                    px(ctx, 9, y0 + 2, def.eye, 1, 1);
                    px(ctx, 5, 13, def.body, 2, 3);
                    px(ctx, 9, 13, def.body, 2, 3);
                }
                // Star
                px(ctx, 7, 0, '#f1c40f', 2, 1);
                px(ctx, 6, 1, '#f1c40f', 4, 1);
                px(ctx, 7, 2, '#f1c40f', 2, 1);
            });
        }
    },

    init() {
        this.initTiles();
        this.initPlayer();
        this.initMonsters();
    }
};
