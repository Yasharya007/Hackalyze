import React from "react";

const Contact = ({ isOpen, onClose }) => {
  if (!isOpen) return null; // Don't render if modal is not open

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 relative">
        <h2 className="text-xl font-semibold mb-2">Contact Support</h2>
        <p className="text-gray-600">📞 Phone: +91 98765 43210</p>
        <p className="text-gray-600">✉️ Email: support@hackathon.com</p>
        <button 
          onClick={onClose} 
          className="mt-4 w-full bg-indigo-500 text-white py-2 rounded-md hover:bg-indigo-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Contact;
