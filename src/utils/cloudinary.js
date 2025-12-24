// server pe file aa chuki hai ab uska local path leke main use cloudinary pe upload kara dunga.
//jaise hi coludinary pe succesfully upload ho jaye then apne server se remove kara do.

import { v2 as cloudinary } from 'cloudinary';
import fs from "fs" // filesystem liabrary of nodejs used while managing any file.

    

// Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET 
    });

     console.log("CLOUDINARY NAME:", process.env.CLOUDINARY_CLOUD_NAME);
    console.log("CLOUDINARY KEY:", process.env.CLOUDINARY_API_KEY);
    console.log("CLOUDINARY SECRET:", process.env.CLOUDINARY_API_SECRET);



    const uploadOnCloudinary = async(localFilePath) => {
        try {
            if (!localFilePath) return null
            // upload the file on cloudinary:
             const response = await cloudinary.uploader.upload(localFilePath,{
                resource_type:"auto"
             });
             //file has been uploaded succesfully
             // console.log("file is uploaded on cloudinary",response.url); // this url is kept in our DB
              fs.unlinkSync(localFilePath) // removes local temp file
              return response;

              console.log(response);
              


             
            } catch (error) {
              fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
              return null;
        }
    }


    export  {uploadOnCloudinary};










