import { Hackathon } from "../models/Hackathon.model.js";
import { Teacher } from "../models/Teacher.model.js";
import { Student } from "../models/student.model.js";
import { Submission } from "../models/Submission.models.js";
import { Notification } from "../models/Notification.models.js";

// Hackathon Management
export const createHackathon = async (req, res) => {
    try {
        const { title, startDate } = req.body;
        const existingHackathon = await Hackathon.findOne({ title, startDate });
        
        if (existingHackathon) {
            return res.status(400).json({
                 message: 'Hackathon already exists',
                 success:false
                });
        }
        
        const hackathon = await Hackathon.create({
            title,
            description,
            startDate,
            endDate,
            startTime,
            endTime,
            criteria,
            selectedCriteria,
            allowedFormats,
            teachersAssigned,
            createdBy
        });

       return res.status(201).json({
        message:'Hackathon Created Successfully',
        hackathon,
        success:true
    });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error in creating hackathon',
             error,
             success:false
        });
    }
};
export const getAllHackathons = async (req, res) => {
    try {
        const hackathons = await Hackathon.find();
        res.json({
            hackathons,
            sucess:true
    });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error in retrieving hackathons',
             error,
             success:false 
            });
    }
};

export const getHackathonById = async (req, res) => {
    try {
        const hackathon = await Hackathon.findById(req.params.id);
        if (!hackathon) {
        return res.status(404).json({ 
         message: 'Hackathon not found',
         success:false
        });
        }
         res.json({
            hackathon,
            success:true
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error in retrieving hackathon', 
            error,
            success:false 
        });
    }
};

export const updateHackathon = async (req, res) => {
    try {
        const hackathon = await Hackathon.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({
            message: 'Hackathon updated successfully', 
            hackathon,
            success:true
        });
    } catch (error) {
        res.status(500).json({
             message: 'Error updating hackathon', 
             error,
             success:false
             });
    }
};

export const deleteHackathon = async (req, res) => {
    try {
        await Hackathon.findByIdAndDelete(req.params.id);
        res.json({ 
            message: 'Hackathon deleted successfully',
            success:true
         });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error in deleting hackathon',
             error,
             success:false
             });
    }
};

// Teacher Assignments
export const assignTeacher = async (req, res) => {
    try {
        const { hackathonId, teacherId } = req.body;
        await Hackathon.findByIdAndUpdate(hackathonId, { $push: { teachers: teacherId } });

         // Notify the teacher
         const notification = await Notification.create({
            teacherId,
            message: "You have been assigned to a hackathon.",
            typeofmessage: "Hackathon Update"
        });

        res.json({
             message: 'Teacher assigned successfully',
             notification,
            success:true
         });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error in assigning teacher',
             error,
             success:false
            });
    }
};

export const getAssignedTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find();
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error in retrieving teachers', 
            error,
            success:false
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
              success:false
            });
    }
};

export const acceptFormat = async (req, res) => {
    try {
        const { studentId } = req.body;
        await Student.findByIdAndUpdate(studentId, { mediaAccepted: true });
        res.json({ 
            message: 'Media accepted successfully',
         });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error in accepting media', 
            error,
            success:false
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
             success:false
             });
    }
};

export const getSubmissionById = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id);
        if (!submission) {
            return res.status(404).json({
                 message: 'Submission not found',
                success:false
             });
        }
        res.json(submission);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error retrieving submission', 
            error,
            success:false
         });
    }
};


export const shortlistSubmission = async (req, res) => {
    try {
        const submission = await Submission.findByIdAndUpdate(req.params.id, { shortlisted: true }, { new: true });
        res.json({ 
            message: 'Submission shortlisted successfully',
             submission,
            success:true
         });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error shortlisting submission',
             error,
             success:false
             });
    }
};
