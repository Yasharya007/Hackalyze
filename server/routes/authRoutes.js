import express from "express";
import {loginUser,registerTeacher,registerStudent,logoutUser } from "../controllers/authController.js";
import { verifyUser } from "../middleware/auth.js";

const router = express.Router();

// Register 
router.post("/registerTeacher", registerTeacher);
router.post("/registerStudent", registerStudent);
// router.post("/registerAdmin", registerAdmin);
// Login 
router.post("/login", loginUser);
router.post("/logout",verifyUser,logoutUser)


export default router;
