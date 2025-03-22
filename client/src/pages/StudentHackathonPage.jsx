import React from "react";
import { useSelector } from "react-redux";

const StudentHackathonPage = () => {
  const hackathon = useSelector((state) => state.hackathon.selectedHackathon);

  if (!hackathon) {
    return <h2 className="text-xl text-red-500">No Hackathon Selected</h2>;
  }

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold">{hackathon.name}</h2>
      <p className="text-gray-600">Date: {hackathon.date}</p>
    </div>
  );
};

export default StudentHackathonPage;
