import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaChartBar, FaLaptopCode, FaCogs, FaClipboardList, FaTrophy, FaUserCog, FaFilter, FaSort, FaSortUp, FaSortDown, FaChevronDown, FaChevronRight, FaSearch, FaEye, FaInfoCircle, FaTimes, FaCheck, FaTimesCircle, FaArrowLeft, FaAngleDown } from 'react-icons/fa';
import { getHackathonSubmissionsAPI, logoutAPI } from '../utils/api.jsx';

function TeacherHackathonPage() {
  const navigate = useNavigate();
  const hackathon = useSelector((state) => state.hackathon.selectedHackathon);
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [detailsLocked, setDetailsLocked] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ field: 'displayId', direction: 'asc' });
  const [filterConfig, setFilterConfig] = useState({
    filterType: 'all', // 'all', 'shortlisted', 'reviewed', 'not_reviewed'
    searchQuery: '',
    selectedStatus: 'All Submissions'
  });
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterMenuRef = useRef(null);
  const detailsRef = useRef(null);
  const btnRef = useRef(null);
  
  const submissionsPerPage = 10;
  
  useEffect(() => {
    if (hackathon && hackathon._id) {
      fetchSubmissions();
    } else {
      // Redirect to submissions page if no hackathon is selected
      navigate('/teacher/submissions');
    }
  }, [hackathon]);
  
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await getHackathonSubmissionsAPI(hackathon._id);
      const submissionData = Array.isArray(response) ? response : 
                            (response && response.data ? response.data : []);
      
      // Add index numbers to submissions for display
      const indexedSubmissions = submissionData.map((sub, index) => ({
        ...sub,
        displayId: `SUB${String(index + 1).padStart(3, '0')}`
      }));
      
      setSubmissions(indexedSubmissions);
      setFilteredSubmissions(indexedSubmissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    applyFiltersAndSort();
  }, [submissions, filterConfig, sortConfig]);
  
  const applyFiltersAndSort = () => {
    let result = [...submissions];
    
    // Apply combined filter
    if (filterConfig.filterType === 'shortlisted') {
      result = result.filter(sub => sub.status === 'Shortlisted');
    } else if (filterConfig.filterType === 'reviewed') {
      result = result.filter(sub => sub.reviewed === true);
    } else if (filterConfig.filterType === 'not_reviewed') {
      result = result.filter(sub => sub.reviewed !== true);
    }
    
    // Apply search filter
    if (filterConfig.searchQuery) {
      const query = filterConfig.searchQuery.toLowerCase();
      result = result.filter(sub => 
        (sub.displayId && sub.displayId.toLowerCase().includes(query)) ||
        (sub.studentId && sub.studentId.name && sub.studentId.name.toLowerCase().includes(query)) ||
        (sub.description && sub.description.toLowerCase().includes(query))
      );
    }
    
    // Apply sort
    if (sortConfig.field) {
      result.sort((a, b) => {
        let valueA, valueB;
        
        // Handle nested properties
        if (sortConfig.field === 'studentName') {
          valueA = a.studentId?.name || '';
          valueB = b.studentId?.name || '';
        } else if (sortConfig.field === 'totalAIScore') {
          valueA = a.totalAIScore || 0;
          valueB = b.totalAIScore || 0;
        } else if (sortConfig.field === 'totalScore') {
          valueA = a.totalScore || 0;
          valueB = b.totalScore || 0;
        } else {
          valueA = a[sortConfig.field] || '';
          valueB = b[sortConfig.field] || '';
        }
        
        // Compare values
        if (typeof valueA === 'string') {
          if (sortConfig.direction === 'asc') {
            return valueA.localeCompare(valueB);
          } else {
            return valueB.localeCompare(valueA);
          }
        } else {
          if (sortConfig.direction === 'asc') {
            return valueA - valueB;
          } else {
            return valueB - valueA;
          }
        }
      });
    }
    
    setFilteredSubmissions(result);
  };
  
  const handleSort = (field) => {
    setSortConfig(prevConfig => ({
      field,
      direction: prevConfig.field === field && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  const handleFilterChange = (filterType) => {
    setFilterConfig(prev => ({
      ...prev,
      filterType
    }));
    setCurrentPage(1); // Reset to first page
    setShowFilterMenu(false);
  };
  
  const handleSearch = (e) => {
    setFilterConfig(prev => ({
      ...prev,
      searchQuery: e.target.value
    }));
    setCurrentPage(1); // Reset to first page
  };
  
  const handleViewSubmission = (submissionId) => {
    navigate(`/teacher/individualSubmission?submissionId=${submissionId}`);
  };
  
  // Pagination logic
  const indexOfLastSubmission = currentPage * submissionsPerPage;
  const indexOfFirstSubmission = indexOfLastSubmission - submissionsPerPage;
  const currentSubmissions = filteredSubmissions.slice(indexOfFirstSubmission, indexOfLastSubmission);
  const totalPages = Math.ceil(filteredSubmissions.length / submissionsPerPage);
  
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleLogout = () => {
    logoutAPI().then(() => {
      window.location.href = "/";
    });
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Get sort icon based on current sort configuration
  const getSortIcon = (field) => {
    if (sortConfig.field !== field) return <FaSort />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  // Handle hover events for the details panel
  const handleMouseEnter = () => {
    if (!detailsLocked) {
      setShowDetails(true);
    }
  };
  
  const handleMouseLeave = () => {
    if (!detailsLocked) {
      setShowDetails(false);
    }
  };
  
  // Handle click events for the details panel
  const handleDetailsClick = (e) => {
    e.stopPropagation();
    setDetailsLocked(!detailsLocked);
    setShowDetails(!detailsLocked);
  };
  
  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (detailsLocked && 
          detailsRef.current && 
          !detailsRef.current.contains(event.target) &&
          btnRef.current && 
          !btnRef.current.contains(event.target)) {
        setDetailsLocked(false);
        setShowDetails(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [detailsLocked]);

  // Close filter menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFilterMenu && 
          filterMenuRef.current && 
          !filterMenuRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterMenu]);

  // Get filter label
  const getFilterLabel = () => {
    switch(filterConfig.filterType) {
      case 'shortlisted':
        return 'Shortlisted Only';
      case 'reviewed':
        return 'Reviewed Only';
      case 'not_reviewed':
        return 'Not Reviewed';
      default:
        return 'All Submissions';
    }
  };

  const getActiveSidebarItem = () => {
    return 'submissions'; // Always return 'submissions' since this page is part of the submissions flow
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
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 relative">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/teacher/submissions')}
                className="mr-4 p-2 rounded-full hover:bg-gray-100 text-gray-600"
                aria-label="Back to submissions"
              >
                <FaArrowLeft className="text-xl" />
              </button>
              <div>
                <h1 className="text-2xl font-bold mb-2">Submissions</h1>
                <p className="text-gray-600">{hackathon?.title} Submissions</p>
              </div>
            </div>
            <div 
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button 
                ref={btnRef}
                className={`p-2 rounded-full ${detailsLocked ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                onClick={handleDetailsClick}
                aria-label="Hackathon Details"
              >
                <FaInfoCircle className="text-xl" />
              </button>
              
              {/* Floating details panel */}
              {showDetails && (
                <div 
                  ref={detailsRef}
                  className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl z-50 overflow-hidden"
                >
                  <div className="bg-gray-800 p-3 text-white flex justify-between items-center">
                    <h3 className="font-semibold">Hackathon Details</h3>
                    {detailsLocked && (
                      <button 
                        onClick={handleDetailsClick}
                        className="text-white hover:text-gray-300"
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                  
                  <div className="p-4">
                    {hackathon ? (
                      <div className="space-y-4">
                        <h4 className="text-xl font-bold text-gray-900">{hackathon.title}</h4>
                        <p className="text-gray-700 text-sm">{hackathon.description}</p>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Start Date:</span>
                            <span className="font-medium">{formatDate(hackathon.startDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">End Date:</span>
                            <span className="font-medium">{formatDate(hackathon.endDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Submissions:</span>
                            <span className="font-medium">{filteredSubmissions.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Shortlisted:</span>
                            <span className="font-medium">
                              {filteredSubmissions.filter(s => s.status === 'Shortlisted').length}
                            </span>
                          </div>
                        </div>
                        
                        {hackathon.criteria && hackathon.criteria.length > 0 && (
                          <div>
                            <h5 className="font-semibold text-gray-900 mb-1">Evaluation Criteria</h5>
                            <ul className="list-disc pl-5 text-sm text-gray-700">
                              {hackathon.criteria.map((criterion, idx) => (
                                <li key={idx}>{criterion}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {hackathon.allowedFormats && hackathon.allowedFormats.length > 0 && (
                          <div>
                            <h5 className="font-semibold text-gray-900 mb-1">Allowed Formats</h5>
                            <div className="flex flex-wrap gap-1">
                              {hackathon.allowedFormats.map((format, idx) => (
                                <span key={idx} className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                                  {format}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="pt-2">
                          <button 
                            onClick={() => navigate('/teacher/detailedAnalysis')}
                            className="w-full px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 flex items-center justify-center"
                          >
                            <FaChartBar className="mr-2" />
                            View Analysis
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        No hackathon details available
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Submissions Table Section - Full width now */}
          <div className="w-full">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Controls and Filters */}
              <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Combined Filter Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowFilterMenu(!showFilterMenu)}
                      className="px-3 py-1.5 rounded-md flex items-center justify-between gap-2 text-sm border border-gray-300 bg-white hover:bg-gray-50 min-w-[180px]"
                    >
                      <div className="flex items-center">
                        <FaFilter className="mr-2 text-gray-500" />
                        <span>{getFilterLabel()}</span>
                      </div>
                      <FaAngleDown />
                    </button>
                    
                    {showFilterMenu && (
                      <div 
                        ref={filterMenuRef}
                        className="absolute left-0 top-full mt-1 w-64 bg-white rounded-md shadow-lg z-10 border border-gray-200 py-1"
                      >
                        <button
                          onClick={() => handleFilterChange('all')}
                          className={`w-full px-4 py-2 text-left text-sm flex items-center hover:bg-gray-100 ${
                            filterConfig.filterType === 'all' ? 'bg-gray-100 font-medium' : ''
                          }`}
                        >
                          All Submissions
                        </button>
                        <button
                          onClick={() => handleFilterChange('shortlisted')}
                          className={`w-full px-4 py-2 text-left text-sm flex items-center hover:bg-gray-100 ${
                            filterConfig.filterType === 'shortlisted' ? 'bg-gray-100 font-medium' : ''
                          }`}
                        >
                          <span className="flex-1">Shortlisted Only</span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {submissions.filter(s => s.status === 'Shortlisted').length}
                          </span>
                        </button>
                        <button
                          onClick={() => handleFilterChange('reviewed')}
                          className={`w-full px-4 py-2 text-left text-sm flex items-center hover:bg-gray-100 ${
                            filterConfig.filterType === 'reviewed' ? 'bg-gray-100 font-medium' : ''
                          }`}
                        >
                          <span className="flex-1">Reviewed Only</span>
                          <FaCheck className="text-green-600 mr-1" />
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                            {submissions.filter(s => s.reviewed === true).length}
                          </span>
                        </button>
                        <button
                          onClick={() => handleFilterChange('not_reviewed')}
                          className={`w-full px-4 py-2 text-left text-sm flex items-center hover:bg-gray-100 ${
                            filterConfig.filterType === 'not_reviewed' ? 'bg-gray-100 font-medium' : ''
                          }`}
                        >
                          <span className="flex-1">Not Reviewed</span>
                          <FaTimesCircle className="text-red-600 mr-1" />
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                            {submissions.filter(s => s.reviewed !== true).length}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Analytics Button */}
                  <button
                    onClick={() => navigate('/teacher/detailedAnalysis')}
                    className="px-3 py-1.5 bg-gray-800 text-white rounded-md hover:bg-gray-700 text-sm flex items-center"
                  >
                    <FaChartBar className="mr-2" />
                    Analysis & Evaluation
                  </button>
                </div>
                
                {/* Sort Controls */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <select 
                    value={sortConfig.field}
                    onChange={(e) => setSortConfig({...sortConfig, field: e.target.value})}
                    className="py-1.5 px-3 border rounded-md text-sm"
                  >
                    <option value="displayId">ID</option>
                    <option value="studentName">Name</option>
                    <option value="totalAIScore">AI Score</option>
                    <option value="totalScore">Manual Score</option>
                    <option value="submittedAt">Submission Date</option>
                  </select>
                  <button
                    onClick={() => setSortConfig({
                      ...sortConfig, 
                      direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
                    })}
                    className="p-1.5 rounded-md border border-gray-300 hover:bg-gray-100"
                  >
                    {sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />}
                  </button>
                </div>
                
                <div className="relative flex-grow max-w-xs">
                  <input
                    type="text"
                    placeholder="Search submissions..."
                    value={filterConfig.searchQuery}
                    onChange={handleSearch}
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>
              
              {/* Table */}
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <>
                    <table className="w-full border-collapse border border-gray-300 text-gray-800 text-sm">
                      <thead className="bg-gray-100 text-gray-700">
                        <tr>
                          <th className="p-3 border border-gray-300 cursor-pointer" onClick={() => handleSort('displayId')}>
                            <div className="flex items-center justify-center">
                              ID {getSortIcon('displayId')}
                            </div>
                          </th>
                          <th className="p-3 border border-gray-300 cursor-pointer" onClick={() => handleSort('studentName')}>
                            <div className="flex items-center">
                              Title {getSortIcon('studentName')}
                            </div>
                          </th>
                          <th className="p-3 border border-gray-300">
                            <div className="flex items-center justify-center">
                              Tags
                            </div>
                          </th>
                          <th className="p-3 border border-gray-300">
                            <div className="flex items-center justify-center">
                              Format
                            </div>
                          </th>
                          <th className="p-3 border border-gray-300">
                            <div className="flex items-center justify-center">
                              Overview
                            </div>
                          </th>
                          <th className="p-3 border border-gray-300 cursor-pointer" onClick={() => handleSort('totalAIScore')}>
                            <div className="flex items-center justify-center">
                              AI Score {getSortIcon('totalAIScore')}
                            </div>
                          </th>
                          <th className="p-3 border border-gray-300 cursor-pointer" onClick={() => handleSort('totalScore')}>
                            <div className="flex items-center justify-center">
                              Manual Score {getSortIcon('totalScore')}
                            </div>
                          </th>
                          <th className="p-3 border border-gray-300">
                            <div className="flex items-center justify-center">
                              Reviewed
                            </div>
                          </th>
                          <th className="p-3 border border-gray-300">
                            <div className="flex items-center justify-center">
                              Shortlist
                            </div>
                          </th>
                          <th className="p-3 border border-gray-300">
                            <div className="flex items-center justify-center">
                              Action
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentSubmissions.length > 0 ? (
                          currentSubmissions.map((submission, index) => (
                            <tr key={submission._id || index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                              <td className="p-3 border border-gray-300 text-center">{submission.displayId}</td>
                              <td className="p-3 border border-gray-300 hover:text-blue-700 font-medium">
                                {submission.studentId?.name || 'Unknown Student'}
                              </td>
                              <td className="p-3 border border-gray-300">
                                <div className="flex flex-wrap gap-1 justify-center">
                                  {submission.tags && submission.tags.length > 0 ? (
                                    submission.tags.map((tag, i) => (
                                      <span key={i} className="px-2 py-1 bg-gray-100 text-xs rounded-full">{tag}</span>
                                    ))
                                  ) : (
                                    <span className="text-gray-400 text-xs">No tags</span>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 border border-gray-300 text-center">
                                {submission.files && submission.files.length > 0 ? (
                                  <div>
                                    {submission.files[0].fileType === 'pdf' ? 'PDF' : 
                                     submission.files[0].fileType === 'video' ? 'Video' : 
                                     'GitHub Repository'}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">No files</span>
                                )}
                              </td>
                              <td className="p-3 border border-gray-300 text-center max-w-[200px] truncate">
                                {submission.description || 'No description'}
                              </td>
                              <td className="p-3 border border-gray-300 text-center">
                                <div className="flex justify-center items-center">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    (submission.totalAIScore >= 80) ? 'bg-green-100 text-green-800' :
                                    (submission.totalAIScore >= 60) ? 'bg-blue-100 text-blue-800' :
                                    (submission.totalAIScore >= 40) ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {submission.totalAIScore || '0'}/100
                                  </span>
                                </div>
                              </td>
                              <td className="p-3 border border-gray-300 text-center">
                                <div className="flex justify-center items-center">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    (submission.totalScore >= 80) ? 'bg-green-100 text-green-800' :
                                    (submission.totalScore >= 60) ? 'bg-blue-100 text-blue-800' :
                                    (submission.totalScore >= 40) ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {submission.totalScore || '0'}/100
                                  </span>
                                </div>
                              </td>
                              <td className="p-3 border border-gray-300 text-center">
                                {submission.reviewed ? (
                                  <span className="text-green-600">✓</span>
                                ) : (
                                  <span className="text-red-600">✗</span>
                                )}
                              </td>
                              <td className="p-3 border border-gray-300 text-center">
                                <input 
                                  type="checkbox" 
                                  checked={submission.status === 'Shortlisted'} 
                                  onChange={() => {
                                    // Handle shortlist status change
                                  }}
                                  className="h-4 w-4"
                                />
                              </td>
                              <td className="p-3 border border-gray-300 text-center">
                                <button
                                  onClick={() => handleViewSubmission(submission._id)}
                                  className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                  <FaEye />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="10" className="p-4 text-center text-gray-500">
                              No submissions found matching the current filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    
                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-4">
                      <button 
                        onClick={prevPage} 
                        disabled={currentPage === 1} 
                        className="px-3 py-1 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="text-gray-600">
                        Page {currentPage} of {totalPages || 1}
                      </span>
                      <button 
                        onClick={nextPage} 
                        disabled={currentPage >= totalPages} 
                        className="px-3 py-1 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TeacherHackathonPage;