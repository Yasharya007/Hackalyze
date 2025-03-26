import { useState } from "react";
import { useNavigate,useLocation } from 'react-router-dom';
import Contact from "./contact.jsx";
import { loginAPI } from "../utils/api.jsx";
import { setStudentId } from "../slices/idSlice.js";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
export default function Login() {
  const navigate=useNavigate()
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch=useDispatch()
  const handleLogin=async()=>{
    if (
      email === "" || password === "") {
      toast.error("All fields are required");
      return;
    }
    loginAPI(email,password)
    .then((response)=>{
      const a=response.data.user._id
      dispatch(setStudentId(a));
      // console.log(a);
      // console.log(response);
      if(response.data.role==="Student"){navigate("/student/dashboard")}
      else if(response.data.role==="Teacher"){navigate("/teacher/dashboard")}
      else if(response.data.role==="Admin"){navigate("/admin/dashboard")}
      else {navigate("dashboardError")}
    })
    .catch(()=>{})
  }
  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100">
      {/* Navbar */}
      <nav className="w-[75%] bg-white shadow-md py-3 px-8 flex justify-between items-center fixed top-6 left-1/2 transform -translate-x-1/2 rounded-xl">
        <div className="flex items-center">
          <img src="/logo.png" alt="Hackalyze Logo" className="h-8 mr-2" />
          <h1 className="text-lg font-semibold">Hackalyze</h1>
        </div>
        <div className="space-x-7">
          <span onClick={() => navigate("/faq")}className="text-gray-600 hover:text-gray-900 hover:cursor-pointer">FAQ</span>
          <span onClick={() => navigate("/annoucements")}className="text-gray-600 hover:text-gray-900 hover:cursor-pointer">Announcements</span>
        </div>
        <button className="bg-black text-white px-4 py-2 rounded-md hover:cursor-pointer" onClick={() => setIsModalOpen(true)} >
        Contact Support
        </button>
      </nav>

      <Contact isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Main Content */}
      <div className="flex flex-grow px-12">
  {/* Left Side: Login Form */}
  <div className="w-1/2 flex justify-center items-center">
    <div className="bg-white shadow-lg p-10 rounded-lg w-[85%] max-w-md">
      <h2 className="text-3xl font-semibold mb-2">Sign In</h2>
      <p className="text-gray-600 mb-6">Enter your email and password to sign in</p>

      <input
        type="email"
        placeholder="Email"
        className="w-full border px-4 py-2 rounded-md mb-4 focus:ring-2 focus:ring-gray-400 outline-none"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full border px-4 py-2 rounded-md mb-4 focus:ring-2 focus:ring-gray-400 outline-none"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

{/* <div className="mb-6">
  <label htmlFor="role" className="block text-gray-600 mb-2">Login as</label>
  <select
    id="role"
    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
    value={role}
    onChange={(e) => setRole(e.target.value)}
  >
    <option value="student">Student</option>
    <option value="teacher">Teacher</option>
    <option value="admin">Admin</option>
  </select>
</div> */}

      <button onClick={handleLogin} className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800">
        Sign in
      </button>

      <p className="mt-4 text-gray-600 text-center">
        Don't have an account? <span onClick={() => navigate("/student/register")} className="text-blue-600 hover:cursor-pointer">Sign up</span>
      </p>
    </div>
  </div>

  {/* Right Side: Large Blue Square */}
  <div className="w-1/2 flex justify-center items-center">
    <div className="bg-gray-200 text-white rounded-lg w-[99%] aspect-square flex flex-col items-center justify-center">
      <h2 className="text-5xl text-center text-black">Innovation sets leaders apart</h2>
      <p className="text-xl mt-2 text-center pl-10 pr-10 text-gray-700">
      Fairness and innovation go hand in hand. Let's recognize the best ideas with a keen eye and an open mind.
      </p>
    </div>
  </div>
</div>

    </div>
  );
}