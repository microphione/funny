// ============================================================
// GAME UI - Overlays: death, class select, bestiary, world map, quests
// ============================================================

// ========== DEATH SCREEN ==========
GameUI.showDeathScreen = function(goldLoss, itemsLost) {
    const el = document.getElementById('death-overlay');
    if (!el) return;
    el.classList.add('active');
    const content = document.getElementById('death-content');
    if (!content) return;
    content.innerHTML = `
        <div style="text-align:center;font-size:8px;color:#aaa;line-height:2.5">
            <div style="font-size:24px;margin-bottom:16px">\u{1F480}</div>
            <div>Czas gry: ${Game.getPlayTime()}</div>
            <div>Poziom: ${Game.player.level}</div>
            <div>Zab\u00f3jstwa: ${Game.killCount}</div>
            <div>\u015amierci: ${Game.deathCount}</div>
            <div style="color:#e74c3c">Stracono ${goldLoss} z\u0142ota</div>
            ${itemsLost > 0 ? `<div style="color:#e74c3c">Upuszczono ${itemsLost} przedmiot\u00f3w z plecaka!</div>` : ''}
            <div style="color:#888;font-size:7px;margin-top:8px">Wyposa\u017cenie zachowane. Przedmioty z plecaka na miejscu \u015bmierci.</div>
        </div>`;
};

// ========== CLASS SELECTION ==========
GameUI.showClassSelect = function() {
    const el = document.getElementById('class-select');
    if (!el) return;
    el.style.display = 'flex';
    el.innerHTML = '';

    const title = document.createElement('h1');
    title.textContent = 'WYBIERZ KLAS\u0118';
    title.style.cssText = 'font-size:16px;color:#e67e22;margin-bottom:20px;text-shadow:2px 2px 0 #000';
    el.appendChild(title);

    const container = document.createElement('div');
    container.style.cssText = 'display:flex;gap:16px;flex-wrap:wrap;justify-content:center;max-width:700px';

    for (const [id, cls] of Object.entries(CLASSES)) {
        if (id === 'novice') continue; // novice is only for starter island
        const card = document.createElement('div');
        card.style.cssText = `background:#12122a;border:3px solid ${cls.color};border-radius:8px;padding:16px;width:200px;cursor:pointer;transition:transform 0.15s`;
        card.onmouseover = () => card.style.transform = 'scale(1.05)';
        card.onmouseout = () => card.style.transform = 'scale(1)';
        card.onclick = () => {
            Game.createPlayer(id);
            el.style.display = 'none';
            Game.state = 'playing';
            Game.startTime = Date.now();
            World.init();
            // Generate center capital chunk to get the well position
            World.getChunk(0, 0);
            const wellX = Math.floor(World.CHUNK_SIZE / 2);
            const wellY = Math.floor(World.CHUNK_SIZE / 2);
            Game.player.x = wellX;
            Game.player.y = wellY;
            Game.player.visualX = wellX;
            Game.player.visualY = wellY;
            Game.lastVillageWell = { x: wellX, y: wellY };
            // Mark starting city well as used
            Game.usedWells.add('0,0');
            Music.updateBiome(0, false, false);
            Game.log(`Wybrano klas\u0119: ${cls.name}!`, 'info');
            Game.log('Witaj w Stolicy! WASD = ruch, SPACJA = interakcja/podnie\u015b, E = atak', 'info');
            Game.log('1-3 = umiej\u0119tno\u015bci, F1/F2 = mikstury HP/MP, I = ekwipunek', 'info');
        };

        const icon = document.createElement('div');
        icon.textContent = cls.icon;
        icon.style.cssText = 'font-size:32px;text-align:center;margin-bottom:8px';

        const name = document.createElement('div');
        name.textContent = cls.name;
        name.style.cssText = `font-size:12px;color:${cls.color};text-align:center;margin-bottom:6px;font-family:'Press Start 2P',monospace`;

        const desc = document.createElement('div');
        desc.textContent = cls.desc;
        desc.style.cssText = "font-size:7px;color:#aaa;text-align:center;margin-bottom:10px;font-family:'Press Start 2P',monospace;line-height:1.5";

        const statsDiv = document.createElement('div');
        statsDiv.style.cssText = "font-size:7px;color:#888;font-family:'Press Start 2P',monospace;line-height:2";
        const bs = cls.baseStats;
        const ba = cls.baseAttributes;
        statsDiv.innerHTML = `HP:${bs.hp} MP:${bs.mp}<br>DMG:${bs.damage} PNC:${bs.armor}<br>STR:${ba.str} DEX:${ba.dex} AGI:${ba.agi} VIT:${ba.vit} INT:${ba.int}`;

        card.append(icon, name, desc, statsDiv);
        container.appendChild(card);
    }
    el.appendChild(container);
};

// ========== CLASS SELECT FROM STARTER ISLAND ==========
GameUI.showClassSelectForIsland = function() {
    const el = document.getElementById('class-select');
    if (!el) return;
    el.style.display = 'flex';
    el.innerHTML = '';

    const title = document.createElement('h1');
    title.textContent = 'WYBIERZ SWOJ\u0104 KLAS\u0118';
    title.style.cssText = 'font-size:16px;color:#e67e22;margin-bottom:8px;text-shadow:2px 2px 0 #000';
    el.appendChild(title);

    const subtitle = document.createElement('div');
    subtitle.textContent = 'Twoje atrybuty i post\u0119p zostan\u0105 zachowane!';
    subtitle.style.cssText = "font-size:8px;color:#aaa;margin-bottom:16px;font-family:'Press Start 2P',monospace";
    el.appendChild(subtitle);

    const container = document.createElement('div');
    container.style.cssText = 'display:flex;gap:16px;flex-wrap:wrap;justify-content:center;max-width:700px';

    for (const [id, cls] of Object.entries(CLASSES)) {
        if (id === 'novice') continue; // skip novice in class selection
        const card = document.createElement('div');
        card.style.cssText = `background:#12122a;border:3px solid ${cls.color};border-radius:8px;padding:16px;width:200px;cursor:pointer;transition:transform 0.15s`;
        card.onmouseover = () => card.style.transform = 'scale(1.05)';
        card.onmouseout = () => card.style.transform = 'scale(1)';
        card.onclick = () => {
            Game.changeClass(id);
            el.style.display = 'none';
            Music.updateBiome(0, false, false);
        };

        const icon = document.createElement('div');
        icon.textContent = cls.icon;
        icon.style.cssText = 'font-size:32px;text-align:center;margin-bottom:8px';

        const name = document.createElement('div');
        name.textContent = cls.name;
        name.style.cssText = `font-size:12px;color:${cls.color};text-align:center;margin-bottom:6px;font-family:'Press Start 2P',monospace`;

        const desc = document.createElement('div');
        desc.textContent = cls.desc;
        desc.style.cssText = "font-size:7px;color:#aaa;text-align:center;margin-bottom:10px;font-family:'Press Start 2P',monospace;line-height:1.5";

        const statsDiv = document.createElement('div');
        statsDiv.style.cssText = "font-size:7px;color:#888;font-family:'Press Start 2P',monospace;line-height:2";
        const bs = cls.baseStats;
        const ba = cls.baseAttributes;
        statsDiv.innerHTML = `HP:${bs.hp} MP:${bs.mp}<br>DMG:${bs.damage} PNC:${bs.armor}<br>STR:${ba.str} DEX:${ba.dex} AGI:${ba.agi} VIT:${ba.vit} INT:${ba.int}`;

        card.append(icon, name, desc, statsDiv);
        container.appendChild(card);
    }
    el.appendChild(container);
};

// ========== BESTIARY (B key) ==========
GameUI.openBestiary = function() {
    const content = document.getElementById('dialog-content');
    if (!content) return;
    content.innerHTML = '';
    content.style.cssText = 'max-height:400px;overflow-y:auto;padding:16px';

    const title = document.createElement('h2');
    title.textContent = 'BESTIARIUSZ';
    title.style.cssText = "color:#e67e22;font-size:12px;margin-bottom:12px;font-family:'Press Start 2P',monospace;text-align:center";
    content.appendChild(title);

    // Gather all known monster types from biomes + starter island
    const allMonsters = [];
    for (const biome of ['plains','forest','swamp','mountain','desert','snow']) {
        const pool = World.MONSTERS[biome];
        if (pool) pool.forEach(m => {
            if (!allMonsters.find(a => a.name === m.name)) allMonsters.push({ ...m, biome });
        });
    }
    STARTER_ISLAND.monsters.forEach(m => {
        if (!allMonsters.find(a => a.name === m.name)) allMonsters.push({ ...m, biome: 'wyspa' });
    });

    const discovered = Object.keys(Game.bestiary || {}).length;
    const stats = document.createElement('div');
    stats.style.cssText = "font-size:7px;color:#888;margin-bottom:10px;text-align:center;font-family:'Press Start 2P',monospace";
    stats.textContent = `Odkryto: ${discovered}/${allMonsters.length} gatunk\u00f3w`;
    content.appendChild(stats);

    const grid = document.createElement('div');
    grid.style.cssText = 'display:flex;flex-direction:column;gap:4px';

    for (const m of allMonsters) {
        const entry = Game.bestiary[m.name];
        const row = document.createElement('div');
        row.style.cssText = `display:flex;align-items:center;padding:6px 8px;background:${entry ? '#1a1a3a' : '#111'};border:1px solid ${entry ? '#444' : '#222'};border-radius:4px;gap:8px`;

        const nameEl = document.createElement('div');
        nameEl.style.cssText = `flex:1;font-size:7px;font-family:'Press Start 2P',monospace;color:${entry ? '#fff' : '#555'}`;
        nameEl.textContent = entry ? m.name : '???';

        const detailEl = document.createElement('div');
        detailEl.style.cssText = "font-size:6px;font-family:'Press Start 2P',monospace;color:#888;flex:2";

        if (entry) {
            const kills = entry.kills;
            let info = `Zabito: ${kills}`;
            // Progressive info reveal
            if (kills >= 1) info += ` | HP: ${m.hp}`;
            if (kills >= 5) info += ` | ATK: ${m.atk}`;
            if (kills >= 10) info += ` | PNC: ${m.armor || 0}`;
            if (kills >= 25) info += ` | XP: ${m.xp}`;
            if (kills >= 50) info += ` | ${m.biome}`;
            detailEl.textContent = info;
        } else {
            detailEl.textContent = 'Nieodkryty';
        }

        const killBadge = document.createElement('div');
        killBadge.style.cssText = "font-size:6px;font-family:'Press Start 2P',monospace;min-width:40px;text-align:right";
        if (entry) {
            const kills = entry.kills;
            let badge = '';
            if (kills >= 100) { badge = '\u{1F480} Mistrz'; killBadge.style.color = '#ff4444'; }
            else if (kills >= 50) { badge = '\u2b50 Ekspert'; killBadge.style.color = '#f39c12'; }
            else if (kills >= 25) { badge = '\u{1F5E1} \u0141owca'; killBadge.style.color = '#3498db'; }
            else if (kills >= 10) { badge = '\u{1F4D6} Znawca'; killBadge.style.color = '#2ecc71'; }
            else { badge = `${kills}x`; killBadge.style.color = '#666'; }
            killBadge.textContent = badge;
        }

        row.append(nameEl, detailEl, killBadge);
        grid.appendChild(row);
    }
    content.appendChild(grid);

    this.showOverlay('dialog-overlay');
};

// ========== WORLD MAP ==========
GameUI.openWorldMap = function() {
    this.showOverlay('worldmap-overlay');
    const canvas = document.getElementById('worldmap-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const p = Game.player;
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, w, h);

    const CS = World.CHUNK_SIZE;
    const chunkPixels = 4;
    const halfW = Math.floor(w / chunkPixels / 2);
    const halfH = Math.floor(h / chunkPixels / 2);
    const pcx = Math.floor(p.x / CS);
    const pcy = Math.floor(p.y / CS);

    const biomeColors = { 0: '#4a8c3f', 1: '#2d5a2a', 2: '#556b2f', 3: '#808080', 4: '#daa520' };

    for (let dy = -halfH; dy <= halfH; dy++) {
        for (let dx = -halfW; dx <= halfW; dx++) {
            const cx = pcx + dx;
            const cy = pcy + dy;
            const key = `${cx},${cy}`;
            const explored = Game.exploredChunks.has(key);
            const sx = (dx + halfW) * chunkPixels;
            const sy = (dy + halfH) * chunkPixels;

            if (!explored) {
                ctx.fillStyle = '#0a0a0a';
                ctx.fillRect(sx, sy, chunkPixels, chunkPixels);
                continue;
            }

            const wx = cx * CS + CS / 2;
            const wy = cy * CS + CS / 2;
            const biome = World.getBiome(wx, wy);
            ctx.fillStyle = biomeColors[biome] || '#333';
            ctx.fillRect(sx, sy, chunkPixels, chunkPixels);

            if (World.villages[key]) {
                ctx.fillStyle = '#f1c40f';
                ctx.fillRect(sx, sy, chunkPixels, chunkPixels);
            }
        }
    }

    // Player marker
    const ppx = halfW * chunkPixels + Math.floor(chunkPixels / 2);
    const ppy = halfH * chunkPixels + Math.floor(chunkPixels / 2);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ppx, ppy, 3, 0, Math.PI * 2);
    ctx.fill();

    // Quest markers
    Game.quests.forEach(q => {
        if (q.turned_in || !q.targetX) return;
        const qcx = Math.floor(q.targetX / CS) - pcx;
        const qcy = Math.floor(q.targetY / CS) - pcy;
        if (Math.abs(qcx) <= halfW && Math.abs(qcy) <= halfH) {
            const qsx = (qcx + halfW) * chunkPixels + 1;
            const qsy = (qcy + halfH) * chunkPixels + 1;
            ctx.fillStyle = '#e67e22';
            ctx.font = '6px "Press Start 2P"';
            ctx.fillText('?', qsx, qsy + 4);
        }
    });

    // Village teleport list
    const villageDiv = document.getElementById('worldmap-villages');
    if (villageDiv) {
        villageDiv.innerHTML = '';
        const usedWellKeys = [...Game.usedWells];
        if (usedWellKeys.length > 0) {
            villageDiv.innerHTML = '<div style="font-size:8px;color:#2ecc71;margin-bottom:4px">Teleport (studnie):</div>';
            usedWellKeys.forEach(vk => {
                const v = World.villages[vk];
                if (!v) return;
                const btn = document.createElement('button');
                btn.className = 'use-btn';
                btn.style.cssText = 'margin:2px;background:#2ecc71;font-size:7px;padding:4px 8px';
                btn.textContent = `${v.name} (Lv.${v.difficulty})`;
                btn.onclick = () => {
                    p.x = v.wellX; p.y = v.wellY;
                    p.visualX = v.wellX; p.visualY = v.wellY;
                    Game.lastVillageWell = { x: v.wellX, y: v.wellY };
                    Game.closeAllOverlays();
                    Game.log(`Teleportowano do ${v.name}.`, 'info');
                    GameRender.updateHUD();
                };
                villageDiv.appendChild(btn);
            });
        }
    }
};

// ========== QUESTS ==========
GameUI.openQuests = function() {
    const content = document.getElementById('dialog-content');
    const title = document.getElementById('dialog-title');
    if (!content || !title) return;

    title.textContent = 'Questy';
    content.innerHTML = '';

    // Main quest
    const mqStage = Game.MAIN_QUEST_STAGES[Game.mainQuestStage];
    if (mqStage) {
        const mqDiv = document.createElement('div');
        mqDiv.className = 'shop-item';
        mqDiv.style.borderColor = '#f1c40f';
        mqDiv.innerHTML = `<div><span style="color:#f1c40f">G\u0141\u00d3WNY: ${mqStage.title}</span>
            <div style="font-size:7px;color:#e67e22">${mqStage.desc}</div>
            <div style="font-size:7px;color:#888">Post\u0119p: ${Game.mainQuestStage}/${Game.MAIN_QUEST_STAGES.length - 1}</div></div>`;
        content.appendChild(mqDiv);
    }

    if (Game.quests.length === 0 && !mqStage) {
        content.innerHTML += '<div style="font-size:8px;color:#555;text-align:center;padding:20px">Brak aktywnych quest\u00f3w.<br>Porozmawiaj z NPC w wioskach.</div>';
    }

    Game.quests.forEach((q, idx) => {
        const row = document.createElement('div');
        row.className = 'shop-item';
        const statusColor = q.turned_in ? '#555' : q.completed ? '#2ecc71' : '#e67e22';
        const status = q.turned_in ? 'Oddany' : q.completed ? 'Uko\u0144czony!' : `${q.progress}/${q.required}`;
        row.innerHTML = `<div><span style="color:${statusColor}">${q.title}</span>
            <div style="font-size:7px;color:#888">${q.desc}</div>
            <div style="font-size:7px;color:#f1c40f">Nagroda: ${q.reward.gold}z\u0142, ${q.reward.xp} XP</div></div>
            <span style="color:${statusColor};font-size:8px">${status}</span>`;
        content.appendChild(row);
    });

    this.showOverlay('dialog-overlay');
};
