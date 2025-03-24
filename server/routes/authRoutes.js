import express from "express";
import {loginUser,registerTeacher,registerStudent,logoutUser} from "../controllers/authController.js";
import { verifyUser } from "../middleware/auth.js";

const router = express.Router();

// Register 
router.post("/registerTeacher", registerTeacher);
router.post("/registerStudent", registerStudent);// swagger documented
// router.post("/registerAdmin", registerAdmin);
// Login 
router.post("/login", loginUser);// swagger documented
router.post("/logout",verifyUser,logoutUser)

/**
 * @swagger
 * /api/auth/registerStudent:
 *   post:
 *     summary: Register a new student
 *     description: Allows a student to register by providing necessary details.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - mobile
 *               - college
 *               - grade
 *               - gender
 *               - state
 *               - district
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "johndoe@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "SecurePass123!"
 *               mobile:
 *                 type: string
 *                 example: "9876543210"
 *               college:
 *                 type: string
 *                 example: "ABC Engineering College"
 *               grade:
 *                 type: string
 *                 example: "Final Year"
 *               gender:
 *                 type: string
 *                 enum: ["Male", "Female", "Other"]
 *                 example: "Male"
 *               state:
 *                 type: string
 *                 example: "Maharashtra"
 *               district:
 *                 type: string
 *                 example: "Pune"
 *     responses:
 *       201:
 *         description: Student successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Student registered successfully"
 *                 studentId:
 *                   type: string
 *                   example: "661b1a2b3c4d5e6f7g8h9i0j"
 *       400:
 *         description: Bad request (Missing or invalid fields)
 *       409:
 *         description: Conflict (Email already registered)
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User Login (Student, Admin, or Teacher)
 *     description: Allows any registered user (Student, Admin, or Teacher) to log in using their email and password. The system will automatically determine the user type.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "johndoe@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "SecurePass123!"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 userType:
 *                   type: string
 *                   enum: ["Student", "Admin", "Teacher"]
 *                   example: "Admin"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Bad request (Missing or invalid fields)
 *       401:
 *         description: Unauthorized (Invalid email or password)
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */


export default router;
