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
      
      // Sort by creation date (newest first) and take the first 5
      return hackathons
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(hackathon => ({
          id: hackathon._id,
          name: hackathon.title,
          date: new Date(hackathon.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
        }));
    } catch (error) {
      console.error("Error fetching recent hackathons:", error);
      throw error.response?.data || "Failed to load recent hackathons";
    }
  };

  export const getTeacherAssignments = async () => {
    try {
      // Get all teachers
      const teachersResponse = await API.get("/api/admin/hackathon/teachers");
      const teachers = teachersResponse.data || [];
      
      // Get all hackathons
      const hackathonsResponse = await API.get("/api/admin/hackathons");
      const hackathons = hackathonsResponse.data.hackathons || [];
      
      // Create assignments by matching teachers to hackathons
      const assignments = [];
      
      // This logic may need to be adjusted based on your actual data structure
      hackathons.forEach(hackathon => {
        (hackathon.teachersAssigned || []).forEach(teacherId => {
          const teacher = teachers.find(t => t._id === teacherId);
          if (teacher) {
            assignments.push({
              id: teacher._id,
              name: teacher.name,
              hackathon: hackathon.title
            });
          }
        });
      });
      
      return assignments.slice(0, 5); // Return the first 5 assignments
    } catch (error) {
      console.error("Error fetching teacher assignments:", error);
      throw error.response?.data || "Failed to load teacher assignments";
    }
  };