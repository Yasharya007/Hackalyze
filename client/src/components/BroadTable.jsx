import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getHackathonSubmissionsAPI ,shortlistStudents,updateSubmissionAPI} from "../utils/api.jsx";
import { useDispatch } from "react-redux";
import { setSelectedSubmissionId } from "../slices/submissionSlice.js";
import Controls from "./Controls";
function Table() {
  const hackathon = useSelector((state) => state.hackathon.selectedHackathon);
  const navigate=useNavigate();
  const dispatch = useDispatch();
  const [numShortlist, setNumShortlist] = useState("");
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
      // const tagsList = ["AI", "ML", "Web Dev", "Data Science", "Cybersecurity", "Blockchain"];

      // const data = Array.from({ length: 200 }, (_, index) => ({
      //   id: `SUB${index + 1}`,
      //   studentName: `Student ${index + 1}`,
      //   file: `Submission ${index + 1}`,
      //   aiScore: Math.floor(Math.random() * 100),
      //   manualScore: Math.floor(Math.random() * 100),
      //   reviewed: false,
      //   shortlisted: false,
      //   review: false,
      //   view:`file`,
      //   overview: `This is a summary of submission ${index + 1}.`,  // Overview data
        
      //   tags: [tagsList[index % tagsList.length]], // Assign random tags
      // }));
      // setSubmissions(data);
    };

    fetchData();
  }, []);

  const indexOfLastSubmission = currentPage * submissionsPerPage;
  const indexOfFirstSubmission = indexOfLastSubmission - submissionsPerPage;
  
  // Apply filtering if "Show Only Shortlisted" is active
  const filteredSubmissions = showShortlistedOnly 
      ? submissions.filter(sub => sub.status === "Shortlisted") 
      : submissions;

  const currentSubmissions = filteredSubmissions.slice(indexOfFirstSubmission, indexOfLastSubmission);

  // Toggle Filter (Show Only Shortlisted)
  const handleShortlistFilter = () => {
    setShowShortlistedOnly(prev => !prev);
    setCurrentPage(1); // Reset to first page after filtering
  };

  const handleCheckboxChange = (id) => {
    setSubmissions(prevSubmissions => 
      prevSubmissions.map(submission => 
        submission._id === id 
          ? { ...submission, status: submission.status === "Shortlisted" ? "Pending" : "Shortlisted" } 
          : submission
      )
    );
  };
  const handleSelectSubmissions = () => {
    const count = parseInt(numShortlist, 10);

    if (isNaN(count) || count <= 0) {
      alert("Please enter a valid positive number.");
      return;
    }

    setSubmissions(prevSubmissions => 
      prevSubmissions.map((submission, index) => ({
        ...submission,
        status: index < count ? "Shortlisted":submission.status
      }))
    );
  };
  const handleSelectSubmission = (submissionId) => {
    dispatch(setSelectedSubmissionId(submissionId)); // Store ID in Redux
    navigate("/teacher/individualSubmission"); // Navigate to the page
};
  const finalizeShortlist = async () => {
    // Extract only the IDs of "Shortlisted" submissions
    const submissionIds = submissions
        .filter(submission => submission.status === "Shortlisted")
        .map(submission => submission._id);

    if (submissionIds.length === 0) {
        alert("No shortlisted submissions to finalize.");
        return;
    }
    console.log("id is" ,submissionIds)

   shortlistStudents(submissionIds)
   .then(()=>{navigate("/teacher/hackathon")})
   .catch(()=>{})
};
const updateSubmission= async () => {
  // Extract all submissions with _id and status
  const allSubmissions = submissions.map(submission => ({
      _id: submission._id,
      status: submission.status
  }));

  if (allSubmissions.length === 0) {
      alert("No submissions available to finalize.");
      return;
  }

  console.log("All submissions:", allSubmissions);

  updateSubmissionAPI(allSubmissions)
      .then(() => { navigate("/teacher/hackathon"); })
      .catch(() => {});
};

const sortByAIScore = () => {
  const sortedSubmissions = [...submissions].sort((a, b) => b.totalAIScore - a.totalAIScore);
  setSubmissions(sortedSubmissions);
};
// totalScore
const sortBytotalScore = () => {
  const sortedSubmissions = [...submissions].sort((a, b) => b.totalScore - a.totalScore);
  setSubmissions(sortedSubmissions);
};
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
    <div className="w-full  bg-white shadow-md rounded-lg p-6">
        {/* Removed ParameterSelector component */}
      <h2 className="text-xl font-bold text-gray-900 text-center mb-4">Student Submissions</h2>
      
      {/* <Controls/> */}
      <div className="w-full flex justify-between">
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => handleShortlistFilter()}
          className="px-3 py-1 bg-gray-900 text-white rounded-md hover:bg-gray-700"
        >
          Show Only Shortlisted
        </button>
        <button
          onClick={() => sortByAIScore()}
          className="px-3 py-1 bg-gray-900 text-white rounded-md hover:bg-gray-700"
        >
          Sort by AI
        </button>
        <button
          onClick={() => sortBytotalScore()}
          className="px-3 py-1 bg-gray-900 text-white rounded-md hover:bg-gray-700"
        >
          Sort by Manual score
        </button>
        </div>
        <div className="flex gap-2 mb-2">
        <div className="flex items-center gap-3">
      <input
        type="number"
        value={numShortlist}
        onChange={(e) => setNumShortlist(e.target.value)}
        placeholder="Enter count"
        min="1"
        className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600"
      />
      <button
        onClick={handleSelectSubmissions}
        className="px-3 py-1 bg-gray-900 text-white rounded-md hover:bg-gray-700"
      >
        Select Submissions
      </button>
    </div>
        <button
          onClick={updateSubmission}
          className="px-3 py-1 bg-gray-900 text-white rounded-md hover:bg-gray-700"
        >
          Finalise Result
        </button>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-gray-800 text-sm">
          <thead className="bg-gray-200 text-gray-700">
            <tr className="text-left">
              <th className="p-2 border border-gray-300 text-center">ID</th>
              <th className="p-2 border border-gray-300">Student</th>
              <th className="p-2 border border-gray-300">File</th>
              <th className="p-2 border border-gray-300 text-center">Overview</th>
              <th className="p-2 border border-gray-300 text-center">Tags</th>
              <th className="p-2 border border-gray-300 text-center">AI Score</th>
              <th className="p-2 border border-gray-300 text-center">Manual Score</th>
              {/* <th className="p-2 border border-gray-300 text-center">Reviewed</th> */}
              <th className="p-2 border border-gray-300 text-center">Shortlisted</th>
              <th className="p-2 border border-gray-300 text-center">Reviewed</th>
              <th className="p-2 border border-gray-300 text-center">View More</th>


            </tr>
          </thead>
          <tbody>
  {currentSubmissions.map((submission, index) => (
    <tr key={submission._id} className={`border border-gray-200 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
      <td className="p-2 border border-gray-300 text-center">{index+1}</td>
      <td className="p-2 border border-gray-300">{submission.studentId.name}</td>
      <td className="p-2 border border-gray-300">
        <a href={submission.files[0].fileUrl} className="text-black hover:underline">file {index+1}</a>
      </td>
      <td className="p-2 border border-gray-300">{submission.description}</td>
      <td className="p-2 border border-gray-300 text-center">
        <span className="px-2 py-1 bg-gray-100 text-black rounded-full text-xs">{submission.tags}</span>
      </td>
      <td className="p-2 border border-gray-300 text-center">{submission.totalAIScore}</td>
      <td className="p-2 border border-gray-300 text-center">{submission.totalScore}</td>

      {/* Reviewed Checkbox */}
      {/* <td className="p-2 border border-gray-300 text-center">{submission.reviewed}
      </td> */}

      {/* Shortlisted Checkbox */}
      <td className="p-2 border border-gray-300 text-center">
        <input
          type="checkbox"
          checked={submission.status === "Shortlisted"}
          onChange={() => handleCheckboxChange(submission._id, "Shortlisted")}
          className="cursor-pointer accent-green-600"
        />
      </td>

      {/* Review Checkbox */}
      <td className="p-2 border border-gray-300 text-center">
        <input
          type="checkbox"
          checked={submission.review}
          onChange={() => handleCheckboxChange(submission.id, "review")}
          className="cursor-pointer accent-blue-600"
        />
      </td>

      {/* View More Button (NOT a checkbox) */}
      <td className="p-2 border border-gray-300 text-center">
        <button className="text-blue-600 hover:underline" onClick={() => handleSelectSubmission(submission._id)} >review</button>
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
