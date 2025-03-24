import { useState } from "react";
import { useSelector } from "react-redux";
const HackathonDetails = () => {
   const hackathon = useSelector((state) => state.hackathon.selectedHackathon);
   console.log(hackathon)
  // Hardcoded Hackathon Data for Testing
  // const hackathons = [
  //   {
  //     _id: "1",
  //     title: "AI Innovators Hackathon",
  //     description: "A competition focused on AI-driven solutions.",
  //     startDate: "2025-04-15",
  //     endDate: "2025-04-20",
  //     startTime: "10:00 AM",
  //     endTime: "05:00 PM",
  //     criteria: ["Innovation", "Code Quality", "Presentation"],
  //     allowedFormats: ["Audio", "Video", "File", "Image"],
  //     registeredStudents: ["stu1", "stu2", "stu3"],
  //   },
  // ];

  return (
    <div className="max-w-3xl mx-auto bg-gradient-to-br from-gray-700 to-black shadow-lg rounded-xl p-6 text-white border border-gray-600">
      <h2 className="text-3xl font-semibold text-center tracking-wide mb-6 border-b border-gray-500 pb-3">
         Hackathon Details
      </h2>
          <div className="bg-gray-900 shadow-md p-6 rounded-lg border-l-8 border-gray-500 mb-6">
            <h3 className="text-2xl font-bold text-gray-200 mb-3 tracking-wide">
              {hackathon.title}
            </h3>
            <p className="text-md text-gray-300 leading-relaxed">{hackathon.description}</p>

            <div className="mt-5 space-y-3 text-gray-300 text-sm">
              <p>
                <strong className="text-gray-400">📅 Start:</strong> {new Date(hackathon.startDate).toLocaleDateString()} at {hackathon.startTime}
              </p>
              <p>
                <strong className="text-gray-400">⌛ End:</strong> {new Date(hackathon.endDate).toLocaleDateString()} at {hackathon.endTime}
              </p>
            </div>

            <div className="mt-5 space-y-2">
              <p className="text-gray-300 text-sm">
                <strong className="text-gray-400">🔹 Criteria:</strong> {hackathon.criteria.join(", ")}
              </p>
              <p className="text-gray-300 text-sm">
                <strong className="text-gray-400">📂 Allowed Formats:</strong> {hackathon.allowedFormats.join(", ")}
              </p>
              <p className="text-gray-300 text-sm">
                <strong className="text-gray-400">👨‍🎓 Registered Students:</strong> {hackathon.registeredStudents.length}
              </p>
            </div>
          </div>

      
    </div>
  );
};

export default HackathonDetails;
