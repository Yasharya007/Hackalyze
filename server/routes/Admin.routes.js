import express from "express";
import { createHackathon } from "../controllers/Admin.controllers.js";
import { updateHackathon } from "../controllers/Admin.controllers.js";
import { deleteHackathon } from "../controllers/Admin.controllers.js";
import { assignTeacher } from "../controllers/Admin.controllers.js";
import { getAssignedTeachers } from "../controllers/Admin.controllers.js";
import { getRegisteredStudents } from "../controllers/Admin.controllers.js";
import { acceptFormat } from "../controllers/Admin.controllers.js";
import { getAllSubmissions } from "../controllers/Admin.controllers.js";
import { getSubmissionById } from "../controllers/Admin.controllers.js";
import { shortlistSubmission } from "../controllers/Admin.controllers.js";
import { getAllHackathons } from "../controllers/Admin.controllers.js";
import { getHackathonById } from "../controllers/Admin.controllers.js";

const router = express.Router();

// Hackathon Management
router.post('/hackathon', createHackathon);
router.get('/hackathons', getAllHackathons);
router.get('/hackathons/:id', getHackathonById);
router.put('/hackathon/:id', updateHackathon);
router.delete('/hackathon/:id', deleteHackathon);

// Teacher Assignments
router.post('/hackathon/assign-teacher', assignTeacher);
router.get('/hackathon/teachers', getAssignedTeachers);

// Student Management
router.get('/hackathon/:id/students', getRegisteredStudents);
router.post('/hackathon/accept-media', acceptFormat);

// Submission Review
router.get('/submissions', getAllSubmissions);
router.get('/submissions/:id', getSubmissionById);
router.put('/submissions/:id/shortlist', shortlistSubmission);

export default router;
