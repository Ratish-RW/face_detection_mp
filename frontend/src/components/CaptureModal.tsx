"use client"; // needed if you're in Next.js App Router

import React, { useRef, useState, useEffect } from "react";

interface CaptureModalProps {
  open: boolean;
  onClose: () => void;
  onCapture: (image: string) => void;
  cameraFacingMode: "user" | "environment";
  onSwitchCamera: () => void;
}

const CaptureModal: React.FC<CaptureModalProps> = ({
  open,
  onClose,
  onCapture,
  cameraFacingMode,
  onSwitchCamera,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      // stop camera when modal is closed
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      return;
    }

    // ✅ Only run in browser + secure context
    if (
      typeof navigator !== "undefined" &&
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia
    ) {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraFacingMode,
          width: { ideal: 320 },
          height: { ideal: 320 },
        },
      };

      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((mediaStream) => {
          setError(null);
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        })
        .catch((err) => {
          console.error("Camera error:", err);
          setError("Unable to access camera. Please allow permissions.");
        });
    } else {
      setError("Camera API not supported in this browser or context.");
    }
  }, [open, cameraFacingMode]);

  const handleCapture = () => {
    if (videoRef.current && videoReady) {
      const video = videoRef.current;
      if (!video.videoWidth || !video.videoHeight) return;

      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 320;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        const minDim = Math.min(video.videoWidth, video.videoHeight);
        const sx = (video.videoWidth - minDim) / 2;
        const sy = (video.videoHeight - minDim) / 2;
        ctx.drawImage(video, sx, sy, minDim, minDim, 0, 0, 320, 320);

        const image = canvas.toDataURL("image/png");
        onCapture(image);
      }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-gradient-to-br from-black via-blue-900 to-blue-700 rounded-xl p-6 shadow-2xl w-full max-w-xs flex flex-col items-center">
        {error ? (
          <div className="text-red-400 text-center mb-4">{error}</div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={() => setVideoReady(true)}
            className="rounded-lg mb-4 border-2 border-blue-400"
            style={{
              width: 320,
              height: 320,
              objectFit: "cover",
              background: "#222",
            }}
          />
        )}
        <div className="flex gap-2 w-full justify-between">
          <button
            onClick={onSwitchCamera}
            className="px-3 py-1 rounded bg-blue-600 text-white font-bold hover:bg-blue-800 transition"
            disabled={!!error}
          >
            Switch Camera
          </button>
          <button
            onClick={handleCapture}
            className="px-3 py-1 rounded bg-gradient-to-r from-blue-500 to-blue-800 text-white font-bold hover:from-blue-700 hover:to-blue-900 transition"
            disabled={!videoReady || !!error}
            style={!videoReady || error ? { opacity: 0.5, cursor: "not-allowed" } : {}}
          >
            Capture
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-gray-700 text-white font-bold hover:bg-gray-900 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaptureModal;
