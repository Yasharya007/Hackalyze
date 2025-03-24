import React from "react";
import { Link,useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import { useDispatch,useSelector } from "react-redux";
import "chart.js/auto";
import { HackathonByTeacherAPI } from "../utils/api.jsx";
import { useState,useEffect } from "react";
import { setHackathon } from "../slices/hackathonSlice.js";
import axios from "axios";
import toast from "react-hot-toast";

const TeacherDashboard = () => {
    const dispatch=useDispatch()
    const navigate=useNavigate()
    const teacherId = useSelector((state) => state.student.studentId);
    // console.log(teacherId)
    const formatDate = (isoString) => isoString.split("T")[0];
    const [assignedHackathons, setassignedHackathons] = useState([]);
    useEffect(() => {
            const fetchHackathons = async () => {
              HackathonByTeacherAPI(teacherId)
              .then((res)=>{
                // console.log(hackathons.length);
                setassignedHackathons(res);
                // console.log("hello");
              }).catch(()=>{})
            };
        
            fetchHackathons();
          }, []);
    const handleClick = (hackathon) => {
            dispatch(setHackathon(hackathon));
            navigate("/teacher/hackathon");
          };
    const chartData = {
        labels: ["Hackathon 1", "Hackathon 2", "Hackathon 3"],
        datasets: [
            {
                label: "Submissions",
                data: [30, 50, 45],
                backgroundColor: ["#4CAF50", "#FF9800", "#2196F3"],
            },
        ],
    };

    return (
        <div className="flex w-full h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white p-5 shadow-lg">
                <h2 className="text-xl font-bold mb-6">Teacher Portal</h2>
                <nav>
                    <ul className="space-y-4">
                        <li>
                            <Link to="/dashboard" className="block text-gray-900 font-semibold hover:text-gray-600">Dashboard</Link>
                        </li>
                        <li>
                            <Link to="/view-hackathons" className="block text-gray-600 hover:text-gray-400">View Hackathons</Link>
                        </li>
                        <li>
                            <Link to="/set-parameters" className="block text-gray-600 hover:text-gray-400">Set Parameters</Link>
                        </li>
                        <li>
                            <Link to="/view-submissions" className="block text-gray-600 hover:text-gray-400">View Submissions</Link>
                        </li>
                        <li>
                            <Link to="/view-shortlist" className="block text-gray-600 hover:text-gray-400">View Shortlist</Link>
                        </li>
                        <li>
                            <Link to="/settings" className="block text-gray-600 hover:text-gray-400">Settings</Link>
                        </li>
                    </ul>
                </nav>
                <button className="mt-10 w-full py-2 bg-gray-200 rounded-lg">Logout</button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-4xl font-bold">Teacher Dashboard</h1>
                    <button className="bg-gray-200 px-4 py-2 rounded-lg">Export Data</button>
                </div>

                {/* Overview Section */}
                <div className="mt-6 grid grid-cols-3 gap-6">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <p className="text-gray-500">Total Hackathons</p>
                        <p className="text-2xl font-bold">3</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <p className="text-gray-500">Active Participants</p>
                        <p className="text-2xl font-bold">245</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <p className="text-gray-500">Submission Rate</p>
                        <p className="text-2xl font-bold">78%</p>
                    </div>
                </div>
                <div class="mt-6 grid grid-cols-2 gap-6">
                    <div class="bg-white p-6 rounded-lg shadow">
                        <h2 class="text-xl font-semibold">Assigned Hackathons</h2>
                        <div class="mt-4 space-y-4">
                        {assignedHackathons.map((hackathon, index) => (
                              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                {hackathon.title} ({formatDate(hackathon.endDate)}) 
                                <button className="ml-2 text-blue-600" onClick={() => handleClick(hackathon)}>View Details</button>
                              </div>
                            ))}
                        </div>
                    </div>
                    <div class="bg-white p-6 rounded-lg shadow">
                        <h2 class="text-xl font-semibold">Recent Activity</h2>
                        <div class="mt-4 space-y-4">
                            <div class="p-3 bg-gray-50 rounded-lg">New Submission Received - 2 hours ago</div>
                            <div class="p-3 bg-gray-50 rounded-lg">Deadline Extended - 1 day ago</div>
                            <div class="p-3 bg-gray-50 rounded-lg">Results Published</div>
                        </div>
                    </div>
                </div>
                {/* Hackathon Analysis Chart */}
                <div className="mt-6 bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold">Hackathon Analysis</h2>
                    <Bar data={chartData} className="mt-4" />
                </div>
            </main>

        </div>
    );
};

export default TeacherDashboard;
