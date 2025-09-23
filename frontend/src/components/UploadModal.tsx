import React, { useRef } from "react";

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (imageUrl: string) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ open, onClose, onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = React.useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onUpload(reader.result);
          // Reset file input so the same file can be selected again
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };
      reader.readAsDataURL(file);
    } else {
      setFileName("");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background: 'rgba(20,30,60,0.35)', backdropFilter: 'blur(8px)'}}>
      <div className="rounded-xl p-6 shadow-2xl w-full max-w-xs flex flex-col items-center border border-blue-400/30" style={{background: 'rgba(30,40,80,0.45)', backdropFilter: 'blur(16px)'}}>
        <div className="w-full flex flex-col items-center mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            className="w-full px-4 py-2 rounded bg-gradient-to-r from-blue-500 to-blue-800 text-white font-bold hover:from-blue-700 hover:to-blue-900 transition mb-2"
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            Upload
          </button>
          <span className="text-white text-sm mt-1">{fileName ? fileName : "No file chosen"}</span>
        </div>
        <div className="flex gap-2 w-full justify-between">
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-700 text-white font-bold hover:bg-gray-900 transition w-full">Close</button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
