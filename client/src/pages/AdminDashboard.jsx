import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { getAdminDashboardStats, getRecentHackathons, getTeacherAssignments, logoutAPI } from "../utils/api.jsx";

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
    // Sorting state
    const [sortConfig, setSortConfig] = useState({
        field: 'title',
        direction: 'asc'
    });
    // Separate sorting state for teachers
    const [teacherSortConfig, setTeacherSortConfig] = useState({
        field: 'name',
        direction: 'asc'
    });

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
                    const hackathonsData = await getRecentHackathons(sortConfig);
                    setRecentHackathons(hackathonsData);
                } catch (hackathonsError) {
                    console.error("Error fetching hackathons:", hackathonsError);
                    // Continue with other fetches even if this one fails
                }

                // Fetch teacher assignments
                try {
                    const assignmentsData = await getTeacherAssignments();

                    // Sort teacher assignments
                    const sortedAssignments = [...assignmentsData].sort((a, b) => {
                        const field = teacherSortConfig.field;

                        // Handle different field types
                        let valueA, valueB;

                        if (field === 'startDate' || field === 'endDate') {
                            // Parse dates for comparison
                            valueA = new Date(a[field] || '').getTime() || 0;
                            valueB = new Date(b[field] || '').getTime() || 0;
                        } else {
                            // Case-insensitive string comparison for text fields
                            valueA = (a[field] || '').toLowerCase();
                            valueB = (b[field] || '').toLowerCase();
                        }

                        // Sort based on direction
                        if (teacherSortConfig.direction === 'asc') {
                            return valueA > valueB ? 1 : -1;
                        } else {
                            return valueA < valueB ? 1 : -1;
                        }
                    });

                    setTeacherAssignments(sortedAssignments);
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
    }, [sortConfig, teacherSortConfig]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    // Handle sorting
    const handleSort = (field) => {
        console.log("Sort requested for field:", field);
        setSortConfig(prevConfig => {
            // If clicking on the same field, toggle direction
            if (prevConfig.field === field) {
                console.log("Toggling direction from", prevConfig.direction, "to", prevConfig.direction === 'asc' ? 'desc' : 'asc');
                return {
                    field,
                    direction: prevConfig.direction === 'asc' ? 'desc' : 'asc'
                };
            }
            // If clicking on a new field, sort ascending by default
            console.log("New sort field, setting direction to asc");
            return {
                field,
                direction: 'asc'
            };
        });
    };

    // Handle sorting for teachers
    const handleTeacherSort = (field) => {
        console.log("Teacher sort requested for field:", field);
        setTeacherSortConfig(prevConfig => {
            // If clicking on the same field, toggle direction
            if (prevConfig.field === field) {
                console.log("Toggling teacher sort direction from", prevConfig.direction, "to", prevConfig.direction === 'asc' ? 'desc' : 'asc');
                return {
                    field,
                    direction: prevConfig.direction === 'asc' ? 'desc' : 'asc'
                };
            }
            // If clicking on a new field, sort ascending by default
            console.log("New teacher sort field, setting direction to asc");
            return {
                field,
                direction: 'asc'
            };
        });
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
        <div className="min-h-screen bg-gray-100 flex w-full">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r h-screen sticky top-0 flex flex-col">
                <div className="p-5 flex-grow">
                    <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                        <img src="/logo.png" alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <h2 className="text-xl font-bold ml-2">Hackalyze</h2>
                    </div>
                    <nav>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="/admin/dashboard#overview"
                                    className={`flex items-center p-2 rounded-md ${activeTab === "overview" ? "bg-black text-white" : "hover:bg-gray-100"}`}
                                    onClick={() => handleTabChange("overview")}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <span>Overview</span>
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/admin/dashboard#hackathons"
                                    className={`flex items-center p-2 rounded-md ${activeTab === "hackathons" ? "bg-black text-white" : "hover:bg-gray-100"}`}
                                    onClick={() => handleTabChange("hackathons")}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    <span>Hackathons</span>
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/admin/dashboard#teachers"
                                    className={`flex items-center p-2 rounded-md ${activeTab === "teachers" ? "bg-black text-white" : "hover:bg-gray-100"}`}
                                    onClick={() => handleTabChange("teachers")}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    <span>Teachers</span>
                                </a>
                            </li>
                            <li>
                                <Link
                                    to="/admin/create-hackathon"
                                    className="flex items-center p-2 rounded-md hover:bg-gray-100"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span>Create Hackathon</span>
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>
                {/* Logout at bottom of sidebar */}
                <div className="mb-6 px-4">
                    <a
                        href="#"
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
                    </a>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                {/* Header */}
                <div className="bg-white p-6 border-b sticky top-0 z-10">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                            <p className="text-gray-600">Welcome back, Admin</p>
                        </div>
                        <div className="flex space-x-4">
                            <Link to="/admin/create-hackathon" className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition">Create Hackathon</Link>
                        </div>
                    </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-6">
                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Dashboard Overview</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 shadow-sm">
                                    <h3 className="text-gray-500 text-sm">Total Hackathons</h3>
                                    <p className="text-3xl font-bold mt-2">{stats.totalHackathons}</p>
                                </div>
                                <div className="bg-green-50 p-6 rounded-lg border border-green-100 shadow-sm">
                                    <h3 className="text-gray-500 text-sm">Active Participants</h3>
                                    <p className="text-3xl font-bold mt-2">{stats.activeParticipants}</p>
                                </div>
                                <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-100 shadow-sm">
                                    <h3 className="text-gray-500 text-sm">Upcoming Events</h3>
                                    <p className="text-3xl font-bold mt-2">{stats.upcomingEvents}</p>
                                </div>
                                <div className="bg-purple-50 p-6 rounded-lg border border-purple-100 shadow-sm">
                                    <h3 className="text-gray-500 text-sm">Submission Rate</h3>
                                    <p className="text-3xl font-bold mt-2">{stats.submissionRate}%</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-4 mt-8">
                                <h2 className="text-xl font-semibold">Top Hackathons</h2>

                                {/* Sorting Controls */}
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center">
                                        <label htmlFor="overviewSortField" className="mr-2 text-sm text-gray-600">Sort by:</label>
                                        <select
                                            id="overviewSortField"
                                            className="form-select rounded-md border-gray-300 shadow-sm text-sm"
                                            value={sortConfig.field}
                                            onChange={(e) => handleSort(e.target.value)}
                                        >
                                            <option value="title">Name</option>
                                            <option value="startDate">Start Date</option>
                                            <option value="endDate">End Date</option>
                                        </select>
                                    </div>

                                    <button
                                        onClick={() => setSortConfig(prev => ({
                                            ...prev,
                                            direction: prev.direction === 'asc' ? 'desc' : 'asc'
                                        }))}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        {sortConfig.direction === 'asc' ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {recentHackathons.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="text-center py-4 text-gray-500">
                                                    No hackathons found
                                                </td>
                                            </tr>
                                        ) : (
                                            recentHackathons.slice(0, 5).map((hackathon) => (
                                                <tr key={hackathon.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-4 whitespace-nowrap">{hackathon.name}</td>
                                                    <td className="px-4 py-4 whitespace-nowrap">{hackathon.date}</td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${hackathon.status === "Active" ? "bg-green-100 text-green-800" :
                                                                hackathon.status === "Upcoming" ? "bg-blue-100 text-blue-800" :
                                                                    "bg-gray-100 text-gray-800"
                                                            }`}>
                                                            {hackathon.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
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
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold">Hackathons</h2>

                                {/* Sorting Controls */}
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center">
                                        <label htmlFor="sortField" className="mr-2 text-sm text-gray-600">Sort by:</label>
                                        <select
                                            id="sortField"
                                            className="form-select rounded-md border-gray-300 shadow-sm text-sm"
                                            value={sortConfig.field}
                                            onChange={(e) => handleSort(e.target.value)}
                                        >
                                            <option value="title">Name</option>
                                            <option value="startDate">Start Date</option>
                                            <option value="endDate">End Date</option>
                                        </select>
                                    </div>

                                    <button
                                        onClick={() => setSortConfig(prev => ({
                                            ...prev,
                                            direction: prev.direction === 'asc' ? 'desc' : 'asc'
                                        }))}
                                        className="text-gray-500 hover:text-gray-700"
                                        title={sortConfig.direction === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
                                    >
                                        {sortConfig.direction === 'asc' ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {recentHackathons.length === 0 ? (
                                <div className="bg-white rounded-lg p-8 text-center border shadow-sm">
                                    <p className="text-gray-500 mb-4">No hackathons found</p>
                                    <Link to="/admin/create-hackathon" className="bg-black text-white px-4 py-2 rounded-lg inline-block">
                                        Create Your First Hackathon
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {recentHackathons.map((hackathon) => (
                                        <div key={hackathon._id || hackathon.id} className="bg-white rounded-lg border p-6 shadow-sm">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-xl font-semibold">{hackathon.title || hackathon.name}</h3>
                                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${hackathon.status === "Active" ? "bg-green-100 text-green-800" :
                                                                hackathon.status === "Upcoming" ? "bg-blue-100 text-blue-800" :
                                                                    "bg-gray-100 text-gray-800"
                                                            }`}>
                                                            {hackathon.status || "Completed"}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-600 mt-1 text-sm">
                                                        {hackathon.description || "No description available"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                    </svg>
                                                    <span>Duration: {hackathon.startDate && hackathon.endDate ?
                                                        `${new Date(hackathon.startDate).toLocaleDateString()} - ${new Date(hackathon.endDate).toLocaleDateString()}` :
                                                        hackathon.date || "Not specified"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                                                    </svg>
                                                    <span>Participants: {hackathon.participants || 0}</span>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                    </svg>
                                                    <span>Submissions: {hackathon.submissions || 0}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mt-4">
                                                <Link
                                                    to={`/admin/hackathon/${hackathon._id || hackathon.id}`}
                                                    className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                                >
                                                    View Details
                                                </Link>
                                                <button
                                                    className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                                    onClick={() => window.location.href = `/admin/hackathon/${hackathon._id || hackathon.id}?tab=assignedTeachers`}
                                                >
                                                    Assign Teachers
                                                </button>
                                                <button
                                                    className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                                    onClick={() => window.location.href = `/admin/hackathon/${hackathon._id || hackathon.id}?tab=registeredStudents`}
                                                >
                                                    View Participants
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Teachers Tab */}
                    {activeTab === "teachers" && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold">Teacher Assignments</h2>

                                {/* Sorting Controls for Teachers */}
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center">
                                        <label htmlFor="teacherSortField" className="mr-2 text-sm text-gray-600">Sort by:</label>
                                        <select
                                            id="teacherSortField"
                                            className="form-select rounded-md border-gray-300 shadow-sm text-sm"
                                            value={teacherSortConfig.field}
                                            onChange={(e) => handleTeacherSort(e.target.value)}
                                        >
                                            <option value="name">Teacher Name</option>
                                            <option value="teacherEmail">Email</option>
                                            <option value="hackathon">Hackathon</option>
                                        </select>
                                    </div>

                                    <button
                                        onClick={() => setTeacherSortConfig(prev => ({
                                            ...prev,
                                            direction: prev.direction === 'asc' ? 'desc' : 'asc'
                                        }))}
                                        className="text-gray-500 hover:text-gray-700"
                                        title={teacherSortConfig.direction === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
                                    >
                                        {teacherSortConfig.direction === 'asc' ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Hackathon</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {teacherAssignments.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="text-center py-4 text-gray-500">
                                                    No teacher assignments found
                                                </td>
                                            </tr>
                                        ) : (
                                            teacherAssignments.map((assignment) => (
                                                <tr key={assignment.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-4">{assignment.name}</td>
                                                    <td className="px-4 py-4">{assignment.teacherEmail || "Not available"}</td>
                                                    <td className="px-4 py-4">
                                                        {assignment.hackathon}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        {assignment.startDate && assignment.endDate
                                                            ? `${assignment.startDate} - ${assignment.endDate}`
                                                            : "N/A"}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        {assignment.hackathonId ? (
                                                            <Link
                                                                to={`/admin/hackathon/${assignment.hackathonId}`}
                                                                className="text-blue-600 hover:text-blue-800"
                                                            >
                                                                View Hackathon
                                                            </Link>
                                                        ) : (
                                                            <span className="text-gray-400">No actions available</span>
                                                        )}
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
    );
};

export default AdminDashboard;
