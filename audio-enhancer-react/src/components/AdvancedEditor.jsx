import { useState, useRef, useEffect } from 'react';
import './AdvancedEditor.css';
import WaveformVisualizer from './WaveformVisualizer';
import AudioControls from './AudioControls';
import { exportAudio, downloadAudioFile, generateFilename, getSupportedFormats } from '../utils/AudioExport';
import { useLanguage } from '../locales/LanguageContext';

function AdvancedEditor({ audioBuffer, audioContext, onClear, fileName, isProcessed, originalBuffer }) {
    const { t } = useLanguage();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [loop, setLoop] = useState(false);
    const [compareMode, setCompareMode] = useState(false);
    const [mix, setMix] = useState(100);
    const [exportFormat, setExportFormat] = useState('wav');
    const [exporting, setExporting] = useState(false);
    const supportedFormats = getSupportedFormats();
    const sourceNodeRef = useRef(null);
    const startTimeRef = useRef(0);
    const pauseTimeRef = useRef(0);
    const animationFrameRef = useRef(null);
    const gainNodeOriginalRef = useRef(null);
    const gainNodeProcessedRef = useRef(null);

    useEffect(() => {
        if (audioBuffer) {
            setDuration(audioBuffer.duration);
        }
    }, [audioBuffer]);

    const play = () => {
        if (!audioBuffer || !audioContext) return;
        stop();

        if (isProcessed && originalBuffer && compareMode) {
            const sourceOriginal = audioContext.createBufferSource();
            const sourceProcessed = audioContext.createBufferSource();

            sourceOriginal.buffer = originalBuffer;
            sourceProcessed.buffer = audioBuffer;
            sourceOriginal.loop = loop;
            sourceProcessed.loop = loop;

            const gainOriginal = audioContext.createGain();
            const gainProcessed = audioContext.createGain();
            gainOriginal.gain.value = (100 - mix) / 100;
            gainProcessed.gain.value = mix / 100;
            gainNodeOriginalRef.current = gainOriginal;
            gainNodeProcessedRef.current = gainProcessed;

            sourceOriginal.connect(gainOriginal);
            sourceProcessed.connect(gainProcessed);
            gainOriginal.connect(audioContext.destination);
            gainProcessed.connect(audioContext.destination);

            const offset = pauseTimeRef.current || 0;
            sourceOriginal.start(0, offset);
            sourceProcessed.start(0, offset);

            startTimeRef.current = audioContext.currentTime - offset;
            sourceNodeRef.current = { original: sourceOriginal, processed: sourceProcessed };

            sourceOriginal.onended = () => {
                if (!loop) stop();
            };
        } else {
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.loop = loop;
            source.connect(audioContext.destination);

            const offset = pauseTimeRef.current || 0;
            source.start(0, offset);

            startTimeRef.current = audioContext.currentTime - offset;
            sourceNodeRef.current = source;

            source.onended = () => {
                if (!loop) stop();
            };
        }

        setIsPlaying(true);
        updateTime();
    };

    const pause = () => {
        if (sourceNodeRef.current) {
            pauseTimeRef.current = audioContext.currentTime - startTimeRef.current;

            if (sourceNodeRef.current.original) {
                sourceNodeRef.current.original.stop();
                sourceNodeRef.current.processed.stop();
            } else {
                sourceNodeRef.current.stop();
            }

            sourceNodeRef.current = null;
            gainNodeOriginalRef.current = null;
            gainNodeProcessedRef.current = null;
            setIsPlaying(false);
            cancelAnimationFrame(animationFrameRef.current);
        }
    };

    const stop = () => {
        if (sourceNodeRef.current) {
            if (sourceNodeRef.current.original) {
                sourceNodeRef.current.original.stop();
                sourceNodeRef.current.processed.stop();
            } else {
                sourceNodeRef.current.stop();
            }
            sourceNodeRef.current = null;
        }

        gainNodeOriginalRef.current = null;
        gainNodeProcessedRef.current = null;
        setIsPlaying(false);
        setCurrentTime(0);
        pauseTimeRef.current = 0;
        cancelAnimationFrame(animationFrameRef.current);
    };

    const updateTime = () => {
        if (audioContext && isPlaying) {
            const elapsed = audioContext.currentTime - startTimeRef.current;
            setCurrentTime(Math.min(elapsed, duration));

            if (elapsed < duration || loop) {
                animationFrameRef.current = requestAnimationFrame(updateTime);
            }
        }
    };

    const togglePlayPause = () => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    };

    const toggleLoop = () => {
        setLoop(!loop);
        if (sourceNodeRef.current) {
            sourceNodeRef.current.loop = !loop;
        }
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleMixChange = (value) => {
        setMix(value);
        if (gainNodeOriginalRef.current && gainNodeProcessedRef.current) {
            gainNodeOriginalRef.current.gain.value = (100 - value) / 100;
            gainNodeProcessedRef.current.gain.value = value / 100;
        }
    };

    const handleDownload = async () => {
        if (!audioBuffer || !audioContext) return;

        setExporting(true);
        try {
            const blob = await exportAudio(audioBuffer, audioContext, exportFormat);
            const formatInfo = supportedFormats.find(f => f.id === exportFormat);
            const filename = generateFilename(
                fileName,
                isProcessed ? 'processed' : 'original',
                formatInfo.ext
            );
            downloadAudioFile(blob, filename);
        } catch (error) {
            console.error('Error downloading audio:', error);
            alert('فشل تحميل الملف: ' + error.message);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="advanced-editor animate-fade-in">
            <div className="card">
                <div className="card-header">
                    <div className="card-title">
                        <i className="fas fa-file-audio"></i>
                        <span>{fileName}</span>
                        {isProcessed && (
                            <span className="badge badge-success">
                                <i className="fas fa-check-circle"></i>
                                <span>{t('editor.processed')}</span>
                            </span>
                        )}
                    </div>
                    <div className="header-actions">
                        {isProcessed && (
                            <>
                                <select
                                    className="format-selector"
                                    value={exportFormat}
                                    onChange={(e) => setExportFormat(e.target.value)}
                                    disabled={exporting}
                                >
                                    {supportedFormats.map(format => (
                                        <option key={format.id} value={format.id}>
                                            {format.name}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    className="btn btn-success btn-sm"
                                    onClick={handleDownload}
                                    disabled={exporting}
                                >
                                    {exporting ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i>
                                            <span>{t('editor.exporting')}</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-download"></i>
                                            <span>{t('editor.download')}</span>
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                        <button className="btn btn-secondary btn-sm" onClick={onClear}>
                            <i className="fas fa-times"></i>
                            <span>{t('editor.close')}</span>
                        </button>
                    </div>
                </div>

                <div className="file-info">
                    <div className="info-item">
                        <span className="info-label">{t('editor.duration')}:</span>
                        <span className="info-value">{formatTime(duration)}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">{t('editor.sampleRate')}:</span>
                        <span className="info-value">{audioBuffer?.sampleRate} Hz</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">{t('editor.channels')}:</span>
                        <span className="info-value">
                            {audioBuffer?.numberOfChannels === 2 ? t('editor.stereo') : t('editor.mono')}
                        </span>
                    </div>
                </div>
            </div>

            <WaveformVisualizer
                audioBuffer={audioBuffer}
                currentTime={currentTime}
                duration={duration}
                isPlaying={isPlaying}
            />

            {isProcessed && originalBuffer && (
                <div className="card comparison-card">
                    <div className="card-header">
                        <div className="card-title">
                            <i className="fas fa-balance-scale"></i>
                            <span>مقارنة الصوت</span>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={compareMode}
                                onChange={(e) => setCompareMode(e.target.checked)}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    {compareMode && (
                        <div className="comparison-content">
                            <div className="comparison-labels">
                                <span className="comparison-label original">أصلي</span>
                                <span className="comparison-label processed">معالج</span>
                            </div>

                            <div className="comparison-slider">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={mix}
                                    onChange={(e) => handleMixChange(Number(e.target.value))}
                                    className="mix-slider"
                                />
                                <div className="mix-indicator" style={{ left: `${mix}%` }}>
                                    <span>{mix}%</span>
                                </div>
                            </div>

                            <p className="comparison-hint">
                                <i className="fas fa-info-circle"></i>
                                <span>حرك الـ slider لسماع الفرق بين الصوت الأصلي والمعالج</span>
                            </p>
                        </div>
                    )}
                </div>
            )}

            <AudioControls
                isPlaying={isPlaying}
                loop={loop}
                currentTime={currentTime}
                duration={duration}
                onPlayPause={togglePlayPause}
                onStop={stop}
                onLoopToggle={toggleLoop}
                formatTime={formatTime}
            />
        </div>
    );
}

export default AdvancedEditor;
