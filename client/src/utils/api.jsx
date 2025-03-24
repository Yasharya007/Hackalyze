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

  export const getRecentHackathons = async () => {
    try {
      const response = await API.get("/api/admin/hackathons");
      const hackathons = response.data.hackathons || [];
      
      // Get current date for status calculation
      const currentDate = new Date();
      
      // Format hackathons with all required fields for the UI
      return hackathons.map(hackathon => {
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
    } catch (error) {
      console.error("Error fetching recent hackathons:", error);
      throw error.response?.data || "Failed to load recent hackathons";
    }
  };

  export const getTeacherAssignments = async () => {
    try {
      // Get teacher assignments with the enhanced data from backend
      const response = await API.get("/api/admin/hackathon/teachers");
      const teacherAssignments = response.data || [];
      
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
      throw error.response?.data || "Failed to load teacher assignments";
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
      toast.error(error.response?.data?.message || "Failed to create hackathon");
      throw error.response?.data || "Failed to create hackathon";
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
      toast.error(error.response?.data?.message || "Failed to update hackathon");
      throw error.response?.data || "Failed to update hackathon";
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