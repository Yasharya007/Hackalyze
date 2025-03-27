import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutAPI, getShortlistedSubmissions, updateShortlistOrder, HackathonAPI, sendShortlistToAdmin } from "../utils/api.jsx";
import { FaChartBar, FaLaptopCode, FaCogs, FaClipboardList, FaTrophy, FaUserCog, FaArrowLeft, FaGripLines, FaFile, FaFileAlt, FaImage, FaVideo, FaMusic } from "react-icons/fa";
import toast from "react-hot-toast";
import { setHackathon as setHackathonAction } from "../slices/hackathonSlice.js";

// Helper function to get icon based on file format
const getFileIcon = (format) => {
    switch (format?.toLowerCase()) {
        case 'audio':
            return <FaMusic className="text-indigo-500" />;
        case 'video':
            return <FaVideo className="text-red-500" />;
        case 'image':
            return <FaImage className="text-green-500" />;
        case 'file':
        default:
            return <FaFileAlt className="text-blue-500" />;
    }
};

// CSS for drag and drop operations
const dragStyles = `
    .submission-item {
        transition: all 0.3s ease;
        position: relative;
    }
    
    .submission-item:before {
        content: "↕ Drag to reorder";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        text-align: center;
        background: #3b82f6;
        color: white;
        padding: 2px 0;
        font-size: 0.75rem;
        border-radius: 8px 8px 0 0;
        opacity: 0;
        transform: translateY(-100%);
        transition: all 0.2s ease;
    }
    
    .submission-item:hover:before {
        opacity: 1;
        transform: translateY(0);
    }
    
    .submission-item.dragging {
        opacity: 0.7;
        transform: scale(0.98);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        background-color: #f8fafc;
        z-index: 10;
    }
    
    .submission-item.drag-over {
        border: 2px dashed #3b82f6;
        box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
        margin-top: 20px;
        margin-bottom: 20px;
    }
    
    .drag-handle {
        cursor: grab;
    }
    
    .drag-handle:active {
        cursor: grabbing;
    }
`;

const ShortlistDetailPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const { hackathonId: urlHackathonId } = useParams(); // Get hackathonId from URL path params
    const hackathonFromRedux = useSelector((state) => state.hackathon.hackathon);
    const [loading, setLoading] = useState(true);
    const [shortlistedSubmissions, setShortlistedSubmissions] = useState([]);
    const [saving, setSaving] = useState(false);
    const [orderChanged, setOrderChanged] = useState(false);
    const [hackathon, setHackathon] = useState(null);
    const [hackathonId, setHackathonId] = useState(null);
    const [hackathonTitle, setHackathonTitle] = useState("Shortlisted Submissions");

    // State to store the dragged item's index
    const [draggedItemIndex, setDraggedItemIndex] = useState(null);

    // Get hackathon info from URL, session storage, and Redux
    useEffect(() => {
        console.log("Initializing with data sources:");
        
        // Get from URL path parameter
        console.log("URL path parameter hackathonId:", urlHackathonId);
        
        // Get from session storage
        let storedHackathon = null;
        try {
            const stored = sessionStorage.getItem('selectedHackathon');
            if (stored) {
                storedHackathon = JSON.parse(stored);
                console.log("Session storage data:", storedHackathon);
            }
        } catch (error) {
            console.error("Error parsing session storage:", error);
        }
        
        // Get from Redux
        console.log("Redux data:", hackathonFromRedux);
        
        // Priority order: Redux > Session Storage > URL params
        if (hackathonFromRedux && hackathonFromRedux._id) {
            console.log("Using hackathon from Redux");
            setHackathon(hackathonFromRedux);
            setHackathonId(hackathonFromRedux._id);
            setHackathonTitle(hackathonFromRedux.title || "Shortlisted Submissions");
        } else if (storedHackathon && storedHackathon._id) {
            console.log("Using hackathon from session storage");
            setHackathon(storedHackathon);
            setHackathonId(storedHackathon._id);
            setHackathonTitle(storedHackathon.title || "Shortlisted Submissions");
            // Also update Redux for consistency
            dispatch(setHackathonAction(storedHackathon));
        } else if (urlHackathonId) {
            console.log("Using hackathon ID from URL path parameter");
            setHackathonId(urlHackathonId);
        } else {
            console.log("No hackathon information found");
            toast.error("No hackathon selected. Redirecting to shortlist selection.");
            navigate("/teacher/shortlist");
        }
    }, [urlHackathonId, hackathonFromRedux, dispatch, navigate]);

    // Fetch hackathon data if we only have the ID
    useEffect(() => {
        const fetchHackathonData = async () => {
            // If we have an ID but no full hackathon object
            if (hackathonId && !hackathon) {
                console.log("Fetching hackathon data for ID:", hackathonId);
                try {
                    setLoading(true);
                    const response = await HackathonAPI(hackathonId);
                    console.log("Hackathon API response:", response);
                    
                    if (response) {
                        setHackathon(response);
                        dispatch(setHackathonAction(response));
                        setHackathonTitle(response.title || "Shortlisted Submissions");
                        // Also store in session storage
                        sessionStorage.setItem('selectedHackathon', JSON.stringify(response));
                    } else {
                        toast.error("Failed to load hackathon details");
                        navigate("/teacher/shortlist");
                    }
                } catch (error) {
                    console.error("Error fetching hackathon:", error);
                    toast.error("Error loading hackathon details");
                    navigate("/teacher/shortlist");
                }
            }
        };
        
        fetchHackathonData();
    }, [hackathonId, hackathon, dispatch, navigate]);

    // Fetch shortlisted submissions when hackathon is available
    useEffect(() => {
        if (hackathon && hackathon._id) {
            console.log("Hackathon available, fetching shortlisted submissions");
            fetchShortlistedSubmissions();
        } else if (hackathonId) {
            console.log("Only hackathon ID available, will fetch submissions after getting full hackathon data");
        }
    }, [hackathon]);

    const fetchShortlistedSubmissions = async () => {
        try {
            setLoading(true);
            const idToUse = hackathon?._id || hackathonId;
            
            if (!idToUse) {
                console.error("No hackathon ID available for fetching submissions");
                return;
            }
            
            console.log("Fetching shortlisted submissions for hackathon:", idToUse);
            const response = await getShortlistedSubmissions(idToUse);
            console.log("Shortlisted submissions response:", response);
            
            // Check if response exists and handle both array and object responses
            let submissions = [];
            if (response) {
                if (Array.isArray(response)) {
                    submissions = response;
                } else if (response.data && Array.isArray(response.data)) {
                    submissions = response.data;
                } else if (typeof response === 'object') {
                    // Try to convert any other object to array if possible
                    submissions = Object.values(response);
                }
            }
            
            console.log("Detailed submissions data:", submissions);
            
            if (submissions.length === 0) {
                console.log("No shortlisted submissions found");
                toast.error("No shortlisted submissions found for this hackathon");
                return;
            }
            
            console.log("Processing", submissions.length, "shortlisted submissions");
            
            // Debug file data in submissions
            submissions.forEach((sub, i) => {
                console.log(`Submission ${i+1} (${sub._id}) files:`, sub.files);
                console.log(`Submission ${i+1} complete data:`, sub);
            });
            
            // Sort submissions by rank (if it exists) or by score
            let sortedSubmissions = submissions.sort((a, b) => {
                if (a.rank !== undefined && b.rank !== undefined && a.rank !== 999 && b.rank !== 999) {
                    return a.rank - b.rank; // Sort by existing ranks if available and not default 999
                } else {
                    // Sort by total score (AI + manual if available)
                    const aScore = (a.aiScore || 0) + (a.manualScore || 0);
                    const bScore = (b.aiScore || 0) + (b.manualScore || 0);
                    return bScore - aScore; // Higher scores first
                }
            });
            
            // Assign sequential ranks (1, 2, 3...) to all submissions
            sortedSubmissions = sortedSubmissions.map((submission, index) => ({
                ...submission,
                rank: index + 1, // Start from 1
                score: (submission.aiScore || 0) + (submission.manualScore || 0) // Calculate total score
            }));
            
            console.log("Initialized submissions with sequential ranks:", sortedSubmissions);
            
            setShortlistedSubmissions(sortedSubmissions);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching shortlisted submissions:", error);
            toast.error("Failed to fetch shortlisted submissions");
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logoutAPI().then(() => {
            window.location.href = "/";
        });
    };

    // Handle drag start
    const handleDragStart = (e, index) => {
        setDraggedItemIndex(index);
        // Add visual styling
        e.currentTarget.classList.add('dragging');
        // Store the item index in the dataTransfer object
        e.dataTransfer.setData('text/plain', index);
        // Set the drag effect
        e.dataTransfer.effectAllowed = 'move';
        
        // Create a custom drag image that shows only the rank
        const dragIcon = document.createElement('div');
        dragIcon.innerHTML = `<div style="background: #3b82f6; color: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px;">${index + 1}</div>`;
        document.body.appendChild(dragIcon);
        e.dataTransfer.setDragImage(dragIcon, 20, 20);
        
        // Add a small timeout to remove the element after the drag image is captured
        setTimeout(() => {
            document.body.removeChild(dragIcon);
        }, 0);
    };
    
    // Handle drag over
    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        // Add a visual cue for the drop position
        const items = document.querySelectorAll('.submission-item');
        items.forEach(item => {
            item.classList.remove('drag-over');
        });
        
        // Add indicator to the current target
        e.currentTarget.classList.add('drag-over');
    };
    
    // Handle drop
    const handleDrop = (e, index) => {
        e.preventDefault();
        
        // Clear visual styles
        const items = document.querySelectorAll('.submission-item');
        items.forEach(item => {
            item.classList.remove('dragging', 'drag-over');
        });
        
        // Get the source index from dataTransfer
        const sourceIndex = draggedItemIndex;
        const targetIndex = index;
        
        // Don't do anything if dropped on the same item
        if (sourceIndex === targetIndex) {
            return;
        }
        
        console.log("Dragged from", sourceIndex, "to", targetIndex);
        
        // Create a copy of submissions array
        const newSubmissions = [...shortlistedSubmissions];
        
        // Remove the dragged item
        const draggedItem = newSubmissions.splice(sourceIndex, 1)[0];
        
        // Insert at the new position
        newSubmissions.splice(targetIndex, 0, draggedItem);
        
        // Update ranks
        const updatedSubmissions = newSubmissions.map((item, index) => ({
            ...item,
            rank: index + 1
        }));
        
        // Update state
        setShortlistedSubmissions(updatedSubmissions);
        setOrderChanged(true);
        
        // Reset dragged item
        setDraggedItemIndex(null);
    };
    
    // Handle drag end
    const handleDragEnd = (e) => {
        // Clear visual styles
        e.currentTarget.classList.remove('dragging');
        const items = document.querySelectorAll('.submission-item');
        items.forEach(item => {
            item.classList.remove('drag-over');
        });
        
        // Reset dragged item
        setDraggedItemIndex(null);
    };

    // Save the new order to the backend
    const handleSaveOrder = async () => {
        if (!orderChanged) return;
        
        try {
            setSaving(true);
            
            // Create order data for the API
            const orderData = shortlistedSubmissions.map((submission, index) => ({
                submissionId: submission._id,
                rank: index + 1
            }));
            
            const idToUse = hackathon?._id || hackathonId;
            console.log("Saving new order for hackathon:", idToUse, orderData);
            
            await updateShortlistOrder(idToUse, orderData);
            
            setOrderChanged(false);
            toast.success("Shortlist order updated successfully");
        } catch (error) {
            console.error("Error updating shortlist order:", error);
            toast.error("Failed to update shortlist order: " + (error.message || "Unknown error"));
        } finally {
            setSaving(false);
        }
    };

    const handleBack = () => {
        navigate("/teacher/shortlist");
    };

    const handleSendToAdmin = async () => {
        if (!hackathonId) {
            toast.error("No hackathon selected");
            return;
        }
        
        try {
            // First make sure order is saved
            if (orderChanged) {
                await handleSaveOrder();
            }
            
            // Show loading toast
            const loadingToast = toast.loading("Sending shortlist to admin...");
            
            // Call API to send to admin
            await sendShortlistToAdmin(hackathonId);
            
            // Show success message
            toast.dismiss(loadingToast);
            toast.success("Shortlist sent to admin successfully");
        } catch (error) {
            console.error("Error sending shortlist to admin:", error);
            toast.error("Failed to send shortlist to admin. Please try again.");
        }
    };

    return (
        <div className="flex w-full min-h-screen bg-gray-100">
            {/* Inject CSS styles for drag and drop */}
            <style>{dragStyles}</style>
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
                                to="/teacher/parameters" 
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
                                className="flex items-center p-2 rounded-md bg-blue-100 text-blue-700 rounded-md"
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
                        </li>                    </ul>
                </nav>
                <div className="mt-auto mb-6 px-4">
          <button
            onClick={handleLogout}
            className="flex items-center p-2 rounded-md text-red-600 hover:bg-red-50 w-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6">
                <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                    <div className="flex items-center mb-6">
                        <button 
                            onClick={handleBack}
                            className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full h-8 w-8 mr-3"
                        >
                            <FaArrowLeft className="text-gray-700" />
                        </button>
                        <h1 className="text-2xl font-bold">{hackathonTitle} - Shortlisted Submissions</h1>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading shortlisted submissions...</p>
                            </div>
                        </div>
                    ) : shortlistedSubmissions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64">
                            <p className="text-xl text-gray-600 mb-4">No shortlisted submissions found</p>
                            <button 
                                onClick={handleBack}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Return to Shortlist Selection
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6">
                                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                                    <div className="flex items-center">
                                        <svg className="h-6 w-6 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                        <p className="text-blue-700">Drag and drop submissions to reorder them. The order will be used for final selection.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="text-lg font-medium">{shortlistedSubmissions.length} Shortlisted Submissions</h3>
                                    <p className="text-sm text-gray-500">Evaluated by Gemini AI and teacher review</p>
                                </div>
                                <div className="flex space-x-3">
                                    <button 
                                        onClick={handleSaveOrder}
                                        disabled={!orderChanged || saving}
                                        className={`px-4 py-2 rounded-md flex items-center ${
                                            !orderChanged 
                                                ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                    >
                                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                        </svg>
                                        {saving ? 'Saving...' : 'Save Order'}
                                    </button>
                                    <button 
                                        onClick={handleSendToAdmin}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                                    >
                                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                        Send to Admin
                                    </button>
                                </div>
                            </div>

                            {/* Shortlisted submissions list with better instructions */}
                            <div className="space-y-3 mt-4">
                                <div className="text-center text-sm text-gray-600 mb-4 bg-blue-50 p-2 rounded-md border border-blue-100">
                                    <p className="font-medium">Drag and drop submissions to reorder them</p>
                                    <p>Changes won't be saved until you click "Save Order"</p>
                                </div>
                                
                                {shortlistedSubmissions.map((submission, index) => (
                                    <div
                                        key={submission._id}
                                        className={`submission-item bg-white border rounded-lg p-4 shadow ${
                                            draggedItemIndex === index ? 'opacity-50' : ''
                                        }`}
                                        draggable="true"
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDrop={(e) => handleDrop(e, index)}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold mr-3 drag-handle">
                                                {submission.rank}
                                                <span className="sr-only">Drag to reorder</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="font-semibold text-lg">
                                                            {submission.studentName || submission.submittedBy?.name || 'Unknown Student'}
                                                        </h3>
                                                        
                                                        {/* File links next to student name */}
                                                        {Array.isArray(submission.files) && submission.files.length > 0 && (
                                                            <div className="flex gap-1">
                                                                {submission.files.map((file, fileIndex) => (
                                                                    <a 
                                                                        key={fileIndex}
                                                                        href={file.fileUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center px-2 py-1 text-xs bg-gray-100 rounded-md text-blue-600 hover:text-blue-800 hover:bg-gray-200"
                                                                    >
                                                                        {getFileIcon(file.format)}
                                                                        <span className="ml-1">View {file.format || 'File'}</span>
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex flex-wrap gap-2 mt-1 md:mt-0">
                                                        {submission.aiScore !== undefined && (
                                                            <span className="text-sm font-medium bg-purple-100 text-purple-800 py-1 px-2 rounded flex items-center">
                                                                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                                </svg>
                                                                AI: {submission.aiScore}
                                                            </span>
                                                        )}
                                                        {submission.manualScore !== undefined && (
                                                            <span className="text-sm font-medium bg-green-100 text-green-800 py-1 px-2 rounded flex items-center">
                                                                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                </svg>
                                                                Manual: {submission.manualScore}
                                                            </span>
                                                        )}
                                                        <span className="text-sm font-medium bg-blue-100 text-blue-800 py-1 px-2 rounded flex items-center">
                                                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                                            </svg>
                                                            Total: {submission.score}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {/* Title (if available) */}
                                                {submission.title && (
                                                    <p className="text-gray-600 font-medium mb-2">{submission.title}</p>
                                                )}
                                                
                                                {submission.description && (
                                                    <p className="text-gray-500 text-sm line-clamp-2">
                                                        {submission.description}
                                                    </p>
                                                )}
                                                
                                                {submission.tags && submission.tags.length > 0 && (
                                                    <div className="mt-2 flex flex-wrap gap-1">
                                                        {submission.tags.map((tag, tagIndex) => (
                                                            <span 
                                                                key={tagIndex} 
                                                                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                
                                                {submission.githubRepo && (
                                                    <a 
                                                        href={submission.githubRepo} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                                                    >
                                                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                        View GitHub Repository
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ShortlistDetailPage;
