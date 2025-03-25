import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutAPI, getSubmissionStatsAPI } from "../utils/api.jsx";
import { FaCalendarAlt, FaUsers, FaClipboardList, FaTrophy, FaChartBar, FaDownload, FaLaptopCode, FaCogs, FaUserCog } from "react-icons/fa";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import toast from "react-hot-toast";

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TeacherHackathonDetailPage = () => {
  const navigate = useNavigate();
  const hackathon = useSelector((state) => state.hackathon.selectedHackathon);
  const [statsData, setStatsData] = useState(null);
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
  const getHackathonStatus = () => {
    if (!hackathon) return { label: "Unknown", className: "bg-gray-100 text-gray-700" };
    
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

  // Load submission statistics for this hackathon
  useEffect(() => {
    if (!hackathon || !hackathon._id) {
      toast.error("Hackathon information is missing");
      navigate("/view-hackathons");
      return;
    }

    setIsLoading(true);
    
    // This would be implemented in the API file
    getSubmissionStatsAPI(hackathon._id)
      .then((data) => {
        setStatsData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching submission stats:", err);
        // If API isn't implemented yet, use dummy data
        setStatsData({
          totalSubmissions: hackathon.submissionCount || Math.floor(Math.random() * 100),
          submissionsOverTime: [4, 7, 12, 18, 25, 32, 45],
          scoreDistribution: {
            '0-20': 5,
            '21-40': 12,
            '41-60': 25,
            '61-80': 35,
            '81-100': 23
          },
          submissionTypes: {
            'Text': 30,
            'PDF': 40,
            'Video': 15,
            'Image': 15
          },
          topPerformers: [
            { student: "Alex Johnson", score: 95 },
            { student: "Sarah Chen", score: 92 },
            { student: "Miguel Fernandez", score: 89 },
            { student: "Taylor Kim", score: 87 },
            { student: "Jordan Patel", score: 85 }
          ]
        });
        setIsLoading(false);
      });
  }, [hackathon, navigate]);

  // Handle review submissions click
  const handleReviewSubmissions = () => {
    navigate("/teacher/hackathon");
  };

  // Prepare chart data
  const scoreDistributionData = {
    labels: statsData ? Object.keys(statsData.scoreDistribution) : [],
    datasets: [
      {
        label: 'Number of Submissions',
        data: statsData ? Object.values(statsData.scoreDistribution) : [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 205, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(255, 159, 64)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
          'rgb(54, 162, 235)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const submissionTypesData = {
    labels: statsData ? Object.keys(statsData?.submissionTypes || {}) : [],
    datasets: [
      {
        label: 'Submission Types',
        data: statsData ? Object.values(statsData?.submissionTypes || {}) : [],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 205, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgb(54, 162, 235)',
          'rgb(75, 192, 192)',
          'rgb(255, 205, 86)',
          'rgb(255, 99, 132)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const submissionsOverTimeData = {
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
    datasets: [
      {
        label: 'Submissions',
        data: statsData ? statsData.submissionsOverTime : [],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
      },
    ],
  };
  
  const submissionsOverTimeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Submissions Over Time',
      },
    },
  };

  // If hackathon data is missing, show error
  if (!hackathon) {
    return (
      <div className="flex w-full min-h-screen bg-gray-100 justify-center items-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-2">No Hackathon Selected</h2>
          <p className="mb-4">Please select a hackathon from your dashboard.</p>
          <button
            onClick={() => navigate("/view-hackathons")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Hackathons
          </button>
        </div>
      </div>
    );
  }

  const status = getHackathonStatus();

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
        {/* Navigation Breadcrumb */}
        <div className="mb-4">
          <div className="flex items-center text-gray-600 text-sm">
            <Link to="/view-hackathons" className="hover:text-blue-600">Hackathons</Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-gray-800">{hackathon.title}</span>
          </div>
        </div>

        {/* Hackathon Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="h-48 bg-gray-200 relative">
            {hackathon.image ? (
              <img 
                src={hackathon.image} 
                alt={hackathon.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
                <h1 className="text-3xl font-bold text-white">{hackathon.title}</h1>
              </div>
            )}
            
            {/* Status Badge */}
            <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${status.className}`}>
              {status.label}
            </span>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold mb-2">{hackathon.title}</h1>
                <p className="text-gray-600 mb-4">{hackathon.description}</p>
              </div>
              
              <button 
                onClick={handleReviewSubmissions}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
              >
                Review Submissions
              </button>
            </div>

            {/* Hackathon Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <FaCalendarAlt className="text-gray-500 mr-2" />
                  <span className="text-sm font-medium">Start Date</span>
                </div>
                <div className="mt-1 text-lg">{formatDate(hackathon.startDate)}</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <FaCalendarAlt className="text-gray-500 mr-2" />
                  <span className="text-sm font-medium">End Date</span>
                </div>
                <div className="mt-1 text-lg">{formatDate(hackathon.endDate)}</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <FaUsers className="text-gray-500 mr-2" />
                  <span className="text-sm font-medium">Participants</span>
                </div>
                <div className="mt-1 text-lg">{hackathon.participants?.length || 0}</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <FaClipboardList className="text-gray-500 mr-2" />
                  <span className="text-sm font-medium">Submissions</span>
                </div>
                <div className="mt-1 text-lg">{statsData?.totalSubmissions || 0}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Score Distribution Chart */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Score Distribution</h3>
                <div className="h-64">
                  <Bar 
                    data={scoreDistributionData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                    }} 
                  />
                </div>
              </div>

              {/* Submission Types Chart */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Submission Types</h3>
                <div className="h-64 flex justify-center">
                  <div style={{ width: '80%', height: '100%' }}>
                    <Pie 
                      data={submissionTypesData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                      }} 
                    />
                  </div>
                </div>
              </div>

              {/* Submissions Over Time Chart */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Submissions Over Time</h3>
                <div className="h-64">
                  <Bar 
                    data={submissionsOverTimeData} 
                    options={submissionsOverTimeOptions} 
                  />
                </div>
              </div>

              {/* Top Performers */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Top Performers</h3>
                <div className="overflow-y-auto h-64">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="text-left py-2 px-3 border-b">Rank</th>
                        <th className="text-left py-2 px-3 border-b">Student</th>
                        <th className="text-right py-2 px-3 border-b">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statsData.topPerformers.map((performer, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="py-2 px-3">{index + 1}</td>
                          <td className="py-2 px-3">{performer.student}</td>
                          <td className="py-2 px-3 text-right font-medium">{performer.score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Evaluation Criteria */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h3 className="text-lg font-semibold mb-4">Evaluation Criteria</h3>
              <div className="overflow-y-auto">
                <ul className="space-y-2">
                  {hackathon.criteria && hackathon.criteria.length > 0 ? (
                    hackathon.criteria.map((criterion, index) => (
                      <li key={index} className="flex items-start">
                        <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span>{criterion}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">No evaluation criteria specified</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Download Report Button */}
            <div className="flex justify-end">
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                <FaDownload className="mr-2" />
                Download Submissions Report
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default TeacherHackathonDetailPage;
