import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaChartBar, FaLaptopCode, FaCogs, FaClipboardList, FaTrophy, FaUserCog, FaArrowLeft, 
         FaWeight, FaPercentage, FaCheck, FaPlus, FaMinus, FaInfoCircle, FaTimes, FaTrash, FaRobot,
         FaSync } from 'react-icons/fa';
import BroadTable from "../components/BroadTable.jsx";
import { logoutAPI, addParameterAPI, deleteParameterAPI, getParametersAPI, evaluateWithCustomParameters, updateParameterAPI } from '../utils/api.jsx';
import toast from "react-hot-toast";

const DetailedAnalysis = () => {
  const navigate = useNavigate();
  const hackathon = useSelector((state) => state.hackathon.selectedHackathon);
  
  // Info panel state
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const infoPanelRef = useRef(null);
  const btnRef = useRef(null);
  const broadTableRef = useRef(null);
  const [detailsLocked, setDetailsLocked] = useState(false);
  
  // Parameter states
  const [allParameters, setAllParameters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // New parameter form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newParameter, setNewParameter] = useState({
    name: '',
    description: '',
    weight: 0.15,
  });
  
  // Selected submissions and AI evaluation state
  const [selectedSubmissions, setSelectedSubmissions] = useState([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResults, setEvaluationResults] = useState(null);

  // Fetch parameters from API
  const fetchParameters = async () => {
    if (hackathon?._id) {
      setIsLoading(true);
      try {
        const response = await getParametersAPI(hackathon._id);
        if (response.parameters && Array.isArray(response.parameters)) {
          // Transform the API response to match our parameter format
          const formattedParams = response.parameters.map((param, index) => ({
            id: param._id || `param-${index}`,
            name: param.name,
            description: param.description,
            weight: param.weight ? param.weight / 100 : 0.15, // Convert weight from 0-100 to 0-1
            selected: true, // Set all parameters to selected by default
            _id: param._id // Keep the original _id from the server
          }));
          console.log("Formatted parameters:", formattedParams);
          setAllParameters(formattedParams);
        }
      } catch (err) {
        console.error("Error fetching parameters:", err);
        setError("Failed to load parameters");
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchParameters();
  }, [hackathon]);
  
  // Get active sidebar item
  const getActiveSidebarItem = () => {
    return 'submissions'; // This page is part of the submissions flow
  };
  
  // Get active parameters (selected)
  const activeParameters = allParameters.filter(param => param.selected);
  
  // Calculate total weight of active parameters
  const totalWeight = activeParameters.reduce((acc, param) => acc + param.weight, 0);
  
  // Check if weight is exactly 100% (or close enough considering floating-point precision)
  const isWeightValid = Math.abs(totalWeight * 100 - 100) < 0.1;
  
  // Toggle parameter selected status
  const toggleParameter = (id) => {
    console.log("Toggling parameter with ID:", id);
    setAllParameters(prev => {
      const updated = prev.map(param => {
        // Check if this param matches the id (either internal id or _id from server)
        if (param.id === id || param._id === id) {
          console.log(`Toggling parameter: ${param.name} from ${param.selected} to ${!param.selected}`);
          return { ...param, selected: !param.selected };
        }
        return param;
      });
      console.log("Updated parameters:", updated);
      return updated;
    });
  };

  // Update parameter weight on server
  const handleWeightUpdate = async (paramId, weight) => {
    try {
      // Convert weight from decimal (0-1) to percentage (0-100) for API
      const weightForApi = Math.round(weight * 100);
      
      await updateParameterAPI(hackathon._id, paramId, { weight: weightForApi });
      console.log(`Parameter ${paramId} weight updated to ${weightForApi}%`);
    } catch (error) {
      console.error("Failed to update parameter weight:", error);
    }
  };
  
  // Adjust parameter weight with debounced server update
  const adjustWeight = (id, amount) => {
    setAllParameters(prev => {
      const updated = prev.map(param => {
        if (param.id === id || param._id === id) {
          const newWeight = Math.max(0.01, Math.min(0.5, param.weight + amount));
          
          // Schedule weight update to server after changes settle
          setTimeout(() => handleWeightUpdate(param._id, newWeight), 500);
          
          return { ...param, weight: newWeight };
        }
        return param;
      });
      return updated;
    });
  };
  
  // Handle parameter form input change
  const handleParameterInputChange = (e) => {
    const { name, value } = e.target;
    setNewParameter(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Add new parameter via API
  const handleAddParameter = async (e) => {
    e.preventDefault();
    if (!newParameter.name || !newParameter.description) {
      alert('Please provide both name and description');
      return;
    }
    
    try {
      // Convert weight from decimal (0-1) to percentage (0-100) for API
      const weightForApi = Math.round(newParameter.weight * 100);
      
      const response = await addParameterAPI(
        hackathon._id,
        newParameter.name,
        newParameter.description,
        weightForApi
      );
      
      // Reset form
      setNewParameter({
        name: '',
        description: '',
        weight: 0.15,
      });
      setShowAddForm(false);
      
      // Refresh parameters list from the backend
      await fetchParameters();
      
    } catch (err) {
      console.error("Error adding parameter:", err);
      alert("Failed to add parameter. Please try again.");
    }
  };
  
  // Delete parameter
  const handleDeleteParameter = async (paramId, paramServerId) => {
    try {
      // The API expects the server ID (_id), not our local id
      if (paramServerId) {
        await deleteParameterAPI(hackathon._id, paramServerId);
        
        // Refresh parameters list from the backend after successful deletion
        await fetchParameters();
      } else {
        // If there's no server ID, just remove from local state
        // This handles parameters that haven't been saved to the server yet
        setAllParameters(prev => prev.filter(param => param.id !== paramId));
      }
    } catch (err) {
      console.error("Error deleting parameter:", err);
      // Error handling is already in the API function with toast notifications
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logoutAPI();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  // Handle AI evaluation with custom parameters
  const handleAIEvaluation = async () => {
    // Validate if we have selected submissions
    if (!selectedSubmissions || selectedSubmissions.length === 0) {
      toast.error("Please select at least one submission to evaluate");
      return;
    }

    // Validate if parameters are properly set (total weight = 100%)
    if (!isWeightValid) {
      toast.error("Total parameter weight must equal 100%");
      return;
    }

    // Get the selected parameters with weights
    const selectedParameters = allParameters
      .filter(param => param.selected)
      .map(param => ({
        name: param.name,
        description: param.description,
        weight: param.weight * 100 // Convert to percentage
      }));

    if (selectedParameters.length === 0) {
      toast.error("Please select at least one parameter for evaluation");
      return;
    }

    try {
      setIsEvaluating(true);
      
      // Extract submission IDs
      const submissionIds = selectedSubmissions.map(submission => submission._id);
      
      // Call the API for custom parameter evaluation
      const result = await evaluateWithCustomParameters(
        hackathon._id,
        submissionIds,
        selectedParameters
      );
      
      setEvaluationResults(result.results);
      
      // Refresh the table to show updated scores
      if (broadTableRef.current) {
        broadTableRef.current.refreshData();
      }
      
      toast.success(`Successfully evaluated ${submissionIds.length} submissions`);
    } catch (error) {
      console.error("Evaluation failed:", error);
      toast.error("Failed to evaluate submissions: " + (error.message || "Unknown error"));
    } finally {
      setIsEvaluating(false);
    }
  };

  // Handler for when submissions are selected in the BroadTable
  const handleSubmissionsSelected = (submissions) => {
    console.log("Submissions selected:", submissions);
    setSelectedSubmissions(submissions);
  };

  return (
    <div className="flex w-full min-h-screen bg-gray-100">
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
                className={`flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-600 ${
                  getActiveSidebarItem() === 'dashboard' ? 'bg-gray-100 font-medium' : ''
                }`}
              >
                <FaChartBar className="h-5 w-5 mr-3" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/view-hackathons" 
                className={`flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-600 ${
                  getActiveSidebarItem() === 'hackathons' ? 'bg-gray-100 font-medium' : ''
                }`}
              >
                <FaLaptopCode className="h-5 w-5 mr-3" />
                <span>View Hackathons</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/teacher/dashboard" 
                className={`flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-600 ${
                  getActiveSidebarItem() === 'parameters' ? 'bg-gray-100 font-medium' : ''
                }`}
              >
                <FaCogs className="h-5 w-5 mr-3" />
                <span>Set Parameters</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/teacher/submissions" 
                className={`flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-900 font-semibold ${
                  getActiveSidebarItem() === 'submissions' ? 'bg-gray-100' : ''
                }`}
              >
                <FaClipboardList className="h-5 w-5 mr-3" />
                <span>View Submissions</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/teacher/dashboard" 
                className={`flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-600 ${
                  getActiveSidebarItem() === 'shortlist' ? 'bg-gray-100 font-medium' : ''
                }`}
              >
                <FaTrophy className="h-5 w-5 mr-3" />
                <span>View Shortlist</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/teacher/settings" 
                className={`flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-600 ${
                  getActiveSidebarItem() === 'settings' ? 'bg-gray-100 font-medium' : ''
                }`}
              >
                <FaUserCog className="h-5 w-5 mr-3" />
                <span>Settings</span>
              </Link>
            </li>
          </ul>
        </nav>
        {/* Logout Option - fixed at bottom */}
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
        {/* Header with back button and info icon */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 relative">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/teacher/hackathon')}
                className="mr-4 p-2 rounded-full hover:bg-gray-100 text-gray-600"
                aria-label="Back to submissions"
              >
                <FaArrowLeft className="text-xl" />
              </button>
                <div>
                  <h1 className="text-2xl font-bold mb-2">Evaluations</h1>
                  <p className="text-gray-600">{hackathon?.title || 'Hackathon'} Analysis</p>
                </div>
              </div>
            
            {/* Info Icon */}
            <div 
              className="relative"
              onMouseEnter={() => !detailsLocked && setShowInfoPanel(true)}
              onMouseLeave={() => !detailsLocked && setShowInfoPanel(false)}
            >
              <button 
                ref={btnRef}
                className={`p-2 rounded-full ${detailsLocked ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                onClick={() => setDetailsLocked(!detailsLocked)}
                aria-label="Hackathon Details"
              >
                <FaInfoCircle className="text-xl" />
              </button>
              
              {/* Info Panel */}
              {showInfoPanel && (
                <div 
                  ref={infoPanelRef}
                  className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl z-50 overflow-hidden"
                >
                  <div className="bg-gray-800 p-3 text-white flex justify-between items-center">
                    <h3 className="font-semibold">Hackathon Details</h3>
                    {detailsLocked && (
                      <button 
                        onClick={() => setDetailsLocked(false)}
                        className="text-white hover:text-gray-300"
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                  <div className="p-4 text-sm space-y-3">
                    <div>
                      <p className="font-semibold">Morgan Stanley Code To Give</p>
                      <p className="text-gray-600 text-xs">
                        Code To Give is an Annual Hackathon where students collaborate to build solutions for non-profits.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Start Date:</p>
                        <p className="font-medium">{hackathon?.startDate ? new Date(hackathon.startDate).toLocaleDateString() : 'March 20, 2025'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">End Date:</p>
                        <p className="font-medium">{hackathon?.endDate ? new Date(hackathon.endDate).toLocaleDateString() : 'March 27, 2025'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500">Submissions:</p>
                      <p className="font-medium">4</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500">Shortlisted:</p>
                      <p className="font-medium">2</p>
                    </div>
                    
                    <div>
                      <p className="font-semibold mb-1">Evaluation Criteria</p>
                      <ul className="list-disc pl-5 text-xs space-y-1">
                        <li>Impact</li>
                        <li>Implementation</li>
                        <li>Scalability</li>
                      </ul>
                    </div>
                    
                    <div>
                      <p className="font-semibold mb-1">Allowed Formats</p>
                      <div className="flex space-x-2 text-xs">
                        <span className="px-2 py-1 bg-gray-100 rounded">ZIP</span>
                        <span className="px-2 py-1 bg-gray-100 rounded">Video</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Parameters Bento Box */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* All Parameters */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">All Parameters</h2>
                {/* Refresh Parameters Button */}
                <button
                  onClick={fetchParameters}
                  className="flex items-center text-blue-600 hover:text-blue-800 focus:outline-none text-sm"
                >
                  <FaSync className="w-4 h-4 mr-1" />
                  Refresh Parameters
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Select parameters to include in your evaluation. Click a parameter to toggle it.
              </p>
              
              {/* Parameters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {isLoading ? (
                  <div className="col-span-2 text-center py-4">
                    <p>Loading parameters...</p>
                  </div>
                ) : error ? (
                  <div className="col-span-2 text-center py-4 text-red-600">
                    <p>{error}</p>
                  </div>
                ) : allParameters.length === 0 ? (
                  <div className="col-span-2 text-center py-4">
                    <p>No parameters available. Add your first parameter below.</p>
                  </div>
                ) : (
                  allParameters.map(param => (
                    <div 
                      key={param.id || param._id}
                      className={`${
                        param.selected ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                      } border p-4 rounded-lg cursor-pointer transition-all hover:shadow-md relative`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 
                          className={`font-bold ${param.selected ? 'text-blue-700' : 'text-gray-700'}`}
                          onClick={() => toggleParameter(param.id || param._id)}
                        >
                          {param.name}
                        </h3>
                        <div className="flex items-center">
                          <span 
                            className={`p-1 rounded-full ${param.selected ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'} mr-2 border ${param.selected ? 'border-blue-300' : 'border-gray-300'}`}
                            onClick={() => toggleParameter(param.id || param._id)}
                          >
                            {param.selected ? <FaCheck size={12} /> : <div className="w-3 h-3"></div>}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Are you sure you want to delete the parameter "${param.name}"?`)) {
                                handleDeleteParameter(param.id, param._id);
                              }
                            }}
                            className="p-1 text-red-500 hover:text-red-700 focus:outline-none"
                            aria-label="Delete parameter"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </div>
                      <div onClick={() => toggleParameter(param.id || param._id)}>
                        <p className="text-sm text-gray-600 mb-2">{param.description}</p>
                        <div className="flex items-center text-sm">
                          <FaWeight className="mr-1 text-gray-500" size={14} />
                          <span className="text-gray-700 font-medium">Weight: {(param.weight * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* Add Parameter Button/Form */}
              <div className="mb-6">
                {!showAddForm ? (
                  <button
                    onClick={() => {
                      // Reset the new parameter to defaults when showing the form
                      setNewParameter({
                        name: '',
                        description: '',
                        weight: 0.15,
                      });
                      setShowAddForm(true);
                    }}
                    className="flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
                  >
                    <FaPlus className="mr-2" />
                    Add Parameter
                  </button>
                ) : (
                  <div className="p-4 border rounded-lg bg-white">
                    <h3 className="font-bold text-lg mb-3">Add New Parameter</h3>
                    <form onSubmit={handleAddParameter}>
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Parameter Name</label>
                        <input
                          type="text"
                          name="name"
                          value={newParameter.name}
                          onChange={handleParameterInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., User Experience"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          name="description"
                          value={newParameter.description}
                          onChange={handleParameterInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Describe what this parameter evaluates..."
                          rows="2"
                          required
                        ></textarea>
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Initial Weight: {(newParameter.weight * 100).toFixed(0)}%
                        </label>
                        <input
                          type="range"
                          name="weight"
                          min="1" 
                          max="100"
                          defaultValue="15"
                          value={newParameter.weight * 100}
                          onChange={(e) => setNewParameter(prev => ({
                            ...prev,
                            weight: Number(e.target.value) / 100
                          }))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button 
                          type="button"
                          onClick={() => setShowAddForm(false)}
                          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleAddParameter}
                          type="submit" 
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                          Add Parameter
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
            
            {/* Selected Parameters */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Selected Parameters</h2>
              <p className="text-sm mb-4 flex items-center">
                <span className={`font-medium ${isWeightValid ? 'text-green-600' : 'text-orange-600'}`}>
                  Total weight: {(totalWeight * 100).toFixed(0)}% 
                </span>
                {!isWeightValid && (
                  <span className="ml-2 text-orange-600 text-xs">
                    (Should equal 100%)
                  </span>
                )}
              </p>
              {activeParameters.length === 0 ? (
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-gray-500 text-center">No parameters selected. Please select parameters from the left panel.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeParameters.map(param => (
                    <div key={param.id} className="border border-blue-200 bg-blue-50 p-3 rounded-lg flex flex-col h-20">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-blue-700 text-sm">{param.name}</h3>
                        <span className="text-xs font-bold">{(param.weight * 100).toFixed(0)}%</span>
                      </div>
                      
                      {/* Weight adjustment slider - centered vertically */}
                      <div className="flex items-center justify-center flex-grow">
                        <input
                          type="range"
                          min="1"
                          max="100"
                          value={param.weight * 100}
                          onChange={(e) => {
                            const newWeight = Number(e.target.value) / 100;
                            setAllParameters(prev => prev.map(p => 
                              p.id === param.id ? { ...p, weight: newWeight } : p
                            ));
                          }}
                          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </div>
                    </div>
                  ))}
                  
                  {/* AI Evaluation Button */}
                  <div className="mt-4">
                    <button
                      onClick={handleAIEvaluation}
                      disabled={isEvaluating || !isWeightValid || !selectedSubmissions?.length}
                      className={`flex items-center justify-center w-full py-2 px-4 rounded-md text-white ${
                        isEvaluating || !isWeightValid || !selectedSubmissions?.length
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isEvaluating ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Evaluating...
                        </>
                      ) : (
                        <>
                          <FaRobot className="mr-2" />
                          Evaluate {selectedSubmissions?.length || 0} Submissions with AI
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {!selectedSubmissions?.length 
                      ? "Select submissions from the table below to evaluate" 
                      : `${selectedSubmissions.length} submissions selected for evaluation`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* BroadTable Component */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <BroadTable 
            ref={broadTableRef} 
            hackathonId={hackathon?._id}
            onSubmissionSelect={handleSubmissionsSelected} 
          />
        </div>

        {/* Evaluation Results Section - shows when results are available */}
        {evaluationResults && evaluationResults.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Evaluation Results</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submission</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Score</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {evaluationResults.map((result, index) => (
                    <tr key={result.submissionId} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.submissionId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.studentName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.error ? 'Error' : `${result.totalScore}/100`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.error ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Failed</span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Success</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DetailedAnalysis;
