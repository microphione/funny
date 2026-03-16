// ============================================================
// HUD RENDERING - Stats display and float text
// ============================================================

GameRender.updateHUD = function() {
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
};
