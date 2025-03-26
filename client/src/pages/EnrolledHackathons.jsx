import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { AllHackathonAPI, logoutAPI } from "../utils/api.jsx";
import toast from "react-hot-toast";

const EnrolledHackathons = () => {
    const navigate = useNavigate();
    const studentId = useSelector((state) => state.student.studentId);
    const [enrolledHackathons, setEnrolledHackathons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({
        field: 'title',
        direction: 'asc'
    });

    useEffect(() => {
        fetchEnrolledHackathons();
    }, [studentId]);

    const fetchEnrolledHackathons = async () => {
        try {
            setLoading(true);
            const hackathons = await AllHackathonAPI();
            
            // Filter only enrolled hackathons for this student
            const enrolled = hackathons.filter(hackathon => 
                hackathon.registeredStudents && 
                hackathon.registeredStudents.includes(studentId)
            );
            
            // Apply sorting
            const sortedHackathons = sortHackathons(enrolled);
            setEnrolledHackathons(sortedHackathons);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching enrolled hackathons:", error);
            toast.error("Failed to load enrolled hackathons");
            setLoading(false);
        }
    };

    const sortHackathons = (hackathons) => {
        const sorted = [...hackathons];
        sorted.sort((a, b) => {
            if (sortConfig.field === 'title') {
                return sortConfig.direction === 'asc' 
                    ? a.title.localeCompare(b.title)
                    : b.title.localeCompare(a.title);
            } else if (sortConfig.field === 'startDate') {
                return sortConfig.direction === 'asc'
                    ? new Date(a.startDate) - new Date(b.startDate)
                    : new Date(b.startDate) - new Date(a.startDate);
            } else if (sortConfig.field === 'endDate') {
                return sortConfig.direction === 'asc'
                    ? new Date(a.endDate) - new Date(b.endDate)
                    : new Date(b.endDate) - new Date(a.endDate);
            }
            return 0;
        });
        return sorted;
    };

    const handleSort = (field) => {
        setSortConfig(prevConfig => {
            const newDirection = 
                prevConfig.field === field && prevConfig.direction === 'asc' 
                    ? 'desc' 
                    : 'asc';
            
            const newConfig = { field, direction: newDirection };
            
            // Re-sort the hackathons with the new config
            const sortedHackathons = sortHackathons(enrolledHackathons);
            setEnrolledHackathons(sortedHackathons);
            
            return newConfig;
        });
    };

    const formatDate = (isoString) => isoString.split("T")[0];

    return (
        <div className="flex h-screen w-full bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-lg flex flex-col justify-between h-screen sticky top-0">
                <div>
                    {/* Header/Logo Section */}
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
                                        className="flex items-center p-2 rounded-md bg-black text-white"
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
            
            {/* Main Content */}
            <main className="flex-1 p-6 overflow-y-auto">
                {/* Header Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
                    <h1 className="text-2xl font-bold mb-1">My Enrolled Hackathons</h1>
                    <p className="text-gray-600">View and manage your registered hackathons</p>
                </div>

                {/* Sorting Controls */}
                <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
                    <div className="flex items-center">
                        <span className="text-gray-700 mr-4">Sort by:</span>
                        <div className="flex space-x-2">
                            <button 
                                onClick={() => handleSort('title')}
                                className={`px-3 py-1 rounded ${sortConfig.field === 'title' ? 'bg-black text-white' : 'bg-gray-100'}`}
                            >
                                Name {sortConfig.field === 'title' && (
                                    sortConfig.direction === 'asc' ? '↑' : '↓'
                                )}
                            </button>
                            <button 
                                onClick={() => handleSort('startDate')}
                                className={`px-3 py-1 rounded ${sortConfig.field === 'startDate' ? 'bg-black text-white' : 'bg-gray-100'}`}
                            >
                                Start Date {sortConfig.field === 'startDate' && (
                                    sortConfig.direction === 'asc' ? '↑' : '↓'
                                )}
                            </button>
                            <button 
                                onClick={() => handleSort('endDate')}
                                className={`px-3 py-1 rounded ${sortConfig.field === 'endDate' ? 'bg-black text-white' : 'bg-gray-100'}`}
                            >
                                End Date {sortConfig.field === 'endDate' && (
                                    sortConfig.direction === 'asc' ? '↑' : '↓'
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Hackathon List */}
                {loading ? (
                    <div className="flex justify-center items-center h-60">
                        <svg className="animate-spin h-10 w-10 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : (
                    enrolledHackathons.length === 0 ? (
                        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                            <p className="text-lg text-gray-600">You haven't enrolled in any hackathons yet.</p>
                            <Link to="/student/dashboard" className="mt-4 inline-block bg-black text-white px-4 py-2 rounded">
                                Browse Available Hackathons
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {enrolledHackathons.map((hackathon, index) => (
                                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition">
                                    <h3 className="text-lg font-bold">{hackathon.title}</h3>
                                    <div className="flex items-center mt-1 mb-2">
                                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                            Enrolled
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500 mb-4">
                                        <div className="flex items-center mb-1">
                                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span>Start: {formatDate(hackathon.startDate)}</span>
                                        </div>
                                        <div className="flex items-center mb-1">
                                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span>End: {formatDate(hackathon.endDate)}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <button 
                                            onClick={() => navigate(`/student/hackathon/${hackathon._id}`)}
                                            className="w-full bg-black text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-900 transition"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </main>
        </div>
    );
};

export default EnrolledHackathons;
