import express from "express";
import { register, login, getLoggedInUser } from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Register 
router.post("/register", register);

// Login 
router.post("/login", login);

// Get Logged-in User
router.get("/user", verifyToken, getLoggedInUser);

export default router;
