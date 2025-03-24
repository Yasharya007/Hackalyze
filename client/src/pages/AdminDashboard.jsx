import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { getAdminDashboardStats, getRecentHackathons, getTeacherAssignments } from "../utils/api.jsx";

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState("overview");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalHackathons: 0,
        activeParticipants: 0,
        upcomingEvents: 0,
        submissionRate: 0
    });
    const [recentHackathons, setRecentHackathons] = useState([]);
    const [teacherAssignments, setTeacherAssignments] = useState([]);

    // Fetch dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch stats
                try {
                    const statsData = await getAdminDashboardStats();
                    setStats(statsData);
                } catch (statsError) {
                    console.error("Error fetching stats:", statsError);
                    // Continue with other fetches even if this one fails
                }
                
                // Fetch recent hackathons
                try {
                    const hackathonsData = await getRecentHackathons();
                    setRecentHackathons(hackathonsData);
                } catch (hackathonsError) {
                    console.error("Error fetching hackathons:", hackathonsError);
                    // Continue with other fetches even if this one fails
                }
                
                // Fetch teacher assignments
                try {
                    const assignmentsData = await getTeacherAssignments();
                    setTeacherAssignments(assignmentsData);
                } catch (assignmentsError) {
                    console.error("Error fetching assignments:", assignmentsError);
                    // Continue with other fetches even if this one fails
                }
                
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError("Failed to load dashboard data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    // Render loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-8 flex justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-700">Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 p-8 flex justify-center items-center">
                <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
                    <div className="text-red-600 text-5xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Dashboard</h1>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-white p-5 border-r">
                    <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <h2 className="text-xl font-bold ml-2">Hackalyze</h2>
                    </div>
                    <nav>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="#"
                                    className={`flex items-center p-2 rounded-md ${activeTab === "overview" ? "bg-black text-white" : "hover:bg-gray-100"}`}
                                    onClick={() => handleTabChange("overview")}
                                >
                                    <span className="mr-2">📊</span>
                                    <span>Overview</span>
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className={`flex items-center p-2 rounded-md ${activeTab === "hackathons" ? "bg-black text-white" : "hover:bg-gray-100"}`}
                                    onClick={() => handleTabChange("hackathons")}
                                >
                                    <span className="mr-2">🏆</span>
                                    <span>Hackathons</span>
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className={`flex items-center p-2 rounded-md ${activeTab === "teachers" ? "bg-black text-white" : "hover:bg-gray-100"}`}
                                    onClick={() => handleTabChange("teachers")}
                                >
                                    <span className="mr-2">👨‍🏫</span>
                                    <span>Teachers</span>
                                </a>
                            </li>
                        </ul>
                    </nav>
                </aside>

                {/* Main Content */}
                <div className="flex-1 p-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                            <p className="text-gray-600">Welcome back, Admin</p>
                        </div>
                        <div className="flex space-x-4">
                            <Link to="/admin/create-hackathon" className="bg-black text-white px-4 py-2 rounded">Create Hackathon</Link>
                        </div>
                    </div>

                    {/* Dashboard Tabs */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        {/* Overview Tab */}
                        {activeTab === "overview" && (
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Dashboard Overview</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                        <h3 className="text-gray-500 text-sm">Total Hackathons</h3>
                                        <p className="text-2xl font-bold">{stats.totalHackathons}</p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                        <h3 className="text-gray-500 text-sm">Active Participants</h3>
                                        <p className="text-2xl font-bold">{stats.activeParticipants}</p>
                                    </div>
                                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                                        <h3 className="text-gray-500 text-sm">Upcoming Events</h3>
                                        <p className="text-2xl font-bold">{stats.upcomingEvents}</p>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                                        <h3 className="text-gray-500 text-sm">Submission Rate</h3>
                                        <p className="text-2xl font-bold">{stats.submissionRate}%</p>
                                    </div>
                                </div>

                                <h2 className="text-xl font-semibold mb-4">Recent Hackathons</h2>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white">
                                        <thead>
                                            <tr className="w-full h-16 border-gray-300 border-b py-8">
                                                <th className="text-left pl-4 text-gray-600">Name</th>
                                                <th className="text-left text-gray-600">Date</th>
                                                <th className="text-left text-gray-600">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentHackathons.length === 0 ? (
                                                <tr>
                                                    <td colSpan="3" className="text-center py-4 text-gray-500">
                                                        No hackathons found
                                                    </td>
                                                </tr>
                                            ) : (
                                                recentHackathons.map((hackathon) => (
                                                    <tr key={hackathon.id} className="h-16 border-b border-gray-300">
                                                        <td className="pl-4">{hackathon.name}</td>
                                                        <td>{hackathon.date}</td>
                                                        <td>
                                                            <Link 
                                                                to={`/admin/hackathon/${hackathon.id}`}
                                                                className="text-blue-600 hover:text-blue-800"
                                                            >
                                                                View Details
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Hackathons Tab */}
                        {activeTab === "hackathons" && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">All Hackathons</h2>
                                    <Link to="/admin/create-hackathon" className="bg-black text-white px-4 py-2 rounded">Create Hackathon</Link>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white">
                                        <thead>
                                            <tr className="w-full h-16 border-gray-300 border-b py-8">
                                                <th className="text-left pl-4 text-gray-600">Name</th>
                                                <th className="text-left text-gray-600">Date</th>
                                                <th className="text-left text-gray-600">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentHackathons.length === 0 ? (
                                                <tr>
                                                    <td colSpan="3" className="text-center py-4 text-gray-500">
                                                        No hackathons found
                                                    </td>
                                                </tr>
                                            ) : (
                                                recentHackathons.map((hackathon) => (
                                                    <tr key={hackathon.id} className="h-16 border-b border-gray-300">
                                                        <td className="pl-4">{hackathon.name}</td>
                                                        <td>{hackathon.date}</td>
                                                        <td>
                                                            <Link 
                                                                to={`/admin/hackathon/${hackathon.id}`}
                                                                className="text-blue-600 hover:text-blue-800 mr-2"
                                                            >
                                                                View Details
                                                            </Link>
                                                            <Link 
                                                                to={`/admin/edit-hackathon/${hackathon.id}`}
                                                                className="text-green-600 hover:text-green-800"
                                                            >
                                                                Edit
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Teachers Tab */}
                        {activeTab === "teachers" && (
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Teacher Assignments</h2>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white">
                                        <thead>
                                            <tr className="w-full h-16 border-gray-300 border-b py-8">
                                                <th className="text-left pl-4 text-gray-600">Teacher</th>
                                                <th className="text-left text-gray-600">Assigned Hackathon</th>
                                                <th className="text-left text-gray-600">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {teacherAssignments.length === 0 ? (
                                                <tr>
                                                    <td colSpan="3" className="text-center py-4 text-gray-500">
                                                        No teacher assignments found
                                                    </td>
                                                </tr>
                                            ) : (
                                                teacherAssignments.map((assignment) => (
                                                    <tr key={assignment.id} className="h-16 border-b border-gray-300">
                                                        <td className="pl-4">{assignment.name}</td>
                                                        <td>{assignment.hackathon}</td>
                                                        <td>
                                                            <a href="#" className="text-blue-600 hover:text-blue-800">
                                                                View Profile
                                                            </a>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
