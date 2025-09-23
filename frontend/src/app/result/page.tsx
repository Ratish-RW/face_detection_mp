"use client";

import { useEffect, useState } from "react";
import PersonCard from "../../components/PersonCard";
import { useRouter } from "next/navigation";

const MOCK_PEOPLE = [
  {
    name: "Rahul Sharma",
    nickname: "Rocky",
    police_station: "Mumbai Central",
    arrest_datetime: "2025-09-23 14:30",
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    crime: "Robbery, Assault",
    sections: "IPC 392, 323",
  },
  {
    name: "Amit Verma",
    nickname: "Avi",
    police_station: "Bandra",
    arrest_datetime: "2025-08-12 10:15",
    photo: "https://randomuser.me/api/portraits/men/45.jpg",
    crime: "Fraud",
    sections: "IPC 420",
  },
  {
    name: "Priya Singh",
    nickname: "Piya",
    police_station: "Andheri",
    arrest_datetime: "2025-07-05 18:00",
    photo: "https://randomuser.me/api/portraits/women/68.jpg",
    crime: "Theft",
    sections: "IPC 379",
  },
  {
    name: "Suresh Patil",
    nickname: "Surya",
    police_station: "Dadar",
    arrest_datetime: "2025-06-21 09:45",
    photo: "https://randomuser.me/api/portraits/men/12.jpg",
    crime: "Burglary",
    sections: "IPC 457",
  },
  {
    name: "Meena Joshi",
    nickname: "MJ",
    police_station: "Colaba",
    arrest_datetime: "2025-05-30 16:20",
    photo: "https://randomuser.me/api/portraits/women/22.jpg",
    crime: "Pickpocketing",
    sections: "IPC 379",
  },
];

export default function ResultPage() {
  const [person, setPerson] = useState<any>(null);
  const [selectedIdx, setSelectedIdx] = useState<number|null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Get result from sessionStorage
    if (typeof window !== "undefined") {
      const data = sessionStorage.getItem("personResult");
      if (data) {
        setPerson(JSON.parse(data));
      } else {
        setError("No person details found.");
      }
      setLoading(false);
    }
  }, []);

  // Always show the Add New Person button for UI testing
  // Comment out API-dependent UI if needed
  return (
  <div className="flex flex-col items-center justify-start min-h-screen w-full px-4 py-12 overflow-y-auto">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-blue-600 mb-8 drop-shadow-lg text-center">
        Person Details
      </h1>
      {loading && <div className="text-blue-200 text-lg font-mono animate-pulse mb-6">Loading...</div>}
      {error && <div className="text-red-400 text-lg font-mono mb-6">{error}</div>}
  {/* Horizontal scrollable list of 5 logs */}
  <div className="flex gap-6 mb-10 w-full max-w-4xl overflow-x-auto py-4 px-2 hide-scrollbar">
        {MOCK_PEOPLE.map((p, idx) => (
          <div
            key={idx}
            className={`flex flex-col items-center cursor-pointer bg-white/10 rounded-xl p-4 min-w-[180px] shadow-lg border border-blue-400/20 hover:bg-blue-400/10 transition-all duration-200 ${selectedIdx === idx ? 'ring-4 ring-blue-400/40' : ''}`}
            onClick={() => setSelectedIdx(idx)}
          >
            <img src={p.photo} alt={p.name} className="rounded-full w-20 h-20 object-cover border-4 border-blue-400 mb-2" />
            <div className="text-lg font-bold text-white mb-1">{p.name}</div>
            <div className="text-blue-200 text-sm">{p.police_station}</div>
          </div>
        ))}
      </div>
      {/* Show details card as an overlay so the logs remain visible */}
      {selectedIdx !== null && (
        <div className="fixed inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-xl mx-auto">
            <div className="relative flex flex-col items-center">
              <PersonCard person={MOCK_PEOPLE[selectedIdx]}>
                <button
                  className="px-8 py-3 rounded-2xl border border-blue-200/40 bg-white/10 backdrop-blur-md text-white text-lg font-extrabold shadow-xl hover:bg-white/20 hover:border-blue-400 transition-all duration-200"
                  onClick={() => setSelectedIdx(null)}
                >
                  Close
                </button>
              </PersonCard>
            </div>
          </div>
        </div>
      )}
      <button
        className="mb-6 px-10 py-3 rounded-2xl border border-blue-200/40 bg-white/10 backdrop-blur-md text-white text-lg font-extrabold shadow-xl hover:bg-white/20 hover:border-blue-400 transition-all duration-200 glass-btn"
        style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)', border: '1.5px solid rgba(255,255,255,0.18)'}}
        onClick={() => router.push("/add-person")}
      >
        Add New Person
      </button>
      <a href="/" className="mt-8 px-10 py-3 rounded-2xl border border-blue-200/40 bg-white/10 backdrop-blur-md text-white text-lg font-extrabold shadow-xl hover:bg-white/20 hover:border-blue-400 transition-all duration-200 glass-btn" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)', border: '1.5px solid rgba(255,255,255,0.18)'}}>Back</a>
    </div>
  );
}
