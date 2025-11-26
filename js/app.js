/**
 * Main Application - Audio Enhancer v2
 * Entry point and application orchestration
 */

class AudioEnhancerApp {
    constructor() {
        this.audioProcessor = null;
        this.uiController = null;
        this.presetsManager = null;
        this.currentFile = null;
        this.animationId = null;

        this.init();
    }

    /**
     * Initialize application
     */
    async init() {
        console.log('🎵 Audio Enhancer v2 - Initializing...');

        // Check browser support
        if (!Utils.isWebAudioSupported()) {
            alert('متصفحك لا يدعم Web Audio API. يرجى استخدام متصفح حديث.');
            return;
        }

        // Initialize components
        this.uiController = new UIController();
        this.audioProcessor = new AudioProcessor();
        this.presetsManager = new PresetsManager();

        // Setup event listeners
        this.setupEventListeners();

        console.log('✅ Application initialized successfully');
        showNotification('مرحباً بك في محسّن الصوت! 🎵', 'success');
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // File events
        window.addEventListener('fileSelected', (e) => {
            this.handleFileLoad(e.detail.file);
        });

        window.addEventListener('fileCleared', () => {
            this.handleFileClear();
        });

        // Playback controls
        Utils.addListener(document.getElementById('play-pause-btn'), 'click', () => {
            this.togglePlayback();
        });

        Utils.addListener(document.getElementById('stop-btn'), 'click', () => {
            this.audioProcessor.stop();
            this.uiController.updatePlaybackButton(false);
        });

        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            Utils.addListener(btn, 'click', () => {
                const preset = btn.getAttribute('data-preset');
                this.applyPreset(preset);

                // Update active state
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Filter toggles and sliders
        this.setupFilterControls();

        // Export button
        Utils.addListener(document.getElementById('export-btn'), 'click', () => {
            this.exportAudio();
        });

        // Add preview button dynamically
        this.addPreviewButton();
    }

    /**
     * Add preview button to export section
     */
    addPreviewButton() {
        const exportBtn = document.getElementById('export-btn');
        if (!exportBtn) return;

        // Check if preview button already exists
        if (document.getElementById('preview-enhanced-btn')) return;

        // Create preview button
        const previewBtn = document.createElement('button');
        previewBtn.id = 'preview-enhanced-btn';
        previewBtn.className = 'btn btn-secondary btn-lg';
        previewBtn.style.marginBottom = 'var(--space-4)';
        previewBtn.style.width = '100%';
        previewBtn.innerHTML = '🎧 معاينة الصوت المحسّن';

        // Add event listener
        Utils.addListener(previewBtn, 'click', () => {
            this.previewEnhancedAudio();
        });

        // Insert before export button
        exportBtn.parentElement.insertBefore(previewBtn, exportBtn);
    }

    /**
     * Preview enhanced audio
     */
    previewEnhancedAudio() {
        if (!this.audioProcessor.audioBuffer) {
            showNotification('الرجاء رفع ملف صوتي أولاً', 'warning');
            return;
        }

        // Stop current playback if any
        if (this.audioProcessor.isPlaying) {
            this.audioProcessor.stop();
        }

        // Start playback
        this.audioProcessor.play();
        this.uiController.updatePlaybackButton(true);
        this.updateTime();

        showNotification('جاري تشغيل الصوت المحسّن... 🎧', 'info');
    }

    /**
     * Setup filter controls
     */
    setupFilterControls() {
        // Noise reduction
        Utils.addListener(document.getElementById('noise-toggle'), 'change', (e) => {
            document.getElementById('noise-card').classList.toggle('active', e.target.checked);
        });

        Utils.addListener(document.getElementById('noise-level'), 'input', (e) => {
            const value = e.target.value;
            this.uiController.updateSliderValue('noise-level', value, '%');
            this.audioProcessor.noiseReduction.applyLevel(value);
        });

        // Equalizer
        Utils.addListener(document.getElementById('eq-toggle'), 'change', (e) => {
            document.getElementById('eq-card').classList.toggle('active', e.target.checked);
        });

        ['bass', 'mid', 'treble'].forEach(band => {
            Utils.addListener(document.getElementById(`eq-${band}`), 'input', (e) => {
                const value = e.target.value;
                this.uiController.updateSliderValue(`eq-${band}`, value, ' dB');

                const bass = document.getElementById('eq-bass').value;
                const mid = document.getElementById('eq-mid').value;
                const treble = document.getElementById('eq-treble').value;
                this.audioProcessor.filters.applyEqualizer(bass, mid, treble);
            });
        });

        // Compressor
        Utils.addListener(document.getElementById('compressor-toggle'), 'change', (e) => {
            document.getElementById('compressor-card').classList.toggle('active', e.target.checked);
        });

        Utils.addListener(document.getElementById('compressor-threshold'), 'input', (e) => {
            const value = e.target.value;
            this.uiController.updateSliderValue('compressor-threshold', value, ' dB');

            const threshold = value;
            const ratio = document.getElementById('compressor-ratio').value;
            this.audioProcessor.filters.applyCompressor(threshold, ratio);
        });

        Utils.addListener(document.getElementById('compressor-ratio'), 'input', (e) => {
            const value = e.target.value;
            this.uiController.updateSliderValue('compressor-ratio', `${value}:1`, '');

            const threshold = document.getElementById('compressor-threshold').value;
            const ratio = value;
            this.audioProcessor.filters.applyCompressor(threshold, ratio);
        });

        // Reverb
        Utils.addListener(document.getElementById('reverb-toggle'), 'change', (e) => {
            document.getElementById('reverb-card').classList.toggle('active', e.target.checked);
        });

        Utils.addListener(document.getElementById('reverb-level'), 'input', (e) => {
            const value = e.target.value;
            this.uiController.updateSliderValue('reverb-level', value, '%');
            this.audioProcessor.filters.applyReverb(value);
        });

        // Bass Boost
        Utils.addListener(document.getElementById('bass-boost-toggle'), 'change', (e) => {
            document.getElementById('bass-card').classList.toggle('active', e.target.checked);
        });

        Utils.addListener(document.getElementById('bass-boost'), 'input', (e) => {
            const value = e.target.value;
            this.uiController.updateSliderValue('bass-boost', value, ' dB');
            this.audioProcessor.filters.applyBassBoost(value);
        });
    }

    /**
     * Handle file load
     */
    async handleFileLoad(file) {
        try {
            showNotification('جاري تحميل الملف...', 'info');

            this.currentFile = file;
            const audioBuffer = await this.audioProcessor.loadAudioFile(file);

            // Update UI
            this.uiController.displayFileInfo(file, audioBuffer.duration);
            this.uiController.updateTimeDisplay(0, audioBuffer.duration);

            // Start waveform visualization
            this.startVisualization();

            showNotification('تم تحميل الملف بنجاح! ✅', 'success');
        } catch (error) {
            Utils.handleError(error, 'handleFileLoad');
        }
    }

    /**
     * Handle file clear
     */
    handleFileClear() {
        this.audioProcessor.stop();
        this.currentFile = null;
        this.stopVisualization();
    }

    /**
     * Toggle playback
     */
    togglePlayback() {
        if (this.audioProcessor.isPlaying) {
            this.audioProcessor.pause();
            this.uiController.updatePlaybackButton(false);
        } else {
            this.audioProcessor.play();
            this.uiController.updatePlaybackButton(true);
            this.updateTime();
        }
    }

    /**
     * Update time display
     */
    updateTime() {
        if (!this.audioProcessor.isPlaying) return;

        const current = this.audioProcessor.getCurrentTime();
        const duration = this.audioProcessor.getDuration();

        this.uiController.updateTimeDisplay(current, duration);

        if (current < duration) {
            Utils.requestAnimFrame(() => this.updateTime());
        } else {
            this.audioProcessor.stop();
            this.uiController.updatePlaybackButton(false);
        }
    }

    /**
     * Start waveform visualization
     */
    startVisualization() {
        const canvas = document.getElementById('waveform-canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const draw = () => {
            this.animationId = Utils.requestAnimFrame(draw);

            const dataArray = this.audioProcessor.getAnalyserData();
            const bufferLength = dataArray.length;

            // Clear canvas
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw waveform
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#667eea';
            ctx.beginPath();

            const sliceWidth = canvas.width / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * canvas.height / 2;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            ctx.stroke();
        };

        draw();
    }

    /**
     * Stop visualization
     */
    stopVisualization() {
        if (this.animationId) {
            Utils.cancelAnimFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Apply preset
     */
    applyPreset(presetKey) {
        const settings = this.presetsManager.applyPreset(presetKey);

        // Apply noise reduction
        document.getElementById('noise-toggle').checked = settings.noise.enabled;
        document.getElementById('noise-level').value = settings.noise.level;
        this.uiController.updateSliderValue('noise-level', settings.noise.level, '%');

        // Apply equalizer
        document.getElementById('eq-toggle').checked = settings.equalizer.enabled;
        document.getElementById('eq-bass').value = settings.equalizer.bass;
        document.getElementById('eq-mid').value = settings.equalizer.mid;
        document.getElementById('eq-treble').value = settings.equalizer.treble;
        this.uiController.updateSliderValue('eq-bass', settings.equalizer.bass, ' dB');
        this.uiController.updateSliderValue('eq-mid', settings.equalizer.mid, ' dB');
        this.uiController.updateSliderValue('eq-treble', settings.equalizer.treble, ' dB');

        // Apply compressor
        document.getElementById('compressor-toggle').checked = settings.compressor.enabled;
        document.getElementById('compressor-threshold').value = settings.compressor.threshold;
        document.getElementById('compressor-ratio').value = settings.compressor.ratio;
        this.uiController.updateSliderValue('compressor-threshold', settings.compressor.threshold, ' dB');
        this.uiController.updateSliderValue('compressor-ratio', `${settings.compressor.ratio}:1`, '');

        // Apply reverb
        document.getElementById('reverb-toggle').checked = settings.reverb.enabled;
        document.getElementById('reverb-level').value = settings.reverb.level;
        this.uiController.updateSliderValue('reverb-level', settings.reverb.level, '%');

        // Apply bass boost
        document.getElementById('bass-boost-toggle').checked = settings.bassBoost.enabled;
        document.getElementById('bass-boost').value = settings.bassBoost.level;
        this.uiController.updateSliderValue('bass-boost', settings.bassBoost.level, ' dB');

        // Trigger filter updates
        this.audioProcessor.noiseReduction.applyLevel(settings.noise.level);
        this.audioProcessor.filters.applyEqualizer(
            settings.equalizer.bass,
            settings.equalizer.mid,
            settings.equalizer.treble
        );
        this.audioProcessor.filters.applyCompressor(
            settings.compressor.threshold,
            settings.compressor.ratio
        );
        this.audioProcessor.filters.applyReverb(settings.reverb.level);
        this.audioProcessor.filters.applyBassBoost(settings.bassBoost.level);

        showNotification(`تم تطبيق القالب: ${PRESETS[presetKey].nameAr}`, 'success');
    }

    /**
     * Export audio
     */
    async exportAudio() {
        try {
            showNotification('جاري تصدير الملف...', 'info');

            const format = document.getElementById('export-format').value;
            const quality = document.getElementById('export-quality').value;

            const blob = await this.audioProcessor.exportAudio(format, quality);

            const filename = this.currentFile.name.replace(/\.[^/.]+$/, '') + `_enhanced.${format}`;
            Utils.downloadBlob(blob, filename);

            showNotification('تم تصدير الملف بنجاح! 🎉', 'success');
        } catch (error) {
            Utils.handleError(error, 'exportAudio');
        }
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new AudioEnhancerApp();
    });
} else {
    window.app = new AudioEnhancerApp();
}

console.log('✅ Main Application loaded successfully');
