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

            // Compare with equipped
            let compare = '';
            if (item.slot && p.equipment[item.slot]) {
                const eq = p.equipment[item.slot];
                const stat = item.atk ? 'atk' : item.def ? 'def' : item.agi ? 'agi' : '';
                if (stat) {
                    const cur = eq[stat] || 0;
                    const nw = item[stat] || 0;
                    const diff = nw - cur;
                    if (diff > 0) compare = `<div class="item-compare"><span class="stat-up">+${diff} ${stat.toUpperCase()}</span></div>`;
                    else if (diff < 0) compare = `<div class="item-compare"><span class="stat-down">${diff} ${stat.toUpperCase()}</span></div>`;
                }
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

        // Inventory items
        const invDiv = document.createElement('div');
        invDiv.innerHTML = '<div style="font-size:9px;color:#3498db;margin-bottom:6px">Plecak</div>';
        if (p.inventory.length === 0) {
            invDiv.innerHTML += '<div style="font-size:7px;color:#555">Pusty</div>';
        }
        p.inventory.forEach((item, idx) => {
            const row = document.createElement('div');
            row.className = 'inv-item';
            const tierCol = item.tier ? (TIERS[item.tier]?.color || '#aaa') : '#aaa';
            const count = item.count > 1 ? ` x${item.count}` : '';
            const equipped = Object.values(p.equipment).some(e => e && e.id === item.id);
            row.innerHTML = `<span style="color:${tierCol};flex:1">${item.name}${count}</span>
                <span style="font-size:7px;color:#888;margin:0 6px">${item.desc || ''}</span>`;

            if (item.type === 'equipment' && !equipped) {
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
                sellBtn.textContent = `${Math.floor(item.price * 0.4)}zł`;
                sellBtn.onclick = () => {
                    p.gold += Math.floor(item.price * 0.4);
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

        // Active skills
        const skillsDiv = document.createElement('div');
        skillsDiv.innerHTML = '<div style="font-size:8px;color:#9b59b6;margin-bottom:6px">Umiejętności Aktywne</div>';
        cls.skills.forEach(sk => {
            const unlocked = p.unlockedSkills.includes(sk.id);
            const row = document.createElement('div');
            row.className = 'shop-item';
            row.style.opacity = unlocked ? '1' : '0.4';
            row.innerHTML = `<div><span style="color:${unlocked ? '#9b59b6' : '#555'}">${sk.name}</span>
                <div style="font-size:7px;color:#888">${sk.desc} (${sk.cost} MP)</div>
                <div style="font-size:7px;color:#666">Wymaga: Lv.${sk.level}</div></div>`;
            skillsDiv.appendChild(row);
        });
        content.appendChild(skillsDiv);

        // Passive tree
        for (const [branchKey, branch] of Object.entries(cls.tree)) {
            const branchDiv = document.createElement('div');
            branchDiv.style.cssText = 'margin-top:10px';
            branchDiv.innerHTML = `<div style="font-size:8px;color:#e67e22;margin-bottom:6px">${branch.name}</div>`;

            branch.nodes.forEach((node, nodeIdx) => {
                const owned = !!p.treeProgress[node.id];
                // Can buy if previous node owned (or first node) and has SP
                const prevOwned = nodeIdx === 0 || p.treeProgress[branch.nodes[nodeIdx - 1].id];
                const canBuy = !owned && prevOwned && p.skillPoints > 0;

                const row = document.createElement('div');
                row.className = 'shop-item';
                row.style.borderColor = owned ? '#2ecc71' : canBuy ? '#e67e22' : 'transparent';
                row.style.opacity = owned || canBuy ? '1' : '0.4';
                row.innerHTML = `<div><span style="color:${owned ? '#2ecc71' : '#fff'}">${node.name}</span>
                    <div style="font-size:7px;color:#888">${node.desc}</div></div>
                    <span style="color:${owned ? '#2ecc71' : '#888'}">${owned ? '✓' : '1 pkt'}</span>`;

                if (canBuy) {
                    row.onclick = () => {
                        p.treeProgress[node.id] = true;
                        p.skillPoints--;
                        Game.refreshStats();
                        this.openSkillTree();
                        GameRender.updateHUD();
                    };
                }
                branchDiv.appendChild(row);
            });
            content.appendChild(branchDiv);
        }

        this.showOverlay('dialog-overlay');
    },

    // ========== QUESTS ==========
    openQuests() {
        const content = document.getElementById('dialog-content');
        const title = document.getElementById('dialog-title');
        if (!content || !title) return;

        title.textContent = 'Questy';
        content.innerHTML = '';

        if (Game.quests.length === 0) {
            content.innerHTML = '<div style="font-size:8px;color:#555;text-align:center;padding:20px">Brak aktywnych questów.<br>Porozmawiaj z NPC w wioskach.</div>';
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
