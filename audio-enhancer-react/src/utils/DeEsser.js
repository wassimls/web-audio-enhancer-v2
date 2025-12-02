/**
 * De-esser
 * Reduces sibilance in vocal recordings
 */

export class DeEsser {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.frequency = 7000; // Hz
        this.threshold = -25; // dB
        this.amount = 6; // dB reduction
    }

    /**
     * Apply de-essing to audio buffer
     */
    async applyDeEssing(audioBuffer, settings = {}) {
        try {
            const frequency = settings.frequency || this.frequency;
            const amount = settings.amount || this.amount;

            console.log(`🎯 Applying De-esser (freq: ${frequency} Hz, amount: ${amount} dB)`);

            const offlineContext = new OfflineAudioContext(
                audioBuffer.numberOfChannels,
                audioBuffer.length,
                audioBuffer.sampleRate
            );

            const source = offlineContext.createBufferSource();
            source.buffer = audioBuffer;

            // Create detection filter (where sibilance occurs)
            const detector = offlineContext.createBiquadFilter();
            detector.type = 'peaking';
            detector.frequency.value = frequency;
            detector.Q.value = 2;
            detector.gain.value = 0;

            // Create reduction filter
            const reducer = offlineContext.createBiquadFilter();
            reducer.type = 'highshelf';
            reducer.frequency.value = frequency - 1000;
            reducer.gain.value = -amount;

            // Connect chain
            source.connect(detector);
            detector.connect(reducer);
            reducer.connect(offlineContext.destination);

            source.start();
            return await offlineContext.startRendering();
        } catch (error) {
            console.error('Error applying de-esser:', error);
            return audioBuffer;
        }
    }

    /**
     * Detect sibilance in audio
     */
    detectSibilance(audioBuffer) {
        // Simplified sibilance detection
        let sibilanceCount = 0;
        const threshold = 0.3;

        for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
            const data = audioBuffer.getChannelData(ch);

            for (let i = 0; i < data.length; i++) {
                if (Math.abs(data[i]) > threshold) {
                    sibilanceCount++;
                }
            }
        }

        const sibilancePercentage = (sibilanceCount / audioBuffer.length) * 100;
        return {
            detected: sibilancePercentage > 5,
            percentage: sibilancePercentage
        };
    }
}
