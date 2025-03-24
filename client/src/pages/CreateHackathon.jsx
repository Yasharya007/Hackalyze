import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createHackathonAPI, getHackathonByIdAPI, updateHackathonAPI } from "../utils/api.jsx";
import toast from "react-hot-toast";

const CreateHackathon = () => {
  const { id } = useParams(); // Get hackathon ID from URL if in edit mode
  const isEditMode = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [teachers, setTeachers] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    criteria: [],
    selectedCriteria: [],
    allowedFormats: [],
    teachersAssigned: []
  });
  
  // For handling criteria input
  const [criteriaInput, setCriteriaInput] = useState("");
  
  // Format options based on the model schema
  const formatOptions = ["Audio", "Video", "File", "Image"];
  
  // Fetch hackathon data when in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchHackathonData = async () => {
        try {
          setFetching(true);
          const response = await getHackathonByIdAPI(id);
          const hackathon = response.hackathon;
          
          // Format dates for the form (YYYY-MM-DD)
          const formatDate = (dateString) => {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
          };
          
          setFormData({
            title: hackathon.title || "",
            description: hackathon.description || "",
            startDate: formatDate(hackathon.startDate),
            endDate: formatDate(hackathon.endDate),
            startTime: hackathon.startTime || "",
            endTime: hackathon.endTime || "",
            criteria: hackathon.criteria || [],
            selectedCriteria: hackathon.selectedCriteria || [],
            allowedFormats: hackathon.allowedFormats || [],
            teachersAssigned: hackathon.teachersAssigned?.map(teacher => 
              typeof teacher === 'object' ? teacher._id : teacher
            ) || []
          });
        } catch (error) {
          console.error("Error fetching hackathon:", error);
          toast.error("Could not load hackathon data for editing");
        } finally {
          setFetching(false);
        }
      };
      
      fetchHackathonData();
    }
  }, [id, isEditMode]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle array inputs (criteria, formats, teachers)
  const handleArrayChange = (e) => {
    const { name, options } = e.target;
    const selectedValues = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);
    
    setFormData({
      ...formData,
      [name]: selectedValues
    });
  };
  
  // Add a new criteria to the list
  const handleAddCriteria = () => {
    if (criteriaInput.trim() === "") return;
    
    setFormData({
      ...formData,
      criteria: [...formData.criteria, criteriaInput]
    });
    setCriteriaInput("");
  };
  
  // Remove a criteria from the list
  const handleRemoveCriteria = (index) => {
    const updatedCriteria = [...formData.criteria];
    updatedCriteria.splice(index, 1);
    
    // Also remove from selectedCriteria if it was selected
    const removedCriteria = formData.criteria[index];
    const updatedSelectedCriteria = formData.selectedCriteria.filter(
      criteria => criteria !== removedCriteria
    );
    
    setFormData({
      ...formData,
      criteria: updatedCriteria,
      selectedCriteria: updatedSelectedCriteria
    });
  };
  
  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.title || !formData.description || !formData.startDate || !formData.endDate || 
        !formData.startTime || !formData.endTime || formData.criteria.length === 0 || 
        formData.selectedCriteria.length === 0 || formData.allowedFormats.length === 0) {
      toast.error("Please fill all required fields");
      return;
    }
    
    // Ensure selectedCriteria is a subset of criteria
    const validSelectedCriteria = formData.selectedCriteria.filter(
      criteria => formData.criteria.includes(criteria)
    );
    
    const hackathonData = {
      ...formData,
      selectedCriteria: validSelectedCriteria,
      // Admin ID will be set by the backend based on the authenticated user
    };
    
    try {
      setLoading(true);
      
      if (isEditMode) {
        // Update existing hackathon
        await updateHackathonAPI(id, hackathonData);
      } else {
        // Create new hackathon
        await createHackathonAPI(hackathonData);
      }
      
      navigate("/admin/dashboard"); // Redirect to dashboard on success
    } catch (error) {
      console.error("Error saving hackathon:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch teachers for assignment dropdown
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/admin/hackathon/teachers");
        const data = await response.json();
        setTeachers(data || []);
      } catch (error) {
        console.error("Error fetching teachers:", error);
        toast.error("Failed to load teachers");
      }
    };
    
    fetchTeachers();
  }, []);
  
  // Show loading state while fetching data in edit mode
  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading hackathon data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {isEditMode ? "Edit Hackathon" : "Create New Hackathon"}
          </h1>
          <button 
            onClick={() => navigate("/admin/dashboard")}
            className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
          >
            Back to Dashboard
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hackathon Title*
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date*
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time*
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date*
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time*
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description*
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              ></textarea>
            </div>
          </div>
          
          {/* Criteria */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Evaluation Criteria</h2>
            
            <div className="flex mb-4">
              <input
                type="text"
                value={criteriaInput}
                onChange={(e) => setCriteriaInput(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md"
                placeholder="Add evaluation criteria"
              />
              <button
                type="button"
                onClick={handleAddCriteria}
                className="bg-black text-white px-4 py-2 rounded-r-md"
              >
                Add
              </button>
            </div>
            
            {formData.criteria.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Added Criteria:
                </label>
                <ul className="bg-gray-50 border border-gray-300 rounded-md p-3">
                  {formData.criteria.map((criteria, index) => (
                    <li key={index} className="flex justify-between items-center mb-2">
                      <span>{criteria}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCriteria(index)}
                        className="text-red-600"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selected Criteria for Evaluation*
              </label>
              <select
                name="selectedCriteria"
                multiple
                value={formData.selectedCriteria}
                onChange={handleArrayChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md h-32"
                required
              >
                {formData.criteria.map((criteria, index) => (
                  <option key={index} value={criteria}>
                    {criteria}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Hold Ctrl (or Cmd on Mac) to select multiple criteria
              </p>
            </div>
          </div>
          
          {/* Submission Formats */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Submission Settings</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allowed Submission Formats*
              </label>
              <select
                name="allowedFormats"
                multiple
                value={formData.allowedFormats}
                onChange={handleArrayChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md h-24"
                required
              >
                {formatOptions.map((format, index) => (
                  <option key={index} value={format}>
                    {format}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Hold Ctrl (or Cmd on Mac) to select multiple formats
              </p>
            </div>
          </div>
          
          {/* Teacher Assignments */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Teacher Assignments</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign Teachers
              </label>
              <select
                name="teachersAssigned"
                multiple
                value={formData.teachersAssigned}
                onChange={handleArrayChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md h-32"
              >
                {teachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.name} ({teacher.email})
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Hold Ctrl (or Cmd on Mac) to select multiple teachers
              </p>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-md ${
                loading ? "bg-gray-400" : "bg-black hover:bg-gray-800"
              } text-white`}
            >
              {loading 
                ? (isEditMode ? "Updating..." : "Creating...") 
                : (isEditMode ? "Update Hackathon" : "Create Hackathon")
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateHackathon;
