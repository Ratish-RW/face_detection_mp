"use client";
import AddPersonForm from "../../components/AddPersonForm";
import { useRouter } from "next/navigation";

export default function AddPersonPage() {
  const router = useRouter();
  const handleAddPerson = (data: any) => {
    alert("Person details submitted! (UI test only, no backend call)");
    setTimeout(() => router.push("/"), 1000);
  };
  return (
  <div className="flex flex-col items-center justify-start min-h-screen w-full px-4 py-12 overflow-y-auto">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-blue-600 mb-8 drop-shadow-lg text-center">
        Add New Person
      </h1>
      <AddPersonForm onSubmit={handleAddPerson} />
      <a href="/" className="mt-8 px-6 py-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-400 text-white font-bold shadow-lg hover:from-blue-900 hover:to-blue-600 transition border-2 border-blue-500 text-center">Back</a>
    </div>
  );
}
