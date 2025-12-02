import { useState, useRef } from 'react';
import './AudioRecorder.css';
import { useLanguage } from '../locales/LanguageContext';

function AudioRecorder({ onRecordingComplete }) {
    const { t } = useLanguage();
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [hasPermission, setHasPermission] = useState(null);

    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);
    const streamRef = useRef(null);

    const requestPermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            streamRef.current = stream;
            setHasPermission(true);
            return stream;
        } catch (error) {
            console.error('Error accessing microphone:', error);
            setHasPermission(false);
            alert(t('messages.microphonePermission') || 'لم نتمكن من الوصول إلى الميكروفون.');
            return null;
        }
    };

    const startRecording = async () => {
        let stream = streamRef.current;

        if (!stream) {
            stream = await requestPermission();
            if (!stream) return;
        }

        chunksRef.current = [];

        const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'audio/webm;codecs=opus'
        });

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunksRef.current.push(event.data);
            }
        };

        mediaRecorder.onstop = async () => {
            const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
            const audioFile = new File([blob], `recording-${Date.now()}.webm`, {
                type: 'audio/webm'
            });

            if (onRecordingComplete) {
                onRecordingComplete(audioFile);
            }

            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }

            setHasPermission(null);
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start(100);
        setIsRecording(true);

        timerRef.current = setInterval(() => {
            setRecordingTime(prev => prev + 1);
        }, 1000);
    };

    const pauseRecording = () => {
        if (mediaRecorderRef.current && isRecording && !isPaused) {
            mediaRecorderRef.current.pause();
            setIsPaused(true);
            clearInterval(timerRef.current);
        }
    };

    const resumeRecording = () => {
        if (mediaRecorderRef.current && isRecording && isPaused) {
            mediaRecorderRef.current.resume();
            setIsPaused(false);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsPaused(false);
            setRecordingTime(0);
            clearInterval(timerRef.current);
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            chunksRef.current = [];
            setIsRecording(false);
            setIsPaused(false);
            setRecordingTime(0);
            clearInterval(timerRef.current);

            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }

            setHasPermission(null);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="audio-recorder card">
            <div className="card-header">
                <div className="card-title">
                    <i className="fas fa-microphone"></i>
                    <span>{t('recorder.title')}</span>
                </div>
            </div>

            <div className="recorder-content">
                {!isRecording ? (
                    <div className="recorder-idle">
                        <div className="recorder-icon">
                            <i className="fas fa-microphone-alt"></i>
                        </div>
                        <p className="recorder-hint">{t('recorder.hint')}</p>
                        <button
                            className="btn btn-primary btn-lg record-btn"
                            onClick={startRecording}
                        >
                            <i className="fas fa-circle"></i>
                            <span>{t('recorder.startRecording')}</span>
                        </button>
                    </div>
                ) : (
                    <div className="recorder-active">
                        <div className="recording-indicator">
                            <div className={`pulse-dot ${isPaused ? 'paused' : ''}`}></div>
                            <span className="recording-text">
                                {isPaused ? t('recorder.paused') : t('recorder.recording')}
                            </span>
                        </div>

                        <div className="recording-timer">
                            {formatTime(recordingTime)}
                        </div>

                        <div className="recording-controls">
                            {!isPaused ? (
                                <button
                                    className="btn btn-secondary"
                                    onClick={pauseRecording}
                                    title={t('recorder.pause')}
                                >
                                    <i className="fas fa-pause"></i>
                                    <span>{t('recorder.pause')}</span>
                                </button>
                            ) : (
                                <button
                                    className="btn btn-primary"
                                    onClick={resumeRecording}
                                    title={t('recorder.resume')}
                                >
                                    <i className="fas fa-play"></i>
                                    <span>{t('recorder.resume')}</span>
                                </button>
                            )}

                            <button
                                className="btn btn-success"
                                onClick={stopRecording}
                                title={t('recorder.finish')}
                            >
                                <i className="fas fa-check"></i>
                                <span>{t('recorder.finish')}</span>
                            </button>

                            <button
                                className="btn btn-danger"
                                onClick={cancelRecording}
                                title={t('recorder.cancel')}
                            >
                                <i className="fas fa-times"></i>
                                <span>{t('recorder.cancel')}</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AudioRecorder;
