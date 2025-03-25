import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import {Teacher} from "../models/Teacher.model.js"; 
import { Student } from "../models/student.model.js";
import { Admin } from "../models/Admin.models.js";
import dotenv from "dotenv";

dotenv.config();
export const verifyUser = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new ApiError(401, "Access token required");
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decoded || !decoded._id) {
            throw new ApiError(401, "Invalid access token");
        }

        // Identify user role and fetch user details
        let user = await Student.findById(decoded._id) ||
                   await Teacher.findById(decoded._id) ||
                   await Admin.findById(decoded._id);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        req.user = user; // Attach user to request
        next();
    } catch (error) {
        next(error);
    }
};

// Alias for verifyUser - to maintain consistency with route naming
export const isAuthenticated = verifyUser;

// Admin role check middleware
export const isAdmin = (req, res, next) => {
    try {
        // User has already been attached by verifyUser middleware
        const user = req.user;
        
        if (!user) {
            throw new ApiError(401, "Authentication required");
        }
        
        // Check if user is an Admin
        if (user.constructor.modelName !== "Admin") {
            throw new ApiError(403, "Admin access required");
        }
        
        next();
    } catch (error) {
        next(error);
    }
};