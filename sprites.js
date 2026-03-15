// ============================================================
// SPRITE RENDERER - 16-bit style pixel art
// All sprites drawn at 16x16 then scaled 2x to 32x32
// ============================================================

const Sprites = {
    cache: {},
    SPRITE_SIZE: 16,

    // Create offscreen canvas for a sprite
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

    // Draw cached sprite to game canvas at 2x scale
    draw(gameCtx, key, x, y, scale = 2) {
        const sprite = this.cache[key];
        if (!sprite) return;
        gameCtx.drawImage(sprite, x, y, this.SPRITE_SIZE * scale, this.SPRITE_SIZE * scale);
    },

    // Pixel helper - draw a pixel at 16x16 resolution
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
                // Grass blades
                const detail = ['#5ca050','#62a858'];
                px(ctx, 3 + v, 8, detail[v % 2], 1, 3);
                px(ctx, 10 - v, 4, detail[(v+1) % 2], 1, 2);
                px(ctx, 7 + v, 12, detail[v % 2], 1, 2);
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
            });
        }

        // --- WATER (animated) ---
        for (let f = 0; f < 4; f++) {
            this.create(`water_${f}`, (ctx) => {
                const blues = ['#2980b9','#2471a3','#3498db','#2573a7'];
                ctx.fillStyle = blues[f];
                ctx.fillRect(0, 0, S, S);
                // Waves
                ctx.fillStyle = '#5dade2';
                const off = f * 3;
                px(ctx, (off) % 16, 4, '#5dade2', 4, 1);
                px(ctx, (off + 8) % 16, 10, '#4fa3d9', 3, 1);
                // Deep spots
                px(ctx, 6, 13, '#1a6090', 2, 2);
            });
        }

        // --- TREE ---
        this.create('tree', (ctx) => {
            // Trunk
            px(ctx, 6, 10, '#6B3410', 4, 6);
            px(ctx, 7, 11, '#7B4420', 2, 5);
            // Leaves layers
            px(ctx, 2, 1, '#1e8449', 12, 10);
            px(ctx, 3, 0, '#27ae60', 10, 9);
            px(ctx, 4, 1, '#2ecc71', 8, 7);
            // Highlight
            px(ctx, 5, 2, '#3ddc84', 3, 3);
            // Shadow
            px(ctx, 3, 8, '#1a6b30', 10, 2);
        });

        // --- HOUSE ---
        this.create('house', (ctx) => {
            // Wall
            ctx.fillStyle = '#d4a574';
            ctx.fillRect(0, 5, S, 11);
            // Roof
            px(ctx, 0, 0, '#b03030', 16, 6);
            px(ctx, 1, 1, '#cc4040', 14, 4);
            px(ctx, 3, 2, '#d45050', 10, 2);
            // Window
            px(ctx, 6, 8, '#f7dc6f', 4, 4);
            px(ctx, 7, 8, '#85929e', 1, 4);
            px(ctx, 6, 9, '#85929e', 4, 1);
        });

        // --- DOOR ---
        this.create('door', (ctx) => {
            ctx.fillStyle = '#d4a574';
            ctx.fillRect(0, 0, S, S);
            px(ctx, 4, 2, '#6B3410', 8, 14);
            px(ctx, 5, 3, '#7B4420', 6, 12);
            px(ctx, 9, 8, '#d4a017', 2, 2); // handle
        });

        // --- STONE FLOOR ---
        this.create('stone_floor', (ctx) => {
            ctx.fillStyle = '#909090';
            ctx.fillRect(0, 0, S, S);
            px(ctx, 0, 0, '#808080', S, 1);
            px(ctx, 0, 0, '#808080', 1, S);
            px(ctx, 0, 8, '#858585', S, 1);
            px(ctx, 8, 0, '#858585', 1, S);
        });

        // --- FENCE ---
        this.create('fence', (ctx) => {
            ctx.fillStyle = '#4a8c3f';
            ctx.fillRect(0, 0, S, S);
            px(ctx, 1, 3, '#8B6914', 2, 13);
            px(ctx, 13, 3, '#8B6914', 2, 13);
            px(ctx, 0, 6, '#a07818', S, 2);
            px(ctx, 0, 11, '#a07818', S, 2);
        });

        // --- SHOP WEAPON ---
        this.create('shop_weapon', (ctx) => {
            ctx.fillStyle = '#c69463';
            ctx.fillRect(0, 5, S, 11);
            px(ctx, 0, 0, '#8B4513', 16, 6);
            px(ctx, 1, 1, '#a05a23', 14, 4);
            // Sword sign
            px(ctx, 7, 7, '#ddd', 2, 7);
            px(ctx, 5, 8, '#ddd', 6, 1);
            px(ctx, 6, 7, '#f1c40f', 1, 1);
            // Sign
            px(ctx, 3, 12, '#e67e22', 10, 3);
            px(ctx, 4, 13, '#fff', 1, 1);
            px(ctx, 6, 13, '#fff', 1, 1);
        });

        // --- SHOP ARMOR ---
        this.create('shop_armor', (ctx) => {
            ctx.fillStyle = '#c69463';
            ctx.fillRect(0, 5, S, 11);
            px(ctx, 0, 0, '#4a6fa5', 16, 6);
            px(ctx, 1, 1, '#5a7fb5', 14, 4);
            // Shield
            px(ctx, 5, 7, '#3498db', 6, 7);
            px(ctx, 6, 8, '#5dade2', 4, 5);
            px(ctx, 7, 9, '#f1c40f', 2, 3);
            px(ctx, 3, 12, '#e67e22', 10, 3);
        });

        // --- SHOP POTION ---
        this.create('shop_potion', (ctx) => {
            ctx.fillStyle = '#c69463';
            ctx.fillRect(0, 5, S, 11);
            px(ctx, 0, 0, '#27ae60', 16, 6);
            px(ctx, 1, 1, '#2ecc71', 14, 4);
            // Bottle
            px(ctx, 6, 9, '#2ecc71', 4, 5);
            px(ctx, 7, 7, '#27ae60', 2, 2);
            px(ctx, 7, 6, '#85929e', 2, 1);
            px(ctx, 3, 12, '#e67e22', 10, 3);
        });

        // --- INN ---
        this.create('inn', (ctx) => {
            ctx.fillStyle = '#c69463';
            ctx.fillRect(0, 5, S, 11);
            px(ctx, 0, 0, '#8e44ad', 16, 6);
            px(ctx, 1, 1, '#a055c0', 14, 4);
            // Bed
            px(ctx, 4, 9, '#f0e68c', 8, 4);
            px(ctx, 4, 8, '#daa520', 2, 5);
            px(ctx, 3, 12, '#e67e22', 10, 3);
        });

        // --- BRIDGE ---
        for (let f = 0; f < 4; f++) {
            this.create(`bridge_${f}`, (ctx) => {
                // Water underneath
                const blues = ['#2980b9','#2471a3','#3498db','#2573a7'];
                ctx.fillStyle = blues[f];
                ctx.fillRect(0, 0, S, S);
                // Planks
                px(ctx, 1, 0, '#a0522d', 14, S);
                px(ctx, 1, 2, '#8B4513', 14, 1);
                px(ctx, 1, 7, '#8B4513', 14, 1);
                px(ctx, 1, 12, '#8B4513', 14, 1);
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
            px(ctx, 0, 0, '#444458', S, 2);
            px(ctx, 0, 0, '#444458', 2, S);
            px(ctx, 14, 0, '#444458', 2, S);
            px(ctx, 2, 14, '#333345', 12, 2);
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
                // Stems
                px(ctx, 5, 7, '#2ecc71', 1, 5);
                px(ctx, 11, 8, '#27ae60', 1, 4);
                // Flowers
                px(ctx, 4, 5, colors[v], 3, 3);
                px(ctx, 10, 6, colors[(v+1)%4], 3, 3);
                // Centers
                px(ctx, 5, 6, '#fff', 1, 1);
                px(ctx, 11, 7, '#fff', 1, 1);
            });
        }

        // --- SIGN ---
        this.create('sign', (ctx) => {
            ctx.fillStyle = '#c4a663';
            ctx.fillRect(0, 0, S, S);
            px(ctx, 7, 8, '#6B3410', 2, 8);
            px(ctx, 3, 3, '#d4a574', 10, 6);
            px(ctx, 3, 3, '#8B4513', 10, 1);
            px(ctx, 7, 5, '#333', 2, 2);
        });

        // --- CHEST (closed) ---
        this.create('chest_closed', (ctx) => {
            px(ctx, 3, 5, '#daa520', 10, 8);
            px(ctx, 3, 5, '#b8860b', 10, 2);
            px(ctx, 7, 6, '#ffd700', 2, 3);
            // Sparkle
            px(ctx, 11, 3, '#fff', 1, 1);
            px(ctx, 12, 4, '#fff', 1, 1);
        });

        // --- CHEST (open) ---
        this.create('chest_open', (ctx) => {
            px(ctx, 3, 7, '#8B6914', 10, 7);
            px(ctx, 3, 3, '#a08020', 10, 5);
            px(ctx, 4, 4, '#8B6914', 8, 3);
        });

        // --- WELL ---
        this.create('well', (ctx) => {
            ctx.fillStyle = '#909090';
            ctx.fillRect(0, 0, S, S);
            px(ctx, 2, 4, '#666', 12, 10);
            px(ctx, 4, 6, '#2980b9', 8, 6);
            px(ctx, 3, 2, '#6B3410', 1, 4);
            px(ctx, 12, 2, '#6B3410', 1, 4);
            px(ctx, 3, 2, '#8B4513', 10, 1);
            px(ctx, 7, 3, '#888', 2, 3);
        });

        // --- STATUE ---
        this.create('statue', (ctx) => {
            ctx.fillStyle = '#909090';
            ctx.fillRect(0, 0, S, S);
            px(ctx, 3, 11, '#666', 10, 5);
            px(ctx, 6, 2, '#aaa', 4, 9);
            px(ctx, 7, 1, '#bbb', 2, 2);
            px(ctx, 11, 3, '#ccc', 1, 7);
            px(ctx, 10, 5, '#ccc', 3, 1);
        });

        // --- BIOME: SWAMP ---
        for (let v = 0; v < 4; v++) {
            this.create(`swamp_${v}`, (ctx) => {
                const cols = ['#3a5a3a','#4a5a40','#3a5438','#3d5a35'];
                ctx.fillStyle = cols[v];
                ctx.fillRect(0, 0, S, S);
                px(ctx, 3, 8, '#2a4a2a', 3, 2);
                px(ctx, 10, 4, '#506050', 2, 3);
                // Water puddles
                px(ctx, 6, 10, '#2980b9', 3, 2);
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
            });
        }

        // --- MOUNTAIN ROCK (unwalkable) ---
        this.create('rock', (ctx) => {
            ctx.fillStyle = '#707078';
            ctx.fillRect(0, 0, S, S);
            px(ctx, 1, 2, '#606068', 6, 5);
            px(ctx, 8, 6, '#5a5a62', 5, 4);
            px(ctx, 3, 9, '#656570', 8, 5);
            px(ctx, 4, 3, '#888', 3, 2);
        });

        // --- SWAMP TREE ---
        this.create('swamp_tree', (ctx) => {
            ctx.fillStyle = '#3a5a3a';
            ctx.fillRect(0, 0, S, S);
            px(ctx, 6, 8, '#4a3a20', 4, 8);
            px(ctx, 2, 2, '#2a5a28', 12, 8);
            px(ctx, 3, 3, '#3a6a38', 10, 6);
            px(ctx, 5, 0, '#2a5a28', 3, 4);
            px(ctx, 9, 1, '#2a5a28', 3, 3);
        });

        // --- CACTUS ---
        this.create('cactus', (ctx) => {
            ctx.fillStyle = '#d4b86a';
            ctx.fillRect(0, 0, S, S);
            px(ctx, 7, 3, '#2d8a4e', 3, 13);
            px(ctx, 4, 6, '#2d8a4e', 3, 1);
            px(ctx, 4, 4, '#2d8a4e', 1, 3);
            px(ctx, 11, 8, '#2d8a4e', 2, 1);
            px(ctx, 12, 6, '#2d8a4e', 1, 3);
        });

        // --- VILLAGE HUT ---
        this.create('village_hut', (ctx) => {
            ctx.fillStyle = '#c69463';
            ctx.fillRect(0, 5, S, 11);
            // Thatched roof
            px(ctx, 0, 0, '#8a7040', 16, 6);
            px(ctx, 1, 1, '#9a8050', 14, 4);
            px(ctx, 3, 0, '#aa9060', 10, 3);
            // Window
            px(ctx, 10, 8, '#f7dc6f', 3, 3);
        });
    },

    // ========== PLAYER SPRITES ==========
    initPlayer() {
        const dirs = ['down','up','left','right'];
        const px = this.px;

        dirs.forEach(dir => {
            for (let frame = 0; frame < 4; frame++) {
                this.create(`player_${dir}_${frame}`, (ctx) => {
                    const S = 16;
                    const walk = (frame === 1) ? -1 : (frame === 3) ? 1 : 0;

                    // Shadow
                    px(ctx, 4, 14, 'rgba(0,0,0,0.3)', 8, 2);

                    // Boots
                    px(ctx, 4 + walk, 13, '#6d4c1d', 3, 3);
                    px(ctx, 9 - walk, 13, '#6d4c1d', 3, 3);

                    // Pants
                    px(ctx, 5, 10, '#2c3e50', 6, 4);

                    // Shirt
                    px(ctx, 4, 5, '#2980b9', 8, 6);

                    // Arms
                    if (dir === 'left') {
                        px(ctx, 2, 6, '#2980b9', 2, 4);
                        px(ctx, 2, 10, '#fdbcb4', 2, 1);
                        px(ctx, 12, 6, '#2573a7', 2, 4);
                    } else if (dir === 'right') {
                        px(ctx, 12, 6, '#2980b9', 2, 4);
                        px(ctx, 12, 10, '#fdbcb4', 2, 1);
                        px(ctx, 2, 6, '#2573a7', 2, 4);
                    } else {
                        px(ctx, 2, 6, '#2980b9', 2, 4);
                        px(ctx, 12, 6, '#2980b9', 2, 4);
                        px(ctx, 2, 10, '#fdbcb4', 2, 1);
                        px(ctx, 12, 10, '#fdbcb4', 2, 1);
                    }

                    // Head
                    px(ctx, 5, 1, '#fdbcb4', 6, 5);

                    // Hair
                    px(ctx, 4, 0, '#5c3317', 8, 3);
                    if (dir === 'left' || dir === 'up') {
                        px(ctx, 4, 0, '#5c3317', 2, 4);
                    }
                    if (dir === 'right' || dir === 'up') {
                        px(ctx, 10, 0, '#5c3317', 2, 4);
                    }

                    // Eyes
                    if (dir !== 'up') {
                        if (dir === 'left') {
                            px(ctx, 5, 3, '#fff', 2, 2);
                            px(ctx, 5, 3, '#333', 1, 2);
                        } else if (dir === 'right') {
                            px(ctx, 9, 3, '#fff', 2, 2);
                            px(ctx, 10, 3, '#333', 1, 2);
                        } else {
                            px(ctx, 6, 3, '#fff', 2, 1);
                            px(ctx, 9, 3, '#fff', 2, 1);
                            px(ctx, 6, 3, '#333', 1, 1);
                            px(ctx, 10, 3, '#333', 1, 1);
                        }
                    }

                    // Weapon
                    if (dir === 'right' || dir === 'down') {
                        px(ctx, 13, 7, '#bbb', 1, 5);
                        px(ctx, 12, 6, '#8B4513', 2, 2);
                    } else if (dir === 'left') {
                        px(ctx, 2, 7, '#bbb', 1, 5);
                        px(ctx, 2, 6, '#8B4513', 2, 2);
                    }
                });
            }
        });
    },

    init() {
        this.initTiles();
        this.initPlayer();
    }
};
