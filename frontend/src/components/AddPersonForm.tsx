import React, { useState } from "react";
import CaptureModal from "./CaptureModal";
import { PersonFormData } from "@/app/add-person/page";

interface AddPersonFormProps {
  onSubmit: (data: any) => void;
}

const AddPersonForm: React.FC<AddPersonFormProps> = ({ onSubmit }) => {
  const [form, setForm] = useState<PersonFormData>({
    name: "",
    nickname: "",
    age: "",
    police_station: "",
    crime_and_section: "",
    head_of_crime: "",
    arrest_date_time: "",
    img_url: "",
  });
  const [captureOpen, setCaptureOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setForm({ ...form, img_url: reader.result });
        }
      };
      reader.readAsDataURL(file);
      // Reset input so same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCapture = (image: string) => {
    setForm({ ...form, img_url: image });
    setCaptureOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
  <form onSubmit={handleSubmit} className="rounded-xl p-6 shadow-2xl w-full max-w-md flex flex-col items-center border border-blue-400/30" style={{background: 'rgba(30,40,80,0.45)', backdropFilter: 'blur(16px)'}}>
        <h2 className="text-xl font-bold text-white mb-4">Add New Person</h2>
  <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="mb-2 px-3 py-2 rounded w-full bg-white/10 border border-blue-300/30 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
  <input name="nickname" value={form.nickname} onChange={handleChange} placeholder="Nickname" className="mb-2 px-3 py-2 rounded w-full bg-white/10 border border-blue-300/30 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400" />
  <input name="age" value={form.age} onChange={handleChange} placeholder="Age" className="mb-2 px-3 py-2 rounded w-full bg-white/10 border border-blue-300/30 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400" type="number" min="0" />
  <input name="police_station" value={form.police_station} onChange={handleChange} placeholder="Police Station" className="mb-2 px-3 py-2 rounded w-full bg-white/10 border border-blue-300/30 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400" />
  <input name="head_of_crime" value={form.head_of_crime} onChange={handleChange} placeholder="Head of Crime" className="mb-2 px-3 py-2 rounded w-full bg-white/10 border border-blue-300/30 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400" />
  <input name="crime_and_section" value={form.crime_and_section} onChange={handleChange} placeholder="Crime and Section" className="mb-2 px-3 py-2 rounded w-full bg-white/10 border border-blue-300/30 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400" />
      <div className="flex gap-2 w-full mb-2">
        <button type="button" onClick={() => setCaptureOpen(true)} className="px-3 py-2 rounded bg-blue-600 text-white font-bold hover:bg-blue-800 transition w-full">Capture Photo</button>
        <label className="w-full">
          <span className="sr-only">Upload Photo</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUploadPhoto}
          />
          <span
            className="px-3 py-2 rounded bg-blue-400 text-white font-bold hover:bg-blue-600 transition w-full cursor-pointer block text-center"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Photo
          </span>
        </label>
      </div>
  <input name="arrest_date_time" value={form.arrest_date_time} onChange={handleChange} placeholder="Arrest Date" className="mb-2 px-3 py-2 rounded w-full bg-white/10 border border-blue-300/30 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400" type="date" />
      {form.img_url && <img src={form.img_url} alt="Captured" className="rounded-full w-24 h-24 object-cover border-2 border-blue-400 mb-2" />}
      <button type="submit" className="px-4 py-2 rounded bg-gradient-to-r from-blue-500 to-blue-800 text-white font-bold hover:from-blue-700 hover:to-blue-900 transition w-full">Submit</button>
      <CaptureModal open={captureOpen} onClose={() => setCaptureOpen(false)} onCapture={handleCapture} cameraFacingMode="user" onSwitchCamera={() => {}} />
    </form>
  );
};

export default AddPersonForm;
