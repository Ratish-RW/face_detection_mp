"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IoCloseSharp } from "react-icons/io5";

export default function ResultPage() {
  const [people, setPeople] = useState<any[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = sessionStorage.getItem("personResults");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPeople(parsed.slice(0, 5)); // show up to 5 logs
          } else {
            setError("No list found.");
          }
        } catch (e) {
          setError("Failed to parse results");
        }
      } else {
        setError("No list found.");
      }
      setLoading(false);
    }
  }, []);


  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full px-4 py-12 overflow-y-auto">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-blue-600 mb-8 drop-shadow-lg text-center">
        Person Details
      </h1>
      {loading && (
        <div className="text-blue-200 text-lg font-mono animate-pulse mb-6">
          Loading...
        </div>
      )}
      {error && (
        <div className="text-red-400 text-lg font-mono mb-6">{error}</div>
      )}

      
      {people.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-6 mb-10 w-full max-w-4xl overflow-y-auto sm:overflow-x-auto py-4 px-2 hide-scrollbar">
          {people.map((p, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center cursor-pointer bg-white/10 rounded-xl p-4 min-w-[180px] shadow-lg border border-blue-400/20 hover:bg-blue-400/10 transition-all duration-200 ${
                selectedIdx === idx ? "ring-4 ring-blue-400/40" : ""
              }`}
              onClick={() => setSelectedIdx(idx)}
            >
              <img
                src={p.photo || p.img_url}
                alt={p.name || p.id || "Person"}
                className="rounded-full w-20 h-20 object-cover border-4 border-blue-400 mb-2"
              />
              <div className="flex flex-col items-center text-center w-full">
                <div
                  className={`font-bold text-white mb-1 w-full truncate`}
                  style={{ minHeight: "1.5em", maxWidth: "150px" }}
                  title={p.name || p.Name || p.id || "Unknown"}
                >
                  {p.name || p.Name || p.id || "Unknown"}
                </div>
                <div className="text-blue-200 text-sm break-words max-w-[150px] w-full">
                  {typeof p.score === "number" ? p.score.toFixed(2) : p.score || ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Show details card */}
      {selectedIdx !== null && (
        <div className="fixed inset-0 flex items-center justify-center z-30 bg-black/40 backdrop-blur-sm">
          <div className="pointer-events-auto w-full max-w-xl mx-auto">
            <div className="relative flex flex-col items-center bg-white/10 rounded-2xl shadow-2xl border border-blue-400/30 p-8 backdrop-blur-lg">
              <button
                className="absolute top-4 right-4 px-4 py-2 rounded-xl border border-blue-200/40 bg-white/10 text-white text-base font-bold shadow hover:bg-white/20 hover:border-blue-400 transition-all duration-200"
                onClick={() => setSelectedIdx(null)}
              >
                <IoCloseSharp />
              </button>
              <img
                src={people[selectedIdx].img_url}
                alt={people[selectedIdx].name || people[selectedIdx].id || "Person"}
                className="rounded-full w-32 h-32 object-cover border-4 border-blue-400 mb-4"
              />
              <div className="text-2xl font-extrabold text-white mb-2 text-center">
                {people[selectedIdx].name || people[selectedIdx].Name || people[selectedIdx].id || "Unknown"}
              </div>
              <div className="text-blue-200 text-lg mb-4 text-center">
                {people[selectedIdx].police_station || people[selectedIdx]["Police Station"] || people[selectedIdx].station || ""}
              </div>
              <div className="grid grid-cols-2 gap-4 w-full mt-2">
                {Object.entries(people[selectedIdx])
                  .filter(
                    ([key]) =>
                      ![
                        "photo",
                        "img_url",
                        "name",
                        "Name",
                        "id",
                        "police_station",
                        "Police Station",
                        "station",
                      ].includes(key)
                  )
                  .map(([key, value]) => (
                    <div key={key} className="bg-white/5 rounded-lg p-3 text-white/80 text-sm">
                      <span className="font-bold text-blue-200">{key.replace(/_/g, " ")}:</span>{" "}
                      {key === "score" && typeof value === "number"
                        ? value.toFixed(2)
                        : String(value)}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        className="mb-6 px-10 py-3 rounded-2xl border border-blue-200/40 bg-white/10 backdrop-blur-md text-white text-lg font-extrabold shadow-xl hover:bg-white/20 hover:border-blue-400 transition-all duration-200 glass-btn"
        style={{
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)",
          border: "1.5px solid rgba(255,255,255,0.18)",
        }}
        onClick={() => router.push("/add-person")}
      >
        Add New Person
      </button>
      <a
        href="/"
        className="mt-8 px-10 py-3 rounded-2xl border border-blue-200/40 bg-white/10 backdrop-blur-md text-white text-lg font-extrabold shadow-xl hover:bg-white/20 hover:border-blue-400 transition-all duration-200 glass-btn"
        style={{
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)",
          border: "1.5px solid rgba(255,255,255,0.18)",
        }}
      >
        Back
      </a>
    </div>
  );
}
