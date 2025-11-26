/**
 * Utility Functions - Audio Enhancer v2
 * Helper functions for audio processing, file handling, and general utilities
 */

// ======== File Utilities ======== //

/** 
 * Format file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format time in mm:ss format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time
 */
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get file extension
 * @param {string} filename - File name
 * @returns {string} File extension
 */
function getFileExtension(filename) {
    return filename.slice(filename.lastIndexOf('.') + 1).toLowerCase();
}

/**
 * Check if file is audio
 * @param {File} file - File object
 * @returns {boolean} True if audio file
 */
function isAudioFile(file) {
    const validExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma'];
    const extension = getFileExtension(file.name);

    return validExtensions.includes(extension) || file.type.startsWith('audio/');
}

// ======== Audio Math Utilities ======== //

/**
 * Convert linear gain to decibels
 * @param {number} gain - Linear gain value
 * @returns {number} Decibel value
 */
function gainToDb(gain) {
    return 20 * Math.log10(gain);
}

/**
 * Convert decibels to linear gain
 * @param {number} db - Decibel value
 * @returns {number} Linear gain value
 */
function dbToGain(db) {
    return Math.pow(10, db / 20);
}

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
function lerp(start, end, t) {
    return start + (end - start) * t;
}

// ======== Browser Support Detection ======== //

/**
 * Check for Web Audio API support
 * @returns {boolean} True if supported
 */
function isWebAudioSupported() {
    return !!(window.AudioContext || window.webkitAudioContext);
}

/**
 * Check for PWA support
 * @returns {boolean} True if supported
 */
function isPWASupported() {
    return 'serviceWorker' in navigator && 'caches' in window;
}

/**
 * Check if running as PWA
 * @returns {boolean} True if installed as PWA
 */
function isRunningAsPWA() {
    return window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
}

/**
 * Detect mobile device
 * @returns {boolean} True if mobile
 */
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// ======== DOM Utilities ======== //

/**
 * Show element
 * @param {HTMLElement|string} element - Element or selector
 */
function show(element) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (el) el.classList.remove('hidden');
}

/**
 * Hide element
 * @param {HTMLElement|string} element - Element or selector
 */
function hide(element) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (el) el.classList.add('hidden');
}

/**
 * Toggle element visibility
 * @param {HTMLElement|string} element - Element or selector
 */
function toggle(element) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (el) el.classList.toggle('hidden');
}

/**
 * Add event listener with error handling
 * @param {HTMLElement} element - Element to attach listener
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 */
function addListener(element, event, handler) {
    if (!element) {
        console.error('Element not found for event listener:', event);
        return;
    }

    element.addEventListener(event, (e) => {
        try {
            handler(e);
        } catch (error) {
            console.error(`Error in ${event} handler:`, error);
        }
    });
}

// ======== Local Storage Utilities ======== //

/**
 * Save to local storage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 */
function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
    }
}

/**
 * Load from local storage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if not found
 * @returns {any} Stored value or default
 */
function loadFromStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Failed to load from localStorage:', error);
        return defaultValue;
    }
}

/**
 * Remove from local storage
 * @param {string} key - Storage key
 */
function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Failed to remove from localStorage:', error);
    }
}

// ======== Debounce & Throttle ======== //

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ======== Error Handling ======== //

/**
 * Global error handler
 * @param {Error} error - Error object
 * @param {string} context - Error context
 */
function handleError(error, context = 'Unknown') {
    console.error(`[${context}] Error:`, error);

    // Show user-friendly message
    showNotification(
        'حدث خطأ: ' + (error.message || 'خطأ غير معروف'),
        'error'
    );
}

/**
 * Log with timestamp
 * @param {string} message - Log message
 * @param {any} data - Optional data to log
 */
function log(message, data = null) {
    const timestamp = new Date().toLocaleTimeString('ar-SA');
    console.log(`[${timestamp}] ${message}`, data || '');
}

// ======== Download Utilities ======== //

/**
 * Download blob as file
 * @param {Blob} blob - Blob to download
 * @param {string} filename - File name
 */
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ======== Animation Frame Request ======== //

/**
 * Request animation frame with fallback
 * @param {Function} callback - Animation callback
 * @returns {number} Request ID
 */
const requestAnimFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function (callback) {
        return window.setTimeout(callback, 1000 / 60);
    };

/**
 * Cancel animation frame
 * @param {number} id - Request ID
 */
const cancelAnimFrame = window.cancelAnimationFrame ||
    window.webkitCancelAnimationFrame ||
    window.mozCancelAnimationFrame ||
    function (id) {
        clearTimeout(id);
    };

// ======== Export Utilities ======== //

// Make utilities globally accessible
window.Utils = {
    // File utilities
    formatFileSize,
    formatTime,
    getFileExtension,
    isAudioFile,

    // Audio math
    gainToDb,
    dbToGain,
    clamp,
    lerp,

    // Browser support
    isWebAudioSupported,
    isPWASupported,
    isRunningAsPWA,
    isMobile,

    // DOM utilities
    show,
    hide,
    toggle,
    addListener,

    // Storage
    saveToStorage,
    loadFromStorage,
    removeFromStorage,

    // Performance
    debounce,
    throttle,

    // Error handling
    handleError,
    log,

    // Download
    downloadBlob,

    // Animation
    requestAnimFrame,
    cancelAnimFrame
};

console.log('✅ Utils loaded successfully');
