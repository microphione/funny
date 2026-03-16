// ============================================================
// COMBAT CORE - Realtime tick, auto-attack, player attack, kill
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

        // City NPC wandering AI
        this.cityNpcAI(dt);

        // Auto-attack target if in range
        this.autoAttack(dt);

        // Stealth timer (time-based)
        if (p.stealth && p.stealthDuration !== undefined) {
            p.stealthDuration -= dt;
            if (p.stealthDuration <= 0) {
                p.stealth = false;
                p.stealthDuration = 0;
                Game.log('Niewidzialność się skończyła.', 'info');
            }
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
            // Keep target but don't attack until in range
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
        if (p.mounted) { p.mounted = false; Game.log('Zsiadasz z wierzchowca do walki!', 'info'); }

        const stats = Game.getStats();

        // Hit chance: accuracy vs target armor
        // Armor reduces hit chance by 0.1% per point
        const hitChance = Math.max(0.25, 1 - (m.armor || m.def || 0) * 0.001 + stats.accuracy * 0.002);
        if (Math.random() > hitChance) {
            Game.log(`Pudło! ${m.name} unika ataku.`, 'combat');
            this.floatText('PUDŁO', m.x, m.y, '#888');
            Game.autoAttackTarget = m;
            return true;
        }

        // Damage = player damage - monster armor * 0.1
        let dmg = Math.max(1, stats.damage - (m.armor || m.def || 0) * 0.1 + Math.floor(Math.random() * 3));

        // Stealth bonus
        if (p.stealth) {
            dmg = Math.floor(dmg * 2.5);
            p.stealth = false;
            p.stealthDuration = 0;
            Game.log('Atak z ukrycia! x2.5 obrażeń!', 'combat');
        }

        // Critical hit (critChance is percentage, critMult is percentage like 150 = 1.5x)
        if (Math.random() * 100 < stats.critChance) {
            dmg = Math.floor(dmg * stats.critMult / 100);
            Game.log('Trafienie krytyczne!', 'combat');
        }

        // Stun chance
        if (stats.stunChance > 0 && Math.random() * 100 < stats.stunChance) {
            m.stunDuration = (m.stunDuration || 0) + 1;
            Game.log(`${m.name} ogłuszony!`, 'combat');
        }

        // Mark of Death bonus
        if (m.marked) dmg = Math.floor(dmg * (1 + m.marked));

        // War Cry buff
        const warCry = p.buffs.find(b => b.id === 'war_cry');
        if (warCry) dmg = Math.floor(dmg * (1 + warCry.atkMult));

        m.hp -= dmg;
        Game.log(`Zadajesz ${dmg} obrażeń ${m.name}.`, 'combat');
        this.floatText(`-${dmg}`, m.x, m.y, '#e74c3c');

        if (dmg > 0) {
            const skillName = p.classId === 'mage' ? 'magic' :
                              p.classId === 'archer' ? 'distance' : 'melee';
            Game.advanceCombatSkill(skillName);
        }

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

    // Drop a spear on the ground after throwing (archer mechanic)
    dropSpearOnGround(x, y, level) {
        // Find nearby empty spot
        const offsets = [[0,0],[1,0],[-1,0],[0,1],[0,-1]];
        for (const [dx, dy] of offsets) {
            const sx = x + dx, sy = y + dy;
            const key = `${sx},${sy}`;
            if (!World.isTileBlocked(sx, sy)) {
                const spear = generateItem('spear', level, null, 'archer');
                if (spear) {
                    World.dropGroundLoot(sx, sy, [spear]);
                    Game.log('Włócznia wbiła się w ziemię!', 'loot');
                }
                return;
            }
        }
    },

    // ========== KILL MONSTER ==========
    killMonster(m) {
        m.alive = false;
        m.hp = 0;
        const goldDrop = Math.floor((m.gold[0] + Math.floor(Math.random() * (m.gold[1] - m.gold[0]))) * 0.6);

        Game.player.gold += goldDrop;
        Game.syncGold();
        Game.addXp(m.xp);
        Game.killCount++;

        // Bestiary tracking
        const bName = m.baseName || m.name.replace('★ ', '');
        if (!Game.bestiary[bName]) Game.bestiary[bName] = { kills: 0, seen: true };
        Game.bestiary[bName].kills++;
        Game.log(`${m.name} pokonany! +${m.xp} XP, +${formatCurrency(goldDrop)}.`, 'loot');
        this.floatText(`+${goldDrop}g`, m.x, m.y, '#f1c40f');

        Music.playGoldDrop();

        // Predetermined loot from monster loot tables
        const droppedItems = [];
        const dropChance = m.isElite ? 0.25 : 0.10;
        if (Math.random() < dropChance) {
            const loot = generateMonsterLoot(m.baseName || m.name, m.level, Game.player.level);
            if (loot) {
                droppedItems.push(loot);
                Game.log(`${m.name} upuścił: ${loot.name}!`, 'loot');
            }
        }
        // Potion drops from loot table
        const table = MONSTER_LOOT_TABLES[m.baseName || m.name];
        if (table && Math.random() < (table.potionChance || 0)) {
            const pot = generatePotion(m.level);
            droppedItems.push(pot);
        }

        // Boss loot
        if (m.isBoss && World.activeDungeon) {
            Game.dungeonBossesKilled.add(World.activeDungeon.type.id);
            Game.log(`Boss pokonany: ${m.name}! Dungeon ukończony!`, 'loot');
            const maxTier = getMaxTierForLevel(Game.player.level);
            const loot = generateItemForClass(Game.player.classId, m.level + 2, 'weapon', maxTier);
            if (loot) {
                loot.tier = 'legendary';
                if (loot.stats && loot.stats.damage) loot.stats.damage = Math.floor(loot.stats.damage * 1.5);
                loot.name = 'Legendarn' + (loot.name.endsWith('a') ? 'a' : 'y') + ' ' + loot.name;
                droppedItems.push(loot);
                Game.log(`Zdobyto legendę: ${loot.name}!`, 'loot');
            }
        }

        if (droppedItems.length > 0) {
            World.dropGroundLoot(m.x, m.y, droppedItems);
        }

        Game.quests.forEach(q => {
            if (q.completed || q.turned_in) return;
            if (q.type === 'kill' && q.target === (m.baseName || m.name)) {
                q.progress++;
                if (q.progress >= q.required) {
                    q.completed = true;
                    Game.log(`Quest "${q.title}" ukończony! Wróć do zleceniodawcy.`, 'info');
                }
            }
            // Daily quest types
            if (q.type === 'kill_any') {
                q.progress++;
                if (q.progress >= q.required && !q.completed) {
                    q.completed = true;
                    Game.log(`Dzienny quest "${q.title}" ukończony!`, 'info');
                }
            }
            if (q.type === 'kill_elite' && m.isElite) {
                q.progress++;
                if (q.progress >= q.required && !q.completed) {
                    q.completed = true;
                    Game.log(`Dzienny quest "${q.title}" ukończony!`, 'info');
                }
            }
        });

        // Starter island quest tracking
        if (Game.starterIslandQuests) {
            for (const q of STARTER_ISLAND.quests) {
                if (Game.starterIslandQuests[q.id] === 'active' && q.type === 'kill' && q.target === (m.baseName || m.name)) {
                    const key = q.id + '_progress';
                    Game.starterIslandQuests[key] = (Game.starterIslandQuests[key] || 0) + 1;
                    if (Game.starterIslandQuests[key] >= q.count) {
                        Game.log(`Quest "${q.title}" ukończony! Wróć do ${q.npc || 'zleceniodawcy'}.`, 'info');
                    } else {
                        Game.log(`${q.target}: ${Game.starterIslandQuests[key]}/${q.count}`, 'info');
                    }
                }
            }
        }

        World.removeMonster(m);
        Game.checkMainQuest();
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
