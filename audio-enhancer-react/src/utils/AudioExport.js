import lamejs from '@breezystack/lamejs';

/**
 * Audio Export Utilities
 * Convert AudioBuffer to WAV format for download
 */

/**
 * Convert AudioBuffer to MP3 using lamejs
 */
export function audioBufferToMp3(audioBuffer, bitrate = 192) {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const mp3encoder = new lamejs.Mp3Encoder(numberOfChannels, sampleRate, bitrate);

    const samples = [];

    // Get samples from all channels
    for (let i = 0; i < numberOfChannels; i++) {
        samples.push(audioBuffer.getChannelData(i));
    }

    // Convert float samples to 16-bit PCM
    const sampleBlockSize = 1152;
    const mp3Data = [];

    for (let i = 0; i < samples[0].length; i += sampleBlockSize) {
        const leftChunk = convertFloat32ToInt16(samples[0], i, sampleBlockSize);
        const rightChunk = numberOfChannels > 1 ?
            convertFloat32ToInt16(samples[1], i, sampleBlockSize) : leftChunk;

        const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
        if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
        }
    }

    // Finalize encoding
    const mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
    }

    return new Blob(mp3Data, { type: 'audio/mp3' });
}

/**
 * Convert Float32Array to Int16Array
 */
function convertFloat32ToInt16(buffer, offset, length) {
    const actualLength = Math.min(length, buffer.length - offset);
    const result = new Int16Array(actualLength);

    for (let i = 0; i < actualLength; i++) {
        const s = Math.max(-1, Math.min(1, buffer[offset + i]));
        result[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }

    return result;
}

/**
 * Convert AudioBuffer to WAV Blob
 */
export function audioBufferToWav(audioBuffer) {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numberOfChannels * bytesPerSample;

    const data = [];
    for (let i = 0; i < numberOfChannels; i++) {
        data.push(audioBuffer.getChannelData(i));
    }

    const interleaved = interleaveChannels(data);
    const dataLength = interleaved.length * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);

    // Write WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, format, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);

    // Write audio data
    let offset = 44;
    for (let i = 0; i < interleaved.length; i++) {
        const sample = Math.max(-1, Math.min(1, interleaved[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
    }

    return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Interleave multiple channels
 */
function interleaveChannels(channels) {
    const length = channels[0].length;
    const numberOfChannels = channels.length;
    const interleaved = new Float32Array(length * numberOfChannels);

    for (let i = 0; i < length; i++) {
        for (let channel = 0; channel < numberOfChannels; channel++) {
            interleaved[i * numberOfChannels + channel] = channels[channel][i];
        }
    }

    return interleaved;
}

/**
 * Write string to DataView
 */
function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

/**
 * Download audio file
 */
export function downloadAudioFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(originalName, suffix = 'processed', extension = 'wav') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    return `${baseName}_${suffix}_${timestamp}.${extension}`;
}

/**
 * Convert AudioBuffer to different formats using MediaRecorder
 */
export async function audioBufferToFormat(audioBuffer, audioContext, format = 'audio/webm') {
    return new Promise((resolve, reject) => {
        // Create offline context
        const offlineContext = new OfflineAudioContext(
            audioBuffer.numberOfChannels,
            audioBuffer.length,
            audioBuffer.sampleRate
        );

        // Create source
        const source = offlineContext.createBufferSource();
        source.buffer = audioBuffer;

        // Create media stream destination
        const dest = offlineContext.createMediaStreamDestination();
        source.connect(dest);

        // Setup MediaRecorder
        const mediaRecorder = new MediaRecorder(dest.stream, { mimeType: format });
        const chunks = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunks.push(e.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: format });
            resolve(blob);
        };

        mediaRecorder.onerror = (e) => {
            reject(e);
        };

        // Start recording
        mediaRecorder.start();
        source.start(0);

        // Stop after duration
        setTimeout(() => {
            mediaRecorder.stop();
        }, (audioBuffer.duration + 0.1) * 1000);
    });
}

/**
 * Get supported export formats
 */
export function getSupportedFormats() {
    const formats = [
        { id: 'wav', name: 'WAV (Lossless)', mime: 'audio/wav', ext: 'wav' },
        { id: 'mp3', name: 'MP3 (192kbps)', mime: 'audio/mp3', ext: 'mp3' },
        { id: 'webm', name: 'WebM (Opus)', mime: 'audio/webm;codecs=opus', ext: 'webm' },
        { id: 'mp4', name: 'MP4/M4A', mime: 'audio/mp4', ext: 'm4a' },
        { id: 'ogg', name: 'OGG (Opus)', mime: 'audio/ogg;codecs=opus', ext: 'ogg' }
    ];

    // Check which formats are supported
    return formats.filter(format => {
        if (format.id === 'wav' || format.id === 'mp3') return true; // WAV and MP3 always supported
        try {
            return MediaRecorder.isTypeSupported(format.mime);
        } catch (e) {
            return false;
        }
    });
}

/**
 * Export audio in selected format
 */
export async function exportAudio(audioBuffer, audioContext, format = 'wav') {
    if (format === 'wav') {
        return audioBufferToWav(audioBuffer);
    }

    if (format === 'mp3') {
        return audioBufferToMp3(audioBuffer);
    }

    const formatInfo = getSupportedFormats().find(f => f.id === format);
    if (!formatInfo) {
        throw new Error(`Format ${format} not supported`);
    }

    return await audioBufferToFormat(audioBuffer, audioContext, formatInfo.mime);
}

