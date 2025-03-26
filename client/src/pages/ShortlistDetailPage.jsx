import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutAPI, getShortlistedSubmissions, updateShortlistOrder, HackathonAPI } from "../utils/api.jsx";
import { FaChartBar, FaLaptopCode, FaCogs, FaClipboardList, FaTrophy, FaUserCog, FaArrowLeft, FaGripLines } from "react-icons/fa";
import toast from "react-hot-toast";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { setHackathon as setHackathonAction } from "../slices/hackathonSlice.js";

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
            
            // Map submissions with their rank/order
            const submissions = Array.isArray(response) ? response : 
                              (response && response.data ? response.data : []);
            
            if (submissions.length === 0) {
                console.log("No shortlisted submissions found");
                toast.error("No shortlisted submissions found for this hackathon");
            }
            
            // Sort submissions by rank (if it exists) or by score
            const sortedSubmissions = submissions.sort((a, b) => {
                if (a.rank !== undefined && b.rank !== undefined) {
                    return a.rank - b.rank;
                }
                return b.score - a.score;
            });
            
            // Assign rank if not provided
            const rankedSubmissions = sortedSubmissions.map((submission, index) => ({
                ...submission,
                rank: submission.rank !== undefined ? submission.rank : index + 1
            }));
            
            setShortlistedSubmissions(rankedSubmissions);
        } catch (error) {
            console.error("Error fetching shortlisted submissions:", error);
            toast.error("Failed to load shortlisted submissions");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logoutAPI().then(() => {
            window.location.href = "/";
        });
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;
        
        const items = Array.from(shortlistedSubmissions);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        
        // Update the rank/order of items
        const rerankedItems = items.map((item, index) => ({
            ...item,
            rank: index + 1
        }));
        
        setShortlistedSubmissions(rerankedItems);
        setOrderChanged(true);
    };

    const handleSaveOrder = async () => {
        try {
            setSaving(true);
            
            // Prepare the order data for the API
            const orderData = shortlistedSubmissions.map(submission => ({
                submissionId: submission._id,
                rank: submission.rank
            }));
            
            const idToUse = hackathon?._id || hackathonId;
            if (!idToUse) {
                toast.error("Hackathon ID not available");
                return;
            }
            
            await updateShortlistOrder(idToUse, orderData);
            toast.success("Shortlist order updated successfully");
            setOrderChanged(false);
        } catch (error) {
            console.error("Error updating shortlist order:", error);
            toast.error("Failed to update shortlist order");
        } finally {
            setSaving(false);
        }
    };

    const handleBack = () => {
        navigate("/teacher/shortlist");
    };

    return (
        <div className="flex w-full min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-lg flex flex-col h-screen sticky top-0">
                <div className="p-6">
                    <h2 className="text-2xl font-bold">Teacher Portal</h2>
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
                                className="flex items-center p-2 rounded-md bg-blue-100 text-blue-700 rounded-md"
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
                        </li>
                    </ul>
                </nav>
                <div className="p-4 mt-auto">
                    <button 
                        onClick={handleLogout}
                        className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                        Logout
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
                            <div className="mb-4 flex justify-between items-center">
                                <p className="text-gray-600">Drag and drop to reorder the submissions</p>
                                <button 
                                    onClick={handleSaveOrder}
                                    disabled={!orderChanged || saving}
                                    className={`px-4 py-2 rounded-md ${
                                        !orderChanged 
                                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                >
                                    {saving ? 'Saving...' : 'Save Order'}
                                </button>
                            </div>

                            <DragDropContext onDragEnd={handleDragEnd}>
                                <Droppable droppableId="shortlisted-submissions">
                                    {(provided) => (
                                        <ul 
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="space-y-3"
                                        >
                                            {shortlistedSubmissions.map((submission, index) => (
                                                <Draggable 
                                                    key={submission._id} 
                                                    draggableId={submission._id} 
                                                    index={index}
                                                >
                                                    {(provided, snapshot) => (
                                                        <li
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            className={`bg-white border rounded-lg p-4 shadow ${
                                                                snapshot.isDragging ? 'border-blue-500 shadow-lg' : ''
                                                            }`}
                                                        >
                                                            <div className="flex items-center">
                                                                <div 
                                                                    {...provided.dragHandleProps}
                                                                    className="mr-3 p-2 rounded-md hover:bg-gray-100 cursor-grab"
                                                                >
                                                                    <FaGripLines className="text-gray-400" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex justify-between items-center mb-2">
                                                                        <h3 className="font-semibold text-lg">
                                                                            {submission.submittedBy?.name || 'Unknown Student'}
                                                                        </h3>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-sm font-medium bg-blue-100 text-blue-800 py-1 px-2 rounded">
                                                                                Rank: {submission.rank}
                                                                            </span>
                                                                            <span className="text-sm font-medium bg-green-100 text-green-800 py-1 px-2 rounded">
                                                                                Score: {submission.score || 'N/A'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-gray-600 text-sm mb-2">
                                                                        {submission.title || 'Untitled Submission'}
                                                                    </p>
                                                                    {submission.description && (
                                                                        <p className="text-gray-500 text-sm line-clamp-2">
                                                                            {submission.description}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </li>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </ul>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ShortlistDetailPage;
