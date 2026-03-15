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

        // Critical hit (5% base + 1.5% per AGI, max 50%) - crit damage scales with AGI too
        const critChance = Math.min(0.50, 0.05 + stats.agi * 0.015);
        const critMult = 1.5 + stats.agi * 0.02;
        if (Math.random() < critChance) {
            dmg = Math.floor(dmg * critMult);
            Game.log('Trafienie krytyczne!', 'combat');
        }

        // Mark of Death bonus
        if (m.marked) {
            dmg = Math.floor(dmg * (1 + m.marked));
        }

        // War Cry buff
        const warCry = p.buffs.find(b => b.id === 'war_cry');
        if (warCry) dmg = Math.floor(dmg * (1 + warCry.atkMult));

        m.hp -= dmg;
        Game.log(`Zadajesz ${dmg} obrażeń ${m.name}.`, 'combat');
        this.floatText(`-${dmg}`, m.x, m.y, '#e74c3c');

        if (m.hp <= 0) {
            this.killMonster(m);
            return true;
        }
        return true;
    },

    // Get skill multiplier based on level
    getSkillMult(skill, p) {
        const lv = (p.skillLevels[skill.id] || 1) - 1; // extra levels beyond 1
        const base = skill.baseMult || 1;
        const perLv = skill.multPerLv || 0;
        return base + lv * perLv;
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
        const sLv = p.skillLevels[skillId] || 1;
        p.mp -= skill.cost;

        switch (skillId) {
            // ===== KNIGHT SKILLS =====
            case 'shield_bash': {
                const m = World.getMonsterAt(tx, ty);
                if (!m) return false;
                const mult = this.getSkillMult(skill, p);
                const dmg = Math.max(1, Math.floor(stats.atk * mult) - m.def);
                m.hp -= dmg;
                m.stunned = 1 + sLv;
                Game.log(`Uderzenie Tarczą! ${dmg} dmg, ogłuszenie!`, 'combat');
                this.floatText(`-${dmg}`, m.x, m.y, '#e74c3c');
                if (m.hp <= 0) this.killMonster(m);
                return true;
            }
            case 'power_strike': {
                const m = World.getMonsterAt(tx, ty);
                if (!m) return false;
                const mult = this.getSkillMult(skill, p);
                const dmg = Math.max(1, Math.floor(stats.atk * mult) - m.def);
                m.hp -= dmg;
                Game.log(`Potężne Uderzenie! ${dmg} dmg!`, 'combat');
                this.floatText(`-${dmg}`, m.x, m.y, '#e74c3c');
                if (m.hp <= 0) this.killMonster(m);
                return true;
            }
            case 'whirlwind': {
                const mult = this.getSkillMult(skill, p);
                const nearby = World.getMonstersNear(p.x, p.y, 1);
                nearby.forEach(m => {
                    const dmg = Math.max(1, Math.floor(stats.atk * mult) - m.def);
                    m.hp -= dmg;
                    this.floatText(`-${dmg}`, m.x, m.y, '#e74c3c');
                    if (m.hp <= 0) this.killMonster(m);
                });
                Game.log(`Wir Ostrza! Trafiono ${nearby.length} wrogów!`, 'combat');
                return true;
            }
            case 'iron_skin':
                p.buffs.push({ id: 'iron_skin', turns: 3 + sLv, def: Math.floor(stats.def * 0.5) });
                Game.log(`Żelazna Skóra! +50% DEF na ${3 + sLv} tur.`, 'combat');
                return true;
            case 'execute': {
                const m = World.getMonsterAt(tx, ty);
                if (!m) return false;
                const baseMult = this.getSkillMult(skill, p);
                const mult = m.hp / m.maxHp < 0.3 ? baseMult : baseMult * 0.5;
                const dmg = Math.max(1, Math.floor(stats.atk * mult) - m.def);
                m.hp -= dmg;
                Game.log(`Egzekucja! ${dmg} dmg!`, 'combat');
                this.floatText(`-${dmg}`, m.x, m.y, '#e74c3c');
                if (m.hp <= 0) this.killMonster(m);
                return true;
            }
            case 'taunt': {
                const nearby = World.getMonstersNear(p.x, p.y, 4);
                nearby.forEach(m => { m.stunned = 0; m.frozen = 0; }); // Force them to act
                Game.log(`Prowokacja! ${nearby.length} wrogów sprowokowani!`, 'combat');
                return true;
            }
            case 'war_cry': {
                const bonus = 0.3 + sLv * 0.05;
                p.buffs.push({ id: 'war_cry', turns: 3 + sLv, atkMult: bonus });
                Game.log(`Okrzyk Wojenny! +${Math.floor(bonus*100)}% ATK!`, 'combat');
                return true;
            }
            case 'shield_wall':
                p.buffs.push({ id: 'shield_wall', turns: 2 + sLv, dmgReduce: 0.8 });
                Game.log(`Mur Tarcz! -80% dmg na ${2 + sLv} tur!`, 'combat');
                return true;
            case 'ground_slam': {
                const mult = this.getSkillMult(skill, p);
                const nearby = World.getMonstersNear(p.x, p.y, 2);
                nearby.forEach(m => {
                    const dmg = Math.max(1, Math.floor(stats.atk * mult) - m.def);
                    m.hp -= dmg;
                    m.stunned = 2;
                    this.floatText(`-${dmg}`, m.x, m.y, '#e74c3c');
                    if (m.hp <= 0) this.killMonster(m);
                });
                Game.log(`Trzęsienie! ${nearby.length} ogłuszonych!`, 'combat');
                return true;
            }
            case 'last_stand':
                p.buffs.push({ id: 'last_stand', turns: 3 + sLv });
                Game.log(`Ostatnia Szansa! Nie możesz zginąć przez ${3 + sLv} tur!`, 'combat');
                return true;

            // ===== ROGUE SKILLS =====
            case 'stealth': {
                const steps = 5 + (sLv - 1) * 2;
                p.stealth = true;
                p.stealthSteps = steps;
                Game.log(`Niewidzialność! ${steps} kroków.`, 'combat');
                return true;
            }
            case 'backstab': {
                const m = World.getMonsterAt(tx, ty);
                if (!m) return false;
                const mult = this.getSkillMult(skill, p);
                const dmg = Math.max(1, Math.floor(stats.atk * mult) - m.def);
                m.hp -= dmg;
                Game.log(`Cios w Plecy! ${dmg} dmg!`, 'combat');
                this.floatText(`-${dmg}`, m.x, m.y, '#e74c3c');
                if (m.hp <= 0) this.killMonster(m);
                return true;
            }
            case 'poison_blade': {
                const m = World.getMonsterAt(tx, ty);
                if (!m) return false;
                const mult = this.getSkillMult(skill, p);
                const dmg = Math.max(1, Math.floor(stats.atk * mult) - m.def);
                m.hp -= dmg;
                m.poisoned = 3 + sLv;
                Game.log(`Zatrute Ostrze! ${dmg} dmg + trucizna ${3+sLv} tur!`, 'combat');
                this.floatText(`-${dmg}`, m.x, m.y, '#2ecc71');
                if (m.hp <= 0) this.killMonster(m);
                return true;
            }
            case 'shadow_step': {
                const m = World.getMonsterAt(tx, ty);
                if (!m) return false;
                const dirs = [{dx:0,dy:-1},{dx:0,dy:1},{dx:-1,dy:0},{dx:1,dy:0}];
                for (const d of dirs) {
                    const nx = m.x + d.dx, ny = m.y + d.dy;
                    if (World.isWalkable(nx, ny) && !(nx === p.x && ny === p.y)) {
                        p.x = nx; p.y = ny; p.visualX = nx; p.visualY = ny;
                        break;
                    }
                }
                const mult = this.getSkillMult(skill, p);
                const dmg = Math.max(1, Math.floor(stats.atk * mult) - m.def);
                m.hp -= dmg;
                Game.log(`Krok Cienia! ${dmg} dmg!`, 'combat');
                this.floatText(`-${dmg}`, m.x, m.y, '#9b59b6');
                if (m.hp <= 0) this.killMonster(m);
                return true;
            }
            case 'smoke_bomb': {
                const nearby = World.getMonstersNear(p.x, p.y, 2);
                nearby.forEach(m => { m.stunned = 2 + sLv; });
                Game.log(`Bomba Dymna! Ogłuszono ${nearby.length} wrogów na ${2+sLv} tur!`, 'combat');
                return true;
            }
            case 'assassinate': {
                const m = World.getMonsterAt(tx, ty);
                if (!m) return false;
                const baseMult = this.getSkillMult(skill, p);
                const mult = p.stealth ? baseMult : baseMult * 0.5;
                p.stealth = false;
                p.stealthSteps = 0;
                const dmg = Math.max(1, Math.floor(stats.atk * mult) - m.def);
                m.hp -= dmg;
                Game.log(`Zamach! ${dmg} dmg!`, 'combat');
                this.floatText(`-${dmg}`, m.x, m.y, '#e74c3c');
                if (m.hp <= 0) this.killMonster(m);
                return true;
            }
            case 'blade_fury': {
                const mult = this.getSkillMult(skill, p);
                const hitCount = 3 + sLv;
                const nearby = World.getMonstersNear(p.x, p.y, 2);
                for (let i = 0; i < hitCount && nearby.length > 0; i++) {
                    const m = nearby[Math.floor(Math.random() * nearby.length)];
                    if (!m.alive) continue;
                    const dmg = Math.max(1, Math.floor(stats.atk * mult) - m.def);
                    m.hp -= dmg;
                    this.floatText(`-${dmg}`, m.x, m.y, '#e74c3c');
                    if (m.hp <= 0) this.killMonster(m);
                }
                Game.log(`Furia Ostrzy! ${hitCount} uderzeń!`, 'combat');
                return true;
            }
            case 'mark_death': {
                const m = World.getMonsterAt(tx, ty);
                if (!m) return false;
                m.marked = 0.5 + sLv * 0.1;
                Game.log(`Znak Śmierci! +${Math.floor(m.marked*100)}% dmg na ${m.name}!`, 'combat');
                return true;
            }
            case 'vanish': {
                const healPct = 0.2 + sLv * 0.05;
                p.stealth = true;
                p.stealthSteps = 5 + sLv * 2;
                p.hp = Math.min(p.maxHp, p.hp + Math.floor(p.maxHp * healPct));
                Game.log(`Zniknięcie! Niewidzialny + ${Math.floor(healPct*100)}% HP!`, 'combat');
                return true;
            }
            case 'death_blossom': {
                const mult = this.getSkillMult(skill, p);
                const nearby = World.getMonstersNear(p.x, p.y, 3);
                nearby.forEach(m => {
                    const dmg = Math.max(1, Math.floor(stats.atk * mult) - m.def);
                    m.hp -= dmg;
                    this.floatText(`-${dmg}`, m.x, m.y, '#e74c3c');
                    if (m.hp <= 0) this.killMonster(m);
                });
                Game.log(`Kwiat Śmierci! ${nearby.length} trafień!`, 'combat');
                return true;
            }

            // ===== MAGE SKILLS =====
            case 'fireball': {
                const mult = this.getSkillMult(skill, p);
                const targets = World.getMonstersNear(tx, ty, 1);
                targets.forEach(m => {
                    const dmg = Math.max(1, Math.floor(stats.atk * mult) - Math.floor(m.def * 0.5));
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
                const mult = this.getSkillMult(skill, p);
                const dmg = Math.max(1, Math.floor(stats.atk * mult) - Math.floor(m.def * 0.5));
                m.hp -= dmg;
                m.frozen = 2 + sLv;
                Game.log(`Lodowy Pocisk! ${dmg} dmg + zamrożenie!`, 'combat');
                this.floatText(`-${dmg}`, m.x, m.y, '#3498db');
                if (m.hp <= 0) this.killMonster(m);
                return true;
            }
            case 'mana_shield':
                p.buffs.push({ id: 'mana_shield', turns: 3 + sLv });
                Game.log(`Tarcza Many! Absorbuje dmg za MP na ${3+sLv} tur!`, 'combat');
                return true;
            case 'lightning': {
                const m = World.getMonsterAt(tx, ty);
                if (!m) return false;
                const mult = this.getSkillMult(skill, p);
                const dmg = Math.max(1, Math.floor(stats.atk * mult) - Math.floor(m.def * 0.3));
                m.hp -= dmg;
                Game.log(`Błyskawica! ${dmg} dmg!`, 'combat');
                this.floatText(`-${dmg}`, m.x, m.y, '#f1c40f');
                if (m.hp <= 0) this.killMonster(m);
                return true;
            }
            case 'arcane_blast': {
                const mult = this.getSkillMult(skill, p);
                const nearby = World.getMonstersNear(p.x, p.y, 2);
                nearby.forEach(m => {
                    const dmg = Math.max(1, Math.floor(stats.atk * mult) - m.def);
                    m.hp -= dmg;
                    this.floatText(`-${dmg}`, m.x, m.y, '#9b59b6');
                    if (m.hp <= 0) this.killMonster(m);
                });
                Game.log(`Fala Arkany! Trafiono ${nearby.length} wrogów!`, 'combat');
                return true;
            }
            case 'frost_nova': {
                const nearby = World.getMonstersNear(p.x, p.y, 2);
                nearby.forEach(m => {
                    m.frozen = 2 + sLv;
                    const dmg = Math.max(1, Math.floor(stats.atk) - m.def);
                    m.hp -= dmg;
                    this.floatText(`-${dmg}`, m.x, m.y, '#3498db');
                    if (m.hp <= 0) this.killMonster(m);
                });
                Game.log(`Mroźna Nova! Zamrożono ${nearby.length} na ${2+sLv} tur!`, 'combat');
                return true;
            }
            case 'chain_lightning': {
                const mult = this.getSkillMult(skill, p);
                const hitCount = 3 + sLv;
                const nearby = World.getMonstersNear(p.x, p.y, 5);
                const hit = nearby.slice(0, hitCount);
                hit.forEach(m => {
                    const dmg = Math.max(1, Math.floor(stats.atk * mult) - Math.floor(m.def * 0.3));
                    m.hp -= dmg;
                    this.floatText(`-${dmg}`, m.x, m.y, '#f1c40f');
                    if (m.hp <= 0) this.killMonster(m);
                });
                Game.log(`Łańcuch Błyskawic! ${hit.length} trafień!`, 'combat');
                return true;
            }
            case 'teleport': {
                const dist = 5 + sLv;
                const dirs = { up: {dx:0,dy:-1}, down: {dx:0,dy:1}, left: {dx:-1,dy:0}, right: {dx:1,dy:0} };
                const d = dirs[p.dir] || {dx:0,dy:1};
                let nx = p.x, ny = p.y;
                for (let i = 0; i < dist; i++) {
                    const testX = nx + d.dx, testY = ny + d.dy;
                    if (World.isWalkable(testX, testY)) { nx = testX; ny = testY; }
                    else break;
                }
                p.x = nx; p.y = ny; p.visualX = nx; p.visualY = ny;
                Game.log(`Teleportacja! ${dist} kratek!`, 'combat');
                return true;
            }
            case 'meteor': {
                const mult = this.getSkillMult(skill, p);
                const targets = World.getMonstersNear(tx, ty, 2);
                targets.forEach(m => {
                    const dmg = Math.max(1, Math.floor(stats.atk * mult) - Math.floor(m.def * 0.3));
                    m.hp -= dmg;
                    this.floatText(`-${dmg}`, m.x, m.y, '#e74c3c');
                    if (m.hp <= 0) this.killMonster(m);
                });
                Game.log(`Meteor! Trafiono ${targets.length} wrogów!`, 'combat');
                return true;
            }
            case 'time_stop': {
                const nearby = World.getMonstersNear(p.x, p.y, 8);
                nearby.forEach(m => { m.frozen = 3 + sLv; });
                Game.log(`Zatrzymanie Czasu! Zamrożono WSZYSTKO na ${3+sLv} tur!`, 'combat');
                return true;
            }
        }
        return false;
    },

    killMonster(m) {
        m.alive = false;
        m.hp = 0;
        const goldDrop = Math.floor((m.gold[0] + Math.floor(Math.random() * (m.gold[1] - m.gold[0]))) * 0.6);
        Game.player.gold += goldDrop;
        Game.addXp(m.xp);
        Game.killCount++;
        Game.log(`${m.name} pokonany! +${m.xp} XP, +${goldDrop} złota.`, 'loot');
        this.floatText(`+${goldDrop}g`, m.x, m.y, '#f1c40f');

        // Loot drop (10% chance, elites 25%)
        if (Math.random() < (m.isElite ? 0.25 : 0.10)) {
            const loot = generateLootForClass(Game.player.classId, m.level);
            if (loot) {
                Game.player.inventory.push(loot);
                const tierCol = TIERS[loot.tier]?.color || '#aaa';
                Game.log(`Zdobyto: ${loot.name}!`, 'loot');
            }
        }

        // Boss kill tracking
        if (m.isBoss && World.activeDungeon) {
            Game.dungeonBossesKilled.add(World.activeDungeon.type.id);
            Game.log(`Boss pokonany: ${m.name}! Dungeon ukończony!`, 'loot');
            // Drop legendary+ item from bosses
            const loot = generateItemForClass(Game.player.classId, m.level + 2, 'weapon');
            if (loot) {
                loot.tier = 'legendary';
                const mult = TIERS.legendary.mult;
                const stat = loot.atk ? 'atk' : loot.def ? 'def' : 'agi';
                loot[stat] = Math.floor(loot[stat] * 1.5);
                loot.name = 'Legendarn' + (loot.name.endsWith('a') ? 'a' : 'y') + ' ' + loot.name;
                Game.player.inventory.push(loot);
                Game.log(`Zdobyto legendę: ${loot.name}!`, 'loot');
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

        // Check main quest
        Game.checkMainQuest();
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
                // Don't attack stealthed player
                if (p.stealth) continue;

                // Adjacent - attack player
                const stats = Game.getStats();

                // AGI-based dodge chance (1% per AGI point, max 40%)
                const dodgeChance = Math.min(0.40, stats.agi * 0.01);
                if (Math.random() < dodgeChance) {
                    Game.log(`Unikasz ataku ${m.name}!`, 'combat');
                    this.floatText('UNIK!', p.x, p.y, '#2ecc71');
                    continue;
                }

                let dmg = Math.max(1, m.atk - stats.def + Math.floor(Math.random() * 2));

                // Iron skin buff
                const ironSkin = p.buffs.find(b => b.id === 'iron_skin');
                if (ironSkin) dmg = Math.max(1, Math.floor(dmg * 0.6));

                // Shield wall buff
                const shieldWall = p.buffs.find(b => b.id === 'shield_wall');
                if (shieldWall) dmg = Math.max(1, Math.floor(dmg * (1 - shieldWall.dmgReduce)));

                // Mana shield - absorb with MP
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

                if (p.hp <= 0) {
                    const lastStand = p.buffs.find(b => b.id === 'last_stand');
                    if (lastStand) {
                        p.hp = 1;
                        Game.log('Ostatnia Szansa ratuje ci życie!', 'combat');
                    } else {
                        p.hp = 0;
                        Game.die();
                        return;
                    }
                }
            } else if (dist <= 2 && !p.stealth) {
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
