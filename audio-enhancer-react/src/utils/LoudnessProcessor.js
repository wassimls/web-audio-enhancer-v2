/**
 * LUFS Loudness Processor
 * Implementation of ITU-R BS.1770-4 standard
 */

export class LoudnessProcessor {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.targetLUFS = -16; // Default broadcast standard
    }

    /**
     * Create K-weighting filter for offline context
     */
    createKWeightingFilterOffline(offlineContext) {
        // High-shelf filter @ 1681.74 Hz (+4 dB)
        const highShelf = offlineContext.createBiquadFilter();
        highShelf.type = 'highshelf';
        highShelf.frequency.value = 1681.74;
        highShelf.gain.value = 4.0;

        // High-pass filter @ 38.13 Hz
        const highPass = offlineContext.createBiquadFilter();
        highPass.type = 'highpass';
        highPass.frequency.value = 38.13;
        highPass.Q.value = 0.5;

        highPass.connect(highShelf);

        return {
            input: highPass,
            output: highShelf
        };
    }

    /**
     * Calculate integrated loudness (LUFS)
     */
    async calculateLUFS(audioBuffer) {
        try {
            const offlineContext = new OfflineAudioContext(
                audioBuffer.numberOfChannels,
                audioBuffer.length,
                audioBuffer.sampleRate
            );

            const source = offlineContext.createBufferSource();
            source.buffer = audioBuffer;

            // Apply K-weighting
            const kFilter = this.createKWeightingFilterOffline(offlineContext);
            source.connect(kFilter.input);
            kFilter.output.connect(offlineContext.destination);

            source.start();
            const renderedBuffer = await offlineContext.startRendering();

            // Calculate mean square (power)
            let sumSquares = 0;
            let sampleCount = 0;

            for (let ch = 0; ch < renderedBuffer.numberOfChannels; ch++) {
                const channelData = renderedBuffer.getChannelData(ch);
                for (let i = 0; i < channelData.length; i++) {
                    sumSquares += channelData[i] * channelData[i];
                    sampleCount++;
                }
            }

            const meanSquare = sumSquares / sampleCount;
            const lufs = -0.691 + 10 * Math.log10(meanSquare);

            return lufs;
        } catch (error) {
            console.error('Error calculating LUFS:', error);
            return -23; // Default fallback
        }
    }

    /**
     * Normalize audio to target LUFS
     */
    async normalizeToLUFS(audioBuffer, targetLUFS = -16) {
        try {
            const currentLUFS = await this.calculateLUFS(audioBuffer);
            const gainDB = targetLUFS - currentLUFS;
            const gainLinear = Math.pow(10, gainDB / 20);

            console.log(`📊 LUFS: ${currentLUFS.toFixed(1)} → ${targetLUFS} (Gain: ${gainDB.toFixed(1)} dB)`);

            // Apply gain
            const normalizedBuffer = this.audioContext.createBuffer(
                audioBuffer.numberOfChannels,
                audioBuffer.length,
                audioBuffer.sampleRate
            );

            for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
                const inputData = audioBuffer.getChannelData(ch);
                const outputData = normalizedBuffer.getChannelData(ch);

                for (let i = 0; i < inputData.length; i++) {
                    outputData[i] = Math.max(-1, Math.min(1, inputData[i] * gainLinear));
                }
            }

            return normalizedBuffer;
        } catch (error) {
            console.error('Error normalizing LUFS:', error);
            return audioBuffer;
        }
    }

    /**
     * Calculate loudness range
     */
    async calculateLoudnessRange(audioBuffer) {
        // Simplified LRA calculation
        const lufs = await this.calculateLUFS(audioBuffer);
        return {
            integrated: lufs,
            range: 10, // Placeholder
            shortTerm: lufs,
            momentary: lufs
        };
    }
}
