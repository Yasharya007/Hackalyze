import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logoutAPI } from "../utils/api.jsx";
import axios from "axios";
import toast from "react-hot-toast";

const StudentSettings = () => {
    const navigate = useNavigate();
    const studentId = useSelector((state) => state.student.studentId);
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        institution: "",
        grade: "",
        password: "",
        confirmPassword: ""
    });

    useEffect(() => {
        if (studentId) {
            fetchStudentData();
        }
    }, [studentId]);

    const fetchStudentData = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/student/profile/${studentId}`, {
                withCredentials: true
            });
            
            if (response.data && response.data.data) {
                const data = response.data.data;
                setFormData({
                    name: data.name || "",
                    email: data.email || "",
                    institution: data.institution || "",
                    grade: data.grade || "",
                    password: "",
                    confirmPassword: ""
                });
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching student data:", error);
            toast.error("Failed to load profile information");
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate passwords match if trying to change password
        if (formData.password && formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            setSaveLoading(true);
            
            const dataToUpdate = {
                name: formData.name,
                email: formData.email,
                schoolCollegeName: formData.institution,
                grade: formData.grade
            };
            
            if (formData.password) {
                dataToUpdate.password = formData.password;
            }
            
            const response = await axios.put(
                `http://localhost:8000/api/student/update/${studentId}`, 
                dataToUpdate,
                { withCredentials: true }
            );
            
            if (response.data && response.data.success) {
                toast.success("Profile updated successfully");
                // Reset password fields
                setFormData(prev => ({
                    ...prev,
                    password: "",
                    confirmPassword: ""
                }));
            }
            setSaveLoading(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error(error.response?.data?.message || "Failed to update profile");
            setSaveLoading(false);
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
                                        className="flex items-center p-2 rounded-md bg-black text-white"
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
                    <h1 className="text-2xl font-bold mb-1">Settings</h1>
                    <p className="text-gray-600">Update your profile information and preferences</p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-60">
                        <svg className="animate-spin h-10 w-10 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-1">
                                        Institution
                                    </label>
                                    <input
                                        type="text"
                                        id="institution"
                                        name="institution"
                                        value={formData.institution}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black"
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                                        Grade
                                    </label>
                                    <input
                                        type="text"
                                        id="grade"
                                        name="grade"
                                        value={formData.grade}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black"
                                    />
                                </div>
                            </div>
                            
                            <div className="pt-6 border-t">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">Leave blank to keep current password</p>
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                    onClick={() => navigate("/student/profile")}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-900 focus:outline-none flex items-center"
                                    disabled={saveLoading}
                                >
                                    {saveLoading && (
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    )}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
};

export default StudentSettings;
