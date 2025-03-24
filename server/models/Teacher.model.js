import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import dotenv from "dotenv";
dotenv.config();

const TeacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "Teacher", immutable: true },
    organization: { type: String , default: " PI-JAM", immutable: true  },
    expertise: [{ type: String, required:true }], // Example: ["AI", "Blockchain"]
    contactNumber: { type: String, required:true },
    linkedin: { type: String },
    refreshToken: {type: String,default: ""},
    assignedHackathons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Hackathon",unique:true }],
}, { timestamps: true });


TeacherSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
      return next();
    }
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      return next();
    }catch (error) {
      return next(error);
    }
});
TeacherSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password)
}
TeacherSchema.methods.generateAccessToken=async function(){
    return await jwt.sign({_id:this._id},process.env.ACCESS_TOKEN_SECRET,{expiresIn:process.env.ACCESS_TOKEN_EXPIRY})
}
TeacherSchema.methods.generateRefreshToken=async function(){
    return await jwt.sign({_id:this._id},process.env.REFRESH_TOKEN_SECRET,{expiresIn:process.env.REFRESH_TOKEN_EXPIRY})
}
export const Teacher= mongoose.model("Teacher", TeacherSchema);



