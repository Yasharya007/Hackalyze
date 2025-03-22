import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

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
    refreshToken: {
        type: String,
        default: ""
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


AdminSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password)
}
AdminSchema.methods.generateAccessToken=async function(){
    return await jwt.sign({_id:this._id},process.env.ACCESS_TOKEN_SECRET,{expiresIn:process.env.ACCESS_TOKEN_EXPIRY})
}
AdminSchema.methods.generateRefreshToken=async function(){
    return await jwt.sign({_id:this._id},process.env.REFRESH_TOKEN_SECRET,{expiresIn:process.env.REFRESH_TOKEN_EXPIRY})
}
export const Admin=mongoose.model("Admin", AdminSchema);