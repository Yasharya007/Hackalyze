import axios from "axios";
import toast from "react-hot-toast"
const API = axios.create({
  baseURL: "http://localhost:8000", // Update with your backend URL
  withCredentials: true, // Send cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: Add an interceptor to handle authentication errors globally
API.interceptors.response.use(
    (response) => response, // Return response if successful
    (error) => {
      if (error.response) {
        // Handle different error statuses
        const { status, data } = error.response;
        if (status === 401) {
          toast.error("Unauthorized! Please login again.");
        } else if (status === 403) {
          toast.error("Forbidden! You don't have permission.");
        } else if (status === 500) {
          toast.error("Server error! Please try again later.");
        } else {
          toast.error(data?.message || "Something went wrong!");
        }
      } else {
        toast.error("Network error! Check your connection.");
      }
      return Promise.reject(error); // Reject the error so it can be handled in the component
    }
  );

export default API;
