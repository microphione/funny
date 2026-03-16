// ============================================================
// SKILLS2 - Skill execution: Mage and Archer skills
// ============================================================

GameCombat._executeMageArcherSkill = function(skillId, tx, ty, ctx) {
    const { p, skill, stats, sLv } = ctx;

    switch (skillId) {
        // ===== MAGE SKILLS =====
        case 'fireball': {
            const mult = this.getSkillMult(skill, p);
            const targets = World.getMonstersNear(tx, ty, 1);
            targets.forEach(m => {
                const dmg = Math.max(1, Math.floor(stats.damage * mult) - Math.floor((m.armor || m.def || 0) * 0.5));
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
            const dmg = Math.max(1, Math.floor(stats.damage * mult) - Math.floor((m.armor || m.def || 0) * 0.5));
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
            const dmg = Math.max(1, Math.floor(stats.damage * mult) - Math.floor((m.armor || m.def || 0) * 0.3));
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
                const dmg = Math.max(1, Math.floor(stats.damage * mult) - (m.armor || m.def || 0));
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
                const dmg = Math.max(1, Math.floor(stats.damage) - (m.armor || m.def || 0));
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
                const dmg = Math.max(1, Math.floor(stats.damage * mult) - Math.floor((m.armor || m.def || 0) * 0.3));
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
                if (World.isWalkable(testX, testY, nx, ny)) { nx = testX; ny = testY; }
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
                const dmg = Math.max(1, Math.floor(stats.damage * mult) - Math.floor((m.armor || m.def || 0) * 0.3));
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

        // ===== ARCHER SKILLS =====
        case 'aimed_shot': {
            const m = World.getMonsterAt(tx, ty);
            if (!m) return false;
            const mult = this.getSkillMult(skill, p);
            const dmg = Math.max(1, Math.floor(stats.damage * mult) - Math.floor((m.armor || m.def || 0) * 0.5));
            m.hp -= dmg;
            Game.log(`Celny Strzał! ${dmg} dmg!`, 'combat');
            this.floatText(`-${dmg}`, m.x, m.y, '#e67e22');
            if (m.hp <= 0) this.killMonster(m);
            Game.advanceCombatSkill('distance');
            return true;
        }
        case 'multi_shot': {
            const mult = this.getSkillMult(skill, p);
            const targets = World.getMonstersNear(tx, ty, 2).slice(0, 3 + Math.floor(sLv / 2));
            targets.forEach(m => {
                const dmg = Math.max(1, Math.floor(stats.damage * mult) - Math.floor((m.armor || m.def || 0) * 0.5));
                m.hp -= dmg;
                this.floatText(`-${dmg}`, m.x, m.y, '#e67e22');
                if (m.hp <= 0) this.killMonster(m);
            });
            Game.log(`Wielostrzał! Trafiono ${targets.length} celów!`, 'combat');
            Game.advanceCombatSkill('distance');
            return true;
        }
        case 'dodge_roll': {
            const dur = 5 + sLv;
            p.buffs.push({ id: 'dodge_roll', duration: dur, agiBonus: Math.floor(stats.agi * 0.3) });
            Game.log(`Unik! +30% AGI na ${dur}s!`, 'combat');
            return true;
        }
        case 'piercing_arrow': {
            const m = World.getMonsterAt(tx, ty);
            if (!m) return false;
            const mult = this.getSkillMult(skill, p);
            const dmg = Math.max(1, Math.floor(stats.damage * mult)); // ignores DEF
            m.hp -= dmg;
            Game.log(`Przebijający Strzał! ${dmg} dmg (ignoruje pancerz)!`, 'combat');
            this.floatText(`-${dmg}`, m.x, m.y, '#e67e22');
            if (m.hp <= 0) this.killMonster(m);
            Game.advanceCombatSkill('distance');
            return true;
        }
        case 'rain_arrows': {
            const mult = this.getSkillMult(skill, p);
            const targets = World.getMonstersNear(tx, ty, 2);
            targets.forEach(m => {
                const dmg = Math.max(1, Math.floor(stats.damage * mult) - Math.floor((m.armor || m.def || 0) * 0.3));
                m.hp -= dmg;
                this.floatText(`-${dmg}`, m.x, m.y, '#e67e22');
                if (m.hp <= 0) this.killMonster(m);
            });
            Game.log(`Deszcz Strzał! Trafiono ${targets.length} wrogów!`, 'combat');
            Game.advanceCombatSkill('distance');
            return true;
        }
        case 'spear_throw': {
            const m = World.getMonsterAt(tx, ty);
            if (!m) return false;
            const mult = this.getSkillMult(skill, p);
            const dmg = Math.max(1, Math.floor(stats.damage * mult) - (m.armor || m.def || 0));
            m.hp -= dmg;
            m.stunDuration = 2 + sLv * 0.5;
            Game.log(`Rzut Włócznią! ${dmg} dmg + ogłuszenie!`, 'combat');
            this.floatText(`-${dmg}`, m.x, m.y, '#e67e22');
            // Drop spear on ground near target
            this.dropSpearOnGround(m.x, m.y, p.level);
            if (m.hp <= 0) this.killMonster(m);
            Game.advanceCombatSkill('distance');
            return true;
        }
        case 'hawk_eye': {
            const dur = 6 + sLv;
            p.buffs.push({ id: 'hawk_eye', duration: dur, critBonus: 0.5 });
            Game.log(`Sokolie Oko! +50% crit na ${dur}s!`, 'combat');
            return true;
        }
        case 'trap': {
            const nearby = World.getMonstersNear(p.x, p.y, 1);
            nearby.forEach(m => { m.stunDuration = 3 + sLv; });
            Game.log(`Pułapka! Ogłuszono ${nearby.length} wrogów na ${3+sLv}s!`, 'combat');
            return true;
        }
        case 'sniper_shot': {
            const m = World.getMonsterAt(tx, ty);
            if (!m) return false;
            const mult = this.getSkillMult(skill, p);
            const dmg = Math.max(1, Math.floor(stats.damage * mult) - Math.floor((m.armor || m.def || 0) * 0.3));
            m.hp -= dmg;
            Game.log(`Snajperski Strzał! ${dmg} dmg!`, 'combat');
            this.floatText(`-${dmg}`, m.x, m.y, '#e67e22');
            if (m.hp <= 0) this.killMonster(m);
            Game.advanceCombatSkill('distance');
            return true;
        }
        case 'arrow_storm': {
            const mult = this.getSkillMult(skill, p);
            const nearby = World.getMonstersNear(p.x, p.y, 5);
            nearby.forEach(m => {
                const dmg = Math.max(1, Math.floor(stats.damage * mult) - Math.floor((m.armor || m.def || 0) * 0.3));
                m.hp -= dmg;
                this.floatText(`-${dmg}`, m.x, m.y, '#e67e22');
                if (m.hp <= 0) this.killMonster(m);
            });
            Game.log(`Burza Strzał! ${nearby.length} trafień!`, 'combat');
            Game.advanceCombatSkill('distance');
            return true;
        }

        // ===== HIGH-LEVEL MAGE =====
        case 'blizzard': {
            const mult = this.getSkillMult(skill, p);
            const nearby = World.getMonstersNear(p.x, p.y, 3);
            nearby.forEach(m => {
                const dmg = Math.max(1, Math.floor(stats.damage * mult));
                m.hp -= dmg;
                m.slowDuration = 3;
                this.floatText(`-${dmg}`, m.x, m.y, '#3498db');
                if (m.hp <= 0) this.killMonster(m);
            });
            Game.log(`Zamieć! ${nearby.length} wrogów spowolnionych!`, 'combat');
            Game.advanceCombatSkill('magic');
            return true;
        }
        case 'arcane_barrier': {
            const shield = Math.floor(stats.maxHp * (0.5 + sLv * 0.05));
            p.buffs.push({ id: 'arcane_barrier', duration: 8, shieldHp: shield, reflectPct: 0.2 + sLv * 0.05 });
            Game.log(`Bariera Arkany! Tarcza ${shield} HP!`, 'combat');
            return true;
        }
        case 'inferno': {
            const mult = this.getSkillMult(skill, p);
            const nearby = World.getMonstersNear(p.x, p.y, 2);
            nearby.forEach(m => {
                const dmg = Math.max(1, Math.floor(stats.damage * mult));
                m.hp -= dmg;
                m.burnDuration = 5;
                m.burnDamage = Math.floor(dmg * 0.2);
                this.floatText(`-${dmg}`, m.x, m.y, '#e74c3c');
                if (m.hp <= 0) this.killMonster(m);
            });
            Game.log(`Inferno! ${nearby.length} wrogów w płomieniach!`, 'combat');
            Game.advanceCombatSkill('magic');
            return true;
        }
        case 'cataclysm': {
            const mult = this.getSkillMult(skill, p);
            const nearby = World.getMonstersNear(p.x, p.y, 4);
            nearby.forEach(m => {
                const dmg = Math.max(1, Math.floor(stats.damage * mult));
                m.hp -= dmg;
                this.floatText(`-${dmg}`, m.x, m.y, '#9b59b6');
                if (m.hp <= 0) this.killMonster(m);
            });
            Game.log(`Kataklizm! ${nearby.length} wrogów zniszczonych!`, 'combat');
            Game.advanceCombatSkill('magic');
            return true;
        }
        case 'arcane_ascension': {
            const dur = 10 + sLv;
            p.buffs.push({ id: 'arcane_ascension', duration: dur, atkBonus: 0.8, mpDiscount: 0.5 });
            Game.log(`Arcymagiczne Wniebowzięcie! +80% DMG na ${dur}s!`, 'combat');
            return true;
        }

        // ===== HIGH-LEVEL ARCHER =====
        case 'explosive_arrow': {
            const mult = this.getSkillMult(skill, p);
            const nearby = World.getMonstersNear(tx, ty, 2);
            nearby.forEach(m => {
                const dmg = Math.max(1, Math.floor(stats.damage * mult));
                m.hp -= dmg;
                m.burnDuration = 3;
                m.burnDamage = Math.floor(dmg * 0.15);
                this.floatText(`-${dmg}`, m.x, m.y, '#e67e22');
                if (m.hp <= 0) this.killMonster(m);
            });
            Game.log(`Eksplozyjny Strzał! ${nearby.length} trafień!`, 'combat');
            Game.advanceCombatSkill('distance');
            return true;
        }
        case 'camouflage': {
            const dur = 5 + sLv;
            p.stealthSteps = 8;
            p.buffs.push({ id: 'camouflage', duration: dur, critBonus: 0.5 });
            Game.log(`Kamuflaż! Niewidzialność + +50% crit na ${dur}s!`, 'combat');
            return true;
        }
        case 'javelin_barrage': {
            const mult = this.getSkillMult(skill, p);
            const nearby = World.getMonstersNear(p.x, p.y, 4);
            let hits = 0;
            for (let i = 0; i < 5; i++) {
                const target = nearby[Math.floor(Math.random() * nearby.length)];
                if (!target || target.hp <= 0) continue;
                const dmg = Math.max(1, Math.floor(stats.damage * mult));
                target.hp -= dmg;
                hits++;
                this.floatText(`-${dmg}`, target.x, target.y, '#e67e22');
                if (target.hp <= 0) this.killMonster(target);
            }
            // Drop spears on ground
            this.dropSpearOnGround(p.x + 1, p.y, p.level);
            this.dropSpearOnGround(p.x - 1, p.y, p.level);
            Game.log(`Salwa Włóczni! ${hits} trafień!`, 'combat');
            Game.advanceCombatSkill('distance');
            return true;
        }
        case 'phantom_arrows': {
            const mult = this.getSkillMult(skill, p);
            const nearby = World.getMonstersNear(p.x, p.y, 5);
            nearby.forEach(m => {
                const dmg = Math.max(1, Math.floor(stats.damage * mult));
                m.hp -= dmg;
                this.floatText(`-${dmg}`, m.x, m.y, '#e67e22');
                if (m.hp <= 0) this.killMonster(m);
            });
            Game.log(`Widmowe Strzały! ${nearby.length} trafień, ignoruje DEF!`, 'combat');
            Game.advanceCombatSkill('distance');
            return true;
        }
        case 'wrath_of_sky': {
            const mult = this.getSkillMult(skill, p);
            const nearby = World.getMonstersNear(p.x, p.y, 4);
            nearby.forEach(m => {
                const dmg = Math.max(1, Math.floor(stats.damage * mult));
                m.hp -= dmg;
                m.stunDuration = 3;
                this.floatText(`-${dmg}`, m.x, m.y, '#f1c40f');
                if (m.hp <= 0) this.killMonster(m);
            });
            Game.log(`Gniew Niebios! ${nearby.length} wrogów zniszczonych!`, 'combat');
            Game.advanceCombatSkill('distance');
            return true;
        }
    }
    return false;
};
