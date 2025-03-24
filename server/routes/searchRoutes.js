import express from "express";
import { searchHackathons } from "../controllers/searchController.js";

const router = express.Router();

//  Search Hackathons
router.get("/search", searchHackathons);

export default router;
