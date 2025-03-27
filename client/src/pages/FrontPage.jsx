import { Link, Navigate, useNavigate } from "react-router-dom";

const FrontPage = () => {
    const navigate = useNavigate();
    
    // Function to handle smooth scrolling to sections
    const scrollToSection = (sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    };
    
    return (
        <div className="bg-gray-100">
            {/* Navbar */}
            <nav className="flex justify-between items-center p-5 bg-white shadow-md fixed w-full top-0 z-10">
                <div className="flex items-center">
                    <img src="/logo.png" alt="Hackalyze Logo" className="h-10 mr-2" />
                    <h1 className="text-xl font-bold">Hackalyze</h1>
                </div>
                <div>
                    <button onClick={() => scrollToSection('features')} className="mr-4 text-xl cursor-pointer">Features</button>
                    <button onClick={() => scrollToSection('competitions')} className="mr-4 text-xl cursor-pointer">Competitions</button>
                    <button onClick={() => scrollToSection('about')} className="text-xl cursor-pointer">About Us</button>
                </div>
                <div>
                    <button className="px-4 py-2 border border-black rounded hover:bg-gray-200" onClick={()=>{navigate('/login')}}>Log In</button>
                    <button className="px-4 py-2 bg-black text-white rounded ml-2 hover:bg-gray-800" onClick={()=>{navigate('/student/register')}}>Sign Up</button>
                </div>
            </nav>

            {/*Main*/}
            <section className="w-full mx-auto px-6 lg:px-20 h-screen flex flex-col lg:flex-row items-center justify-center">
                <div className="lg:w-1/2 space-y-4">
                    <h2 className="text-5xl font-bold">Empowering Innovation<br />Through Collaboration</h2>
                    <p className="text-gray-600 text-2xl">Join our platform to participate in exciting hackathons, learn from workshops, and showcase your skills to the world.</p>
                    <div className="space-x-4">
                        <button className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800">Get Started</button>
                        <button className="px-6 py-3 border border-gray-700 rounded-md hover:bg-gray-100">Explore Competitions</button>
                    </div>
                </div>
                <div className="lg:w-1/2 mt-8 lg:mt-0 flex justify-center">
                    <img src="https://res.cloudinary.com/dcnr31krq/image/upload/v1743031235/dl1detqkwl6mwdjxelzh.jpg" alt="Hackalyze" className="rounded-lg" />
                </div>
            </section>

            {/* Choose Your Path */}
            <section className="w-full min-h-screen flex flex-col items-center justify-center text-center px-5 bg-white">
                <h2 className="text-5xl font-bold">Choose Your Path</h2>
                <p className="text-gray-600 text-2xl mt-2">Access the platform based on your role and start your journey with us.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-6xl mx-auto">
                    {["Students", "Teachers", "Administrators"].map((role) => (
                        <div key={role} className="bg-white p-6 shadow-lg rounded-lg text-center">
                            <h3 className="text-2xl font-semibold">{role}</h3>
                            <p className="text-gray-600 text-xl">Login to access {role.toLowerCase()} features.</p>
                            <button className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800">
                                Login as {role}
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* What We Offer */}
            <section id="features" className="w-full h-screen flex flex-col items-center justify-center text-center px-5 bg-gray-200">
                <h2 className="text-5xl font-bold">What We Offer</h2>
                <p className="text-gray-600 mt-2 text-2xl">Our platform provides a comprehensive suite of tools for hackathon management and participation.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-6xl mx-auto">
                    {[
                        { title: "Hackathon Management", desc: "Create, manage, and track hackathons with ease." },
                        { title: "Workshop Platform", desc: "Conduct interactive workshops and share resources." },
                        { title: "Project Submission", desc: "Submit projects and receive feedback." },
                    ].map(({ title, desc }) => (
                        <div key={title} className="bg-white p-6 shadow-md rounded-lg text-center">
                            <h3 className="text-2xl font-semibold">{title}</h3>
                            <p className="text-gray-600 text-xl">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Upcoming Competitions */}
            <section id="competitions" className="w-full h-screen flex flex-col justify-center items-center text-center p-8 bg-white">
                <h2 className="text-5xl font-bold">Upcoming Competitions</h2>
                <p className="text-gray-600 mt-2 text-2xl">Participate in our exciting hackathons.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-6xl mx-auto">
                    {[...Array(3)].map((_, idx) => (
                        <div key={idx} className="bg-gray-100 p-6 rounded-lg shadow-lg">
                            <div className="h-40 bg-gray-200 flex items-center justify-center rounded-md">
                                <span>📷</span>
                            </div>
                            <h3 className="font-bold text-xl mt-4">Exciting Hackathons</h3>
                            <p className="text-gray-600 mt-2">Learn the latest technologies.</p>
                            <p className="text-gray-500 mt-2">March 27, 2025</p>
                            <button className="mt-4 bg-black text-white px-4 py-2 rounded hover:bg-gray-800">Register</button>
                        </div>
                    ))}
                </div>
            </section>

            {/* About Us */}
            <section id="about" className="w-full bg-gray-50 py-12">
                <div className="text-center">
                    <h2 className="text-5xl font-bold">About Us</h2>
                    <p className="text-gray-600 mt-2 text-2xl">Learn more about HackathonHub.</p>
                </div>
                <div className="container mx-auto px-4 mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl">
                    {[
                        { title: "Our Mission", desc: "We foster innovation through hackathons." },
                        { title: "Our Vision", desc: "A global community solving real-world problems." },
                        { title: "Our Team", desc: "Educators, developers, and students." },
                    ].map(({ title, desc }) => (
                        <div key={title} className="bg-white shadow-md rounded-lg p-6">
                            <h3 className="font-semibold text-2xl">{title}</h3>
                            <p className="text-gray-600 mt-2 text-xl">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default FrontPage;
