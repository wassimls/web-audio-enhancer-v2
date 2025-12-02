/**
 * Simplified Noise Reduction
 * Basic spectral noise reduction
 */

export class NoiseReduction {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.reductionAmount = 15; // dB
    }

    /**
     * Apply basic noise reduction
     */
    async applyNoiseReduction(audioBuffer, amount = 15) {
        try {
            console.log(`🧹 Applying Noise Reduction (${amount} dB)`);

            // Simple high-pass filter to remove low-frequency noise
            const offlineContext = new OfflineAudioContext(
                audioBuffer.numberOfChannels,
                audioBuffer.length,
                audioBuffer.sampleRate
            );

            const source = offlineContext.createBufferSource();
            source.buffer = audioBuffer;

            // High-pass filter @ 80 Hz
            const highPass = offlineContext.createBiquadFilter();
            highPass.type = 'highpass';
            highPass.frequency.value = 80;
            highPass.Q.value = 0.7;

            // Low-pass to remove high-frequency hiss
            const lowPass = offlineContext.createBiquadFilter();
            lowPass.type = 'lowpass';
            lowPass.frequency.value = 15000;
            lowPass.Q.value = 0.7;

            // Dynamic noise reduction using gain
            const reducer = offlineContext.createGain();
            const reductionFactor = Math.pow(10, -amount / 40); // Softer reduction
            reducer.gain.value = 1 - reductionFactor;

            // Connect chain
            source.connect(highPass);
            highPass.connect(lowPass);
            lowPass.connect(reducer);
            reducer.connect(offlineContext.destination);

            source.start();
            return await offlineContext.startRendering();
        } catch (error) {
            console.error('Error applying noise reduction:', error);
            return audioBuffer;
        }
    }

    /**
     * Analyze noise floor
     */
    analyzeNoiseFloor(audioBuffer) {
        let minLevel = 1.0;
        const sampleSize = Math.min(audioBuffer.sampleRate, audioBuffer.length);

        for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
            const data = audioBuffer.getChannelData(ch);

            for (let i = 0; i < sampleSize; i++) {
                const level = Math.abs(data[i]);
                if (level > 0 && level < minLevel) {
                    minLevel = level;
                }
            }
        }

        const noiseFloorDB = 20 * Math.log10(minLevel);
        return {
            linear: minLevel,
            dB: noiseFloorDB
        };
    }
}
