import API from "./axios.jsx";
import toast from "react-hot-toast";
// Login API
export const loginAPI = async (email, password) => {
  const toastId=toast.loading("loading...")
  try {
    const response = await API.post("/api/auth/login", { email, password});
    toast.success("Logged in Successfully");
    return response.data;
  } catch (error) {
    throw error.response?.data || "Login failed!";
  }finally{
    toast.dismiss(toastId);
  }
};

// Logout API
export const logoutAPI = async () => {
  try {
    await API.post("/api/auth/logout");
  } catch (error) {
    throw error.response?.data || "Logout failed!";
  }
};

// Student register
export const StudentRegisterAPI = async (formData) => {
    const toastId=toast.loading("loading...")
    try {
      const response = await API.post("/api/auth/registerStudent", formData);
      toast.success("Registered Successfully");
      return response.data;
    } catch (error) {
      throw error.response?.data || "Registration failed!";
    }finally{
      toast.dismiss(toastId);
    }
  };

// teacher register
export const TeacherRegisterAPI = async (formData) => {
    const toastId=toast.loading("loading...")
    try {
      const response = await API.post("/api/auth/registerTeacher", formData);
      toast.success("Registered Successfully");
      return response.data;
    } catch (error) {
      throw error.response?.data || "Registration failed!";
    }finally{
      toast.dismiss(toastId);
    }
  };

  // Get All Hackathons
  export const AllHackathonAPI = async () => {
    const toastId=toast.loading("loading...")
    try {
      const response = await API.get("/api/allhackathon/list");
      // toast.success("Registered Successfully");
      return response.data;
    } catch (error) {
      throw error.response?.data || "Loading of hackathons failed!";
    }finally{
      toast.dismiss(toastId);
    }
  };

  // Get Perticular Hackathon
  export const HackathonAPI= async (hackathonId) => {
    const toastId=toast.loading("loading...")
    try {
      const response = await API.get(`/api/hackathon/${hackathonId}`);
      // toast.success("Registered Successfully");
      return response.data;
    } catch (error) {
      throw error.response?.data || "Loading of hackathons failed!";
    }finally{
      toast.dismiss(toastId);
    }
  };

  // Get hackathon by teacher

  export const HackathonByTeacherAPI= async (teacherId) => {
    const toastId=toast.loading("loading...")
    try {
      const response = await API.get(`/api/allhackathon/teacher/${teacherId}`);
      // toast.success("Registered Successfully");
      return response.data;
    } catch (error) {
      throw error.response?.data || "Loading of hackathons failed!";
    }finally{
      toast.dismiss(toastId);
    }
  };

  // submission status for student

  export const SubmissionStatusAPI= async (hackathonId) => {
    // const toastId=toast.loading("loading...")
    try {
      const response = await API.post("/api/student/status",{hackathonId});
      // toast.success("Registered Successfully");
      return response.data;
    } catch (error) {
      throw error.response?.data || "Loading of hackathons failed!";
    }finally{
      // toast.dismiss(toastId);
    }
  };

  // Admin Dashboard APIs
  export const getAdminDashboardStats = async () => {
    const toastId = toast.loading("Loading dashboard stats...");
    try {
      // For getting all hackathons to calculate stats
      const hackathonsResponse = await API.get("/api/admin/hackathons");
      
      // For getting all submissions to calculate participation stats
      const submissionsResponse = await API.get("/api/admin/submissions");
      
      // Calculate stats based on the responses
      const hackathons = hackathonsResponse.data.hackathons || [];
      const submissions = submissionsResponse.data || [];
      
      // Count upcoming hackathons (where endDate is in the future)
      const currentDate = new Date();
      const upcomingEvents = hackathons.filter(
        hackathon => new Date(hackathon.endDate) >= currentDate
      ).length;
      
      // Calculate submission rate (if available)
      const totalSubmissions = submissions.length;
      const totalParticipants = hackathons.reduce(
        (sum, hackathon) => sum + (hackathon.students?.length || 0), 
        0
      );
      
      const submissionRate = totalParticipants > 0 
        ? Math.round((totalSubmissions / totalParticipants) * 100) 
        : 0;
      
      return {
        totalHackathons: hackathons.length,
        activeParticipants: totalParticipants,
        upcomingEvents,
        submissionRate
      };
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      toast.error("Failed to load dashboard stats");
      throw error.response?.data || "Failed to load dashboard stats";
    } finally {
      toast.dismiss(toastId);
    }
  };
  export const getRecentHackathons = async (sortConfig = { field: 'title', direction: 'asc' }) => {
    try {
      const response = await API.get("/api/admin/hackathons");
      const hackathons = response.data.hackathons || [];
      
      // Get current date for status calculation
      const currentDate = new Date();
      
      // Format hackathons with all required fields for the UI
      const formattedHackathons = hackathons.map(hackathon => {
        const startDate = new Date(hackathon.startDate);
        const endDate = new Date(hackathon.endDate);
        
        // Determine hackathon status
        let status;
        if (currentDate < startDate) {
          status = "Upcoming";
        } else if (currentDate > endDate) {
          status = "Completed";
        } else {
          status = "Active";
        }
        
        return {
          id: hackathon._id,
          name: hackathon.title,
          title: hackathon.title,
          description: hackathon.description,
          startDate: hackathon.startDate,
          endDate: hackathon.endDate,
          participants: hackathon.registeredStudents?.length || 0,
          submissions: hackathon.submissions?.length || 0,
          status: status,
          date: `${new Date(hackathon.startDate).toLocaleDateString()} - ${new Date(hackathon.endDate).toLocaleDateString()}`
        };
      });

      // Sort the hackathons based on the sortConfig
      return formattedHackathons.sort((a, b) => {
        const field = sortConfig.field;
        
        // Handle different field types
        let valueA, valueB;
        
        if (field === 'startDate' || field === 'endDate') {
          // Parse dates for comparison
          valueA = new Date(a[field]).getTime();
          valueB = new Date(b[field]).getTime();
        } else if (field === 'title' || field === 'name') {
          // Case-insensitive string comparison
          valueA = (a[field] || '').toLowerCase();
          valueB = (b[field] || '').toLowerCase();
        } else {
          // Default comparison
          valueA = a[field];
          valueB = b[field];
        }
        
        // Sort based on direction
        if (sortConfig.direction === 'asc') {
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
        }
      });
    } catch (error) {
      console.error("Error fetching recent hackathons:", error);
      throw error.response?.data || "Failed to load recent hackathons";
    }
  };

  export const getTeacherAssignments = async (formatForDashboard = true) => {
    try {
      // Get teacher assignments with the enhanced data from backend
      const response = await API.get("/api/admin/hackathon/teachers");
      const teacherAssignments = response.data || [];
      
      // If raw data is requested, return it directly
      if (!formatForDashboard) {
        return teacherAssignments;
      }  
      // Format the assignments for display in the dashboard
      const formattedAssignments = [];
      
      teacherAssignments.forEach(teacher => {
        if (teacher.assignedHackathons && teacher.assignedHackathons.length > 0) {
          // Create an entry for each teacher-hackathon assignment
          teacher.assignedHackathons.forEach(hackathon => {
            formattedAssignments.push({
              id: `${teacher.id}-${hackathon.id}`,
              teacherId: teacher.id,
              teacherName: teacher.name,
              teacherEmail: teacher.email,
              hackathonId: hackathon.id,
              hackathonTitle: hackathon.title,
              startDate: new Date(hackathon.startDate).toLocaleDateString(),
              endDate: new Date(hackathon.endDate).toLocaleDateString(),
              name: teacher.name,
              hackathon: hackathon.title
            });
          });
        } else {
          // Include teachers without assignments too
          formattedAssignments.push({
            id: teacher.id,
            teacherId: teacher.id,
            teacherName: teacher.name,
            teacherEmail: teacher.email,
            name: teacher.name,
            hackathon: "Not assigned to any hackathon"
          });
        }
      });
      
      return formattedAssignments;
    } catch (error) {
      console.error("Error fetching teacher assignments:", error);
      toast.error(error.response?.data?.message || "Failed to fetch teachers");
      return formatForDashboard ? [] : [];
    }
  };

  // Create Hackathon API
  export const createHackathonAPI = async (hackathonData) => {
    const toastId = toast.loading("Creating hackathon...");
    try {
      const response = await API.post("/api/admin/hackathon", hackathonData);
      toast.success("Hackathon created successfully");
      return response.data;
    } catch (error) {
      console.error("Error creating hackathon:", error);
      const errorMessage = error.response?.data?.message || "Failed to create hackathon";
      toast.error(errorMessage);
      
      // Return a properly structured error response instead of throwing
      return {
        success: false,
        message: errorMessage,
        error: error.response?.data || error.message
      };
    } finally {
      toast.dismiss(toastId);
    }
  };

  // Get Hackathon by ID API
  export const getHackathonByIdAPI = async (hackathonId) => {
    const toastId = toast.loading("Loading hackathon details...");
    try {
      const response = await API.get(`/api/admin/hackathons/${hackathonId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching hackathon:", error);
      toast.error("Failed to load hackathon details");
      throw error.response?.data || "Failed to load hackathon details";
    } finally {
      toast.dismiss(toastId);
    }
  };

  // Update Hackathon API
  export const updateHackathonAPI = async (hackathonId, hackathonData) => {
    const toastId = toast.loading("Updating hackathon...");
    try {
      const response = await API.put(`/api/admin/hackathon/${hackathonId}`, hackathonData);
      toast.success("Hackathon updated successfully");
      return response.data;
    } catch (error) {
      console.error("Error updating hackathon:", error);
      const errorMessage = error.response?.data?.message || "Failed to update hackathon";
      toast.error(errorMessage);
      
      // Return a properly structured error response instead of throwing
      return {
        success: false,
        message: errorMessage,
        error: error.response?.data || error.message
      };
    } finally {
      toast.dismiss(toastId);
    }
  };

  // Delete Hackathon API
  export const deleteHackathonAPI = async (hackathonId) => {
    const toastId = toast.loading("Deleting hackathon...");
    try {
      const response = await API.delete(`/api/admin/hackathon/${hackathonId}`);
      toast.success("Hackathon deleted successfully");
      return response.data;
    } catch (error) {
      console.error("Error deleting hackathon:", error);
      toast.error(error.response?.data?.message || "Failed to delete hackathon");
      throw error.response?.data || "Failed to delete hackathon";
    } finally {
      toast.dismiss(toastId);
    }
  };

  // Assign teachers to a hackathon
  export const assignTeacherToHackathonAPI = async (hackathonId, teacherIds) => {
    const toastId = toast.loading("Assigning teachers...");
    try {
      const response = await API.post("/api/admin/hackathon/assignteacher", {
        hackathonId,
        teacherIds
      });
      toast.success("Teachers assigned successfully");
      return response.data;
    } catch (error) {
      console.error("Error assigning teachers:", error);
      toast.error(error.response?.data?.message || "Failed to assign teachers");
      throw error;
    } finally {
      toast.dismiss(toastId);
    }
  };

  // Update hackathon media types
  export const updateHackathonMediaAPI = async (hackathonId, mediaTypes) => {
    const toastId = toast.loading("Updating media types...");
    try {
      const response = await API.post("/api/admin/hackathon/accept-media", {
        hackathonId,
        mediaTypes
      });
      toast.success("Media types updated successfully");
      return response.data;
    } catch (error) {
      console.error("Error updating media types:", error);
      toast.error(error.response?.data?.message || "Failed to update media types");
      throw error;
    } finally {
      toast.dismiss(toastId);
    }
  };

  // Update hackathon deadline
  export const updateHackathonDeadlineAPI = async (hackathonId, newDeadline) => {
    const toastId = toast.loading("Updating deadline...");
    try {
      const response = await API.put(`/api/admin/hackathon/${hackathonId}`, {
        endDate: newDeadline.date,
        endTime: newDeadline.time
      });
      toast.success("Deadline updated successfully");
      return response.data;
    } catch (error) {
      console.error("Error updating deadline:", error);
      toast.error(error.response?.data?.message || "Failed to update deadline");
      throw error;
    } finally {
      toast.dismiss(toastId);
    }
  };
/*teacher landing page starts*/

  // Get hackathon Particular Hackathon details
  export const getHackathonDetailsAPI = async (hackathonId) => {
    try {
        const response = await API.get(`/api/hackathon/${hackathonId}`);
        return response.data; 
    } catch (error) {
        console.error("Error fetching hackathon details:", error);
        const errorMessage = error.response?.data?.message || "Failed to load hackathon details";
        
        return {
            success: false,
            message: errorMessage,
            error: error.response?.data || error.message
        };
    } 
};

// Get submissions of the hackathon 
export const getHackathonSubmissionsAPI = async (hackathonId) => {
  try {
      const response = await API.get(`/api/hackathon/${hackathonId}/submissions`);
      return response.data; 
  } catch (error) {
      console.error("Error fetching submissions:", error);
      const errorMessage = error.response?.data?.message || "Failed to load submissions";

      return {
          success: false,
          message: errorMessage,
          error: error.response?.data || error.message
      };
  } 
};

// Shortlist students based on a minimum score threshold
export const shortlistStudents = async (submissionIds) => {
    try {
        const response = await API.put(`/api/teacher/hackathons/shortlist`,{submissionIds});
        return response.data;
    } catch (error) {
        console.error("Error shortlisting students:", error);
        return { success: false, message: "Failed to shortlist students" };
    }
};

//Update submission details

export const updateSubmissionAPI = async (submissions) => {
  try {
    // console.log("hello")
      const response = await API.put(`/api/teacher/hackathons/updateSubmission`,{submissions});
      return response.data;
  } catch (error) {
      console.error("Error shortlisting students:", error);
      return { success: false, message: "Failed to shortlist students" };
  }
};
// Get all shortlisted students
export const getShortlistedStudents = async (teacherId, hackathonId) => {
    try {
        const response = await API.get(`/api/teacher/${teacherId}/hackathons/${hackathonId}/shortlisted`);
        return response.data;
    } catch (error) {
        console.error("Error fetching shortlisted students:", error);
        return { success: false, message: "Failed to fetch shortlisted students" };
    }
};

// Get teachers assigned to a hackathon
export const getHackathonTeachersAPI = async (hackathonId) => {
  try {
    const response = await API.get(`/api/hackathon/${hackathonId}/teachers`);
    return response.data;
  } catch (error) {
    console.error("Error fetching hackathon teachers:", error);
    throw error;
  }
};

// Get top submissions for a specific hackathon
export const getTopSubmissionsAPI = async (hackathonId) => {
  try {
    const response = await API.get(`/api/hackathon/${hackathonId}/top-submissions`);
    return response.data;
  } catch (error) {
    console.error("Error fetching top submissions:", error);
    throw error;
  }
};

/*teacher landing page end*/


// show all parameters 
export const getSelectedCriteriaAPI = async (hackathonId) => {
  try {
    const response = await API.get(`/api/teacher/${hackathonId}/selectedCriteria`);
    return response.data;
  } catch (error) {
    console.error("Error fetching selected criteria:", error);
    throw error;
  }
};

// evaluated parameters



// add parameters
export const addParameterAPI = async (hackathonId, name, description) => {
  const toastId = toast.loading("Adding parameter..."); // Show loading toast
  // console.log("hello",hackathonId,name,description)
  try {
    const response = await API.post(`/api/teacher/hackathons/${hackathonId}/parameters`, { name, description });

    toast.success("Parameter added successfully");
    return response.data;
  } catch (error) {
    console.error("Error adding parameter:", error);

    const errorMessage = error.response?.data?.message || "Failed to add parameter";
    toast.error(errorMessage);
    throw error.response?.data || "Failed to add parameter";
  } finally {
    toast.dismiss(toastId);
  }
}; 

// get parameter
export const getParametersAPI = async (hackathonId) => {
  // const toastId = toast.loading("Adding parameter..."); // Show loading toast
  // console.log("hello",hackathonId,name,description)
  try {
    const response = await API.get(`/api/teacher/hackathons/${hackathonId}/getParameters`);

    // toast.success("Parameter added successfully");
    return response.data;
  } catch (error) {
    console.error("Error in getting parameter:", error);

    const errorMessage = error.response?.data?.message || "Failed to get parameter";
    toast.error(errorMessage);
    throw error.response?.data || "Failed to get parameter";
  } finally {
    // toast.dismiss(toastId);
  }
}; 

// update the criteria
export const updateSelectedCriteriaAPI = async (hackathonId, criteriaData) => {
  const toastId = toast.loading("Updating selected criteria..."); // Show loading toast

  try {
    const response = await API.put(`/api/teacher/${hackathonId}/selectedCriteria`, criteriaData);

    toast.success("Selected criteria updated successfully");
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error updating selected criteria:", error);

    const errorMessage = error.response?.data?.message || "Failed to update selected criteria";
    toast.error(errorMessage);

    return { success: false, message: errorMessage, error: error.response?.data || error.message };
  } finally {
    toast.dismiss(toastId);
  }
};

// remove parameters
export const deleteParameterAPI = async (hackathonId, parameterId) => {
  try {
    const response = await API.delete(`/api/teacher/${hackathonId}/parameters/${parameterId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting parameter:", error);
    throw error;
  }
};
// apply aii

// show only sumbmisions to be reviewed

export const getReviewedSubmissions = async () => {
  try {
      const response = await API.get("/api/review/all-reviewed-submissions");
      return response.data;
  } catch (error) {
      console.error("Error fetching reviewed submissions:", error.response?.data || error.message);
      throw error;
  }
};

// mark as review
export const markSubmissionAsReviewed = async (submissionId) => {
  try {
      const response = await API.put(`/api/review/${submissionId}/review`);
      return response.data;
  } catch (error) {
      console.error("Error marking submission as reviewed:", error.response?.data || error.message);
      throw error;
  }
};

// remove as review
export const markSubmissionAsPending = async (submissionId) => {
  try {
      const response = await API.put(`/api/submissions/${submissionId}/remove-review`);
      return response.data;
  } catch (error) {
      console.error("Error marking submission as pending:", error.response?.data || error.message);
      throw error;
  }
};
// Get submissions for evaluation
export const getSubmissionsForEvaluationAPI = async (teacherId, hackathonId) => {
  try {
    const response = await API.get(`/api/teacher/${teacherId}/hackathons/${hackathonId}/submissions`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error, "Failed to fetch submissions");
  }
};

//  Evaluate a submission
export const evaluateSubmissionAPI = async (teacherId, hackathonId, submissionId, evaluationData) => {
  try {
    const response = await API.post(
      `/api/teacher/${teacherId}/hackathons/${hackathonId}/submissions/${submissionId}`,
      evaluationData
    );
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error, "Failed to evaluate submission");
  }
};

//  Get students sorted by AI score
export const getSortedByAIScoreAPI = async (teacherId) => {
  try {
    const response = await API.get(`/api/teacher/sort-by-ai/${teacherId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error, "Failed to get AI-sorted students");
  }
};

//  Get students sorted by updated preference (or AI score if unavailable)
export const getSortedByPreferenceAPI = async (teacherId) => {
  try {
    const response = await API.get(`/api/teacher/sort-by-preference/${teacherId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error, "Failed to get preference-sorted students");
  }
};

// particular submission 
export const getSubmissionDetailsAPI = async (submissionId) => {
  try {
    const response = await API.get(`/api/teacher/submissions/${submissionId}`);
    return { success: true, data: response.data.submission };
  } catch (error) {
    console.error("Failed to fetch submission details:", error);
    return { success: false, message: error.response?.data?.message || "Server error" };
  }
};

// AI Evaluation System Functions

// Evaluate a single submission with AI
export const evaluateSubmissionWithAI = async (submissionId) => {
  const toastId = toast.loading("AI is evaluating submission...");
  try {
    const response = await API.post(`/api/evaluation/submission/${submissionId}`);
    toast.success("AI evaluation completed");
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "AI evaluation failed");
    throw error.response?.data || "AI evaluation failed";
  } finally {
    toast.dismiss(toastId);
  }
};

// Batch evaluate all submissions for a hackathon
export const batchEvaluateHackathon = async (hackathonId) => {
  const toastId = toast.loading("Starting batch evaluation...");
  try {
    const response = await API.post(`/api/evaluation/hackathon/${hackathonId}`);
    toast.success("Batch evaluation process started");
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Batch evaluation failed to start");
    throw error.response?.data || "Batch evaluation failed";
  } finally {
    toast.dismiss(toastId);
  }
};

// Manual override of AI scores
export const manualOverrideScores = async (submissionId, scores, totalScore, feedback) => {
  const toastId = toast.loading("Updating scores...");
  try {
    const response = await API.put(`/api/evaluation/submission/${submissionId}/override`, {
      scores,
      totalScore,
      feedback
    });
    toast.success("Scores updated successfully");
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to update scores");
    throw error.response?.data || "Score update failed";
  } finally {
    toast.dismiss(toastId);
  }
};

// Get evaluation history for a submission
export const getEvaluationHistory = async (submissionId) => {
  const toastId = toast.loading("Loading evaluation history...");
  try {
    const response = await API.get(`/api/evaluation/submission/${submissionId}/history`);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to load evaluation history");
    throw error.response?.data || "Loading history failed";
  } finally {
    toast.dismiss(toastId);
  }
};