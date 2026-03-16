// ============================================================
// SKILLS - Skill execution: Knight and Rogue skills
// ============================================================

GameCombat._skillPreamble = function(skillId) {
    const p = Game.player;
    const cls = CLASSES[p.classId];
    const skill = cls.skills.find(s => s.id === skillId);
    if (!skill) return null;
    if (p.mp < skill.cost) {
        Game.log('Za mało many!', 'info');
        return null;
    }
    // Check cooldown
    if (Game.skillCooldowns[skillId] > 0) {
        Game.log('Umiejętność się ładuje!', 'info');
        return null;
    }

    const stats = Game.getStats();
    const sLv = p.skillLevels[skillId] || 1;
    p.mp -= skill.cost;
    // Set skill cooldown (2-5 seconds based on skill cost, reduced by CDR)
    const baseCd = Math.max(1.5, skill.cost * 0.15);
    Game.skillCooldowns[skillId] = baseCd * Math.max(0.5, 1 - stats.cdr * 0.01);

    // Train magic skill when using any skill (mage) or all classes for their respective skill
    const trainSkill = p.classId === 'mage' ? 'magic' :
                       p.classId === 'archer' ? 'distance' : 'melee';
    Game.advanceCombatSkill(trainSkill);

    return { p, skill, stats, sLv };
};

GameCombat._executeKnightRogueSkill = function(skillId, tx, ty, ctx) {
    const { p, skill, stats, sLv } = ctx;

    switch (skillId) {
        // ===== KNIGHT SKILLS =====
        case 'shield_bash': {
            const m = World.getMonsterAt(tx, ty);
            if (!m) return false;
            const mult = this.getSkillMult(skill, p);
            const dmg = Math.max(1, Math.floor(stats.damage * mult) - (m.armor || m.def || 0));
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
            const dmg = Math.max(1, Math.floor(stats.damage * mult) - (m.armor || m.def || 0));
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
                const dmg = Math.max(1, Math.floor(stats.damage * mult) - (m.armor || m.def || 0));
                m.hp -= dmg;
                this.floatText(`-${dmg}`, m.x, m.y, '#e74c3c');
                if (m.hp <= 0) this.killMonster(m);
            });
            Game.log(`Wir Ostrza! Trafiono ${nearby.length} wrogów!`, 'combat');
            return true;
        }
        case 'iron_skin':
            p.buffs.push({ id: 'iron_skin', duration: 5 + sLv, armorBonus: Math.floor(stats.armor * 0.5) });
            Game.log(`Żelazna Skóra! +50% Pancerz na ${5 + sLv}s.`, 'combat');
            return true;
        case 'execute': {
            const m = World.getMonsterAt(tx, ty);
            if (!m) return false;
            const baseMult = this.getSkillMult(skill, p);
            const mult = m.hp / m.maxHp < 0.3 ? baseMult : baseMult * 0.5;
            const dmg = Math.max(1, Math.floor(stats.damage * mult) - (m.armor || m.def || 0));
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
                const dmg = Math.max(1, Math.floor(stats.damage * mult) - (m.armor || m.def || 0));
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
            const dur = 5 + (sLv - 1) * 2; // seconds
            p.stealth = true;
            p.stealthDuration = dur;
            Game.log(`Niewidzialność! ${dur}s.`, 'combat');
            return true;
        }
        case 'backstab': {
            const m = World.getMonsterAt(tx, ty);
            if (!m) return false;
            const mult = this.getSkillMult(skill, p);
            const dmg = Math.max(1, Math.floor(stats.damage * mult) - (m.armor || m.def || 0));
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
            const dmg = Math.max(1, Math.floor(stats.damage * mult) - (m.armor || m.def || 0));
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
                if (World.isWalkable(nx, ny, p.x, p.y) && !(nx === p.x && ny === p.y)) {
                    p.x = nx; p.y = ny; p.visualX = nx; p.visualY = ny;
                    break;
                }
            }
            const mult = this.getSkillMult(skill, p);
            const dmg = Math.max(1, Math.floor(stats.damage * mult) - (m.armor || m.def || 0));
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
            p.stealthDuration = 0;
            const dmg = Math.max(1, Math.floor(stats.damage * mult) - (m.armor || m.def || 0));
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
                const dmg = Math.max(1, Math.floor(stats.damage * mult) - (m.armor || m.def || 0));
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
            const dur = 6 + sLv * 2; // seconds
            p.stealth = true;
            p.stealthDuration = dur;
            p.hp = Math.min(p.maxHp, p.hp + Math.floor(p.maxHp * healPct));
            Game.log(`Zniknięcie! Niewidzialny ${dur}s + ${Math.floor(healPct*100)}% HP!`, 'combat');
            return true;
        }
        case 'death_blossom': {
            const mult = this.getSkillMult(skill, p);
            const nearby = World.getMonstersNear(p.x, p.y, 3);
            nearby.forEach(m => {
                const dmg = Math.max(1, Math.floor(stats.damage * mult) - (m.armor || m.def || 0));
                m.hp -= dmg;
                this.floatText(`-${dmg}`, m.x, m.y, '#e74c3c');
                if (m.hp <= 0) this.killMonster(m);
            });
            Game.log(`Kwiat Śmierci! ${nearby.length} trafień!`, 'combat');
            return true;
        }

        // ===== HIGH-LEVEL KNIGHT =====
        case 'cleave': {
            const mult = this.getSkillMult(skill, p);
            const nearby = World.getMonstersNear(p.x, p.y, 1.5);
            nearby.forEach(m => {
                const dmg = Math.max(1, Math.floor(stats.damage * mult) - (m.armor || m.def || 0));
                m.hp -= dmg;
                this.floatText(`-${dmg}`, m.x, m.y, '#e74c3c');
                if (m.hp <= 0) this.killMonster(m);
            });
            Game.log(`Rozcięcie! ${nearby.length} trafień!`, 'combat');
            Game.advanceCombatSkill('melee');
            return true;
        }
        case 'blood_rage': {
            const dur = 5 + sLv;
            p.buffs.push({ id: 'blood_rage', duration: dur, atkBonus: 0.4 + sLv * 0.05, defPenalty: 0.2 });
            Game.log(`Krwawa Furia! +ATK, -DEF na ${dur}s!`, 'combat');
            return true;
        }
        case 'impale': {
            const m = World.getMonsterAt(tx, ty);
            if (!m) return false;
            const mult = this.getSkillMult(skill, p);
            const dmg = Math.max(1, Math.floor(stats.damage * mult) - (m.armor || m.def || 0));
            m.hp -= dmg;
            m.bleedDuration = 5;
            m.bleedDamage = Math.floor(dmg * 0.2);
            Game.log(`Nadzianie! ${dmg} dmg + krwawienie!`, 'combat');
            this.floatText(`-${dmg}`, m.x, m.y, '#e74c3c');
            if (m.hp <= 0) this.killMonster(m);
            Game.advanceCombatSkill('melee');
            return true;
        }
        case 'avalanche': {
            const mult = this.getSkillMult(skill, p);
            const nearby = World.getMonstersNear(p.x, p.y, 3);
            nearby.forEach(m => {
                const dmg = Math.max(1, Math.floor(stats.damage * mult) - (m.armor || m.def || 0));
                m.hp -= dmg;
                m.stunDuration = 2;
                this.floatText(`-${dmg}`, m.x, m.y, '#e74c3c');
                if (m.hp <= 0) this.killMonster(m);
            });
            Game.log(`Lawina! ${nearby.length} wrogów ogłuszonych!`, 'combat');
            Game.advanceCombatSkill('melee');
            return true;
        }
        case 'titan_form': {
            const dur = 8 + sLv;
            p.buffs.push({ id: 'titan_form', duration: dur, hpBonus: 1.0, atkBonus: 0.5 });
            Game.log(`Forma Tytana! +100% HP, +50% ATK na ${dur}s!`, 'combat');
            return true;
        }
        // ===== HIGH-LEVEL ROGUE =====
        case 'envenom': {
            const m = World.getMonsterAt(tx, ty);
            if (!m) return false;
            const dur = 6 + sLv;
            m.poisonDuration = dur;
            m.poisonDamage = Math.floor(stats.damage * 0.3);
            Game.log(`Zatruwanie! Trucizna na ${dur}s!`, 'combat');
            Game.advanceCombatSkill('melee');
            return true;
        }
        case 'shadow_dance': {
            const dur = 5 + sLv;
            p.buffs.push({ id: 'shadow_dance', duration: dur, dodgeBonus: 0.6, atkBonus: 0.4 });
            Game.log(`Taniec Cieni! +60% Unik, +40% ATK na ${dur}s!`, 'combat');
            return true;
        }
        case 'kidney_shot': {
            const m = World.getMonsterAt(tx, ty);
            if (!m) return false;
            const mult = this.getSkillMult(skill, p);
            const dmg = Math.max(1, Math.floor(stats.damage * mult) - (m.armor || m.def || 0));
            m.hp -= dmg;
            m.stunDuration = 3;
            Game.log(`Cios Nerkowy! ${dmg} dmg + ogłuszenie!`, 'combat');
            this.floatText(`-${dmg}`, m.x, m.y, '#2ecc71');
            if (m.hp <= 0) this.killMonster(m);
            Game.advanceCombatSkill('melee');
            return true;
        }
        case 'shadow_army': {
            const mult = this.getSkillMult(skill, p);
            const nearby = World.getMonstersNear(p.x, p.y, 3);
            let totalDmg = 0;
            for (let i = 0; i < 3; i++) {
                const target = nearby[Math.floor(Math.random() * nearby.length)];
                if (!target || target.hp <= 0) continue;
                const dmg = Math.max(1, Math.floor(stats.damage * mult));
                target.hp -= dmg;
                totalDmg += dmg;
                this.floatText(`-${dmg}`, target.x, target.y, '#2ecc71');
                if (target.hp <= 0) this.killMonster(target);
            }
            Game.log(`Armia Cieni! Klony zadały ${totalDmg} dmg!`, 'combat');
            Game.advanceCombatSkill('melee');
            return true;
        }
        case 'reaper': {
            const m = World.getMonsterAt(tx, ty);
            if (!m) return false;
            const mult = this.getSkillMult(skill, p);
            const dmg = Math.max(1, Math.floor(stats.damage * mult));
            m.hp -= dmg;
            Game.log(`Żniwiarz! ${dmg} dmg!`, 'combat');
            this.floatText(`-${dmg}`, m.x, m.y, '#2ecc71');
            if (m.hp <= 0) this.killMonster(m);
            // Reset stealth
            p.stealthSteps = 5;
            Game.advanceCombatSkill('melee');
            return true;
        }
    }
    return undefined; // not handled
};

GameCombat.useSkill = function(skillId, tx, ty) {
    const ctx = this._skillPreamble(skillId);
    if (!ctx) return false;

    // Try knight/rogue skills first
    const result = this._executeKnightRogueSkill(skillId, tx, ty, ctx);
    if (result !== undefined) return result;

    // Try mage/archer skills (defined in skills2.js)
    return this._executeMageArcherSkill(skillId, tx, ty, ctx);
};
