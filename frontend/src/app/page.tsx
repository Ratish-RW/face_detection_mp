
"use client";
import React, { useState } from "react";
import CaptureModal from "../components/CaptureModal";
import UploadModal from "../components/UploadModal";
import PersonCard from "../components/PersonCard";

export default function Home() {
  const [captureOpen, setCaptureOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<"user" | "environment">("user");
  const [loading, setLoading] = useState(false);
  const [person, setPerson] = useState<{ name: string; details: string; imageUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // API endpoints
  // POST /api/face-detect { image: base64 or file } => { name, details, imageUrl }

  const handleCapture = async (image: string) => {
    setCaptureOpen(false);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/face-detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      if (!res.ok) throw new Error("Face not found or server error");
      const data = await res.json();
      setPerson(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    setUploadOpen(false);
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/face-detect", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Face not found or server error");
      const data = await res.json();
      setPerson(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchCamera = () => {
    setCameraFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full px-4 py-12">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-blue-600 mb-8 drop-shadow-lg text-center">
        Face Detection Portal
      </h1>
      <div className="flex gap-6 mb-10">
        <button
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-700 to-blue-400 text-white text-xl font-bold shadow-lg hover:from-blue-900 hover:to-blue-600 transition border-2 border-blue-500"
          onClick={() => setCaptureOpen(true)}
        >
          Capture
        </button>
        <button
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-400 to-blue-700 text-white text-xl font-bold shadow-lg hover:from-blue-600 hover:to-blue-900 transition border-2 border-blue-500"
          onClick={() => setUploadOpen(true)}
        >
          Upload
        </button>
      </div>

      {loading && (
        <div className="text-blue-200 text-lg font-mono animate-pulse mb-6">Processing...</div>
      )}
      {error && (
        <div className="text-red-400 text-lg font-mono mb-6">{error}</div>
      )}
      {person && (
        <div className="mb-8">
          <PersonCard name={person.name} details={person.details} imageUrl={person.imageUrl} />
        </div>
      )}

      <CaptureModal
        open={captureOpen}
        onClose={() => setCaptureOpen(false)}
        onCapture={handleCapture}
        cameraFacingMode={cameraFacingMode}
        onSwitchCamera={handleSwitchCamera}
      />
      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={handleUpload}
      />

      <div className="mt-10 text-blue-200/70 text-xs text-center max-w-md">
        <div className="mb-2">API Endpoints:</div>
        <div className="font-mono bg-black/30 rounded p-2">
          POST <span className="text-blue-300">/api/face-detect</span> {'{"image": base64 | file }'}<br />
          → <span className="text-blue-300">{'{"name", "details", "imageUrl"}'}</span>
        </div>
      </div>
    </div>
  );
}
