import React from "react";


interface PersonCardProps {
  person: {
    name?: string;
    nickname?: string;
    police_station?: string;
    arrest_datetime?: string;
    photo?: string;
    crime?: string;
    sections?: string;
    [key: string]: any;
  };
}

const PersonCard: React.FC<PersonCardProps> = ({ person }) => {
  return (
    <div className="card flex flex-col items-center">
      {person.photo && (
        <img src={person.photo} alt={person.name || "Person photo"} className="rounded-full w-32 h-32 object-cover border-4 border-blue-400 mb-4" />
      )}
      <h2 className="text-2xl font-bold text-white mb-2">{person.name || person.id || "Unknown"}</h2>
      {Object.entries(person).map(([key, value]) => {
        if (["photo", "name", "id"].includes(key)) return null;
        if (typeof value === "number") {
          return <div key={key} className="text-blue-200 mb-1">{key}: {value.toFixed(3)}</div>;
        }
        return <div key={key} className="text-blue-200 mb-1">{key}: {String(value)}</div>;
      })}
    </div>
  );
};

export default PersonCard;
