import React, { useRef } from "react";

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (imageUrl: string) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ open, onClose, onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onUpload(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-gradient-to-br from-black via-blue-900 to-blue-700 rounded-xl p-6 shadow-2xl w-full max-w-xs flex flex-col items-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="mb-4 w-full text-white"
          onChange={handleFileChange}
        />
        <div className="flex gap-2 w-full justify-between">
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-700 text-white font-bold hover:bg-gray-900 transition w-full">Close</button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
