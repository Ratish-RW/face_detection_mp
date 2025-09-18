"use client";
import React, { useState } from "react";

// Add Google Fonts Orbitron import to the head
if (typeof window !== "undefined") {
  const link = document.createElement("link");
  link.href = "https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&display=swap";
  link.rel = "stylesheet";
  document.head.appendChild(link);
}
import { useRouter } from "next/navigation";
import CaptureModal from "../components/CaptureModal";
import UploadModal from "../components/UploadModal";

export default function Home() {
  const [captureOpen, setCaptureOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<"user" | "environment">("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCapture = async (imageUrl?: string) => {
    setCaptureOpen(false);
    setLoading(true);
    try {
      // Send the image URL directly to the backend API
      const apiRes = await fetch("/api/face-detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageUrl }),
        cache: "no-store",
      });
      if (!apiRes.ok) throw new Error("Face not found or server error");
      const result = await apiRes.json();
      // Store result in sessionStorage for /result page
      if (typeof window !== "undefined") {
        sessionStorage.setItem("personResult", JSON.stringify(result));
      }
      router.push("/result");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (imageUrl?: string) => {
    setUploadOpen(false);
    setLoading(true);
    try {
      // Send the image URL directly to the backend API (same as capture)
      const apiRes = await fetch("/api/face-detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageUrl }),
        cache: "no-store",
      });
      if (!apiRes.ok) throw new Error("Face not found or server error");
      const result = await apiRes.json();
      if (typeof window !== "undefined") {
        sessionStorage.setItem("personResult", JSON.stringify(result));
      }
      router.push("/result");
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
      <img
        src="/assets/images/logo_mw.png"
        alt="Mumbai Police Logo"
        className="mb-6"
        style={{
          width: "35vh",
          maxWidth: "60vw",
          height: "auto",
          objectFit: "contain",
          filter: "drop-shadow(0 2px 8px #0008)",
        }}
        sizes="(max-width: 600px) 60vw, (max-width: 900px) 100px, 120px"
      />
      <style>{`
        @media (max-width: 600px) {
          img[alt='Mumbai Police Logo'] {
            width: 40vw !important;
            max-width: 180px !important;
          }
        }
        @media (min-width: 601px) and (max-width: 900px) {
          img[alt='Mumbai Police Logo'] {
            width: 100px !important;
          }
        }
        @media (min-width: 901px) {
          img[alt='Mumbai Police Logo'] {
            width: 120px !important;
          }
        }
      `}</style>
      <h1
        className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-blue-600 mb-8 drop-shadow-lg text-center orbitron-landing"
        style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 900 }}
      >
        Face Detection Portal
      </h1>
      <style>{`
        .orbitron-landing {
          font-family: 'Orbitron', sans-serif !important;
          font-optical-sizing: auto;
          font-weight: 900;
          font-style: normal;
        }
      `}</style>
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

      
    </div>
  );
}
