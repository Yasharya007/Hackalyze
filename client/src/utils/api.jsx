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