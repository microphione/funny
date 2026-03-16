// ============================================================
// GAME UI - Side panel rendering (stats, equipment, backpack, skills)
// ============================================================

GameUI.updateSidePanel = function() {
    this.updateCharStats();
    this.updateEqPanel();
    this.updateBpPanel();
    this.updateSkillBar();
};

GameUI.updateCharStats = function() {
    const el = document.getElementById('char-stats');
    if (!el || !Game.player) return;
    const p = Game.player;
    const stats = Game.getStats();
    const cls = CLASSES[p.classId];
    const xpPct = p.xpToNext > 0 ? Math.floor(p.xp / p.xpToNext * 100) : 0;
    el.innerHTML = `
        <div style="color:${cls.color}">${cls.name} Lv.${p.level}</div>
        <div>XP: ${xpPct}% do Lv.${p.level + 1}</div>
        <div style="color:#f1c40f">Złoto: ${formatCurrency(p.gold)}</div>
        <div>DMG:${stats.damage} PNC:${stats.armor} CEL:${stats.accuracy}</div>
        <div>KRIT:${stats.critChance}% UNIK:${stats.dodge}</div>
        <div>Pkt stat: ${p.statPoints || 0} | Pkt skill: ${p.skillPoints || 0}</div>
    `;
};

GameUI.updateEqPanel = function() {
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
};

GameUI.updateBpPanel = function() {
    const grid = document.getElementById('bp-grid');
    const countEl = document.getElementById('bp-count');
    const goldEl = document.getElementById('bp-gold');
    if (!grid || !Game.player) return;
    const p = Game.player;
    const equippedIds = new Set(Object.values(p.equipment).filter(e => e).map(e => e.id));
    const backpackItems = p.inventory.filter(item => !equippedIds.has(item.id) || item.type === 'consumable');

    if (countEl) countEl.textContent = `${backpackItems.length}/20`;
    if (goldEl) goldEl.textContent = `\u{1F4B0} ${formatCurrency(p.gold)}`;
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
};

GameUI.updateSkillBar = function() {
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
};

// ========== COMBAT SKILLS PANEL ==========
GameUI.updateCombatSkills = function() {
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
};

// ========== GROUND LOOT TOOLTIP ==========
GameUI.showLootTooltip = function(items) {
    const el = document.getElementById('loot-tooltip');
    if (!el) return;
    let html = '<div style="color:#f1c40f;margin-bottom:3px">Przedmioty na ziemi:</div>';
    items.forEach(item => {
        const tierCol = item.tier ? (TIERS[item.tier]?.color || '#aaa') : '#aaa';
        html += `<div style="color:${tierCol}">${item.name}</div>`;
    });
    html += '<div style="color:#888;margin-top:3px">[SPACJA] Podnie\u015B (po jednym)</div>';
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
