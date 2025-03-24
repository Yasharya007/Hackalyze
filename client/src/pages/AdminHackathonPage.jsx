import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";

const AdminHackathonPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("details");
    const [loading, setLoading] = useState(true);
    const [hackathon, setHackathon] = useState({
        id: "NaN",
        title: "AI Innovation Challenge",
        description: "Create innovative AI solutions for real-world problems. Participants will work in teams to develop AI-powered applications that address real-world challenges. The hackathon will focus on machine learning, natural language processing, and computer vision.",
        startDate: "2023-06-01",
        endDate: "2023-06-30",
        participants: 120,
        submissions: 45,
        submissionRate: "38%",
        status: "Active",
        submissionDeadline: "2023-07-01T05:29:59",
        teachersAssigned: [
            { id: 1, name: "Teacher 1", expertise: ["Machine Learning", "Data Science"] },
            { id: 2, name: "Teacher 2", expertise: ["Computer Vision", "Neural Networks"] }
        ],
        registeredStudents: [],
        allowedFormats: ["PDF", "Video", "GitHub Repository"],
        notifications: [
            { id: 1, title: "Submission deadline reminder", message: "Reminder: The submission deadline is approaching. Please submit your projects by June 30, 2023.", sentOn: "2023-06-25" },
            { id: 2, title: "Welcome to AI Innovation Challenge", message: "Welcome to the AI Innovation Challenge! We're excited to have you participate in this hackathon.", sentOn: "2023-06-01" }
        ],
        results: []
    });

    useEffect(() => {
        const fetchHackathonDetails = async () => {
            try {
                setLoading(true);
                // In a production app, this would be a real API call
                // const response = await axios.get(`/api/admin/hackathon/${id}`);
                // setHackathon(response.data);
                
                // Simulate API delay
                setTimeout(() => {
                    setLoading(false);
                }, 800);
            } catch (error) {
                console.error("Error fetching hackathon details:", error);
                setLoading(false);
            }
        };

        fetchHackathonDetails();
    }, [id]);

    const handleEditHackathon = () => {
        navigate(`/admin/edit-hackathon/${hackathon.id}`);
    };

    const handlePublishResults = () => {
        console.log("Publishing results for hackathon:", hackathon.id);
        // Logic to publish results
    };

    const handleSendNotification = () => {
        console.log("Sending notification for hackathon:", hackathon.id);
        // Open notification form/modal
    };

    const handleChangeDeadline = () => {
        console.log("Changing deadline for hackathon:", hackathon.id);
        // Open deadline form/modal
    };

    const handleUpdateMediaTypes = () => {
        console.log("Updating media types for hackathon:", hackathon.id);
        // Open media types form/modal
    };

    const handleAssignTeacher = () => {
        console.log("Assigning teacher to hackathon:", hackathon.id);
        // Open teacher assignment form/modal
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Handle tab change for sidebar 
    const handleTabChange = (tab) => {
        if (tab === "overview" || tab === "hackathons" || tab === "teachers") {
            navigate("/admin/dashboard");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="flex">
                {/* Sidebar - Same as AdminDashboard for consistency */}
                <aside className="w-64 bg-white p-5 border-r h-screen">
                    <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <h2 className="text-xl font-bold ml-2">Hackalyze</h2>
                    </div>
                    <nav>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="#"
                                    className="flex items-center p-2 rounded-md hover:bg-gray-100"
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
                                    href="#"
                                    className="flex items-center p-2 rounded-md bg-black text-white"
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
                                    href="#"
                                    className="flex items-center p-2 rounded-md hover:bg-gray-100"
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
                </aside>
                
                {/* Main Content */}
                <div className="flex-1 p-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold">{hackathon.title}</h1>
                            <div className="inline-block px-2 py-1 text-xs font-semibold text-white bg-green-500 rounded-full mt-2">
                                {hackathon.status}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">ID: {hackathon.id}</p>
                        </div>
                        <div className="flex space-x-2">
                            <button 
                                onClick={handleEditHackathon}
                                className="text-gray-700 bg-white border border-gray-300 px-3 py-1 rounded-lg flex items-center text-sm hover:bg-gray-50"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                                Edit
                            </button>
                            <button 
                                onClick={handlePublishResults}
                                className="text-white bg-black px-4 py-1 rounded-lg flex items-center text-sm"
                            >
                                Publish Results
                            </button>
                        </div>
                    </div>
                    
                    {/* Main Information Grid */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            {/* Duration */}
                            <div className="bg-gray-50 p-4 rounded-lg border">
                                <div className="flex justify-between">
                                    <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                </div>
                                <p className="mt-2 text-sm">
                                    {formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}
                                </p>
                            </div>
                            
                            {/* Participants */}
                            <div className="bg-gray-50 p-4 rounded-lg border">
                                <div className="flex justify-between">
                                    <h3 className="text-sm font-medium text-gray-500">Participants</h3>
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                                    </svg>
                                </div>
                                <p className="mt-2 text-sm">
                                    {hackathon.participants} registered
                                </p>
                            </div>
                            
                            {/* Submissions */}
                            <div className="bg-gray-50 p-4 rounded-lg border">
                                <div className="flex justify-between">
                                    <h3 className="text-sm font-medium text-gray-500">Submissions</h3>
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                    </svg>
                                </div>
                                <div className="mt-2 flex items-center">
                                    <span className="text-sm">{hackathon.submissions} ({hackathon.submissionRate})</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Description */}
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold mb-3">Description</h2>
                            <p className="text-gray-700 text-sm">
                                {hackathon.description}
                            </p>
                        </div>
                        
                        {/* Quick Actions */}
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold mb-3">Quick Actions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button 
                                    onClick={handleSendNotification}
                                    className="flex items-center justify-center space-x-2 bg-white border border-gray-300 p-3 rounded-lg hover:bg-gray-50"
                                >
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                                    </svg>
                                    <span className="text-sm font-medium">Send Notification</span>
                                </button>
                                
                                <button 
                                    onClick={handleChangeDeadline}
                                    className="flex items-center justify-center space-x-2 bg-white border border-gray-300 p-3 rounded-lg hover:bg-gray-50"
                                >
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <span className="text-sm font-medium">Change Deadline</span>
                                </button>
                                
                                <button 
                                    onClick={handleAssignTeacher}
                                    className="flex items-center justify-center space-x-2 bg-white border border-gray-300 p-3 rounded-lg hover:bg-gray-50"
                                >
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                                    </svg>
                                    <span className="text-sm font-medium">Assign Teachers</span>
                                </button>
                            </div>
                        </div>
                        
                        {/* Assigned Teachers */}
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold mb-3">Assigned Teachers</h2>
                            <div className="bg-white rounded-lg border overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expertise</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {hackathon.teachersAssigned.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                                                    No teachers assigned yet
                                                </td>
                                            </tr>
                                        ) : (
                                            hackathon.teachersAssigned.map((teacher) => (
                                                <tr key={teacher.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {teacher.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {teacher.expertise.join(", ")}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <button className="text-red-600 hover:text-red-800">
                                                            Remove
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        {/* Allowed Submission Formats */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <h2 className="text-xl font-semibold">Allowed Submission Formats</h2>
                                <button 
                                    onClick={handleUpdateMediaTypes}
                                    className="text-blue-600 text-sm hover:text-blue-800"
                                >
                                    Update
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {hackathon.allowedFormats.map((format, index) => (
                                    <span 
                                        key={index}
                                        className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-1 rounded"
                                    >
                                        {format}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHackathonPage;