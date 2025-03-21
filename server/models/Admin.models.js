import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    managedHackathons: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Hackathon" 
    }], // List of hackathons the admin manages

    assignedTeachers: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Teacher" 
    }], // Tracks teachers assigned to hackathons

    notifications: [{ 
        message: String, 
        date: { type: Date, default: Date.now } 
    }], // Stores system messages for admins

    
},{timestamps:true});

export const Admin=mongoose.model("Admin", userSchema);