// ============================================================
// GAME COMBAT - Realtime Tibia-style combat, skills, monster AI
// ============================================================

const GameCombat = {
    // ========== REALTIME TICK (called every frame) ==========
    realtimeTick(dt) {
        const p = Game.player;
        if (!p || Game.state !== 'playing') return;
        if (Game.activeOverlay) return;

        // Decrease player cooldowns
        if (Game.walkCooldown > 0) Game.walkCooldown = Math.max(0, Game.walkCooldown - dt);
        if (Game.attackCooldown > 0) Game.attackCooldown = Math.max(0, Game.attackCooldown - dt);

        // Decrease skill cooldowns
        for (const sid in Game.skillCooldowns) {
            Game.skillCooldowns[sid] -= dt;
            if (Game.skillCooldowns[sid] <= 0) delete Game.skillCooldowns[sid];
        }

        // Tick buffs (time-based now)
        Game.combatTimer += dt;
        if (Game.combatTimer >= 1.0) {
            Game.combatTimer -= 1.0;
            this.tickBuffs();
        }

        // Monster AI tick
        this.monsterAI(dt);

        // Auto-attack target if in range
        this.autoAttack(dt);

        // Stealth step counter decays with time
        if (p.stealth && p.stealthSteps <= 0) {
            p.stealth = false;
            Game.log('Niewidzialność się skończyła.', 'info');
        }
    },

    // ========== AUTO-ATTACK ==========
    autoAttack(dt) {
        const p = Game.player;
        if (!p || Game.attackCooldown > 0) return;
        if (p.stealth) return; // Don't auto-attack while stealthed

        const t = Game.autoAttackTarget;
        if (!t || !t.alive) {
            Game.autoAttackTarget = null;
            return;
        }

        const dist = Math.abs(t.x - p.x) + Math.abs(t.y - p.y);
        const cls = CLASSES[p.classId];
        const range = cls.attackRange || 1;

        if (dist > range) {
            Game.autoAttackTarget = null;
            return;
        }

        // Perform auto-attack
        this.playerAttack(t.x, t.y);
        Game.attackCooldown = Game.getAttackSpeed();
    },

    // ========== PLAYER ATTACKS MONSTER ==========
    playerAttack(tx, ty) {
        const p = Game.player;
        const m = World.getMonsterAt(tx, ty);
        if (!m || !m.alive) return false;

        const stats = Game.getStats();
        let dmg = Math.max(1, stats.atk - m.def + Math.floor(Math.random() * 3));

        // Stealth bonus
        if (p.stealth) {
            dmg = Math.floor(dmg * 2.5);
            p.stealth = false;
            p.stealthSteps = 0;
            Game.log('Atak z ukrycia! x2.5 obrażeń!', 'combat');
        }

        // Critical hit
        const critChance = Math.min(0.50, 0.05 + stats.agi * 0.015);
        const critMult = 1.5 + stats.agi * 0.02;
        if (Math.random() < critChance) {
            dmg = Math.floor(dmg * critMult);
            Game.log('Trafienie krytyczne!', 'combat');
        }

        // Mark of Death bonus
        if (m.marked) dmg = Math.floor(dmg * (1 + m.marked));

        // War Cry buff
        const warCry = p.buffs.find(b => b.id === 'war_cry');
        if (warCry) dmg = Math.floor(dmg * (1 + warCry.atkMult));

        m.hp -= dmg;
        Game.log(`Zadajesz ${dmg} obrażeń ${m.name}.`, 'combat');
        this.floatText(`-${dmg}`, m.x, m.y, '#e74c3c');

        // Set auto-attack target
        Game.autoAttackTarget = m;

        if (m.hp <= 0) {
            this.killMonster(m);
            Game.autoAttackTarget = null;
            return true;
        }
        return true;
    },

    // ========== SKILL SYSTEM ==========
    getSkillMult(skill, p) {
        const lv = (p.skillLevels[skill.id] || 1) - 1;
        const base = skill.baseMult || 1;
        const perLv = skill.multPerLv || 0;
        return base + lv * perLv;
    },

    useSkill(skillId, tx, ty) {
        const p = Game.player;
        const cls = CLASSES[p.classId];
        const skill = cls.skills.find(s => s.id === skillId);
        if (!skill) return false;
        if (p.mp < skill.cost) {
            Game.log('Za mało many!', 'info');
            return false;
        }
        // Check cooldown
        if (Game.skillCooldowns[skillId] > 0) {
            Game.log('Umiejętność się ładuje!', 'info');
            return false;
        }

        const stats = Game.getStats();
        const sLv = p.skillLevels[skillId] || 1;
        p.mp -= skill.cost;
        // Set skill cooldown (2-5 seconds based on skill cost)
        Game.skillCooldowns[skillId] = Math.max(1.5, skill.cost * 0.15);

        switch (skillId) {
            // ===== KNIGHT SKILLS =====
            case 'shield_bash': {
                const m = World.getMonsterAt(tx, ty);
                if (!m) return false;
                const mult = this.getSkillMult(skill, p);
                const dmg = Math.max(1, Math.floor(stats.atk * mult) - m.def);
                m.hp -= dmg;
                m.stunDuration = 1.5 + sLv * 0.5;
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
                p.buffs.push({ id: 'iron_skin', duration: 5 + sLv, def: Math.floor(stats.def * 0.5) });
                Game.log(`Żelazna Skóra! +50% DEF na ${5 + sLv}s.`, 'combat');
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
                nearby.forEach(m => { m.stunDuration = 0; m.frozenDuration = 0; });
                Game.log(`Prowokacja! ${nearby.length} wrogów sprowokowani!`, 'combat');
                return true;
            }
            case 'war_cry': {
                const bonus = 0.3 + sLv * 0.05;
                p.buffs.push({ id: 'war_cry', duration: 5 + sLv * 2, atkMult: bonus });
                Game.log(`Okrzyk Wojenny! +${Math.floor(bonus*100)}% ATK!`, 'combat');
                return true;
            }
            case 'shield_wall':
                p.buffs.push({ id: 'shield_wall', duration: 4 + sLv * 2, dmgReduce: 0.8 });
                Game.log(`Mur Tarcz! -80% dmg na ${4 + sLv * 2}s!`, 'combat');
                return true;
            case 'ground_slam': {
                const mult = this.getSkillMult(skill, p);
                const nearby = World.getMonstersNear(p.x, p.y, 2);
                nearby.forEach(m => {
                    const dmg = Math.max(1, Math.floor(stats.atk * mult) - m.def);
                    m.hp -= dmg;
                    m.stunDuration = 2;
                    this.floatText(`-${dmg}`, m.x, m.y, '#e74c3c');
                    if (m.hp <= 0) this.killMonster(m);
                });
                Game.log(`Trzęsienie! ${nearby.length} ogłuszonych!`, 'combat');
                return true;
            }
            case 'last_stand':
                p.buffs.push({ id: 'last_stand', duration: 5 + sLv * 2 });
                Game.log(`Ostatnia Szansa! Nie możesz zginąć przez ${5 + sLv * 2}s!`, 'combat');
                return true;

            // ===== ROGUE SKILLS =====
            case 'stealth': {
                const steps = 8 + (sLv - 1) * 3;
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
                m.poisonDuration = 4 + sLv;
                Game.log(`Zatrute Ostrze! ${dmg} dmg + trucizna ${4+sLv}s!`, 'combat');
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
                nearby.forEach(m => { m.stunDuration = 3 + sLv; });
                Game.log(`Bomba Dymna! Ogłuszono ${nearby.length} wrogów na ${3+sLv}s!`, 'combat');
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
                p.stealthSteps = 8 + sLv * 3;
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
                m.frozenDuration = 2 + sLv;
                Game.log(`Lodowy Pocisk! ${dmg} dmg + zamrożenie!`, 'combat');
                this.floatText(`-${dmg}`, m.x, m.y, '#3498db');
                if (m.hp <= 0) this.killMonster(m);
                return true;
            }
            case 'mana_shield':
                p.buffs.push({ id: 'mana_shield', duration: 5 + sLv * 2 });
                Game.log(`Tarcza Many! Absorbuje dmg za MP na ${5+sLv*2}s!`, 'combat');
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
                    m.frozenDuration = 3 + sLv;
                    const dmg = Math.max(1, Math.floor(stats.atk) - m.def);
                    m.hp -= dmg;
                    this.floatText(`-${dmg}`, m.x, m.y, '#3498db');
                    if (m.hp <= 0) this.killMonster(m);
                });
                Game.log(`Mroźna Nova! Zamrożono ${nearby.length} na ${3+sLv}s!`, 'combat');
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
                nearby.forEach(m => { m.frozenDuration = 4 + sLv * 2; });
                Game.log(`Zatrzymanie Czasu! Zamrożono WSZYSTKO na ${4+sLv*2}s!`, 'combat');
                return true;
            }
        }
        return false;
    },

    // ========== KILL MONSTER ==========
    killMonster(m) {
        m.alive = false;
        m.hp = 0;
        const goldDrop = Math.floor((m.gold[0] + Math.floor(Math.random() * (m.gold[1] - m.gold[0]))) * 0.6);

        // Gold goes to player directly
        Game.player.gold += goldDrop;
        Game.addXp(m.xp);
        Game.killCount++;
        Game.log(`${m.name} pokonany! +${m.xp} XP, +${goldDrop} złota.`, 'loot');
        this.floatText(`+${goldDrop}g`, m.x, m.y, '#f1c40f');

        // Play gold drop sound
        Music.playGoldDrop();

        // Loot drop → ground (Tibia-style: items drop on tile, not to inventory)
        const droppedItems = [];
        if (Math.random() < (m.isElite ? 0.25 : 0.10)) {
            const loot = generateLootForClass(Game.player.classId, m.level);
            if (loot) {
                droppedItems.push(loot);
                Game.log(`${m.name} upuścił: ${loot.name}!`, 'loot');
            }
        }

        // Boss loot
        if (m.isBoss && World.activeDungeon) {
            Game.dungeonBossesKilled.add(World.activeDungeon.type.id);
            Game.log(`Boss pokonany: ${m.name}! Dungeon ukończony!`, 'loot');
            const loot = generateItemForClass(Game.player.classId, m.level + 2, 'weapon');
            if (loot) {
                loot.tier = 'legendary';
                const stat = loot.atk ? 'atk' : loot.def ? 'def' : 'agi';
                loot[stat] = Math.floor(loot[stat] * 1.5);
                loot.name = 'Legendarn' + (loot.name.endsWith('a') ? 'a' : 'y') + ' ' + loot.name;
                droppedItems.push(loot);
                Game.log(`Zdobyto legendę: ${loot.name}!`, 'loot');
            }
        }

        // Drop items on ground
        if (droppedItems.length > 0) {
            World.dropGroundLoot(m.x, m.y, droppedItems);
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
        Game.checkMainQuest();
    },

    // ========== MONSTER AI (realtime) ==========
    monsterAI(dt) {
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
            } else if (dist <= 8) {
                // Wander randomly
                m.moveTimer += dt;
                if (m.moveTimer >= 2.0) {
                    m.moveTimer = 0;
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
        }
    },

    monsterChase(m, p, dx, dy) {
        const moveX = dx !== 0 ? Math.sign(dx) : 0;
        const moveY = dy !== 0 ? Math.sign(dy) : 0;

        // Try direct path
        const nx = m.x + moveX;
        const ny = m.y + moveY;
        if (World.isWalkable(nx, ny) && !(nx === p.x && ny === p.y)) {
            World.moveMonster(m, nx, ny);
        } else if (moveX !== 0 && World.isWalkable(m.x + moveX, m.y) && !(m.x + moveX === p.x && m.y === p.y)) {
            World.moveMonster(m, m.x + moveX, m.y);
        } else if (moveY !== 0 && World.isWalkable(m.x, m.y + moveY) && !(m.x === p.x && m.y + moveY === p.y)) {
            World.moveMonster(m, m.x, m.y + moveY);
        }
    },

    monsterAttackPlayer(m) {
        const p = Game.player;
        const stats = Game.getStats();

        // AGI-based dodge chance
        const dodgeChance = Math.min(0.40, stats.agi * 0.01);
        if (Math.random() < dodgeChance) {
            Game.log(`Unikasz ataku ${m.name}!`, 'combat');
            this.floatText('UNIK!', p.x, p.y, '#2ecc71');
            return;
        }

        let dmg = Math.max(1, m.atk - stats.def + Math.floor(Math.random() * 2));

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
    },

    // Tick player buffs (called once per second)
    tickBuffs() {
        const p = Game.player;
        if (!p) return;
        p.buffs = p.buffs.filter(b => {
            b.duration -= 1;
            return b.duration > 0;
        });
    },

    // Get target tile based on player direction
    getTargetTile() {
        const p = Game.player;
        const dirs = { up: {dx:0,dy:-1}, down: {dx:0,dy:1}, left: {dx:-1,dy:0}, right: {dx:1,dy:0} };
        const d = dirs[p.dir] || {dx:0,dy:1};
        return { x: p.x + d.dx, y: p.y + d.dy };
    },

    getAttackRange() {
        const cls = CLASSES[Game.player.classId];
        return cls.attackRange || 1;
    },

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
