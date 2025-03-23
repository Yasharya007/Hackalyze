import React from "react";
import { Link } from "react-router-dom";

const StudentDashboard = () => {
    const truncateText = (text, length) => {
        return text.length > length ? text.substring(0, length) + "..." : text;
    };

    const hackathons = [
        {
            title: "AI Innovation Challenge",
            status: "Active",
            description: "Create innovative AI solutions for real-world problems",
            deadline: "June 30, 2023",
            statusColor: "text-green-600"
        },
        {
            title: "Web Development Hackathon",
            status: "Upcoming",
            description: "Build responsive and accessible web applications",
            deadline: "July 30, 2023",
            statusColor: "text-blue-600"
        },
        {
            title: "Mobile App Challenge",
            status: "Active",
            description: "Develop mobile applications for social good",
            deadline: "July 15, 2023",
            statusColor: "text-green-600"
        }
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white p-5 shadow-md">
                <h2 className="text-3xl font-bold">Student Portal</h2>
                <nav className="mt-5">
                    <ul>
                        <li className="mb-4"><Link to="/dashboard" className="block text-gray-700 font-semibold">Dashboard</Link></li>
                        <li className="mb-4"><Link to="/enrolled-hackathons" className="block text-gray-700 font-semibold">Enrolled Hackathons</Link></li>
                        <li className="mb-4"><Link to="/settings" className="block text-gray-700 font-semibold">Settings</Link></li>
                    </ul>
                </nav>
                <button className="mt-10 w-full bg-gray-200 p-2 rounded">Logout</button>
            </aside>
            
            {/* Main Content */}
            <main className="flex-1 p-6">
                {/* Notification */}
                <div className="bg-white p-4 shadow-md flex justify-between items-center">
                    <p className="text-gray-800 font-semibold">Submission deadline approaching</p>
                    <p className="text-gray-500">The submission deadline for AI Innovation Challenge is in 5 days.</p>
                    <button className="text-gray-400">Dismiss</button>
                </div>

                {/* Available Hackathons */}
                <h2 className="text-2xl font-bold mt-6">Available Hackathons</h2>
                <div className="mt-4 grid grid-cols-3 gap-6">
                    {hackathons.map((hackathon, index) => (
                        <div key={index} className="bg-white p-4 shadow-md rounded-md">
                            <h3 className="text-lg font-bold">{hackathon.title}</h3>
                            <span className={`${hackathon.statusColor} font-semibold`}>{hackathon.status}</span>
                            <p className="text-gray-500 mt-2">{truncateText(hackathon.description, 50)}</p>
                            <p className="text-gray-500 mt-2">Deadline: {hackathon.deadline}</p>
                            <div className="mt-4 flex gap-2">
                                <Link to={`/hackathon/${index}`} className="flex-1 bg-gray-200 p-2 rounded text-center">View</Link>
                                {hackathon.status !== "Active" && (
                                    <Link to="/register" className="flex-1 bg-black text-white p-2 rounded text-center">Register</Link>
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
