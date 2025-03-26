import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getHackathonSubmissionsAPI, shortlistStudents, updateSubmissionAPI } from "../utils/api.jsx";
import { useDispatch } from "react-redux";
import { setSelectedSubmissionId } from "../slices/submissionSlice.js";
import Controls from "./Controls";
import toast from 'react-hot-toast';

const BroadTable = forwardRef(({ onSubmissionSelect }, ref) => {
  const hackathon = useSelector((state) => state.hackathon.selectedHackathon);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [numShortlist, setNumShortlist] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const submissionsPerPage = 50;
  const [showShortlistedOnly, setShowShortlistedOnly] = useState(false); // Filter state

  // Toggle row selection with parent notification
  const toggleRowSelection = (submission) => {
    setSelectedRows(prev => {
      const isSelected = prev.some(row => row._id === submission._id);
      const newSelectedRows = isSelected
        ? prev.filter(row => row._id !== submission._id)
        : [...prev, submission];

      // Notify parent about selection changes
      if (onSubmissionSelect) {
        onSubmissionSelect(newSelectedRows);
      }
      
      return newSelectedRows;
    });
  };

  // Notify parent about initial selection state or when selection changes
  useEffect(() => {
    if (onSubmissionSelect) {
      onSubmissionSelect(selectedRows);
    }
  }, [selectedRows, onSubmissionSelect]);

  const fetchSubmissions = async () => {
    try {
      const res = await getHackathonSubmissionsAPI(hackathon._id);
      console.log(res);
      setSubmissions(res);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [hackathon._id]);

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
   .then(()=>{
     toast.success("Shortlist finalized successfully!");
     navigate("/teacher/shortlist");
   })
   .catch((err)=>{
     toast.error("Failed to finalize shortlist: " + (err.message || "Unknown error"));
   });
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
const sortByManualScore = () => {
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

  // Expose refreshData method to parent using ref
  useImperativeHandle(ref, () => ({
    refreshData: fetchSubmissions,
    getSelectedRows: () => selectedRows
  }));

  return (
    <div className="w-full  bg-white shadow-md rounded-lg p-6">
      <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
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
              onClick={() => sortByManualScore()}
              className="px-3 py-1 bg-gray-900 text-white rounded-md hover:bg-gray-700"
            >
              Sort by Manual score
            </button>
          </div>
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="shortlisted-filter"
              checked={showShortlistedOnly}
              onChange={() => setShowShortlistedOnly(!showShortlistedOnly)}
              className="mr-2 accent-blue-600" 
            />
            <label htmlFor="shortlisted-filter" className="text-sm text-gray-700">Show only shortlisted</label>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">{`${selectedRows.length} submissions selected`}</span>
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

      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th scope="col" className="p-4">
                <span className="sr-only">Select</span>
              </th>
              <th scope="col" className="py-3 px-6">ID</th>
              <th scope="col" className="py-3 px-6">Student</th>
              <th scope="col" className="py-3 px-6">File</th>
              <th scope="col" className="py-3 px-6">Overview</th>
              <th scope="col" className="py-3 px-6">Tags</th>
              <th scope="col" className="py-3 px-6">AI Score</th>
              <th scope="col" className="py-3 px-6">Manual Score</th>
              <th scope="col" className="py-3 px-6">Shortlisted</th>
              <th scope="col" className="py-3 px-6">Reviewed</th>
              <th scope="col" className="py-3 px-6">View More</th>
            </tr>
          </thead>
          <tbody>
            {currentSubmissions.map((submission, index) => (
              <tr key={submission._id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                <td className="p-4 w-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.some(row => row._id === submission._id)}
                    onChange={() => toggleRowSelection(submission)}
                    className="cursor-pointer accent-blue-600"
                  />
                </td>
                <td className="py-3 px-6">{index+1}</td>
                <td className="py-3 px-6">{submission.studentId.name}</td>
                <td className="py-3 px-6">
                  <a href={submission.files[0].fileUrl} className="text-black hover:underline">file {index+1}</a>
                </td>
                <td className="py-3 px-6">{submission.description}</td>
                <td className="py-3 px-6">
                  <span className="px-2 py-1 bg-gray-100 text-black rounded-full text-xs">{submission.tags}</span>
                </td>
                <td className="py-3 px-6">
                  <div className="flex justify-center items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      (submission.totalAIScore >= 80) ? 'bg-green-100 text-green-800' :
                      (submission.totalAIScore >= 60) ? 'bg-blue-100 text-blue-800' :
                      (submission.totalAIScore >= 40) ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {submission.totalAIScore || '0'}/100
                    </span>
                  </div>
                </td>
                <td className="py-3 px-6">
                  <div className="flex justify-center items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      (submission.totalScore >= 80) ? 'bg-green-100 text-green-800' :
                      (submission.totalScore >= 60) ? 'bg-blue-100 text-blue-800' :
                      (submission.totalScore >= 40) ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {submission.totalScore || '0'}/100
                    </span>
                  </div>
                </td>
                <td className="py-3 px-6">
                  <input
                    type="checkbox"
                    checked={submission.status === "Shortlisted"}
                    onChange={() => handleCheckboxChange(submission._id)}
                    className="cursor-pointer accent-green-600"
                  />
                </td>
                <td className="py-3 px-6">
                  <input
                    type="checkbox"
                    checked={submission.review}
                    onChange={() => handleCheckboxChange(submission.id)}
                    className="cursor-pointer accent-blue-600"
                  />
                </td>
                <td className="py-3 px-6">
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
});

export default BroadTable;
