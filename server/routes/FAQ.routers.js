import express from "express";
import { getAllFAQs } from "../controllers/FAQ.controllers.js";
const router = express.Router();

router.get("/faqs", getAllFAQs); // Route to get all FAQs

export default router;
