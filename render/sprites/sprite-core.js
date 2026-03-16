// ============================================================
// SPRITE RENDERER - 32-bit style pixel art (HD upgrade)
// All sprites drawn at 32x32 native resolution
// ============================================================

const Sprites = {
    cache: {},
    SPRITE_SIZE: 32,

    create(key, drawFn) {
        if (this.cache[key]) return this.cache[key];
        const c = document.createElement('canvas');
        c.width = this.SPRITE_SIZE;
        c.height = this.SPRITE_SIZE;
        const ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        drawFn(ctx, this.SPRITE_SIZE);
        this.cache[key] = c;
        return c;
    },

    draw(gameCtx, key, x, y) {
        const sprite = this.cache[key];
        if (!sprite) return;
        const drawSize = (typeof Game !== 'undefined') ? Game.TILE : this.SPRITE_SIZE;
        gameCtx.drawImage(sprite, x, y, drawSize, drawSize);
    },

    px(ctx, x, y, color, w = 1, h = 1) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
    },

    // Helper: draw a filled rectangle with outline
    rect(ctx, x, y, w, h, fill, outline) {
        ctx.fillStyle = fill;
        ctx.fillRect(x, y, w, h);
        if (outline) {
            ctx.fillStyle = outline;
            ctx.fillRect(x, y, w, 1);
            ctx.fillRect(x, y, 1, h);
            ctx.fillRect(x + w - 1, y, 1, h);
            ctx.fillRect(x, y + h - 1, w, 1);
        }
    },

    // Helper: draw a simple circle approximation
    circle(ctx, cx, cy, r, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
    },

    // Helper: gradient fill
    grad(ctx, x, y, w, h, c1, c2, vertical = true) {
        const g = vertical ? ctx.createLinearGradient(x, y, x, y + h) : ctx.createLinearGradient(x, y, x + w, y);
        g.addColorStop(0, c1);
        g.addColorStop(1, c2);
        ctx.fillStyle = g;
        ctx.fillRect(x, y, w, h);
    },

    init() {
        this.initTiles();
        this.initPlayer();
        this.initMonsters();
        this.initMonsters2();
    }
};
