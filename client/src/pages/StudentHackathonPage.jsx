import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearHackathon,setHackathon } from "../slices/hackathonSlice.js";
import { HackathonAPI,SubmissionStatusAPI } from "../utils/api.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FaTachometerAlt, FaUserGraduate, FaCog, FaSignOutAlt, FaMedal, FaCalendarAlt, FaClock, FaGraduationCap, FaChalkboardTeacher, FaFileAlt } from "react-icons/fa";

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-white shadow-lg flex flex-col justify-between p-6">
      {/* Profile Section */}
      <div>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
          <h2 className="text-lg font-semibold text-gray-800">Student Portal</h2>
        </div>

        {/* Navigation */}
        <nav className="mt-6">
          <ul className="space-y-4">
            <li className="flex items-center space-x-3 text-blue-600 font-medium">
              <FaTachometerAlt /> <span>Dashboard</span>
            </li>
            <li className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 cursor-pointer">
              <FaMedal /> <span>Enrolled Hackathons</span>
            </li>
            <li className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 cursor-pointer">
              <FaCog /> <span>Settings</span>
            </li>
          </ul>
        </nav>
      </div>

      {/* Logout */}
      <button className="flex items-center space-x-3 text-red-600 font-medium hover:text-red-800">
        <FaSignOutAlt /> <span>Logout</span>
      </button>
    </div>
  );
};

const StudentHackathonPage = () => {
  const initialhackthon = useSelector((state) => state.hackathon.selectedHackathon); // Get hackathon from Redux
  const [hackathon,setHackathonP]=useState(initialhackthon)
  const [status,setStatus]=useState("Pending");
  const studentId = useSelector((state) => state.student.studentId);
  // console.log(studentId)
  console.log(hackathon);
  const formatDate = (isoString) => isoString.split("T")[0];
  const [selectedFormat, setSelectedFormat] = useState("");
  const [file, setFile] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const studentId = "YOUR_LOGGED_IN_STUDENT_ID"; // Get student ID from auth state
  useEffect(() => {
    if (!hackathon?._id) return; // Ensure hackathonId exists

    // Fetch latest hackathon details and update Redux store
    const fetchLatestHackathon = async () => {
      try {
        const updatedHackathon = await HackathonAPI(hackathon._id);
        dispatch(setHackathon(updatedHackathon)); // Update Redux store
        setHackathonP(updatedHackathon);
        if(isRegistered){
          const updatedStatus=await SubmissionStatusAPI(hackathon._id);
          if(updatedStatus){
            setStatus(updatedStatus.status)
            console.log(status)
          }
        }
      } catch (error) {
        console.error("Error fetching hackathon details:", error);
      }
    };

    fetchLatestHackathon();
  }, [isRegistered])
  useEffect(() => {
    for(let x=0;x<hackathon.registeredStudents.length;x++){
      if(hackathon.registeredStudents[x]===studentId){
        setIsRegistered(true);
      }
    }
    }, [hackathon]);
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };
  const handleRegisterClick = () => {
    setShowForm(true);
  };
  const handleRegister = async () => {
    if (!selectedFormat || !file) {
      toast.error("Please fill all fields and upload a file!");
      return;
    }
  
    const formData = new FormData();
    formData.append("fileType", selectedFormat);
    formData.append("hackathonId", hackathon._id);
    formData.append("file", file); // File to be uploaded
    const tst=toast.loading("submitting ...")
    
      axios.post("http://localhost:8000/api/student/submit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      })
      .then((response)=>{
        toast.success("Registration Successful!");
        console.log(response);
        setShowForm(false);
        setIsRegistered(true);
        // navigate("/hackathon");
      })
      .catch((error)=>{
        toast.error("Something went wrong")
      })
      .finally(()=>{
        toast.dismiss(tst);
      })
        
      
  };

  if (!hackathon) return null;

  return (
    <div className="flex gap-6 p-6 w-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col w-full bg-white p-6 rounded-xl shadow-lg">
        {/* Title */}
        <div className="mb-4 border-b pb-4">
          <h1 className="text-3xl font-bold text-blue-600">{hackathon.title}</h1>
          <p className="text-gray-600">{hackathon.description}</p>
        </div>

        {/* Dates & Time */}
        <div className="grid grid-cols-2 gap-6 bg-gray-100 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-blue-500" />
            <span><b>Start Date:</b> {formatDate(hackathon.startDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-green-500" />
            <span><b>End Date:</b> {formatDate(hackathon.endDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaClock className="text-red-500" />
            <span><b>Start Time:</b> {hackathon.startTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaClock className="text-gray-700" />
            <span><b>End Time:</b> {hackathon.endTime}</span>
          </div>
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-2 gap-6 mt-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-700">🔹 Criteria</h2>
            <ul className="list-disc pl-6 text-gray-600">
              {hackathon.criteria.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-700">📁 Allowed Formats</h2>
            <ul className="list-disc pl-6 text-gray-600">
              {hackathon.allowedFormats.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Teachers & Students */}
         <div className="grid grid-cols-2 gap-6 mt-6">
          {/* <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
              <FaChalkboardTeacher className="text-orange-500" /> Teachers Assigned
            </h2>
            <p className="text-gray-600 mt-2">65f1a6b9e1c3d5b4a3f9c8e2</p>
          </div> */}

          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
              <FaGraduationCap className="text-purple-500" /> Registered Students
            </h2>
            <p className="text-gray-600 mt-2">{hackathon.registeredStudents.length}</p>
          </div>
        </div>

        {/* Register Button */}
        <div className="mt-8 text-center">
          {isRegistered && (
            <button className="bg-gray-400 text-white px-6 py-3 rounded-lg cursor-not-allowed">
              ✅ Already Registered
            </button>
          )
        //   :(
        //     <button
        //       onClick={handleRegisterClick}
        //       className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition"
        //     >
        //       📝 Register Now
        //     </button>
        //   )
          }
        </div>
      </div>
      {
        isRegistered? (<div>Status : {status}</div>):
        (
          showForm ? (
            <div className="mt-6 p-6 bg-gray-100 rounded-lg shadow-md w-full">
              <h2 className="text-xl font-semibold text-gray-700">📋 Registration Form</h2>
              
              {/* Name Input
              <input type="text" placeholder="Full Name" className="w-full p-2 border rounded-lg mt-2" /> */}
              
              {/* Email Input */}
              {/* <input type="email" placeholder="Email" className="w-full p-2 border rounded-lg mt-2" /> */}
              
              {/* File Format Dropdown */}
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full p-2 border rounded-lg mt-2"
              >
                <option value="" disabled>Select File Format</option>
                {hackathon.allowedFormats.map((item, index) => (
                <option key={index} value={item}>{item}</option>
              ))}
                
              </select>
              
              {/* File Upload */}
              {selectedFormat && (
                <input
                  type="file"
                  accept={
                    selectedFormat === "Audio" ? "audio/*" :
                    selectedFormat === "Video" ? "video/*" :
                    selectedFormat === "Image" ? "image/*" :
                    "*/*"
                  }
                  onChange={handleFileChange}
                  className="w-full p-2 border rounded-lg mt-2"
                />
              )}
          
              {/* Submit Button */}
              <button
                onClick={handleRegister}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
              >
                ✅ Submit Registration
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 h-13 w-60 hover:bg-blue-700 text-white px-1 py-1 rounded-lg"
            >
              📝 Register Now
            </button>
          )
        )
      }
        

    </div>
  );
};

export default StudentHackathonPage;
