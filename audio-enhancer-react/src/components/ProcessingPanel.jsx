import { useState } from 'react';
import './ProcessingPanel.css';
import { useLanguage } from '../locales/LanguageContext';

function ProcessingPanel({ audioBuffer, audioContext, processor, processing, onProcessingChange, onProcessingComplete }) {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('basic');
    const [settings, setSettings] = useState({
        // Noise Gate
        noiseGate: { enabled: false, threshold: -45, range: -80 },
        // Noise Reduction
        noiseReduction: { enabled: false, amount: 15 },
        // De-esser
        deEsser: { enabled: false, frequency: 7000, threshold: -25, amount: 6 },
        // EQ
        eq: {
            enabled: false,
            bands: [
                { freq: 80, gain: 0, q: 0.7 },
                { freq: 200, gain: 0, q: 1.0 },
                { freq: 500, gain: 0, q: 0.7 },
                { freq: 1000, gain: 0, q: 1.0 },
                { freq: 3000, gain: 0, q: 1.5 },
                { freq: 8000, gain: 0, q: 0.7 }
            ]
        },
        // Multi-band Compressor
        multiband: {
            enabled: false,
            bands: [
                { threshold: -24, ratio: 4, attack: 0.005, release: 0.1 },
                { threshold: -18, ratio: 3, attack: 0.003, release: 0.08 },
                { threshold: -16, ratio: 2.5, attack: 0.001, release: 0.05 }
            ]
        },
        // Stereo
        stereo: { enabled: false, width: 1.0 },
        // Loudness
        loudness: { enabled: false, target: -16 },
        // Limiter
        limiter: { enabled: true, ceiling: -0.5 }
    });

    const [preset, setPreset] = useState('custom');

    const presets = {
        podcast: {
            name: t('processing.presetNames.podcast'),
            icon: 'microphone',
            description: t('processing.presetNames.podcastDesc'),
            settings: {
                noiseGate: { enabled: true, threshold: -45, range: -80 },
                noiseReduction: { enabled: true, amount: 12 },
                deEsser: { enabled: true, frequency: 7000, threshold: -25, amount: 6 },
                eq: {
                    enabled: true,
                    bands: [
                        { freq: 80, gain: -6, q: 0.7 },
                        { freq: 200, gain: -3, q: 1.0 },
                        { freq: 500, gain: 2, q: 0.7 },
                        { freq: 1000, gain: 1, q: 1.0 },
                        { freq: 3000, gain: 4, q: 1.5 },
                        { freq: 8000, gain: 2, q: 0.7 }
                    ]
                },
                multiband: {
                    enabled: true,
                    bands: [
                        { threshold: -24, ratio: 4, attack: 0.005, release: 0.1 },
                        { threshold: -18, ratio: 3, attack: 0.003, release: 0.08 },
                        { threshold: -16, ratio: 2.5, attack: 0.001, release: 0.05 }
                    ]
                },
                stereo: { enabled: false, width: 1.0 },
                loudness: { enabled: true, target: -16 },
                limiter: { enabled: true, ceiling: -0.5 }
            }
        },
        voice: {
            name: t('processing.presetNames.voice'),
            icon: 'user',
            description: t('processing.presetNames.voiceDesc'),
            settings: {
                noiseGate: { enabled: true, threshold: -40, range: -70 },
                noiseReduction: { enabled: true, amount: 15 },
                deEsser: { enabled: true, frequency: 6500, threshold: -28, amount: 5 },
                eq: {
                    enabled: true,
                    bands: [
                        { freq: 80, gain: -4, q: 0.7 },
                        { freq: 200, gain: -2, q: 1.0 },
                        { freq: 500, gain: 1, q: 0.7 },
                        { freq: 1000, gain: 3, q: 1.2 },
                        { freq: 3000, gain: 5, q: 1.5 },
                        { freq: 8000, gain: 3, q: 0.7 }
                    ]
                },
                multiband: {
                    enabled: true,
                    bands: [
                        { threshold: -22, ratio: 4, attack: 0.003, release: 0.1 },
                        { threshold: -18, ratio: 3, attack: 0.002, release: 0.08 },
                        { threshold: -14, ratio: 2, attack: 0.001, release: 0.05 }
                    ]
                },
                stereo: { enabled: true, width: 0.9 },
                loudness: { enabled: true, target: -18 },
                limiter: { enabled: true, ceiling: -0.5 }
            }
        },
        custom: {
            name: t('processing.presetNames.custom'),
            icon: 'sliders-h',
            description: t('processing.presetNames.customDesc')
        }
    };

    const applyPreset = (presetName) => {
        setPreset(presetName);
        setSettings(presets[presetName].settings);
    };

    const toggleProcessor = (processor) => {
        setSettings(prev => ({
            ...prev,
            [processor]: {
                ...prev[processor],
                enabled: !prev[processor].enabled
            }
        }));
        setPreset('custom');
    };

    const updateSetting = (processor, key, value) => {
        setSettings(prev => ({
            ...prev,
            [processor]: {
                ...prev[processor],
                [key]: value
            }
        }));
        setPreset('custom');
    };

    const handleProcess = async () => {
        if (!audioBuffer || !processor || processing) return;

        onProcessingChange(true);

        try {
            console.log('🎵 Starting audio processing with settings:', settings);

            // Process audio with current settings
            const processed = await processor.processAudio(audioBuffer, settings);

            // Analyze processed audio
            const analysis = await processor.analyzeAudio(processed);

            console.log('✅ Processing complete!', analysis);

            // Pass results back to parent
            onProcessingComplete(processed, analysis);

        } catch (error) {
            console.error('❌ Processing failed:', error);
            alert('فشلت المعالجة: ' + error.message);
        } finally {
            onProcessingChange(false);
        }
    };

    return (
        <div className="processing-panel">
            {/* Presets */}
            <div className="card">
                <div className="card-header">
                    <div className="card-title">
                        <i className="fas fa-layer-group"></i>
                        <span>القوالب الجاهزة</span>
                    </div>
                </div>

                <div className="presets-grid">
                    {Object.entries(presets).map(([key, p]) => (
                        <button
                            key={key}
                            className={`preset-btn ${preset === key ? 'active' : ''}`}
                            onClick={() => applyPreset(key)}
                        >
                            <i className={`fas fa-${p.icon}`}></i>
                            <span>{p.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Tabs */}
            <div className="card">
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'basic' ? 'active' : ''}`}
                        onClick={() => setActiveTab('basic')}
                    >
                        <i className="fas fa-sliders-h"></i>
                        <span>أساسي</span>
                    </button>
                    <button
                        className={`tab ${activeTab === 'advanced' ? 'active' : ''}`}
                        onClick={() => setActiveTab('advanced')}
                    >
                        <i className="fas fa-cogs"></i>
                        <span>متقدم</span>
                    </button>
                    <button
                        className={`tab ${activeTab === 'master' ? 'active' : ''}`}
                        onClick={() => setActiveTab('master')}
                    >
                        <i className="fas fa-magic"></i>
                        <span>ماستر</span>
                    </button>
                </div>

                <div className="tab-content">
                    {activeTab === 'basic' && (
                        <div className="processors-list">
                            {/* Noise Gate */}
                            <div className="processor">
                                <div className="processor-header">
                                    <div className="processor-title">
                                        <i className="fas fa-volume-mute"></i>
                                        <span>بوابة الضوضاء</span>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={settings.noiseGate.enabled}
                                            onChange={() => toggleProcessor('noiseGate')}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                                {settings.noiseGate.enabled && (
                                    <div className="processor-controls">
                                        <div className="slider-group">
                                            <div className="slider-header">
                                                <span className="slider-label">الحد</span>
                                                <span className="slider-value">{settings.noiseGate.threshold} dB</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="-60"
                                                max="-20"
                                                value={settings.noiseGate.threshold}
                                                onChange={(e) => updateSetting('noiseGate', 'threshold', Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Noise Reduction */}
                            <div className="processor">
                                <div className="processor-header">
                                    <div className="processor-title">
                                        <i className="fas fa-eraser"></i>
                                        <span>إزالة الضوضاء</span>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={settings.noiseReduction.enabled}
                                            onChange={() => toggleProcessor('noiseReduction')}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                                {settings.noiseReduction.enabled && (
                                    <div className="processor-controls">
                                        <div className="slider-group">
                                            <div className="slider-header">
                                                <span className="slider-label">الشدة</span>
                                                <span className="slider-value">{settings.noiseReduction.amount} dB</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="30"
                                                value={settings.noiseReduction.amount}
                                                onChange={(e) => updateSetting('noiseReduction', 'amount', Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* De-esser */}
                            <div className="processor">
                                <div className="processor-header">
                                    <div className="processor-title">
                                        <i className="fas fa-wave-square"></i>
                                        <span>إزالة الصفير</span>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={settings.deEsser.enabled}
                                            onChange={() => toggleProcessor('deEsser')}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                                {settings.deEsser.enabled && (
                                    <div className="processor-controls">
                                        <div className="slider-group">
                                            <div className="slider-header">
                                                <span className="slider-label">التردد</span>
                                                <span className="slider-value">{settings.deEsser.frequency} Hz</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="4000"
                                                max="10000"
                                                step="100"
                                                value={settings.deEsser.frequency}
                                                onChange={(e) => updateSetting('deEsser', 'frequency', Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="slider-group">
                                            <div className="slider-header">
                                                <span className="slider-label">الشدة</span>
                                                <span className="slider-value">{settings.deEsser.amount} dB</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="12"
                                                value={settings.deEsser.amount}
                                                onChange={(e) => updateSetting('deEsser', 'amount', Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'advanced' && (
                        <div className="processors-list">
                            {/* EQ */}
                            <div className="processor">
                                <div className="processor-header">
                                    <div className="processor-title">
                                        <i className="fas fa-sliders-h"></i>
                                        <span>المعادل (EQ)</span>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={settings.eq.enabled}
                                            onChange={() => toggleProcessor('eq')}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                                {settings.eq.enabled && (
                                    <div className="processor-controls">
                                        {settings.eq.bands.map((band, index) => (
                                            <div key={index} className="slider-group">
                                                <div className="slider-header">
                                                    <span className="slider-label">{band.freq} Hz</span>
                                                    <span className="slider-value">{band.gain > 0 ? '+' : ''}{band.gain} dB</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="-12"
                                                    max="12"
                                                    step="0.5"
                                                    value={band.gain}
                                                    onChange={(e) => {
                                                        const newBands = [...settings.eq.bands];
                                                        newBands[index].gain = Number(e.target.value);
                                                        setSettings(prev => ({
                                                            ...prev,
                                                            eq: { ...prev.eq, bands: newBands }
                                                        }));
                                                        setPreset('custom');
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Stereo Width */}
                            <div className="processor">
                                <div className="processor-header">
                                    <div className="processor-title">
                                        <i className="fas fa-arrows-alt-h"></i>
                                        <span>عرض الاستريو</span>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={settings.stereo.enabled}
                                            onChange={() => toggleProcessor('stereo')}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                                {settings.stereo.enabled && (
                                    <div className="processor-controls">
                                        <div className="slider-group">
                                            <div className="slider-header">
                                                <span className="slider-label">العرض</span>
                                                <span className="slider-value">{settings.stereo.width.toFixed(2)}x</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="2"
                                                step="0.1"
                                                value={settings.stereo.width}
                                                onChange={(e) => updateSetting('stereo', 'width', Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'master' && (
                        <div className="processors-list">
                            {/* Loudness Normalization */}
                            <div className="processor">
                                <div className="processor-header">
                                    <div className="processor-title">
                                        <i className="fas fa-chart-bar"></i>
                                        <span>تطبيع الصوت (LUFS)</span>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={settings.loudness.enabled}
                                            onChange={() => toggleProcessor('loudness')}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                                {settings.loudness.enabled && (
                                    <div className="processor-controls">
                                        <div className="slider-group">
                                            <div className="slider-header">
                                                <span className="slider-label">المستوى المستهدف</span>
                                                <span className="slider-value">{settings.loudness.target} LUFS</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="-23"
                                                max="-9"
                                                value={settings.loudness.target}
                                                onChange={(e) => updateSetting('loudness', 'target', Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="info-box">
                                            <small>
                                                <strong>معايير التوصية:</strong><br />
                                                YouTube: -14 LUFS<br />
                                                Spotify: -14 LUFS<br />
                                                البث: -16 LUFS
                                            </small>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Limiter */}
                            <div className="processor">
                                <div className="processor-header">
                                    <div className="processor-title">
                                        <i className="fas fa-tachometer-alt"></i>
                                        <span>المحدد (Limiter)</span>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={settings.limiter.enabled}
                                            onChange={() => toggleProcessor('limiter')}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                                {settings.limiter.enabled && (
                                    <div className="processor-controls">
                                        <div className="slider-group">
                                            <div className="slider-header">
                                                <span className="slider-label">السقف</span>
                                                <span className="slider-value">{settings.limiter.ceiling} dB</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="-2"
                                                max="0"
                                                step="0.1"
                                                value={settings.limiter.ceiling}
                                                onChange={(e) => updateSetting('limiter', 'ceiling', Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Process Button */}
            <button
                className="btn btn-primary btn-lg process-btn"
                onClick={handleProcess}
                disabled={processing || !audioBuffer}
            >
                {processing ? (
                    <>
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>جاري المعالجة...</span>
                    </>
                ) : (
                    <>
                        <i className="fas fa-magic"></i>
                        <span>تطبيق المعالجة</span>
                    </>
                )}
            </button>
        </div>
    );
}

export default ProcessingPanel;
