// ============================================================
// GAME UI - Inventory modal: Equipment doll (left) + Backpack (right)
// ============================================================

// Equipment slot icons for the doll
const EQ_SLOT_ICONS = {
    head: '&#9937;',
    chest: '&#129509;',
    legs: '&#128085;',
    feet: '&#128095;',
    weapon: '&#9876;',
    offhand: '&#128737;',
};

GameUI.openInventory = function() {
    this.renderInventory();
    this.showOverlay('inventory-overlay');
};

GameUI.renderInventory = function() {
    const content = document.getElementById('inventory-content');
    if (!content) return;
    content.innerHTML = '';
    const p = Game.player;

    // Main layout: equipment left, backpack right
    const layout = document.createElement('div');
    layout.className = 'inv-layout';

    // ===== LEFT SIDE: Equipment Doll =====
    const eqSide = document.createElement('div');
    eqSide.className = 'inv-eq-side';
    eqSide.innerHTML = '<div style="font-size:8px;color:#f1c40f;margin-bottom:6px;text-align:center">Wyposażenie</div>';

    const doll = document.createElement('div');
    doll.className = 'eq-doll';
    // Character silhouette
    doll.innerHTML = '<div class="eq-char">&#129489;</div>';

    // Equipment slots on the doll
    const slotPositions = {
        head:    'slot-head',
        chest:   'slot-chest',
        legs:    'slot-legs',
        feet:    'slot-feet',
        weapon:  'slot-weapon',
        offhand: 'slot-offhand',
    };

    for (const [slot, posClass] of Object.entries(slotPositions)) {
        const item = p.equipment[slot];
        const slotDiv = document.createElement('div');
        slotDiv.className = `eq-slot-pos ${posClass} ${item ? 'has-item' : ''}`;

        if (item) {
            const tierCol = item.tier ? (TIERS[item.tier]?.color || '#aaa') : '#aaa';
            slotDiv.innerHTML = `<span style="color:${tierCol}">${getItemIcon(item)}</span>`;
            slotDiv.title = `${item.name}\n${item.desc || ''}`;
            slotDiv.onclick = () => {
                // Unequip to backpack
                const equippedIds = new Set(Object.values(p.equipment).filter(e => e).map(e => e.id));
                const backpackCount = p.inventory.filter(i => !equippedIds.has(i.id) || i.type === 'consumable').length;
                if (backpackCount < 20) {
                    p.equipment[slot] = null;
                    Game.refreshStats();
                    this.renderInventory();
                    this.updateSidePanel();
                    GameRender.updateHUD();
                } else {
                    Game.log('Plecak pełny!', 'info');
                }
            };
        } else {
            slotDiv.innerHTML = `<span style="color:#333">${EQ_SLOT_ICONS[slot] || '?'}</span>`;
        }
        // Label under slot
        const label = document.createElement('span');
        label.className = 'eq-label';
        label.textContent = EQUIP_SLOTS[slot] || slot;
        slotDiv.appendChild(label);

        doll.appendChild(slotDiv);
    }

    eqSide.appendChild(doll);

    // Gold display below doll
    const goldDiv = document.createElement('div');
    goldDiv.style.cssText = 'text-align:center;font-size:7px;color:#f1c40f;margin-top:8px';
    goldDiv.innerHTML = `&#128176; ${formatCurrency(p.gold)}`;
    eqSide.appendChild(goldDiv);

    layout.appendChild(eqSide);

    // ===== RIGHT SIDE: Backpack Items =====
    const bpSide = document.createElement('div');
    bpSide.className = 'inv-bp-side';
    bpSide.innerHTML = '<div style="font-size:8px;color:#3498db;margin-bottom:6px">Plecak</div>';

    const equippedIds = new Set(Object.values(p.equipment).filter(e => e).map(e => e.id));
    const backpackItems = p.inventory.map((item, idx) => ({item, idx})).filter(({item}) => !equippedIds.has(item.id) || item.type === 'consumable');

    if (backpackItems.length === 0) {
        bpSide.innerHTML += '<div style="font-size:7px;color:#555;padding:8px">Pusty plecak</div>';
    }

    backpackItems.forEach(({item, idx}) => {
        const row = document.createElement('div');
        row.className = 'inv-item';
        const tierCol = item.tier ? (TIERS[item.tier]?.color || '#aaa') : '#aaa';
        const count = item.count > 1 ? ` x${item.count}` : '';
        const icon = getItemIcon(item);

        row.innerHTML = `<span style="font-size:14px;margin-right:4px">${icon}</span>
            <span style="color:${tierCol};flex:1;font-size:7px">${item.name}${count}</span>`;

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
                if (diff > 0) compareHtml += `<span style="color:#2ecc71;font-size:6px;margin-left:2px">+${diff}</span>`;
                else if (diff < 0) compareHtml += `<span style="color:#e74c3c;font-size:6px;margin-left:2px">${diff}</span>`;
            }
            if (compareHtml) {
                const cmp = document.createElement('span');
                cmp.innerHTML = compareHtml;
                row.appendChild(cmp);
            }

            if (canEquip(item, p.classId, p.level)) {
                const btn = document.createElement('button');
                btn.className = 'use-btn';
                btn.style.background = '#2ecc71';
                btn.textContent = 'Za\u0142\u00f3\u017c';
                btn.onclick = () => {
                    p.equipment[item.slot] = item;
                    Game.refreshStats();
                    this.renderInventory();
                    this.updateSidePanel();
                    GameRender.updateHUD();
                };
                row.appendChild(btn);
            }
        } else if (item.type === 'consumable') {
            const btn = document.createElement('button');
            btn.className = 'use-btn';
            btn.textContent = 'U\u017cyj';
            btn.onclick = () => { this.useConsumable(idx); this.renderInventory(); };
            row.appendChild(btn);
        }

        // Drop button
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

        bpSide.appendChild(row);
    });

    layout.appendChild(bpSide);
    content.appendChild(layout);
};

GameUI.useConsumable = function(idx) {
    const p = Game.player;
    const item = p.inventory[idx];
    if (!item || item.type !== 'consumable') return;

    if (item.subtype === 'hp') {
        const oldHp = Math.floor(p.hp);
        p.hp = Math.min(p.maxHp, Math.floor(p.hp + item.heal));
        Game.log(`U\u017cyto ${item.name}. +${Math.floor(p.hp) - oldHp} HP`, 'heal');
    } else if (item.subtype === 'mp') {
        const oldMp = Math.floor(p.mp);
        p.mp = Math.min(p.maxMp, Math.floor(p.mp + item.mana));
        Game.log(`U\u017cyto ${item.name}. +${Math.floor(p.mp) - oldMp} MP`, 'heal');
    }

    item.count = (item.count || 1) - 1;
    if (item.count <= 0) p.inventory.splice(idx, 1);
    this.updateSidePanel();
    GameRender.updateHUD();
};

// ========== ITEM ACTION MENU (right-click context menu) ==========
GameUI.showItemActionMenu = function(item, idx, x, y) {
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
    info.style.cssText = 'text-align:center;font-size:8px;color:#aaa;line-height:2.5;margin-bottom:12px';
    info.innerHTML = `<div style="color:#f1c40f;font-size:10px;margin-bottom:8px">Na sprzeda\u017c!</div>
        <div>Cena: <span style="color:#f1c40f">${house.price} z\u0142ota</span></div>
        <div>Twoje z\u0142oto: <span style="color:${p.gold >= house.price ? '#2ecc71' : '#e74c3c'}">${p.gold}</span></div>`;
    content.appendChild(info);

    if (p.gold >= house.price) {
        const buyBtn = document.createElement('button');
        buyBtn.className = 'close-btn';
        buyBtn.style.background = '#2ecc71';
        buyBtn.textContent = 'Kup dom!';
        buyBtn.onclick = () => {
            p.gold -= house.price;
            Game.syncGold();
            house.owned = true;
            if (!p.ownedHouses) p.ownedHouses = [];
            p.ownedHouses.push(houseKey);
            Game.log(`Kupiono: ${house.name} za ${house.price} z\u0142ota!`, 'loot');
            Game.closeAllOverlays();
            GameRender.updateHUD();
            this.updateSidePanel();
        };
        content.appendChild(buyBtn);
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
    info.innerHTML = `<div>Portfel: <span style="color:#f1c40f">${formatCurrency(p.gold)}</span></div>
        <div>Bank: <span style="color:#2ecc71">${formatCurrency(p.bankGold || 0)}</span></div>`;
    content.appendChild(info);

    const amounts = [10, 100, 1000, 'all'];
    const depositDiv = document.createElement('div');
    depositDiv.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap;justify-content:center;margin-bottom:8px';
    depositDiv.innerHTML = '<div style="width:100%;text-align:center;font-size:7px;color:#2ecc71;margin-bottom:4px">Wp\u0142a\u0107</div>';
    amounts.forEach(amt => {
        const btn = document.createElement('button');
        btn.className = 'use-btn';
        btn.style.background = '#2ecc71';
        btn.textContent = amt === 'all' ? 'Wszystko' : formatCurrency(amt);
        btn.onclick = () => {
            const real = amt === 'all' ? p.gold : Math.min(amt, p.gold);
            if (real <= 0) return;
            p.gold -= real;
            Game.syncGold();
            p.bankGold = (p.bankGold || 0) + real;
            Game.log(`Wp\u0142acono ${formatCurrency(real)} do banku.`, 'shop');
            this.openBank();
            GameRender.updateHUD();
        };
        depositDiv.appendChild(btn);
    });
    content.appendChild(depositDiv);

    const withdrawDiv = document.createElement('div');
    withdrawDiv.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap;justify-content:center';
    withdrawDiv.innerHTML = '<div style="width:100%;text-align:center;font-size:7px;color:#f1c40f;margin-bottom:4px">Wyp\u0142a\u0107</div>';
    amounts.forEach(amt => {
        const btn = document.createElement('button');
        btn.className = 'use-btn';
        btn.style.background = '#f1c40f';
        btn.style.color = '#000';
        btn.textContent = amt === 'all' ? 'Wszystko' : formatCurrency(amt);
        btn.onclick = () => {
            const bank = p.bankGold || 0;
            const real = amt === 'all' ? bank : Math.min(amt, bank);
            if (real <= 0) return;
            p.bankGold -= real;
            p.gold += real;
            Game.syncGold();
            Game.log(`Wyp\u0142acono ${formatCurrency(real)} z banku.`, 'shop');
            this.openBank();
            GameRender.updateHUD();
        };
        withdrawDiv.appendChild(btn);
    });
    content.appendChild(withdrawDiv);

    this.showOverlay('dialog-overlay');
};
