// ============================================================
// GAME UI - Overlays, shops, inventory, death, class selection
// ============================================================

const GameUI = {
    hideAllOverlays() {
        document.querySelectorAll('.overlay').forEach(o => o.classList.remove('active'));
        const deathEl = document.getElementById('death-overlay');
        if (deathEl) deathEl.classList.remove('active');
        const classEl = document.getElementById('class-select');
        if (classEl) classEl.style.display = 'none';
    },

    showOverlay(id) {
        this.hideAllOverlays();
        const el = document.getElementById(id);
        if (el) el.classList.add('active');
        Game.activeOverlay = id;
    },

    // ========== CLASS SELECTION ==========
    showClassSelect() {
        const el = document.getElementById('class-select');
        if (!el) return;
        el.style.display = 'flex';
        el.innerHTML = '';

        const title = document.createElement('h1');
        title.textContent = 'WYBIERZ KLASĘ';
        title.style.cssText = 'font-size:16px;color:#e67e22;margin-bottom:20px;text-shadow:2px 2px 0 #000';
        el.appendChild(title);

        const container = document.createElement('div');
        container.style.cssText = 'display:flex;gap:16px;flex-wrap:wrap;justify-content:center;max-width:700px';

        for (const [id, cls] of Object.entries(CLASSES)) {
            const card = document.createElement('div');
            card.style.cssText = `background:#12122a;border:3px solid ${cls.color};border-radius:8px;padding:16px;width:200px;cursor:pointer;transition:transform 0.15s`;
            card.onmouseover = () => card.style.transform = 'scale(1.05)';
            card.onmouseout = () => card.style.transform = 'scale(1)';
            card.onclick = () => {
                Game.createPlayer(id);
                el.style.display = 'none';
                Game.state = 'playing';
                Game.startTime = Date.now();
                World.init();
                // Ensure starting area chunks load
                World.getChunk(0, 0);
                Game.lastVillageWell = { x: 0, y: 0 };
                Music.updateBiome(0, false, false);
                Game.log(`Wybrano klasę: ${cls.name}!`, 'info');
                Game.log('Użyj WASD aby się poruszać, SPACJA aby wchodzić w interakcje.', 'info');
            };

            const icon = document.createElement('div');
            icon.textContent = cls.icon;
            icon.style.cssText = 'font-size:32px;text-align:center;margin-bottom:8px';

            const name = document.createElement('div');
            name.textContent = cls.name;
            name.style.cssText = `font-size:12px;color:${cls.color};text-align:center;margin-bottom:6px;font-family:'Press Start 2P',monospace`;

            const desc = document.createElement('div');
            desc.textContent = cls.desc;
            desc.style.cssText = "font-size:7px;color:#aaa;text-align:center;margin-bottom:10px;font-family:'Press Start 2P',monospace;line-height:1.5";

            const statsDiv = document.createElement('div');
            statsDiv.style.cssText = "font-size:7px;color:#888;font-family:'Press Start 2P',monospace;line-height:2";
            const bs = cls.baseStats;
            statsDiv.innerHTML = `HP:${bs.hp} MP:${bs.mp}<br>ATK:${bs.atk} DEF:${bs.def} AGI:${bs.agi}<br>Ataki/turę: ${cls.attacksPerTurn}${cls.attackRange ? '<br>Zasięg: '+cls.attackRange : ''}`;

            card.append(icon, name, desc, statsDiv);
            container.appendChild(card);
        }
        el.appendChild(container);
    },

    // ========== DEATH SCREEN ==========
    showDeathScreen(goldLoss) {
        const el = document.getElementById('death-overlay');
        if (!el) return;
        el.classList.add('active');
        const content = document.getElementById('death-content');
        if (!content) return;
        content.innerHTML = `
            <div style="text-align:center;font-size:8px;color:#aaa;line-height:2.5">
                <div style="font-size:24px;margin-bottom:16px">💀</div>
                <div>Czas gry: ${Game.getPlayTime()}</div>
                <div>Poziom: ${Game.player.level}</div>
                <div>Zabójstwa: ${Game.killCount}</div>
                <div>Śmierci: ${Game.deathCount}</div>
                <div style="color:#e74c3c">Stracono ${goldLoss} złota</div>
            </div>`;
    },

    // ========== SHOP ==========
    openShop(shopType, difficulty) {
        const p = Game.player;
        const cls = CLASSES[p.classId];
        Game.shopType = shopType;
        Game.shopItems = [];
        const title = document.getElementById('dialog-title');

        if (shopType === 'weapon') {
            if (title) title.textContent = 'Sklep z Bronią';
            for (let i = 0; i < 6; i++) {
                const item = generateItemForClass(p.classId, difficulty + Math.floor(Math.random() * 3), 'weapon');
                if (item) Game.shopItems.push(item);
            }
        } else if (shopType === 'armor') {
            if (title) title.textContent = 'Sklep z Pancerzem';
            const armorSlots = ['head','chest','legs','feet','offhand'];
            armorSlots.forEach(slot => {
                const item = generateItemForClass(p.classId, difficulty + Math.floor(Math.random() * 3), slot);
                if (item) Game.shopItems.push(item);
            });
        } else if (shopType === 'potion') {
            if (title) title.textContent = 'Sklep z Miksturami';
            for (let i = 0; i < 6; i++) {
                Game.shopItems.push(generatePotion(difficulty));
            }
        }

        this.renderShopItems();
        this.showOverlay('dialog-overlay');
    },

    renderShopItems() {
        const content = document.getElementById('dialog-content');
        if (!content) return;
        content.innerHTML = '';
        const p = Game.player;

        Game.shopItems.forEach((item, idx) => {
            const div = document.createElement('div');
            div.className = 'shop-item' + (p.gold < item.price ? ' cannot-afford' : '');

            const tierCol = item.tier ? (TIERS[item.tier]?.color || '#aaa') : '#aaa';
            const nameSpan = `<span class="item-name" style="color:${tierCol}">${item.name}</span>`;
            const descSpan = `<div class="item-desc">${item.desc || ''}</div>`;
            const priceSpan = `<span class="item-price">${item.price} zł</span>`;

            // Compare with equipped (all stats)
            let compare = '';
            if (item.slot) {
                const eq = p.equipment[item.slot];
                const stats = ['atk','def','agi'];
                let parts = [];
                for (const stat of stats) {
                    const cur = eq ? (eq[stat] || 0) : 0;
                    const nw = item[stat] || 0;
                    const diff = nw - cur;
                    if (diff > 0) parts.push(`<span class="stat-up">+${diff} ${stat.toUpperCase()}</span>`);
                    else if (diff < 0) parts.push(`<span class="stat-down">${diff} ${stat.toUpperCase()}</span>`);
                }
                if (parts.length) compare = `<div class="item-compare">${parts.join(' ')}</div>`;
            }

            div.innerHTML = `<div>${nameSpan}${descSpan}${compare}</div>${priceSpan}`;

            if (p.gold >= item.price) {
                div.onclick = () => this.buyItem(idx);
            }
            content.appendChild(div);
        });
    },

    buyItem(idx) {
        const item = Game.shopItems[idx];
        if (!item || Game.player.gold < item.price) return;
        Game.player.gold -= item.price;

        // Stack consumables
        if (item.type === 'consumable') {
            const existing = Game.player.inventory.find(i => i.id === item.id);
            if (existing) { existing.count = (existing.count || 1) + 1; }
            else Game.player.inventory.push({ ...item });
        } else {
            Game.player.inventory.push(item);
        }

        Game.log(`Kupiono: ${item.name} za ${item.price} zł`, 'shop');
        Game.shopItems.splice(idx, 1);
        this.renderShopItems();
        GameRender.updateHUD();
    },

    // ========== INVENTORY ==========
    openInventory() {
        this.renderInventory();
        this.showOverlay('inventory-overlay');
    },

    renderInventory() {
        const content = document.getElementById('inventory-content');
        if (!content) return;
        content.innerHTML = '';
        const p = Game.player;

        // Equipment slots
        const eqDiv = document.createElement('div');
        eqDiv.style.cssText = 'margin-bottom:12px;border-bottom:1px solid #333;padding-bottom:8px';
        eqDiv.innerHTML = '<div style="font-size:9px;color:#f1c40f;margin-bottom:6px">Wyposażenie</div>';
        for (const [slot, label] of Object.entries(EQUIP_SLOTS)) {
            const item = p.equipment[slot];
            const row = document.createElement('div');
            row.className = 'inv-item' + (item ? ' equipped' : '');
            const tierCol = item?.tier ? (TIERS[item.tier]?.color || '#aaa') : '#555';
            row.innerHTML = `<span style="color:#888;width:60px">${label}:</span>
                <span style="color:${tierCol};flex:1">${item ? item.name : '(pusto)'}</span>`;
            if (item) {
                const btn = document.createElement('button');
                btn.className = 'use-btn';
                btn.textContent = 'Zdejmij';
                btn.onclick = () => { p.equipment[slot] = null; Game.refreshStats(); this.renderInventory(); GameRender.updateHUD(); };
                row.appendChild(btn);
            }
            eqDiv.appendChild(row);
        }
        content.appendChild(eqDiv);

        // Inventory items (filter out equipped items)
        const invDiv = document.createElement('div');
        invDiv.innerHTML = '<div style="font-size:9px;color:#3498db;margin-bottom:6px">Plecak</div>';
        const equippedIds = new Set(Object.values(p.equipment).filter(e => e).map(e => e.id));
        const backpackItems = p.inventory.map((item, idx) => ({item, idx})).filter(({item}) => !equippedIds.has(item.id) || item.type === 'consumable');
        if (backpackItems.length === 0) {
            invDiv.innerHTML += '<div style="font-size:7px;color:#555">Pusty</div>';
        }
        backpackItems.forEach(({item, idx}) => {
            const row = document.createElement('div');
            row.className = 'inv-item';
            const tierCol = item.tier ? (TIERS[item.tier]?.color || '#aaa') : '#aaa';
            const count = item.count > 1 ? ` x${item.count}` : '';
            row.innerHTML = `<span style="color:${tierCol};flex:1">${item.name}${count}</span>
                <span style="font-size:7px;color:#888;margin:0 6px">${item.desc || ''}</span>`;

            // Stat comparison for equipment items
            if (item.type === 'equipment') {
                const equipped = p.equipment[item.slot];
                if (equipped) {
                    const stats = ['atk','def','agi'];
                    let compareHtml = '';
                    for (const stat of stats) {
                        const cur = equipped[stat] || 0;
                        const nw = item[stat] || 0;
                        const diff = nw - cur;
                        if (diff > 0) compareHtml += `<span style="color:#2ecc71;font-size:7px;margin-left:4px">+${diff} ${stat.toUpperCase()}</span>`;
                        else if (diff < 0) compareHtml += `<span style="color:#e74c3c;font-size:7px;margin-left:4px">${diff} ${stat.toUpperCase()}</span>`;
                    }
                    if (compareHtml) {
                        const cmp = document.createElement('span');
                        cmp.innerHTML = compareHtml;
                        row.appendChild(cmp);
                    }
                } else {
                    // No item equipped in slot - show as upgrade
                    const stats = ['atk','def','agi'];
                    let compareHtml = '';
                    for (const stat of stats) {
                        const nw = item[stat] || 0;
                        if (nw > 0) compareHtml += `<span style="color:#2ecc71;font-size:7px;margin-left:4px">+${nw} ${stat.toUpperCase()}</span>`;
                    }
                    if (compareHtml) {
                        const cmp = document.createElement('span');
                        cmp.innerHTML = compareHtml;
                        row.appendChild(cmp);
                    }
                }

                if (canEquip(item, p.classId, p.level)) {
                    const btn = document.createElement('button');
                    btn.className = 'use-btn';
                    btn.textContent = 'Załóż';
                    btn.onclick = () => {
                        p.equipment[item.slot] = item;
                        Game.refreshStats();
                        this.renderInventory();
                        GameRender.updateHUD();
                    };
                    row.appendChild(btn);
                } else {
                    row.innerHTML += '<span style="font-size:7px;color:#e74c3c">Nie można</span>';
                }
            } else if (item.type === 'consumable') {
                const btn = document.createElement('button');
                btn.className = 'use-btn';
                btn.textContent = 'Użyj';
                btn.onclick = () => this.useConsumable(idx);
                row.appendChild(btn);
            }

            // Sell button
            if (item.price) {
                const sellBtn = document.createElement('button');
                sellBtn.className = 'use-btn';
                sellBtn.style.background = '#e67e22';
                sellBtn.textContent = `${Math.floor(item.price * 0.25)}zł`;
                sellBtn.onclick = () => {
                    p.gold += Math.floor(item.price * 0.25);
                    if (Object.values(p.equipment).some(e => e && e.id === item.id)) {
                        for (const s in p.equipment) { if (p.equipment[s]?.id === item.id) p.equipment[s] = null; }
                    }
                    p.inventory.splice(idx, 1);
                    Game.refreshStats();
                    this.renderInventory();
                    GameRender.updateHUD();
                    Game.log(`Sprzedano: ${item.name}`, 'shop');
                };
                row.appendChild(sellBtn);
            }
            invDiv.appendChild(row);
        });
        content.appendChild(invDiv);
    },

    useConsumable(idx) {
        const p = Game.player;
        const item = p.inventory[idx];
        if (!item || item.type !== 'consumable') return;

        if (item.subtype === 'hp') {
            const oldHp = p.hp;
            p.hp = Math.min(p.maxHp, p.hp + item.heal);
            Game.log(`Użyto ${item.name}. +${p.hp - oldHp} HP`, 'heal');
        } else if (item.subtype === 'mp') {
            const oldMp = p.mp;
            p.mp = Math.min(p.maxMp, p.mp + item.mana);
            Game.log(`Użyto ${item.name}. +${p.mp - oldMp} MP`, 'heal');
        }

        item.count = (item.count || 1) - 1;
        if (item.count <= 0) p.inventory.splice(idx, 1);
        this.renderInventory();
        GameRender.updateHUD();
    },

    // ========== SKILL TREE ==========
    openSkillTree() {
        const content = document.getElementById('dialog-content');
        const title = document.getElementById('dialog-title');
        if (!content || !title) return;
        const p = Game.player;
        const cls = CLASSES[p.classId];

        title.textContent = `Umiejętności (${p.skillPoints} pkt)`;
        content.innerHTML = '';

        // Active skill slots (3 slots)
        const slotsDiv = document.createElement('div');
        slotsDiv.innerHTML = '<div style="font-size:8px;color:#f1c40f;margin-bottom:6px">Aktywne Sloty (klawisze 1-3)</div>';
        slotsDiv.style.cssText = 'display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap';
        for (let i = 0; i < 3; i++) {
            const slotDiv = document.createElement('div');
            slotDiv.style.cssText = 'background:#0a0a1a;border:2px solid #f1c40f;border-radius:4px;padding:6px;font-size:7px;min-width:120px;text-align:center';
            const sid = p.activeSkills[i];
            const sk = sid ? cls.skills.find(s => s.id === sid) : null;
            const lv = sid ? (p.skillLevels[sid] || 1) : 0;
            slotDiv.innerHTML = sk ? `<div style="color:#9b59b6">[${i+1}] ${sk.name} Lv.${lv}</div><div style="color:#888">${sk.cost} MP</div>` : `<div style="color:#555">[${i+1}] (pusty)</div>`;
            slotsDiv.appendChild(slotDiv);
        }
        content.appendChild(slotsDiv);

        // All skills list
        const skillsDiv = document.createElement('div');
        skillsDiv.innerHTML = '<div style="font-size:8px;color:#9b59b6;margin-bottom:6px">Wszystkie Umiejętności</div>';
        cls.skills.forEach(sk => {
            const unlocked = p.unlockedSkills.includes(sk.id);
            const lv = p.skillLevels[sk.id] || 0;
            const isActive = p.activeSkills.includes(sk.id);
            const activeSlot = p.activeSkills.indexOf(sk.id);

            const row = document.createElement('div');
            row.className = 'shop-item';
            row.style.opacity = unlocked ? '1' : '0.4';
            row.style.borderColor = isActive ? '#f1c40f' : 'transparent';

            const upgradeCost = 1;
            const canUpgrade = unlocked && p.skillPoints >= upgradeCost;

            row.innerHTML = `<div style="flex:1"><span style="color:${unlocked ? '#9b59b6' : '#555'}">${sk.name}${lv > 0 ? ` Lv.${lv}` : ''}</span>
                ${isActive ? `<span style="font-size:7px;color:#f1c40f"> [${activeSlot+1}]</span>` : ''}
                <div style="font-size:7px;color:#888">${sk.desc} (${sk.cost} MP)</div>
                <div style="font-size:7px;color:#666">Wymaga: Lv.${sk.level}</div></div>`;

            const btnGroup = document.createElement('div');
            btnGroup.style.cssText = 'display:flex;gap:4px;align-items:center';

            if (unlocked) {
                // Upgrade button
                if (canUpgrade) {
                    const upBtn = document.createElement('button');
                    upBtn.className = 'use-btn';
                    upBtn.style.background = '#9b59b6';
                    upBtn.textContent = `+Lv (1pkt)`;
                    upBtn.onclick = (e) => {
                        e.stopPropagation();
                        p.skillLevels[sk.id] = (p.skillLevels[sk.id] || 1) + 1;
                        p.skillPoints--;
                        this.openSkillTree();
                        GameRender.updateHUD();
                    };
                    btnGroup.appendChild(upBtn);
                }

                // Assign/remove from active slots
                if (isActive) {
                    const removeBtn = document.createElement('button');
                    removeBtn.className = 'use-btn';
                    removeBtn.style.background = '#e74c3c';
                    removeBtn.textContent = 'Usuń';
                    removeBtn.onclick = (e) => {
                        e.stopPropagation();
                        p.activeSkills[activeSlot] = null;
                        this.openSkillTree();
                    };
                    btnGroup.appendChild(removeBtn);
                } else {
                    const assignBtn = document.createElement('button');
                    assignBtn.className = 'use-btn';
                    assignBtn.style.background = '#f1c40f';
                    assignBtn.style.color = '#000';
                    assignBtn.textContent = 'Aktywuj';
                    assignBtn.onclick = (e) => {
                        e.stopPropagation();
                        const emptySlot = p.activeSkills.indexOf(null);
                        if (emptySlot !== -1) {
                            p.activeSkills[emptySlot] = sk.id;
                        } else {
                            // Replace first slot
                            p.activeSkills[0] = sk.id;
                        }
                        this.openSkillTree();
                    };
                    btnGroup.appendChild(assignBtn);
                }
            }

            row.appendChild(btnGroup);
            skillsDiv.appendChild(row);
        });
        content.appendChild(skillsDiv);

        // Visual Passive Tree (canvas-based tree shape)
        const treeContainer = document.createElement('div');
        treeContainer.style.cssText = 'margin-top:10px';
        treeContainer.innerHTML = '<div style="font-size:8px;color:#e67e22;margin-bottom:6px">Drzewko Pasywne</div>';

        const treeCanvas = document.createElement('canvas');
        const branches = Object.entries(cls.tree);
        const nodeSize = 28;
        const hGap = 90;
        const vGap = 50;
        const maxNodes = Math.max(...branches.map(([,b]) => b.nodes.length));
        const treeW = branches.length * hGap + 60;
        const treeH = maxNodes * vGap + 80;
        treeCanvas.width = treeW;
        treeCanvas.height = treeH;
        treeCanvas.style.cssText = 'display:block;margin:0 auto;max-width:100%;image-rendering:auto';
        const tctx = treeCanvas.getContext('2d');
        tctx.fillStyle = '#0a0a1a';
        tctx.fillRect(0, 0, treeW, treeH);

        // Draw trunk
        const trunkX = treeW / 2;
        tctx.strokeStyle = '#5c3a1e';
        tctx.lineWidth = 4;
        tctx.beginPath();
        tctx.moveTo(trunkX, treeH - 10);
        tctx.lineTo(trunkX, 40);
        tctx.stroke();

        // Node positions for click handling
        const nodePositions = [];

        branches.forEach(([branchKey, branch], bi) => {
            const startX = 40 + bi * hGap;
            const branchColor = bi === 0 ? '#3498db' : '#e74c3c';

            // Branch line from trunk
            tctx.strokeStyle = '#5c3a1e';
            tctx.lineWidth = 2;
            tctx.beginPath();
            tctx.moveTo(trunkX, 40 + bi * 15);
            tctx.lineTo(startX + nodeSize/2, 40);
            tctx.stroke();

            branch.nodes.forEach((node, ni) => {
                const nx = startX;
                const ny = 30 + ni * vGap;
                const owned = !!p.treeProgress[node.id];
                const prevOwned = ni === 0 || p.treeProgress[branch.nodes[ni-1].id];
                const canBuy = !owned && prevOwned && p.skillPoints > 0;

                // Connect to previous node
                if (ni > 0) {
                    tctx.strokeStyle = owned ? '#2ecc71' : '#333';
                    tctx.lineWidth = 2;
                    tctx.beginPath();
                    tctx.moveTo(nx + nodeSize/2, ny - vGap + nodeSize);
                    tctx.lineTo(nx + nodeSize/2, ny);
                    tctx.stroke();
                }

                // Node circle
                tctx.fillStyle = owned ? '#2ecc71' : canBuy ? '#e67e22' : '#222';
                tctx.strokeStyle = owned ? '#2ecc71' : canBuy ? '#e67e22' : '#444';
                tctx.lineWidth = 2;
                tctx.beginPath();
                tctx.arc(nx + nodeSize/2, ny + nodeSize/2, nodeSize/2, 0, Math.PI * 2);
                tctx.fill();
                tctx.stroke();

                // Node label
                tctx.fillStyle = '#fff';
                tctx.font = '6px "Press Start 2P"';
                tctx.textAlign = 'center';
                const shortName = node.name.slice(0, 6);
                tctx.fillText(shortName, nx + nodeSize/2, ny + nodeSize + 10);
                tctx.textAlign = 'left';

                // Owned check
                if (owned) {
                    tctx.fillStyle = '#fff';
                    tctx.font = '12px "Press Start 2P"';
                    tctx.textAlign = 'center';
                    tctx.fillText('✓', nx + nodeSize/2, ny + nodeSize/2 + 4);
                    tctx.textAlign = 'left';
                }

                nodePositions.push({ node, nx, ny, owned, canBuy, branchKey });
            });

            // Branch name
            tctx.fillStyle = branchColor;
            tctx.font = '7px "Press Start 2P"';
            tctx.textAlign = 'center';
            tctx.fillText(branch.name, startX + nodeSize/2, treeH - 15);
            tctx.textAlign = 'left';
        });

        // Click handler for canvas
        treeCanvas.onclick = (e) => {
            const rect = treeCanvas.getBoundingClientRect();
            const scaleX = treeCanvas.width / rect.width;
            const scaleY = treeCanvas.height / rect.height;
            const cx = (e.clientX - rect.left) * scaleX;
            const cy = (e.clientY - rect.top) * scaleY;
            for (const pos of nodePositions) {
                const dx = cx - (pos.nx + nodeSize/2);
                const dy = cy - (pos.ny + nodeSize/2);
                if (dx*dx + dy*dy < (nodeSize/2 + 5) * (nodeSize/2 + 5)) {
                    if (pos.canBuy) {
                        p.treeProgress[pos.node.id] = true;
                        p.skillPoints--;
                        Game.refreshStats();
                        this.openSkillTree();
                        GameRender.updateHUD();
                    }
                    break;
                }
            }
        };

        treeContainer.appendChild(treeCanvas);
        content.appendChild(treeContainer);

        this.showOverlay('dialog-overlay');
    },

    // ========== WORLD MAP ==========
    openWorldMap() {
        this.showOverlay('worldmap-overlay');
        const canvas = document.getElementById('worldmap-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;
        const p = Game.player;
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, w, h);

        const CS = World.CHUNK_SIZE;
        const chunkPixels = 4; // pixels per chunk on map
        const halfW = Math.floor(w / chunkPixels / 2);
        const halfH = Math.floor(h / chunkPixels / 2);
        const pcx = Math.floor(p.x / CS);
        const pcy = Math.floor(p.y / CS);

        const biomeColors = {
            0: '#4a8c3f', // plains
            1: '#2d5a2a', // forest
            2: '#556b2f', // swamp
            3: '#808080', // mountain
            4: '#daa520', // desert
        };

        for (let dy = -halfH; dy <= halfH; dy++) {
            for (let dx = -halfW; dx <= halfW; dx++) {
                const cx = pcx + dx;
                const cy = pcy + dy;
                const key = `${cx},${cy}`;
                const explored = Game.exploredChunks.has(key);

                const sx = (dx + halfW) * chunkPixels;
                const sy = (dy + halfH) * chunkPixels;

                if (!explored) {
                    ctx.fillStyle = '#0a0a0a';
                    ctx.fillRect(sx, sy, chunkPixels, chunkPixels);
                    continue;
                }

                const wx = cx * CS + CS / 2;
                const wy = cy * CS + CS / 2;
                const biome = World.getBiome(wx, wy);
                ctx.fillStyle = biomeColors[biome] || '#333';
                ctx.fillRect(sx, sy, chunkPixels, chunkPixels);

                // Village marker
                if (World.villages[key]) {
                    ctx.fillStyle = '#f1c40f';
                    ctx.fillRect(sx, sy, chunkPixels, chunkPixels);
                }
            }
        }

        // Player marker
        const ppx = halfW * chunkPixels + Math.floor(chunkPixels / 2);
        const ppy = halfH * chunkPixels + Math.floor(chunkPixels / 2);
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(ppx, ppy, 3, 0, Math.PI * 2);
        ctx.fill();

        // Quest target markers
        Game.quests.forEach(q => {
            if (q.turned_in || !q.targetX) return;
            const qcx = Math.floor(q.targetX / CS) - pcx;
            const qcy = Math.floor(q.targetY / CS) - pcy;
            if (Math.abs(qcx) <= halfW && Math.abs(qcy) <= halfH) {
                const qsx = (qcx + halfW) * chunkPixels + 1;
                const qsy = (qcy + halfH) * chunkPixels + 1;
                ctx.fillStyle = '#e67e22';
                ctx.font = '6px "Press Start 2P"';
                ctx.fillText('?', qsx, qsy + 4);
            }
        });

        // Village teleport list
        const villageDiv = document.getElementById('worldmap-villages');
        if (villageDiv) {
            villageDiv.innerHTML = '';
            const usedWellKeys = [...Game.usedWells];
            if (usedWellKeys.length > 0) {
                villageDiv.innerHTML = '<div style="font-size:8px;color:#2ecc71;margin-bottom:4px">Teleport (studnie):</div>';
                usedWellKeys.forEach(vk => {
                    const v = World.villages[vk];
                    if (!v) return;
                    const btn = document.createElement('button');
                    btn.className = 'use-btn';
                    btn.style.cssText = 'margin:2px;background:#2ecc71;font-size:7px;padding:4px 8px';
                    btn.textContent = `${v.name} (Lv.${v.difficulty})`;
                    btn.onclick = () => {
                        p.x = v.wellX; p.y = v.wellY;
                        p.visualX = v.wellX; p.visualY = v.wellY;
                        Game.lastVillageWell = { x: v.wellX, y: v.wellY };
                        Game.closeAllOverlays();
                        Game.log(`Teleportowano do ${v.name}.`, 'info');
                        GameRender.updateHUD();
                    };
                    villageDiv.appendChild(btn);
                });
            }
        }
    },

    // ========== QUESTS ==========
    openQuests() {
        const content = document.getElementById('dialog-content');
        const title = document.getElementById('dialog-title');
        if (!content || !title) return;

        title.textContent = 'Questy';
        content.innerHTML = '';

        // Main quest
        const mqStage = Game.MAIN_QUEST_STAGES[Game.mainQuestStage];
        if (mqStage) {
            const mqDiv = document.createElement('div');
            mqDiv.className = 'shop-item';
            mqDiv.style.borderColor = '#f1c40f';
            mqDiv.innerHTML = `<div><span style="color:#f1c40f">GŁÓWNY: ${mqStage.title}</span>
                <div style="font-size:7px;color:#e67e22">${mqStage.desc}</div>
                <div style="font-size:7px;color:#888">Postęp: ${Game.mainQuestStage}/${Game.MAIN_QUEST_STAGES.length - 1}</div></div>`;
            content.appendChild(mqDiv);
        }

        if (Game.quests.length === 0 && !mqStage) {
            content.innerHTML += '<div style="font-size:8px;color:#555;text-align:center;padding:20px">Brak aktywnych questów.<br>Porozmawiaj z NPC w wioskach.</div>';
        }

        Game.quests.forEach((q, idx) => {
            const row = document.createElement('div');
            row.className = 'shop-item';
            const statusColor = q.turned_in ? '#555' : q.completed ? '#2ecc71' : '#e67e22';
            const status = q.turned_in ? 'Oddany' : q.completed ? 'Ukończony!' : `${q.progress}/${q.required}`;
            row.innerHTML = `<div><span style="color:${statusColor}">${q.title}</span>
                <div style="font-size:7px;color:#888">${q.desc}</div>
                <div style="font-size:7px;color:#f1c40f">Nagroda: ${q.reward.gold}zł, ${q.reward.xp} XP</div></div>
                <span style="color:${statusColor};font-size:8px">${status}</span>`;
            content.appendChild(row);
        });

        this.showOverlay('dialog-overlay');
    },
};
