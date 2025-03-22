import express from "express";
import {loginUser,registerTeacher,registerStudent } from "../controllers/authController.js";

const router = express.Router();

// Register 
router.post("/registerTeacher", registerTeacher);
router.post("/registerStudent", registerStudent);
// Login 
router.post("/login", loginUser);


export default router;
