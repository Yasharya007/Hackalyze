import express from "express";
<<<<<<< HEAD
import {loginUser,registerTeacher,registerStudent,logoutUser} from "../controllers/authController.js";
=======
import {loginUser,registerTeacher,registerStudent,logoutUser } from "../controllers/authController.js";
>>>>>>> 2f40e76e260efcacbc730291db18e0f47e904a44
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
