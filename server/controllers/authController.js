import Teacher from "../models/Teacher.model.js";
import Student from "../models/Student.js";
import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register Teacher (a Judge)
export const registerTeacher = async (req, res) => {
    try {
        const { name, email, password, organization, expertise, contactNumber, linkedin } = req.body;

        const existingTeacher = await Teacher.findOne({ email });
        if (existingTeacher) return res.status(400).json({ message: "Teacher already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newTeacher = new Teacher({
            name, email, password: hashedPassword, organization, expertise, contactNumber, linkedin
        });

        await newTeacher.save();
        res.status(201).json({ message: "Teacher registered successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Login User


export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = null;
        let role = null;

        // Check Admin First 
        user = await Admin.findOne({ email }).lean();
        if (user) {
            role = "admin";
        } else {
            // Check both Teacher & Student in parallel
            const teacherPromise = Teacher.findOne({ email }).lean();
            const studentPromise = Student.findOne({ email }).lean();
            const result = await Promise.allSettled([teacherPromise, studentPromise]);

            if (result[0].status === "fulfilled" && result[0].value) {
                user = result[0].value;
                role = "teacher";
            } else if (result[1].status === "fulfilled" && result[1].value) {
                user = result[1].value;
                role = "student";
            }
        }

        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });

        res.json({
            token,
            user: { id: user._id, name: user.name, role },
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
;
