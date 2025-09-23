"use client";
import React, { useState } from "react";
import { FaSpinner } from "react-icons/fa6";

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
      // Store results array (or single result) in sessionStorage for /result page
      if (typeof window !== "undefined") {
        // If backend returned { results: [...] }
        if (result.results && Array.isArray(result.results)) {
          sessionStorage.setItem("personResults", JSON.stringify(result.results));
        } else if (result.result) {
          sessionStorage.setItem("personResults", JSON.stringify([result.result]));
        } else {
          // fallback: store as array
          sessionStorage.setItem("personResults", JSON.stringify([result]));
        }
      }
      router.push("/result");
    } catch (e: any) {
      setError(e.message);
    }
  };
  const handleSwitchCamera = () => {
    setCameraFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const handleUpload = async (imageUrl?: string) => {
    setUploadOpen(false);
    setLoading(true);
    try {
      const apiRes = await fetch("/api/face-detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageUrl }),
        cache: "no-store",
      });
      if (!apiRes.ok) throw new Error("Face not found or server error");
      const result = await apiRes.json();
      if (typeof window !== "undefined") {
        if (result.results && Array.isArray(result.results)) {
          sessionStorage.setItem("personResults", JSON.stringify(result.results));
        } else if (result.result) {
          sessionStorage.setItem("personResults", JSON.stringify([result.result]));
        } else {
          sessionStorage.setItem("personResults", JSON.stringify([result]));
        }
      }
      router.push("/result");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen w-full px-4 py-12"
    >
      
      <img
        src="/assets/images/logo_mw.png"
        alt="Mumbai Police Logo"
        className="mb-8"
        style={{
          width: "16vw",
          minWidth: "120px",
          maxWidth: "200px",
          height: "auto",
          objectFit: "contain",
          filter: "drop-shadow(0 4px 16px #000a)",
        }}
        sizes="(max-width: 600px) 80vw, (max-width: 900px) 220px, 320px"
      />
      
      <style>{`
        @media (max-width: 600px) {
          img[alt='Mumbai Police Logo'] {
            width: 60vw !important;
            min-width: 120px !important;
            max-width: 220px !important;
          }
        }
        @media (min-width: 601px) and (max-width: 900px) {
          img[alt='Mumbai Police Logo'] {
            width: 220px !important;
          }
        }
        @media (min-width: 901px) {
          img[alt='Mumbai Police Logo'] {
            width: 320px !important;
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

      <div className="flex gap-8 mb-10">
        <button
          className="px-8 py-3 rounded-2xl border border-blue-200/40 bg-white/10 backdrop-blur-md text-white text-lg font-extrabold shadow-xl hover:bg-white/20 hover:border-blue-400 transition-all duration-200 glass-btn"
          style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)', border: '1.5px solid rgba(255,255,255,0.18)'}}
          onClick={() => setCaptureOpen(true)}
        >
          Capture
        </button>
        <button
          className="px-8 py-3 rounded-2xl border border-blue-200/40 bg-white/10 backdrop-blur-md text-white text-lg font-extrabold shadow-xl hover:bg-white/20 hover:border-blue-400 transition-all duration-200 glass-btn"
          style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)', border: '1.5px solid rgba(255,255,255,0.18)'}}
          onClick={() => setUploadOpen(true)}
        >
          Upload
        </button>
      </div>


      {loading && (
          <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/40 z-50">
            <FaSpinner className="animate-spin text-4xl text-blue-400" />
            {/* <p className="mt-4 text-blue-200 font-semibold text-lg">Processing...</p> */}
          </div>
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
