/**
    cacheElements() {
        return {
            // Upload
            uploadArea: document.getElementById('upload-area'),
            fileInput: document.getElementById('audio-file-input'),
            fileInfo: document.getElementById('file-info'),
            fileName: document.getElementById('file-name'),
            fileSize: document.getElementById('file-size'),
            fileDuration: document.getElementById('file-duration'),
            fileRemoveBtn: document.getElementById('file-remove-btn'),

            // Sections
            uploadSection: document.getElementById('upload-section'),
            waveformSection: document.getElementById('waveform-section'),
            presetsSection: document.getElementById('presets-section'),
            noiseSection: document.getElementById('noise-section'),
            filtersSection: document.getElementById('filters-section'),
            exportSection: document.getElementById('export-section'),

            // Playback
            playPauseBtn: document.getElementById('play-pause-btn'),
            stopBtn: document.getElementById('stop-btn'),
            loopBtn: document.getElementById('loop-btn'),
            currentTime: document.getElementById('current-time'),
            totalTime: document.getElementById('total-time'),
            waveformCanvas: document.getElementById('waveform-canvas'),

            // Theme
            themeToggle: document.getElementById('theme-toggle'),
            themeIcon: document.getElementById('theme-icon'),

            // Presets
            presetBtns: document.querySelectorAll('.preset-btn'),

            // Export
            exportBtn: document.getElementById('export-btn'),
            exportFormat: document.getElementById('export-format'),
            exportQuality: document.getElementById('export-quality')
        };
    }

    /**
     * Initialize event listeners
     */
initializeEventListeners() {
    // Upload area
    Utils.addListener(this.elements.uploadArea, 'click', () => {
        this.elements.fileInput.click();
    });

    Utils.addListener(this.elements.uploadArea, 'dragover', (e) => {
        e.preventDefault();
        this.elements.uploadArea.classList.add('drag-over');
    });

    Utils.addListener(this.elements.uploadArea, 'dragleave', () => {
        this.elements.uploadArea.classList.remove('drag-over');
    });

    Utils.addListener(this.elements.uploadArea, 'drop', (e) => {
        e.preventDefault();
        this.elements.uploadArea.classList.remove('drag-over');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.handleFileSelect(files[0]);
        }
    });

    Utils.addListener(this.elements.fileInput, 'change', (e) => {
        if (e.target.files.length > 0) {
            this.handleFileSelect(e.target.files[0]);
        }
    });

    Utils.addListener(this.elements.fileRemoveBtn, 'click', () => {
        this.clearFile();
    });

    // Theme toggle
    Utils.addListener(this.elements.themeToggle, 'click', () => {
        this.toggleTheme();
    });
}

/**
 * Handle file selection
 */
handleFileSelect(file) {
    if (!Utils.isAudioFile(file)) {
        showNotification('يرجى اختيار ملف صوتي صحيح', 'error');
        return;
    }

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('fileSelected', { detail: { file } }));
}

/**
 * Display file info
 */
displayFileInfo(file, duration) {
    this.elements.fileName.textContent = file.name;
    this.elements.fileSize.textContent = Utils.formatFileSize(file.size);
    this.elements.fileDuration.textContent = Utils.formatTime(duration);

    Utils.show(this.elements.fileInfo);
    this.showProcessingSections();
}

/**
 * Show processing sections
 */
showProcessingSections() {
    Utils.show(this.elements.waveformSection);
    Utils.show(this.elements.presetsSection);
    Utils.show(this.elements.noiseSection);
    Utils.show(this.elements.filtersSection);
    Utils.show(this.elements.exportSection);
}

/**
 * Hide processing sections
 */
hideProcessingSections() {
    Utils.hide(this.elements.waveformSection);
    Utils.hide(this.elements.presetsSection);
    Utils.hide(this.elements.noiseSection);
    Utils.hide(this.elements.filtersSection);
    Utils.hide(this.elements.exportSection);
}

/**
 * Clear file
 */
clearFile() {
    this.elements.fileInput.value = '';
    Utils.hide(this.elements.fileInfo);
    this.hideProcessingSections();

    window.dispatchEvent(new Event('fileCleared'));
}

/**
 * Update playback button
 */
updatePlaybackButton(isPlaying) {
    this.elements.playPauseBtn.textContent = isPlaying ? '⏸' : '▶️';
}

/**
 * Update time display
 */
updateTimeDisplay(current, total) {
    this.elements.currentTime.textContent = Utils.formatTime(current);
    this.elements.totalTime.textContent = Utils.formatTime(total);
}

/**
 * Initialize theme
    const valueElement = document.getElementById(`${sliderId}-value`);
    if (valueElement) {
        valueElement.textContent = value + unit;
    }
}
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type} animate-slide-in-right`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.remove('animate-slide-in-right');
        notification.classList.add('animate-fade-out');

        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Make notification globally available
window.showNotification = showNotification;

console.log('✅ UI Controller loaded successfully');
