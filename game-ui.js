// ============================================================
// GAME UI - Overlays, shops, inventory, death, class selection
// ============================================================

const GameUI = {
    // ========== SIDE PANEL RENDERING (Tibia-style) ==========
    updateSidePanel() {
        this.updateEqPanel();
        this.updateBpPanel();
        this.updateSkillBar();
        this.updateCombatSkills();
    },

    updateEqPanel() {
        const el = document.getElementById('eq-slots');
        if (!el || !Game.player) return;
        const p = Game.player;
        el.innerHTML = '';
        for (const [slot, label] of Object.entries(EQUIP_SLOTS)) {
            const item = p.equipment[slot];
            const div = document.createElement('div');
            div.className = 'eq-slot';
            const tierCol = item?.tier ? (TIERS[item.tier]?.color || '#aaa') : '#333';
            div.innerHTML = `<span class="slot-label">${label}</span>
                <span class="slot-item ${item ? '' : 'slot-empty'}" style="color:${tierCol}">${item ? item.name : '-'}</span>`;
            if (item) {
                div.title = `${item.name}\n${item.desc || ''}`;
                div.onclick = () => {
                    // Unequip to backpack
                    const equippedIds = new Set(Object.values(p.equipment).filter(e => e).map(e => e.id));
                    const backpackCount = p.inventory.filter(i => !equippedIds.has(i.id) || i.type === 'consumable').length;
                    if (backpackCount < 20) {
                        p.equipment[slot] = null;
                        Game.refreshStats();
                        this.updateSidePanel();
                        GameRender.updateHUD();
                    } else {
                        Game.log('Plecak pełny!', 'info');
                    }
                };
            }
            el.appendChild(div);
        }
    },

    updateBpPanel() {
        const grid = document.getElementById('bp-grid');
        const countEl = document.getElementById('bp-count');
        if (!grid || !Game.player) return;
        const p = Game.player;
        const equippedIds = new Set(Object.values(p.equipment).filter(e => e).map(e => e.id));
        const backpackItems = p.inventory.filter(item => !equippedIds.has(item.id) || item.type === 'consumable');

        if (countEl) countEl.textContent = `${backpackItems.length}/20`;
        grid.innerHTML = '';

        for (let i = 0; i < 20; i++) {
            const slot = document.createElement('div');
            slot.className = 'bp-slot';
            const item = backpackItems[i];
            if (item) {
                slot.classList.add('has-item');
                const tierCol = item.tier ? (TIERS[item.tier]?.color || '#aaa') : '#aaa';
                const shortName = item.name.length > 8 ? item.name.slice(0, 7) + '..' : item.name;
                slot.innerHTML = `<span style="color:${tierCol}">${shortName}</span>`;
                if (item.count > 1) slot.innerHTML += `<span class="bp-count">x${item.count}</span>`;
                slot.title = `${item.name}\n${item.desc || ''}`;
                slot.onclick = (e) => {
                    if (item.type === 'consumable') {
                        this.useConsumable(p.inventory.indexOf(item));
                        this.updateSidePanel();
                    } else if (item.type === 'equipment' && canEquip(item, p.classId, p.level)) {
                        p.equipment[item.slot] = item;
                        Game.refreshStats();
                        this.updateSidePanel();
                        GameRender.updateHUD();
                    }
                };
                // Right-click for action menu
                slot.oncontextmenu = (e) => {
                    e.preventDefault();
                    const idx = p.inventory.indexOf(item);
                    if (idx === -1) return;
                    this.showItemActionMenu(item, idx, e.clientX, e.clientY);
                };
            }
            grid.appendChild(slot);
        }
    },

    updateSkillBar() {
        const bar = document.getElementById('skill-bar');
        if (!bar || !Game.player) return;
        const p = Game.player;
        const cls = CLASSES[p.classId];
        bar.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const sid = p.activeSkills[i];
            const sk = sid ? cls.skills.find(s => s.id === sid) : null;
            const lv = sid ? (p.skillLevels[sid] || 1) : 0;
            const slot = document.createElement('div');
            slot.className = 'skill-slot';
            if (sk) {
                const canUse = p.mp >= sk.cost;
                const onCd = Game.skillCooldowns[sid] > 0;
                const cdText = onCd ? ` (${Math.ceil(Game.skillCooldowns[sid])}s)` : '';
                const color = onCd ? '#555' : (canUse ? '#9b59b6' : '#555');
                slot.innerHTML = `<div class="sk-key">[${i+1}]</div><div style="color:${color}">${sk.name}${cdText}</div><div style="color:#888">Lv${lv}</div>`;
            } else {
                slot.innerHTML = `<div class="sk-key">[${i+1}]</div><div style="color:#333">-</div>`;
            }
            bar.appendChild(slot);
        }
    },

    // ========== COMBAT SKILLS PANEL ==========
    updateCombatSkills() {
        const el = document.getElementById('combat-skills');
        if (!el || !Game.player) return;
        const p = Game.player;
        if (!p.combatSkills) return;
        const skills = p.combatSkills;
        const names = { melee: 'Walka', shielding: 'Obrona', magic: 'Magia', distance: 'Dystans' };
        el.innerHTML = '';
        for (const [key, sk] of Object.entries(skills)) {
            const needed = Game.getTriesNeeded(key, sk.level);
            const pct = Math.min(100, (sk.tries / needed) * 100);
            const row = document.createElement('div');
            row.style.cssText = 'display:flex;align-items:center;gap:3px;margin:1px 0;font-size:6px';
            row.innerHTML = `<span style="color:#888;width:36px">${names[key] || key}</span>
                <span style="color:#e67e22;width:16px">${sk.level}</span>
                <div style="flex:1;height:4px;background:#222;border:1px solid #333;border-radius:1px;overflow:hidden">
                    <div style="width:${pct}%;height:100%;background:#e67e22"></div>
                </div>`;
            el.appendChild(row);
        }
    },

    // ========== STAT ALLOCATION PANEL ==========
    openStatAllocation() {
        const content = document.getElementById('dialog-content');
        const title = document.getElementById('dialog-title');
        if (!content || !title) return;
        const p = Game.player;

        title.textContent = `Atrybuty (${p.statPoints || 0} pkt)`;
        content.innerHTML = '';

        const stats = Game.getStats();

        // Current derived stats display
        const derivedDiv = document.createElement('div');
        derivedDiv.style.cssText = 'margin-bottom:10px;font-size:7px;color:#888;line-height:2;border-bottom:1px solid #333;padding-bottom:6px';
        derivedDiv.innerHTML = `<div style="color:#f1c40f;font-size:8px;margin-bottom:4px">Statystyki Pochodne</div>
            HP: <span style="color:#e74c3c">${stats.maxHp}</span> | MP: <span style="color:#9b59b6">${stats.maxMp}</span> |
            DMG: <span style="color:#e67e22">${stats.damage}</span> | Pancerz: <span style="color:#3498db">${stats.armor}</span><br>
            Celność: ${stats.accuracy} | Unik: ${stats.dodge}% | Kryty: ${stats.critChance}% (x${(stats.critMult/100).toFixed(1)})<br>
            Sz.Ataku: +${stats.attackSpeed} | Sz.Ruchu: +${stats.moveSpeed} | CDR: ${stats.cdr}% | Ogłusz: ${stats.stunChance}%`;
        content.appendChild(derivedDiv);

        // Attribute allocation
        const attrDiv = document.createElement('div');
        attrDiv.innerHTML = '<div style="font-size:8px;color:#e67e22;margin-bottom:6px">Przydziel Punkty Atrybutów</div>';

        const attrDescs = {
            str: 'Siła: +2 Obrażenia, +3% Kryty Dmg',
            dex: 'Zręczność: +3 Celność, +1% Kryty',
            agi: 'Zwinność: +2 Ruch, +2 Unik',
            vit: 'Wytrzymałość: +8 HP, +1 Pancerz',
            int: 'Inteligencja: +2% CDR, +5 MP',
        };

        for (const attr of BASE_ATTRIBUTES) {
            const val = (p.attributes || {})[attr] || 0;
            const row = document.createElement('div');
            row.className = 'shop-item';
            row.style.borderColor = 'transparent';
            const canAdd = (p.statPoints || 0) > 0 && val < MAX_STAT_POINTS;
            row.innerHTML = `<div style="flex:1">
                <span style="color:#e67e22">${ATTRIBUTE_NAMES[attr]}</span>
                <span style="color:#f1c40f;margin-left:6px">${val}/${MAX_STAT_POINTS}</span>
                <div style="font-size:6px;color:#666">${attrDescs[attr]}</div>
            </div>`;
            if (canAdd) {
                const btn = document.createElement('button');
                btn.className = 'use-btn';
                btn.style.background = '#2ecc71';
                btn.textContent = '+1';
                btn.onclick = () => {
                    p.attributes[attr] = (p.attributes[attr] || 0) + 1;
                    p.statPoints--;
                    Game.refreshStats();
                    this.openStatAllocation();
                    GameRender.updateHUD();
                };
                row.appendChild(btn);
            }
            attrDiv.appendChild(row);
        }
        content.appendChild(attrDiv);
        this.showOverlay('dialog-overlay');
    },

    // ========== BANK NPC ==========
    openBank() {
        const content = document.getElementById('dialog-content');
        const title = document.getElementById('dialog-title');
        if (!content || !title) return;
        const p = Game.player;

        title.textContent = 'Bank';
        content.innerHTML = '';

        const info = document.createElement('div');
        info.style.cssText = 'text-align:center;font-size:8px;color:#aaa;line-height:2.5;margin-bottom:10px';
        info.innerHTML = `<div>Złoto w portfelu: <span style="color:#f1c40f">${formatCurrency(p.gold)}</span></div>
            <div>Złoto w banku: <span style="color:#2ecc71">${formatCurrency(p.bankGold || 0)}</span></div>`;
        content.appendChild(info);

        // Deposit buttons
        const amounts = [10, 100, 1000, 'all'];
        const depositDiv = document.createElement('div');
        depositDiv.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap;justify-content:center;margin-bottom:8px';
        depositDiv.innerHTML = '<div style="width:100%;text-align:center;font-size:7px;color:#2ecc71;margin-bottom:4px">Wpłać</div>';
        amounts.forEach(amt => {
            const btn = document.createElement('button');
            btn.className = 'use-btn';
            btn.style.background = '#2ecc71';
            const label = amt === 'all' ? 'Wszystko' : formatCurrency(amt);
            btn.textContent = label;
            btn.onclick = () => {
                const real = amt === 'all' ? p.gold : Math.min(amt, p.gold);
                if (real <= 0) return;
                p.gold -= real;
                p.bankGold = (p.bankGold || 0) + real;
                Game.log(`Wpłacono ${formatCurrency(real)} do banku.`, 'shop');
                this.openBank();
                GameRender.updateHUD();
            };
            depositDiv.appendChild(btn);
        });
        content.appendChild(depositDiv);

        // Withdraw buttons
        const withdrawDiv = document.createElement('div');
        withdrawDiv.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap;justify-content:center';
        withdrawDiv.innerHTML = '<div style="width:100%;text-align:center;font-size:7px;color:#f1c40f;margin-bottom:4px">Wypłać</div>';
        amounts.forEach(amt => {
            const btn = document.createElement('button');
            btn.className = 'use-btn';
            btn.style.background = '#f1c40f';
            btn.style.color = '#000';
            const label = amt === 'all' ? 'Wszystko' : formatCurrency(amt);
            btn.textContent = label;
            btn.onclick = () => {
                const bank = p.bankGold || 0;
                const real = amt === 'all' ? bank : Math.min(amt, bank);
                if (real <= 0) return;
                p.bankGold -= real;
                p.gold += real;
                Game.log(`Wypłacono ${formatCurrency(real)} z banku.`, 'shop');
                this.openBank();
                GameRender.updateHUD();
            };
            withdrawDiv.appendChild(btn);
        });
        content.appendChild(withdrawDiv);

        this.showOverlay('dialog-overlay');
    },

    // ========== BESTIARY (B key) ==========
    openBestiary() {
        const content = document.getElementById('dialog-content');
        if (!content) return;
        content.innerHTML = '';
        content.style.cssText = 'max-height:400px;overflow-y:auto;padding:16px';

        const title = document.createElement('h2');
        title.textContent = 'BESTIARIUSZ';
        title.style.cssText = "color:#e67e22;font-size:12px;margin-bottom:12px;font-family:'Press Start 2P',monospace;text-align:center";
        content.appendChild(title);

        // Gather all known monster types from biomes + starter island
        const allMonsters = [];
        for (const biome of ['plains','forest','swamp','mountain','desert','snow']) {
            const pool = World.MONSTERS[biome];
            if (pool) pool.forEach(m => {
                if (!allMonsters.find(a => a.name === m.name)) allMonsters.push({ ...m, biome });
            });
        }
        STARTER_ISLAND.monsters.forEach(m => {
            if (!allMonsters.find(a => a.name === m.name)) allMonsters.push({ ...m, biome: 'wyspa' });
        });

        const discovered = Object.keys(Game.bestiary || {}).length;
        const stats = document.createElement('div');
        stats.style.cssText = "font-size:7px;color:#888;margin-bottom:10px;text-align:center;font-family:'Press Start 2P',monospace";
        stats.textContent = `Odkryto: ${discovered}/${allMonsters.length} gatunków`;
        content.appendChild(stats);

        const grid = document.createElement('div');
        grid.style.cssText = 'display:flex;flex-direction:column;gap:4px';

        for (const m of allMonsters) {
            const entry = Game.bestiary[m.name];
            const row = document.createElement('div');
            row.style.cssText = `display:flex;align-items:center;padding:6px 8px;background:${entry ? '#1a1a3a' : '#111'};border:1px solid ${entry ? '#444' : '#222'};border-radius:4px;gap:8px`;

            const nameEl = document.createElement('div');
            nameEl.style.cssText = `flex:1;font-size:7px;font-family:'Press Start 2P',monospace;color:${entry ? '#fff' : '#555'}`;
            nameEl.textContent = entry ? m.name : '???';

            const detailEl = document.createElement('div');
            detailEl.style.cssText = "font-size:6px;font-family:'Press Start 2P',monospace;color:#888;flex:2";

            if (entry) {
                const kills = entry.kills;
                let info = `Zabito: ${kills}`;
                // Progressive info reveal
                if (kills >= 1) info += ` | HP: ${m.hp}`;
                if (kills >= 5) info += ` | ATK: ${m.atk}`;
                if (kills >= 10) info += ` | PNC: ${m.armor || 0}`;
                if (kills >= 25) info += ` | XP: ${m.xp}`;
                if (kills >= 50) info += ` | ${m.biome}`;
                detailEl.textContent = info;
            } else {
                detailEl.textContent = 'Nieodkryty';
            }

            const killBadge = document.createElement('div');
            killBadge.style.cssText = "font-size:6px;font-family:'Press Start 2P',monospace;min-width:40px;text-align:right";
            if (entry) {
                const kills = entry.kills;
                let badge = '';
                if (kills >= 100) { badge = '💀 Mistrz'; killBadge.style.color = '#ff4444'; }
                else if (kills >= 50) { badge = '⭐ Ekspert'; killBadge.style.color = '#f39c12'; }
                else if (kills >= 25) { badge = '🗡 Łowca'; killBadge.style.color = '#3498db'; }
                else if (kills >= 10) { badge = '📖 Znawca'; killBadge.style.color = '#2ecc71'; }
                else { badge = `${kills}x`; killBadge.style.color = '#666'; }
                killBadge.textContent = badge;
            }

            row.append(nameEl, detailEl, killBadge);
            grid.appendChild(row);
        }
        content.appendChild(grid);

        this.showOverlay('dialog-overlay');
    },

    // ========== ITEM ACTION MENU (right-click context menu) ==========
    showItemActionMenu(item, idx, x, y) {
        // Remove existing menu
        const existing = document.getElementById('item-action-menu');
        if (existing) existing.remove();

        const p = Game.player;
        const menu = document.createElement('div');
        menu.id = 'item-action-menu';
        menu.style.cssText = `position:fixed;left:${x}px;top:${y}px;background:#1a1a2e;border:2px solid #f1c40f;z-index:10000;font-family:"Press Start 2P";font-size:7px;min-width:100px;box-shadow:0 0 10px rgba(0,0,0,0.8)`;

        const actions = [];

        if (item.type === 'equipment' && canEquip(item, p.classId, p.level)) {
            actions.push({ label: 'Załóż', color: '#2ecc71', fn: () => {
                p.equipment[item.slot] = item;
                Game.refreshStats();
                this.updateSidePanel();
                GameRender.updateHUD();
            }});
        }
        if (item.type === 'consumable') {
            actions.push({ label: 'Użyj', color: '#3498db', fn: () => {
                this.useConsumable(idx);
                this.updateSidePanel();
            }});
        }
        if (isStackable(item) && (item.count || 1) > 1) {
            actions.push({ label: 'Podziel', color: '#9b59b6', fn: () => {
                const half = Math.floor((item.count || 1) / 2);
                if (half <= 0) return;
                const equippedIds = new Set(Object.values(p.equipment).filter(e => e).map(e => e.id));
                const bpCount = p.inventory.filter(i => !equippedIds.has(i.id) || i.type === 'consumable').length;
                if (bpCount >= 20) { Game.log('Plecak pełny!', 'info'); return; }
                item.count -= half;
                p.inventory.push({ ...item, count: half });
                this.updateSidePanel();
            }});
        }
        actions.push({ label: 'Wyrzuć', color: '#e74c3c', fn: () => {
            if (item.count > 1) {
                const dropped = { ...item, count: 1 };
                item.count--;
                World.dropGroundLoot(p.x, p.y, [dropped]);
            } else {
                p.inventory.splice(idx, 1);
                for (const s in p.equipment) { if (p.equipment[s]?.id === item.id) p.equipment[s] = null; }
                World.dropGroundLoot(p.x, p.y, [item]);
            }
            Game.refreshStats();
            this.updateSidePanel();
            Game.log(`Wyrzucono: ${item.name}`, 'info');
        }});

        actions.forEach(act => {
            const btn = document.createElement('div');
            btn.style.cssText = `padding:6px 10px;cursor:pointer;color:${act.color};border-bottom:1px solid #333`;
            btn.textContent = act.label;
            btn.onmouseover = () => btn.style.background = '#222';
            btn.onmouseout = () => btn.style.background = 'transparent';
            btn.onclick = () => { menu.remove(); act.fn(); };
            menu.appendChild(btn);
        });

        document.body.appendChild(menu);
        // Close on click outside
        const closeMenu = (e) => { if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('click', closeMenu); } };
        setTimeout(() => document.addEventListener('click', closeMenu), 10);
    },

    // ========== HOUSE BUY DIALOG ==========
    showHouseBuyDialog(houseKey, house) {
        const content = document.getElementById('dialog-content');
        const title = document.getElementById('dialog-title');
        if (!content || !title) return;
        const p = Game.player;

        title.textContent = house.name;
        content.innerHTML = '';

        const info = document.createElement('div');
        info.style.cssText = 'text-align:center;font-size:8px;line-height:2.5;color:#aaa;margin-bottom:12px';
        info.innerHTML = `<div style="color:#f1c40f;font-size:10px;margin-bottom:8px">Na sprzedaż!</div>
            <div>Cena: <span style="color:#f1c40f">${house.price} złota</span></div>
            <div>Twoje złoto: <span style="color:${p.gold >= house.price ? '#2ecc71' : '#e74c3c'}">${p.gold}</span></div>
            <div style="font-size:7px;color:#888;margin-top:8px">Kupując dom możesz przechowywać w nim przedmioty.</div>`;
        content.appendChild(info);

        if (p.gold >= house.price) {
            const buyBtn = document.createElement('button');
            buyBtn.className = 'close-btn';
            buyBtn.style.background = '#2ecc71';
            buyBtn.textContent = 'Kup dom!';
            buyBtn.onclick = () => {
                p.gold -= house.price;
                house.owned = true;
                if (!p.ownedHouses) p.ownedHouses = [];
                p.ownedHouses.push(houseKey);
                Game.log(`Kupiono: ${house.name} za ${house.price} złota!`, 'loot');
                Game.closeAllOverlays();
                GameRender.updateHUD();
                this.updateSidePanel();
            };
            content.appendChild(buyBtn);
        } else {
            const noGold = document.createElement('div');
            noGold.style.cssText = 'text-align:center;font-size:8px;color:#e74c3c;margin-top:8px';
            noGold.textContent = 'Za mało złota!';
            content.appendChild(noGold);
        }

        this.showOverlay('dialog-overlay');
    },

    // ========== GROUND LOOT TOOLTIP ==========
    showLootTooltip(items) {
        const el = document.getElementById('loot-tooltip');
        if (!el) return;
        let html = '<div style="color:#f1c40f;margin-bottom:3px">Przedmioty na ziemi:</div>';
        items.forEach(item => {
            const tierCol = item.tier ? (TIERS[item.tier]?.color || '#aaa') : '#aaa';
            html += `<div style="color:${tierCol}">${item.name}</div>`;
        });
        html += '<div style="color:#888;margin-top:3px">[SPACJA] Podnieś (po jednym)</div>';
        el.innerHTML = html;
        el.style.display = 'block';
        el.style.bottom = '10px';
        el.style.left = '50%';
        el.style.transform = 'translateX(-50%)';
    },

    hideLootTooltip() {
        const el = document.getElementById('loot-tooltip');
        if (el) el.style.display = 'none';
    },

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

    // ========== CONFIRMATION POPUP ==========
    confirmAction(message, onConfirm) {
        // Remove any existing confirm popup
        const existing = document.getElementById('confirm-popup');
        if (existing) existing.remove();

        const popup = document.createElement('div');
        popup.id = 'confirm-popup';
        popup.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1a1a2e;border:2px solid #f1c40f;padding:16px 20px;z-index:10000;font-family:"Press Start 2P";text-align:center;min-width:200px;box-shadow:0 0 20px rgba(0,0,0,0.8)';

        const msg = document.createElement('div');
        msg.style.cssText = 'color:#ddd;font-size:8px;margin-bottom:14px;line-height:1.6';
        msg.textContent = message;
        popup.appendChild(msg);

        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex;gap:10px;justify-content:center';

        const yesBtn = document.createElement('button');
        yesBtn.textContent = 'Tak';
        yesBtn.style.cssText = 'font-family:"Press Start 2P";font-size:8px;padding:6px 16px;background:#2ecc71;color:#000;border:none;cursor:pointer';
        yesBtn.onclick = () => { popup.remove(); onConfirm(); };

        const noBtn = document.createElement('button');
        noBtn.textContent = 'Nie';
        noBtn.style.cssText = 'font-family:"Press Start 2P";font-size:8px;padding:6px 16px;background:#e74c3c;color:#fff;border:none;cursor:pointer';
        noBtn.onclick = () => popup.remove();

        btnRow.appendChild(yesBtn);
        btnRow.appendChild(noBtn);
        popup.appendChild(btnRow);
        document.body.appendChild(popup);
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
            if (id === 'novice') continue; // novice is only for starter island
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
                // Generate center capital chunk to get the well position
                World.getChunk(0, 0);
                const wellX = Math.floor(World.CHUNK_SIZE / 2);
                const wellY = Math.floor(World.CHUNK_SIZE / 2);
                Game.player.x = wellX;
                Game.player.y = wellY;
                Game.player.visualX = wellX;
                Game.player.visualY = wellY;
                Game.lastVillageWell = { x: wellX, y: wellY };
                // Mark starting city well as used
                Game.usedWells.add('0,0');
                Music.updateBiome(0, false, false);
                Game.log(`Wybrano klasę: ${cls.name}!`, 'info');
                Game.log('Witaj w Stolicy! WASD = ruch, SPACJA = interakcja/podnieś, E = atak', 'info');
                Game.log('1-3 = umiejętności, F1/F2 = mikstury HP/MP, I = ekwipunek', 'info');
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
            const ba = cls.baseAttributes;
            statsDiv.innerHTML = `HP:${bs.hp} MP:${bs.mp}<br>DMG:${bs.damage} PNC:${bs.armor}<br>STR:${ba.str} DEX:${ba.dex} AGI:${ba.agi} VIT:${ba.vit} INT:${ba.int}`;

            card.append(icon, name, desc, statsDiv);
            container.appendChild(card);
        }
        el.appendChild(container);
    },

    // ========== CLASS SELECT FROM STARTER ISLAND ==========
    showClassSelectForIsland() {
        const el = document.getElementById('class-select');
        if (!el) return;
        el.style.display = 'flex';
        el.innerHTML = '';

        const title = document.createElement('h1');
        title.textContent = 'WYBIERZ SWOJĄ KLASĘ';
        title.style.cssText = 'font-size:16px;color:#e67e22;margin-bottom:8px;text-shadow:2px 2px 0 #000';
        el.appendChild(title);

        const subtitle = document.createElement('div');
        subtitle.textContent = 'Twoje atrybuty i postęp zostaną zachowane!';
        subtitle.style.cssText = "font-size:8px;color:#aaa;margin-bottom:16px;font-family:'Press Start 2P',monospace";
        el.appendChild(subtitle);

        const container = document.createElement('div');
        container.style.cssText = 'display:flex;gap:16px;flex-wrap:wrap;justify-content:center;max-width:700px';

        for (const [id, cls] of Object.entries(CLASSES)) {
            if (id === 'novice') continue; // skip novice in class selection
            const card = document.createElement('div');
            card.style.cssText = `background:#12122a;border:3px solid ${cls.color};border-radius:8px;padding:16px;width:200px;cursor:pointer;transition:transform 0.15s`;
            card.onmouseover = () => card.style.transform = 'scale(1.05)';
            card.onmouseout = () => card.style.transform = 'scale(1)';
            card.onclick = () => {
                Game.changeClass(id);
                el.style.display = 'none';
                Music.updateBiome(0, false, false);
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
            const ba = cls.baseAttributes;
            statsDiv.innerHTML = `HP:${bs.hp} MP:${bs.mp}<br>DMG:${bs.damage} PNC:${bs.armor}<br>STR:${ba.str} DEX:${ba.dex} AGI:${ba.agi} VIT:${ba.vit} INT:${ba.int}`;

            card.append(icon, name, desc, statsDiv);
            container.appendChild(card);
        }
        el.appendChild(container);
    },

    // ========== DEATH SCREEN ==========
    showDeathScreen(goldLoss, itemsLost) {
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
                ${itemsLost > 0 ? `<div style="color:#e74c3c">Upuszczono ${itemsLost} przedmiotów z plecaka!</div>` : ''}
                <div style="color:#888;font-size:7px;margin-top:8px">Wyposażenie zachowane. Przedmioty z plecaka na miejscu śmierci.</div>
            </div>`;
    },

    // ========== SHOP (with sell functionality) ==========
    openShop(shopType, difficulty) {
        const p = Game.player;
        const cls = CLASSES[p.classId];
        Game.shopType = shopType;
        Game.shopItems = [];
        const title = document.getElementById('dialog-title');

        if (shopType === 'weapon') {
            if (title) title.textContent = 'Sklep z Bronią';
            for (let i = 0; i < 6; i++) {
                const item = generateItemForClass(p.classId, difficulty + Math.floor(Math.random() * 3), 'weapon', 'uncommon');
                if (item) Game.shopItems.push(item);
            }
        } else if (shopType === 'armor') {
            if (title) title.textContent = 'Sklep z Pancerzem';
            const armorSlots = ['head','chest','legs','feet','offhand'];
            armorSlots.forEach(slot => {
                const item = generateItemForClass(p.classId, difficulty + Math.floor(Math.random() * 3), slot, 'uncommon');
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

        // BUY section header
        const buyHeader = document.createElement('div');
        buyHeader.style.cssText = 'font-size:9px;color:#e67e22;margin-bottom:6px;border-bottom:1px solid #333;padding-bottom:4px';
        buyHeader.textContent = 'Kup';
        content.appendChild(buyHeader);

        Game.shopItems.forEach((item, idx) => {
            const div = document.createElement('div');
            div.className = 'shop-item' + (p.gold < item.price ? ' cannot-afford' : '');

            const tierCol = item.tier ? (TIERS[item.tier]?.color || '#aaa') : '#aaa';
            const nameSpan = `<span class="item-name" style="color:${tierCol}">${item.name}</span>`;
            const descSpan = `<div class="item-desc">${item.desc || ''}</div>`;
            const priceSpan = `<span class="item-price">${item.price} zł</span>`;

            let compare = '';
            if (item.slot) {
                const eq = p.equipment[item.slot];
                const compareStats = ['damage','armor','maxHp','maxMp','accuracy','dodge','critChance','attackSpeed','moveSpeed'];
                let parts = [];
                for (const stat of compareStats) {
                    const cur = eq ? (eq.stats ? eq.stats[stat] || 0 : eq[stat] || 0) : 0;
                    const nw = item.stats ? (item.stats[stat] || 0) : (item[stat] || 0);
                    const diff = nw - cur;
                    const name = (ITEM_STAT_POOL.find(s => s.id === stat) || {}).name || stat;
                    if (diff > 0) parts.push(`<span class="stat-up">+${diff} ${name}</span>`);
                    else if (diff < 0) parts.push(`<span class="stat-down">${diff} ${name}</span>`);
                }
                if (parts.length) compare = `<div class="item-compare">${parts.join(' ')}</div>`;
            }

            div.innerHTML = `<div>${nameSpan}${descSpan}${compare}</div>${priceSpan}`;

            if (p.gold >= item.price) {
                div.onclick = () => this.confirmAction(`Kupić ${item.name} za ${item.price} zł?`, () => this.buyItem(idx));
            }
            content.appendChild(div);
        });

        // SELL section - show player's backpack items they can sell
        const equippedIds = new Set(Object.values(p.equipment).filter(e => e).map(e => e.id));
        const backpackItems = p.inventory.filter(item => !equippedIds.has(item.id) || item.type === 'consumable');
        if (backpackItems.length > 0) {
            const sellHeader = document.createElement('div');
            sellHeader.style.cssText = 'font-size:9px;color:#2ecc71;margin:12px 0 6px;border-bottom:1px solid #333;padding-bottom:4px';
            sellHeader.textContent = 'Sprzedaj';
            content.appendChild(sellHeader);

            backpackItems.forEach(item => {
                if (!item.price) return;
                const sellPrice = Math.floor(item.price * 0.25);
                const div = document.createElement('div');
                div.className = 'shop-item';
                const tierCol = item.tier ? (TIERS[item.tier]?.color || '#aaa') : '#aaa';
                const count = item.count > 1 ? ` x${item.count}` : '';
                div.innerHTML = `<div><span class="item-name" style="color:${tierCol}">${item.name}${count}</span>
                    <div class="item-desc">${item.desc || ''}</div></div>
                    <span class="item-price" style="color:#2ecc71">+${sellPrice} zł</span>`;
                div.onclick = () => {
                    this.confirmAction(`Sprzedać ${item.name} za ${sellPrice} zł?`, () => {
                        const idx = p.inventory.indexOf(item);
                        if (idx === -1) return;
                        p.gold += sellPrice;
                        if (Object.values(p.equipment).some(e => e && e.id === item.id)) {
                            for (const s in p.equipment) { if (p.equipment[s]?.id === item.id) p.equipment[s] = null; }
                        }
                        if (item.count > 1) {
                            item.count--;
                        } else {
                            p.inventory.splice(idx, 1);
                        }
                        Game.refreshStats();
                        this.renderShopItems();
                        this.updateSidePanel();
                        GameRender.updateHUD();
                        Game.log(`Sprzedano: ${item.name} za ${sellPrice}zł`, 'shop');
                    });
                };
                content.appendChild(div);
            });
        }
    },

    buyItem(idx) {
        const item = Game.shopItems[idx];
        if (!item || Game.player.gold < item.price) return;

        // Check backpack space
        const p = Game.player;
        const equippedIds = new Set(Object.values(p.equipment).filter(e => e).map(e => e.id));
        const backpackCount = p.inventory.filter(i => !equippedIds.has(i.id) || i.type === 'consumable').length;

        if (item.type === 'consumable') {
            const existing = p.inventory.find(i => i.id === item.id);
            if (existing) {
                existing.count = (existing.count || 1) + 1;
            } else {
                if (backpackCount >= 20) { Game.log('Plecak pełny!', 'info'); return; }
                p.inventory.push({ ...item });
            }
        } else {
            if (backpackCount >= 20) { Game.log('Plecak pełny!', 'info'); return; }
            p.inventory.push(item);
        }

        p.gold -= item.price;
        Game.log(`Kupiono: ${item.name} za ${item.price} zł`, 'shop');
        Game.shopItems.splice(idx, 1);
        this.renderShopItems();
        this.updateSidePanel();
        GameRender.updateHUD();
    },

    // ========== INVENTORY (no sell - only at shops) ==========
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
                btn.onclick = () => { p.equipment[slot] = null; Game.refreshStats(); this.renderInventory(); this.updateSidePanel(); GameRender.updateHUD(); };
                row.appendChild(btn);
            }
            eqDiv.appendChild(row);
        }
        content.appendChild(eqDiv);

        // Backpack items
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

            // Stat comparison for equipment
            if (item.type === 'equipment') {
                const equipped = p.equipment[item.slot];
                const compareStats = ['damage','armor','maxHp','maxMp','accuracy','dodge','critChance','attackSpeed','moveSpeed'];
                let compareHtml = '';
                for (const stat of compareStats) {
                    const cur = equipped ? (equipped.stats ? equipped.stats[stat] || 0 : equipped[stat] || 0) : 0;
                    const nw = item.stats ? (item.stats[stat] || 0) : (item[stat] || 0);
                    const diff = nw - cur;
                    const name = (ITEM_STAT_POOL.find(s => s.id === stat) || {}).name || stat;
                    if (diff > 0) compareHtml += `<span style="color:#2ecc71;font-size:7px;margin-left:4px">+${diff} ${name}</span>`;
                    else if (diff < 0) compareHtml += `<span style="color:#e74c3c;font-size:7px;margin-left:4px">${diff} ${name}</span>`;
                }
                if (compareHtml) {
                    const cmp = document.createElement('span');
                    cmp.innerHTML = compareHtml;
                    row.appendChild(cmp);
                }

                if (canEquip(item, p.classId, p.level)) {
                    const btn = document.createElement('button');
                    btn.className = 'use-btn';
                    btn.textContent = 'Załóż';
                    btn.onclick = () => {
                        p.equipment[item.slot] = item;
                        Game.refreshStats();
                        this.renderInventory();
                        this.updateSidePanel();
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
                btn.onclick = () => { this.useConsumable(idx); this.renderInventory(); };
                row.appendChild(btn);
            }

            // Drop button (drop item on ground)
            const dropBtn = document.createElement('button');
            dropBtn.className = 'use-btn';
            dropBtn.style.background = '#e74c3c';
            dropBtn.textContent = 'Wyrzuć';
            dropBtn.onclick = () => {
                if (item.count > 1) {
                    const dropped = { ...item, count: 1 };
                    item.count--;
                    World.dropGroundLoot(p.x, p.y, [dropped]);
                } else {
                    p.inventory.splice(idx, 1);
                    World.dropGroundLoot(p.x, p.y, [item]);
                }
                Game.refreshStats();
                this.renderInventory();
                this.updateSidePanel();
                Game.log(`Wyrzucono: ${item.name}`, 'info');
            };
            row.appendChild(dropBtn);

            invDiv.appendChild(row);
        });

        // Hint about selling
        const hint = document.createElement('div');
        hint.style.cssText = 'font-size:7px;color:#555;text-align:center;margin-top:8px';
        hint.textContent = 'Sprzedawaj przedmioty u NPC w sklepach.';
        invDiv.appendChild(hint);

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
        this.updateSidePanel();
        GameRender.updateHUD();
    },

    // ========== SKILL TREE (level 25+, 4 passives + 1 skill pattern) ==========
    openSkillTree() {
        const content = document.getElementById('dialog-content');
        const title = document.getElementById('dialog-title');
        if (!content || !title) return;
        const p = Game.player;
        const cls = CLASSES[p.classId];

        // Skill tree only visible from level 25 (retroactive points)
        if (p.level < 25) {
            title.textContent = 'Umiejętności';
            content.innerHTML = '<div style="text-align:center;font-size:8px;color:#888;padding:20px">Drzewko umiejętności odblokuje się na poziomie 25.<br>Obecny poziom: ' + p.level + '</div>';
            this.showOverlay('dialog-overlay');
            return;
        }

        title.textContent = `Umiejętności (${p.skillPoints} pkt)`;
        content.innerHTML = '';

        // Active skill slots
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
        skillsDiv.innerHTML = '<div style="font-size:8px;color:#9b59b6;margin-bottom:6px">Umiejętności Aktywne</div>';
        cls.skills.forEach(sk => {
            const unlocked = p.unlockedSkills.includes(sk.id);
            const lv = p.skillLevels[sk.id] || 0;
            const isActive = p.activeSkills.includes(sk.id);
            const activeSlot = p.activeSkills.indexOf(sk.id);

            const row = document.createElement('div');
            row.className = 'shop-item';
            row.style.opacity = unlocked ? '1' : '0.4';
            row.style.borderColor = isActive ? '#f1c40f' : 'transparent';

            const canUpgrade = unlocked && p.skillPoints >= 1;

            row.innerHTML = `<div style="flex:1"><span style="color:${unlocked ? '#9b59b6' : '#555'}">${sk.name}${lv > 0 ? ` Lv.${lv}` : ''}</span>
                ${isActive ? `<span style="font-size:7px;color:#f1c40f"> [${activeSlot+1}]</span>` : ''}
                <div style="font-size:7px;color:#888">${sk.desc} (${sk.cost} MP)</div>
                <div style="font-size:7px;color:#666">Wymaga: Lv.${sk.level}</div></div>`;

            const btnGroup = document.createElement('div');
            btnGroup.style.cssText = 'display:flex;gap:4px;align-items:center';

            if (unlocked) {
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

        // Passive Tree - scrollable/zoomable canvas
        const treeContainer = document.createElement('div');
        treeContainer.style.cssText = 'margin-top:10px;overflow:auto;max-height:300px;border:1px solid #333;border-radius:4px';
        treeContainer.innerHTML = '<div style="font-size:8px;color:#e67e22;margin-bottom:6px;padding:4px">Drzewko Pasywne (przewijaj myszą)</div>';

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
        treeCanvas.style.cssText = 'display:block;margin:0 auto;image-rendering:auto';
        const tctx = treeCanvas.getContext('2d');
        tctx.fillStyle = '#0a0a1a';
        tctx.fillRect(0, 0, treeW, treeH);

        const trunkX = treeW / 2;
        tctx.strokeStyle = '#5c3a1e';
        tctx.lineWidth = 4;
        tctx.beginPath();
        tctx.moveTo(trunkX, treeH - 10);
        tctx.lineTo(trunkX, 40);
        tctx.stroke();

        const nodePositions = [];

        branches.forEach(([branchKey, branch], bi) => {
            const startX = 40 + bi * hGap;
            const branchColor = bi === 0 ? '#3498db' : '#e74c3c';

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

                if (ni > 0) {
                    tctx.strokeStyle = owned ? '#2ecc71' : '#333';
                    tctx.lineWidth = 2;
                    tctx.beginPath();
                    tctx.moveTo(nx + nodeSize/2, ny - vGap + nodeSize);
                    tctx.lineTo(nx + nodeSize/2, ny);
                    tctx.stroke();
                }

                tctx.fillStyle = owned ? '#2ecc71' : canBuy ? '#e67e22' : '#222';
                tctx.strokeStyle = owned ? '#2ecc71' : canBuy ? '#e67e22' : '#444';
                tctx.lineWidth = 2;
                tctx.beginPath();
                tctx.arc(nx + nodeSize/2, ny + nodeSize/2, nodeSize/2, 0, Math.PI * 2);
                tctx.fill();
                tctx.stroke();

                tctx.fillStyle = '#fff';
                tctx.font = '6px "Press Start 2P"';
                tctx.textAlign = 'center';
                tctx.fillText(node.name.slice(0, 6), nx + nodeSize/2, ny + nodeSize + 10);
                tctx.textAlign = 'left';

                if (owned) {
                    tctx.fillStyle = '#fff';
                    tctx.font = '12px "Press Start 2P"';
                    tctx.textAlign = 'center';
                    tctx.fillText('✓', nx + nodeSize/2, ny + nodeSize/2 + 4);
                    tctx.textAlign = 'left';
                }

                nodePositions.push({ node, nx, ny, owned, canBuy, branchKey });
            });

            tctx.fillStyle = branchColor;
            tctx.font = '7px "Press Start 2P"';
            tctx.textAlign = 'center';
            tctx.fillText(branch.name, startX + nodeSize/2, treeH - 15);
            tctx.textAlign = 'left';
        });

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
        const chunkPixels = 4;
        const halfW = Math.floor(w / chunkPixels / 2);
        const halfH = Math.floor(h / chunkPixels / 2);
        const pcx = Math.floor(p.x / CS);
        const pcy = Math.floor(p.y / CS);

        const biomeColors = { 0: '#4a8c3f', 1: '#2d5a2a', 2: '#556b2f', 3: '#808080', 4: '#daa520' };

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

        // Quest markers
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
