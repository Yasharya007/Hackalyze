import { Submission } from "../models/Submission.models.js";
import { Student } from "../models/student.model.js";
import { Hackathon } from "../models/Hackathon.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
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
        const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
        const fileUrl = cloudinaryResponse.secure_url;  // Extract only the URL

        // Create new submission
        const newSubmission = new Submission({
            studentId,
            hackathonId,
            files: [{ format: fileType, fileUrl }], 
        });

        await newSubmission.save();

        // Add student id to hackathon model
        await Hackathon.findByIdAndUpdate(
            hackathonId,
            { $push: { registeredStudents: studentId } },
            { $push: { submissions: newSubmission._id } },
            { new: true } // Return updated document
          );


        res.status(201).json(new ApiResponse(201, newSubmission, "Submission successful"));

    } catch (error) {
        next(error);
    }
};

export const getSubmissionStatus = async (req, res) => {
    try {
      const {hackathonId } = req.body;
      const studentId = req.user._id;
      // Validate request
      if (!studentId || !hackathonId) {
        return res.status(400).json({ message: "studentId and hackathonId are required." });
      }
  
      // Find submission with only status & result fields
      const submission = await Submission.findOne({ studentId, hackathonId })
        .select("status result") // Select only status and result fields
        .exec();
  
        if (!submission) {
            return res.status(404).json({ message: "No submission found for this student in the given hackathon." });
          }
  
      res.status(200).json(submission);
    } catch (error) {
      console.error("Error fetching submission status:", error);
      res.status(500).json({ message: "Internal Server Error", error });
    }
  };