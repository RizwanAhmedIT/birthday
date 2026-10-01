/* ============================================================
   BIRTHDAY AUDIO ENGINE — Pure Web Audio API
   No external MP3/WAV files required. Instant, zero-latency,
   generative music box & cinematic sound design.
   ============================================================ */

class BirthdayAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.isMuted = false;
    this.bgmPlaying = false;
    this.bgmInterval = null;
    this.step = 0;

    // Gentle celesta / music box melody notes (frequencies in Hz)
    // Dreamy, heartwarming Happy Birthday & celebration chord arpeggios
    this.scaleNotes = [
      // Phrase 1: Soft intro / gentle theme
      261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99,
      // Harmony accents
      196.00, 220.00, 349.23, 493.88
    ];

    // Melodic sequence (note index, duration ms, octave multiplier)
    this.melodySequence = [
      { f: 261.63, d: 450 }, { f: 261.63, d: 450 }, { f: 293.66, d: 700 }, { f: 261.63, d: 700 },
      { f: 349.23, d: 700 }, { f: 329.63, d: 1100 },
      { f: 261.63, d: 450 }, { f: 261.63, d: 450 }, { f: 293.66, d: 700 }, { f: 261.63, d: 700 },
      { f: 392.00, d: 700 }, { f: 349.23, d: 1100 },
      { f: 261.63, d: 450 }, { f: 261.63, d: 450 }, { f: 523.25, d: 700 }, { f: 440.00, d: 700 },
      { f: 349.23, d: 650 }, { f: 329.63, d: 650 }, { f: 293.66, d: 900 },
      { f: 466.16, d: 450 }, { f: 466.16, d: 450 }, { f: 440.00, d: 700 }, { f: 349.23, d: 700 },
      { f: 392.00, d: 700 }, { f: 349.23, d: 1400 },
    ];
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.85, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.setValueAtTime(0.42, this.ctx.currentTime);
    this.bgmGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : 0.85, now + 0.15);
    }
    return this.isMuted;
  }

  // --- Music Box / Celesta Synth ---
  playMusicBoxNote(freq, time, duration = 1.6, velocity = 0.5) {
    if (!this.ctx || this.isMuted) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Celesta / music box uses sine + soft triangle with gentle bell harmonics
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, time);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2.002, time); // 1st harmonic subtle chime shimmer

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 4.2, time);
    filter.Q.setValueAtTime(2.5, time);

    // Exponential bell-like strike and decay
    noteGain.gain.setValueAtTime(0.0001, time);
    noteGain.gain.linearRampToValueAtTime(velocity * 0.28, time + 0.015);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.bgmGain);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + duration);
    osc2.stop(time + duration);
  }

  startBgm() {
    this.init();
    if (this.bgmPlaying || !this.ctx) return;
    this.bgmPlaying = true;
    this.step = 0;

    const playNext = () => {
      if (!this.bgmPlaying || !this.ctx) return;
      const note = this.melodySequence[this.step % this.melodySequence.length];
      const now = this.ctx.currentTime;
      
      // Lead chime note
      this.playMusicBoxNote(note.f, now, (note.d / 1000) * 1.8, 0.55);
      
      // Subtle warm bass accompaniment on measure beats
      if (this.step % 4 === 0) {
        this.playMusicBoxNote(note.f * 0.5, now, 2.5, 0.4);
      }

      this.step++;
      const nextDelay = note.d;
      this.bgmInterval = setTimeout(playNext, nextDelay);
    };

    playNext();
  }

  stopBgm() {
    this.bgmPlaying = false;
    if (this.bgmInterval) clearTimeout(this.bgmInterval);
  }

  // --- Cinematic Foley Effects ---

  // Bow draw tension
  playBowDraw(ratio = 0.5) {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(140 + ratio * 280, now);
    filter.Q.setValueAtTime(5, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.04 * ratio, now + 0.05);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  // Bow release & arrow whoosh
  playArrowRelease() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // String snap (elastic twang)
    const snapOsc = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(320, now);
    snapOsc.frequency.exponentialRampToValueAtTime(95, now + 0.22);
    snapGain.gain.setValueAtTime(0.35, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    snapOsc.connect(snapGain);
    snapGain.connect(this.sfxGain);
    snapOsc.start(now);
    snapOsc.stop(now + 0.26);

    // Arrow flight air swoosh
    const bufferSize = this.ctx.sampleRate * 0.3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(550, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(2200, now + 0.26);
    noiseFilter.Q.setValueAtTime(3.0, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.01, now);
    noiseGain.gain.linearRampToValueAtTime(0.25, now + 0.12);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
    noise.start(now);
    noise.stop(now + 0.3);
  }

  // Arrow strike on heart (crystalline chime & resonant strike)
  playHeartStrike() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Glass chime chord (528Hz love frequency + octaves)
    [528, 792, 1056, 1584].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.02);
      gain.gain.setValueAtTime(0.22 / (idx + 1), now + idx * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + idx * 0.02);
      osc.stop(now + 1.45);
    });

    // Subtle heart thud
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(120, now);
    subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.35);
    subGain.gain.setValueAtTime(0.4, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);
    subOsc.start(now);
    subOsc.stop(now + 0.4);
  }

  // Rose flood expansion swell
  playRoseFlood() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(175, now + 0.6);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, now);
    filter.frequency.linearRampToValueAtTime(950, now + 0.5);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.9);
  }

  // Kinetic typography shimmer
  playWishChime() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    [659.25, 783.99, 987.77, 1318.51].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.08);
      gain.gain.setValueAtTime(0.12, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.8);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.85);
    });
  }

  // Golden tree bloom fan / harp sweep
  playBloomSweep() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const t = now + idx * 0.06;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.16, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 1.3);
    });
  }

  // Paper letter unfold & wax seal break
  playLetterOpen() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Wax seal snap
    const snap = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snap.type = 'triangle';
    snap.frequency.setValueAtTime(480, now);
    snap.frequency.exponentialRampToValueAtTime(80, now + 0.09);
    snapGain.gain.setValueAtTime(0.3, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    snap.connect(snapGain);
    snapGain.connect(this.sfxGain);
    snap.start(now);
    snap.stop(now + 0.11);

    // Paper slide flutter
    const bSize = this.ctx.sampleRate * 0.25;
    const buf = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bSize; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bSize * 0.5));
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filt = this.ctx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.setValueAtTime(1400, now + 0.08);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.18, now + 0.08);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    src.connect(filt);
    filt.connect(g);
    g.connect(this.sfxGain);
    src.start(now + 0.08);
    src.stop(now + 0.36);
  }

  // Candle blow & celebratory confetti burst
  playCandleBlowAndConfetti() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Breath puff whoosh
    const bSize = this.ctx.sampleRate * 0.4;
    const buf = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bSize; i++) d[i] = (Math.random() * 2 - 1);
    const breath = this.ctx.createBufferSource();
    breath.buffer = buf;
    const bFilt = this.ctx.createBiquadFilter();
    bFilt.type = 'lowpass';
    bFilt.frequency.setValueAtTime(600, now);
    bFilt.frequency.exponentialRampToValueAtTime(200, now + 0.35);
    const bGain = this.ctx.createGain();
    bGain.gain.setValueAtTime(0.01, now);
    bGain.gain.linearRampToValueAtTime(0.28, now + 0.1);
    bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    breath.connect(bFilt);
    bFilt.connect(bGain);
    bGain.connect(this.sfxGain);
    breath.start(now);
    breath.stop(now + 0.42);

    // Snappy celebratory party popper pop (noise burst + downward pitch)
    setTimeout(() => {
      if (!this.ctx || this.isMuted) return;
      const t = this.ctx.currentTime;

      // Popper crisp burst
      const popSize = this.ctx.sampleRate * 0.08;
      const popBuf = this.ctx.createBuffer(1, popSize, this.ctx.sampleRate);
      const popData = popBuf.getChannelData(0);
      for (let i = 0; i < popSize; i++) popData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (popSize * 0.2));
      const popSrc = this.ctx.createBufferSource();
      popSrc.buffer = popBuf;
      const popGain = this.ctx.createGain();
      popGain.gain.setValueAtTime(0.4, t);
      popGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      popSrc.connect(popGain);
      popGain.connect(this.sfxGain);
      popSrc.start(t);

      // Cheerful celebratory fanfare chord arpeggio (C-E-G-B-C-E triumph)
      [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51, 1567.98].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = i % 2 === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, t + i * 0.05);
        gain.gain.setValueAtTime(0.28, t + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 1.8);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t + i * 0.05);
        osc.stop(t + i * 0.05 + 1.9);
      });

      // Whimsical party horn flourish
      const hornOsc = this.ctx.createOscillator();
      const hornGain = this.ctx.createGain();
      hornOsc.type = 'sawtooth';
      hornOsc.frequency.setValueAtTime(440, t + 0.2);
      hornOsc.frequency.linearRampToValueAtTime(880, t + 0.55);
      const hornFilt = this.ctx.createBiquadFilter();
      hornFilt.type = 'lowpass';
      hornFilt.frequency.setValueAtTime(1400, t + 0.2);
      hornGain.gain.setValueAtTime(0.08, t + 0.2);
      hornGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      hornOsc.connect(hornFilt);
      hornFilt.connect(hornGain);
      hornGain.connect(this.sfxGain);
      hornOsc.start(t + 0.2);
      hornOsc.stop(t + 0.65);
    }, 240);
  }

  /* Tactile Balloon / Charm Pop sound */
  playBalloonPop() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Snappy high-frequency rubber pop
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.07);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.09);

    // Cute sparkle chime ping
    const chime = this.ctx.createOscillator();
    const cGain = this.ctx.createGain();
    chime.type = 'sine';
    chime.frequency.setValueAtTime(1760 + Math.random() * 400, now + 0.02);
    cGain.gain.setValueAtTime(0.18, now + 0.02);
    cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    chime.connect(cGain);
    cGain.connect(this.sfxGain);
    chime.start(now + 0.02);
    chime.stop(now + 0.5);
  }

  /* Tactile Polaroid photo flip */
  playPhotoFlip() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    
    // Crisp shutter / card snap click
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  /* Album open whoosh and sparkle */
  playAlbumOpen() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    
    [587.33, 783.99, 1174.66].forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.05);
      gain.gain.setValueAtTime(0.14, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.8);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.85);
    });
  }
}

export const sound = new BirthdayAudioEngine();
