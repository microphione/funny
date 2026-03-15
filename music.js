// ============================================================
// MUSIC SYSTEM - Procedural chiptune per biome
// ============================================================

const Music = {
    ctx: null,
    masterGain: null,
    currentTrack: null,
    currentBiome: -1,
    muted: false,
    volume: 0.3,
    playing: false,
    noteTimer: null,
    noteIndex: 0,

    // Note frequencies
    NOTES: {
        C3:131, D3:147, E3:165, F3:175, G3:196, A3:220, B3:247,
        C4:262, D4:294, E4:330, F4:349, G4:392, A4:440, B4:494,
        C5:523, D5:587, E5:659, F5:698, G5:784, A5:880, B5:988,
        R:0, // rest
    },

    // Melodies per biome: [note, duration_in_beats]
    melodies: {
        // Plains - happy major key
        plains: {
            tempo: 140,
            notes: 'C4 E4 G4 E4 F4 A4 G4 E4 D4 F4 E4 C4 G4 E4 C5 G4'.split(' '),
            bass: 'C3 C3 G3 G3 F3 F3 C3 C3 C3 C3 G3 G3 F3 F3 G3 G3'.split(' '),
        },
        // Forest - mysterious minor
        forest: {
            tempo: 110,
            notes: 'A3 C4 E4 A3 B3 D4 E4 B3 A3 C4 D4 E4 D4 C4 B3 A3'.split(' '),
            bass: 'A3 A3 A3 A3 E3 E3 E3 E3 A3 A3 D3 D3 E3 E3 A3 A3'.split(' '),
        },
        // Swamp - dark slow
        swamp: {
            tempo: 85,
            notes: 'D3 F3 A3 D3 R E3 G3 B3 D3 F3 R A3 G3 F3 E3 D3'.split(' '),
            bass: 'D3 D3 D3 D3 R D3 G3 G3 D3 D3 R A3 G3 F3 E3 D3'.split(' '),
        },
        // Mountain - epic power
        mountain: {
            tempo: 120,
            notes: 'E4 G4 B4 E5 D5 B4 G4 E4 F4 A4 C5 A4 G4 E4 D4 E4'.split(' '),
            bass: 'E3 E3 G3 G3 D3 D3 G3 G3 F3 F3 A3 A3 G3 E3 D3 E3'.split(' '),
        },
        // Desert - pentatonic exotic
        desert: {
            tempo: 130,
            notes: 'A4 C5 D5 E5 A4 G4 E4 D4 A4 C5 D5 E5 D5 C5 A4 G4'.split(' '),
            bass: 'A3 A3 D3 D3 A3 A3 E3 E3 A3 A3 D3 D3 E3 E3 A3 A3'.split(' '),
        },
        // Village - peaceful
        village: {
            tempo: 100,
            notes: 'C4 E4 G4 C5 B4 G4 A4 F4 E4 G4 C5 E5 D5 C5 B4 G4'.split(' '),
            bass: 'C3 C3 E3 E3 G3 G3 F3 F3 C3 C3 E3 E3 G3 G3 C3 C3'.split(' '),
        },
        // Combat - intense
        combat: {
            tempo: 180,
            notes: 'E4 E4 G4 A4 E4 E4 B4 A4 G4 E4 D4 E4 G4 A4 B4 E4'.split(' '),
            bass: 'E3 E3 E3 E3 A3 A3 A3 A3 G3 G3 D3 D3 E3 E3 E3 E3'.split(' '),
        },
    },

    init() {
        // Defer AudioContext creation to user interaction
        this.initialized = false;
    },

    ensureContext() {
        if (this.initialized) return true;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = this.volume;
            this.masterGain.connect(this.ctx.destination);
            this.initialized = true;
            return true;
        } catch(e) {
            return false;
        }
    },

    playNote(freq, duration, type, gain) {
        if (!this.ctx || this.muted || freq === 0) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = type || 'square';
        osc.frequency.value = freq;
        g.gain.value = gain || 0.15;
        // Envelope
        const now = this.ctx.currentTime;
        g.gain.setValueAtTime(gain || 0.15, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.9);
        osc.connect(g);
        g.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + duration);
    },

    playMelody(biomeKey) {
        const melody = this.melodies[biomeKey];
        if (!melody) return;

        this.stopMelody();
        this.currentTrack = biomeKey;
        this.playing = true;
        this.noteIndex = 0;

        const beatDuration = 60 / melody.tempo;

        const playNext = () => {
            if (!this.playing || this.muted) return;
            const idx = this.noteIndex % melody.notes.length;
            const noteName = melody.notes[idx];
            const bassName = melody.bass[idx];
            const freq = this.NOTES[noteName] || 0;
            const bassFreq = this.NOTES[bassName] || 0;

            if (freq > 0) this.playNote(freq, beatDuration * 0.8, 'square', 0.12);
            if (bassFreq > 0) this.playNote(bassFreq, beatDuration * 0.9, 'triangle', 0.08);

            this.noteIndex++;
            this.noteTimer = setTimeout(playNext, beatDuration * 1000);
        };

        playNext();
    },

    stopMelody() {
        this.playing = false;
        if (this.noteTimer) {
            clearTimeout(this.noteTimer);
            this.noteTimer = null;
        }
    },

    updateBiome(biome, inVillage, inCombat) {
        if (!this.ensureContext()) return;

        let targetTrack;
        if (inCombat) targetTrack = 'combat';
        else if (inVillage) targetTrack = 'village';
        else {
            const map = { 0: 'plains', 1: 'forest', 2: 'swamp', 3: 'mountain', 4: 'desert' };
            targetTrack = map[biome] || 'plains';
        }

        if (targetTrack !== this.currentTrack) {
            this.playMelody(targetTrack);
        }
    },

    toggle() {
        this.muted = !this.muted;
        if (this.muted) {
            this.stopMelody();
            if (this.masterGain) this.masterGain.gain.value = 0;
        } else {
            if (this.masterGain) this.masterGain.gain.value = this.volume;
            if (this.currentTrack) this.playMelody(this.currentTrack);
        }
        return this.muted;
    },
};
