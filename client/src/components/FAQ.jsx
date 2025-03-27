import { useState } from "react";
import { useNavigate } from "react-router-dom";

const faqs = [
  {
    question: "How are hackathon results judged?",
    answer: "Results are judged based on innovation, feasibility, design, and impact. Each criterion has a specific weightage.",
  },
  {
    question: "Can I view the detailed feedback from judges?",
    answer: "Yes, after results are published, participants can view judge comments and scores on their dashboard.",
  },
  {
    question: "What happens in case of a tie?",
    answer: "In case of a tie, additional criteria such as code efficiency and project scalability are considered.",
  },
  {
    question: "How do I contact support for queries?",
    answer: "You can reach out to support via email at support@hackathon.com or call +91 98765 43210.",
  },
];

export default function FAQ({ setIsModalOpen }) {
  const [openIndex, setOpenIndex] = useState(null);
  const navigate = useNavigate();

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="w-[75%] bg-white shadow-md py-3 px-8 flex justify-between items-center fixed top-6 left-1/2 transform -translate-x-1/2 rounded-xl">
        <div className="flex items-center">
          <img src="/logo.png" alt="Hackalyze Logo" className="h-8 mr-2" />
          <h1 className="text-lg font-semibold">Hackalyze</h1>
        </div>
        <div className="space-x-7">
          <span onClick={() => navigate("/faq")} className="text-gray-600 hover:text-gray-900 hover:cursor-pointer font-semibold">FAQ</span>
          <span onClick={() => navigate("/announcements")} className="text-gray-600 hover:text-gray-900 hover:cursor-pointer">Announcements</span>
        </div>
        <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 hover:cursor-pointer" onClick={() => setIsModalOpen(true)}>
          Contact Support
        </button>
      </nav>

      {/* 🔹 FAQ Section */}
      <div className="flex flex-col items-center pt-24 px-6 w-screen">
        <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="w-full max-w-2xl">
          {faqs.map((faq, index) => (
            <div key={index} className="mb-4 border border-gray-300 rounded-lg overflow-hidden">
              <button
                className="w-full text-left p-4 bg-white flex justify-between items-center"
                onClick={() => toggleFAQ(index)}
              >
                <span className="font-semibold">{faq.question}</span>
                <span>{openIndex === index ? "▲" : "▼"}</span>
              </button>
              {openIndex === index && (
                <div className="p-4 bg-gray-50 text-gray-700">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
