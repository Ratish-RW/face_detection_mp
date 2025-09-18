import React, { useRef, useState } from "react";

interface CaptureModalProps {
  open: boolean;
  onClose: () => void;
  onCapture: (image: string) => void;
  cameraFacingMode: "user" | "environment";
  onSwitchCamera: () => void;
}

const CaptureModal: React.FC<CaptureModalProps> = ({ open, onClose, onCapture, cameraFacingMode, onSwitchCamera }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  React.useEffect(() => {
    if (open) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: cameraFacingMode } })
        .then((mediaStream) => {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        });
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
    // eslint-disable-next-line
  }, [open, cameraFacingMode]);

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const image = canvas.toDataURL("image/png");
        onCapture(image);
      }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-gradient-to-br from-black via-blue-900 to-blue-700 rounded-xl p-6 shadow-2xl w-full max-w-xs flex flex-col items-center">
        <video ref={videoRef} autoPlay playsInline className="rounded-lg w-full aspect-video mb-4 border-2 border-blue-400" />
        <div className="flex gap-2 w-full justify-between">
          <button onClick={onSwitchCamera} className="px-3 py-1 rounded bg-blue-600 text-white font-bold hover:bg-blue-800 transition">Switch Camera</button>
          <button onClick={handleCapture} className="px-3 py-1 rounded bg-gradient-to-r from-blue-500 to-blue-800 text-white font-bold hover:from-blue-700 hover:to-blue-900 transition">Capture</button>
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-700 text-white font-bold hover:bg-gray-900 transition">Close</button>
        </div>
      </div>
    </div>
  );
};

export default CaptureModal;
