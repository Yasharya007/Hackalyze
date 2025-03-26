import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { setHackathon } from "../slices/hackathonSlice";
import { getShortlistedSubmissions, updateShortlistOrder, sendShortlistToAdmin, AllHackathonAPI } from '../utils/api';
import { FaGripVertical, FaArrowLeft, FaPaperPlane } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ViewShortlistPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [allHackathons, setAllHackathons] = useState([]);
  const selectedHackathon = useSelector((state) => state.hackathon.selectedHackathon);
  
  const [shortlistedSubmissions, setShortlistedSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderChanged, setOrderChanged] = useState(false);

  // Fetch all hackathons for selection
  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const response = await AllHackathonAPI();
        setAllHackathons(response.data || []);
      } catch (error) {
        console.error("Failed to fetch hackathons:", error);
        toast.error("Failed to load hackathons");
      }
    };
    
    fetchHackathons();
  }, []);

  // Fetch shortlisted submissions when a hackathon is selected
  useEffect(() => {
    if (selectedHackathon && selectedHackathon._id) {
      fetchShortlistedSubmissions();
    }
  }, [selectedHackathon]);

  const fetchShortlistedSubmissions = async () => {
    setLoading(true);
    try {
      const response = await getShortlistedSubmissions(selectedHackathon._id);
      setShortlistedSubmissions(response || []);
      setOrderChanged(false);
    } catch (error) {
      console.error("Failed to fetch shortlisted submissions:", error);
      toast.error("Failed to load shortlisted submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleHackathonSelect = (hackathon) => {
    dispatch(setHackathon(hackathon));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(shortlistedSubmissions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update items with new ranks
    const rerankedItems = items.map((item, index) => ({
      ...item,
      rank: index + 1
    }));
    
    setShortlistedSubmissions(rerankedItems);
    setOrderChanged(true);
  };

  const saveShortlistOrder = async () => {
    try {
      const orderData = shortlistedSubmissions.map((submission, index) => ({
        submissionId: submission._id,
        rank: index + 1
      }));
      
      await updateShortlistOrder(selectedHackathon._id, orderData);
      toast.success("Shortlist order saved successfully");
      setOrderChanged(false);
    } catch (error) {
      console.error("Failed to update shortlist order:", error);
      toast.error("Failed to save shortlist order");
    }
  };

  const sendToAdmin = async () => {
    try {
      await sendShortlistToAdmin(selectedHackathon._id);
      toast.success("Shortlist sent to admin for review");
    } catch (error) {
      console.error("Failed to send shortlist to admin:", error);
      toast.error("Failed to send shortlist to admin");
    }
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
              <a href="/teacher/dashboard" className="flex items-center p-2 text-gray-600 rounded-md hover:bg-gray-100">
                <span className="mr-2">📊</span>
                Dashboard
              </a>
            </li>
            <li>
              <a href="/teacher/hackathons" className="flex items-center p-2 text-gray-600 rounded-md hover:bg-gray-100">
                <span className="mr-2">🏆</span>
                View Hackathons
              </a>
            </li>
            <li>
              <a href="/teacher/parameters" className="flex items-center p-2 text-gray-600 rounded-md hover:bg-gray-100">
                <span className="mr-2">⚙️</span>
                Set Parameters
              </a>
            </li>
            <li>
              <a href="/teacher/submissions" className="flex items-center p-2 text-gray-600 rounded-md hover:bg-gray-100">
                <span className="mr-2">📝</span>
                View Submissions
              </a>
            </li>
            <li>
              <a href="/teacher/shortlist" className="flex items-center p-2 bg-blue-100 text-blue-800 rounded-md">
                <span className="mr-2">🌟</span>
                View Shortlist
              </a>
            </li>
            <li>
              <a href="/teacher/settings" className="flex items-center p-2 text-gray-600 rounded-md hover:bg-gray-100">
                <span className="mr-2">⚙️</span>
                Settings
              </a>
            </li>
          </ul>
        </nav>
        <div className="p-4 mt-auto">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 w-full"
          >
            <FaArrowLeft className="mr-2" />
            Go Back
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">Shortlisted Submissions</h1>
          
          {/* Hackathon Selection */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Select Hackathon:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allHackathons.map((hackathon) => (
                <div
                  key={hackathon._id}
                  onClick={() => handleHackathonSelect(hackathon)}
                  className={`border p-4 rounded-lg cursor-pointer transition-all ${
                    selectedHackathon && selectedHackathon._id === hackathon._id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <h3 className="font-medium">{hackathon.title}</h3>
                  <p className="text-sm text-gray-500">{new Date(hackathon.startDate).toLocaleDateString()} - {new Date(hackathon.endDate).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shortlisted Submissions */}
          {selectedHackathon && selectedHackathon._id ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {selectedHackathon.title} Shortlist
                </h2>
                <div className="flex space-x-2">
                  {orderChanged && (
                    <button
                      onClick={saveShortlistOrder}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Save Order
                    </button>
                  )}
                  <button
                    onClick={sendToAdmin}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <FaPaperPlane className="mr-2" />
                    Send to Admin
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <p className="text-gray-500">Loading submissions...</p>
                </div>
              ) : shortlistedSubmissions.length === 0 ? (
                <div className="flex justify-center items-center h-40">
                  <p className="text-gray-500">No shortlisted submissions found</p>
                </div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="shortlist">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="border rounded-lg overflow-hidden"
                      >
                        <div className="bg-gray-50 grid grid-cols-12 p-4 border-b font-medium">
                          <div className="col-span-1">Rank</div>
                          <div className="col-span-4">Student</div>
                          <div className="col-span-3">AI Score</div>
                          <div className="col-span-3">Manual Score</div>
                          <div className="col-span-1"></div>
                        </div>
                        
                        {shortlistedSubmissions.map((submission, index) => (
                          <Draggable
                            key={submission._id}
                            draggableId={submission._id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`grid grid-cols-12 p-4 items-center border-b ${
                                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                }`}
                              >
                                <div className="col-span-1 font-bold">{index + 1}</div>
                                <div className="col-span-4">{submission.studentName || 'Unknown Student'}</div>
                                <div className="col-span-3">
                                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div 
                                      className="bg-blue-600 h-2.5 rounded-full" 
                                      style={{ width: `${submission.aiScore || 0}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm">{submission.aiScore || 0}/100</span>
                                </div>
                                <div className="col-span-3">
                                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div 
                                      className="bg-green-600 h-2.5 rounded-full" 
                                      style={{ width: `${submission.manualScore || 0}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm">{submission.manualScore || 0}/100</span>
                                </div>
                                <div 
                                  {...provided.dragHandleProps} 
                                  className="col-span-1 flex justify-center"
                                >
                                  <FaGripVertical className="text-gray-400 cursor-grab" />
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>
          ) : (
            <div className="flex justify-center items-center h-40">
              <p className="text-gray-500">Please select a hackathon to view its shortlist</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ViewShortlistPage;
