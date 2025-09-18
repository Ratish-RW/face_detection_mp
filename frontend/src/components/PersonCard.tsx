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
      <h2 className="text-2xl font-bold text-white mb-2">{person.name || "Unknown"}</h2>
      {person.nickname && <div className="text-blue-200 mb-1">Nickname: {person.nickname}</div>}
      {person.police_station && <div className="text-blue-200 mb-1">Police Station: {person.police_station}</div>}
      {person.arrest_datetime && <div className="text-blue-200 mb-1">Arrested: {person.arrest_datetime}</div>}
  {person.crime && <div className="text-blue-200 mb-1">Crime: {person.crime}</div>}
  {person.sections && <div className="text-blue-200 mb-1">Sections: {person.sections}</div>}
  {person.score && <div className="text-blue-400 mt-2">Match Score: {person.score.toFixed(3)}</div>}
  {person.confidence && <div className="text-blue-400 mt-2">Confidence: {person.confidence.toFixed(3)}</div>}
    </div>
  );
};

export default PersonCard;
