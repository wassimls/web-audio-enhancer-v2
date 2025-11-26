/**
 * Audio Filters - Audio Enhancer v2
 * Audio filter implementations using Web Audio API
 */

class AudioFilters {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.filters = {};
    }

    /**
     * Create 3-band equalizer
     */
    createEqualizer() {
        const eq = {
            bass: this.audioContext.createBiquadFilter(),
            mid: this.audioContext.createBiquadFilter(),
            treble: this.audioContext.createBiquadFilter()
        };

        // Bass (Low-shelf @ 100Hz)
        eq.bass.type = 'lowshelf';
        eq.bass.frequency.value = 100;
        eq.bass.gain.value = 0;

        // Mid (Peaking @ 1000Hz)
        eq.mid.type = 'peaking';
        eq.mid.frequency.value = 1000;
        eq.mid.Q.value = 1;
        eq.mid.gain.value = 0;

        // Treble (High-shelf @ 8000Hz)
        eq.treble.type = 'highshelf';
        eq.treble.frequency.value = 8000;
        eq.treble.gain.value = 0;

        // Chain filters
        eq.bass.connect(eq.mid);
        eq.mid.connect(eq.treble);

        eq.input = eq.bass;
        eq.output = eq.treble;
        eq.enabled = false;

        this.filters.equalizer = eq;
        return eq;
    }

    /**
     * Create compressor
     */
    createCompressor() {
        const compressor = this.audioContext.createDynamicsCompressor();

        compressor.threshold.value = -24;
        compressor.knee.value = 30;
        compressor.ratio.value = 4;
        compressor.attack.value = 0.003;
        compressor.release.value = 0.25;

        compressor.enabled = false;

        this.filters.compressor = compressor;
        return compressor;
    }

    /**
     * Create simple reverb
     */
    createReverb() {
        const reverb = this.audioContext.createConvolver();
        const wetGain = this.audioContext.createGain();
        const dryGain = this.audioContext.createGain();

        // Create impulse response
        const rate = this.audioContext.sampleRate;
        const length = rate * 2; // 2 seconds
        const impulse = this.audioContext.createBuffer(2, length, rate);

        for (let channel = 0; channel < 2; channel++) {
            const impulseData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                impulseData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
            }
        }

        reverb.buffer = impulse;

        wetGain.gain.value = 0.3;
        dryGain.gain.value = 0.7;

        const reverbNode = {
            input: dryGain,
            output: wetGain,
            reverb,
            wetGain,
            dryGain,
            enabled: false
        };

        this.filters.reverb = reverbNode;
        return reverbNode;
    }

    /**
     * Create bass boost
     */
    createBassBoost() {
        const bassBoost = this.audioContext.createBiquadFilter();

        bassBoost.type = 'lowshelf';
        bassBoost.frequency.value = 200;
        bassBoost.gain.value = 0;

        bassBoost.enabled = false;

        this.filters.bassBoost = bassBoost;
        return bassBoost;
    }

    /**
     * Apply equalizer settings
     */
    applyEqualizer(bass, mid, treble) {
        if (!this.filters.equalizer) return;

        this.filters.equalizer.bass.gain.value = bass;
        this.filters.equalizer.mid.gain.value = mid;
        this.filters.equalizer.treble.gain.value = treble;
    }

    /**
     * Apply compressor settings
     */
    applyCompressor(threshold, ratio) {
        if (!this.filters.compressor) return;

        this.filters.compressor.threshold.value = threshold;
        this.filters.compressor.ratio.value = ratio;
    }

    /**
     * Apply reverb level
     */
    applyReverb(level) {
        if (!this.filters.reverb) return;

        const wet = level / 100;
        const dry = 1 - wet;

        this.filters.reverb.wetGain.gain.value = wet;
        this.filters.reverb.dryGain.gain.value = dry;
    }

    /**
     * Apply bass boost
     */
    applyBassBoost(gain) {
        if (!this.filters.bassBoost) return;

        this.filters.bassBoost.gain.value = gain;
    }
}

console.log('✅ Audio Filters loaded successfully');
