import express from "express";
import { getHackathonsByTeacher,getStudentCountForTeacherHackathons } from "../controllers/allhackathon.js";

const router = express.Router();

router.get("/teacher/:teacherId", getHackathonsByTeacher);

router.get("/teacher/:teacherId/students", getStudentCountForTeacherHackathons);

export default router;
