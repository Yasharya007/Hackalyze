
import { useState } from "react";
import ParameterSelector from "./ParameterSelector";
const StudentDetails = () => {
  const student = {
    _id: "12345",
    name: "Akriti Gaur",
    email: "akriti@gmail.com",
    mobileNumber: "13th March 2025",
    schoolCollegeName: "MNNIT ALLAHABAD",
    grade: "",
    gender: "Female",
    district: "1:05 pm",
    state: "up",
    
  };
  const [comments, setComments] = useState("");

  const [scoreData, setScoreData] = useState([
    { parameter: "Accuracy", aiScore: 40, manualScore: 45 },
    { parameter: "Speed", aiScore: 30, manualScore: 35 },
    { parameter: "Efficiency", aiScore: 20, manualScore: 25 },
  ]);
  const handleScoreChange = (index, field, value) => {
    const updatedScores = [...scoreData];
    updatedScores[index][field] = Number(value); // Convert input value to number
    setScoreData(updatedScores);
  };
  // Calculate total scores
  const totalAiScore = scoreData.reduce((sum, item) => sum + item.aiScore, 0);
  const totalManualScore = scoreData.reduce((sum, item) => sum + item.manualScore, 0);
  const totalScore = totalAiScore + totalManualScore;

  // Determine grade & result
  const grade = totalScore >= 90 ? "A+" : totalScore >= 75 ? "A" : totalScore >= 60 ? "B" : "C";
  const result = totalScore >= 60 ? "Shortlisted" : "Not Shortlisted";

  return (
    <div className="max-w-5xl ml-auto mr-0 bg-white p-6 rounded-lg shadow-md mt-5">
         <div className="flex items-center justify-between">
  {/* Left: Name and ID stacked vertically */}
  <div>
    <h1 className="text-2xl font-bold">{student.name}</h1>
    <p className="text-gray-500">ID: {student._id}</p>
  </div>

  {/* Right: Profile Image */}
  <div>
    <img 
      src="https://cdn-icons-png.flaticon.com/512/9203/9203764.png" 
      alt="Profile" 
      className="w-24 h-24 rounded-full object-cover border border-gray-300"
    />
  </div>
</div>


      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="border p-3 rounded">
          <p className="font-semibold">Email: {student.email}</p>
          <p className="font-semibold">Submiited on: {student.mobileNumber}</p>
          <p className="font-semibold">Submitted At: {student.district}</p>
        </div>
        <div className="border p-3 rounded">
          <p className="font-semibold">College: {student.schoolCollegeName}</p>
          <p className="font-semibold">Gender: {student.gender}</p>
          <p className="font-semibold">Final Status: {student.grade}</p>
        </div>
      </div>
      <div className="max-w-5xl bg-white shadow-md rounded-lg p-6 mt-5">
  <h2 className="text-2xl font-bold mb-4">Application Status</h2>

  <div className="grid grid-cols-4 gap-4">
    <div className="p-2 border rounded-lg text-center shadow-md bg-gray-100 min-w-[100px]">
      <p className="text-gray-700 text-xl font-semibold">Pending 🔄</p>
    </div>
    <div className="p-2 border rounded-lg text-center shadow-md bg-gray-100 min-w-[100px]">
      <p className="text-gray-700 text-xl font-semibold">Shortlisted ✔️</p>
    </div>
    <div className="p-2 border rounded-lg text-center shadow-md bg-gray-100 min-w-[100px]">
      <p className="text-gray-700 text-xl font-semibold">Reviewed 👀</p>
    </div>
    <div className="p-2 border rounded-lg text-center shadow-md bg-gray-100 min-w-[100px]">
      <p className="text-gray-700 text-xl font-semibold">Rejected ❌</p>
    </div>
  </div>
</div>

      <div className="flex gap-4 mt-2">
          {/* Original File Card */}
          <div className="border border-gray-300 rounded-lg p-4 shadow-md w-60 text-center">
            <h3 className="font-semibold text-gray-700">Original File</h3>
            <a
              href={""}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline block mt-2"
            >
              View File
            </a>
            
          </div>

          {/* Extracted File Card */}
          <div className="border border-gray-300 rounded-lg p-4 shadow-md w-60 text-center">
            <h3 className="font-semibold text-gray-700">Extracted File</h3>
            <a
              href={""}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline block mt-2"
            >
              View File
            </a>
          </div>
          
        </div>

     {/*Score Card*/}
     <ParameterSelector/>
      <h2 className="text-xl font-semibold text-gray-700 mt-6 mb-4">Score Card</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-2 py-1">Parameter</th>
            <th className="border border-gray-300 px-2 py-1">AI Score</th>
            <th className="border border-gray-300 px-2 py-1">Manual Score</th>
          </tr>
        </thead>
        <tbody>
        {scoreData.map((item, index) => (
            <tr key={index} className="text-center">
              <td className="border border-gray-300 px-2 py-1">{item.parameter}</td>
              <td className="border border-gray-300 px-2 py-1">
                <input
                  type="number"
                  className="w-16 text-center border rounded p-1"
                  value={item.aiScore}
                  onChange={(e) => handleScoreChange(index, "aiScore", e.target.value)}
                />
              </td>
              <td className="border border-gray-300 px-2 py-1">
                <input
                  type="number"
                  className="w-16 text-center border rounded p-1"
                  value={item.manualScore}
                  onChange={(e) => handleScoreChange(index, "manualScore", e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total Scores */}
      <div className="mt-4">
        <div className="flex justify-between text-sm font-semibold">
          <span>Total AI Score:</span>
          <span>{totalAiScore}</span>
        </div>
        <div className="flex justify-between text-sm font-semibold">
          <span>Total Manual Score:</span>
          <span>{totalManualScore}</span>
        </div>
        <div className="flex justify-between text-sm font-bold text-blue-600">
          <span>Total Score:</span>
          <span>{totalScore}</span>
        </div>
        
      </div>
     
     
      {/* Grade & Result */}
      
      <div className="mt-2 flex justify-between">

        <span className="text-sm font-semibold">Result:</span>
        <span className={`font-bold ${result === "Shortlisted" ? "text-blue-500" : "text-red-900"}`}>{result}</span>
      </div>
      <label className="block text-gray-700 font-semibold mt-4">Remark</label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded mt-1"
          placeholder="Write your comments"
        ></textarea>

        <button className="mt-4 bg-blue-950 text-white px-4 py-2 rounded hover:bg-blue-600">
          Submit Remark
        </button>
      {/* Action Buttons */}
      <div className="mt-5 flex space-x-3">
        <button className="px-4 py-2 bg-blue-800 text-white rounded">Edit</button>
        <button className="px-4 py-2 bg-red-700 text-white rounded">Delete</button>
      </div>
    </div>
  );
};

export default StudentDetails;