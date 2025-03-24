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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="flex w-full h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white p-5 border-r">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <h2 className="text-xl font-bold ml-2">Hackalyze</h2>
                </div>
                <nav>
                    <ul className="space-y-2">
                        <li className="py-2">
                            <Link to="/admin/dashboard" className="flex items-center text-gray-700">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                                </svg>
                                Dashboard
                            </Link>
                        </li>
                        <li className="py-2">
                            <Link to="/admin/create-hackathon" className="flex items-center text-gray-700">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                                Create New Hackathon
                            </Link>
                        </li>
                        <li className="py-2">
                            <Link to="/admin/view-hackathons" className="flex items-center text-gray-700 font-semibold">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                </svg>
                                View Hackathons
                            </Link>
                        </li>
                        <li className="py-2">
                            <Link to="/admin/settings" className="flex items-center text-gray-700">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                                Settings
                            </Link>
                        </li>
                    </ul>
                </nav>
                <div className="absolute bottom-5 w-52">
                    <Link to="/logout" className="flex items-center text-gray-700 py-2">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                        </svg>
                        Logout
                    </Link>
                </div>
            </aside>
            
            {/* Main Content */}
            <main className="flex-1 p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Duration */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
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
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex justify-between">
                            <h3 className="text-sm font-medium text-gray-500">Participants</h3>
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                            </svg>
                        </div>
                        <div className="mt-2">
                            <p className="text-2xl font-bold">{hackathon.participants}</p>
                            <p className="text-sm text-gray-500">{hackathon.submissions} submissions ({hackathon.submissionRate})</p>
                        </div>
                    </div>
                    
                    {/* Submission Deadline */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex justify-between">
                            <h3 className="text-sm font-medium text-gray-500">Submission Deadline</h3>
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div className="mt-2">
                            <p className="text-sm">7/1/2023, 5:29:59 AM</p>
                            <button 
                                onClick={handleChangeDeadline}
                                className="text-blue-600 text-xs mt-1"
                            >
                                Change Deadline
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Description */}
                <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
                    <h3 className="text-lg font-semibold mb-3">Description</h3>
                    <p className="text-gray-700 text-sm">{hackathon.description}</p>
                </div>
                
                {/* Tabs Navigation */}
                <div className="bg-white rounded-lg shadow-sm border mb-6">
                    <div className="border-b">
                        <nav className="flex -mb-px px-6">
                            <button
                                className={`py-4 px-2 border-b-2 ${activeTab === 'details' ? 'border-black font-medium' : 'border-transparent text-gray-500'} mr-8`}
                                onClick={() => setActiveTab('details')}
                            >
                                Assigned Teachers
                            </button>
                            <button
                                className={`py-4 px-2 border-b-2 ${activeTab === 'students' ? 'border-black font-medium' : 'border-transparent text-gray-500'} mr-8`}
                                onClick={() => setActiveTab('students')}
                            >
                                Registered Students
                            </button>
                            <button
                                className={`py-4 px-2 border-b-2 ${activeTab === 'media' ? 'border-black font-medium' : 'border-transparent text-gray-500'} mr-8`}
                                onClick={() => setActiveTab('media')}
                            >
                                Accepted Media
                            </button>
                            <button
                                className={`py-4 px-2 border-b-2 ${activeTab === 'notifications' ? 'border-black font-medium' : 'border-transparent text-gray-500'} mr-8`}
                                onClick={() => setActiveTab('notifications')}
                            >
                                Notifications
                            </button>
                            <button
                                className={`py-4 px-2 border-b-2 ${activeTab === 'results' ? 'border-black font-medium' : 'border-transparent text-gray-500'}`}
                                onClick={() => setActiveTab('results')}
                            >
                                Results
                            </button>
                        </nav>
                    </div>
                    
                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'details' && (
                            <div>
                                {/* Teachers Assigned */}
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Assigned Teachers</h3>
                                    <button 
                                        onClick={handleAssignTeacher}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm"
                                    >
                                        Assign New Teacher
                                    </button>
                                </div>
                                
                                {hackathon.teachersAssigned.length > 0 ? (
                                    <div className="space-y-4">
                                        {hackathon.teachersAssigned.map(teacher => (
                                            <div key={teacher.id} className="flex justify-between items-center border-b pb-4">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                                    <div className="ml-3">
                                                        <h4 className="font-medium">{teacher.name}</h4>
                                                        <p className="text-sm text-gray-500">{teacher.expertise.join(", ")}</p>
                                                    </div>
                                                </div>
                                                <button className="text-red-600 text-sm">Remove</button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-6">No teachers assigned to this hackathon yet.</p>
                                )}
                            </div>
                        )}
                        
                        {activeTab === 'students' && (
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Registered Students</h3>
                                
                                {hackathon.registeredStudents.length > 0 ? (
                                    <div className="space-y-4">
                                        {/* Would map through registeredStudents here */}
                                        <p>Student list would appear here</p>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-6">No students have registered for this hackathon yet.</p>
                                )}
                            </div>
                        )}
                        
                        {activeTab === 'media' && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Accepted Media Types</h3>
                                    <button 
                                        onClick={handleUpdateMediaTypes}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm"
                                    >
                                        Update Media Types
                                    </button>
                                </div>
                                
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {hackathon.allowedFormats.map((format, index) => (
                                        <div key={index} className="bg-gray-100 px-3 py-1 rounded-lg text-sm flex items-center">
                                            {format === "PDF" && (
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                                                </svg>
                                            )}
                                            {format === "Video" && (
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                                </svg>
                                            )}
                                            {format === "GitHub Repository" && (
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                                                </svg>
                                            )}
                                            {format}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'notifications' && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Notifications</h3>
                                    <button 
                                        onClick={handleSendNotification}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm"
                                    >
                                        Send Notification
                                    </button>
                                </div>
                                
                                {hackathon.notifications.length > 0 ? (
                                    <div className="space-y-4">
                                        {hackathon.notifications.map(notification => (
                                            <div key={notification.id} className="border-b pb-4">
                                                <div className="flex items-start">
                                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium">{notification.title}</h4>
                                                        <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
                                                        <p className="text-xs text-gray-500 mt-1">Sent on: {notification.sentOn}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-6">No notifications have been sent for this hackathon.</p>
                                )}
                            </div>
                        )}
                        
                        {activeTab === 'results' && (
                            <div>
                                <h3 className="text-lg font-semibold mb-6">Results</h3>
                                
                                <div className="flex flex-col items-center justify-center py-10">
                                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                                        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                    </div>
                                    <h4 className="font-medium mt-4">Results Not Available Yet</h4>
                                    <p className="text-sm text-gray-500 mt-2 text-center max-w-md">
                                        The hackathon is still in progress. Results will be available after the submission deadline and evaluation process.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminHackathonPage;