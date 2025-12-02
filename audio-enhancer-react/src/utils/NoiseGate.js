/**
 * Noise Gate
 * Removes silence and low-level noise
 */

export class NoiseGate {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.threshold = -40; // dB
        this.ratio = 10;
        this.attack = 0.001; // seconds
        this.release = 0.1; // seconds
        this.range = -80; // Max reduction in dB
    }

    /**
     * Apply noise gate to audio buffer
     */
    async applyGate(audioBuffer, settings = {}) {
        try {
            const threshold = settings.threshold || this.threshold;
            const range = settings.range || this.range;

            console.log(`🚪 Applying Noise Gate (threshold: ${threshold} dB, range: ${range} dB)`);

            const processedBuffer = this.audioContext.createBuffer(
                audioBuffer.numberOfChannels,
                audioBuffer.length,
                audioBuffer.sampleRate
            );

            const thresholdLinear = Math.pow(10, threshold / 20);
            const rangeLinear = Math.pow(10, range / 20);
            const attackCoef = Math.exp(-1 / (this.attack * audioBuffer.sampleRate));
            const releaseCoef = Math.exp(-1 / (this.release * audioBuffer.sampleRate));

            for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
                const input = audioBuffer.getChannelData(ch);
                const output = processedBuffer.getChannelData(ch);

                let gain = 1.0;

                for (let i = 0; i < input.length; i++) {
                    const sample = Math.abs(input[i]);

                    let targetGain;
                    if (sample < thresholdLinear) {
                        // Below threshold - reduce
                        const reduction = (thresholdLinear - sample) / thresholdLinear;
                        targetGain = 1 - (reduction * (1 - rangeLinear));
                    } else {
                        // Above threshold - pass through
                        targetGain = 1.0;
                    }

                    // Smooth gain changes
                    if (targetGain < gain) {
                        gain = targetGain + (gain - targetGain) * attackCoef;
                    } else {
                        gain = targetGain + (gain - targetGain) * releaseCoef;
                    }

                    output[i] = input[i] * gain;
                }
            }

            return processedBuffer;
        } catch (error) {
            console.error('Error applying noise gate:', error);
            return audioBuffer;
        }
    }

    /**
     * Set gate parameters
     */
    setParameters(threshold, range, attack, release) {
        this.threshold = threshold;
        this.range = range;
        this.attack = attack || this.attack;
        this.release = release || this.release;
    }
}
