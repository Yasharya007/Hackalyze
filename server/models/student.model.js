import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import dotenv from "dotenv";
dotenv.config();

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim:true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  schoolCollegeName: {
    type: String,
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'], 
    required: true
  },
  state: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  hackathonsParticipated: [
    {
      hackathon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hackathon"
      },
      submission: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Submission"
      },
      status: {
        type: String,
        enum: ["Registered", "Submitted", "Reviewed", "Shortlisted"],
        default: "Registered"
      }
    }
  ],
  refreshToken: {
    type: String,
    default: ""
  }
});
studentSchema.pre('save', async function (next) {
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
studentSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password)
}
studentSchema.methods.generateAccessToken=async function(){
    return await jwt.sign({_id:this._id},process.env.ACCESS_TOKEN_SECRET,{expiresIn:process.env.ACCESS_TOKEN_EXPIRY})
}
studentSchema.methods.generateRefreshToken=async function(){
    return await jwt.sign({_id:this._id},process.env.REFRESH_TOKEN_SECRET,{expiresIn:process.env.REFRESH_TOKEN_EXPIRY})
}
export const Student = mongoose.model('Student', studentSchema);