// ============================================================
// MINIMAP RENDERING
// ============================================================

GameRender.renderMinimap = function() {
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
            else if (tile === T.CAVE_ENTRY || tile === T.FOREST_ENTRY) color = '#ff4444';
            else if (tile === T.CHEST) color = '#f1c40f';
            else if (tile === T.CACTUS) color = '#2ecc71';
            else if (tile === T.HOUSE_DOOR) color = '#8B4513';
            else if (tile === T.DOOR) color = '#c4a663';
            else if (tile === T.TOWN_BUILDING || tile === T.TOWN_BUILDING_DOOR) color = '#a89078';
            else if (tile === T.LAVA) color = '#e74c3c';
            else if (tile === T.SNOW || tile === T.SNOW_PINE) color = '#ecf0f1';
            else if (tile === T.HOUSE_WALL || tile === T.HOUSE_WINDOW || tile === T.HOUSE_ROOF) color = '#8B4513';
            else if (tile === T.HOUSE_FLOOR) color = '#B8860B';
            else if (tile === T.STAIRS_UP) color = '#2ecc71';
            else if (tile === T.STAIRS_DOWN) color = '#e74c3c';

            // Monster dot
            const mob = World.getMonsterAt(wx, wy);
            if (mob) color = mob.isElite ? '#f1c40f' : '#e74c3c';
            // City NPC dot
            if (World.getCityNpcAt(wx, wy)) color = '#3498db';

            mctx.fillStyle = color;
            mctx.fillRect((dx + hw) * scale, (dy + hh) * scale, scale, scale);
        }
    }

    // Quest target areas on minimap (? markers for discovered areas)
    Game.quests.forEach(q => {
        if (q.turned_in) return;
        if (!q.completed && q.targetX !== undefined && q.targetY !== undefined) {
            const qdx = q.targetX - p.x;
            const qdy = q.targetY - p.y;
            if (Math.abs(qdx) <= hw && Math.abs(qdy) <= hh) {
                // Pulsing quest area indicator
                const pulse = 0.4 + Math.sin(Date.now() / 400) * 0.3;
                mctx.globalAlpha = pulse;
                mctx.fillStyle = '#f39c12';
                // Draw a small area around the target
                for (let r = -2; r <= 2; r++) {
                    for (let c = -2; c <= 2; c++) {
                        const mx = (qdx + c + hw) * scale;
                        const my = (qdy + r + hh) * scale;
                        if (mx >= 0 && mx < mw && my >= 0 && my < mh) {
                            mctx.fillRect(mx, my, scale, scale);
                        }
                    }
                }
                mctx.globalAlpha = 1;
                // Question mark in center
                mctx.fillStyle = '#fff';
                mctx.font = '6px "Press Start 2P"';
                mctx.textAlign = 'center';
                mctx.fillText('?', (qdx + hw) * scale + 1, (qdy + hh) * scale + 5);
                mctx.textAlign = 'left';
            }
        }
    });
    // Quest NPCs on minimap (green ? for completable, orange for active)
    for (const key in World.questNpcs) {
        const [nx, ny] = key.split(',').map(Number);
        const qdx = nx - p.x, qdy = ny - p.y;
        if (Math.abs(qdx) <= hw && Math.abs(qdy) <= hh) {
            const quest = Game.quests.find(q => q.id === World.questNpcs[key].id);
            if (quest && quest.completed && !quest.turned_in) {
                mctx.fillStyle = '#2ecc71'; // green - ready to turn in
            } else if (quest && !quest.turned_in) {
                mctx.fillStyle = '#e67e22'; // orange - in progress
            } else if (!quest) {
                mctx.fillStyle = '#f1c40f'; // yellow - available
            } else {
                continue; // turned in, skip
            }
            mctx.fillRect((qdx + hw) * scale, (qdy + hh) * scale, scale, scale);
        }
    }

    // Dungeon/cave entry markers - larger blinking icons
    for (let dy = -hh; dy <= hh; dy++) {
        for (let dx = -hw; dx <= hw; dx++) {
            const wx = p.x + dx;
            const wy = p.y + dy;
            const tile = World.getTile(wx, wy);
            if (tile === World.T.CAVE_ENTRY || tile === World.T.FOREST_ENTRY) {
                const blink = Math.sin(Date.now() / 500 + dx + dy) > -0.3;
                if (blink) {
                    mctx.fillStyle = '#ff4444';
                    mctx.fillRect((dx + hw) * scale - 1, (dy + hh) * scale - 1, scale + 2, scale + 2);
                    mctx.fillStyle = '#ff8888';
                    mctx.fillRect((dx + hw) * scale, (dy + hh) * scale, scale, scale);
                }
            }
        }
    }

    // Player dot
    mctx.fillStyle = '#fff';
    mctx.fillRect(hw * scale, hh * scale, scale, scale);
};
