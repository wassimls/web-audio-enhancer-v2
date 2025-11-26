/**
 * Presets - Audio Enhancer v2
 * Pre-configured audio enhancement settings
 */

const PRESETS = {
    voice: {
        name: 'Voice Enhancement',
        nameAr: 'تحسين الصوت',
        description: 'Optimized for voice recordings and podcasts',
        descriptionAr: 'محسّن لتسجيلات الصوت والبودكاست',
        settings: {
            noise: {
                enabled: true,
                level: 60
            },
            equalizer: {
                enabled: true,
                bass: -2,
                mid: 4,
                treble: 2
            },
            compressor: {
                enabled: true,
                threshold: -20,
                ratio: 4
            },
            reverb: {
                enabled: false,
                level: 0
            },
            bassBoost: {
                enabled: false,
                level: 0
            }
        }
    },

    music: {
        name: 'Music',
        nameAr: 'موسيقى',
        description: 'Balanced settings for music',
        descriptionAr: 'إعدادات متوازنة للموسيقى',
        settings: {
            noise: {
                enabled: false,
                level: 30
            },
            equalizer: {
                enabled: true,
                bass: 3,
                mid: 0,
                treble: 2
            },
            compressor: {
                enabled: true,
                threshold: -18,
                ratio: 3
            },
            reverb: {
                enabled: true,
                level: 25
            },
            bassBoost: {
                enabled: true,
                level: 4
            }
        }
    },

    podcast: {
        name: 'Podcast',
        nameAr: 'بودكاست',
        description: 'Clear speech with background noise reduction',
        descriptionAr: 'كلام واضح مع تقليل الضوضاء',
        settings: {
            noise: {
                enabled: true,
                level: 70
            },
            equalizer: {
                enabled: true,
                bass: -3,
                mid: 5,
                treble: 3
            },
            compressor: {
                enabled: true,
                threshold: -22,
                ratio: 6
            },
            reverb: {
                enabled: false,
                level: 0
            },
            bassBoost: {
                enabled: false,
                level: 0
            }
        }
    },

    custom: {
        name: 'Custom',
        nameAr: 'مخصص',
        description: 'Manual settings',
        descriptionAr: 'إعدادات يدوية',
        settings: {
            noise: {
                enabled: false,
                level: 50
            },
            equalizer: {
                enabled: false,
                bass: 0,
                mid: 0,
                treble: 0
            },
            compressor: {
                enabled: false,
                threshold: -24,
                ratio: 4
            },
            reverb: {
                enabled: false,
                level: 30
            },
            bassBoost: {
                enabled: false,
                level: 0
            }
        }
    }
};

/**
 * Presets Manager
 */
class PresetsManager {
    constructor() {
        this.currentPreset = 'custom';
        this.userPresets = this.loadUserPresets();
    }

    /**
     * Get preset by key
     * @param {string} key - Preset key
     * @returns {object} Preset configuration
     */
    getPreset(key) {
        return PRESETS[key] || PRESETS.custom;
    }

    /**
     * Apply preset
     * @param {string} key - Preset key
     */
    applyPreset(key) {
        const preset = this.getPreset(key);
        this.currentPreset = key;

        Utils.log(`Applying preset: ${preset.name}`);

        return preset.settings;
    }

    /**
     * Save user preset
     * @param {string} name - Preset name
     * @param {object} settings - Preset settings
     */
    saveUserPreset(name, settings) {
        this.userPresets[name] = {
            name,
            settings,
            createdAt: Date.now()
        };

        Utils.saveToStorage('userPresets', this.userPresets);
        Utils.log(`Saved user preset: ${name}`);
    }

    /**
     * Load user presets from storage
     * @returns {object} User presets
     */
    loadUserPresets() {
        return Utils.loadFromStorage('userPresets', {});
    }

    /**
     * Delete user preset
     * @param {string} name - Preset name
     */
    deleteUserPreset(name) {
        delete this.userPresets[name];
        Utils.saveToStorage('userPresets', this.userPresets);
        Utils.log(`Deleted user preset: ${name}`);
    }

    /**
     * Get all available presets
     * @returns {object} All presets
     */
    getAllPresets() {
        return { ...PRESETS, ...this.userPresets };
    }
}

// Export
window.PRESETS = PRESETS;
window.PresetsManager = PresetsManager;

console.log('✅ Presets loaded successfully');
