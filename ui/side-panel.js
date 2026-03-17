// ============================================================
// GAME UI - Side panel rendering (stats, backpack)
// No equipment panel or skill bar in side UI anymore
// ============================================================

// Item icons for backpack display
const ITEM_ICONS = {
    // Weapons
    'sword': '&#9876;', 'axe': '&#9876;', 'mace': '&#9876;', 'dagger': '&#128481;',
    'staff': '&#128302;', 'wand': '&#128302;', 'bow': '&#127993;', 'crossbow': '&#127993;',
    // Armor
    'helmet': '&#9937;', 'head': '&#9937;', 'chest': '&#129509;', 'legs': '&#128085;',
    'feet': '&#128095;', 'boots': '&#128095;', 'shield': '&#128737;', 'offhand': '&#128737;',
    // Consumables
    'hp': '&#10084;', 'mp': '&#128156;', 'food': '&#127830;',
    // Currency
    'currency': '&#128176;',
    // Default
    'default': '&#128188;',
};

function getItemIcon(item) {
    if (!item) return '';
    if (item.type === 'currency') return ITEM_ICONS.currency;
    if (item.type === 'consumable') {
        if (item.subtype === 'hp') return ITEM_ICONS.hp;
        if (item.subtype === 'mp') return ITEM_ICONS.mp;
        if (item.subtype === 'food') return ITEM_ICONS.food;
        return ITEM_ICONS.hp;
    }
    if (item.type === 'equipment') {
        if (item.slot === 'weapon') {
            if (item.name && item.name.includes('Łuk')) return ITEM_ICONS.bow;
            if (item.name && item.name.includes('Laska')) return ITEM_ICONS.staff;
            if (item.name && item.name.includes('Różdżk')) return ITEM_ICONS.wand;
            if (item.name && item.name.includes('Sztylet')) return ITEM_ICONS.dagger;
            return ITEM_ICONS.sword;
        }
        if (item.slot === 'head') return ITEM_ICONS.helmet;
        if (item.slot === 'chest') return ITEM_ICONS.chest;
        if (item.slot === 'legs') return ITEM_ICONS.legs;
        if (item.slot === 'feet') return ITEM_ICONS.boots;
        if (item.slot === 'offhand') return ITEM_ICONS.shield;
    }
    return ITEM_ICONS.default;
}

GameUI.updateSidePanel = function() {
    this.updateCharStats();
    this.updateBpPanel();
};

GameUI.updateCharStats = function() {
    const el = document.getElementById('char-stats');
    if (!el || !Game.player) return;
    const p = Game.player;
    const stats = Game.getStats();
    const cls = CLASSES[p.classId];
    const xpPct = p.xpToNext > 0 ? Math.floor(p.xp / p.xpToNext * 100) : 0;
    el.innerHTML = `
        <div style="color:${cls.color};font-size:7px">${cls.name} Lv.${p.level}</div>
        <div style="font-size:6px;color:#888">XP: ${xpPct}% | ${Game.getPlayTime()}</div>
        <div style="font-size:6px;color:#f1c40f">Złoto: ${formatCurrency(p.gold)}</div>
        <div style="font-size:6px">DMG:${stats.damage} PNC:${stats.armor} CEL:${stats.accuracy}</div>
        <div style="font-size:6px">KRIT:${stats.critChance}% UNIK:${stats.dodge}</div>
        <div style="font-size:6px;color:#e67e22">${(p.statPoints || 0) > 0 ? 'Pkt stat: ' + p.statPoints : ''} ${(p.skillPoints || 0) > 0 ? 'Pkt skill: ' + p.skillPoints : ''}</div>
    `;
};

GameUI.updateBpPanel = function() {
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
            const icon = getItemIcon(item);
            const shortName = item.name.length > 6 ? item.name.slice(0, 5) + '..' : item.name;
            slot.innerHTML = `<span class="bp-icon">${icon}</span><span style="color:${tierCol}">${shortName}</span>`;
            if (item.count > 1) slot.innerHTML += `<span class="bp-count">x${item.count}</span>`;
            slot.title = `${item.name}\n${item.desc || ''}`;

            // Stat comparison tooltip for equipment
            if (item.type === 'equipment') {
                const equipped = p.equipment[item.slot];
                const compareStats = ['damage','armor','maxHp','maxMp','accuracy','dodge','critChance'];
                let cmpText = '';
                for (const stat of compareStats) {
                    const cur = equipped ? (equipped.stats ? equipped.stats[stat] || 0 : equipped[stat] || 0) : 0;
                    const nw = item.stats ? (item.stats[stat] || 0) : (item[stat] || 0);
                    const diff = nw - cur;
                    if (diff > 0) cmpText += ` +${diff}${stat.slice(0,3)}`;
                    else if (diff < 0) cmpText += ` ${diff}${stat.slice(0,3)}`;
                }
                if (cmpText) slot.title += '\n' + cmpText.trim();
            }

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
            slot.oncontextmenu = (e) => {
                e.preventDefault();
                const idx = p.inventory.indexOf(item);
                if (idx === -1) return;
                this.showItemActionMenu(item, idx, e.clientX, e.clientY);
            };
        }
        grid.appendChild(slot);
    }
};

// Toggle all panels visibility
GameUI.toggleAllPanels = function() {
    const panels = ['minimap-panel', 'vitals-panel', 'char-panel', 'bp-panel'];
    const anyClosed = panels.some(id => this.closedPanels.has(id));
    if (anyClosed) {
        panels.forEach(id => this.reopenPanel(id));
    } else {
        // Minimize all
        panels.forEach(id => this.closePanel(id));
    }
};

// ========== COMBAT SKILLS PANEL (still used in char stats) ==========
GameUI.updateCombatSkills = function() {
    // No longer rendered in side UI - data available in character panel
};

// ========== GROUND LOOT TOOLTIP ==========
GameUI.showLootTooltip = function(items) {
    const el = document.getElementById('loot-tooltip');
    if (!el) return;
    let html = '<div style="color:#f1c40f;margin-bottom:3px">Na ziemi:</div>';
    items.forEach(item => {
        const tierCol = item.tier ? (TIERS[item.tier]?.color || '#aaa') : '#aaa';
        html += `<div style="color:${tierCol}">${item.name}</div>`;
    });
    html += '<div style="color:#888;margin-top:3px">[SPACJA] Podnie\u015B</div>';
    el.innerHTML = html;
    el.style.display = 'block';
    el.style.bottom = '10px';
    el.style.left = '50%';
    el.style.transform = 'translateX(-50%)';
};

GameUI.hideLootTooltip = function() {
    const el = document.getElementById('loot-tooltip');
    if (el) el.style.display = 'none';
};
