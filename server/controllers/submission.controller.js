import { Submission } from "../models/Submission.models.js";
import { Student } from "../models/student.model.js";
import { Hackathon } from "../models/Hackathon.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import bcrypt from "bcryptjs";
import mediaProcessingService from "../services/mediaProcessingService.js";

export const submitHackathon = async (req, res, next) => {
    try {
        const { hackathonId, fileType, isResubmission, submissionId } = req.body; // Extracting FormData fields
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
        
        // Check if hackathon deadline has passed
        const currentDate = new Date();
        const deadline = new Date(hackathon.endDate);
        if (currentDate > deadline) {
            throw new ApiError(400, "Hackathon deadline has passed, submissions are closed");
        }

        // Upload file to Cloudinary
        const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
        if (!cloudinaryResponse) {
            throw new ApiError(500, "File upload failed");
        }
        const fileUrl = cloudinaryResponse.secure_url;  // Extract only the URL

        // Extract text from the file
        console.log(`Extracting text from ${fileType} file: ${fileUrl}`);
        const extractedText = await mediaProcessingService.extractTextFromMedia(fileUrl, fileType);
        console.log(`Extracted text length: ${extractedText?.length || 0} characters`);

        if (isResubmission === "true" && submissionId) {
            // Handle resubmission - update existing submission
            const existingSubmission = await Submission.findById(submissionId);
            
            if (!existingSubmission) {
                throw new ApiError(404, "Original submission not found");
            }
            
            // Verify student owns this submission
            if (existingSubmission.studentId.toString() !== studentId.toString()) {
                throw new ApiError(403, "You are not authorized to update this submission");
            }
            
            // Replace the file in the submission and update description
            existingSubmission.files = [{ format: fileType, fileUrl }];
            existingSubmission.description = extractedText || "";
            await existingSubmission.save();
            
            return res.status(200).json(new ApiResponse(200, existingSubmission, "Submission updated successfully"));
        } else {
            // Handle new submission
            // Check if student is already registered for this hackathon
            const existingSubmission = await Submission.findOne({ 
                studentId,
                hackathonId
            });
            
            if (existingSubmission) {
                throw new ApiError(400, "You are already registered for this hackathon. Use the resubmit option to update your submission.");
            }

            // Create new submission with extracted text in description
            const newSubmission = new Submission({
                studentId,
                hackathonId,
                files: [{ format: fileType, fileUrl }],
                description: extractedText || "" 
            });

            await newSubmission.save();

            // Add student id to hackathon model
            await Hackathon.findByIdAndUpdate(
                hackathonId,
                { $push: { 
                    registeredStudents: studentId, 
                    submissions: newSubmission._id 
                } },
                { new: true } // Return updated document
            );

            return res.status(201).json(new ApiResponse(201, newSubmission, "Submission successful"));
        }
    } catch (error) {
        next(error);
    }
};

export const submitHackathonNew=async(req,res,next)=>{
    try {
      const submissions = req.body; // Expecting an array of objects

      if (!Array.isArray(submissions) || submissions.length === 0) {
          throw new ApiError(400, "Invalid or empty submissions array");
      }

      let savedSubmissions = [];

      for (const submission of submissions) {
          const { email, hackathonId, fileUrl, fileType } = submission;

          // Validate input
          if (!email || !hackathonId || !fileUrl || !fileType) {
              throw new ApiError(400, "Missing required fields: email, hackathonId, fileUrl, or fileType");
          }

          if (!["Audio", "Video", "File", "Image"].includes(fileType)) {
              throw new ApiError(400, "Invalid file type");
          }

          // Find student by email
          const student = await Student.findOne({ email });
          if (!student) throw new ApiError(404, `Student not found for email: ${email}`);

          const studentId = student._id;

          // Check if hackathon exists
          const hackathon = await Hackathon.findById(hackathonId);
          if (!hackathon) throw new ApiError(404, `Hackathon not found for ID: ${hackathonId}`);

          // Check if submission already exists to prevent duplicates
          const existingSubmission = await Submission.findOne({ studentId, hackathonId });
          if (existingSubmission) {
              console.log(`Submission already exists for ${email} in hackathon ${hackathonId}`);
              continue;
          }

          // Extract text from the file
          console.log(`Extracting text from ${fileType} file: ${fileUrl}`);
          const extractedText = await mediaProcessingService.extractTextFromMedia(fileUrl, fileType);
          console.log(`Extracted text length: ${extractedText?.length || 0} characters`);

          // Create new submission using the provided file URL and extracted text
          const newSubmission = new Submission({
              studentId,
              hackathonId,
              files: [{ format: fileType, fileUrl }],
              description: extractedText || ""
          });

          await newSubmission.save();
          savedSubmissions.push(newSubmission);

          // Update Hackathon model to add student and submission
          await Hackathon.findByIdAndUpdate(
              hackathonId,
              { 
                  $addToSet: { 
                      registeredStudents: studentId, 
                      submissions: newSubmission._id 
                  } 
              },
              { new: true }
          );

          // Update Student model: Check if student already participated in this hackathon
          const studentParticipation = student.hackathonsParticipated.find(
              (entry) => entry.hackathon.toString() === hackathonId
          );

          if (studentParticipation) {
              // Update existing participation status & submission ID
              await Student.findOneAndUpdate(
                  { _id: studentId, "hackathonsParticipated.hackathon": hackathonId },
                  {
                      $set: {
                          "hackathonsParticipated.$.submission": newSubmission._id,
                          "hackathonsParticipated.$.status": "Submitted"
                      }
                  }
              );
          } else {
              // Add a new participation entry
              await Student.findByIdAndUpdate(studentId, {
                  $push: {
                      hackathonsParticipated: {
                          hackathon: hackathonId,
                          submission: newSubmission._id,
                          status: "Submitted"
                      }
                  }
              });
          }
      }

      res.status(201).json(new ApiResponse(201, savedSubmissions, "submissions successful"));

  } 
  catch (error) {
      next(error);
  }
}

export const getSubmissionStatus = async (req, res) => {
    try {
      const { hackathonId } = req.body;
      const studentId = req.user._id;
      // Validate request
      if (!studentId || !hackathonId) {
        return res.status(400).json({ message: "studentId and hackathonId are required." });
      }
  
      // Find submission with only status & result fields
      const submission = await Submission.findOne({ studentId, hackathonId })
        .select("_id status result files") // Also include files and _id for resubmission
        .exec();
  
      if (!submission) {
        return res.json({ 
          isRegistered: false,
          message: "No submission found for this student in the given hackathon."
        });
      }
  
      return res.status(200).json({ 
        isRegistered: true,
        status: submission.status || "Registered",
        submission: submission
      });
    } catch (error) {
      console.error("Error fetching submission status:", error);
      res.status(500).json({ message: "Internal Server Error", error });
    }
};

// Get student profile
export const getStudentProfile = async (req, res, next) => {
    try {
        const { studentId } = req.params;
        
        // Find student profile
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json(new ApiResponse(404, null, "Student not found"));
        }

        // Get enrolled hackathons with submissions
        const enrolledHackathons = await Hackathon.find({
            registeredStudents: { $in: [studentId] }
        }).populate('submissions').lean();

        // Count submissions (hackathons where the student has submitted)
        const submissionsCount = await Submission.countDocuments({ studentId });

        // Prepare response object (exclude password)
        const profileData = {
            name: student.name,
            email: student.email,
            institution: student.schoolCollegeName,
            grade: student.grade,
            gender: student.gender,
            state: student.state,
            district: student.district,
            mobileNumber: student.mobileNumber,
            registeredHackathons: enrolledHackathons,
            submissions: submissionsCount
        };

        return res.status(200).json(new ApiResponse(200, profileData, "Student profile fetched successfully"));
    } catch (error) {
        console.error("Error fetching student profile:", error);
        next(error);
    }
};

// Update student profile
export const updateStudentProfile = async (req, res, next) => {
    try {
        const { studentId } = req.params;
        const { name, email, institution, grade, password } = req.body;

        // Validate if student exists
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json(new ApiResponse(404, null, "Student not found"));
        }

        // Prepare update object
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (institution) updateData.schoolCollegeName = institution;
        if (grade) updateData.grade = grade;

        // Hash password if provided
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        // Update student
        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            { $set: updateData },
            { new: true, select: '-password' } // Return updated document without password
        );

        return res.status(200).json(new ApiResponse(200, updatedStudent, "Profile updated successfully"));
    } catch (error) {
        console.error("Error updating student profile:", error);
        next(error);
    }
};

// Get enrolled hackathons
export const getEnrolledHackathons = async (req, res, next) => {
    try {
        const { studentId } = req.params;
        
        // Validate if student exists
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json(new ApiResponse(404, null, "Student not found"));
        }

        // Find all hackathons where student is registered
        const enrolledHackathons = await Hackathon.find({
            registeredStudents: { $in: [studentId] }
        });

        return res.status(200).json(new ApiResponse(200, enrolledHackathons, "Enrolled hackathons fetched successfully"));
    } catch (error) {
        console.error("Error fetching enrolled hackathons:", error);
        next(error);
    }
};