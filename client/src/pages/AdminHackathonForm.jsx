import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const AdminHackathonForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formMode, setFormMode] = useState(id ? "edit" : "create");
  const [error, setError] = useState("");
  const [teachers, setTeachers] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    submissionDeadline: "",
    allowedFormats: [],
    teachersAssigned: []
  });

  // Media format options
  const mediaOptions = [
    { value: "PDF", label: "PDF" },
    { value: "Video", label: "Video" },
    { value: "Image", label: "Image" },
    { value: "Audio", label: "Audio" },
    { value: "GitHub Repository", label: "GitHub Repository" },
    { value: "Website URL", label: "Website URL" }
  ];

  useEffect(() => {
    // Fetch teachers list for assignment
    const fetchTeachers = async () => {
      try {
        // In a production app, this would be a real API call
        // const response = await axios.get("/api/admin/teachers");
        // setTeachers(response.data);
        
        // Mock data
        setTeachers([
          { id: 1, name: "Teacher 1", expertise: ["Machine Learning", "Data Science"] },
          { id: 2, name: "Teacher 2", expertise: ["Computer Vision", "Neural Networks"] },
          { id: 3, name: "Teacher 3", expertise: ["Web Development", "UI/UX"] },
          { id: 4, name: "Teacher 4", expertise: ["Blockchain", "Cryptography"] }
        ]);
      } catch (error) {
        console.error("Error fetching teachers:", error);
        setError("Failed to load teachers. Please try again.");
      }
    };

    fetchTeachers();

    // If we're in edit mode, fetch the existing hackathon data
    if (formMode === "edit" && id) {
      fetchHackathonDetails();
    }
  }, [formMode, id]);

  const fetchHackathonDetails = async () => {
    try {
      setLoading(true);
      // In a production app, this would be a real API call
      // const response = await axios.get(`/api/admin/hackathon/${id}`);
      // setFormData({
      //   ...response.data,
      //   submissionDeadline: response.data.submissionDeadline.split("T")[0]
      // });
      
      // Mock data for demonstration
      setTimeout(() => {
        setFormData({
          title: "AI Innovation Challenge",
          description: "Create innovative AI solutions for real-world problems. Participants will work in teams to develop AI-powered applications that address real-world challenges. The hackathon will focus on machine learning, natural language processing, and computer vision.",
          startDate: "2023-06-01",
          endDate: "2023-06-30",
          submissionDeadline: "2023-07-01",
          allowedFormats: ["PDF", "Video", "GitHub Repository"],
          teachersAssigned: [1, 2]
        });
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error("Error fetching hackathon details:", error);
      setError("Failed to load hackathon details. Please try again.");
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormatChange = (format) => {
    if (formData.allowedFormats.includes(format)) {
      setFormData({
        ...formData,
        allowedFormats: formData.allowedFormats.filter(f => f !== format)
      });
    } else {
      setFormData({
        ...formData,
        allowedFormats: [...formData.allowedFormats, format]
      });
    }
  };

  const handleTeacherChange = (teacherId) => {
    if (formData.teachersAssigned.includes(teacherId)) {
      setFormData({
        ...formData,
        teachersAssigned: formData.teachersAssigned.filter(id => id !== teacherId)
      });
    } else {
      setFormData({
        ...formData,
        teachersAssigned: [...formData.teachersAssigned, teacherId]
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.description || !formData.startDate || 
        !formData.endDate || !formData.submissionDeadline || 
        formData.allowedFormats.length === 0) {
      setError("Please fill in all required fields and select at least one media format.");
      return;
    }

    try {
      setSubmitting(true);
      
      if (formMode === "create") {
        // In a production app, this would be a real API call
        // await axios.post("/api/admin/hackathons", formData);
        
        // Simulate successful API call
        console.log("Creating hackathon with data:", formData);
        setTimeout(() => {
          setSubmitting(false);
          navigate("/admin/dashboard");
        }, 1000);
      } else {
        // In a production app, this would be a real API call
        // await axios.put(`/api/admin/hackathons/${id}`, formData);
        
        // Simulate successful API call
        console.log("Updating hackathon with data:", formData);
        setTimeout(() => {
          setSubmitting(false);
          navigate(`/admin/hackathon/${id}`);
        }, 1000);
      }
    } catch (error) {
      console.error("Error submitting hackathon:", error);
      setError("Failed to save hackathon. Please try again.");
      setSubmitting(false);
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
    <div className="flex w-full h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white p-5 border-r">
        <div className="flex items-center mb-6">
          <img src="/logo.png" alt="Hackalyze Logo" className="h-8 mr-2" />
          <h2 className="text-xl font-bold ml-2">Hackalyze</h2>
        </div>
        <nav>
          <ul className="space-y-2">
            <li className="py-2">
              <a href="/admin/dashboard" className="flex items-center text-gray-700">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
                Dashboard
              </a>
            </li>
            <li className="py-2">
              <a href="/admin/create-hackathon" className="flex items-center text-gray-700 font-semibold">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Create New Hackathon
              </a>
            </li>
            <li className="py-2">
              <a href="/admin/view-hackathons" className="flex items-center text-gray-700">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
                View Hackathons
              </a>
            </li>
            <li className="py-2">
              <a href="/admin/settings" className="flex items-center text-gray-700">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Settings
              </a>
            </li>
          </ul>
        </nav>
        <div className="absolute bottom-5 w-52">
          <a href="/logout" className="flex items-center text-gray-700 py-2">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            Logout
          </a>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{formMode === "create" ? "Create New Hackathon" : "Edit Hackathon"}</h1>
          <button 
            onClick={() => navigate(-1)}
            className="text-gray-700 bg-white border border-gray-300 px-3 py-1 rounded-lg flex items-center text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">{error}</span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError("")}>
              <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
              </svg>
            </span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Hackathon Title*</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            {/* Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date*</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date*</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Description */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            ></textarea>
          </div>
          
          {/* Submission Deadline */}
          <div className="mb-6">
            <label htmlFor="submissionDeadline" className="block text-sm font-medium text-gray-700 mb-1">Submission Deadline*</label>
            <input
              type="date"
              id="submissionDeadline"
              name="submissionDeadline"
              value={formData.submissionDeadline}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent md:w-1/3"
              required
            />
          </div>
          
          {/* Allowed Formats */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Accepted Media Formats*</label>
            <div className="flex flex-wrap gap-2">
              {mediaOptions.map(option => (
                <div 
                  key={option.value}
                  onClick={() => handleFormatChange(option.value)}
                  className={`px-3 py-2 rounded-lg text-sm cursor-pointer flex items-center ${
                    formData.allowedFormats.includes(option.value) 
                      ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                      : 'bg-gray-100 text-gray-700 border border-gray-300'
                  }`}
                >
                  {formData.allowedFormats.includes(option.value) && (
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  )}
                  {option.label}
                </div>
              ))}
            </div>
          </div>
          
          {/* Assign Teachers */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Assign Teachers</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teachers.map(teacher => (
                <div 
                  key={teacher.id}
                  onClick={() => handleTeacherChange(teacher.id)}
                  className={`p-3 rounded-lg border cursor-pointer ${
                    formData.teachersAssigned.includes(teacher.id) 
                      ? 'bg-blue-50 border-blue-300' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium">{teacher.name}</h4>
                      <p className="text-xs text-gray-500">{teacher.expertise.join(", ")}</p>
                    </div>
                    {formData.teachersAssigned.includes(teacher.id) && (
                      <svg className="w-5 h-5 text-blue-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mr-4 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                formMode === "create" ? "Create Hackathon" : "Save Changes"
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AdminHackathonForm;
