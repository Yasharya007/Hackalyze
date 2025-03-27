import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import { useDispatch, useSelector } from "react-redux";
import "chart.js/auto";
import { HackathonByTeacherAPI, logoutAPI } from "../utils/api.jsx";
import { useState, useEffect } from "react";

import { setHackathon } from "../slices/hackathonSlice.js";
import axios from "axios";
import toast from "react-hot-toast";
import { FaChartBar, FaLaptopCode, FaCogs, FaClipboardList, FaTrophy, FaUserCog } from "react-icons/fa";

const TeacherDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [visible, setVisible] = useState(true);
    const teacherId = useSelector((state) => state.student.studentId);
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
            <aside className="w-64 bg-white shadow-lg flex flex-col h-screen sticky top-0">
                <div className="p-6">
                    <div className="flex items-center">
                        <img src="/logo.png" alt="Hackalyze Logo" className="h-8 mr-2" />
                        <h2 className="text-2xl font-bold">Hackalyze</h2>
                    </div>
                </div>
                <nav className="flex-grow px-4">
                    <ul className="space-y-2">
                        <li>
                            <Link 
                                to="/teacher/dashboard" 
                                className="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-900 font-semibold"
                            >
                                <FaChartBar className="h-5 w-5 mr-3" />
                                <span>Dashboard</span>
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/view-hackathons" 
                                className="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-600"
                            >
                                <FaLaptopCode className="h-5 w-5 mr-3" />
                                <span>View Hackathons</span>
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/set-parameters" 
                                className="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-600"
                            >
                                <FaCogs className="h-5 w-5 mr-3" />
                                <span>Set Parameters</span>
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/teacher/submissions" 
                                className="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-600"
                            >
                                <FaClipboardList className="h-5 w-5 mr-3" />
                                <span>View Submissions</span>
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/teacher/shortlist" 
                                className="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-600"
                            >
                                <FaTrophy className="h-5 w-5 mr-3" />
                                <span>View Shortlist</span>
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/teacher/settings" 
                                className="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-600"
                            >
                                <FaUserCog className="h-5 w-5 mr-3" />
                                <span>Settings</span>
                            </Link>
                        </li>
                    </ul>
                </nav>

                {/* Logout Button */}
                <div className="mt-auto mb-6 px-4">
                    <a
                        href="#"
                        className="flex items-center p-2 rounded-md text-red-600 hover:bg-red-50 w-full"
                        onClick={() => {
                            logoutAPI().then(() => {
                                window.location.href = "/";
                            });
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                    </a>
                </div>

            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                {/* Notification */}
                {visible && (
                    <div className="bg-white p-4 shadow-md flex justify-between items-center">
                        <div>
                            <p className="text-gray-800 font-semibold">Important Announcement for Teachers</p>
                            <p className="text-gray-500">Dear Teachers, please submit the student performance reports by the end of this week.</p>
                        </div>
                        <button className="text-gray-800" onClick={() => setVisible(false)}>
                            Dismiss
                        </button>
                    </div>
                )}
                <div className="flex mt-4 justify-between items-center">
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
                        <p className="text-2xl font-bold">8</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <p className="text-gray-500">Submission Rate</p>
                        <p className="text-2xl font-bold">78%</p>
                    </div>
                </div>

                {/* Hackathon Analysis & Scheduling */}
                <div className="mt-6 grid grid-cols-2 gap-6">
                    {/* <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold">Hackathon Analysis</h2>
                        <Bar data={chartData} className="mt-4" />
                    </div> */}
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
                    
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold">Scheduling Calendar</h2>
                        <p className="text-gray-500">Upcoming Hackathons and deadlines will be displayed here.</p>
                        {/* Add calendar component here */}
                        <ul className="space-y-2 mt-2">
                            <li className="flex justify-between bg-gray-100 p-2 rounded">
                                <span className="font-semibold">AI Innovation Challenge</span>
                                <span className="text-gray-600">April 10, 2025</span>
                            </li>
                            <li className="flex justify-between bg-gray-100 p-2 rounded">
                                <span className="font-semibold">Sustainability Hack</span>
                                <span className="text-gray-600">May 5, 2025</span>
                            </li>
                            <li className="flex justify-between bg-gray-100 p-2 rounded">
                                <span className="font-semibold">FinTech Revolution</span>
                                <span className="text-gray-600">June 18, 2025</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold">Hackathon Analysis</h2>
                        <Bar data={chartData} className="mt-4" />
                    </div>
            </main>
        </div>
    );
};

export default TeacherDashboard;  