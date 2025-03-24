import React from "react";
import Table from "./table";
import HackathonDetails from "./Hackathon";

const TeacherLanding = () => {
  return (
    <>
      {/* Hero Section with Image */}
      <div className="w-full h-[45vh]"> {/* 45% of viewport height */}
        <img
          src="https://i.pinimg.com/736x/c0/4f/94/c04f94832f0905efa2bc3c2d77e4b058.jpg"
          alt="Dev Heat Hackathon"
          className="w-full h-full object-cover rounded-md"
        />
      </div>

      {/* Layout Section */}
      <div className="flex bg-gray-100 p-6">
        {/* Main Content - Full List of Submissions */}
        <div className="w-3/4 mr-6">
          <Table />
        </div>

        {/* Right Sidebar - Sticky Hackathon Details */}
        <div className="w-1/4 h-fit sticky top-6">
          <HackathonDetails />
        </div>
      </div>
    </>
  );
};

export default TeacherLanding;
