import { useState } from "react";
import { useNavigate,useLocation } from 'react-router-dom';
import Contact from "./contact.jsx";
import { loginAPI } from "../utils/api.jsx";
import toast from "react-hot-toast";
export default function Login() {
  const navigate=useNavigate()
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleLogin=async()=>{
    if (
      email === "" || password === "") {
      toast.error("All fields are required");
      return;
    }
    loginAPI(email,password)
    .then((response)=>{
      console.log(response);
      navigate("/dashboard")
    })
    .catch(()=>{})
  }
  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100">
      {/* Navbar */}
      <nav className="w-[75%] bg-white shadow-md py-3 px-8 flex justify-between items-center fixed top-6 left-1/2 transform -translate-x-1/2 rounded-xl">
        <h1 className="text-lg font-semibold">Hackalyze</h1>
        <div className="space-x-7">
          <span onClick={() => navigate("/leaderboard")}className="text-gray-600 hover:text-gray-900 hover:cursor-pointer">Leaderboard</span>
          <span onClick={() => navigate("/Rules")}className="text-gray-600 hover:text-gray-900 hover:cursor-pointer">Hackathon Rules</span>
          <span onClick={() => navigate("/faq")}className="text-gray-600 hover:text-gray-900 hover:cursor-pointer">FAQ </span>
          <span onClick={() => navigate("/annoucements")}className="text-gray-600 hover:text-gray-900 hover:cursor-pointer">Announcements</span>
        </div>
        <button className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 hover:cursor-pointer" onClick={() => setIsModalOpen(true)} >
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
        className="w-full border px-4 py-2 rounded-md mb-4 focus:ring-2 focus:ring-indigo-400 outline-none"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full border px-4 py-2 rounded-md mb-4 focus:ring-2 focus:ring-indigo-400 outline-none"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

<div className="mb-6">
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
</div>

      <button onClick={handleLogin} className="w-full bg-indigo-500 text-white py-2 rounded-md hover:bg-indigo-600">
        Sign in
      </button>

      <p className="mt-4 text-gray-600 text-center">
        Don't have an account? <span onClick={() => navigate("/register")} className="text-indigo-500 hover:cursor-pointer">Sign up</span>
      </p>
    </div>
  </div>

  {/* Right Side: Large Blue Square */}
  <div className="w-1/2 flex justify-center items-center">
    <div className="bg-indigo-500 text-white rounded-lg w-[99%] aspect-square flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold text-center">"Innovation distinguishes between a leader and a follower"</h2>
      <p className="mt-2 text-center pl-10 pr-10">
      Fairness and innovation go hand in hand. Let's recognize the best ideas with a keen eye and an open mind.
      </p>
    </div>
  </div>
</div>

    </div>
  );
}
