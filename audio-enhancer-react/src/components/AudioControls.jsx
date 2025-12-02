import './AudioControls.css';

function AudioControls({
    isPlaying,
    loop,
    currentTime,
    duration,
    onPlayPause,
    onStop,
    onLoopToggle,
    formatTime
}) {
    return (
        <div className="card audio-controls-card">
            <div className="controls-row">
                <button
                    className="control-btn control-btn-secondary"
                    onClick={onStop}
                    disabled={!isPlaying}
                >
                    <i className="fas fa-stop"></i>
                </button>

                <button
                    className={`control-btn control-btn-primary ${isPlaying ? 'pulse' : ''}`}
                    onClick={onPlayPause}
                >
                    <i className={`fas fa-${isPlaying ? 'pause' : 'play'}`}></i>
                </button>

                <button
                    className={`control-btn control-btn-secondary ${loop ? 'active' : ''}`}
                    onClick={onLoopToggle}
                >
                    <i className="fas fa-redo"></i>
                </button>
            </div>

            <div className="time-display">
                <span className="time-current">{formatTime(currentTime)}</span>
                <div className="time-separator">/</div>
                <span className="time-total">{formatTime(duration)}</span>
            </div>

            <div className="progress-bar">
                <div
                    className="progress-fill"
                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                >
                    <div className="progress-glow"></div>
                </div>
            </div>
        </div>
    );
}

export default AudioControls;
