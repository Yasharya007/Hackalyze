import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getHackathonByIdAPI, logoutAPI, deleteHackathonAPI } from "../utils/api.jsx";
import toast from "react-hot-toast";

const AdminHackathonPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("assignedTeachers");
    const [loading, setLoading] = useState(true);
    const [hackathon, setHackathon] = useState({
        _id: "",
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        participants: 0,
        submissions: 0,
        submissionRate: "0%",
        status: "Active",
        submissionDeadline: "",
        teachersAssigned: [],
        registeredStudents: [],
        allowedFormats: [],
        notifications: [],
        results: []
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showNameConfirmModal, setShowNameConfirmModal] = useState(false);
    const [confirmName, setConfirmName] = useState("");

    useEffect(() => {
        const fetchHackathonDetails = async () => {
            try {
                setLoading(true);
                const response = await getHackathonByIdAPI(id);
                if (response && response.hackathon) {
                    // Format the data for UI
                    const hackathonData = response.hackathon;
                    
                    // Calculate submission rate if needed
                    const submissionRate = hackathonData.submissions && hackathonData.participants 
                        ? Math.round((hackathonData.submissions / hackathonData.participants) * 100) + "%" 
                        : "0%";
                    
                    setHackathon({
                        ...hackathonData,
                        submissionRate,
                        // Ensure these arrays exist
                        teachersAssigned: hackathonData.teachersAssigned || [],
                        registeredStudents: hackathonData.registeredStudents || [],
                        allowedFormats: hackathonData.allowedFormats || [],
                        notifications: hackathonData.notifications || [],
                        results: hackathonData.results || []
                    });
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching hackathon details:", error);
                toast.error("Failed to load hackathon details");
                setLoading(false);
            }
        };

        fetchHackathonDetails();
    }, [id]);

    const handleEditHackathon = () => {
        navigate(`/admin/edit-hackathon/${hackathon._id}`);
    };

    const handlePublishResults = () => {
        console.log("Publishing results for hackathon:", hackathon._id);
        // Logic to publish results
    };

    const handleSendNotification = () => {
        console.log("Sending notification for hackathon:", hackathon._id);
        // Open notification form/modal
    };

    const handleChangeDeadline = () => {
        console.log("Changing deadline for hackathon:", hackathon._id);
        // Open deadline form/modal
    };

    const handleUpdateMediaTypes = () => {
        console.log("Updating media types for hackathon:", hackathon._id);
        // Open media types form/modal
    };

    const handleAssignTeacher = () => {
        console.log("Assigning teacher to hackathon:", hackathon._id);
        // Open teacher assignment form/modal
    };

    const handleTabChange = (tab) => {
        if (tab === "overview") {
            navigate("/admin/dashboard");
        } else if (tab === "hackathons") {
            navigate("/admin/dashboard", { state: { activeTab: "hackathons" } });
        } else if (tab === "teachers") {
            navigate("/admin/dashboard", { state: { activeTab: "teachers" } });
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const handleFirstConfirm = () => {
        setShowDeleteModal(false);
        setShowNameConfirmModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (confirmName === hackathon.title) {
            try {
                await deleteHackathonAPI(id);
                setShowNameConfirmModal(false);
                // Navigate back to the dashboard after successful deletion
                navigate("/admin/dashboard", { state: { activeTab: "hackathons" } });
            } catch (error) {
                console.error("Error deleting hackathon:", error);
            }
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setShowNameConfirmModal(false);
        setConfirmName("");
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
        <div className="min-h-screen bg-gray-100 flex w-full">
            {/* Sidebar - Same as AdminDashboard for consistency */}
            <aside className="w-64 bg-white border-r h-screen sticky top-0 flex flex-col">
                <div className="p-5 flex-grow">
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
                </div>
                
                {/* Logout button at bottom of sidebar */}
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
            <div className="flex-1 overflow-auto p-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">{hackathon.title}</h1>
                        <div className="inline-block px-2 py-1 text-xs font-semibold text-white bg-green-500 rounded-full mt-2">
                            {hackathon.status}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">ID: {hackathon._id}</p>
                    </div>
                    <div className="flex space-x-2">
                        <button 
                            onClick={handleEditHackathon}
                            className="text-gray-700 bg-white border border-gray-300 px-3 py-1 rounded-lg flex items-center text-sm hover:bg-gray-50"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                            Edit
                        </button>
                        <button 
                            onClick={handlePublishResults}
                            className="text-white bg-black px-4 py-1 rounded-lg flex items-center text-sm"
                        >
                            Publish Results
                        </button>
                        <button 
                            onClick={handleDeleteClick}
                            className="text-white bg-red-600 border border-red-700 px-3 py-1 rounded-lg flex items-center text-sm hover:bg-red-700"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                            Delete
                        </button>
                    </div>
                </div>
                
                {/* Hackathon Overview */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Duration */}
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <div className="flex justify-between">
                                <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                                </svg>
                            </div>
                            <p className="mt-2 text-sm">
                                {hackathon.participants || 0} registered
                            </p>
                        </div>
                        
                        {/* Submissions */}
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <div className="flex justify-between">
                                <h3 className="text-sm font-medium text-gray-500">Submissions</h3>
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                            </div>
                            <div className="mt-2 flex items-center">
                                <span className="text-sm">{hackathon.submissions || 0} ({hackathon.submissionRate || "0%"})</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Description */}
                    <div>
                        <h2 className="text-xl font-semibold mb-3">Description</h2>
                        <p className="text-gray-700 text-sm">
                            {hackathon.description}
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
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
                            onClick={handleUpdateMediaTypes}
                            className="flex items-center justify-center space-x-2 bg-white border border-gray-300 p-3 rounded-lg hover:bg-gray-50"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <span className="text-sm font-medium">Update Media Types</span>
                        </button>
                    </div>
                </div>
                
                {/* Tabs Section */}
                <div className="bg-white rounded-lg shadow-sm border">
                    {/* Tab Navigation */}
                    <div className="border-b">
                        <div className="flex">
                            <button
                                className={`px-6 py-3 text-sm font-medium ${
                                    activeTab === "assignedTeachers"
                                        ? "border-b-2 border-black text-black"
                                        : "text-gray-500 hover:text-black"
                                }`}
                                onClick={() => setActiveTab("assignedTeachers")}
                            >
                                Assigned Teachers
                            </button>
                            <button
                                className={`px-6 py-3 text-sm font-medium ${
                                    activeTab === "registeredStudents"
                                        ? "border-b-2 border-black text-black"
                                        : "text-gray-500 hover:text-black"
                                }`}
                                onClick={() => setActiveTab("registeredStudents")}
                            >
                                Registered Students
                            </button>
                            <button
                                className={`px-6 py-3 text-sm font-medium ${
                                    activeTab === "mediaTypes"
                                        ? "border-b-2 border-black text-black"
                                        : "text-gray-500 hover:text-black"
                                }`}
                                onClick={() => setActiveTab("mediaTypes")}
                            >
                                Media Types
                            </button>
                            <button
                                className={`px-6 py-3 text-sm font-medium ${
                                    activeTab === "notifications"
                                        ? "border-b-2 border-black text-black"
                                        : "text-gray-500 hover:text-black"
                                }`}
                                onClick={() => setActiveTab("notifications")}
                            >
                                Notifications
                            </button>
                            <button
                                className={`px-6 py-3 text-sm font-medium ${
                                    activeTab === "results"
                                        ? "border-b-2 border-black text-black"
                                        : "text-gray-500 hover:text-black"
                                }`}
                                onClick={() => setActiveTab("results")}
                            >
                                Results
                            </button>
                        </div>
                    </div>
                    
                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === "assignedTeachers" && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold">Assigned Teachers</h2>
                                    <button 
                                        onClick={handleAssignTeacher}
                                        className="bg-black text-white px-3 py-1 text-sm rounded-lg flex items-center"
                                    >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                        </svg>
                                        Assign Teacher
                                    </button>
                                </div>
                                <div className="bg-white rounded-lg overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expertise</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {hackathon.teachersAssigned && hackathon.teachersAssigned.length === 0 ? (
                                                <tr>
                                                    <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                                                        No teachers assigned yet
                                                    </td>
                                                </tr>
                                            ) : (
                                                hackathon.teachersAssigned && hackathon.teachersAssigned.map((teacher) => (
                                                    <tr key={teacher._id || teacher.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {teacher.name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {teacher.expertise && teacher.expertise.join(", ")}
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
                        )}

                        {activeTab === "registeredStudents" && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold">Registered Students</h2>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search students..."
                                            className="border rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                                        />
                                        <svg className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                        </svg>
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Date</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submission Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {hackathon.registeredStudents && hackathon.registeredStudents.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                                                        No students registered yet
                                                    </td>
                                                </tr>
                                            ) : (
                                                hackathon.registeredStudents && hackathon.registeredStudents.map((student) => (
                                                    <tr key={student._id || student.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {student.name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {student.email}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {formatDate(student.registrationDate)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                                student.submissionStatus === "Submitted" 
                                                                    ? "bg-green-100 text-green-800" 
                                                                    : "bg-yellow-100 text-yellow-800"
                                                            }`}>
                                                                {student.submissionStatus || "Not submitted"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === "mediaTypes" && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold">Allowed Media Types</h2>
                                    <button 
                                        onClick={handleUpdateMediaTypes}
                                        className="bg-black text-white px-3 py-1 text-sm rounded-lg flex items-center"
                                    >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                                        </svg>
                                        Update Media Types
                                    </button>
                                </div>
                                <div className="bg-white rounded-lg p-4 border">
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Currently Allowed Submission Formats:</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {hackathon.allowedFormats && hackathon.allowedFormats.length === 0 ? (
                                            <p className="text-sm text-gray-500">No formats specified yet</p>
                                        ) : (
                                            hackathon.allowedFormats && hackathon.allowedFormats.map((format, index) => (
                                                <span
                                                    key={index}
                                                    className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-1 rounded"
                                                >
                                                    {format}
                                                </span>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "notifications" && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold">Notifications</h2>
                                    <button 
                                        onClick={handleSendNotification}
                                        className="bg-black text-white px-3 py-1 text-sm rounded-lg flex items-center"
                                    >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                                        </svg>
                                        Send Notification
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {hackathon.notifications && hackathon.notifications.length === 0 ? (
                                        <div className="bg-white rounded-lg p-4 border text-center text-gray-500">
                                            No notifications sent yet
                                        </div>
                                    ) : (
                                        hackathon.notifications && hackathon.notifications.map((notification, index) => (
                                            <div key={notification._id || notification.id || index} className="bg-white rounded-lg p-4 border">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="text-sm font-medium">{notification.title}</h3>
                                                    <span className="text-xs text-gray-500">{formatDate(notification.sentOn)}</span>
                                                </div>
                                                <p className="text-sm text-gray-700">{notification.message}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === "results" && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold">Results</h2>
                                    <button 
                                        onClick={handlePublishResults}
                                        className="bg-black text-white px-3 py-1 text-sm rounded-lg flex items-center"
                                    >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                                        </svg>
                                        Publish Results
                                    </button>
                                </div>
                                {hackathon.results && hackathon.results.length === 0 ? (
                                    <div className="bg-white rounded-lg p-4 border text-center text-gray-500">
                                        No results published yet
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-lg overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Title</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {hackathon.results.map((result, index) => (
                                                    <tr key={result._id || result.id || index}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {index + 1}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {result.studentName}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {result.projectTitle}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {result.score}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            <button className="text-blue-600 hover:text-blue-800 mr-2">View</button>
                                                            <button className="text-red-600 hover:text-red-800">Remove</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* First Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 backdrop-blur-[1px]"></div>
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full relative z-10">
                        <div className="flex items-start mb-4">
                            <div className="bg-red-100 p-2 rounded-full mr-3">
                                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Delete Hackathon</h2>
                                <p className="text-gray-600 mt-1">Are you sure you want to delete this hackathon and its contents? This action cannot be undone.</p>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-6">
                            <button 
                                onClick={handleCancelDelete}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleFirstConfirm}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Name Confirmation Modal */}
            {showNameConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 backdrop-blur-[1px]"></div>
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full relative z-10">
                        <div className="flex items-start mb-4">
                            <div className="bg-red-100 p-2 rounded-full mr-3">
                                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Confirm Deletion</h2>
                                <p className="text-gray-600 mt-1">To confirm deletion, please type the hackathon name:</p>
                                <p className="font-bold text-gray-700 mt-2">{hackathon.title}</p>
                            </div>
                        </div>
                        <input 
                            type="text" 
                            value={confirmName}
                            onChange={(e) => setConfirmName(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded mb-4"
                            placeholder="Type hackathon name"
                        />
                        <div className="flex justify-end space-x-2 mt-2">
                            <button 
                                onClick={handleCancelDelete}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDeleteConfirm}
                                disabled={confirmName !== hackathon.title}
                                className={`px-4 py-2 text-white rounded ${
                                    confirmName === hackathon.title ? 'bg-red-600 hover:bg-red-700' : 'bg-red-300 cursor-not-allowed'
                                }`}
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminHackathonPage;