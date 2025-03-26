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
import { notifyStudents } from "../controllers/Admin.controllers.js";
import { publishFinalResults } from "../controllers/Admin.controllers.js";
import { removeAssignedTeacher } from "../controllers/Admin.controllers.js";
import { getActiveParticipantsCount } from "../controllers/Admin.controllers.js";
const router = express.Router();

// Hackathon Management
router.post('/hackathon', createHackathon);// swagger documented
router.get('/hackathons', getAllHackathons);// swagger documented
router.get('/hackathons/:id', getHackathonById);// swagger documented
router.put('/hackathon/:id', updateHackathon);// swagger documented
router.delete('/hackathon/:id', deleteHackathon);// swagger documented

// Teacher Assignments
router.post('/hackathon/assignteacher', assignTeacher);
router.get('/hackathon/teachers', getAssignedTeachers);

// Student Management
router.get('/hackathon/:id/students', getRegisteredStudents);
router.post('/hackathon/:id/accept-format', acceptFormat);
router.patch('/hackathon/:id/updatemedia-formats', acceptFormat);
router.get('/active-participants', getActiveParticipantsCount); // New endpoint for active participants count

// Submission 
router.get('/submissions', getAllSubmissions);// swagger documented
router.get('/submissions/:id', getSubmissionById);
router.put('/submissions/:id/shortlist', shortlistSubmission);// swagger documented

// Notifications & Result Publishing Routes
router.post('/notify-students', notifyStudents);
router.post('/publish-results', publishFinalResults);

//Remove Assigned Teacher
router.put('/remove-assigned-teacher', removeAssignedTeacher);

/**
 * @swagger
 * /api/admin/hackathon:
 *   post:
 *     summary: Create a new hackathon
 *     description: Admin can create a new hackathon by providing all required details.
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "AI Innovation Challenge"
 *               description:
 *                 type: string
 *                 example: "A hackathon focused on AI-driven solutions."
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-04-10"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-04-12"
 *               startTime:
 *                 type: string
 *                 format: time
 *                 example: "10:00 AM"
 *               endTime:
 *                 type: string
 *                 format: time
 *                 example: "05:00 PM"
 *               criteria:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Innovation", "Technical Complexity", "Impact"]
 *               selectedCriteria:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Innovation", "Impact"]
 *               allowedFormats:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Presentation", "Prototype"]
 *               teachersAssigned:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Dr. Smith", "Prof. Johnson"]
 *     responses:
 *       201:
 *         description: Hackathon successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 startDate:
 *                   type: string
 *                   format: date
 *                 endDate:
 *                   type: string
 *                   format: date
 *                 startTime:
 *                   type: string
 *                   format: time
 *                 endTime:
 *                   type: string
 *                   format: time
 *                 criteria:
 *                   type: array
 *                   items:
 *                     type: string
 *                 selectedCriteria:
 *                   type: array
 *                   items:
 *                     type: string
 *                 allowedFormats:
 *                   type: array
 *                   items:
 *                     type: string
 *                 teachersAssigned:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Bad request (Missing or invalid fields)
 *       401:
 *         description: Unauthorized (Admin access required)
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /api/admin/hackathons:
 *   get:
 *     summary: Get all hackathons
 *     description: Admin can retrieve a list of all hackathons.
 *     tags:
 *       - Admin
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of hackathons
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date
 *                   description:
 *                     type: string
 *       401:
 *         description: Unauthorized (Admin access required)
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/admin/hackathons/{id}:
 *   get:
 *     summary: Get hackathon details by ID
 *     description: Admin can retrieve details of a specific hackathon by providing its ID.
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the hackathon
 *         example: "12345"
 *     responses:
 *       200:
 *         description: Successfully retrieved hackathon details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "12345"
 *                 title:
 *                   type: string
 *                   example: "AI Innovation Challenge"
 *                 description:
 *                   type: string
 *                   example: "A hackathon focused on AI-driven solutions."
 *                 startDate:
 *                   type: string
 *                   format: date
 *                   example: "2025-04-10"
 *                 endDate:
 *                   type: string
 *                   format: date
 *                   example: "2025-04-12"
 *                 startTime:
 *                   type: string
 *                   format: time
 *                   example: "10:00 AM"
 *                 endTime:
 *                   type: string
 *                   format: time
 *                   example: "05:00 PM"
 *                 criteria:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Innovation", "Technical Complexity", "Impact"]
 *                 selectedCriteria:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Innovation", "Impact"]
 *                 allowedFormats:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Presentation", "Prototype"]
 *                 teachersAssigned:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Dr. Smith", "Prof. Johnson"]
 *       400:
 *         description: Bad request (Invalid or missing hackathon ID)
 *       401:
 *         description: Unauthorized (Admin access required)
 *       404:
 *         description: Hackathon not found
 */

/**
 * @swagger
 * /api/admin/hackathon/{id}:
 *   put:
 *     summary: Update hackathon details
 *     description: Admin can update details of a specific hackathon by providing its ID and updated data.
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the hackathon to update
 *         example: "12345"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "AI Innovation Challenge - Updated"
 *               description:
 *                 type: string
 *                 example: "An updated description of the AI hackathon."
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-04-15"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-04-17"
 *               startTime:
 *                 type: string
 *                 format: time
 *                 example: "09:00 AM"
 *               endTime:
 *                 type: string
 *                 format: time
 *                 example: "06:00 PM"
 *               criteria:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Innovation", "Technical Complexity", "Impact", "Feasibility"]
 *               selectedCriteria:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Innovation", "Feasibility"]
 *               allowedFormats:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Presentation", "Prototype", "Report"]
 *               teachersAssigned:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Dr. Smith", "Prof. Johnson", "Dr. Adams"]
 *     responses:
 *       200:
 *         description: Hackathon successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 startDate:
 *                   type: string
 *                   format: date
 *                 endDate:
 *                   type: string
 *                   format: date
 *                 startTime:
 *                   type: string
 *                   format: time
 *                 endTime:
 *                   type: string
 *                   format: time
 *                 criteria:
 *                   type: array
 *                   items:
 *                     type: string
 *                 selectedCriteria:
 *                   type: array
 *                   items:
 *                     type: string
 *                 allowedFormats:
 *                   type: array
 *                   items:
 *                     type: string
 *                 teachersAssigned:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Bad request (Invalid or missing data)
 *       401:
 *         description: Unauthorized (Admin access required)
 *       404:
 *         description: Hackathon not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/admin/hackathon/{id}:
 *   delete:
 *     summary: Delete a hackathon
 *     description: Admin can delete a specific hackathon by providing its ID.
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the hackathon to delete
 *         example: "12345"
 *     responses:
 *       200:
 *         description: Hackathon successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hackathon deleted successfully"
 *       400:
 *         description: Bad request (Invalid or missing hackathon ID)
 *       401:
 *         description: Unauthorized (Admin access required)
 *       404:
 *         description: Hackathon not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/admin/hackathon/{id}/students:
 *   get:
 *     summary: Get list of students registered for a hackathon
 *     description: Admin can retrieve a list of all students registered for a specific hackathon by providing its ID.
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the hackathon
 *         example: "12345"
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of registered students
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   studentId:
 *                     type: string
 *                     example: "s101"
 *                   name:
 *                     type: string
 *                     example: "John Doe"
 *                   email:
 *                     type: string
 *                     example: "johndoe@example.com"
 *       400:
 *         description: Bad request (Invalid or missing hackathon ID)
 *       401:
 *         description: Unauthorized (Admin access required)
 *       404:
 *         description: Hackathon not found or no students registered
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/admin/submissions:
 *   get:
 *     summary: Get all hackathon submissions
 *     description: Admin can retrieve a list of all submissions made for various hackathons, including submitted files, evaluation scores, and statuses.
 *     tags:
 *       - Admin
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of submissions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   submissionId:
 *                     type: string
 *                     example: "661b4c2e4f1a2b3c4d5e6f7g"
 *                   studentId:
 *                     type: string
 *                     example: "661b1a2b3c4d5e6f7g8h9i0j"
 *                   hackathonId:
 *                     type: string
 *                     example: "hack101"
 *                   files:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         format:
 *                           type: string
 *                           enum: ["Audio", "Video", "File", "Image"]
 *                           example: "File"
 *                         fileUrl:
 *                           type: string
 *                           example: "https://example.com/uploads/project123.zip"
 *                   description:
 *                     type: string
 *                     example: "AI-Powered Chatbot submission."
 *                   scores:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         parameter:
 *                           type: string
 *                           example: "Innovation"
 *                         score:
 *                           type: number
 *                           example: 9
 *                   totalScore:
 *                     type: number
 *                     example: 45
 *                   grade:
 *                     type: string
 *                     enum: ["Low", "Mid", "High"]
 *                     example: "High"
 *                   result:
 *                     type: string
 *                     enum: ["Rejected", "Revisit to check its potential", "Shortlisted for the final"]
 *                     example: "Shortlisted for the final"
 *                   reviewerId:
 *                     type: string
 *                     example: "661b5d6e7f8g9h0i1j2k3l4m"
 *                   status:
 *                     type: string
 *                     enum: ["Pending", "Reviewed", "Shortlisted", "Rejected"]
 *                     example: "Reviewed"
 *                   submissionTime:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-04-12T14:30:00Z"
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized (Admin access required)
 *       404:
 *         description: No submissions found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/admin/submissions/{id}/shortlist:
 *   put:
 *     summary: Shortlist a submission
 *     description: Admin can update a submission's status to "Shortlisted".
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the submission to be shortlisted
 *         example: "661b4c2e4f1a2b3c4d5e6f7g"
 *     responses:
 *       200:
 *         description: Submission successfully shortlisted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Submission has been shortlisted"
 *                 submissionId:
 *                   type: string
 *                   example: "661b4c2e4f1a2b3c4d5e6f7g"
 *                 status:
 *                   type: string
 *                   example: "Shortlisted"
 *       400:
 *         description: Bad request (Invalid or missing submission ID)
 *       401:
 *         description: Unauthorized (Admin access required)
 *       404:
 *         description: Submission not found
 *       500:
 *         description: Internal server error
 */

export default router;
