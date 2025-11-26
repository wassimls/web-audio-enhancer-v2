/**
 * Noise Reduction - Audio Enhancer v2
 * Simple noise reduction using noise gate and filtering
 */

class NoiseReduction {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.noiseGate = null;
        this.highPassFilter = null;
        this.enabled = false;
    }

    /**
     * Create noise reduction chain
     */
    createNoiseReduction() {
        // High-pass filter to remove low-frequency rumble
        this.highPassFilter = this.audioContext.createBiquadFilter();
        this.highPassFilter.type = 'highpass';
        this.highPassFilter.frequency.value = 80;
        this.highPassFilter.Q.value = 0.7;

        // Simple gate using gain node (simulated)
        this.noiseGate = this.audioContext.createGain();
        this.noiseGate.gain.value = 1;

        // Chain
        this.highPassFilter.connect(this.noiseGate);

        return {
            input: this.highPassFilter,
            output: this.noiseGate
        };
    }

    /**
     * Apply noise reduction level
     * @param {number} level - Reduction level 0-100
     */
    applyLevel(level) {
        if (!this.highPassFilter) return;

        // Adjust high-pass filter based on level
        const frequency = 80 + (level / 100) * 120; // 80-200 Hz
        this.highPassFilter.frequency.value = frequency;

        Utils.log(`Noise reduction level: ${level}%, frequency: ${frequency.toFixed(0)}Hz`);
    }

    /**
     * Enable noise reduction
     */
    enable() {
        this.enabled = true;
    }

    /**
     * Disable noise reduction
     */
    disable() {
        this.enabled = false;
    }
}

console.log('✅ Noise Reduction loaded successfully');
