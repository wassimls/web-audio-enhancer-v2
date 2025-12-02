import { useEffect, useRef } from 'react';
import './WaveformVisualizer.css';

function WaveformVisualizer({ audioBuffer, currentTime, duration, isPlaying }) {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        if (!audioBuffer || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Set canvas size
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        drawWaveform();

        function drawWaveform() {
            const width = rect.width;
            const height = rect.height;

            ctx.clearRect(0, 0, width, height);

            // Background
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, 'rgba(99, 102, 241, 0.05)');
            gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.02)');
            gradient.addColorStop(1, 'rgba(99, 102, 241, 0.05)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Get audio data
            const data = audioBuffer.getChannelData(0);
            const step = Math.ceil(data.length / width);
            const amp = height / 2;

            // Draw waveform
            ctx.beginPath();
            ctx.strokeStyle = '#6366f1';
            ctx.lineWidth = 2;

            for (let i = 0; i < width; i++) {
                let min = 1.0;
                let max = -1.0;

                for (let j = 0; j < step; j++) {
                    const datum = data[(i * step) + j];
                    if (datum < min) min = datum;
                    if (datum > max) max = datum;
                }

                const x = i;
                const yMin = (1 + min) * amp;
                const yMax = (1 + max) * amp;

                if (i === 0) {
                    ctx.moveTo(x, yMin);
                }

                ctx.lineTo(x, yMin);
                ctx.lineTo(x, yMax);
            }

            ctx.stroke();

            // Draw progress line
            if (duration > 0) {
                const progress = (currentTime / duration) * width;

                // Gradient for played portion
                const playedGradient = ctx.createLinearGradient(0, 0, progress, 0);
                playedGradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
                playedGradient.addColorStop(1, 'rgba(99, 102, 241, 0.3)');
                ctx.fillStyle = playedGradient;
                ctx.fillRect(0, 0, progress, height);

                // Progress line
                ctx.beginPath();
                ctx.strokeStyle = '#ec4899';
                ctx.lineWidth = 3;
                ctx.moveTo(progress, 0);
                ctx.lineTo(progress, height);
                ctx.stroke();

                // Glow effect
                ctx.shadowColor = '#ec4899';
                ctx.shadowBlur = 10;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
        }

        // Animation loop when playing
        if (isPlaying) {
            const animate = () => {
                drawWaveform();
                animationRef.current = requestAnimationFrame(animate);
            };
            animate();
        } else {
            drawWaveform();
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [audioBuffer, currentTime, duration, isPlaying]);

    return (
        <div className="card waveform-card">
            <div className="card-header">
                <div className="card-title">
                    <i className="fas fa-chart-area"></i>
                    <span>الموجة الصوتية</span>
                </div>
                {isPlaying && (
                    <span className="badge badge-success">
                        <i className="fas fa-circle animate-pulse"></i>
                        <span>يتم التشغيل</span>
                    </span>
                )}
            </div>

            <div className="waveform-container">
                <canvas ref={canvasRef} className="waveform-canvas"></canvas>
            </div>
        </div>
    );
}

export default WaveformVisualizer;
