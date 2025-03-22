import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setHackathon } from "../slices/hackathonSlice.js";

const SamplePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const hackathons = [
    { id: 1, name: "AI Hackathon", date: "2025-04-15" },
    { id: 2, name: "Blockchain Hackathon", date: "2025-05-10" },
  ];

  const handleClick = (hackathon) => {
    dispatch(setHackathon(hackathon));
    navigate("/hackathon");
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Hackathons</h2>
      {hackathons.map((hackathon) => (
        <div
          key={hackathon.id}
          className="p-4 bg-gray-100 rounded-md my-2 cursor-pointer hover:bg-gray-200"
          onClick={() => handleClick(hackathon)}
        >
          <h3 className="text-lg">{hackathon.name}</h3>
          <p>Date: {hackathon.date}</p>
        </div>
      ))}
    </div>
  );
};

export default SamplePage;
