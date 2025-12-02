/**
 * Advanced Audio Processor
 * Main processor that orchestrates all audio enhancements
 */

import { LoudnessProcessor } from './LoudnessProcessor';
import { TruePeakLimiter } from './TruePeakLimiter';
import { NoiseGate } from './NoiseGate';
import { DeEsser } from './DeEsser';
import { NoiseReduction } from './NoiseReduction';
import { ParametricEQ } from './ParametricEQ';
import { StereoProcessor } from './StereoProcessor';

export class AdvancedAudioProcessor {
    constructor(audioContext) {
        this.audioContext = audioContext;

        // Initialize all processors
        this.loudnessProcessor = new LoudnessProcessor(audioContext);
        this.limiter = new TruePeakLimiter(audioContext);
        this.noiseGate = new NoiseGate(audioContext);
        this.deEsser = new DeEsser(audioContext);
        this.noiseReduction = new NoiseReduction(audioContext);
        this.parametricEQ = new ParametricEQ(audioContext);
        this.stereoProcessor = new StereoProcessor(audioContext);
    }

    /**
     * Process audio with full chain
     */
    async processAudio(audioBuffer, settings = {}) {
        let processedBuffer = audioBuffer;

        console.log('🎵 Starting advanced audio processing...');
        console.log('Settings:', settings);

        try {
            // Step 1: Noise Gate (remove silence/noise between words)
            if (settings.noiseGate?.enabled) {
                processedBuffer = await this.noiseGate.applyGate(
                    processedBuffer,
                    settings.noiseGate
                );
            }

            // Step 2: Noise Reduction
            if (settings.noiseReduction?.enabled) {
                processedBuffer = await this.noiseReduction.applyNoiseReduction(
                    processedBuffer,
                    settings.noiseReduction.amount || 15
                );
            }

            // Step 3: De-esser (remove sibilance)
            if (settings.deEsser?.enabled) {
                processedBuffer = await this.deEsser.applyDeEssing(
                    processedBuffer,
                    settings.deEsser
                );
            }

            // Step 4: Parametric EQ
            if (settings.eq?.enabled && settings.eq?.bands) {
                processedBuffer = await this.parametricEQ.applyEQ(
                    processedBuffer,
                    settings.eq.bands
                );
            }

            // Step 5: Stereo Enhancement
            if (settings.stereo?.enabled && processedBuffer.numberOfChannels === 2) {
                processedBuffer = await this.stereoProcessor.adjustWidth(
                    processedBuffer,
                    settings.stereo.width || 1.0
                );
            }

            // Step 6: Loudness Normalization (LUFS)
            if (settings.loudness?.enabled) {
                processedBuffer = await this.loudnessProcessor.normalizeToLUFS(
                    processedBuffer,
                    settings.loudness.target || -16
                );
            }

            // Step 7: True-Peak Limiting (final safety)
            if (settings.limiter?.enabled) {
                processedBuffer = await this.limiter.applyLimiting(
                    processedBuffer,
                    settings.limiter.ceiling || -0.5
                );
            }

            console.log('✅ Advanced processing complete!');
            return processedBuffer;

        } catch (error) {
            console.error('❌ Error during processing:', error);
            return audioBuffer; // Return original if processing fails
        }
    }

    /**
     * Analyze audio quality metrics
     */
    async analyzeAudio(audioBuffer) {
        try {
            console.log('📊 Analyzing audio...');

            const analysis = {};

            // LUFS measurement
            analysis.lufs = await this.loudnessProcessor.calculateLUFS(audioBuffer);

            // Peak levels
            analysis.peak = this.calculatePeak(audioBuffer);
            analysis.peakDB = 20 * Math.log10(analysis.peak);

            // Dynamic range
            analysis.dynamicRange = this.calculateDynamicRange(audioBuffer);

            // Stereo information (if stereo)
            if (audioBuffer.numberOfChannels === 2) {
                analysis.stereoWidth = this.stereoProcessor.analyzeStereoWidth(audioBuffer);
                analysis.phase = this.stereoProcessor.analyzePhaseCorrelation(audioBuffer);
            }

            // Noise floor
            const noiseFloor = this.noiseReduction.analyzeNoiseFloor(audioBuffer);
            analysis.noiseFloor = noiseFloor.dB;

            console.log('Analysis results:', analysis);
            return analysis;

        } catch (error) {
            console.error('Error analyzing audio:', error);
            return null;
        }
    }

    /**
     * Calculate peak value
     */
    calculatePeak(audioBuffer) {
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
     * Calculate RMS (Root Mean Square)
     */
    calculateRMS(audioBuffer) {
        let sumSquares = 0;
        let sampleCount = 0;

        for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
            const data = audioBuffer.getChannelData(ch);
            for (let i = 0; i < data.length; i++) {
                sumSquares += data[i] * data[i];
                sampleCount++;
            }
        }

        return Math.sqrt(sumSquares / sampleCount);
    }

    /**
     * Calculate dynamic range
     */
    calculateDynamicRange(audioBuffer) {
        const peak = this.calculatePeak(audioBuffer);
        const rms = this.calculateRMS(audioBuffer);

        if (rms === 0) return 0;
        return 20 * Math.log10(peak / rms);
    }

    /**
     * Get preset settings
     */
    getPresetSettings(presetName) {
        const presets = {
            podcast: {
                noiseGate: { enabled: true, threshold: -45, range: -80 },
                noiseReduction: { enabled: true, amount: 12 },
                deEsser: { enabled: true, frequency: 7000, threshold: -25, amount: 6 },
                eq: {
                    enabled: true,
                    bands: this.parametricEQ.getPresetCurve('podcast')
                },
                stereo: { enabled: false, width: 1.0 },
                loudness: { enabled: true, target: -16 },
                limiter: { enabled: true, ceiling: -0.5 }
            },
            voice: {
                noiseGate: { enabled: true, threshold: -40, range: -70 },
                noiseReduction: { enabled: true, amount: 15 },
                deEsser: { enabled: true, frequency: 6500, threshold: -28, amount: 5 },
                eq: {
                    enabled: true,
                    bands: this.parametricEQ.getPresetCurve('voice')
                },
                stereo: { enabled: false, width: 1.0 },
                loudness: { enabled: true, target: -18 },
                limiter: { enabled: true, ceiling: -1.0 }
            }
        };

        return presets[presetName] || presets.podcast;
    }

    /**
     * Quick enhance with automatic settings
     */
    async autoEnhance(audioBuffer, purpose = 'podcast') {
        const settings = this.getPresetSettings(purpose);
        return await this.processAudio(audioBuffer, settings);
    }
}

export default AdvancedAudioProcessor;
