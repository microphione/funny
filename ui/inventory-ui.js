// ============================================================
// GAME UI - Inventory, equipment, consumables, item actions, house, bank
// ============================================================

GameUI.openInventory = function() {
    this.renderInventory();
    this.showOverlay('inventory-overlay');
};

GameUI.renderInventory = function() {
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
                btn.textContent = 'Za\u0142\u00f3\u017c';
                btn.onclick = () => {
                    p.equipment[item.slot] = item;
                    Game.refreshStats();
                    this.renderInventory();
                    this.updateSidePanel();
                    GameRender.updateHUD();
                };
                row.appendChild(btn);
            } else {
                row.innerHTML += '<span style="font-size:7px;color:#e74c3c">Nie mo\u017cna</span>';
            }
        } else if (item.type === 'consumable') {
            const btn = document.createElement('button');
            btn.className = 'use-btn';
            btn.textContent = 'U\u017cyj';
            btn.onclick = () => { this.useConsumable(idx); this.renderInventory(); };
            row.appendChild(btn);
        }

        // Drop button (drop item on ground)
        const dropBtn = document.createElement('button');
        dropBtn.className = 'use-btn';
        dropBtn.style.background = '#e74c3c';
        dropBtn.textContent = 'Wyrzu\u0107';
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
};

GameUI.useConsumable = function(idx) {
    const p = Game.player;
    const item = p.inventory[idx];
    if (!item || item.type !== 'consumable') return;

    if (item.subtype === 'hp') {
        const oldHp = p.hp;
        p.hp = Math.min(p.maxHp, p.hp + item.heal);
        Game.log(`U\u017cyto ${item.name}. +${p.hp - oldHp} HP`, 'heal');
    } else if (item.subtype === 'mp') {
        const oldMp = p.mp;
        p.mp = Math.min(p.maxMp, p.mp + item.mana);
        Game.log(`U\u017cyto ${item.name}. +${p.mp - oldMp} MP`, 'heal');
    }

    item.count = (item.count || 1) - 1;
    if (item.count <= 0) p.inventory.splice(idx, 1);
    this.updateSidePanel();
    GameRender.updateHUD();
};

// ========== ITEM ACTION MENU (right-click context menu) ==========
GameUI.showItemActionMenu = function(item, idx, x, y) {
    // Remove existing menu
    const existing = document.getElementById('item-action-menu');
    if (existing) existing.remove();

    const p = Game.player;
    const menu = document.createElement('div');
    menu.id = 'item-action-menu';
    menu.style.cssText = `position:fixed;left:${x}px;top:${y}px;background:#1a1a2e;border:2px solid #f1c40f;z-index:10000;font-family:"Press Start 2P";font-size:7px;min-width:100px;box-shadow:0 0 10px rgba(0,0,0,0.8)`;

    const actions = [];

    if (item.type === 'equipment' && canEquip(item, p.classId, p.level)) {
        actions.push({ label: 'Za\u0142\u00f3\u017c', color: '#2ecc71', fn: () => {
            p.equipment[item.slot] = item;
            Game.refreshStats();
            this.updateSidePanel();
            GameRender.updateHUD();
        }});
    }
    if (item.type === 'consumable') {
        actions.push({ label: 'U\u017cyj', color: '#3498db', fn: () => {
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
            if (bpCount >= 20) { Game.log('Plecak pe\u0142ny!', 'info'); return; }
            item.count -= half;
            p.inventory.push({ ...item, count: half });
            this.updateSidePanel();
        }});
    }
    actions.push({ label: 'Wyrzu\u0107', color: '#e74c3c', fn: () => {
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
};

// ========== HOUSE BUY DIALOG ==========
GameUI.showHouseBuyDialog = function(houseKey, house) {
    const content = document.getElementById('dialog-content');
    const title = document.getElementById('dialog-title');
    if (!content || !title) return;
    const p = Game.player;

    title.textContent = house.name;
    content.innerHTML = '';

    const info = document.createElement('div');
    info.style.cssText = 'text-align:center;font-size:8px;line-height:2.5;color:#aaa;margin-bottom:12px';
    info.innerHTML = `<div style="color:#f1c40f;font-size:10px;margin-bottom:8px">Na sprzeda\u017c!</div>
        <div>Cena: <span style="color:#f1c40f">${house.price} z\u0142ota</span></div>
        <div>Twoje z\u0142oto: <span style="color:${p.gold >= house.price ? '#2ecc71' : '#e74c3c'}">${p.gold}</span></div>
        <div style="font-size:7px;color:#888;margin-top:8px">Kupuj\u0105c dom mo\u017cesz przechowywa\u0107 w nim przedmioty.</div>`;
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
            Game.log(`Kupiono: ${house.name} za ${house.price} z\u0142ota!`, 'loot');
            Game.closeAllOverlays();
            GameRender.updateHUD();
            this.updateSidePanel();
        };
        content.appendChild(buyBtn);
    } else {
        const noGold = document.createElement('div');
        noGold.style.cssText = 'text-align:center;font-size:8px;color:#e74c3c;margin-top:8px';
        noGold.textContent = 'Za ma\u0142o z\u0142ota!';
        content.appendChild(noGold);
    }

    this.showOverlay('dialog-overlay');
};

// ========== BANK NPC ==========
GameUI.openBank = function() {
    const content = document.getElementById('dialog-content');
    const title = document.getElementById('dialog-title');
    if (!content || !title) return;
    const p = Game.player;

    title.textContent = 'Bank';
    content.innerHTML = '';

    const info = document.createElement('div');
    info.style.cssText = 'text-align:center;font-size:8px;color:#aaa;line-height:2.5;margin-bottom:10px';
    info.innerHTML = `<div>Z\u0142oto w portfelu: <span style="color:#f1c40f">${formatCurrency(p.gold)}</span></div>
        <div>Z\u0142oto w banku: <span style="color:#2ecc71">${formatCurrency(p.bankGold || 0)}</span></div>`;
    content.appendChild(info);

    // Deposit buttons
    const amounts = [10, 100, 1000, 'all'];
    const depositDiv = document.createElement('div');
    depositDiv.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap;justify-content:center;margin-bottom:8px';
    depositDiv.innerHTML = '<div style="width:100%;text-align:center;font-size:7px;color:#2ecc71;margin-bottom:4px">Wp\u0142a\u0107</div>';
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
            Game.log(`Wp\u0142acono ${formatCurrency(real)} do banku.`, 'shop');
            this.openBank();
            GameRender.updateHUD();
        };
        depositDiv.appendChild(btn);
    });
    content.appendChild(depositDiv);

    // Withdraw buttons
    const withdrawDiv = document.createElement('div');
    withdrawDiv.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap;justify-content:center';
    withdrawDiv.innerHTML = '<div style="width:100%;text-align:center;font-size:7px;color:#f1c40f;margin-bottom:4px">Wyp\u0142a\u0107</div>';
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
            Game.log(`Wyp\u0142acono ${formatCurrency(real)} z banku.`, 'shop');
            this.openBank();
            GameRender.updateHUD();
        };
        withdrawDiv.appendChild(btn);
    });
    content.appendChild(withdrawDiv);

    this.showOverlay('dialog-overlay');
};
