import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';


export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Restrict role assignment to prevent unauthorized admin registration
        let assignedRole = role;
        if (role === 'admin') return res.status(403).json({ message: "Admin account cannot be created this way" });

        // Create new user
        const newUser = new User({ name, email, password: hashedPassword, role: assignedRole });
        await newUser.save();

        res.status(201).json({ message: `${role} registered successfully` });
    } catch (error) {
        res.status(500).json({ message: "Error registering user", error });
    }
};


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
       
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
        
        // Generate JWT Token
        
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error });
    }
};


export const getLoggedInUser = async (req, res) => {
    try {
        const token = req.header("Authorization")?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "No token provided" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};
