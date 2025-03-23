import React from "react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
    const statsData = [
        { label: "Total Hackathons", value: "12", change: "+2 from last month" },
        { label: "Active Participants", value: "+573", change: "+201 from last month" },
        { label: "Upcoming Events", value: "3", change: "Next event in 5 days" },
        { label: "Submission Rate", value: "78%", change: "+12% from last month" }
    ];

    const hackathons = [
        { name: "AI Innovation Challenge 1", date: "May 11, 2023" },
        { name: "AI Innovation Challenge 2", date: "May 12, 2023" },
        { name: "AI Innovation Challenge 3", date: "May 13, 2023" }
    ];

    const teachers = [
        { name: "Teacher 1", hackathon: "AI Innovation Challenge 1" },
        { name: "Teacher 2", hackathon: "AI Innovation Challenge 2" },
        { name: "Teacher 3", hackathon: "AI Innovation Challenge 3" }
    ];

    return (
        <div className="flex w-full h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white p-5 border-r">
                <h2 className="text-xl font-bold mb-5">HackathonHub</h2>
                <nav>
                    <ul>
                        <li className="py-2"><Link to="/admin/dashboard" className="text-gray-700 font-semibold">Dashboard</Link></li>
                        <li className="py-2"><Link to="/admin/create-hackathon" className="text-gray-700">Create New Hackathon</Link></li>
                        <li className="py-2"><Link to="/admin/view-hackathons" className="text-gray-700">View Hackathons</Link></li>
                        <li className="py-2"><Link to="/admin/settings" className="text-gray-700">Settings</Link></li>
                    </ul>
                </nav>
                <button className="mt-5 w-full bg-gray-200 p-2 rounded">Logout</button>
            </aside>
            
            {/* Main Content */}
            <main className="flex-1 p-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-4xl font-bold">Admin Dashboard</h1>
                    <div>
                        <Link to="/admin/create-hackathon" className="bg-black text-white px-4 py-2 rounded">Create Hackathon</Link>
                        <button className="ml-2 border px-4 py-2 rounded">Export Data</button>
                    </div>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mt-6">
                    {statsData.map((stat, index) => (
                        <div key={index} className='bg-white p-4 rounded shadow'>
                            <h3 className='text-xl font-bold'>{stat.value}</h3>
                            <p className='text-gray-500 text-sm'>{stat.change}</p>
                        </div>
                    ))}
                </div>
                
                {/* Recent Hackathons */}
                <div className="bg-white p-5 mt-6 rounded shadow">
                    <h2 className="text-lg font-semibold">Recent Hackathons</h2>
                    <ul className="mt-3">
                        {hackathons.map((h, index) => (
                            <li key={index} className='py-2 flex justify-between border-b'>
                                <span>{h.name} (Created on {h.date})</span>
                                <Link to={`/admin/hackathon/${index}`} className='bg-gray-200 px-4 py-1 rounded'>View Details</Link>
                            </li>
                        ))}
                    </ul>
                </div>
                
                {/* Teacher Assignments */}
                <div className="bg-white p-5 mt-6 rounded shadow">
                    <h2 className="text-lg font-semibold">Teacher Assignments</h2>
                    <ul className="mt-3">
                        {teachers.map((t, index) => (
                            <li key={index} className='py-2 flex justify-between border-b'>
                                <span>{t.name} - {t.hackathon}</span>
                                <button className='bg-gray-200 px-4 py-1 rounded'>Reassign</button>
                            </li>
                        ))}
                    </ul>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
