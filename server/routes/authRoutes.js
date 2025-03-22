import express from "express";
import { register, loginUser } from "../controllers/authController.js";

const router = express.Router();

// Register 
router.post("/register", register);

// Login 
router.post("/login", loginUser);


export default router;
