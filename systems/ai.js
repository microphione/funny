// ============================================================
// MONSTER AI - Movement, chasing, attacking, city NPC wandering
// ============================================================

// ========== MONSTER AI (realtime) ==========
GameCombat.monsterAI = function(dt) {
    const p = Game.player;
    const nearby = World.getMonstersNear(p.x, p.y, 10);

    for (const m of nearby) {
        if (!m.alive) continue;

        // Initialize realtime timers if not set
        if (m.moveTimer === undefined) m.moveTimer = 0;
        if (m.attackTimer === undefined) m.attackTimer = 0;

        // Status effect timers
        if (m.poisonDuration > 0) {
            m.poisonTimer = (m.poisonTimer || 0) + dt;
            if (m.poisonTimer >= 1.0) {
                m.poisonTimer -= 1.0;
                const poisonDmg = Math.floor(m.maxHp * 0.04);
                m.hp -= poisonDmg;
                this.floatText(`-${poisonDmg}`, m.x, m.y, '#2ecc71');
                if (m.hp <= 0) { this.killMonster(m); continue; }
            }
            m.poisonDuration -= dt;
            if (m.poisonDuration <= 0) { m.poisonDuration = 0; m.poisonTimer = 0; }
        }
        if (m.stunDuration > 0) { m.stunDuration -= dt; continue; }
        if (m.frozenDuration > 0) { m.frozenDuration -= dt; continue; }

        const dx = p.x - m.x;
        const dy = p.y - m.y;
        const dist = Math.abs(dx) + Math.abs(dy);

        // Monster attack speed and move speed scale with level
        const monsterMoveInterval = Math.max(0.3, 0.8 - m.level * 0.01);
        const monsterAttackInterval = Math.max(0.8, 1.8 - m.level * 0.02);

        if (dist === 1 && !p.stealth) {
            // Adjacent - attack player on timer
            m.attackTimer += dt;
            if (m.attackTimer >= monsterAttackInterval) {
                m.attackTimer = 0;
                this.monsterAttackPlayer(m);
            }
        } else if (dist <= 5 && !p.stealth) {
            // Chase player (aggro range 5)
            m.moveTimer += dt;
            if (m.moveTimer >= monsterMoveInterval) {
                m.moveTimer = 0;
                this.monsterChase(m, p, dx, dy);
            }
        } else {
            // Patrol in circles around spawn point (or wander if far)
            m.moveTimer += dt;
            const patrolInterval = 1.5;
            if (m.moveTimer >= patrolInterval) {
                m.moveTimer = 0;
                // Initialize patrol state
                if (!m.spawnX) { m.spawnX = m.x; m.spawnY = m.y; m.patrolAngle = Math.random() * Math.PI * 2; }
                m.patrolAngle = (m.patrolAngle || 0) + 0.8;
                const patrolRadius = 3;
                const targetX = m.spawnX + Math.round(Math.cos(m.patrolAngle) * patrolRadius);
                const targetY = m.spawnY + Math.round(Math.sin(m.patrolAngle) * patrolRadius);
                const mdx = Math.sign(targetX - m.x);
                const mdy = Math.sign(targetY - m.y);
                if (mdx !== 0 || mdy !== 0) {
                    const nx = m.x + mdx;
                    const ny = m.y + mdy;
                    if (World.isWalkable(nx, ny, m.x, m.y) && !(nx === p.x && ny === p.y)) {
                        World.moveMonster(m, nx, ny);
                    }
                }
            }
        }
    }
};

GameCombat.monsterChase = function(m, p, dx, dy) {
    const moveX = dx !== 0 ? Math.sign(dx) : 0;
    const moveY = dy !== 0 ? Math.sign(dy) : 0;

    // Try direct path
    const nx = m.x + moveX;
    const ny = m.y + moveY;
    if (World.isWalkable(nx, ny, m.x, m.y) && !(nx === p.x && ny === p.y)) {
        World.moveMonster(m, nx, ny);
    } else if (moveX !== 0 && World.isWalkable(m.x + moveX, m.y, m.x, m.y) && !(m.x + moveX === p.x && m.y === p.y)) {
        World.moveMonster(m, m.x + moveX, m.y);
    } else if (moveY !== 0 && World.isWalkable(m.x, m.y + moveY, m.x, m.y) && !(m.x === p.x && m.y + moveY === p.y)) {
        World.moveMonster(m, m.x, m.y + moveY);
    }
};

GameCombat.monsterAttackPlayer = function(m) {
    const p = Game.player;
    const stats = Game.getStats();

    // Dodge chance (from dodge stat, each point ~0.5%)
    const dodgeChance = Math.min(0.60, stats.dodge * 0.005);
    if (Math.random() < dodgeChance) {
        Game.log(`Unikasz ataku ${m.name}!`, 'combat');
        this.floatText('UNIK!', p.x, p.y, '#2ecc71');
        return;
    }

    // Armor reduces hit chance by 0.1% per point AND reduces damage by 0.1 per point
    const armorHitReduction = stats.armor * 0.001;
    if (Math.random() < armorHitReduction) {
        Game.log(`Pancerz blokuje atak ${m.name}!`, 'combat');
        this.floatText('BLOK', p.x, p.y, '#3498db');
        Game.advanceCombatSkill('shielding');
        return;
    }

    let dmg = Math.floor(Math.max(1, m.atk - stats.armor * 0.1 + Math.floor(Math.random() * 2)));

    // Iron skin buff
    const ironSkin = p.buffs.find(b => b.id === 'iron_skin');
    if (ironSkin) dmg = Math.max(1, Math.floor(dmg * 0.6));

    // Shield wall buff
    const shieldWall = p.buffs.find(b => b.id === 'shield_wall');
    if (shieldWall) dmg = Math.max(1, Math.floor(dmg * (1 - shieldWall.dmgReduce)));

    // Mana shield
    const manaShield = p.buffs.find(b => b.id === 'mana_shield');
    if (manaShield && p.mp > 0) {
        const absorbed = Math.min(dmg, p.mp);
        p.mp -= absorbed;
        dmg -= absorbed;
        if (dmg < 0) dmg = 0;
    }

    p.hp -= dmg;
    Game.log(`${m.name} zadaje ci ${dmg} obrażeń!`, 'combat');
    this.floatText(`-${dmg}`, p.x, p.y, '#e74c3c');

    Game.advanceCombatSkill('shielding');

    if (p.hp <= 0) {
        const lastStand = p.buffs.find(b => b.id === 'last_stand');
        if (lastStand) {
            p.hp = 1;
            Game.log('Ostatnia Szansa ratuje ci życie!', 'combat');
        } else {
            p.hp = 0;
            Game.die();
        }
    }
};

// ========== CITY NPC WANDERING AI ==========
GameCombat.cityNpcAI = function(dt) {
    const p = Game.player;
    if (!p || World.activeDungeon) return;
    // Only process if player is near capital
    if (Math.abs(p.x) > 30 || Math.abs(p.y) > 30) return;

    for (const key in World.cityNpcs) {
        const npc = World.cityNpcs[key];
        npc.moveTimer += dt;
        if (npc.moveTimer >= npc.moveSpeed) {
            npc.moveTimer = 0;
            // Wander randomly, stay near home
            const dirs = [{dx:0,dy:-1},{dx:0,dy:1},{dx:-1,dy:0},{dx:1,dy:0}];
            const d = dirs[Math.floor(Math.random() * 4)];
            const nx = npc.x + d.dx;
            const ny = npc.y + d.dy;
            // Don't wander too far from home
            const distFromHome = Math.abs(nx - npc.homeX) + Math.abs(ny - npc.homeY);
            if (distFromHome <= 8 && !(nx === p.x && ny === p.y)) {
                World.moveCityNpc(npc, nx, ny);
            }
        }
    }
};
