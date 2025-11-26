/**
 * Audio Processor - Audio Enhancer v2
 * Main audio processing engine using Web Audio API
 */

class AudioProcessor {
    constructor() {
        this.audioContext = null;
        this.sourceNode = null;
        this.audioBuffer = null;
        this.filters = null;
        this.noiseReduction = null;
        this.analyser = null;
        this.isPlaying = false;
        this.startTime = 0;
        this.pauseTime = 0;

        this.init();
    }

    /**
     * Initialize Audio Context
     */
    init() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();

            // Create analyser for visualization
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;

            // Create filters
            this.filters = new AudioFilters(this.audioContext);
            this.noiseReduction = new NoiseReduction(this.audioContext);

            Utils.log('Audio Context initialized');
        } catch (error) {
            Utils.handleError(error, 'AudioProcessor.init');
        }
    }

    /**
     * Load audio file
     */
    async loadAudioFile(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

            Utils.log(`Audio loaded: ${this.audioBuffer.duration.toFixed(2)}s`);
            return this.audioBuffer;
        } catch (error) {
            Utils.handleError(error, 'AudioProcessor.loadAudioFile');
            throw error;
        }
    }

    /**
     * Create filter chain
     */
    createFilterChain() {
        // Create all filters
        const eq = this.filters.createEqualizer();
        const compressor = this.filters.createCompressor();
        const reverb = this.filters.createReverb();
        const bassBoost = this.filters.createBassBoost();
        const noiseReduction = this.noiseReduction.createNoiseReduction();

        // Build chain: source -> noise -> eq -> bass -> compressor -> analyser -> destination
        let currentNode = noiseReduction.output;

        currentNode.connect(eq.input);
        currentNode = eq.output;

        currentNode.connect(bassBoost);
        currentNode = bassBoost;

        currentNode.connect(compressor);
        currentNode = compressor;

        currentNode.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        return {
            input: noiseReduction.input,
            output: this.audioContext.destination
        };
    }

    /**
     * Play audio
     */
    play() {
        if (!this.audioBuffer) return;

        // Stop current playback
        this.stop();

        // Create new source
        this.sourceNode = this.audioContext.createBufferSource();
        this.sourceNode.buffer = this.audioBuffer;

        // Create and connect filter chain
        const chain = this.createFilterChain();
        this.sourceNode.connect(chain.input);

        // Calculate start offset
        const offset = this.pauseTime || 0;

        // Start playing
        this.sourceNode.start(0, offset);
        this.startTime = this.audioContext.currentTime - offset;
        this.isPlaying = true;

        // Handle playback end
        this.sourceNode.onended = () => {
            if (this.isPlaying) {
                this.stop();
            }
        };

        Utils.log('Playback started');
    }

    /**
     * Pause audio
     */
    pause() {
        if (!this.isPlaying) return;

        this.pauseTime = this.audioContext.currentTime - this.startTime;
        this.stop();

        Utils.log('Playback paused');
    }

    /**
     * Stop audio
     */
    stop() {
        if (this.sourceNode) {
            try {
                this.sourceNode.stop();
            } catch (e) {
                // Already stopped
            }
            this.sourceNode = null;
        }

        this.isPlaying = false;
        this.pauseTime = 0;

        Utils.log('Playback stopped');
    }

    /**
     * Get current time
     */
    getCurrentTime() {
        if (!this.isPlaying) return this.pauseTime;
        return this.audioContext.currentTime - this.startTime;
    }

    /**
     * Get duration
     */
    getDuration() {
        return this.audioBuffer ? this.audioBuffer.duration : 0;
    }

    /**
     * Get analyser data for visualization
     */
    getAnalyserData() {
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteTimeDomainData(dataArray);
        return dataArray;
    }

    /**
     * Export processed audio
     */
    async exportAudio(format = 'wav', quality = 320) {
        try {
            // For now, export original buffer
            // TODO: Implement offline rendering with filters
            const blob = await this.audioBufferToWav(this.audioBuffer);
            return blob;
        } catch (error) {
            Utils.handleError(error, 'AudioProcessor.exportAudio');
            throw error;
        }
    }

    /**
     * Convert AudioBuffer to WAV Blob
     */
    audioBufferToWav(buffer) {
        const length = buffer.length * buffer.numberOfChannels * 2 + 44;
        const arrayBuffer = new ArrayBuffer(length);
        const view = new DataView(arrayBuffer);
        const channels = [];
        let offset = 0;
        let pos = 0;

        // Write WAV header
        const setUint16 = (data) => {
            view.setUint16(pos, data, true);
            pos += 2;
        };
        const setUint32 = (data) => {
            view.setUint32(pos, data, true);
            pos += 4;
        };

        // RIFF identifier
        setUint32(0x46464952);
        // File length
        setUint32(length - 8);
        // WAVE identifier
        setUint32(0x45564157);
        // Format chunk identifier
        setUint32(0x20746d66);
        // Format chunk length
        setUint32(16);
        // Sample format (PCM)
        setUint16(1);
        // Channel count
        setUint16(buffer.numberOfChannels);
        // Sample rate
        setUint32(buffer.sampleRate);
        // Byte rate
        setUint32(buffer.sampleRate * 4);
        // Block align
        setUint16(buffer.numberOfChannels * 2);
        // Bits per sample
        setUint16(16);
        // Data chunk identifier
        setUint32(0x61746164);
        // Data chunk length
        setUint32(length - pos - 4);

        // Write interleaved data
        for (let i = 0; i < buffer.numberOfChannels; i++) {
            channels.push(buffer.getChannelData(i));
        }

        while (pos < length) {
            for (let i = 0; i < buffer.numberOfChannels; i++) {
                let sample = Math.max(-1, Math.min(1, channels[i][offset]));
                sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
                view.setInt16(pos, sample, true);
                pos += 2;
            }
            offset++;
        }

        return new Blob([arrayBuffer], { type: 'audio/wav' });
    }
}

console.log('✅ Audio Processor loaded successfully');
