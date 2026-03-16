// ============================================================
// GAME UI - Shop interface (buy/sell)
// ============================================================

GameUI.openShop = function(shopType, difficulty) {
    const p = Game.player;
    const cls = CLASSES[p.classId];
    Game.shopType = shopType;
    Game.shopItems = [];
    const title = document.getElementById('dialog-title');

    if (shopType === 'weapon') {
        if (title) title.textContent = 'Sklep z Broni\u0105';
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
};

GameUI.renderShopItems = function() {
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
        const priceSpan = `<span class="item-price">${item.price} z\u0142</span>`;

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
            div.onclick = () => this.confirmAction(`Kupi\u0107 ${item.name} za ${item.price} z\u0142?`, () => this.buyItem(idx));
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
                <span class="item-price" style="color:#2ecc71">+${sellPrice} z\u0142</span>`;
            div.onclick = () => {
                this.confirmAction(`Sprzeda\u0107 ${item.name} za ${sellPrice} z\u0142?`, () => {
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
                    Game.log(`Sprzedano: ${item.name} za ${sellPrice}z\u0142`, 'shop');
                });
            };
            content.appendChild(div);
        });
    }
};

GameUI.buyItem = function(idx) {
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
            if (backpackCount >= 20) { Game.log('Plecak pe\u0142ny!', 'info'); return; }
            p.inventory.push({ ...item });
        }
    } else {
        if (backpackCount >= 20) { Game.log('Plecak pe\u0142ny!', 'info'); return; }
        p.inventory.push(item);
    }

    p.gold -= item.price;
    Game.log(`Kupiono: ${item.name} za ${item.price} z\u0142`, 'shop');
    Game.shopItems.splice(idx, 1);
    this.renderShopItems();
    this.updateSidePanel();
    GameRender.updateHUD();
};
