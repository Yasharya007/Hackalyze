
import { useState,useEffect } from "react";
import ParameterSelector from "../components/ParameterSelector.jsx";
import { getSubmissionDetailsAPI } from "../utils/api.jsx";
import { useSelector } from "react-redux";
const StudentDetails = () => {
  const formatDate = (isoString) => isoString.split("T")[0];
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
};
const [scoreData, setScoreData] = useState([
  { parameter: "Accuracy", score: 40, scoreManual: 45 },
  { parameter: "Speed", score: 30, scoreManual: 35 },
  { parameter: "Efficiency", score: 20, scoreManual: 25 },
]);
const statuses = [
  { label: "Pending 🔄", value: "Pending" },
  { label: "Shortlisted ✔️", value: "Shortlisted" },
  { label: "Reviewed 👀", value: "Reviewed" },
  { label: "Rejected ❌", value: "Rejected" },
];
  const submissionId = useSelector(state => state.submission.selectedSubmissionId);
  const [submission, setSubmission] =useState(
    {
      _id: "67e24f02e531a6dcded25f43",
      studentId: {
          _id: "67e24b1b1491ff6a226b6db6",
          name: "Nikhil Kumar",
          email: "nikhil20233202@gmail.com",
          mobileNumber: "7856342323",
          schoolCollegeName: "MNNIT",
          grade: "UG",
          gender: "Male",
          state: "UP",
          district: "Gorakhpur"
      },
      hackathonId: {
          _id: "67e1c48a4003d364ea2e137f",
          title: "Morgan Stanley Code To Give"
      },
      files: [
          {
              format: "File",
              fileUrl: "https://res.cloudinary.com/dq16hq377/image/upload/v1742884610/q1xmtxr0bngw6brqxawq.pdf",
              _id: "67e24f02e531a6dcded25f44"
          }
      ],
      description: "",
      totalScore: 0,
      totalAIScore: 0,
      grade: "Low",
      result: "Rejected",
      status: "Shortlisted",
      scores: [],
      AIscores: [],
      submissionTime: "2025-03-25T06:36:50.739Z",
      createdAt: "2025-03-25T06:36:50.741Z",
      updatedAt: "2025-03-25T08:01:06.114Z",
      __v: 0
  }
  
  )
  const [studentd, setStudent] = useState( {
    _id: "67e24b1b1491ff6a226b6db6",
    name: "Nikhil Kumar",
    email: "nikhil20233202@gmail.com",
    mobileNumber: "7856342323",
    schoolCollegeName: "MNNIT",
    grade: "UG",
    gender: "Male",
    state: "UP",
    district: "Gorakhpur"
});
  console.log(submissionId)
  useEffect(() => {
      const fetchData = async () => {
        getSubmissionDetailsAPI(submissionId)
        .then((res)=>{
          console.log(res);
          setSubmission(res.data)
          setStudent(res.data.studentId)
          setScoreData(res.data.AIscores)
          // console.log("data",res.data)
        }).catch(()=>{})
      };

      fetchData();
    }, []);
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

  
  // const handleScoreChange = (index, field, value) => {
  //   const updatedScores = [...scoreData];
  //   updatedScores[index][field] = Number(value); // Convert input value to number
  //   setScoreData(updatedScores);
  // };
  const handleScoreChange = (index, type, value) => {
    setSubmission((prevSubmission) => {
      let updatedScores = [...prevSubmission[type]]; // Either scores or AIscores
  
      updatedScores[index] = {
        ...updatedScores[index],
        score: Number(value)
      };
  
      return { ...prevSubmission, [type]: updatedScores };
    });
  };
  
  // Calculate total scores
  // const totalAiScore = scoreData.reduce((sum, item) => sum + item.aiScore, 0);
  // const totalManualScore = scoreData.reduce((sum, item) => sum + item.manualScore, 0);
  // const totalScore = totalAiScore + totalManualScore;

// Calculate total AI Score (from AIscores)
const totalAIScore = scoreData.reduce((sum, item) => sum + item.score, 0);

// Calculate total Manual Score (from scores)
// const totalManualScore = scoreData.reduce((sum, item) => sum + item.scoreManual, 0);
const totalManualScore=0
// Total Score (AI + Manual)
const totalScore = totalAIScore + totalManualScore;

  // Determine grade & result
  const grade = totalScore >= 90 ? "A+" : totalScore >= 75 ? "A" : totalScore >= 60 ? "B" : "C";
  const result = totalScore >= 60 ? "Shortlisted" : "Not Shortlisted";

  return (
    <div className="w-screen ml-auto mr-0 bg-white p-6 rounded-lg shadow-md mt-5">
         <div className="flex items-center justify-between">
  {/* Left: Name and ID stacked vertically */}
  <div>
    <h1 className="text-2xl font-bold">{studentd.name}</h1>
    <p className="text-gray-500">ID: {studentd._id}</p>
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
          <p className="font-semibold">Email: {studentd.email}</p>
          <p className="font-semibold">Submiited on: {submission._id?formatDate(submission.submissionTime):"loading"}</p>
          <p className="font-semibold">Submitted At: {student._id?formatTime(submission.submissionTime):"loading"}</p>
        </div>
        <div className="border p-3 rounded">
          <p className="font-semibold">College: {studentd.schoolCollegeName}</p>
          <p className="font-semibold">Gender: {studentd.gender}</p>
          <p className="font-semibold">Final Status: {studentd.grade}</p>
        </div>
      </div>
      <div className="max-w-5xl bg-white shadow-md rounded-lg p-6 mt-5">
  <h2 className="text-2xl font-bold mb-4">Application Status</h2>

  <div className="grid grid-cols-4 gap-4">
      {statuses.map((item) => (
        <div
          key={item.value}
          className={`p-2 border rounded-lg text-center shadow-md bg-gray-100 min-w-[100px] ${
            submission.status === item.value ? "bg-blue-200" : ""
          }`}
        >
          <p
            className={`text-gray-700 text-xl ${
              submission.status === item.value ? "font-bold" : "font-semibold"
            }`}
          >
            {item.label}
          </p>
        </div>
      ))}
    </div>
</div>

      <div className="flex gap-4 mt-2">
          {/* Original File Card */}
          <div className="border border-gray-300 rounded-lg p-4 shadow-md w-60 text-center">
            <h3 className="font-semibold text-gray-700">Original File</h3>
            <a
              href={submission.files[0].fileUrl}
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
        {/* {submission.scores.map((item, index) => (
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
          ))} */}
          {submission.AIscores.map((item, index) => (
  <tr key={index} className="text-center">
    <td className="border border-gray-300 px-2 py-1">{item.parameter}</td>
    
    {/* AI Score Input (Stored in AIscores) */}
    <td className="border border-gray-300 px-2 py-1">
      <input
        type="number"
        className="w-16 text-center border rounded p-1"
        value={
          submission.AIscores.find(ai => ai.parameter === item.parameter)?.score || 0
        }
        onChange={(e) =>
          handleScoreChange(index, "AIscores", e.target.value)
        }
      />
    </td>

    {/* Manual Score Input (Stored in scores) */}
    <td className="border border-gray-300 px-2 py-1">
      <input
        type="number"
        className="w-16 text-center border rounded p-1"
        value={item.score || 0}
        onChange={(e) =>
          handleScoreChange(index, "scores", e.target.value)
        }
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
          <span>{totalAIScore }</span>
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