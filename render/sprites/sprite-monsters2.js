// ============================================================
// SPRITE MONSTERS Part 2 - Griffin, Dark Knight, Scorpion,
// Mummy, Djinn, Skeleton, Demon, Wyrm, Fire Elemental,
// Ice Golem, Elite variants, City NPCs
// ============================================================

Sprites.initMonsters2 = function() {
    const px = this.px;
    const S = 32;

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
};
