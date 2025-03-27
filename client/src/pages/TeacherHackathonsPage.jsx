import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { HackathonByTeacherAPI, logoutAPI } from "../utils/api.jsx";
import { setHackathon } from "../slices/hackathonSlice.js";
import { FaChartBar, FaLaptopCode, FaCogs, FaClipboardList, FaTrophy, FaUserCog, FaChevronRight, FaRegClock, FaCalendarAlt, FaUsers, FaFilter, FaSort } from "react-icons/fa";
import toast from "react-hot-toast";

const TeacherHackathonsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const teacherId = useSelector((state) => state.student.studentId);
  const [assignedHackathons, setAssignedHackathons] = useState([]);
  const [displayedHackathons, setDisplayedHackathons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({
    field: 'title',
    direction: 'asc'
  });
  const [filterConfig, setFilterConfig] = useState({
    upcoming: true,
    active: true,
    completed: true
  });
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Format date function
  const formatDate = (isoString) => {
    if (!isoString) return "No date specified";
    return new Date(isoString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get hackathon status based on dates
  const getHackathonStatus = (hackathon) => {
    const now = new Date();
    const startDate = new Date(hackathon.startDate);
    const endDate = new Date(hackathon.endDate);

    if (now < startDate) {
      return { label: "Upcoming", className: "bg-blue-100 text-blue-700", type: "upcoming" };
    } else if (now > endDate) {
      return { label: "Completed", className: "bg-gray-100 text-gray-700", type: "completed" };
    } else {
      return { label: "Active", className: "bg-green-100 text-green-700", type: "active" };
    }
  };

  // Fetch hackathons assigned to this teacher
  useEffect(() => {
    setIsLoading(true);
    const fetchHackathons = async () => {
      try {
        const data = await HackathonByTeacherAPI(teacherId);
        if (data && Array.isArray(data)) {
          setAssignedHackathons(data);
          applyFiltersAndSort(data);
        } else {
          toast.error("Failed to load hackathons");
        }
      } catch (error) {
        console.error("Error fetching hackathons:", error);
        toast.error("An error occurred while fetching hackathons");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHackathons();
  }, [teacherId]);

  // Apply both filters and sorting
  const applyFiltersAndSort = (hackathons = assignedHackathons) => {
    let filtered = hackathons.filter(hackathon => {
      const status = getHackathonStatus(hackathon);
      if (status.type === 'upcoming' && !filterConfig.upcoming) return false;
      if (status.type === 'active' && !filterConfig.active) return false;
      if (status.type === 'completed' && !filterConfig.completed) return false;
      return true;
    });

    const sorted = sortHackathons(filtered);
    setDisplayedHackathons(sorted);
  };

  // Handle review submissions button click
  const handleReviewSubmissions = (hackathon) => {
    dispatch(setHackathon(hackathon));
    navigate("/teacher/hackathon");
  };

  // Sorting logic
  const sortHackathons = (hackathons) => {
    const sorted = [...hackathons];
    sorted.sort((a, b) => {
      if (sortConfig.field === 'title') {
        return sortConfig.direction === 'asc' 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (sortConfig.field === 'startDate') {
        return sortConfig.direction === 'asc'
          ? new Date(a.startDate) - new Date(b.startDate)
          : new Date(b.startDate) - new Date(a.startDate);
      } else if (sortConfig.field === 'endDate') {
        return sortConfig.direction === 'asc'
          ? new Date(a.endDate) - new Date(b.endDate)
          : new Date(b.endDate) - new Date(a.endDate);
      } else if (sortConfig.field === 'status') {
        const statusOrder = { active: 0, upcoming: 1, completed: 2 };
        const statusA = getHackathonStatus(a).type;
        const statusB = getHackathonStatus(b).type;
        return sortConfig.direction === 'asc'
          ? statusOrder[statusA] - statusOrder[statusB]
          : statusOrder[statusB] - statusOrder[statusA];
      }
      return 0;
    });
    return sorted;
  };

  // Handle sort button click
  const handleSort = (field) => {
    setSortConfig(prevConfig => {
      const newDirection = 
        prevConfig.field === field && prevConfig.direction === 'asc' 
          ? 'desc' 
          : 'asc';
      
      const newConfig = { field, direction: newDirection };
      
      // Re-sort with new config
      setDisplayedHackathons(sortHackathons(displayedHackathons));
      
      return newConfig;
    });
  };

  // Handle filter checkbox change
  const handleFilterChange = (filterType) => {
    setFilterConfig(prev => {
      const newConfig = {
        ...prev,
        [filterType]: !prev[filterType]
      };
      
      // Apply updated filters
      applyFiltersAndSort();
      
      return newConfig;
    });
  };

  // Effect to apply filters and sorting when configs change
  useEffect(() => {
    applyFiltersAndSort();
  }, [sortConfig, filterConfig]);

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
                className="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-600"
              >
                <FaChartBar className="h-5 w-5 mr-3" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/view-hackathons" 
                className="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-900 font-semibold"
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
                className="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-600"
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
        {/* Logout Button */}
        <div className="mt-auto mb-6 px-4">
          <a
            href="#"
            className="flex items-center p-2 rounded-md text-red-600 hover:bg-red-50 w-full"
            onClick={() => {
              logoutAPI().then(() => {
                window.location.href = "/";
              });
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h1 className="text-2xl font-bold mb-2">My Assigned Hackathons</h1>
          <p className="text-gray-600">View and manage hackathons assigned to you</p>
        </div>

        {/* Filter and Sort Controls */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-wrap items-center justify-between">
            {/* Filter */}
            <div className="relative mb-2 md:mb-0">
              <button 
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                <FaFilter className="mr-2" />
                <span>Filter</span>
              </button>
              
              {showFilterDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-md z-10 w-48 p-2">
                  <div className="p-2 border-b">
                    <h3 className="font-medium text-sm">Status</h3>
                  </div>
                  <div className="p-2 space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={filterConfig.active} 
                        onChange={() => handleFilterChange('active')}
                        className="rounded text-black focus:ring-black"
                      />
                      <span className="flex items-center">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                        Active
                      </span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={filterConfig.upcoming} 
                        onChange={() => handleFilterChange('upcoming')}
                        className="rounded text-black focus:ring-black"
                      />
                      <span className="flex items-center">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                        Upcoming
                      </span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={filterConfig.completed} 
                        onChange={() => handleFilterChange('completed')}
                        className="rounded text-black focus:ring-black"
                      />
                      <span className="flex items-center">
                        <span className="inline-block w-2 h-2 rounded-full bg-gray-500 mr-2"></span>
                        Completed
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-700 mr-2">Sort by:</span>
              <button 
                onClick={() => handleSort('title')}
                className={`px-3 py-1 rounded text-sm ${sortConfig.field === 'title' ? 'bg-black text-white' : 'bg-gray-100'}`}
              >
                Name {sortConfig.field === 'title' && (
                  sortConfig.direction === 'asc' ? '↑' : '↓'
                )}
              </button>
              <button 
                onClick={() => handleSort('startDate')}
                className={`px-3 py-1 rounded text-sm ${sortConfig.field === 'startDate' ? 'bg-black text-white' : 'bg-gray-100'}`}
              >
                Start Date {sortConfig.field === 'startDate' && (
                  sortConfig.direction === 'asc' ? '↑' : '↓'
                )}
              </button>
              <button 
                onClick={() => handleSort('status')}
                className={`px-3 py-1 rounded text-sm ${sortConfig.field === 'status' ? 'bg-black text-white' : 'bg-gray-100'}`}
              >
                Status {sortConfig.field === 'status' && (
                  sortConfig.direction === 'asc' ? '↑' : '↓'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Hackathon Cards */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
          </div>
        ) : displayedHackathons.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-lg text-gray-500">No hackathons found based on current filters</p>
            <button 
              onClick={() => {
                setFilterConfig({ upcoming: true, active: true, completed: true });
              }}
              className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedHackathons.map((hackathon) => {
              const status = getHackathonStatus(hackathon);
              return (
                <div key={hackathon._id} className="bg-white rounded-lg shadow overflow-hidden">
                  {/* Hackathon Image */}
                  <div className="h-40 bg-gray-200 relative">
                    {hackathon.image ? (
                      <img src={hackathon.image} alt={hackathon.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
                        <h3 className="text-xl font-bold text-white">
                          {hackathon.title.substring(0, 30)}
                          {hackathon.title.length > 30 ? "..." : ""}
                        </h3>
                      </div>
                    )}
                    {/* Status Badge - now absolute positioned in the top right */}
                    <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${status.className}`}>
                      {status.label}
                    </span>
                  </div>

                  {/* Hackathon Details */}
                  <div className="p-4">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-bold mr-2">
                        {hackathon.title.substring(0, 30)}
                        {hackathon.title.length > 30 ? "..." : ""}
                      </h3>
                      {/* Status Icon next to hackathon name */}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${status.className}`}>
                        <FaRegClock className="mr-1" />
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <FaCalendarAlt className="mr-2 text-gray-400" />
                        <span>Start: {formatDate(hackathon.startDate)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <FaCalendarAlt className="mr-2 text-gray-400" />
                        <span>End: {formatDate(hackathon.endDate)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <FaUsers className="mr-2 text-gray-400" />
                        <span>{hackathon.registeredStudents?.length || 0} Students</span>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2">
                      <Link
                        to={`/teacher/hackathon/${hackathon._id}/details`}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        onClick={() => {
                          dispatch(setHackathon(hackathon));
                        }}
                      >
                        View Details
                        <FaChevronRight className="ml-1.5 h-3 w-3" />
                      </Link>
                      <button 
                        onClick={() => handleReviewSubmissions(hackathon)}
                        className="flex-1 py-2 px-3 bg-black text-white rounded hover:bg-gray-800 transition-colors text-sm font-medium"
                      >
                        Review Submissions
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default TeacherHackathonsPage;
