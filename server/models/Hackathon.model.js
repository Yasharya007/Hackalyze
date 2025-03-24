import mongoose from "mongoose";

const hackathonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index:true
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true,
    index:true
  },
  endDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String, 
    required: true
  },
  endTime: {
    type: String, 
    required: true
  },
  criteria: {
    type: [String],
    required: true,
  },
  selectedCriteria:{
    type:[String],
    required:true
  },
  allowedFormats: {
    type: [String],
    enum: ["Audio", "Video", "File","Image"],
    required:true
  },
  teachersAssigned: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    default: []
  }],
  registeredStudents:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    default:[]
  }],
  submissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Submission",
    default:[]
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
    index:true
  }
}, { timestamps: true });

export const Hackathon = mongoose.model("Hackathon", hackathonSchema);
