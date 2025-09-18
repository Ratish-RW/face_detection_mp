import React from "react";

interface PersonCardProps {
  name: string;
  details: string;
  imageUrl: string;
}

const PersonCard: React.FC<PersonCardProps> = ({ name, details, imageUrl }) => {
  return (
    <div className="bg-gradient-to-br from-black via-blue-900 to-blue-700 rounded-xl p-6 shadow-2xl flex flex-col items-center w-full max-w-xs">
      <img src={imageUrl} alt={name} className="rounded-full w-32 h-32 object-cover border-4 border-blue-400 mb-4" />
      <h2 className="text-2xl font-bold text-white mb-2">{name}</h2>
      <p className="text-blue-200 text-center mb-2">{details}</p>
    </div>
  );
};

export default PersonCard;
