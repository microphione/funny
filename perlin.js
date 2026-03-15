// ============================================================
// PERLIN NOISE - Procedural terrain generation
// Classic improved Perlin noise implementation
// ============================================================

const Perlin = {
    grad3: [
        [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
        [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
        [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
    ],
    perm: [],

    seed(s) {
        const p = new Array(256);
        // Simple seeded RNG
        function rng() {
            s = (s * 16807 + 0) % 2147483647;
            return (s - 1) / 2147483646;
        }
        for (let i = 0; i < 256; i++) p[i] = i;
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [p[i], p[j]] = [p[j], p[i]];
        }
        this.perm = new Array(512);
        for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
    },

    dot(g, x, y) { return g[0]*x + g[1]*y; },

    noise2d(x, y) {
        const floor = Math.floor;
        const X = floor(x) & 255;
        const Y = floor(y) & 255;
        x -= floor(x);
        y -= floor(y);
        const u = x * x * x * (x * (x * 6 - 15) + 10);
        const v = y * y * y * (y * (y * 6 - 15) + 10);
        const a = this.perm[X] + Y;
        const b = this.perm[X + 1] + Y;
        const g00 = this.grad3[this.perm[a] % 12];
        const g10 = this.grad3[this.perm[b] % 12];
        const g01 = this.grad3[this.perm[a + 1] % 12];
        const g11 = this.grad3[this.perm[b + 1] % 12];
        const n00 = this.dot(g00, x, y);
        const n10 = this.dot(g10, x - 1, y);
        const n01 = this.dot(g01, x, y - 1);
        const n11 = this.dot(g11, x - 1, y - 1);
        const nx0 = n00 + u * (n10 - n00);
        const nx1 = n01 + u * (n11 - n01);
        return nx0 + v * (nx1 - nx0);
    },

    // Multi-octave fractal noise
    fbm(x, y, octaves = 4, lacunarity = 2, gain = 0.5) {
        let sum = 0, amp = 1, freq = 1, max = 0;
        for (let i = 0; i < octaves; i++) {
            sum += this.noise2d(x * freq, y * freq) * amp;
            max += amp;
            amp *= gain;
            freq *= lacunarity;
        }
        return sum / max;
    }
};
