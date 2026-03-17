// ============================================================
// HUD RENDERING - Vitals panel (HP/MP/XP bars in side panel)
// ============================================================

GameRender.updateHUD = function() {
    const p = Game.player;
    if (!p) return;
    const s = Game.getStats();

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    const setW = (id, pct) => { const el = document.getElementById(id); if (el) el.style.width = Math.max(0, Math.min(100, pct)) + '%'; };

    // Vitals panel bars
    const hp = Math.floor(p.hp);
    const mp = Math.floor(p.mp);
    setW('hp-bar', (hp / p.maxHp) * 100);
    setW('mp-bar', (mp / p.maxMp) * 100);
    setW('xp-bar', (p.xp / p.xpToNext) * 100);
    set('hp-text', `HP: ${hp}/${p.maxHp}`);
    set('mp-text', `MP: ${mp}/${p.maxMp}`);
    const xpPct = p.xpToNext > 0 ? Math.floor(p.xp / p.xpToNext * 100) : 0;
    set('xp-text', `XP: ${xpPct}%`);
};
