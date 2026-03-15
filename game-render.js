// ============================================================
// GAME RENDER - Camera, tiles, monsters, HP bars, minimap
// ============================================================

const GameRender = {
    minimapCanvas: null,
    minimapCtx: null,

    init() {
        this.minimapCanvas = document.getElementById('minimap');
        this.minimapCtx = this.minimapCanvas.getContext('2d');
    },

    getTileSprite(tile, wx, wy, animFrame) {
        const T = World.T;
        const v = ((wx * 7 + wy * 13) & 0x7fffffff) % 4;
        switch (tile) {
            case T.GRASS: return `grass_${v}`;
            case T.DARK_GRASS: return `darkgrass_${v}`;
            case T.PATH: return `path_${v}`;
            case T.WATER: return `water_${animFrame % 4}`;
            case T.WALL: return `cave_wall_${v % 3}`;
            case T.CAVE_WALL: return `cave_wall_${v % 3}`;
            case T.TREE: return 'tree';
            case T.HOUSE: case T.VILLAGE_HUT: return 'house';
            case T.DOOR: return 'door';
            case T.SHOP_WEAPON: return 'shop_weapon';
            case T.SHOP_ARMOR: return 'shop_armor';
            case T.SHOP_POTION: return 'shop_potion';
            case T.SHOP_FLOOR: return `path_${v}`;
            case T.SHOP_WEAPON_NPC: return 'npc_shopkeeper';
            case T.SHOP_ARMOR_NPC: return 'npc_shopkeeper';
            case T.SHOP_POTION_NPC: return 'npc_shopkeeper';
            case T.INN: return 'inn';
            case T.BRIDGE: return `bridge_${animFrame % 4}`;
            case T.CAVE_FLOOR: return `cave_floor_${v % 3}`;
            case T.CAVE_ENTRY: return 'cave_entry';
            case T.FOREST_ENTRY: return 'forest_entry';
            case T.FLOWER: return `flower_${v}`;
            case T.SIGN: return 'sign';
            case T.CHEST: return 'chest_closed';
            case T.STONE_FLOOR: return 'stone_floor';
            case T.FENCE: return 'fence';
            case T.WELL: return 'well';
            case T.STATUE: return 'statue';
            case T.SWAMP: return `swamp_${v}`;
            case T.MOUNTAIN: return `mountain_${v}`;
            case T.DESERT: return `desert_${v}`;
            case T.ROCK: return 'rock';
            case T.SWAMP_TREE: return 'swamp_tree';
            case T.CACTUS: return 'cactus';
            case T.NPC_QUEST: return 'npc_quest';
            case T.NPC_QUEST2: return 'npc_quest2';
            case T.NPC_SHOPKEEPER: return 'npc_shopkeeper';
            default: return `grass_0`;
        }
    },

    render(dt) {
        const G = Game;
        const p = G.player;
        if (!p || !G.ctx) return;

        const TILE = G.TILE;
        const ctx = G.ctx;
        const W = G.canvas.width;
        const H = G.canvas.height;

        // Smooth movement interpolation
        if (G.animating) {
            G.animProgress += dt * G.animSpeed;
            if (G.animProgress >= 1) {
                G.animProgress = 1;
                G.animating = false;
                p.visualX = G.animToX;
                p.visualY = G.animToY;
            } else {
                p.visualX = G.animFromX + (G.animToX - G.animFromX) * G.animProgress;
                p.visualY = G.animFromY + (G.animToY - G.animFromY) * G.animProgress;
            }
        }

        // Camera centered on player
        const camX = p.visualX - G.VIEW_W / 2 + 0.5;
        const camY = p.visualY - G.VIEW_H / 2 + 0.5;
        G.cameraX = camX;
        G.cameraY = camY;

        // Update animation timer
        G.monsterAnimTimer += dt;
        if (G.monsterAnimTimer > 0.5) {
            G.monsterAnimTimer = 0;
            G.monsterAnimFrame = (G.monsterAnimFrame + 1) % 2;
        }

        const animFrame = Math.floor(Date.now() / 500) % 4;

        ctx.clearRect(0, 0, W, H);

        // Draw visible tiles
        const startX = Math.floor(camX) - 1;
        const startY = Math.floor(camY) - 1;
        const endX = startX + G.VIEW_W + 3;
        const endY = startY + G.VIEW_H + 3;

        for (let wy = startY; wy < endY; wy++) {
            for (let wx = startX; wx < endX; wx++) {
                const sx = Math.floor((wx - camX) * TILE);
                const sy = Math.floor((wy - camY) * TILE);
                const tile = World.getTile(wx, wy);
                const spriteKey = this.getTileSprite(tile, wx, wy, animFrame);
                Sprites.draw(ctx, spriteKey, sx, sy);

                // Opened chest check
                if (tile === World.T.CHEST && World.openedChests.has(`${wx},${wy}`)) {
                    Sprites.draw(ctx, 'chest_open', sx, sy);
                }
            }
        }

        // Draw monsters
        const nearMonsters = World.getMonstersNear(p.x, p.y, Math.max(G.VIEW_W, G.VIEW_H));
        for (const m of nearMonsters) {
            if (!m.alive) continue;
            const sx = Math.floor((m.x - camX) * TILE);
            const sy = Math.floor((m.y - camY) * TILE);
            if (sx < -TILE || sx > W + TILE || sy < -TILE || sy > H + TILE) continue;

            const spriteKey = m.isElite
                ? `mob_${m.sprite}_elite`
                : `mob_${m.sprite}_${G.monsterAnimFrame}`;
            Sprites.draw(ctx, spriteKey, sx, sy);

            // HP bar above monster
            const barW = 28;
            const barH = 3;
            const barX = sx + (TILE - barW) / 2;
            const barY = sy - 6;
            ctx.fillStyle = '#000';
            ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(barX, barY, Math.max(1, barW * m.hp / m.maxHp), barH);

            // Monster name/level
            ctx.fillStyle = m.isElite ? '#f1c40f' : '#fff';
            ctx.font = '7px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText(`Lv${m.level}`, sx + TILE / 2, barY - 3);
            ctx.textAlign = 'left';
        }

        // Draw player
        const px = Math.floor((p.visualX - camX) * TILE);
        const py = Math.floor((p.visualY - camY) * TILE);
        const walkFrame = G.animating ? 1 : 0;
        const playerSprite = `player_${p.dir}_${walkFrame}`;
        if (p.stealth) ctx.globalAlpha = 0.4;
        Sprites.draw(ctx, playerSprite, px, py);
        ctx.globalAlpha = 1;

        // Player HP/MP bars on screen
        const phpW = 28;
        ctx.fillStyle = '#000';
        ctx.fillRect(px - 1, py - 10, phpW + 2, 4);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(px, py - 9, phpW * p.hp / p.maxHp, 2);
        ctx.fillStyle = '#3498db';
        ctx.fillRect(px, py - 6, phpW * p.mp / p.maxMp, 2);

        // Targeting crosshair
        if (G.targeting) {
            const tx = Math.floor((G.targetX - camX) * TILE);
            const ty = Math.floor((G.targetY - camY) * TILE);
            ctx.strokeStyle = '#f1c40f';
            ctx.lineWidth = 2;
            ctx.strokeRect(tx + 2, ty + 2, TILE - 4, TILE - 4);
            ctx.lineWidth = 1;
        }

        // Direction indicator (small arrow)
        this.drawDirectionIndicator(ctx, px, py, p.dir);

        // Location label
        const locLabel = document.getElementById('location-label');
        if (locLabel) locLabel.textContent = World.getAreaName(p.x, p.y);
    },

    drawDirectionIndicator(ctx, px, py, dir) {
        ctx.fillStyle = 'rgba(255,255,100,0.6)';
        const cx = px + 16, cy = py + 16;
        switch (dir) {
            case 'up': ctx.fillRect(cx - 2, py - 4, 4, 3); break;
            case 'down': ctx.fillRect(cx - 2, py + 33, 4, 3); break;
            case 'left': ctx.fillRect(px - 4, cy - 2, 3, 4); break;
            case 'right': ctx.fillRect(px + 33, cy - 2, 3, 4); break;
        }
    },

    renderMinimap() {
        const p = Game.player;
        if (!p || !this.minimapCtx) return;
        const mctx = this.minimapCtx;
        const mw = this.minimapCanvas.width;
        const mh = this.minimapCanvas.height;
        mctx.fillStyle = '#111';
        mctx.fillRect(0, 0, mw, mh);

        const scale = 2;
        const hw = Math.floor(mw / scale / 2);
        const hh = Math.floor(mh / scale / 2);

        for (let dy = -hh; dy <= hh; dy++) {
            for (let dx = -hw; dx <= hw; dx++) {
                const wx = p.x + dx;
                const wy = p.y + dy;
                const tile = World.getTile(wx, wy);
                let color = '#333';
                const T = World.T;
                if (tile === T.WATER) color = '#2980b9';
                else if (tile === T.GRASS || tile === T.FLOWER) color = '#4a8c3f';
                else if (tile === T.DARK_GRASS) color = '#2d5a2a';
                else if (tile === T.PATH || tile === T.BRIDGE) color = '#c4a663';
                else if (tile === T.TREE || tile === T.SWAMP_TREE) color = '#1a5c1a';
                else if ([T.HOUSE, T.VILLAGE_HUT, T.FENCE].includes(tile)) color = '#8B4513';
                else if (tile === T.STONE_FLOOR || tile === T.SHOP_FLOOR) color = '#888';
                else if (tile === T.SWAMP) color = '#556b2f';
                else if (tile === T.MOUNTAIN || tile === T.ROCK) color = '#808080';
                else if (tile === T.DESERT) color = '#daa520';
                else if ([T.SHOP_WEAPON_NPC, T.SHOP_ARMOR_NPC, T.SHOP_POTION_NPC, T.NPC_QUEST, T.NPC_QUEST2, T.NPC_SHOPKEEPER].includes(tile)) color = '#e67e22';
                else if (tile === T.WELL) color = '#3498db';
                else if (tile === T.CAVE_ENTRY) color = '#333';
                else if (tile === T.CHEST) color = '#f1c40f';
                else if (tile === T.CACTUS) color = '#2ecc71';

                // Monster dot
                const mob = World.getMonsterAt(wx, wy);
                if (mob) color = mob.isElite ? '#f1c40f' : '#e74c3c';

                mctx.fillStyle = color;
                mctx.fillRect((dx + hw) * scale, (dy + hh) * scale, scale, scale);
            }
        }

        // Player dot
        mctx.fillStyle = '#fff';
        mctx.fillRect(hw * scale, hh * scale, scale, scale);
    },

    updateHUD() {
        const p = Game.player;
        if (!p) return;
        const s = Game.getStats();

        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        const setW = (id, pct) => { const el = document.getElementById(id); if (el) el.style.width = pct + '%'; };

        set('stat-level', p.level);
        set('stat-hp', `${p.hp}/${p.maxHp}`);
        set('stat-mp', `${p.mp}/${p.maxMp}`);
        setW('hp-bar', (p.hp / p.maxHp) * 100);
        setW('mp-bar', (p.mp / p.maxMp) * 100);
        setW('xp-bar', (p.xp / p.xpToNext) * 100);
        set('stat-gold', p.gold);
        set('stat-atk', s.atk);
        set('stat-def', s.def);
        set('stat-class', CLASSES[p.classId]?.name || '');
        set('stat-time', Game.getPlayTime());
        set('stat-deaths', Game.deathCount);
    },
};
