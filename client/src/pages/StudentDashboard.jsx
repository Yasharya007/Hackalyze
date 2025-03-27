import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { setHackathon } from "../slices/hackathonSlice.js";
import { AllHackathonAPI, logoutAPI } from "../utils/api.jsx";
import { useState, useEffect } from "react";

const StudentDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [hackathons, setHackathons] = useState([]);
    const studentId = useSelector((state) => state.student.studentId);
    console.log(studentId)

    const truncateText = (text, length) => {
        return text.length > length ? text.substring(0, length) + "..." : text;
    };

    const formatDate = (isoString) => isoString.split("T")[0];

    const isDeadlinePassed = (endDate) => {
        const currentDate = new Date();
        const deadline = new Date(endDate);
        return currentDate > deadline;
    };

    useEffect(() => {
        const fetchHackathons = async () => {
            AllHackathonAPI()
                .then((res) => {
                    // console.log(hackathons.length);
                    for (let y = 0; y < res.length; y++) {
                        console.log(res[y])
                        for (let x = 0; x < res[y].registeredStudents.length; x++) {
                            console.log(res[y].registeredStudents[x])
                            if (res[y].registeredStudents[x] === studentId) {
                                res[y].status = "registered";
                                console.log("found")
                                break;
                            }
                        }
                    }
                    setHackathons(res);
                    // console.log("hello");
                }).catch(() => { })
        };

        fetchHackathons();
      }, []);

    const handleClick = (hackathon) => {
        dispatch(setHackathon(hackathon));
        navigate(`/student/hackathon/${hackathon._id}`);
    };

    return (
        <div className="flex h-screen w-full bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-lg flex flex-col justify-between h-screen sticky top-0">
                <div>
                    {/* Header/Logo Section */}
                    <div className="p-6">
                        <div className="flex items-center">
                            <img src="/logo.png" alt="Hackalyze Logo" className="h-8 mr-2" />
                            <h1 className="text-2xl font-bold">Hackalyze</h1>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="p-4">
                        <nav>
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        to="/student/dashboard"
                                        className="flex items-center p-2 rounded-md bg-black text-white"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                        <span>Dashboard</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/student/profile"
                                        className="flex items-center p-2 rounded-md hover:bg-gray-100"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span>My Profile</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/student/enrolled-hackathons"
                                        className="flex items-center p-2 rounded-md hover:bg-gray-100"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                        <span>Enrolled Hackathons</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/student/settings"
                                        className="flex items-center p-2 rounded-md hover:bg-gray-100"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>Settings</span>
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
                
                {/* Logout Button */}
                <div className="mb-6 px-4">
                    <button
                        className="flex items-center p-2 rounded-md text-red-600 hover:bg-red-50 w-full"
                        onClick={() => {
                            logoutAPI().then(() => {
                                window.location.href = "/";
                            });
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-y-auto">
                {/* Welcome Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
                    <h1 className="text-2xl font-bold mb-1">Hello! Welcome to the Student Dashboard!</h1>
                    <p className="text-gray-600">Explore available hackathons and track your submissions</p>
                </div>

                {/* Available Hackathons */}
                <h2 className="text-xl font-semibold mb-4">Available Hackathons</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hackathons.map((hackathon, index) => (
                        <div key={index} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition">
                            <h3 className="text-lg font-bold">{hackathon.title}</h3>
                            <div className="flex items-center mt-1 mb-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    hackathon.status === "registered" 
                                        ? "bg-green-100 text-green-800" 
                                        : isDeadlinePassed(hackathon.endDate)
                                            ? "bg-red-100 text-red-800"
                                            : "bg-blue-100 text-blue-800"
                                }`}>
                                    {hackathon.status === "registered" 
                                        ? "Registered" 
                                        : isDeadlinePassed(hackathon.endDate)
                                            ? "Closed"
                                            : "Open"
                                    }
                                </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-3">{truncateText(hackathon.description, 80)}</p>
                            <div className="text-sm text-gray-500 mb-4">
                                <div className="flex items-center mb-1">
                                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>Deadline: {formatDate(hackathon.endDate)}</span>
                                </div>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <button 
                                    onClick={() => handleClick(hackathon)} 
                                    className="flex-1 bg-black text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-900 transition"
                                >
                                    View Details
                                </button>
                                {hackathon.status !== "registered" && !isDeadlinePassed(hackathon.endDate) && (
                                    <button 
                                        onClick={() => handleClick(hackathon)} 
                                        className="flex-1 border border-black px-4 py-2 rounded text-sm font-medium hover:bg-gray-50 transition"
                                    >
                                        Register
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default StudentDashboard;