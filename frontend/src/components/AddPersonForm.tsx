import React, { useState } from "react";
import CaptureModal from "./CaptureModal";

interface AddPersonFormProps {
  onSubmit: (data: any) => void;
}

const AddPersonForm: React.FC<AddPersonFormProps> = ({ onSubmit }) => {
  const [form, setForm] = useState({
    name: "",
    age: "",
    nickname: "",
    police_station: "",
    crime: "",
    sections: "",
    photo: "",
  });
  const [captureOpen, setCaptureOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setForm((prev) => ({ ...prev, photo: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = (image: string) => {
    setForm({ ...form, photo: image });
    setCaptureOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
  <form onSubmit={handleSubmit} className="bg-gradient-to-br from-black via-blue-900 to-blue-700 rounded-xl p-6 shadow-2xl w-full max-w-md flex flex-col items-center mt-8">
      <h2 className="text-xl font-bold text-white mb-4">Add New Person</h2>
  <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="mb-2 px-3 py-2 rounded w-full" required />
  <input name="age" value={form.age} onChange={handleChange} placeholder="Age" className="mb-2 px-3 py-2 rounded w-full" type="number" min="0" required />
      <input name="nickname" value={form.nickname} onChange={handleChange} placeholder="Nickname" className="mb-2 px-3 py-2 rounded w-full" />
      <input name="police_station" value={form.police_station} onChange={handleChange} placeholder="Police Station" className="mb-2 px-3 py-2 rounded w-full" />
      <input name="crime" value={form.crime} onChange={handleChange} placeholder="Crime" className="mb-2 px-3 py-2 rounded w-full" />
      <input name="sections" value={form.sections} onChange={handleChange} placeholder="Sections" className="mb-2 px-3 py-2 rounded w-full" />
      <div className="flex gap-2 w-full mb-2">
        <button type="button" onClick={() => setCaptureOpen(true)} className="px-3 py-2 rounded bg-blue-600 text-white font-bold hover:bg-blue-800 transition w-full">Capture Photo</button>
        <label className="px-3 py-2 rounded bg-blue-400 text-white font-bold hover:bg-blue-600 transition w-full text-center cursor-pointer">
          Upload Photo
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </label>
      </div>
      {form.photo && <img src={form.photo} alt="Captured or Uploaded" className="rounded-full w-24 h-24 object-cover border-2 border-blue-400 mb-2" />}
      <button type="submit" className="px-4 py-2 rounded bg-gradient-to-r from-blue-500 to-blue-800 text-white font-bold hover:from-blue-700 hover:to-blue-900 transition w-full">Submit</button>
      <CaptureModal open={captureOpen} onClose={() => setCaptureOpen(false)} onCapture={handleCapture} cameraFacingMode="user" onSwitchCamera={() => {}} />
    </form>
  );
};

export default AddPersonForm;
