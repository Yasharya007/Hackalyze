import mongoose from "mongoose";

const parameterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  weight: { type: Number, default:100,min:0,max:100 } 
}, { _id: true });

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
  selectedCriteria: [
    {
      name: { type: String, required: true }, // Parameter name
      weight: { type: Number, required: true,default:100,min:0,max:100 }, // Weight assigned by the teacher
    },
  ],
  parameters: [parameterSchema],  
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
  shortlistedStudents: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    default: []
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
    index:true
  }
}, { timestamps: true });

export const Hackathon = mongoose.model("Hackathon", hackathonSchema);
