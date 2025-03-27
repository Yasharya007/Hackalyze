import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { setHackathon } from "../slices/hackathonSlice";
import { logoutAPI } from "../utils/api.jsx";
import { 
  FaCalendarAlt, 
  FaClock, 
  FaGraduationCap, 
  FaChalkboardTeacher, 
  FaCheck, 
  FaListUl, 
  FaFileAlt, 
  FaRocket, 
  FaClipboardList, 
  FaUpload,
  FaChartBar
} from "react-icons/fa";
import { toast } from "react-hot-toast";

// Import Sidebar component
const Sidebar = () => {
  return (
    <aside className="w-64 bg-white shadow-lg flex flex-col justify-between h-screen sticky top-0">
      <div>
        {/* Header/Logo Section - no borders */}
        <div className="p-6">
          <div className="flex items-center">
            <img src="/logo.png" alt="Hackalyze Logo" className="h-8 mr-2" />
            <h1 className="text-2xl font-bold">Hackalyze</h1>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4">
          <nav>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/student/dashboard"
                  className="flex items-center p-2 rounded-md hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/student/profile"
                  className="flex items-center p-2 rounded-md hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>My Profile</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/student/enrolled-hackathons"
                  className="flex items-center p-2 rounded-md hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>Enrolled Hackathons</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/student/settings"
                  className="flex items-center p-2 rounded-md hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Settings</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Logout Button */}
      <div className="mb-6 px-4">
        <button
          className="flex items-center p-2 rounded-md text-red-600 hover:bg-red-50 w-full"
          onClick={() => {
            logoutAPI().then(() => {
              window.location.href = "/";
            });
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

const StudentHackathonPage = () => {
  const initialhackthon = useSelector((state) => state.hackathon.selectedHackathon);
  const [hackathon, setHackathonP] = useState(initialhackthon);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();
  
  const [showForm, setShowForm] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("");
  const [file, setFile] = useState(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [status, setStatus] = useState("Not Enrolled");
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [isResubmitting, setIsResubmitting] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const isDeadlinePassed = () => {
    if (!hackathon || !hackathon.endDate) return false;
    const currentDate = new Date();
    const deadline = new Date(hackathon.endDate);
    return currentDate > deadline;
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleRegisterClick = () => {
    setShowForm(!showForm);
  };

  // Check if user is already registered
  useEffect(() => {
    const checkRegistration = async () => {
      if (hackathon) {
        try {
          const response = await axios.post("http://localhost:8000/api/student/status", 
            { hackathonId: hackathon._id }, 
            { withCredentials: true }
          );
          if (response.data.isRegistered) {
            setAlreadyRegistered(true);
            setStatus(response.data.status);
            // Store submission details for potential resubmission
            setSubmissionDetails(response.data.submission);
            if (response.data.submission && response.data.submission.files && response.data.submission.files.length > 0) {
              setSelectedFormat(response.data.submission.files[0].format);
            }
          }
        } catch (error) {
          console.error("Error checking registration:", error);
        }
      }
    };

    checkRegistration();
  }, [hackathon]);

  const handleRegister = async () => {
    if (!selectedFormat || !file) {
      toast.error("Please fill all fields and upload a file!");
      return;
    }
  
    const formData = new FormData();
    formData.append("fileType", selectedFormat);
    formData.append("hackathonId", hackathon._id);
    formData.append("file", file); // File to be uploaded
    
    // If resubmitting, pass the submission ID as well
    if (isResubmitting && submissionDetails) {
      formData.append("isResubmission", "true");
      formData.append("submissionId", submissionDetails._id);
    }
    
    const tst = toast.loading(isResubmitting ? "Updating submission..." : "Submitting...");
    
    try {
      const response = await axios.post("http://localhost:8000/api/student/submit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      
      toast.success(isResubmitting ? "Submission updated successfully!" : "Registration Successful!");
      console.log(response);
      setShowForm(false);
      setAlreadyRegistered(true);
      setIsResubmitting(false);
      
      // Refresh hackathon data to update registration status
      const updatedHackathon = await axios.get(`http://localhost:8000/api/hackathon/${hackathon._id}`, {
        withCredentials: true
      });
      if (updatedHackathon.data) {
        setHackathonP(updatedHackathon.data);
        dispatch(setHackathon(updatedHackathon.data));
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(isResubmitting ? "Failed to update submission" : "Something went wrong with your registration");
    } finally {
      toast.dismiss(tst);
    }
  };

  const handleResubmit = () => {
    setIsResubmitting(true);
    setShowForm(!showForm);
  };

  // Fetch hackathon data using ID from URL params
  useEffect(() => {
    const fetchHackathonData = async () => {
      try {
        // If we have the hackathon ID from URL, fetch that specific hackathon
        if (params.id) {
          const response = await axios.get(`http://localhost:8000/api/hackathon/${params.id}`, {
            withCredentials: true
          });
          if (response.data) {
            setHackathonP(response.data);
            dispatch(setHackathon(response.data)); // Update Redux state too
          }
        } else if (initialhackthon?._id) {
          // If we have hackathon data in Redux but no URL param, use that
          setHackathonP(initialhackthon);
        } else {
          // If we have neither, redirect to the dashboard
          toast.error("Hackathon not found");
          navigate("/student/dashboard");
        }
      } catch (error) {
        console.error("Error fetching hackathon:", error);
        toast.error("Failed to load hackathon details");
        navigate("/student/dashboard");
      }
    };

    fetchHackathonData();
  }, [params.id, initialhackthon, dispatch, navigate]);

  if (!hackathon) return null;

  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Hackathon Details</h1>
          <p className="text-gray-600">View and register for this hackathon</p>
        </div>

        {/* Hackathon Card */}
        <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
          {/* Header with Hackathon Title */}
          <div className="bg-white p-6">
            <h2 className="text-2xl font-bold text-gray-800">{hackathon.title}</h2>
            <p className="mt-2 text-gray-600">{hackathon.description}</p>
          </div>

          {/* Info Section */}
          <div className="p-6">
            {/* Dates & Time Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                  <FaClock className="mr-2 text-blue-600" /> Timeline
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <FaCalendarAlt className="text-blue-500 mr-2" />
                    <div>
                      <span className="text-sm text-gray-500">Start Date</span>
                      <p className="font-medium">{formatDate(hackathon.startDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaCalendarAlt className="text-blue-500 mr-2" />
                    <div>
                      <span className="text-sm text-gray-500">End Date</span>
                      <p className="font-medium">{formatDate(hackathon.endDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaClock className="text-blue-500 mr-2" />
                    <div>
                      <span className="text-sm text-gray-500">Time</span>
                      <p className="font-medium">{hackathon.startTime} - {hackathon.endTime}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                  <FaChartBar className="mr-2 text-purple-600" /> Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <FaGraduationCap className="text-purple-500 mr-2" />
                    <div>
                      <span className="text-sm text-gray-500">Participants</span>
                      <p className="font-medium">{hackathon.registeredStudents.length} Students</p>
                    </div>
                  </div>
                  {alreadyRegistered && (
                    <div className="flex items-center">
                      <FaCheck className="text-green-500 mr-2" />
                      <div>
                        <span className="text-sm text-gray-500">Your Status</span>
                        <p className="font-medium text-green-600">{status || "Registered"}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                  <FaListUl className="mr-2 text-yellow-600" /> Criteria
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {hackathon.criteria.map((item, index) => (
                    <li key={index} className="text-gray-600">{item}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                  <FaFileAlt className="mr-2 text-green-600" /> Allowed Formats
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {hackathon.allowedFormats.map((item, index) => (
                    <li key={index} className="text-gray-600">{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Registration Section */}
            <div className="p-6 border-t">
              {alreadyRegistered ? (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                      <FaCheck className="text-green-500 mr-2" /> You're Registered
                    </h3>
                    <p className="text-sm text-gray-600">Your submission has been received</p>
                  </div>
                  {!isDeadlinePassed() && (
                    <button
                      onClick={handleResubmit}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-150"
                    >
                      {showForm && isResubmitting ? "Cancel Resubmission" : "Resubmit Work"}
                    </button>
                  )}
                </div>
              ) : isDeadlinePassed() ? (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                      <FaClock className="text-red-600 mr-2" /> Closed
                    </h3>
                    <p className="text-sm text-gray-600">The deadline for this hackathon has passed</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                      <FaRocket className="text-blue-600 mr-2" /> Ready to Participate?
                    </h3>
                    <p className="text-sm text-gray-600">Register now to join this hackathon</p>
                  </div>
                  <button
                    onClick={handleRegisterClick}
                    className="bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-lg transition duration-150"
                  >
                    {showForm ? "Hide Form" : "Register Now"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Registration Form */}
        {((showForm && !alreadyRegistered) || (showForm && isResubmitting)) && !isDeadlinePassed() && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FaClipboardList className="mr-2 text-indigo-600" /> 
              {isResubmitting ? "Update Your Submission" : "Submit Your Registration"}
            </h2>
            
            <div className="space-y-4">
              {/* File Format Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select File Format
                </label>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="" disabled>Choose a format</option>
                  {hackathon.allowedFormats.map((item, index) => (
                    <option key={index} value={item}>{item}</option>
                  ))}
                </select>
              </div>
              
              {/* File Upload */}
              {selectedFormat && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Your File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                    <input
                      type="file"
                      accept={
                        selectedFormat === "Audio" ? "audio/*" :
                        selectedFormat === "Video" ? "video/*" :
                        selectedFormat === "Image" ? "image/*" :
                        "*/*"
                      }
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        {file ? file.name : `Drag and drop your ${selectedFormat.toLowerCase()} file, or click to select`}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Accepted format: {selectedFormat}
                      </p>
                    </label>
                  </div>
                </div>
              )}
          
              {/* Submit Button */}
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleRegister}
                  className={`px-6 py-2 rounded-lg ${isResubmitting ? 'bg-green-600 hover:bg-green-700' : 'bg-black hover:bg-gray-900'} text-white font-medium`}
                >
                  {isResubmitting ? "Update Submission" : "Submit Registration"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentHackathonPage;