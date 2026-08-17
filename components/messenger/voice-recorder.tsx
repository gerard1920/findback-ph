"use client";
import { useRef, useState } from "react";

export function VoiceRecorder({
  onSend,
  disabled,
}: {
  onSend: (blob: Blob, durationSeconds: number) => void;
  disabled?: boolean;
}) {
  const [recording, setRecording] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const startRef = useRef<number>(0);

  const toggle = async () => {
    if (recording) {
      mediaRef.current?.stop();
      setRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const duration = Math.round((Date.now() - startRef.current) / 1000);
        onSend(blob, duration);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRef.current = recorder;
      startRef.current = Date.now();
      setRecording(true);
    } catch {
      // mic permission denied or unavailable
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      className={`rounded-full p-2 ${recording ? "text-danger-600" : "text-ink-soft hover:bg-primary/5 hover:text-primary"}`}
      title={recording ? "Stop recording" : "Voice message"}
    >
      {recording ? "⏹" : "🎤"}
    </button>
  );
}
