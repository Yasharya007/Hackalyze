import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { StudentRegisterAPI } from "../utils/api.jsx";

const StudentRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    college: "",
    grade: "",
    gender: "",
    state: "",
    district: "",
    password: "",
    agree: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNext = () => {
    if (step === 1 && (!formData.name || !formData.email || !formData.mobile)) return;
    if (step === 2 && (!formData.college || !formData.grade || !formData.gender)) return;
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    const { name, email, mobile, college, grade, gender, state, district, password, agree } = formData;

    if (!name || !email || !mobile || !college || !grade || !gender || !state || !district || !password) {
      toast.error("All fields are required");
      return;
    }

    StudentRegisterAPI(formData)
      .then((response) => {
        console.log(response);
        navigate("/login");
      })
      .catch(() => {});
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 w-screen">
      <div 
        style={{ backgroundImage: "url('/HackalyzeBG.webp')" }} 
        className="absolute top-4 left-4 right-4 h-100 bg-cover bg-center rounded-xl shadow-md flex flex-col text-white items-center justify-center"
      />

      <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 translate-y-10 bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-center font-bold text-xl mb-4">Student Registration</h2>

        {step === 1 && (
          <>
            <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded mb-2" required />
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded mb-2" required />
            <input type="tel" name="mobile" placeholder="Mobile Number" value={formData.mobile} onChange={handleChange} className="w-full p-2 border rounded mb-4" required />
          </>
        )}

        {step === 2 && (
          <>
            <input type="text" name="college" placeholder="School/College Name" value={formData.college} onChange={handleChange} className="w-full p-2 border rounded mb-2" required />
            <input type="text" name="grade" placeholder="Grade/Class" value={formData.grade} onChange={handleChange} className="w-full p-2 border rounded mb-2" required />
            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 border rounded mb-4">
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </>
        )}

        {step === 3 && (
          <>
            <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} className="w-full p-2 border rounded mb-2" required />
            <input type="text" name="district" placeholder="District" value={formData.district} onChange={handleChange} className="w-full p-2 border rounded mb-2" required />
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full p-2 border rounded mb-4" required />
            <div className="flex items-center">
              <input type="checkbox" name="agree" checked={formData.agree} onChange={handleChange} className="mr-2" />
              <label>I agree to the <span className="text-blue-600">Terms and Conditions</span></label>
            </div>
          </>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-4">
          {step > 1 && (
            <button 
              onClick={handleBack} 
              className="bg-gray-500 text-white py-2 px-4 rounded transition duration-300 ease-in-out hover:bg-gray-700 hover:scale-105"
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button 
              onClick={handleNext} 
              className="bg-blue-600 text-white py-2 px-4 rounded transition duration-300 ease-in-out hover:bg-blue-800 hover:scale-105"
            >
              Next
            </button>
          ) : (
            <button 
              onClick={handleSubmit} 
              className="bg-black text-white w-1/2 py-2 rounded transition duration-300 ease-in-out hover:bg-gray-900 hover:shadow-lg"
            >
              Sign up
            </button>
          )}
        </div>

        {/* Extra Options */}
        <div className="text-center mt-4">
          <p className="text-sm">
            Already registered? <span className="text-blue-600 cursor-pointer" onClick={() => navigate("/login")}>Sign in</span>
          </p>
          <p className="text-sm mt-2">
            Want to register as a Teacher? <span className="text-green-600 cursor-pointer" onClick={() => navigate("/teacher/register")}>Register here</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentRegister;
