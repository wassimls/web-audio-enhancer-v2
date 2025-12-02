import './AnalysisPanel.css';

function AnalysisPanel({ analysis }) {
    if (!analysis) return null;

    return (
        <div className="card analysis-panel">
            <div className="card-header">
                <div className="card-title">
                    <i className="fas fa-chart-line"></i>
                    <span>التحليلات</span>
                </div>
            </div>

            <div className="analysis-content">
                {/* LUFS Meter */}
                <div className="analysis-item">
                    <div className="analysis-label">
                        <i className="fas fa-volume-up"></i>
                        <span>LUFS</span>
                    </div>
                    <div className="analysis-value">
                        <span className="value-large">{analysis.lufs?.toFixed(1) || '--'}</span>
                        <span className="value-unit">LUFS</span>
                    </div>
                    <div className="meter-bar">
                        <div
                            className="meter-fill"
                            style={{
                                width: `${Math.min(100, ((analysis.lufs + 40) / 40) * 100)}%`,
                                background: analysis.lufs > -14 ? 'var(--warning)' : 'var(--success)'
                            }}
                        ></div>
                    </div>
                    <div className="analysis-hint">
                        {analysis.lufs > -14 ? 'عالي جداً' : analysis.lufs < -23 ? 'منخفض جداً' : 'مثالي'}
                    </div>
                </div>

                {/* Peak Level */}
                <div className="analysis-item">
                    <div className="analysis-label">
                        <i className="fas fa-tachometer-alt"></i>
                        <span>Peak</span>
                    </div>
                    <div className="analysis-value">
                        <span className="value-large">{analysis.peakDB?.toFixed(1) || '--'}</span>
                        <span className="value-unit">dB</span>
                    </div>
                    <div className="meter-bar">
                        <div
                            className="meter-fill"
                            style={{
                                width: `${Math.min(100, ((analysis.peakDB + 60) / 60) * 100)}%`,
                                background: analysis.peakDB > -0.3 ? 'var(--danger)' : 'var(--success)'
                            }}
                        ></div>
                    </div>
                    <div className="analysis-hint">
                        {analysis.peakDB > -0.3 ? 'خطر القص!' : 'آمن'}
                    </div>
                </div>

                {/* Dynamic Range */}
                <div className="analysis-item">
                    <div className="analysis-label">
                        <i className="fas fa-arrows-alt-v"></i>
                        <span>النطاق الديناميكي</span>
                    </div>
                    <div className="analysis-value">
                        <span className="value-large">{analysis.dynamicRange?.toFixed(1) || '--'}</span>
                        <span className="value-unit">dB</span>
                    </div>
                    <div className="meter-bar">
                        <div
                            className="meter-fill"
                            style={{
                                width: `${Math.min(100, (analysis.dynamicRange / 20) * 100)}%`,
                                background: 'var(--primary)'
                            }}
                        ></div>
                    </div>
                    <div className="analysis-hint">
                        {analysis.dynamicRange > 14 ? 'عالي' : analysis.dynamicRange < 6 ? 'منخفض' : 'متوسط'}
                    </div>
                </div>

                {/* Stereo Info */}
                {analysis.stereoWidth !== undefined && (
                    <div className="analysis-item">
                        <div className="analysis-label">
                            <i className="fas fa-arrows-alt-h"></i>
                            <span>عرض الاستريو</span>
                        </div>
                        <div className="analysis-value">
                            <span className="value-large">{(analysis.stereoWidth * 100).toFixed(0)}</span>
                            <span className="value-unit">%</span>
                        </div>
                        <div className="meter-bar">
                            <div
                                className="meter-fill"
                                style={{
                                    width: `${analysis.stereoWidth * 100}%`,
                                    background: 'var(--accent)'
                                }}
                            ></div>
                        </div>
                    </div>
                )}

                {/* Phase Correlation */}
                {analysis.phase !== undefined && (
                    <div className="analysis-item">
                        <div className="analysis-label">
                            <i className="fas fa-wave-square"></i>
                            <span>علاقة الطور</span>
                        </div>
                        <div className="analysis-value">
                            <span className="value-large">{analysis.phase?.toFixed(2) || '--'}</span>
                        </div>
                        <div className="meter-bar phase-meter">
                            <div className="phase-indicator" style={{ left: `${((analysis.phase + 1) / 2) * 100}%` }}></div>
                        </div>
                        <div className="analysis-hint">
                            {analysis.phase < 0.5 ? 'مشاكل محتملة' : 'جيد'}
                        </div>
                    </div>
                )}
            </div>

            <div className="analysis-footer">
                <span className="badge badge-primary">
                    <i className="fas fa-info-circle"></i>
                    <span>تحديث تلقائي</span>
                </span>
            </div>
        </div>
    );
}

export default AnalysisPanel;
