import express from "express";
import {loginUser,registerTeacher } from "../controllers/authController.js";

const router = express.Router();

// Register 
router.post("/registerTeacher", registerTeacher);

// Login 
router.post("/login", loginUser);


export default router;
