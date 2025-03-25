import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaChartBar, FaLaptopCode, FaCogs, FaClipboardList, FaTrophy, FaUserCog, FaArrowLeft, 
         FaWeight, FaPercentage, FaCheck, FaPlus, FaMinus, FaInfoCircle, FaTimes } from 'react-icons/fa';
import BroadTable from "../components/BroadTable.jsx";
import { logoutAPI } from '../utils/api.jsx';

const DetailedAnalysis = () => {
  const navigate = useNavigate();
  const hackathon = useSelector((state) => state.hackathon.selectedHackathon);
  
  // Info panel state
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const infoPanelRef = useRef(null);
  const btnRef = useRef(null);
  const [detailsLocked, setDetailsLocked] = useState(false);
  
  // Parameter states
  const [allParameters, setAllParameters] = useState([
    { id: 1, name: 'Code Quality', description: 'Evaluates how well-structured and clean the code is', weight: 0.25, enabled: true },
    { id: 2, name: 'Innovation', description: 'How original and creative the solution is', weight: 0.20, enabled: true },
    { id: 3, name: 'Problem Solving', description: 'Effectiveness in addressing the hackathon challenge', weight: 0.25, enabled: true },
    { id: 4, name: 'UI/UX Design', description: 'Quality of user interface and experience', weight: 0.15, enabled: true },
    { id: 5, name: 'Documentation', description: 'Clarity and completeness of documentation', weight: 0.15, enabled: false },
    { id: 6, name: 'Scalability', description: 'Potential for the solution to scale', weight: 0.10, enabled: false },
    { id: 7, name: 'Technical Complexity', description: 'Level of technical challenge in implementation', weight: 0.15, enabled: true },
    { id: 8, name: 'Completeness', description: 'How fully implemented the solution is', weight: 0.20, enabled: false }
  ]);
  
  // New parameter form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newParameter, setNewParameter] = useState({
    name: '',
    description: '',
    weight: 0.15,
    enabled: true
  });
  
  // Get active sidebar item
  const getActiveSidebarItem = () => {
    return 'submissions'; // This page is part of the submissions flow
  };
  
  // Get active parameters (enabled)
  const activeParameters = allParameters.filter(param => param.enabled);
  
  // Calculate total weight of active parameters
  const totalWeight = activeParameters.reduce((acc, param) => acc + param.weight, 0);
  
  // Toggle parameter enabled status
  const toggleParameter = (id) => {
    setAllParameters(prev => prev.map(param => 
      param.id === id ? { ...param, enabled: !param.enabled } : param
    ));
  };

  // Adjust parameter weight
  const adjustWeight = (id, amount) => {
    setAllParameters(prev => prev.map(param => 
      param.id === id ? { ...param, weight: Math.max(0.01, Math.min(0.5, param.weight + amount)) } : param
    ));
  };
  
  // Handle parameter form input change
  const handleParameterInputChange = (e) => {
    const { name, value } = e.target;
    setNewParameter(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Add new parameter
  const handleAddParameter = (e) => {
    e.preventDefault();
    if (!newParameter.name || !newParameter.description) {
      alert('Please provide both name and description');
      return;
    }
    
    const newId = Math.max(...allParameters.map(p => p.id), 0) + 1;
    setAllParameters(prev => [
      ...prev,
      {
        ...newParameter,
        id: newId
      }
    ]);
    
    // Reset form
    setNewParameter({
      name: '',
      description: '',
      weight: 0.15,
      enabled: true
    });
    setShowAddForm(false);
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
              <h2 className="text-xl font-bold mb-4 text-gray-800">All Parameters</h2>
              <p className="text-sm text-gray-600 mb-4">
                Select parameters to include in your evaluation. Click a parameter to toggle it.
              </p>
              
              {/* Parameters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {allParameters.map(param => (
                  <div 
                    key={param.id}
                    onClick={() => toggleParameter(param.id)}
                    className={`${
                      param.enabled ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                    } border p-4 rounded-lg cursor-pointer transition-all hover:shadow-md`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`font-bold ${param.enabled ? 'text-blue-700' : 'text-gray-700'}`}>
                        {param.name}
                      </h3>
                      <span className={`p-1 rounded-full ${param.enabled ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                        {param.enabled ? <FaCheck size={12} /> : ''}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{param.description}</p>
                    <div className="flex items-center text-sm">
                      <FaWeight className="mr-1 text-gray-500" size={14} />
                      <span className="text-gray-700 font-medium">Weight: {(param.weight * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Add Parameter Button/Form */}
              {!showAddForm ? (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center justify-center w-full p-3 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <FaPlus className="mr-2" size={14} />
                  <span>Add New Parameter</span>
                </button>
              ) : (
                <div className="border border-gray-300 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-800 mb-3">Add New Parameter</h3>
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
                        max="50"
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
                        type="submit"
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Add Parameter
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
            
            {/* Selected Parameters */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Selected Parameters</h2>
              <p className="text-sm mb-4 flex items-center">
                <span className={`font-medium ${Math.abs(totalWeight * 100 - 100) > 1 ? 'text-red-600' : 'text-gray-600'}`}>
                  Total weight: {(totalWeight * 100).toFixed(0)}%
                </span>
                {Math.abs(totalWeight * 100 - 100) > 1 && (
                  <span className="ml-2 text-red-600 text-xs">
                    (Should equal 100%)
                  </span>
                )}
              </p>
              {activeParameters.length === 0 ? (
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-gray-500 text-center">No parameters selected. Please select parameters from the left panel.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeParameters.map(param => (
                    <div key={param.id} className="border border-blue-200 bg-blue-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-blue-700">{param.name}</h3>
                        <span className="text-sm font-bold">{(param.weight * 100).toFixed(0)}%</span>
                      </div>
                      
                      {/* Weight adjustment slider - smooth without steps */}
                      <div className="mt-2">
                        <input
                          type="range"
                          min="1"
                          max="50"
                          value={param.weight * 100}
                          onChange={(e) => {
                            const newWeight = Number(e.target.value) / 100;
                            setAllParameters(prev => prev.map(p => 
                              p.id === param.id ? { ...p, weight: newWeight } : p
                            ));
                          }}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </div>
                      
                      {/* Plus/minus buttons for fine adjustment */}
                      <div className="flex justify-end mt-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            adjustWeight(param.id, -0.01);
                          }}
                          className="p-1 bg-gray-200 rounded-full hover:bg-gray-300 mr-2"
                        >
                          <FaMinus size={10} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            adjustWeight(param.id, 0.01);
                          }}
                          className="p-1 bg-gray-200 rounded-full hover:bg-gray-300"
                        >
                          <FaPlus size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* BroadTable Component */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <BroadTable />
        </div>
      </main>
    </div>
  );
};

export default DetailedAnalysis;
