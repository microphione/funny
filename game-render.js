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
            case T.HOUSE_DOOR: return 'house_door';
            case T.TOWN_BUILDING: return 'town_building';
            case T.TOWN_BUILDING_DOOR: return 'town_building_door';
            case T.LAVA: return `lava_${animFrame % 4}`;
            case T.SNOW: return `snow_${v}`;
            case T.SNOW_PINE: return 'snow_pine';
            case T.HOUSE_WALL: return 'house_wall';
            case T.HOUSE_ROOF: return 'house_roof';
            case T.HOUSE_FLOOR: return 'house_floor';
            case T.HOUSE_WINDOW: return 'house_window';
            case T.STAIRS_UP: return 'stairs_up';
            case T.STAIRS_DOWN: return 'stairs_down';
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

        const T = World.T;
        // Tiles that need a ground tile drawn underneath
        const overlayTiles = new Set([T.TREE, T.SWAMP_TREE, T.CACTUS, T.CHEST, T.SIGN, T.WELL, T.STATUE,
            T.NPC_QUEST, T.NPC_QUEST2, T.NPC_SHOPKEEPER, T.SHOP_WEAPON_NPC, T.SHOP_ARMOR_NPC, T.SHOP_POTION_NPC,
            T.FENCE, T.INN, T.HOUSE, T.VILLAGE_HUT, T.ROCK, T.HOUSE_DOOR,
            T.TOWN_BUILDING, T.TOWN_BUILDING_DOOR, T.SNOW_PINE,
            T.HOUSE_WALL, T.HOUSE_WINDOW, T.STAIRS_UP, T.STAIRS_DOWN]);

        // Height offset lookup for elevation rendering
        const heightOffsets = { 0: 4, 1: 0, 2: -4 }; // low=down, mid=normal, high=up

        // First pass: ground tiles
        for (let wy = startY; wy < endY; wy++) {
            for (let wx = startX; wx < endX; wx++) {
                const sx = Math.floor((wx - camX) * TILE);
                let sy = Math.floor((wy - camY) * TILE);
                const tile = World.getTile(wx, wy);

                // Apply height offset (visual elevation)
                const h = World.activeDungeon ? 0 : World.getHeight(wx, wy);
                const hOff = (h >= 0) ? (heightOffsets[h] || 0) : 0;
                sy += hOff;

                if (overlayTiles.has(tile)) {
                    // Draw appropriate ground underneath
                    const biome = World.activeDungeon ? 4 : World.getBiome(wx, wy);
                    const v = ((wx * 7 + wy * 13) & 0x7fffffff) % 4;
                    let groundSprite = 'grass_' + v;
                    if (World.activeDungeon) groundSprite = 'cave_floor_' + (v % 3);
                    else if (biome === 1) groundSprite = 'darkgrass_' + v;
                    else if (biome === 2) groundSprite = 'swamp_' + v;
                    else if (biome === 3) groundSprite = 'mountain_' + v;
                    else if (biome === 4) groundSprite = 'desert_' + v;
                    else if (biome === 5) groundSprite = 'snow_' + v;
                    // Village tiles get stone floor
                    const cx = Math.floor(wx / World.CHUNK_SIZE);
                    const cy = Math.floor(wy / World.CHUNK_SIZE);
                    if (World.villages[`${cx},${cy}`]) groundSprite = 'stone_floor';
                    Sprites.draw(ctx, groundSprite, sx, sy);
                }

                const spriteKey = this.getTileSprite(tile, wx, wy, animFrame);
                Sprites.draw(ctx, spriteKey, sx, sy);

                // Draw cliff edges between different height levels
                if (!World.activeDungeon && h >= 0) {
                    const hSouth = World.getHeight(wx, wy + 1);
                    if (hSouth >= 0 && h > hSouth) {
                        // Cliff edge shadow on south side
                        ctx.fillStyle = 'rgba(0,0,0,0.35)';
                        ctx.fillRect(sx, sy + TILE - 1, TILE, 3 + (h - hSouth) * 2);
                    }
                    const hEast = World.getHeight(wx + 1, wy);
                    if (hEast >= 0 && h > hEast) {
                        ctx.fillStyle = 'rgba(0,0,0,0.2)';
                        ctx.fillRect(sx + TILE - 1, sy, 2, TILE);
                    }
                    // Darken low tiles slightly, brighten high tiles
                    if (h === 0) {
                        ctx.fillStyle = 'rgba(0,0,20,0.15)';
                        ctx.fillRect(sx, sy, TILE, TILE);
                    } else if (h === 2) {
                        ctx.fillStyle = 'rgba(255,255,255,0.06)';
                        ctx.fillRect(sx, sy, TILE, TILE);
                    }
                }

                // Opened chest check
                if (tile === T.CHEST && World.openedChests.has(`${wx},${wy}`)) {
                    Sprites.draw(ctx, 'chest_open', sx, sy);
                }

                // Quest item pickup sparkle
                if (!World.activeDungeon && World.questItems[`${wx},${wy}`]) {
                    ctx.fillStyle = '#f1c40f';
                    ctx.globalAlpha = 0.6 + Math.sin(Date.now() / 200 + wx + wy) * 0.3;
                    ctx.beginPath();
                    ctx.arc(sx + 16, sy + 16, 5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#fff';
                    ctx.beginPath();
                    ctx.arc(sx + 16, sy + 16, 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.globalAlpha = 1;
                }

                // Ground loot indicator (bag icon)
                const lootKey = `${wx},${wy}`;
                if (World.groundLoot[lootKey] && World.groundLoot[lootKey].length > 0) {
                    const pulse = 0.6 + Math.sin(Date.now() / 300 + wx * 3 + wy * 5) * 0.3;
                    ctx.globalAlpha = pulse;
                    ctx.fillStyle = '#e67e22';
                    ctx.fillRect(sx + 10, sy + 18, 12, 10);
                    ctx.fillStyle = '#f1c40f';
                    ctx.fillRect(sx + 12, sy + 14, 8, 6);
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(sx + 14, sy + 16, 4, 2);
                    ctx.globalAlpha = 1;
                }
            }
        }

        // Second pass: draw tree canopy over player (trees in rows above player)
        // Player can walk "behind" trees - draw upper portion over player
        const playerScreenY = Math.floor((p.visualY - camY) * TILE);
        for (let wy = startY; wy < endY; wy++) {
            const tileScreenY = Math.floor((wy - camY) * TILE);
            // Only redraw overlay tiles that are at same or lower row than player (player walks behind them)
            if (tileScreenY > playerScreenY + TILE) continue;
            for (let wx = startX; wx < endX; wx++) {
                const tile = World.getTile(wx, wy);
                if (tile === T.TREE || tile === T.SWAMP_TREE) {
                    // Only redraw if player is directly below (within 1 tile)
                    if (wy >= Math.floor(p.visualY) - 1 && wy <= Math.floor(p.visualY)) {
                        const sx = Math.floor((wx - camX) * TILE);
                        const sy = Math.floor((wy - camY) * TILE);
                        ctx.globalAlpha = 0.7;
                        Sprites.draw(ctx, this.getTileSprite(tile, wx, wy, animFrame), sx, sy);
                        ctx.globalAlpha = 1;
                    }
                }
            }
        }

        // Draw city NPCs
        if (!World.activeDungeon) {
            for (const key in World.cityNpcs) {
                const npc = World.cityNpcs[key];
                const sx = Math.floor((npc.x - camX) * TILE);
                const sy = Math.floor((npc.y - camY) * TILE);
                if (sx < -TILE || sx > W + TILE || sy < -TILE || sy > H + TILE) continue;
                Sprites.draw(ctx, npc.sprite, sx, sy);
                // Name above NPC
                ctx.fillStyle = '#3498db';
                ctx.font = '6px "Press Start 2P"';
                ctx.textAlign = 'center';
                ctx.fillText(npc.name, sx + TILE / 2, sy - 3);
                ctx.textAlign = 'left';
            }
        }

        // Draw animated quest markers (!) above quest NPC tiles
        if (!World.activeDungeon) {
            const questBob = Math.sin(Date.now() / 300) * 3;
            for (const key in World.questNpcs) {
                const [nx, ny] = key.split(',').map(Number);
                const sx = Math.floor((nx - camX) * TILE);
                const sy = Math.floor((ny - camY) * TILE);
                if (sx < -TILE || sx > W + TILE || sy < -TILE || sy > H + TILE) continue;
                const qInfo = World.questNpcs[key];
                const quest = G.quests.find(q => q.id === qInfo.id);
                let markerColor, markerChar;
                if (quest && quest.completed && !quest.turned_in) {
                    markerColor = '#2ecc71'; markerChar = '?';
                } else if (quest && !quest.turned_in) {
                    markerColor = '#e67e22'; markerChar = '!';
                } else if (!quest) {
                    markerColor = '#f1c40f'; markerChar = '!';
                } else {
                    continue;
                }
                // Animated bouncing marker with black outline
                const my = sy - 12 + questBob;
                ctx.font = 'bold 14px "Press Start 2P"';
                ctx.textAlign = 'center';
                ctx.globalAlpha = 0.8 + Math.sin(Date.now() / 200) * 0.2;
                // Black outline (stroke)
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 3;
                ctx.strokeText(markerChar, sx + TILE / 2, my);
                // Colored fill
                ctx.fillStyle = markerColor;
                ctx.fillText(markerChar, sx + TILE / 2, my);
                ctx.globalAlpha = 1;
                ctx.textAlign = 'left';
            }

            // Draw ? markers above quest target monsters
            const questBob2 = Math.sin(Date.now() / 350) * 2;
            for (const q of G.quests) {
                if (q.completed || q.turned_in) continue;
                if (q.type === 'kill') {
                    // Show ? above matching monsters in view
                    const nearM = World.getMonstersNear(p.x, p.y, Math.max(G.VIEW_W, G.VIEW_H));
                    for (const m of nearM) {
                        if (m.baseName === q.target && m.alive) {
                            const mx = Math.floor((m.x - camX) * TILE);
                            const my2 = Math.floor((m.y - camY) * TILE) - 10 + questBob2;
                            if (mx < -TILE || mx > W + TILE || my2 < -TILE || my2 > H + TILE) continue;
                            ctx.font = 'bold 10px "Press Start 2P"';
                            ctx.textAlign = 'center';
                            ctx.strokeStyle = '#000';
                            ctx.lineWidth = 2;
                            ctx.strokeText('?', mx + TILE / 2, my2);
                            ctx.fillStyle = '#f39c12';
                            ctx.fillText('?', mx + TILE / 2, my2);
                            ctx.textAlign = 'left';
                        }
                    }
                }
            }
        }

        // Auto-attack target indicator
        if (G.autoAttackTarget && G.autoAttackTarget.alive) {
            const t = G.autoAttackTarget;
            const tsx = Math.floor((t.x - camX) * TILE);
            const tsy = Math.floor((t.y - camY) * TILE);
            const pulse = 0.5 + Math.sin(Date.now() / 200) * 0.3;
            ctx.strokeStyle = `rgba(231, 76, 60, ${pulse})`;
            ctx.lineWidth = 2;
            ctx.strokeRect(tsx + 1, tsy + 1, TILE - 2, TILE - 2);
            ctx.lineWidth = 1;
        }

        // Draw monsters
        const nearMonsters = World.getMonstersNear(p.x, p.y, Math.max(G.VIEW_W, G.VIEW_H));
        for (const m of nearMonsters) {
            if (!m.alive) continue;
            const sx = Math.floor((m.x - camX) * TILE);
            const mh = World.activeDungeon ? 0 : World.getHeight(m.x, m.y);
            const mhOff = (mh >= 0) ? (heightOffsets[mh] || 0) : 0;
            const sy = Math.floor((m.y - camY) * TILE) + mhOff;
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

        // Draw player (with height offset)
        const playerH = World.activeDungeon ? 0 : World.getHeight(p.x, p.y);
        const playerHOff = (playerH >= 0) ? (heightOffsets[playerH] || 0) : 0;
        const px = Math.floor((p.visualX - camX) * TILE);
        const py = Math.floor((p.visualY - camY) * TILE) + playerHOff;
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

        // Attack cooldown bar (below player)
        if (G.attackCooldown > 0) {
            const atkSpeed = G.getAttackSpeed();
            const atkPct = G.attackCooldown / atkSpeed;
            ctx.fillStyle = '#000';
            ctx.fillRect(px - 1, py + TILE + 2, phpW + 2, 3);
            ctx.fillStyle = '#e67e22';
            ctx.fillRect(px, py + TILE + 3, phpW * (1 - atkPct), 1);
        }

        // House roof overlay - draw roofs over everything, except player's current house
        const playerHouseKey = World.getPlayerHouse();
        if (!World.activeDungeon) {
            for (const hk in World.houses) {
                const house = World.houses[hk];
                if (!house.roofTiles) continue;
                const isPlayerInside = (hk === playerHouseKey);
                // Near house (within 2 tiles of door) = semi-transparent roof
                const [doorX, doorY] = hk.split(',').map(Number);
                const distToDoor = Math.abs(p.x - doorX) + Math.abs(p.y - doorY);
                const isNear = distToDoor <= 2;

                if (isPlayerInside) continue; // Don't draw roof at all when inside

                if (isNear) ctx.globalAlpha = 0.4;

                for (const rt of house.roofTiles) {
                    const [rx, ry] = rt.split(',').map(Number);
                    const rsx = Math.floor((rx - camX) * TILE);
                    const rsy = Math.floor((ry - camY) * TILE);
                    if (rsx < -TILE || rsx > W + TILE || rsy < -TILE || rsy > H + TILE) continue;
                    Sprites.draw(ctx, 'house_roof', rsx, rsy);
                }

                if (isNear) ctx.globalAlpha = 1;
            }
        }

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

        // Location label with height indicator
        const locLabel = document.getElementById('location-label');
        if (locLabel) {
            if (World.activeBuildingFloor) {
                const bf = World.activeBuildingFloor;
                locLabel.textContent = `${bf.name} - Piętro ${bf.floor + 1}/${bf.numFloors}`;
            } else if (World.activeDungeon) {
                const d = World.activeDungeon;
                locLabel.textContent = `${d.type.name} - Piętro ${d.floor}/${d.type.floors}`;
            } else {
                const heightNames = { 0: 'Niziny', 1: '', 2: 'Wyżyny' };
                const h = World.getHeight(p.x, p.y);
                const hName = (h >= 0) ? heightNames[h] : '';
                const areaName = World.getAreaName(p.x, p.y);
                locLabel.textContent = hName ? `${areaName} [${hName}]` : areaName;
            }
        }
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
        set('stat-atk', s.damage);
        set('stat-def', s.armor);
        set('stat-agi', `${s.dodge}`);
        set('stat-class', CLASSES[p.classId]?.name || '');
        set('stat-time', Game.getPlayTime());
        const xpPct = p.xpToNext > 0 ? Math.floor(p.xp / p.xpToNext * 100) : 0;
        set('stat-xp-pct', `${xpPct}%`);
    },
};
