"use client";
import AddPersonForm from "../../components/AddPersonForm";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export interface PersonFormData {
  name: string;
  nickname?: string;
  age?: string;
  police_station?: string;
  crime_and_section?: string;
  head_of_crime?: string;
  arrest_date_time?: string;
  img_url?: string; // base64 encoded image string
}

export default function AddPersonPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleAddPerson = async (data: PersonFormData) => {
    try {
      setLoading(true);

      const payload = {
        ...data,
        age: data.age ? parseInt(data.age, 10) : undefined,
      };

      const res = await fetch("http://localhost:5000/add-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("Sent the data");

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const result = await res.json();
      console.log("Backend response:", result);

      // Show success popup
      setPopup({ type: "success", message: "Person details submitted successfully!" });

      // Redirect after short delay
      setTimeout(() => router.push("/"), 1500);
    } catch (err) {
      console.error("❌ Error submitting person:", err);

      // Show error popup
      setPopup({ type: "error", message: "Failed to submit person details. Check backend logs." });
    } finally {
      setLoading(false);
    }
  };

  // Auto-hide popup after 3 seconds
  useEffect(() => {
    if (popup) {
      const timer = setTimeout(() => setPopup(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [popup]);

  return (
    <div
      className="flex flex-col items-center justify-start min-h-screen w-full px-4 py-12 overflow-y-auto hide-scrollbar"
      style={{ height: "100vh" }}
    >
      <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-blue-600 mb-8 drop-shadow-lg text-center">
        Add New Person
      </h1>

      {/* Loading spinner */}
      {loading ? (
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
          <p className="mt-4 text-blue-400 font-semibold">Submitting...</p>
        </div>
      ) : (
        <AddPersonForm onSubmit={handleAddPerson} />
      )}

      {/* Popup notification */}
      {popup && (
        <div
          className={`fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded shadow-lg text-white font-semibold z-50 ${
            popup.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {popup.message}
        </div>
      )}

      {!loading && (
        <a
          href="/"
          className="mt-8 px-6 py-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-400 text-white font-bold shadow-lg hover:from-blue-900 hover:to-blue-600 transition border-2 border-blue-500 text-center"
        >
          Back
        </a>
      )}
    </div>
  );
}
