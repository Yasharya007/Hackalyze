import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import { useDispatch, useSelector } from "react-redux";
import "chart.js/auto";
import { HackathonByTeacherAPI } from "../utils/api.jsx";
import { useState, useEffect } from "react";
import { setHackathon } from "../slices/hackathonSlice.js";
import axios from "axios";
import toast from "react-hot-toast";

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
                .then((res) => {
                    setassignedHackathons(res);
                })
                .catch(() => { });
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
                        <p className="text-2xl font-bold">245</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <p className="text-gray-500">Submission Rate</p>
                        <p className="text-2xl font-bold">78%</p>
                    </div>
                </div>

                {/* Hackathon Analysis & Scheduling */}
                <div className="mt-6 grid grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold">Hackathon Analysis</h2>
                        <Bar data={chartData} className="mt-4" />
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
            </main>
        </div>
    );
};

export default TeacherDashboard;  