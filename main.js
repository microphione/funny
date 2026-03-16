// ============================================================
// GAME MAIN - Game loop, initialization, startup
// ============================================================

(function() {
    let lastTime = 0;
    let hudTimer = 0;
    let minimapTimer = 0;
    let autoSaveTimer = 0;
    let sidePanelTimer = 0;

    function gameLoop(timestamp) {
        const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
        lastTime = timestamp;

        if (Game.state === 'playing') {
            // Realtime combat tick
            GameCombat.realtimeTick(dt);

            // Handle held movement keys
            GameInput.handleHeldKeys(dt);

            GameRender.render(dt);

            // HUD update every 0.25s
            hudTimer += dt;
            if (hudTimer > 0.25) {
                hudTimer = 0;
                GameRender.updateHUD();
            }

            // Side panel update every 0.5s
            sidePanelTimer += dt;
            if (sidePanelTimer > 0.5) {
                sidePanelTimer = 0;
                GameUI.updateSidePanel();
            }

            // Minimap every 0.5s
            minimapTimer += dt;
            if (minimapTimer > 0.5) {
                minimapTimer = 0;
                GameRender.renderMinimap();
            }

            // Auto-save every 60s
            autoSaveTimer += dt;
            if (autoSaveTimer > 60) {
                autoSaveTimer = 0;
                Game.save();
            }

            // Periodic main quest check
            Game.questCheckTimer = (Game.questCheckTimer || 0) + dt;
            if (Game.questCheckTimer > 5) {
                Game.questCheckTimer = 0;
                Game.checkMainQuest();
            }
        }

        requestAnimationFrame(gameLoop);
    }

    function initGame() {
        // Init canvas - resize to fit container
        Game.canvas = document.getElementById('game-canvas');
        Game.ctx = Game.canvas.getContext('2d');
        function resizeCanvas() {
            const container = document.getElementById('game-container');
            Game.canvas.width = container.clientWidth;
            Game.canvas.height = container.clientHeight;
            Game.ctx.imageSmoothingEnabled = false;
            Game.VIEW_W = 17;
            Game.VIEW_H = 13;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Init sprites
        Sprites.init();

        // Init renderer
        GameRender.init();

        // Init input
        GameInput.init();

        // Init draggable panels
        GameUI.initDraggablePanels();

        // Init music
        Music.init();

        // Title screen buttons
        document.getElementById('btn-new-game').addEventListener('click', () => {
            document.getElementById('title-screen').style.display = 'none';
            Music.ensureContext();
            // Start as novice on starter island - no class selection
            Game.createPlayer('novice');
            Game.player.onStarterIsland = true;
            Game.state = 'playing';
            Game.startTime = Date.now();
            World.init();
            // Spawn in town center (near the well)
            const ic = World.getIslandCenter();
            World.getChunk(STARTER_ISLAND.cx, STARTER_ISLAND.cy);
            Game.player.x = ic.x;
            Game.player.y = ic.y + 2; // Spawn just south of well
            Game.player.visualX = Game.player.x;
            Game.player.visualY = Game.player.y;
            Game.starterIslandQuests = {};
            Music.updateBiome(0, false, false);
            Game.log('Budzisz się w Mieście Szmaragdowym...', 'info');
            Game.log('Rozmawiaj z NPC (SPACJA) po questy i sklepy!', 'info');
            Game.log('Eksploruj wyspę, walcz i osiągnij Lv.20 aby opuścić!', 'info');
            Game.log('WASD = ruch, SPACJA = interakcja, E = atak, I = ekwipunek', 'info');
        });

        document.getElementById('btn-load-game').addEventListener('click', () => {
            if (Game.load()) {
                document.getElementById('title-screen').style.display = 'none';
                Game.state = 'playing';
                Game.log('Gra wczytana!', 'info');
                const biome = World.getBiome(Game.player.x, Game.player.y);
                Music.updateBiome(biome, false, false);
            } else {
                Game.log('Brak zapisanej gry.', 'info');
            }
        });

        // Death respawn button
        const respawnBtn = document.getElementById('btn-respawn');
        if (respawnBtn) {
            respawnBtn.addEventListener('click', () => Game.respawn());
        }

        // Music toggle button
        const musicBtn = document.getElementById('music-btn');
        if (musicBtn) {
            musicBtn.addEventListener('click', () => GameInput.toggleMusic());
        }

        // Start loop
        requestAnimationFrame(gameLoop);
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGame);
    } else {
        initGame();
    }
})();
