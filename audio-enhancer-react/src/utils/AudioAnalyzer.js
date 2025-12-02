/**
 * Audio Analyzer
 * Real-time audio analysis tools
 */

export class AudioAnalyzer {
    constructor(audioContext) {
        this.audioContext = audioContext;
    }

    /**
     * Create spectrum analyzer
     */
    createAnalyzer(fftSize = 2048) {
        const analyser = this.audioContext.createAnalyser();
        analyser.fftSize = fftSize;
        analyser.smoothingTimeConstant = 0.8;
        return analyser;
    }

    /**
     * Get frequency data
     */
    getFrequencyData(analyser) {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        return dataArray;
    }

    /**
     * Get time domain data (waveform)
     */
    getTimeDomainData(analyser) {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteTimeDomainData(dataArray);
        return dataArray;
    }

    /**
     * Analyze frequency spectrum
     */
    analyzeSpectrum(audioBuffer) {
        // Simple spectrum analysis
        const data = audioBuffer.getChannelData(0);
        const sampleRate = audioBuffer.sampleRate;

        // Divide into frequency bands
        const bands = {
            subBass: { min: 20, max: 60, energy: 0 },      // 20-60 Hz
            bass: { min: 60, max: 250, energy: 0 },         // 60-250 Hz
            lowMid: { min: 250, max: 500, energy: 0 },      // 250-500 Hz
            mid: { min: 500, max: 2000, energy: 0 },        // 500-2000 Hz
            highMid: { min: 2000, max: 4000, energy: 0 },   // 2000-4000 Hz
            presence: { min: 4000, max: 6000, energy: 0 },  // 4000-6000 Hz
            brilliance: { min: 6000, max: 20000, energy: 0 } // 6000-20000 Hz
        };

        // Calculate energy for each band (simplified)
        for (let i = 0; i < data.length; i++) {
            const sample = Math.abs(data[i]);
            // This is a simplified approach
            // In production, use proper FFT
            for (const bandName in bands) {
                bands[bandName].energy += sample;
            }
        }

        // Normalize
        for (const bandName in bands) {
            bands[bandName].energy /= data.length;
        }

        return bands;
    }

    /**
     * Detect clipping
     */
    detectClipping(audioBuffer, threshold = 0.99) {
        let clippingSamples = 0;
        const totalSamples = audioBuffer.length * audioBuffer.numberOfChannels;

        for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
            const data = audioBuffer.getChannelData(ch);
            for (let i = 0; i < data.length; i++) {
                if (Math.abs(data[i]) >= threshold) {
                    clippingSamples++;
                }
            }
        }

        const clippingPercentage = (clippingSamples / totalSamples) * 100;

        return {
            detected: clippingSamples > 0,
            samples: clippingSamples,
            percentage: clippingPercentage,
            severity: clippingPercentage > 1 ? 'high' : clippingPercentage > 0.1 ? 'medium' : 'low'
        };
    }

    /**
     * Detect silence
     */
    detectSilence(audioBuffer, threshold = -60) {
        const thresholdLinear = Math.pow(10, threshold / 20);
        let silentSamples = 0;
        const totalSamples = audioBuffer.length * audioBuffer.numberOfChannels;

        for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
            const data = audioBuffer.getChannelData(ch);
            for (let i = 0; i < data.length; i++) {
                if (Math.abs(data[i]) < thresholdLinear) {
                    silentSamples++;
                }
            }
        }

        const silencePercentage = (silentSamples / totalSamples) * 100;

        return {
            percentage: silencePercentage,
            duration: (silentSamples / audioBuffer.sampleRate) / audioBuffer.numberOfChannels
        };
    }

    /**
     * Calculate crest factor
     */
    calculateCrestFactor(audioBuffer) {
        let peak = 0;
        let sumSquares = 0;
        let sampleCount = 0;

        for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
            const data = audioBuffer.getChannelData(ch);
            for (let i = 0; i < data.length; i++) {
                const sample = Math.abs(data[i]);
                peak = Math.max(peak, sample);
                sumSquares += data[i] * data[i];
                sampleCount++;
            }
        }

        const rms = Math.sqrt(sumSquares / sampleCount);
        const crestFactor = peak / rms;
        const crestFactorDB = 20 * Math.log10(crestFactor);

        return {
            linear: crestFactor,
            dB: crestFactorDB
        };
    }
}

export default AudioAnalyzer;
