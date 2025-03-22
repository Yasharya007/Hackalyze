import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import {Teacher} from "../models/Teacher.model.js"; 
import { Student } from "../models/student.model.js";
import { Admin } from "../models/Admin.models.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config()

const getModelByRole = (role) => {
    if (role === "student") return Student;
    if (role === "teacher") return Teacher;
    if (role === "admin") return Admin;
    return null
};

const generateTokens = async (userId, role) => {
    try {
        const Model = getModelByRole(role);
        if (!Model) throw new ApiError(400, "Invalid role");
        const user = await Model.findById(userId);
        if (!user) throw new ApiError(404, "User not found");

        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Error generating tokens");
    }
};

// Register Teacher (a Judge)
export const registerTeacher = async (req, res, next) => {
    try {
        const { name, email, password, organization, expertise, contactNumber, linkedin } = req.body;

        if (!email || !password) {
            throw new ApiError(400, "Email and password are required");
        }

        const existingTeacher = await Teacher.findOne({ email });
        if (existingTeacher) throw new ApiError(400, "Teacher already exists");

        // const hashedPassword = await bcrypt.hash(password, 10);
        const newTeacher = new Teacher({
            name, email, password, organization, expertise, contactNumber, linkedin
        });

        await newTeacher.save();
        res.status(201).json(new ApiResponse(201, newTeacher, "Teacher registered successfully"));

    } catch (error) {
        next(error); // Pass the error to Express error handler
    }
};

// Login User
export const loginUser = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email) throw new ApiError(400, "Email is required");
        if (!password) throw new ApiError(400, "Password is required");
        if (!role) throw new ApiError(400, "Select a role");

        const Model = getModelByRole(role);
        const user = await Model.findOne({ email });
        if (!user) throw new ApiError(404, `${role} does not exist`);

        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) throw new ApiError(401, `Invalid ${role} credentials`);

        const { accessToken, refreshToken } = await generateTokens(user._id, role);
        const loggedInUser = await Model.findById(user._id).select("-password -refreshToken");

        const options = {
            httpOnly: true,
            secure: true,
        };

        res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, `${role} logged in`));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new ApiError(500,error.message));
    }
};
