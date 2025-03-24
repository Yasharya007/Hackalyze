import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRoutes.js"
import allhackathon from "./routes/allhackathonRoutes.js"
import FAQ from "./routes/FAQ.routers.js"
import hackathon from "./routes/hackathonRoutes.js"
import review from "./routes/reviewRoutes.js"
import seacrh from "./routes/searchRoutes.js"
import studentRouter from "./routes/student.routes.js"
import teacherRouter from "./routes/Teacher.routes.js"
import adminRouter from "./routes/Admin.routes.js"
import { swaggerSpec, swaggerUi } from "./utils/swaggerConfig.js";
import evaluationRouter from "./routes/evaluationRoutes.js"

dotenv.config({
    path:'./.env'
})


const app=express();
app.use(cookieParser())
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.json()) 
app.use(express.urlencoded({extended:false}))
app.use(express.static("public"))

// ROUTES
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRouter);
app.use('/api/allhackathon', allhackathon);
app.use('/api/FAQ', FAQ);
app.use('/api/hackathon', hackathon);
app.use('/api/review', review);
app.use('/api/search', seacrh);
app.use('/api/student',studentRouter);
app.use('/api/admin',adminRouter);
app.use('/api/teacher',teacherRouter)
app.use('/api/evaluation', evaluationRouter);

// MONGOOSE SETUP

//Connect database function
const connectDB=async()=>{
    try{
        const connectionInstance=await mongoose.connect(process.env.MONGO_URL)
        console.log(`MongoDB connected!, DB HOST : ${connectionInstance.connection.host}`)
    }catch(error){
        console.log("MONGODB connection error",error);
        process.exit(1);
    }
}



// starting server
const PORT=process.env.PORT || 8000
connectDB()
.then(()=>{
    app.listen(PORT,()=>console.log(`Server has started on Port: ${PORT}`))


}).catch((error)=>console.log(`${error} did not connect`))