import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student", 
       
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher", 
    
    },
    hackathonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hackathon", 
    },
    message: {
        type: String,
        required: true
    },
    typeofmessage: {
        type: String,
        enum: ["Hackathon Update", "Submission Status", "Announcement", "General"],
        default: "General"
    },
    sentAt: {
        type: Date,
        default: Date.now // Stores exact date and time of the notification
    }
}, { timestamps: true });


export const Notification = mongoose.model("Notification", NotificationSchema);
