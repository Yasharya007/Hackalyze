import express from "express";
import { submitHackathon } from "../controllers/submission.controller.js";
import { verifyUser } from "../middleware/auth.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

router.post("/submit", verifyUser, upload.single("file"), submitHackathon);

export default router;
