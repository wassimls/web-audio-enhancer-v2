/**
 * Stereo Processor
 * MS encoding/decoding and width control
 */

export class StereoProcessor {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.width = 1.0; // 0 = mono, 1 = normal, 2 = wide
    }

    /**
     * Adjust stereo width
     */
    async adjustWidth(audioBuffer, width = 1.0) {
        try {
            if (audioBuffer.numberOfChannels !== 2) {
                console.warn('Stereo processing requires stereo audio');
                return audioBuffer;
            }

            console.log(`🎧 Adjusting Stereo Width (${width.toFixed(2)}x)`);

            const leftData = audioBuffer.getChannelData(0);
            const rightData = audioBuffer.getChannelData(1);

            // Encode to MS
            const { mid, side } = this.encodeMS(leftData, rightData);

            // Process side channel (adjust width)
            const processedSide = side.map(s => s * width);

            // Decode back to LR
            const { left, right } = this.decodeMS(mid, processedSide);

            // Create output buffer
            const outputBuffer = this.audioContext.createBuffer(
                2,
                audioBuffer.length,
                audioBuffer.sampleRate
            );

            outputBuffer.getChannelData(0).set(left);
            outputBuffer.getChannelData(1).set(right);

            return outputBuffer;
        } catch (error) {
            console.error('Error adjusting stereo width:', error);
            return audioBuffer;
        }
    }

    /**
     * Convert L/R to M/S
     */
    encodeMS(left, right) {
        const mid = new Float32Array(left.length);
        const side = new Float32Array(left.length);

        for (let i = 0; i < left.length; i++) {
            mid[i] = (left[i] + right[i]) / 2;
            side[i] = (left[i] - right[i]) / 2;
        }

        return { mid, side };
    }

    /**
     * Convert M/S to L/R
     */
    decodeMS(mid, side) {
        const left = new Float32Array(mid.length);
        const right = new Float32Array(mid.length);

        for (let i = 0; i < mid.length; i++) {
            left[i] = mid[i] + side[i];
            right[i] = mid[i] - side[i];
        }

        return { left, right };
    }

    /**
     * Analyze stereo width
     */
    analyzeStereoWidth(audioBuffer) {
        if (audioBuffer.numberOfChannels !== 2) return 0;

        const left = audioBuffer.getChannelData(0);
        const right = audioBuffer.getChannelData(1);

        let correlation = 0;
        const length = Math.min(left.length, right.length);

        for (let i = 0; i < length; i++) {
            correlation += Math.abs(left[i] - right[i]);
        }

        return correlation / length;
    }

    /**
     * Calculate phase correlation
     */
    analyzePhaseCorrelation(audioBuffer) {
        if (audioBuffer.numberOfChannels !== 2) return 1;

        const left = audioBuffer.getChannelData(0);
        const right = audioBuffer.getChannelData(1);

        let sumLR = 0;
        let sumLL = 0;
        let sumRR = 0;
        const length = Math.min(left.length, right.length);

        for (let i = 0; i < length; i++) {
            sumLR += left[i] * right[i];
            sumLL += left[i] * left[i];
            sumRR += right[i] * right[i];
        }

        // Pearson correlation coefficient
        const correlation = sumLR / Math.sqrt(sumLL * sumRR);
        return correlation;
    }
}
