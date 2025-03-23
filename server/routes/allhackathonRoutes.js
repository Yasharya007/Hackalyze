import express from "express";
import { getHackathonsByTeacher,getStudentCountForTeacherHackathons,getAllHackathons } from "../controllers/allhackathon.js";

const router = express.Router();

router.get("/teacher/:teacherId", getHackathonsByTeacher);

router.get("/teacher/:teacherId/students", getStudentCountForTeacherHackathons);
router.get("/list",getAllHackathons)
export default router;
