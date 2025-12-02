import { useState, useRef, useEffect } from 'react';
import './App.css';
import './neumorphic-components.css';
import './dark-mode.css';
import { LanguageProvider } from './locales/LanguageContext';
import Header from './components/Header';
import FileUploader from './components/FileUploader';
import AdvancedEditor from './components/AdvancedEditor';
import ProcessingPanel from './components/ProcessingPanel';
import AnalysisPanel from './components/AnalysisPanel';
import AdvancedAudioProcessor from './utils/AdvancedAudioProcessor';

function App() {
  const [audioFile, setAudioFile] = useState(null);
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [processedBuffer, setProcessedBuffer] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Load from localStorage or default to false
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });

  const audioContextRef = useRef(null);
  const processorRef = useRef(null);

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    // Save to localStorage
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const handleFileSelect = async (file) => {
    setAudioFile(file);
    setProcessedBuffer(null); // Reset processed buffer

    // Create AudioContext
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Initialize processor
    if (!processorRef.current) {
      processorRef.current = new AdvancedAudioProcessor(audioContextRef.current);
    }

    // Load and decode audio
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      setAudioBuffer(buffer);

      // Auto-analyze on load
      const initialAnalysis = await processorRef.current.analyzeAudio(buffer);
      setAnalysis(initialAnalysis);
    } catch (error) {
      console.error('Error loading audio:', error);
      alert('فشل في تحميل الملف الصوتي');
    }
  };

  const handleClearFile = () => {
    setAudioFile(null);
    setAudioBuffer(null);
    setProcessedBuffer(null);
    setAnalysis(null);
  };

  const handleProcessingComplete = async (processed, newAnalysis) => {
    setProcessedBuffer(processed);
    setAnalysis(newAnalysis);
  };

  return (
    <LanguageProvider>
      <div className="app">
        <Header darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />

        <div className="app-container">
          {!audioFile ? (
            <FileUploader onFileSelect={handleFileSelect} />
          ) : (
            <div className="editor-layout">
              {/* Main Editor */}
              <div className="editor-main">
                <AdvancedEditor
                  audioBuffer={processedBuffer || audioBuffer}
                  originalBuffer={audioBuffer}
                  audioContext={audioContextRef.current}
                  onClear={handleClearFile}
                  fileName={audioFile.name}
                  isProcessed={!!processedBuffer}
                />
              </div>

              {/* Side Panels */}
              <div className="editor-sidebar">
                <ProcessingPanel
                  audioBuffer={audioBuffer}
                  audioContext={audioContextRef.current}
                  processor={processorRef.current}
                  processing={processing}
                  onProcessingChange={setProcessing}
                  onProcessingComplete={handleProcessingComplete}
                />

                {analysis && (
                  <AnalysisPanel analysis={analysis} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </LanguageProvider>
  );
}

export default App;
