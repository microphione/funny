// ============================================================
// BUFFS - Buff/debuff tick system
// ============================================================

// Tick player buffs (called once per second)
GameCombat.tickBuffs = function() {
    const p = Game.player;
    if (!p) return;
    p.buffs = p.buffs.filter(b => {
        b.duration -= 1;
        return b.duration > 0;
    });
};
