import { useState, useEffect } from "react";
import Controls from "./Controls";  // Import the Controls component

function Table() {
  const [submissions, setSubmissions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const submissionsPerPage = 50;
  const [showShortlistedOnly, setShowShortlistedOnly] = useState(false); // Filter state

  useEffect(() => {
    const fetchData = async () => {
      const data = Array.from({ length: 200 }, (_, index) => ({
        id: `SUB${index + 1}`,
        studentName: `Student ${index + 1}`,
        file: `Submission ${index + 1}`,
        aiScore: Math.floor(Math.random() * 100),
        manualScore: Math.floor(Math.random() * 100),
        reviewed: false,
        shortlisted: false, // Randomly mark some as shortlisted
      }));
      setSubmissions(data);
    };

    fetchData();
  }, []);

  const indexOfLastSubmission = currentPage * submissionsPerPage;
  const indexOfFirstSubmission = indexOfLastSubmission - submissionsPerPage;
  
  // Apply filtering if "Show Only Shortlisted" is active
  const filteredSubmissions = showShortlistedOnly 
    ? submissions.filter(sub => sub.shortlisted) 
    : submissions;

  const currentSubmissions = filteredSubmissions.slice(indexOfFirstSubmission, indexOfLastSubmission);

  // Toggle Filter (Show Only Shortlisted)
  const handleFilter = () => {
    setShowShortlistedOnly(prev => !prev);
    setCurrentPage(1); // Reset to first page after filtering
  };

  // Add parameters (e.g., extra data)
  const handleAddParameters = () => {
    const updatedSubmissions = submissions.map(sub => ({
      ...sub,
      extraParameter: `Extra ${Math.floor(Math.random() * 100)}`, // Example additional parameter
    }));
    setSubmissions(updatedSubmissions);
  };

  const handleCheckboxChange = (id, field) => {
    setSubmissions(prevSubmissions => 
      prevSubmissions.map(submission => 
        submission.id === id ? { ...submission, [field]: !submission[field] } : submission
      )
    );
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
    <div className="w-full max-w-5xl bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 text-center mb-4"> Student Submissions</h2>
      
      {/* Controls Component */}
      <Controls  handleFilter={handleFilter} handleAddParameters={handleAddParameters} />

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
              <th className="p-2 border border-gray-300 text-center">Reviewed</th>
              <th className="p-2 border border-gray-300 text-center">Shortlisted</th>
            </tr>
          </thead>
          <tbody>
            {currentSubmissions.map((submission, index) => (
              <tr key={submission.id} className={`border border-gray-200 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                <td className="p-2 border border-gray-300 text-center">{submission.id}</td>
                <td className="p-2 border border-gray-300">{submission.studentName}</td>
                <td className="p-2 border border-gray-300">
                  <a href="#" className="text-indigo-600 hover:underline">{submission.file}</a>
                </td>
                <td className="p-2 border border-gray-300 text-center">{submission.aiScore}</td>
                <td className="p-2 border border-gray-300 text-center">{submission.manualScore}</td>
                <td className="p-2 border border-gray-300 text-center">
  <input
    type="checkbox"
    checked={submission.reviewed}
    onChange={() => handleCheckboxChange(submission.id, "reviewed")}
    className="cursor-pointer"
  />
</td>
<td className="p-2 border border-gray-300 text-center">
  <input
    type="checkbox"
    checked={submission.shortlisted}
    onChange={() => handleCheckboxChange(submission.id, "shortlisted")}
    className="cursor-pointer accent-green-600"
  />
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
