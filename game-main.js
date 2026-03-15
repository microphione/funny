// ============================================================
// GAME MAIN - Game loop, initialization, startup
// ============================================================

(function() {
    let lastTime = 0;
    let hudTimer = 0;
    let minimapTimer = 0;
    let autoSaveTimer = 0;

    function gameLoop(timestamp) {
        const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
        lastTime = timestamp;

        if (Game.state === 'playing') {
            GameRender.render(dt);

            // HUD update every 0.25s
            hudTimer += dt;
            if (hudTimer > 0.25) {
                hudTimer = 0;
                GameRender.updateHUD();
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
        }

        requestAnimationFrame(gameLoop);
    }

    function initGame() {
        // Init canvas
        Game.canvas = document.getElementById('game-canvas');
        Game.ctx = Game.canvas.getContext('2d');
        Game.canvas.width = 640;
        Game.canvas.height = 480;
        Game.ctx.imageSmoothingEnabled = false;
        Game.VIEW_W = Math.ceil(Game.canvas.width / Game.TILE);
        Game.VIEW_H = Math.ceil(Game.canvas.height / Game.TILE);

        // Init sprites
        Sprites.init();

        // Init renderer
        GameRender.init();

        // Init input
        GameInput.init();

        // Init music
        Music.init();

        // Title screen buttons
        document.getElementById('btn-new-game').addEventListener('click', () => {
            document.getElementById('title-screen').style.display = 'none';
            Game.state = 'class_select';
            GameUI.showClassSelect();
            Music.ensureContext();
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
