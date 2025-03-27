import express from "express";
import { submitHackathon,getSubmissionStatus,submitHackathonNew, getStudentProfile, updateStudentProfile, getEnrolledHackathons } from "../controllers/submission.controller.js";
import { verifyUser } from "../middleware/auth.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

router.post("/submit", verifyUser, upload.single("file"), submitHackathon);// swagger documented
router.post("/submit/bulk", verifyUser,submitHackathonNew); // Swagger Documented
router.post("/status",verifyUser,getSubmissionStatus)

// New routes for student profile and enrolled hackathons
router.get("/profile/:studentId", verifyUser, getStudentProfile);
router.put("/update/:studentId", verifyUser, updateStudentProfile);
router.get("/enrolled-hackathons/:studentId", verifyUser, getEnrolledHackathons);

/**
 * @swagger
 * /api/student/submit:
 *   post:
 *     summary: Submit hackathon entry
 *     description: Allows a student to submit a file for a hackathon.
 *     tags:
 *       - Student
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - hackathonId
 *               - fileType
 *               - file
 *             properties:
 *               hackathonId:
 *                 type: string
 *                 example: "661b4c2e4f1a2b3c4d5e6f7g"
 *               fileType:
 *                 type: string
 *                 enum: ["Audio", "Video", "File", "Image"]
 *                 example: "Video"
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to be uploaded
 *     responses:
 *       200:
 *         description: Submission successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Submission successful"
 *                 submissionId:
 *                   type: string
 *                   example: "662c7f8a9b0c1d2e3f4g5h6i"
 *       400:
 *         description: Bad request (Missing hackathon ID, fileType, or file)
 *       401:
 *         description: Unauthorized (User must be logged in)
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/student/submit/bulk:
 *   post:
 *     summary: Submit multiple hackathon entries
 *     description: Allows students to submit multiple hackathon entries at once.
 *     tags:
 *       - Student
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               submissions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: "student@example.com"
 *                     hackathonId:
 *                       type: string
 *                       example: "660d2e57a4b3d16f5c9a93bc"
 *                     fileUrl:
 *                       type: string
 *                       format: uri
 *                       example: "https://example.com/uploads/submission.pdf"
 *                     fileType:
 *                       type: string
 *                       enum: ["Audio", "Video", "File", "Image"]
 *                       example: "File"
 *     responses:
 *       201:
 *         description: Submissions created successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */

export default router;