import mongoose from "mongoose";

const TeacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "Teacher", immutable: true },
    organization: { type: String , default: " PI-JAM", immutable: true  },
    expertise: [{ type: String }], // Example: ["AI", "Blockchain"]
    contactNumber: { type: String },
    linkedin: { type: String },
    assignedHackathons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Hackathon" }],
}, { timestamps: true });

export default mongoose.model("Teacher", TeacherSchema);



