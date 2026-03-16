// ============================================================
// GAME UI - Skill tree and stat allocation
// ============================================================

// ========== STAT ALLOCATION PANEL ==========
GameUI.openStatAllocation = function() {
    const content = document.getElementById('dialog-content');
    const title = document.getElementById('dialog-title');
    if (!content || !title) return;
    const p = Game.player;

    title.textContent = `Atrybuty (${p.statPoints || 0} pkt)`;
    content.innerHTML = '';

    const stats = Game.getStats();

    // Current derived stats display
    const derivedDiv = document.createElement('div');
    derivedDiv.style.cssText = 'margin-bottom:10px;font-size:7px;color:#888;line-height:2;border-bottom:1px solid #333;padding-bottom:6px';
    derivedDiv.innerHTML = `<div style="color:#f1c40f;font-size:8px;margin-bottom:4px">Statystyki Pochodne</div>
        HP: <span style="color:#e74c3c">${stats.maxHp}</span> | MP: <span style="color:#9b59b6">${stats.maxMp}</span> |
        DMG: <span style="color:#e67e22">${stats.damage}</span> | Pancerz: <span style="color:#3498db">${stats.armor}</span><br>
        Celno\u015b\u0107: ${stats.accuracy} | Unik: ${stats.dodge}% | Kryty: ${stats.critChance}% (x${(stats.critMult/100).toFixed(1)})<br>
        Sz.Ataku: +${stats.attackSpeed} | Sz.Ruchu: +${stats.moveSpeed} | CDR: ${stats.cdr}% | Og\u0142usz: ${stats.stunChance}%`;
    content.appendChild(derivedDiv);

    // Attribute allocation
    const attrDiv = document.createElement('div');
    attrDiv.innerHTML = '<div style="font-size:8px;color:#e67e22;margin-bottom:6px">Przydziel Punkty Atrybut\u00f3w</div>';

    const attrDescs = {
        str: 'Si\u0142a: +2 Obra\u017cenia, +3% Kryty Dmg',
        dex: 'Zr\u0119czno\u015b\u0107: +3 Celno\u015b\u0107, +1% Kryty',
        agi: 'Zwinno\u015b\u0107: +2 Ruch, +2 Unik',
        vit: 'Wytrzyma\u0142o\u015b\u0107: +8 HP, +1 Pancerz',
        int: 'Inteligencja: +2% CDR, +5 MP',
    };

    for (const attr of BASE_ATTRIBUTES) {
        const val = (p.attributes || {})[attr] || 0;
        const row = document.createElement('div');
        row.className = 'shop-item';
        row.style.borderColor = 'transparent';
        const canAdd = (p.statPoints || 0) > 0 && val < MAX_STAT_POINTS;
        row.innerHTML = `<div style="flex:1">
            <span style="color:#e67e22">${ATTRIBUTE_NAMES[attr]}</span>
            <span style="color:#f1c40f;margin-left:6px">${val}/${MAX_STAT_POINTS}</span>
            <div style="font-size:6px;color:#666">${attrDescs[attr]}</div>
        </div>`;
        if (canAdd) {
            const btn = document.createElement('button');
            btn.className = 'use-btn';
            btn.style.background = '#2ecc71';
            btn.textContent = '+1';
            btn.onclick = () => {
                p.attributes[attr] = (p.attributes[attr] || 0) + 1;
                p.statPoints--;
                Game.refreshStats();
                this.openStatAllocation();
                GameRender.updateHUD();
            };
            row.appendChild(btn);
        }
        attrDiv.appendChild(row);
    }
    content.appendChild(attrDiv);
    this.showOverlay('dialog-overlay');
};

// ========== SKILL TREE (level 25+, 4 passives + 1 skill pattern) ==========
GameUI.openSkillTree = function() {
    const content = document.getElementById('dialog-content');
    const title = document.getElementById('dialog-title');
    if (!content || !title) return;
    const p = Game.player;
    const cls = CLASSES[p.classId];

    // Skill tree only visible from level 25 (retroactive points)
    if (p.level < 25) {
        title.textContent = 'Umiej\u0119tno\u015bci';
        content.innerHTML = '<div style="text-align:center;font-size:8px;color:#888;padding:20px">Drzewko umiej\u0119tno\u015bci odblokuje si\u0119 na poziomie 25.<br>Obecny poziom: ' + p.level + '</div>';
        this.showOverlay('dialog-overlay');
        return;
    }

    title.textContent = `Umiej\u0119tno\u015bci (${p.skillPoints} pkt)`;
    content.innerHTML = '';

    // Active skill slots
    const slotsDiv = document.createElement('div');
    slotsDiv.innerHTML = '<div style="font-size:8px;color:#f1c40f;margin-bottom:6px">Aktywne Sloty (klawisze 1-3)</div>';
    slotsDiv.style.cssText = 'display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap';
    for (let i = 0; i < 3; i++) {
        const slotDiv = document.createElement('div');
        slotDiv.style.cssText = 'background:#0a0a1a;border:2px solid #f1c40f;border-radius:4px;padding:6px;font-size:7px;min-width:120px;text-align:center';
        const sid = p.activeSkills[i];
        const sk = sid ? cls.skills.find(s => s.id === sid) : null;
        const lv = sid ? (p.skillLevels[sid] || 1) : 0;
        slotDiv.innerHTML = sk ? `<div style="color:#9b59b6">[${i+1}] ${sk.name} Lv.${lv}</div><div style="color:#888">${sk.cost} MP</div>` : `<div style="color:#555">[${i+1}] (pusty)</div>`;
        slotsDiv.appendChild(slotDiv);
    }
    content.appendChild(slotsDiv);

    // All skills list
    const skillsDiv = document.createElement('div');
    skillsDiv.innerHTML = '<div style="font-size:8px;color:#9b59b6;margin-bottom:6px">Umiej\u0119tno\u015bci Aktywne</div>';
    cls.skills.forEach(sk => {
        const unlocked = p.unlockedSkills.includes(sk.id);
        const lv = p.skillLevels[sk.id] || 0;
        const isActive = p.activeSkills.includes(sk.id);
        const activeSlot = p.activeSkills.indexOf(sk.id);

        const row = document.createElement('div');
        row.className = 'shop-item';
        row.style.opacity = unlocked ? '1' : '0.4';
        row.style.borderColor = isActive ? '#f1c40f' : 'transparent';

        const canUpgrade = unlocked && p.skillPoints >= 1;

        row.innerHTML = `<div style="flex:1"><span style="color:${unlocked ? '#9b59b6' : '#555'}">${sk.name}${lv > 0 ? ` Lv.${lv}` : ''}</span>
            ${isActive ? `<span style="font-size:7px;color:#f1c40f"> [${activeSlot+1}]</span>` : ''}
            <div style="font-size:7px;color:#888">${sk.desc} (${sk.cost} MP)</div>
            <div style="font-size:7px;color:#666">Wymaga: Lv.${sk.level}</div></div>`;

        const btnGroup = document.createElement('div');
        btnGroup.style.cssText = 'display:flex;gap:4px;align-items:center';

        if (unlocked) {
            if (canUpgrade) {
                const upBtn = document.createElement('button');
                upBtn.className = 'use-btn';
                upBtn.style.background = '#9b59b6';
                upBtn.textContent = `+Lv (1pkt)`;
                upBtn.onclick = (e) => {
                    e.stopPropagation();
                    p.skillLevels[sk.id] = (p.skillLevels[sk.id] || 1) + 1;
                    p.skillPoints--;
                    this.openSkillTree();
                    GameRender.updateHUD();
                };
                btnGroup.appendChild(upBtn);
            }

            if (isActive) {
                const removeBtn = document.createElement('button');
                removeBtn.className = 'use-btn';
                removeBtn.style.background = '#e74c3c';
                removeBtn.textContent = 'Usu\u0144';
                removeBtn.onclick = (e) => {
                    e.stopPropagation();
                    p.activeSkills[activeSlot] = null;
                    this.openSkillTree();
                };
                btnGroup.appendChild(removeBtn);
            } else {
                const assignBtn = document.createElement('button');
                assignBtn.className = 'use-btn';
                assignBtn.style.background = '#f1c40f';
                assignBtn.style.color = '#000';
                assignBtn.textContent = 'Aktywuj';
                assignBtn.onclick = (e) => {
                    e.stopPropagation();
                    const emptySlot = p.activeSkills.indexOf(null);
                    if (emptySlot !== -1) {
                        p.activeSkills[emptySlot] = sk.id;
                    } else {
                        p.activeSkills[0] = sk.id;
                    }
                    this.openSkillTree();
                };
                btnGroup.appendChild(assignBtn);
            }
        }

        row.appendChild(btnGroup);
        skillsDiv.appendChild(row);
    });
    content.appendChild(skillsDiv);

    // Passive Tree - scrollable/zoomable canvas
    const treeContainer = document.createElement('div');
    treeContainer.style.cssText = 'margin-top:10px;overflow:auto;max-height:300px;border:1px solid #333;border-radius:4px';
    treeContainer.innerHTML = '<div style="font-size:8px;color:#e67e22;margin-bottom:6px;padding:4px">Drzewko Pasywne (przewijaj mysz\u0105)</div>';

    const treeCanvas = document.createElement('canvas');
    const branches = Object.entries(cls.tree);
    const nodeSize = 28;
    const hGap = 90;
    const vGap = 50;
    const maxNodes = Math.max(...branches.map(([,b]) => b.nodes.length));
    const treeW = branches.length * hGap + 60;
    const treeH = maxNodes * vGap + 80;
    treeCanvas.width = treeW;
    treeCanvas.height = treeH;
    treeCanvas.style.cssText = 'display:block;margin:0 auto;image-rendering:auto';
    const tctx = treeCanvas.getContext('2d');
    tctx.fillStyle = '#0a0a1a';
    tctx.fillRect(0, 0, treeW, treeH);

    const trunkX = treeW / 2;
    tctx.strokeStyle = '#5c3a1e';
    tctx.lineWidth = 4;
    tctx.beginPath();
    tctx.moveTo(trunkX, treeH - 10);
    tctx.lineTo(trunkX, 40);
    tctx.stroke();

    const nodePositions = [];

    branches.forEach(([branchKey, branch], bi) => {
        const startX = 40 + bi * hGap;
        const branchColor = bi === 0 ? '#3498db' : '#e74c3c';

        tctx.strokeStyle = '#5c3a1e';
        tctx.lineWidth = 2;
        tctx.beginPath();
        tctx.moveTo(trunkX, 40 + bi * 15);
        tctx.lineTo(startX + nodeSize/2, 40);
        tctx.stroke();

        branch.nodes.forEach((node, ni) => {
            const nx = startX;
            const ny = 30 + ni * vGap;
            const owned = !!p.treeProgress[node.id];
            const prevOwned = ni === 0 || p.treeProgress[branch.nodes[ni-1].id];
            const canBuy = !owned && prevOwned && p.skillPoints > 0;

            if (ni > 0) {
                tctx.strokeStyle = owned ? '#2ecc71' : '#333';
                tctx.lineWidth = 2;
                tctx.beginPath();
                tctx.moveTo(nx + nodeSize/2, ny - vGap + nodeSize);
                tctx.lineTo(nx + nodeSize/2, ny);
                tctx.stroke();
            }

            tctx.fillStyle = owned ? '#2ecc71' : canBuy ? '#e67e22' : '#222';
            tctx.strokeStyle = owned ? '#2ecc71' : canBuy ? '#e67e22' : '#444';
            tctx.lineWidth = 2;
            tctx.beginPath();
            tctx.arc(nx + nodeSize/2, ny + nodeSize/2, nodeSize/2, 0, Math.PI * 2);
            tctx.fill();
            tctx.stroke();

            tctx.fillStyle = '#fff';
            tctx.font = '6px "Press Start 2P"';
            tctx.textAlign = 'center';
            tctx.fillText(node.name.slice(0, 6), nx + nodeSize/2, ny + nodeSize + 10);
            tctx.textAlign = 'left';

            if (owned) {
                tctx.fillStyle = '#fff';
                tctx.font = '12px "Press Start 2P"';
                tctx.textAlign = 'center';
                tctx.fillText('\u2713', nx + nodeSize/2, ny + nodeSize/2 + 4);
                tctx.textAlign = 'left';
            }

            nodePositions.push({ node, nx, ny, owned, canBuy, branchKey });
        });

        tctx.fillStyle = branchColor;
        tctx.font = '7px "Press Start 2P"';
        tctx.textAlign = 'center';
        tctx.fillText(branch.name, startX + nodeSize/2, treeH - 15);
        tctx.textAlign = 'left';
    });

    treeCanvas.onclick = (e) => {
        const rect = treeCanvas.getBoundingClientRect();
        const scaleX = treeCanvas.width / rect.width;
        const scaleY = treeCanvas.height / rect.height;
        const cx = (e.clientX - rect.left) * scaleX;
        const cy = (e.clientY - rect.top) * scaleY;
        for (const pos of nodePositions) {
            const dx = cx - (pos.nx + nodeSize/2);
            const dy = cy - (pos.ny + nodeSize/2);
            if (dx*dx + dy*dy < (nodeSize/2 + 5) * (nodeSize/2 + 5)) {
                if (pos.canBuy) {
                    p.treeProgress[pos.node.id] = true;
                    p.skillPoints--;
                    Game.refreshStats();
                    this.openSkillTree();
                    GameRender.updateHUD();
                }
                break;
            }
        }
    };

    treeContainer.appendChild(treeCanvas);
    content.appendChild(treeContainer);

    this.showOverlay('dialog-overlay');
};
