"use client";

import React, { useRef, useState, useEffect } from "react";
import { FaSyncAlt, FaCamera, FaTimes } from "react-icons/fa";

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
      // Stop camera when modal closes
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      return;
    }

    // ✅ Only run in secure context + browser
    if (
      typeof navigator !== "undefined" &&
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia
    ) {
      let constraints: MediaStreamConstraints = {
        video: true, // default fallback
      };

      try {
        constraints = {
          video: {
            facingMode: { ideal: cameraFacingMode }, // prefer front/back
            width: { ideal: 320 },
            height: { ideal: 320 },
          },
        };
      } catch {
        constraints = { video: true }; // fallback if above fails
      }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background: 'rgba(20,30,60,0.35)', backdropFilter: 'blur(8px)'}}>
      <div className="rounded-xl p-6 shadow-2xl w-full max-w-xs flex flex-col items-center border border-blue-400/30" style={{background: 'rgba(30,40,80,0.45)', backdropFilter: 'blur(16px)'}}>
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
              background: "none",
            }}
          />
        )}
        <div className="flex w-full gap-6 justify-center items-center mt-4">
          <button
            onClick={onSwitchCamera}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-700/80 text-white hover:bg-gray-900/90 transition text-xl"
            disabled={!!error}
            style={!!error ? { opacity: 0.5, cursor: "not-allowed" } : {}}
            title="Switch Camera"
          >
            <FaSyncAlt />
          </button>
          <button
            onClick={handleCapture}
            className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-600/90 text-white hover:bg-blue-800/90 transition text-2xl border-4 border-blue-300 shadow-lg"
            disabled={!videoReady || !!error}
            style={!videoReady || error ? { opacity: 0.5, cursor: "not-allowed" } : {}}
            title="Capture"
          >
            <FaCamera />
          </button>
          <button
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-700/80 text-white hover:bg-gray-900/90 transition text-xl"
            title="Close"
          >
            <FaTimes />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaptureModal;
