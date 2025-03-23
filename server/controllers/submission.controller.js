import { Submission } from "../models/Submission.models.js";
import { Student } from "../models/student.model.js";
import { Hackathon } from "../models/Hackathon.model.js";
import uploadOnCloudinary  from "../utils/cloudinary.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

export const submitHackathon = async (req, res, next) => {
    try {
        const { hackathonId, fileType } = req.body; // Extracting FormData fields
        const studentId = req.user._id; // Getting student ID from auth middleware

        if (!req.file) {
            throw new ApiError(400, "File is required for submission");
        }

        if (!["Audio", "Video", "File", "Image"].includes(fileType)) {
            throw new ApiError(400, "Invalid file type");
        }

        // Validate Student & Hackathon
        const student = await Student.findById(studentId);
        if (!student) throw new ApiError(404, "Student not found");

        const hackathon = await Hackathon.findById(hackathonId);
        if (!hackathon) throw new ApiError(404, "Hackathon not found");

        // Upload file to Cloudinary
        // Upload file to Cloudinary
const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
const fileUrl = cloudinaryResponse.secure_url;  // Extract only the URL


        const newSubmission = new Submission({
            studentId,
            hackathonId,
            files: [{ format: fileType, fileUrl }], 
            description:"file uploaded"
        });

        await newSubmission.save();

        res.status(201).json(new ApiResponse(201, newSubmission, "Submission successful"));

    } catch (error) {
        next(error);
    }
};
