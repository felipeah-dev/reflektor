import { useState, useRef, useCallback } from 'react';

export function useMediaRecorder() {
    const [status, setStatus] = useState<'idle' | 'recording' | 'stopped'>('idle');
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = useCallback((stream: MediaStream) => {
        if (!stream) return;

        chunksRef.current = [];
        const mimeType = [
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm',
            'video/mp4',
            'video/quicktime'
        ].find(type => MediaRecorder.isTypeSupported(type));

        if (!mimeType) {
            console.error("No supported MediaRecorder mimeTypes found");
            return;
        }

        const recorder = new MediaRecorder(stream, { mimeType });


        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunksRef.current.push(e.data);
            }
        };

        recorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: mimeType });
            setRecordedBlob(blob);
            setStatus('stopped');
        };

        recorder.start(1000); // Collect data every second
        mediaRecorderRef.current = recorder;
        setStatus('recording');
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    }, []);

    return {
        status,
        recordedBlob,
        startRecording,
        stopRecording
    };
}
