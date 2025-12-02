import { useState, useCallback } from 'react';
import './FileUploader.css';
import AudioRecorder from './AudioRecorder';
import { useLanguage } from '../locales/LanguageContext';

function FileUploader({ onFileSelect }) {
    const [showRecorder, setShowRecorder] = useState(false);
    const { t } = useLanguage();

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('audio/')) {
            onFileSelect(file);
        }
    }, [onFileSelect]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
    }, []);

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        if (file) {
            onFileSelect(file);
        }
    };

    const handleRecordingComplete = (audioFile) => {
        onFileSelect(audioFile);
        setShowRecorder(false);
    };

    if (showRecorder) {
        return <AudioRecorder onRecordingComplete={handleRecordingComplete} />;
    }

    return (
        <div className="file-uploader animate-fade-in">
            <div className="card upload-card">
                <div
                    className="upload-area"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    <div className="upload-content">
                        <div className="upload-icon">
                            <i className="fas fa-cloud-upload-alt"></i>
                        </div>

                        <h2 className="upload-title">{t('uploader.title')}</h2>
                        <p className="upload-subtitle">{t('uploader.subtitle')}</p>

                        <div className="upload-formats">
                            <span className="format-badge">MP3</span>
                            <span className="format-badge">WAV</span>
                            <span className="format-badge">OGG</span>
                            <span className="format-badge">M4A</span>
                            <span className="format-badge">FLAC</span>
                        </div>

                        <input
                            type="file"
                            accept="audio/*"
                            onChange={handleFileInput}
                            className="file-input"
                            id="audio-file-input"
                        />

                        <div className="upload-buttons">
                            <label htmlFor="audio-file-input" className="btn btn-primary btn-lg">
                                <i className="fas fa-folder-open"></i>
                                <span>{t('uploader.chooseFile')}</span>
                            </label>

                            <button
                                className="btn btn-secondary btn-lg"
                                onClick={() => setShowRecorder(true)}
                            >
                                <i className="fas fa-microphone"></i>
                                <span>{t('uploader.recordAudio')}</span>
                            </button>
                        </div>
                    </div>

                    <div className="upload-features">
                        <div className="feature-item">
                            <i className="fas fa-magic"></i>
                            <span>{t('uploader.features.professional')}</span>
                        </div>
                        <div className="feature-item">
                            <i className="fas fa-shield-alt"></i>
                            <span>{t('uploader.features.privacy')}</span>
                        </div>
                        <div className="feature-item">
                            <i className="fas fa-bolt"></i>
                            <span>{t('uploader.features.instant')}</span>
                        </div>
                        <div className="feature-item">
                            <i className="fas fa-chart-line"></i>
                            <span>{t('uploader.features.advanced')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FileUploader;
