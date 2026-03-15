// ============================================================
// GAME COMBAT - Turn-based overworld combat, skills, monster AI
// ============================================================

const GameCombat = {
    // Player attacks a monster at given position
    playerAttack(tx, ty) {
        const p = Game.player;
        const m = World.getMonsterAt(tx, ty);
        if (!m || !m.alive) return false;

        const stats = Game.getStats();
        const cls = CLASSES[p.classId];
        let dmg = Math.max(1, stats.atk - m.def + Math.floor(Math.random() * 3));

        // Stealth bonus
        if (p.stealth) {
            dmg = Math.floor(dmg * 2.5);
            p.stealth = false;
            Game.log('Atak z ukrycia! x2.5 obrażeń!', 'combat');
        }

        // Critical hit (10% + agi bonus)
        if (Math.random() < 0.1 + stats.agi * 0.01) {
            dmg = Math.floor(dmg * 1.5);
            Game.log('Trafienie krytyczne!', 'combat');
        }

        m.hp -= dmg;
        Game.log(`Zadajesz ${dmg} obrażeń ${m.name}.`, 'combat');
        this.floatText(`-${dmg}`, m.x, m.y, '#e74c3c');

        if (m.hp <= 0) {
            this.killMonster(m);
            return true;
        }
        return true;
    },

    // Use a skill on a target
    useSkill(skillId, tx, ty) {
        const p = Game.player;
        const cls = CLASSES[p.classId];
        const skill = cls.skills.find(s => s.id === skillId);
        if (!skill) return false;
        if (p.mp < skill.cost) {
            Game.log('Za mało many!', 'info');
            return false;
        }

        const stats = Game.getStats();
        p.mp -= skill.cost;

        switch (skillId) {
            case 'shield_bash': {
                const m = World.getMonsterAt(tx, ty);
                if (!m) return false;
                const dmg = Math.max(1, Math.floor(stats.atk * 1.2) - m.def);
                m.hp -= dmg;
                m.stunned = 2;
                Game.log(`Uderzenie Tarczą! ${dmg} dmg, ogłuszenie!`, 'combat');
                this.floatText(`-${dmg}`, m.x, m.y, '#e74c3c');
                if (m.hp <= 0) this.killMonster(m);
                return true;
            }
            case 'power_strike': {
                const m = World.getMonsterAt(tx, ty);
                if (!m) return false;
                const dmg = Math.max(1, Math.floor(stats.atk * 2) - m.def);
                m.hp -= dmg;
                Game.log(`Potężne Uderzenie! ${dmg} dmg!`, 'combat');
                this.floatText(`-${dmg}`, m.x, m.y, '#e74c3c');
                if (m.hp <= 0) this.killMonster(m);
                return true;
            }
            case 'whirlwind': {
                const nearby = World.getMonstersNear(p.x, p.y, 1);
                nearby.forEach(m => {
                    const dmg = Math.max(1, Math.floor(stats.atk * 1.5) - m.def);
                    m.hp -= dmg;
                    this.floatText(`-${dmg}`, m.x, m.y, '#e74c3c');
                    if (m.hp <= 0) this.killMonster(m);
                });
                Game.log(`Wir Ostrza! Trafiono ${nearby.length} wrogów!`, 'combat');
                return true;
            }
            case 'iron_skin':
                p.buffs.push({ id: 'iron_skin', turns: 3, def: Math.floor(stats.def * 0.5) });
                Game.log('Żelazna Skóra! +50% DEF na 3 tury.', 'combat');
                return true;
            case 'execute': {
                const m = World.getMonsterAt(tx, ty);
                if (!m) return false;
                const mult = m.hp / m.maxHp < 0.3 ? 3 : 1.5;
                const dmg = Math.max(1, Math.floor(stats.atk * mult) - m.def);
                m.hp -= dmg;
                Game.log(`Egzekucja! ${dmg} dmg!`, 'combat');
                this.floatText(`-${dmg}`, m.x, m.y, '#e74c3c');
                if (m.hp <= 0) this.killMonster(m);
                return true;
            }
            case 'stealth':
                p.stealth = true;
                Game.log('Stajesz się niewidzialny! Następny atak x2.5.', 'combat');
                return true;
            case 'backstab': {
                const m = World.getMonsterAt(tx, ty);
                if (!m) return false;
                const dmg = Math.max(1, Math.floor(stats.atk * 2) - m.def);
                m.hp -= dmg;
                Game.log(`Cios w Plecy! ${dmg} dmg!`, 'combat');
                this.floatText(`-${dmg}`, m.x, m.y, '#e74c3c');
                if (m.hp <= 0) this.killMonster(m);
                return true;
            }
            case 'poison_blade': {
                const m = World.getMonsterAt(tx, ty);
                if (!m) return false;
                const dmg = Math.max(1, Math.floor(stats.atk * 1.5) - m.def);
                m.hp -= dmg;
                m.poisoned = 3;
                Game.log(`Zatrute Ostrze! ${dmg} dmg + trucizna!`, 'combat');
                this.floatText(`-${dmg}`, m.x, m.y, '#2ecc71');
                if (m.hp <= 0) this.killMonster(m);
                return true;
            }
            case 'shadow_step': {
                const m = World.getMonsterAt(tx, ty);
                if (!m) return false;
                // Teleport behind
                const dirs = [{dx:0,dy:-1},{dx:0,dy:1},{dx:-1,dy:0},{dx:1,dy:0}];
                for (const d of dirs) {
                    const nx = m.x + d.dx, ny = m.y + d.dy;
                    if (World.isWalkable(nx, ny) && !(nx === p.x && ny === p.y)) {
                        p.x = nx; p.y = ny; p.visualX = nx; p.visualY = ny;
                        break;
                    }
                }
                const dmg = Math.max(1, Math.floor(stats.atk * 2) - m.def);
                m.hp -= dmg;
                Game.log(`Krok Cienia! ${dmg} dmg!`, 'combat');
                this.floatText(`-${dmg}`, m.x, m.y, '#9b59b6');
                if (m.hp <= 0) this.killMonster(m);
                return true;
            }
            case 'assassinate': {
                const m = World.getMonsterAt(tx, ty);
                if (!m) return false;
                const mult = p.stealth ? 4 : 2;
                p.stealth = false;
                const dmg = Math.max(1, Math.floor(stats.atk * mult) - m.def);
                m.hp -= dmg;
                Game.log(`Zamach! ${dmg} dmg!`, 'combat');
                this.floatText(`-${dmg}`, m.x, m.y, '#e74c3c');
                if (m.hp <= 0) this.killMonster(m);
                return true;
            }
            case 'fireball': {
                const targets = World.getMonstersNear(tx, ty, 1);
                targets.forEach(m => {
                    const dmg = Math.max(1, Math.floor(stats.atk * 1.5) - Math.floor(m.def * 0.5));
                    m.hp -= dmg;
                    this.floatText(`-${dmg}`, m.x, m.y, '#e67e22');
                    if (m.hp <= 0) this.killMonster(m);
                });
                Game.log(`Kula Ognia! Trafiono ${targets.length} wrogów!`, 'combat');
                return true;
            }
            case 'ice_bolt': {
                const m = World.getMonsterAt(tx, ty);
                if (!m) return false;
                const dmg = Math.max(1, Math.floor(stats.atk * 2) - Math.floor(m.def * 0.5));
                m.hp -= dmg;
                m.frozen = 2;
                Game.log(`Lodowy Pocisk! ${dmg} dmg + zamrożenie!`, 'combat');
                this.floatText(`-${dmg}`, m.x, m.y, '#3498db');
                if (m.hp <= 0) this.killMonster(m);
                return true;
            }
            case 'lightning': {
                const m = World.getMonsterAt(tx, ty);
                if (!m) return false;
                const dmg = Math.max(1, Math.floor(stats.atk * 2.5) - Math.floor(m.def * 0.3));
                m.hp -= dmg;
                Game.log(`Błyskawica! ${dmg} dmg!`, 'combat');
                this.floatText(`-${dmg}`, m.x, m.y, '#f1c40f');
                if (m.hp <= 0) this.killMonster(m);
                return true;
            }
            case 'frost_nova': {
                const targets = World.getMonstersNear(p.x, p.y, 2);
                targets.forEach(m => {
                    m.frozen = 2;
                    const dmg = Math.max(1, Math.floor(stats.atk) - m.def);
                    m.hp -= dmg;
                    this.floatText(`-${dmg}`, m.x, m.y, '#3498db');
                    if (m.hp <= 0) this.killMonster(m);
                });
                Game.log(`Mroźna Nova! Zamrożono ${targets.length} wrogów!`, 'combat');
                return true;
            }
            case 'meteor': {
                const targets = World.getMonstersNear(tx, ty, 1);
                targets.forEach(m => {
                    const dmg = Math.max(1, Math.floor(stats.atk * 4) - Math.floor(m.def * 0.3));
                    m.hp -= dmg;
                    this.floatText(`-${dmg}`, m.x, m.y, '#e74c3c');
                    if (m.hp <= 0) this.killMonster(m);
                });
                Game.log(`Meteor! Trafiono ${targets.length} wrogów!`, 'combat');
                return true;
            }
        }
        return false;
    },

    killMonster(m) {
        m.alive = false;
        m.hp = 0;
        const goldDrop = m.gold[0] + Math.floor(Math.random() * (m.gold[1] - m.gold[0]));
        Game.player.gold += goldDrop;
        Game.addXp(m.xp);
        Game.killCount++;
        Game.log(`${m.name} pokonany! +${m.xp} XP, +${goldDrop} złota.`, 'loot');
        this.floatText(`+${goldDrop}g`, m.x, m.y, '#f1c40f');

        // Loot drop (30% chance)
        if (Math.random() < 0.3) {
            const loot = generateLootForClass(Game.player.classId, m.level);
            if (loot) {
                Game.player.inventory.push(loot);
                const tierCol = TIERS[loot.tier]?.color || '#aaa';
                Game.log(`Zdobyto: ${loot.name}!`, 'loot');
            }
        }

        // Quest progress
        Game.quests.forEach(q => {
            if (q.type === 'kill' && !q.completed && q.target === m.baseName) {
                q.progress++;
                if (q.progress >= q.required) {
                    q.completed = true;
                    Game.log(`Quest "${q.title}" ukończony! Wróć do zleceniodawcy.`, 'info');
                }
            }
        });

        World.removeMonster(m);
    },

    // Monster AI - called after player turn
    monstersTurn() {
        const p = Game.player;
        const nearby = World.getMonstersNear(p.x, p.y, 8);

        for (const m of nearby) {
            if (!m.alive) continue;

            // Status effects
            if (m.poisoned > 0) {
                const poisonDmg = Math.floor(m.maxHp * 0.05);
                m.hp -= poisonDmg;
                m.poisoned--;
                this.floatText(`-${poisonDmg}`, m.x, m.y, '#2ecc71');
                if (m.hp <= 0) { this.killMonster(m); continue; }
            }
            if (m.stunned > 0) { m.stunned--; continue; }
            if (m.frozen > 0) { m.frozen--; continue; }

            const dx = p.x - m.x;
            const dy = p.y - m.y;
            const dist = Math.abs(dx) + Math.abs(dy);

            if (dist === 1) {
                // Adjacent - attack player
                const stats = Game.getStats();
                let dmg = Math.max(1, m.atk - stats.def + Math.floor(Math.random() * 2));

                // Iron skin buff
                const ironSkin = p.buffs.find(b => b.id === 'iron_skin');
                if (ironSkin) dmg = Math.max(1, Math.floor(dmg * 0.6));

                p.hp -= dmg;
                Game.log(`${m.name} zadaje ci ${dmg} obrażeń!`, 'combat');
                this.floatText(`-${dmg}`, p.x, p.y, '#e74c3c');

                if (p.hp <= 0) {
                    p.hp = 0;
                    Game.die();
                    return;
                }
            } else if (dist <= 2) {
                // Chase player
                const moveX = dx !== 0 ? Math.sign(dx) : 0;
                const moveY = dy !== 0 ? Math.sign(dy) : 0;
                const nx = m.x + moveX;
                const ny = m.y + moveY;
                if (World.isWalkable(nx, ny) && !(nx === p.x && ny === p.y)) {
                    World.moveMonster(m, nx, ny);
                } else if (moveX !== 0) {
                    const ny2 = m.y;
                    if (World.isWalkable(m.x + moveX, ny2) && !(m.x + moveX === p.x && ny2 === p.y))
                        World.moveMonster(m, m.x + moveX, ny2);
                } else if (moveY !== 0) {
                    const nx2 = m.x;
                    if (World.isWalkable(nx2, m.y + moveY) && !(nx2 === p.x && m.y + moveY === p.y))
                        World.moveMonster(m, nx2, m.y + moveY);
                }
            } else if (dist <= 5) {
                // Wander randomly
                if (Math.random() < 0.3) {
                    const dirs = [{dx:0,dy:-1},{dx:0,dy:1},{dx:-1,dy:0},{dx:1,dy:0}];
                    const d = dirs[Math.floor(Math.random() * 4)];
                    const nx = m.x + d.dx, ny = m.y + d.dy;
                    if (World.isWalkable(nx, ny) && !(nx === p.x && ny === p.y)) {
                        World.moveMonster(m, nx, ny);
                    }
                }
            }
        }

        // Tick buffs
        p.buffs = p.buffs.filter(b => {
            b.turns--;
            return b.turns > 0;
        });
    },

    // Get target tile based on player direction
    getTargetTile() {
        const p = Game.player;
        const dirs = { up: {dx:0,dy:-1}, down: {dx:0,dy:1}, left: {dx:-1,dy:0}, right: {dx:1,dy:0} };
        const d = dirs[p.dir] || {dx:0,dy:1};
        return { x: p.x + d.dx, y: p.y + d.dy };
    },

    // Get attack range for current class
    getAttackRange() {
        const cls = CLASSES[Game.player.classId];
        return cls.attackRange || 1;
    },

    // Check if target is in attack range
    isInRange(tx, ty) {
        const p = Game.player;
        return Math.abs(tx - p.x) + Math.abs(ty - p.y) <= this.getAttackRange();
    },

    floatText(text, wx, wy, color) {
        const container = document.getElementById('game-container');
        if (!container) return;
        const TILE = Game.TILE;
        const sx = (wx - Game.cameraX) * TILE;
        const sy = (wy - Game.cameraY) * TILE;
        const el = document.createElement('div');
        el.className = 'float-text';
        el.style.left = sx + 'px';
        el.style.top = sy + 'px';
        el.style.color = color || '#fff';
        el.textContent = text;
        container.appendChild(el);
        setTimeout(() => el.remove(), 1500);
    },
};
