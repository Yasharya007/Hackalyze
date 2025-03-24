import { Hackathon } from "../models/Hackathon.model.js";
import { Teacher } from "../models/Teacher.model.js";
import { Student } from "../models/student.model.js";
import { Submission } from "../models/Submission.models.js";
import { Notification } from "../models/Notification.models.js";
import mongoose from "mongoose";

// Hackathon Management
export const createHackathon = async (req, res) => {
    try {
        const { 
            title, 
            description, 
            startDate, 
            endDate,
            startTime,
            endTime,
            criteria,
            selectedCriteria,
            allowedFormats,
            teachersAssigned
        } = req.body;
        
        // Check for existing hackathon with same title and startDate
        const existingHackathon = await Hackathon.findOne({ title, startDate });
        
        if (existingHackathon) {
            return res.status(400).json({
                 message: 'Hackathon already exists',
                 success: false
                });
        }
        
        // Create a hackathon object with all fields from request
        const hackathonData = {
            title,
            description,
            startDate,
            endDate,
            startTime,
            endTime,
            criteria,
            selectedCriteria,
            allowedFormats,
            teachersAssigned: teachersAssigned || []
        };

        // Add createdBy if user is authenticated
        if (req.user && req.user._id) {
            hackathonData.createdBy = req.user._id;
        } else {
            // For testing purposes, you can use a default admin ID or remove this check in production
            // This is a temporary solution until authentication is properly implemented
            const admins = await mongoose.connection.db.collection('admins').find({}).toArray();
            if (admins && admins.length > 0) {
                hackathonData.createdBy = admins[0]._id;
            } else {
                return res.status(401).json({
                    message: 'Authentication required to create hackathon',
                    success: false
                });
            }
        }
        
        const hackathon = await Hackathon.create(hackathonData);

         // Notify students about the new hackathon
         const students = await Student.find();
         await Promise.all(
             students.map(student =>
                 Notification.create({
                     studentId: student._id,
                     message: `A new hackathon "${title}" is upcoming. Start preparing!`,
                     typeofmessage: "Hackathon Announcement"
                 })
             )
         );

       return res.status(201).json({
        message: 'Hackathon Created Successfully',
        hackathon,
        success: true
    });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error in creating hackathon',
             error,
             success: false
        });
    }
};

export const getAllHackathons = async (req, res) => {
    try {
        const hackathons = await Hackathon.find()
            .populate('teachersAssigned', 'name email')
            .populate('registeredStudents', 'name email')
            .populate('submissions');
            
        res.json({
            hackathons,
            success: true
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error in retrieving hackathons',
            error,
            success: false 
        });
    }
};

export const getHackathonById = async (req, res) => {
    try {
        const hackathon = await Hackathon.findById(req.params.id);
        if (!hackathon) {
        return res.status(404).json({ 
         message: 'Hackathon not found',
         success: false
        });
        }
         res.json({
            hackathon,
            success: true
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error in retrieving hackathon', 
            error,
            success: false 
        });
    }
};

export const updateHackathon = async (req, res) => {
    try {
        const hackathon = await Hackathon.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({
            message: 'Hackathon updated successfully', 
            hackathon,
            success: true
        });
    } catch (error) {
        res.status(500).json({
             message: 'Error updating hackathon', 
             error,
             success: false
             });
    }
};

export const deleteHackathon = async (req, res) => {
    try {
        await Hackathon.findByIdAndDelete(req.params.id);
        res.json({ 
            message: 'Hackathon deleted successfully',
            success: true
         });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error in deleting hackathon',
             error,
             success: false
             });
    }
};

// Teacher Assignments
export const assignTeacher = async (req, res) => {
    try {
        const { hackathonId, teacherId } = req.body;
        await Hackathon.findByIdAndUpdate(hackathonId, { $push: { teachersAssigned: teacherId } });

         //Notify the teacher
         const notification = await Notification.create({
            teacherId,
            message: "You have been assigned to a hackathon.",
            typeofmessage: "Hackathon Update"
        });

        res.json({
             message: 'Teacher assigned successfully',
            //  notification,
            success: true
         });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error in assigning teacher',
             error,
             success: false
            });
    }
};

export const getAssignedTeachers = async (req, res) => {
    try {
        // Get all teachers
        const teachers = await Teacher.find().select('name email department');
        
        // Get all hackathons with teacher assignments
        const hackathons = await Hackathon.find({ teachersAssigned: { $exists: true, $not: { $size: 0 } } })
            .select('_id title teachersAssigned startDate endDate');
        
        // Create a map of teacher assignments with hackathon details
        const assignmentMap = new Map();
        
        // Process each teacher and find their assignments
        teachers.forEach(teacher => {
            assignmentMap.set(teacher._id.toString(), {
                id: teacher._id,
                name: teacher.name,
                email: teacher.email,
                department: teacher.department,
                assignedHackathons: []
            });
        });
        
        // Add hackathon assignments to each teacher
        hackathons.forEach(hackathon => {
            (hackathon.teachersAssigned || []).forEach(teacherId => {
                const teacherIdStr = teacherId.toString();
                if (assignmentMap.has(teacherIdStr)) {
                    const teacherData = assignmentMap.get(teacherIdStr);
                    teacherData.assignedHackathons.push({
                        id: hackathon._id,
                        title: hackathon.title,
                        startDate: hackathon.startDate,
                        endDate: hackathon.endDate
                    });
                    assignmentMap.set(teacherIdStr, teacherData);
                }
            });
        });
        
        // Convert map to array for response
        const teacherAssignments = Array.from(assignmentMap.values());
        
        res.json(teacherAssignments);
    } catch (error) {
        console.error('Error in retrieving teacher assignments:', error);
        res.status(500).json({ 
            message: 'Error in retrieving teacher assignments', 
            error,
            success: false
        });
    }
};


// Student Management
export const getRegisteredStudents = async (req, res) => {
    try {
        const students = await Student.find({ hackathonId: req.params.id });
        res.json(students);
    } catch (error) {
        res.status(500).json({
             message: 'Error in retrieving students',
              error,
              success: false
            });
    }
};

export const acceptFormat = async (req, res) => {
    try {
        const { studentId, acceptedFormat } = req.body;

        if (!studentId || !acceptedFormat) {
            return res.status(400).json({ 
                message: 'Student ID and accepted format are required', 
                success: false 
            });
        }

        await Student.findByIdAndUpdate(studentId, { 
            mediaAccepted: true, 
            acceptedFormat: acceptedFormat 
        });

        res.json({ 
            message: 'Media format accepted successfully', 
            success: true 
        });

    } catch (error) {
        res.status(500).json({ 
            message: 'Error in accepting media format', 
            error, 
            success: false 
        });
    }
};


// Submission Review
export const getAllSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find();
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error in retrieving submissions',
             error,
             success: false
             });
    }
};

export const getSubmissionById = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id);
        if (!submission) {
            return res.status(404).json({
                 message: 'Submission not found',
                success: false
             });
        }
        res.json(submission);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error retrieving submission', 
            error,
            success: false
         });
    }
};


export const shortlistSubmission = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id);
        if (!submission) {
            return res.status(404).json({
                message: "Submission not found",
                success: false
            });
        }

        submission.status = "Shortlisted";  
        await submission.save();

        res.json({
            message: "Submission shortlisted successfully",
            submission,
            success: true
        });

    } catch (error) {
        res.status(500).json({
            message: "Error shortlisting submission",
            error,
            success: false
        });
    }
};


export const notifyStudents = async (req, res) => {
    try {
        const { hackathonId, message } = req.body;
        const students = await Student.find({ hackathonId });
        
        const notifications = await Promise.all(
            students.map(student => Notification.create({
                studentId: student._id,
                message,
                typeofmessage: "Announcement"
            }))
        );

        res.json({ 
            message: 'Notifications sent successfully', 
            notifications
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error in sending notifications',
             error,
             success: false
             });
    }
};
export const publishFinalResults = async (req, res) => {
    try {
        const { hackathonId } = req.body;
        
        // Notify all students about final results
        const students = await Student.find({ hackathonId });
        const notifications = await Promise.all(
            students.map(student => Notification.create({
                studentId: student._id,
                message: "Final results have been published.",
                typeofmessage: "Hackathon Update"
            }))
        );
        
        res.json({
             message: 'Final results published successfully',
              notifications 
            });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error publishing final results', 
            error,
        success: false
     });
    }
};
export const removeAssignedTeacher = async (req, res) => {
    try {
        const { hackathonId, teacherId } = req.body;

        // Remove the teacher's ID from the assigned hackathon
        const hackathon = await Hackathon.findByIdAndUpdate(
            hackathonId,
            { $pull: { teachersAssigned: teacherId } },
            { new: true }
        );

        if (!hackathon) {
            return res.status(404).json({
                 message: "Hackathon not found",
                  success: false 
                });
        }

        res.json({
             message: "Teacher removed successfully",
              hackathon,
               success: true 
            });
    } catch (error) {
        res.status(500).json({ 
      message: "Error in removing teacher", 
      error,
    success: false
      });
    }
};
