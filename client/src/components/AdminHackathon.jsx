import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearHackathon,setHackathon } from "../slices/hackathonSlice.js";
import { HackathonAPI,SubmissionStatusAPI } from "../utils/api.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const AdminHackathon = () => {
  const initialhackthon = useSelector((state) => state.hackathon.selectedHackathon); // Get hackathon from Redux
  const [hackathon,setHackathonP]=useState(initialhackthon)
  const [activeTab, setActiveTab] = useState("teachers");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const formatDate = (isoString) => isoString.split("T")[0];
  const students = [
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice@example.com",
      status: "Registered",
    },
    {
      id: 2,
      name: "Bob Williams",
      email: "bob@example.com",
      status: "Submitted",
    },
    {
      id: 3,
      name: "Charlie Brown",
      email: "charlie@example.com",
      status: "Registered",
    },
  ];
  const notifications = [
    {
      id: 1,
      title: "Submission deadline reminder",
      message:
        "Reminder: The submission deadline is approaching. Please submit your projects by June 30, 2023.",
      date: "June 25, 2023",
    },
    {
      id: 2,
      title: "Welcome to AI Innovation Challenge",
      message:
        "Welcome to the AI Innovation Challenge! We're excited to have you participate in this hackathon.",
      date: "June 1, 2023",
    },
  ];
  const acceptedMediaTypes = [
    { id: 1, name: "PDF", icon: "📄" },
    { id: 2, name: "Video", icon: "🎥" },
    { id: 3, name: "GitHub Repository", icon: "💾" },
  ];
  return (
    <div className="flex w-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r h-screen sticky top-0 flex flex-col">
        <div className="p-5 flex-grow">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <h2 className="text-xl font-bold ml-2">Hackalyze</h2>
          </div>
          <nav>
            <ul className="space-y-2">
              <li>
                <a
                  href="/admin/dashboard"
                  className="flex items-center p-2 rounded-md hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Overview</span>
                </a>
              </li>
              <li>
                <a
                  href="/admin/dashboard"
                  className="flex items-center p-2 rounded-md bg-black text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>Hackathons</span>
                </a>
              </li>
              <li>
                <a
                  href="/admin/dashboard"
                  className="flex items-center p-2 rounded-md hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>Teachers</span>
                </a>
              </li>
              <li>
                <a
                  href="/admin/create-hackathon"
                  className="flex items-center p-2 rounded-md hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Create Hackathon</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
        {/* Logout at bottom of sidebar */}
        <div className="mb-6 px-4">
          <button
            className="flex items-center p-2 rounded-md text-red-600 hover:bg-red-50 w-full"
            onClick={() => {
              // Call logout API
              navigate("/");
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{hackathon.title} <span className="text-green-600">Active</span></h1>
          <div>
          <button className="px-4 py-2 border rounded mr-2 hover:bg-gray-100">Edit</button>
          <button className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800">Publish Results</button>

          </div>
        </div>
        
        {/* Hackathon Details */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="p-4 bg-white shadow rounded">
            <h3 className="text-lg font-semibold">Duration</h3>
            <p>{formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}</p>
          </div>
          <div className="p-4 bg-white shadow rounded">
            <h3 className="text-lg font-semibold">Participants</h3>
            <p>{hackathon.registeredStudents.length}</p>
          </div>
          <div className="p-4 bg-white shadow rounded">
            <h3 className="text-lg font-semibold">Submission Deadline</h3>
            <p>{formatDate(hackathon.endDate)}, {hackathon.endTime}</p>
          </div>
        </div>
        
        {/* Description */}
        <div className="mt-6 p-4 bg-white shadow rounded">
          <h2 className="text-xl font-semibold">Description</h2>
          <p>{hackathon.description}</p>
        </div>
        
        {/* Tabs */}
        <div className="mt-6 flex space-x-4 border-b">
          {[
            { id: "teachers", label: "Assigned Teachers" },
            { id: "students", label: "Registered Students" },
            { id: "media", label: "Accepted Media" },
            { id: "notifications", label: "Notifications" },
            { id: "results", label: "Results" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 ${
                activeTab === tab.id 
                  ? "border-b-2 border-black" 
                  : "text-gray-500 hover:text-black"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        
        {/* Assigned Teachers Section */}
        {activeTab === "teachers" && (
          <div className="mt-4 p-4 bg-white shadow rounded">
            <h3 className="text-lg font-semibold">Assigned Teachers</h3>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center p-2 bg-gray-100 rounded">
                <span>John Smith (john@example.com)</span>
                <button className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">Remove</button>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-100 rounded">
                <span>Jane Doe (jane@example.com)</span>
                <button className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">Remove</button>
              </div>
            </div>
            <button className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800">
              Assign Teachers
            </button>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="mt-4 p-4 bg-white shadow rounded">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Registered Students</h2>
              <div className="space-x-2">
                <button className="border px-4 py-2 rounded-md hover:bg-gray-100">
                  Export List
                </button>
                <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800">
                  Add Students
                </button>
              </div>
            </div>
            <div>
              {students.map((student) => (
                <div key={student.id} className="flex justify-between items-center py-3">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div>
                      <p className="font-semibold">{student.name}</p>
                      <p className="text-gray-500 text-sm">{student.email}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-md ${
                      student.status === "Submitted"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {student.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="mt-4 p-4 bg-white shadow rounded">
            <h2 className="text-xl font-semibold mb-4">Accepted Media Types</h2>
            <div className="flex flex-wrap gap-3">
              {acceptedMediaTypes.map((media) => (
                <button
                  key={media.id}
                  className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200"
                >
                  {media.icon} {media.name}
                </button>
              ))}
            </div>
            <button className="mt-4 px-4 py-2 bg-black text-white rounded-lg float-right hover:bg-gray-800">
              Update Media Types
            </button>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="mt-4 p-4 bg-white shadow rounded">
            <h2 className="text-xl font-semibold mb-4">Notifications</h2>
            <button className="px-4 py-2 bg-black text-white rounded-lg float-right hover:bg-gray-800">
              Send Notification
            </button>
            <div className="clear-both mt-6">
              {notifications.map((notification) => (
                <div key={notification.id} className="py-4 border-b last:border-0">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">🔔</span>
                    <div>
                      <p className="font-semibold">{notification.title}</p>
                      <p className="text-gray-600">{notification.message}</p>
                      <p className="text-sm text-gray-500">
                        Sent on: {notification.date}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {activeTab === 'results' && (
          <div className="p-6 bg-white rounded-lg shadow text-center">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Results</h2>
              <div className="space-x-3">
                <button className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100">
                  Preview Results
                </button>
                <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                  Publish Results
                </button>
              </div>
            </div>
            <div className="py-12">
              <span className="text-5xl text-gray-400">⏰</span>
              <h3 className="text-lg font-semibold mt-4">Results Not Available Yet</h3>
              <p className="text-gray-600 mt-2">
                The hackathon is still in progress. Results will be available after
                the submission deadline and evaluation process.
              </p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminHackathon;
