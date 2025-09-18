"use client";
import { useEffect, useState } from "react";
import PersonCard from "../../components/PersonCard";

export default function ResultPage() {
  const [person, setPerson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full px-4 py-12">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-blue-600 mb-8 drop-shadow-lg text-center">
        Person Details
      </h1>
      {loading && <div className="text-blue-200 text-lg font-mono animate-pulse mb-6">Loading...</div>}
      {error && <div className="text-red-400 text-lg font-mono mb-6">{error}</div>}
      {person && <PersonCard person={person} />}
      <a href="/" className="mt-8 px-6 py-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-400 text-white font-bold shadow-lg hover:from-blue-900 hover:to-blue-600 transition border-2 border-blue-500 text-center">Back</a>
    </div>
  );
}
