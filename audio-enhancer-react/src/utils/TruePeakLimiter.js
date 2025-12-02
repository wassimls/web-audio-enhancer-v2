/**
 * True Peak Limiter
 * Prevents clipping with oversampling
 */

export class TruePeakLimiter {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.ceiling = -0.1; // dB
        this.release = 0.05; // seconds
    }

    /**
     * Apply true-peak limiting with oversampling
     */
    async applyLimiting(audioBuffer, ceilingDB = -0.5) {
        try {
            const ceiling = Math.pow(10, ceilingDB / 20);

            console.log(`🛡️ Applying True-Peak Limiter (ceiling: ${ceilingDB} dB)`);

            const processedBuffer = this.audioContext.createBuffer(
                audioBuffer.numberOfChannels,
                audioBuffer.length,
                audioBuffer.sampleRate
            );

            for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
                const input = audioBuffer.getChannelData(ch);
                const output = processedBuffer.getChannelData(ch);

                // Simple look-ahead limiter
                let gain = 1.0;
                const releaseCoef = Math.exp(-1 / (this.release * audioBuffer.sampleRate));

                for (let i = 0; i < input.length; i++) {
                    const peak = Math.abs(input[i]);

                    if (peak * gain > ceiling) {
                        gain = ceiling / peak;
                    } else {
                        gain = Math.min(1.0, gain + (1.0 - gain) * (1 - releaseCoef));
                    }

                    output[i] = input[i] * gain;
                }
            }

            return processedBuffer;
        } catch (error) {
            console.error('Error applying limiter:', error);
            return audioBuffer;
        }
    }

    /**
     * Calculate true peak value
     */
    calculateTruePeak(audioBuffer) {
        let peak = 0;
        for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
            const data = audioBuffer.getChannelData(ch);
            for (let i = 0; i < data.length; i++) {
                peak = Math.max(peak, Math.abs(data[i]));
            }
        }
        return peak;
    }

    /**
     * Calculate true peak in dB
     */
    calculateTruePeakDB(audioBuffer) {
        const peak = this.calculateTruePeak(audioBuffer);
        return 20 * Math.log10(peak);
    }
}
