import { useState, useEffect } from "react";
import Controls from "./Controls";  // Import the Controls component
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getHackathonSubmissionsAPI } from "../utils/api.jsx";
function Table() {
  const hackathon = useSelector((state) => state.hackathon.selectedHackathon);
  const navigate=useNavigate()
  const [submissions, setSubmissions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const submissionsPerPage = 50;
  const [showShortlistedOnly, setShowShortlistedOnly] = useState(false); // Filter state

  useEffect(() => {
    const fetchData = async () => {
      getHackathonSubmissionsAPI(hackathon._id)
      .then((res)=>{
        console.log(res);
        setSubmissions(res)
      }).catch(()=>{})
      // const data = Array.from({ length: 200 }, (_, index) => ({
      //   id: `SUB${index + 1}`,
      //   studentName: `Student ${index + 1}`,
      //   file: `Submission ${index + 1}`,
      //   aiScore: Math.floor(Math.random() * 100),
      //   manualScore: Math.floor(Math.random() * 100),
      //   reviewed: false,
      //   shortlisted: false, // Randomly mark some as shortlisted
      // }));

      // setSubmissions(data);
    };

    fetchData();
  }, []);
 

    const indexOfLastSubmission = currentPage * submissionsPerPage;
    const indexOfFirstSubmission = indexOfLastSubmission - submissionsPerPage;
    
    // // Apply filtering if "Show Only Shortlisted" is active
    const filteredSubmissions = showShortlistedOnly 
      ? submissions.filter(sub => sub.status === "Shortlisted") 
      : submissions;
  
    const currentSubmissions = filteredSubmissions.slice(indexOfFirstSubmission, indexOfLastSubmission);
 

 

  // Toggle Filter (Show Only Shortlisted)
  const handleFilter = () => {
    setShowShortlistedOnly(prev => !prev);
    setCurrentPage(1); // Reset to first page after filtering
  };

  

  // const handleCheckboxChange = (id, field) => {
  //   setSubmissions(prevSubmissions => 
  //     prevSubmissions.map(submission => 
  //       submission.id === id ? { ...submission, [field]: !submission[field] } : submission
  //     )
  //   );
  // };  

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredSubmissions.length / submissionsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="w-full max-w-5xl bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 text-center mb-4"> Student Submissions</h2>
      
      {/* Controls Component */}
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => handleFilter()}
          className="px-3 py-1 bg-gray-900 text-white rounded-md hover:bg-gray-700"
        >
          Show Only Shortlisted
        </button>
        <button
          onClick={() =>{navigate("/teacher/detailedAnalysis")}}
          className="px-3 py-1 bg-gray-900 text-white rounded-md hover:bg-gray-700"
        >
          Analyse and Evaluate
        </button>
        </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-gray-800 text-sm">
          <thead className="bg-gray-200 text-gray-700">
            <tr className="text-left">
              <th className="p-2 border border-gray-300 text-center">ID</th>
              <th className="p-2 border border-gray-300">Student</th>
              <th className="p-2 border border-gray-300">File</th>
              <th className="p-2 border border-gray-300 text-center">AI Score</th>
              <th className="p-2 border border-gray-300 text-center">Manual Score</th>
              <th className="p-15 border border-gray-300 text-center">Description</th>
              <th className="p-2 border border-gray-300 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {currentSubmissions.map((submission, index) => (
              <tr key={submission.id} className={`border border-gray-200 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                <td className="p-2 border border-gray-300 text-center">{index+1}</td>
                <td className="p-2 border border-gray-300 hover:text-blue-900 cursor-pointer" onClick={()=>{navigate("/teacher/individualSubmission")}}>{submission.studentId.name}</td>
                <td className="p-2 border border-gray-300">
                  <a href={submission.files[0].fileUrl} className="text-indigo-600 hover:underline">file {index+1}</a>
                </td>
                <td className="p-2 border border-gray-300 text-center">{submission.totalAIScore}</td>
                <td className="p-2 border border-gray-300 text-center">{submission.totalScore}</td>
                <td className="p-2 border border-gray-300 text-center text-black">{submission.description}</td>
<td className="p-2 border border-gray-300 text-center">
  {submission.status}
</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button onClick={prevPage} disabled={currentPage === 1} className="px-3 py-1 bg-gray-900 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-300">
          Previous
        </button>
        <span className="text-gray-600 text-sm font-medium">Page {currentPage} of {Math.ceil(filteredSubmissions.length / submissionsPerPage)}</span>
        <button onClick={nextPage} disabled={indexOfLastSubmission >= filteredSubmissions.length} className="px-3 py-1 bg-gray-900 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-300">
          Next
        </button>
      </div>
    </div>
  );
}

export default Table;
