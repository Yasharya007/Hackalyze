import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaChartBar, FaLaptopCode, FaCogs, FaClipboardList, FaTrophy, FaUserCog, FaArrowLeft } from 'react-icons/fa';
import BroadTable from "../components/BroadTable.jsx";

const DetailedAnalysis = () => {
  const navigate = useNavigate();
  const hackathon = useSelector((state) => state.hackathon.selectedHackathon);
  
  // Get active sidebar item
  const getActiveSidebarItem = () => {
    return 'submissions'; // This page is part of the submissions flow
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
                className={`flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-600 ${
                  getActiveSidebarItem() === 'dashboard' ? 'bg-gray-100 font-medium' : ''
                }`}
              >
                <FaChartBar className="h-5 w-5 mr-3" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/view-hackathons" 
                className={`flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-600 ${
                  getActiveSidebarItem() === 'hackathons' ? 'bg-gray-100 font-medium' : ''
                }`}
              >
                <FaLaptopCode className="h-5 w-5 mr-3" />
                <span>View Hackathons</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/teacher/dashboard" 
                className={`flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-600 ${
                  getActiveSidebarItem() === 'parameters' ? 'bg-gray-100 font-medium' : ''
                }`}
              >
                <FaCogs className="h-5 w-5 mr-3" />
                <span>Set Parameters</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/teacher/submissions" 
                className={`flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-900 font-semibold ${
                  getActiveSidebarItem() === 'submissions' ? 'bg-gray-100' : ''
                }`}
              >
                <FaClipboardList className="h-5 w-5 mr-3" />
                <span>View Submissions</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/teacher/dashboard" 
                className={`flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-600 ${
                  getActiveSidebarItem() === 'shortlist' ? 'bg-gray-100 font-medium' : ''
                }`}
              >
                <FaTrophy className="h-5 w-5 mr-3" />
                <span>View Shortlist</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/teacher/settings" 
                className={`flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-600 ${
                  getActiveSidebarItem() === 'settings' ? 'bg-gray-100 font-medium' : ''
                }`}
              >
                <FaUserCog className="h-5 w-5 mr-3" />
                <span>Settings</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Header with back button */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 relative">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/teacher/hackathon')}
                className="mr-4 p-2 rounded-full hover:bg-gray-100 text-gray-600"
                aria-label="Back to submissions"
              >
                <FaArrowLeft className="text-xl" />
              </button>
              <div>
                <h1 className="text-2xl font-bold mb-2">Evaluations</h1>
                <p className="text-gray-600">{hackathon?.title || 'Hackathon'} Analysis</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* BroadTable Component */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <BroadTable />
        </div>
      </main>
    </div>
  );
};

export default DetailedAnalysis;
