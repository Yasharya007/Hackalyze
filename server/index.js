import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRoutes.js"

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
app.use('/api/auth', authRouter);
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