import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { HackathonByTeacherAPI, logoutAPI, getHackathonSubmissionsAPI } from "../utils/api.jsx";
import { FaChartBar, FaLaptopCode, FaCogs, FaClipboardList, FaTrophy, FaUserCog, FaChevronRight } from "react-icons/fa";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import toast from "react-hot-toast";
import { setHackathon } from "../slices/hackathonSlice.js";

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ViewShortlistPage = () => {
    console.log("ViewShortlistPage component rendering");
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const teacherId = useSelector((state) => state.student.studentId);
    console.log("Teacher ID from redux:", teacherId);
    const [loading, setLoading] = useState(true);
    const [hackathons, setHackathons] = useState([]);
    const [selectedHackathon, setSelectedHackathon] = useState("");
    const [submissionStats, setSubmissionStats] = useState({
        totalSubmissions: 0,
        submissionsByHackathon: {},
        recentActivity: []
    });

    useEffect(() => {
        console.log("useEffect hook for teacherId running");
        if (teacherId) {
            fetchHackathons();
        }
    }, [teacherId]);

    useEffect(() => {
        console.log("useEffect hook for hackathons running");
        if (hackathons.length > 0) {
            fetchSubmissionStats();
        }
    }, [hackathons]);

    const fetchHackathons = async () => {
        console.log("fetchHackathons function running");
        try {
            setLoading(true);
            const response = await HackathonByTeacherAPI(teacherId);
            console.log("Hackathons response:", response);
            // Handle both response formats - direct array or {data: []}
            const hackathonList = Array.isArray(response) ? response : 
                                 (response && response.data ? response.data : []);
            
            setHackathons(hackathonList);
            if (hackathonList.length > 0) {
                setSelectedHackathon(hackathonList[0]._id);
            }
        } catch (error) {
            console.error("Error fetching hackathons:", error);
            toast.error("Failed to load hackathons");
        } finally {
            setLoading(false);
        }
    };

    const fetchSubmissionStats = async () => {
        console.log("fetchSubmissionStats function running");
        try {
            // Initialize stats object with default values
            const statsObj = {
                totalSubmissions: 0,
                submissionsByHackathon: {},
                recentActivity: [
                    { time: "Recently", event: "Loading submission data..." }
                ]
            };
            
            // If we have hackathons, get their submission data
            if (hackathons.length > 0) {
                // Create an object to store submission counts by hackathon title
                const submissionCounts = {};
                let totalCount = 0;
                
                // Process each hackathon to get its submissions
                const recentActivity = [];
                
                for (const hackathon of hackathons) {
                    try {
                        const response = await getHackathonSubmissionsAPI(hackathon._id);
                        console.log(`Submissions for ${hackathon.title}:`, response);
                        // Handle both response formats
                        const submissions = Array.isArray(response) ? response : 
                                          (response && response.data ? response.data : []);
                        
                        const count = submissions.length;
                        
                        submissionCounts[hackathon.title] = count;
                        totalCount += count;
                        
                        // Add to recent activity if there are submissions
                        if (count > 0) {
                            recentActivity.push({
                                time: `${formatDate(hackathon.endDate)}`,
                                event: `${count} submissions for ${hackathon.title}`
                            });
                        }
                    } catch (error) {
                        console.error(`Error fetching submissions for ${hackathon.title}:`, error);
                    }
                }
                
                statsObj.totalSubmissions = totalCount;
                statsObj.submissionsByHackathon = submissionCounts;
                statsObj.recentActivity = recentActivity.length > 0 ? 
                    recentActivity : [{ time: "No recent activity", event: "No submissions found" }];
            }
            
            setSubmissionStats(statsObj);
        } catch (error) {
            console.error("Error fetching submission stats:", error);
            toast.error("Failed to load submission statistics");
            
            // Set default stats in case of error
            setSubmissionStats({
                totalSubmissions: 0,
                submissionsByHackathon: {},
                recentActivity: [
                    { time: "Error", event: "Could not load submission data" }
                ]
            });
        }
    };

    const handleProceed = () => {
        console.log("handleProceed function running with hackathon ID:", selectedHackathon);
        if (!selectedHackathon) {
            toast.error("Please select a hackathon first");
            return;
        }
        
        // Find the selected hackathon object
        const selectedHackathonObject = hackathons.find(h => h._id === selectedHackathon);
        console.log("Selected hackathon object:", selectedHackathonObject);
        
        if (selectedHackathonObject) {
            // Store the selected hackathon in Redux
            dispatch(setHackathon(selectedHackathonObject));
            
            // Store the hackathon object in session storage as a backup
            sessionStorage.setItem('selectedHackathon', JSON.stringify(selectedHackathonObject));
            
            // Navigate to the shortlist detail page with hackathonId as a path parameter
            navigate(`/teacher/shortlist/view/${selectedHackathon}`);
        } else {
            toast.error("Could not find selected hackathon details");
        }
    };

    const handleLogout = () => {
        console.log("handleLogout function running");
        logoutAPI().then(() => {
            window.location.href = "/";
        });
    };

    // Prepare chart data
    const pieChartData = {
        labels: Object.keys(submissionStats.submissionsByHackathon),
        datasets: [
            {
                label: 'Submissions',
                data: Object.values(submissionStats.submissionsByHackathon),
                backgroundColor: [
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(153, 102, 255, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    // Format date function
    const formatDate = (isoString) => {
        console.log("formatDate function running");
        if (!isoString) return "No date specified";
        return new Date(isoString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="flex w-full min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-lg flex flex-col h-screen sticky top-0">
                <div className="p-6">
                    <div className="flex items-center">
                        <img src="/logo.png" alt="Hackalyze Logo" className="h-8 mr-2" />
                        <h2 className="text-2xl font-bold">Hackalyze</h2>
                    </div>
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
                                className="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-600"
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
                                to="/teacher/submissions" 
                                className="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-600"
                            >
                                <FaClipboardList className="h-5 w-5 mr-3" />
                                <span>View Submissions</span>
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/teacher/shortlist" 
                                className="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-900 font-semibold"
                            >
                                <FaTrophy className="h-5 w-5 mr-3" />
                                <span>View Shortlist</span>
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/teacher/settings" 
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
                        onClick={handleLogout}
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
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h1 className="text-2xl font-bold mb-2">Shortlist Analytics</h1>
                    <p className="text-gray-600">View statistics and manage shortlisted submissions for your hackathons</p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-60 bg-white rounded-lg shadow-md p-6">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            {/* Total Submissions Card */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-semibold mb-4">Total Submissions</h2>
                                <div className="flex items-center justify-center">
                                    <div className="text-9xl font-bold text-blue-600">{submissionStats.totalSubmissions}</div>
                                </div>
                            </div>

                            {/* Submissions by Hackathon Chart */}
                            <div className="bg-white rounded-lg shadow-md p-6 col-span-2">
                                <h2 className="text-xl font-semibold mb-4">Submissions by Hackathon</h2>
                                <div className="h-64">
                                    <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
                                </div>
                            </div>
                        </div>

                        {/* Select Hackathon & Recent Activity Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Select Hackathon Card */}
                            <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
                                <h2 className="text-xl font-semibold mb-4">Select Hackathon to View Shortlist</h2>
                                
                                {hackathons.length === 0 ? (
                                    <p className="text-gray-600">No hackathons assigned to you yet.</p>
                                ) : (
                                    <>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Hackathon
                                            </label>
                                            <select
                                                value={selectedHackathon}
                                                onChange={(e) => setSelectedHackathon(e.target.value)}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                {hackathons.map((hackathon) => (
                                                    <option key={hackathon._id} value={hackathon._id}>
                                                        {hackathon.title} ({formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <button
                                            onClick={handleProceed}
                                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
                                        >
                                            <span>Proceed to Shortlist</span>
                                            <FaChevronRight className="ml-2" />
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Recent Activity Card */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                                <ul className="space-y-3">
                                    {submissionStats.recentActivity && submissionStats.recentActivity.map((activity, index) => (
                                        <li key={index} className="border-b border-gray-100 pb-2">
                                            <p className="text-gray-800">{activity.event}</p>
                                            <p className="text-sm text-gray-500">{activity.time}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default ViewShortlistPage;
