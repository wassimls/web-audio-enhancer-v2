/**
 * Parametric EQ
 * Multi-band parametric equalizer
 */

export class ParametricEQ {
    constructor(audioContext) {
        this.audioContext = audioContext;
    }

    /**
     * Apply parametric EQ with custom bands
     */
    async applyEQ(audioBuffer, bands) {
        try {
            console.log(`🎛️ Applying Parametric EQ (${bands.length} bands)`);

            const offlineContext = new OfflineAudioContext(
                audioBuffer.numberOfChannels,
                audioBuffer.length,
                audioBuffer.sampleRate
            );

            const source = offlineContext.createBufferSource();
            source.buffer = audioBuffer;

            // Create EQ chain
            let current = source;

            bands.forEach((band, index) => {
                const filter = offlineContext.createBiquadFilter();

                // Determine filter type
                if (index === 0) {
                    filter.type = 'lowshelf';
                } else if (index === bands.length - 1) {
                    filter.type = 'highshelf';
                } else {
                    filter.type = 'peaking';
                }

                filter.frequency.value = band.freq;
                filter.Q.value = band.q || 1.0;
                filter.gain.value = band.gain;

                current.connect(filter);
                current = filter;
            });

            current.connect(offlineContext.destination);

            source.start();
            return await offlineContext.startRendering();
        } catch (error) {
            console.error('Error applying EQ:', error);
            return audioBuffer;
        }
    }

    /**
     * Create standard EQ bands
     */
    createStandardBands() {
        return [
            { freq: 80, gain: 0, q: 0.7, type: 'lowshelf' },
            { freq: 200, gain: 0, q: 1.0, type: 'peaking' },
            { freq: 500, gain: 0, q: 0.7, type: 'peaking' },
            { freq: 1000, gain: 0, q: 1.0, type: 'peaking' },
            { freq: 3000, gain: 0, q: 1.5, type: 'peaking' },
            { freq: 8000, gain: 0, q: 0.7, type: 'highshelf' }
        ];
    }

    /**
     * Apply preset EQ curves
     */
    getPresetCurve(presetName) {
        const presets = {
            podcast: [
                { freq: 80, gain: -6, q: 0.7 },
                { freq: 200, gain: -3, q: 1.0 },
                { freq: 500, gain: 2, q: 0.7 },
                { freq: 1000, gain: 1, q: 1.0 },
                { freq: 3000, gain: 4, q: 1.5 },
                { freq: 8000, gain: 2, q: 0.7 }
            ],
            voice: [
                { freq: 80, gain: -4, q: 0.7 },
                { freq: 200, gain: -2, q: 1.0 },
                { freq: 500, gain: 1, q: 0.7 },
                { freq: 1000, gain: 3, q: 1.2 },
                { freq: 3000, gain: 5, q: 1.5 },
                { freq: 8000, gain: 3, q: 0.7 }
            ]
        };

        return presets[presetName] || this.createStandardBands();
    }
}
