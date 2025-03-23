import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import {Teacher} from "../models/Teacher.model.js"; 
import { Student } from "../models/student.model.js";
import { Admin } from "../models/Admin.models.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config()

// const getModelByRole = (role) => {
//     if (role === "student") return Student;
//     if (role === "teacher") return Teacher;
//     if (role === "admin") return Admin;
//     return null
// };

const generateTokens = async (userId, role) => {
    try {
        const models = { Admin, Teacher, Student };
        // const Model = getModelByRole(role);
        // if (!Model) throw new ApiError(400, "Invalid role");
        const user = await models[role].findById(userId);
        if (!user) throw new ApiError(404, "User not found");

        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        res.status(404).json({message: error.message})
    }
};

// Register Teacher (a Judge)
export const registerTeacher = async (req, res, next) => {
    try {
        const { name, email, password, organization, expertise, contactNumber, linkedin } = req.body;

        if (!email || !password||!name||!expertise||!contactNumber) {
            throw new ApiError(400, "All fields are required");
        }

        const existingTeacher = await Teacher.findOne({ email });
        if (existingTeacher) throw new ApiError(400, "Teacher already exists");
        const existingStudent = await Student.findOne({ email });
        if (existingStudent) throw new ApiError(400, "Student with same mail exist");
        // const hashedPassword = await bcrypt.hash(password, 10);
        const newTeacher = new Teacher({
            name, email, password, organization, expertise, contactNumber, linkedin
        });

        await newTeacher.save();
        res.status(201).json(new ApiResponse(201, newTeacher, "Teacher registered successfully"));

    } catch (error) {
        res.status(404).json({message: error.message})
    }
};
// export const registerAdmin = async (req, res, next) => {
//     try {
//         const { name, email, password } = req.body;

//         if (!email || !password||!name) {
//             throw new ApiError(400, "All fields are required");
//         }

//         // const existingTeacher = await Teacher.findOne({ email });
//         // if (existingTeacher) throw new ApiError(400, "Teacher already exists");
//         // const existingStudent = await Student.findOne({ email });
//         // if (existingStudent) throw new ApiError(400, "Student with same mail exist");
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const newAdmin = new Admin({
//             name, email, password:hashedPassword
//         });

//         await newAdmin.save();
//         res.status(201).json(new ApiResponse(201, newAdmin, "Teacher registered successfully"));

//     } catch (error) {
//         res.status(404).json({message: error.message})
//     }
// };
export const registerStudent = async (req, res, next) => {
    try {
        const { name, email, password, mobile,college, grade, gender, state, district } = req.body;

        // Validate required fields
        if (!name || !email || !password || !mobile || !college || !grade || !gender || !state || !district) {
            throw new ApiError(400, "All fields are required");
        }

        // Check if student already exists
        const existingStudent = await Student.findOne({ email });
        if (existingStudent) throw new ApiError(400, "Student already exists");
        const existingTeacher = await Teacher.findOne({ email });
        if (existingTeacher) throw new ApiError(400, "Teacher with same mail already exists");
        // Create new student
        const newStudent = new Student({
            name,
            email,
            password,
            mobileNumber:mobile,
            schoolCollegeName:college,
            grade,
            gender,
            state,
            district
        });

        // Save student to database
        await newStudent.save();

        res.status(201).json(new ApiResponse(201, newStudent, "Student registered successfully"));

    } catch (error) {
        res.status(404).json({message: error.message})
    }
};

// Login User
export const loginUser = async (req, res) => {
    try {
        const { email, password} = req.body;

        if (!email) throw new ApiError(400, "Email is required");
        if (!password) throw new ApiError(400, "Password is required");
        
        let user = null;
        let role = null;

        const models = { Admin, Teacher, Student };

        for (const [key, Model] of Object.entries(models)) {
            user = await Model.findOne({ email });
            if (user) {
                role = key;
                break;
            }
        }

        if (!user) throw new ApiError(404, `${role} does not exist`);

        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) throw new ApiError(401, `Invalid ${role} credentials`);

        const { accessToken, refreshToken } = await generateTokens(user._id, role);
        const loggedInUser = await models[role].findById(user._id).select("-password -refreshToken");

        const options = {
            httpOnly: true,
            secure: true,
        };

        res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, { user: loggedInUser, role }, `${role} logged in`));
    } catch (error) {
        console.log(error)
        res.status(404).json({message: error.message})
    }
};
export const logoutUser = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            throw new ApiError(401, "User not authenticated");
        }

        // Find the user across all roles
        const user =
            (await Student.findById(req.user._id)) ||
            (await Teacher.findById(req.user._id)) ||
            (await Admin.findById(req.user._id));

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Clear refresh token
        user.refreshToken = "";
        await user.save({ validateBeforeSave: false });

        // Clear cookies securely
        res.status(200)
            .clearCookie("accessToken", { httpOnly: true, secure: true, sameSite: "Strict" })
            .clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "Strict" })
            .json({ success: true, message: "Logged out successfully" });

    } catch (error) {
        res.status(error.statusCode || 500).json(new ApiError(error.statusCode || 500, error.message));
    }
};
