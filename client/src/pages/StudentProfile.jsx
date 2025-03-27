import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { logoutAPI } from "../utils/api.jsx";
import axios from "axios";
import toast from "react-hot-toast";

const StudentProfile = () => {
    const studentId = useSelector((state) => state.student.studentId);
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        institution: "",
        grade: "",
        registeredHackathons: 0,
        submissions: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (studentId) {
            fetchStudentProfile();
        }
    }, [studentId]);

    const fetchStudentProfile = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:8000/api/student/profile/${studentId}`, {
                withCredentials: true
            });
            
            if (response.data && response.data.data) {
                const data = response.data.data;
                
                // Get submissions count from registeredHackathons array
                const submissions = data.registeredHackathons ? 
                  data.registeredHackathons.filter(hackathon => 
                    hackathon.submissions && hackathon.submissions.length > 0
                  ).length : 0;
                
                setProfile({
                    name: data.name || "",
                    email: data.email || "",
                    institution: data.institution || "",
                    grade: data.grade || "",
                    registeredHackathons: data.registeredHackathons?.length || 0,
                    submissions: submissions
                });
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching student profile:", error);
            toast.error("Failed to load profile information");
            setLoading(false);
        }
    };

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
                                        className="flex items-center p-2 rounded-md bg-black text-white"
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
            
            {/* Main Content */}
            <main className="flex-1 p-6 overflow-y-auto">
                {/* Header Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
                    <h1 className="text-2xl font-bold mb-1">My Profile</h1>
                    <p className="text-gray-600">Manage your personal information</p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-60">
                        <svg className="animate-spin h-10 w-10 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Profile Information Card */}
                        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
                            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <div className="p-3 bg-gray-50 rounded-md border">
                                        {profile.name}
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <div className="p-3 bg-gray-50 rounded-md border">
                                        {profile.email}
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                                    <div className="p-3 bg-gray-50 rounded-md border">
                                        {profile.institution}
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                                    <div className="p-3 bg-gray-50 rounded-md border">
                                        {profile.grade}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-6">
                                <Link 
                                    to="/student/settings" 
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-900 focus:outline-none"
                                >
                                    Edit Profile
                                </Link>
                            </div>
                        </div>

                        {/* Stats Card */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h2 className="text-xl font-semibold mb-4">Activity Summary</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-700">Registered Hackathons</span>
                                        <span className="text-sm font-medium text-gray-700">{profile.registeredHackathons}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-black h-2 rounded-full" 
                                            style={{ width: `${Math.min(100, profile.registeredHackathons * 20)}%` }}
                                        ></div>
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-700">Submissions</span>
                                        <span className="text-sm font-medium text-gray-700">{profile.submissions}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-green-500 h-2 rounded-full" 
                                            style={{ width: `${Math.min(100, profile.submissions * 20)}%` }}
                                        ></div>
                                    </div>
                                </div>
                                
                                <div className="pt-4 border-t mt-4">
                                    <Link 
                                        to="/student/enrolled-hackathons" 
                                        className="text-black hover:text-gray-800 font-medium inline-flex items-center"
                                    >
                                        View all hackathons
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default StudentProfile;
