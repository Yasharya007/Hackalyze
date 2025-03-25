import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { HackathonByTeacherAPI, logoutAPI } from "../utils/api.jsx";
import { setHackathon } from "../slices/hackathonSlice.js";
import { FaChartBar, FaLaptopCode, FaCogs, FaClipboardList, FaTrophy, FaUserCog, FaChevronRight, FaRegClock, FaCalendarAlt, FaUsers } from "react-icons/fa";
import toast from "react-hot-toast";

const TeacherHackathonsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const teacherId = useSelector((state) => state.student.studentId);
  const [assignedHackathons, setAssignedHackathons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Format date function
  const formatDate = (isoString) => {
    if (!isoString) return "No date specified";
    return new Date(isoString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get hackathon status based on dates
  const getHackathonStatus = (hackathon) => {
    const now = new Date();
    const startDate = new Date(hackathon.startDate);
    const endDate = new Date(hackathon.endDate);

    if (now < startDate) {
      return { label: "Upcoming", className: "bg-blue-100 text-blue-700" };
    } else if (now > endDate) {
      return { label: "Completed", className: "bg-gray-100 text-gray-700" };
    } else {
      return { label: "Active", className: "bg-green-100 text-green-700" };
    }
  };

  const getStatusClass = (hackathon) => {
    const status = getHackathonStatus(hackathon);
    return status.className;
  };

  // Fetch hackathons assigned to this teacher
  useEffect(() => {
    setIsLoading(true);
    HackathonByTeacherAPI(teacherId)
      .then((res) => {
        console.log("Teacher's assigned hackathons:", res);
        setAssignedHackathons(res);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching teacher's hackathons:", err);
        toast.error("Failed to load hackathons");
        setIsLoading(false);
      });
  }, [teacherId]);

  // Handle click to review submissions
  const handleReviewSubmissions = (hackathon) => {
    dispatch(setHackathon(hackathon));
    navigate("/teacher/hackathon");
  };

  // Handle click to view details
  const handleViewDetails = (hackathon) => {
    dispatch(setHackathon(hackathon));
    navigate(`/teacher/hackathon/${hackathon._id}/details`);
  };

  return (
    <div className="flex w-full min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col h-screen sticky top-0">
        <div className="p-6">
          <h2 className="text-2xl font-bold">Teacher Portal</h2>
        </div>
        <nav className="flex-grow px-4">
          <ul className="space-y-2">
            <li>
              <Link 
                to="/teacher/dashboard" 
                className="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-600"
              >
                <FaChartBar className="h-5 w-5 mr-3" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/view-hackathons" 
                className="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-900 font-semibold"
              >
                <FaLaptopCode className="h-5 w-5 mr-3" />
                <span>View Hackathons</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/teacher/dashboard" 
                className="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-600"
              >
                <FaCogs className="h-5 w-5 mr-3" />
                <span>Set Parameters</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/teacher/dashboard" 
                className="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-600"
              >
                <FaClipboardList className="h-5 w-5 mr-3" />
                <span>View Submissions</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/teacher/dashboard" 
                className="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-600"
              >
                <FaTrophy className="h-5 w-5 mr-3" />
                <span>View Shortlist</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/teacher/dashboard" 
                className="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-600"
              >
                <FaUserCog className="h-5 w-5 mr-3" />
                <span>Settings</span>
              </Link>
            </li>
          </ul>
        </nav>
        {/* Logout Button */}
        <div className="mt-auto mb-6 px-4">
          <a
            href="#"
            className="flex items-center p-2 rounded-md text-red-600 hover:bg-red-50 w-full"
            onClick={() => {
              logoutAPI().then(() => {
                window.location.href = "/";
              });
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Assigned Hackathons</h1>
          <p className="text-gray-600">View and manage hackathons assigned to you</p>
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex justify-end mb-6 gap-2">
          <button className="px-4 py-2 bg-white rounded shadow hover:bg-gray-50">
            Filter
          </button>
          <button className="px-4 py-2 bg-white rounded shadow hover:bg-gray-50">
            Sort
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : assignedHackathons.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-xl font-semibold mb-2">No Hackathons Assigned</h3>
            <p className="text-gray-600">You haven't been assigned to any hackathons yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignedHackathons.map((hackathon) => {
              return (
                <div key={hackathon._id} className="bg-white rounded-lg shadow overflow-hidden">
                  {/* Hackathon Image */}
                  <div className="h-48 bg-gray-200 relative">
                    {hackathon.image ? (
                      <img 
                        src={hackathon.image} 
                        alt={hackathon.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-3xl text-gray-400">🏆</span>
                      </div>
                    )}
                    {/* Status Badge */}
                    <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${status.className}`}>
                      {status.label}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-xl font-bold mb-2">{hackathon.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{hackathon.description}</p>
                    
                    {/* Info Items */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-700">
                        <FaCalendarAlt className="mr-2" />
                        <span>Deadline: {formatDate(hackathon.endDate)}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <FaUsers className="mr-2" />
                        <span>Participants: {hackathon.participants?.length || 0}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <FaClipboardList className="mr-2" />
                        <span>Submissions: {hackathon.submissionCount || 0}</span>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2">
                      <Link
                        to={`/teacher/hackathon/${hackathon._id}/details`}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        onClick={() => {
                          dispatch(setHackathon(hackathon));
                        }}
                      >
                        View Details
                        <FaChevronRight className="ml-1.5 h-3 w-3" />
                      </Link>
                      <button 
                        onClick={() => handleReviewSubmissions(hackathon)}
                        className="flex-1 py-2 px-3 bg-black text-white rounded hover:bg-gray-800 transition-colors text-sm font-medium"
                      >
                        Review Submissions
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default TeacherHackathonsPage;
