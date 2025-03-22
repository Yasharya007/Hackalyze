import {v2 as cloudinary} from "cloudinary"
import fs from "fs" //file system
import dotenv from "dotenv"
dotenv.config();

cloudinary.config({ 
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret:process.env.CLOUDINARY_API_SECRET
});

 // Upload an image
 const uploadOnCloudinary=async(localFilePath)=>{
    try{
        if(!localFilePath) return null;
        //upload on cloudinary
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        fs.unlinkSync(localFilePath)
        return response;
    } 
    catch(error){
        fs.unlinkSync(localFilePath) //removing file from local storage
        return null;
    }
 }

 export default uploadOnCloudinary