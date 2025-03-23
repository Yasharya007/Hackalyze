import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setHackathon } from "../slices/hackathonSlice.js";
import { AllHackathonAPI } from "../utils/api.jsx";
import { useState,useEffect } from "react";
const SamplePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [hackathons, setHackathons] = useState([]);
  const formatDate = (isoString) => isoString.split("T")[0];
  // const hackathons = [
  //   { id: 1, name: "AI Hackathon", date: "2025-04-15" },
  //   { id: 2, name: "Blockchain Hackathon", date: "2025-05-10" },
  // ];
  useEffect(() => {
    const fetchHackathons = async () => {
      AllHackathonAPI()
      .then((res)=>{
        setHackathons(res);
        console.log(res);
      }).catch(()=>{})
    };

    fetchHackathons();
  }, []);
  const handleClick = (hackathon) => {
    dispatch(setHackathon(hackathon));
    navigate("/hackathon");
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Hackathons</h2>
      {hackathons.map((hackathon) => (
        <div
          key={hackathon._id}
          className="p-4 bg-gray-100 rounded-md my-2 cursor-pointer hover:bg-gray-200"
          onClick={() => handleClick(hackathon)}
        >
          <h3 className="text-lg">{hackathon.title}</h3>
          <p>Date: {formatDate(hackathon.endDate)}</p>
        </div>
      ))}
    </div>
  );
};

export default SamplePage;
