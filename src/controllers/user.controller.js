/*REGISTER A USER*/

import {asyncHandler} from "../utils/asyncHandler.js"; 
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js" // this user will talk to DB on our behalf.
import  {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler(
    async(req,res) => {
    /* Steps */
       // get user details from frontend (take help of postman) --> Extract kara rhe data
       // validation (checkings) - not empty
       // check if user already exists (username or email)
       // check for image, check for avatar
       // then upload them to cloudinary(then again check kar lo avatar gya hai ya nhi)
       // create user object - create entry in DB
       // now response me jo humne data create kiya wo as it is mil jata hai therefore remove password and refresh token field from response.
       // check for user creation
       // in the end return response (if user is registered properly) else throw error.


       // note: agar data forms/json se aa rha hai to wo req.body me aata hai (url ka scene thod alag hai)

       // step 1:(Data Extraction)
       const {fullname, email, username, password} = req.body //Extract kr rhe hai text data
       console.log("body: ", req.body);

       
       //step 2:(validation)
       if(
        [fullname, email, username, password].some((field) => field?.trim() === "")
       ){
        throw new ApiError(400,"All fields are required")
       }

       // step 3:(checking if user already exist or not)
       const existedUser = await User.findOne({
       $or: [{username},{email}]
      })

      if(existedUser) {
        throw new ApiError(409,"user with email or username already exist")
      } 

      //step 4: handling file
      const avatarLocalPath = req.files?.avatar[0]?.path
      // const coverImageLocalPath = req.files?.coverImage[0]?.path;
     
      let coverImageLocalPath;
      if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path
      } // now we will not get undefined error.
      

       if(!avatarLocalPath){
        throw new ApiError(400, "upload an avatar")
       }
       
       // checks if multer is saving our data on server:
        console.log("FILES:", req.files);
      // console.log("AVATAR PATH:", avatarLocalPath);
  

       //step 5:(uploading files on cloudinary)
        const avatar = await uploadOnCloudinary(avatarLocalPath) //timetaking
        const coverImage = await uploadOnCloudinary(coverImageLocalPath) //timetaking

        if(!avatar){
            throw new ApiError(400,"please upload an avatar")
        }

        //step 6:(making a user object and make entry in DB)
       const user = await User.create({
            fullname,
            avatar:avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        })
         
        //step 7:(check for user creation + removing password and referesh token fields from response)
    const CreatedUser = await User.findById(user._id).select(
      "-password -refreshToken"
    ) // by default mongoDB har ek entry ke sath ek " _id " attach kr deta hai therefoere asking that id to check wheethere user has been created or not.

    if(!CreatedUser){
      throw new ApiError(500, "something went wrong while registering user ")
    }
    
    //finally returning our response.
    return res.status(201).json(
      new ApiResponse(200, CreatedUser, "user Registered successfully" )
    )

    } 
)

export {registerUser};



/*
Server pe pehle MIDDLEWARE chalta hai (Multer)
upload.fields([...])


📌 Yahin pe sabse pehle ye kaam hota hai:

Request stream ko read karta hai

Binary data (files) ko:

disk / memory me save karta hai

Text fields ko:

parse karke req.body me daal deta hai

Files ka metadata:

req.files me daal deta hai

⛔ Controller abhi tak touch bhi nahi hua.


2. then mera registerUser call hota hai and command goes to controller ab bas yha data extracting chalti hai.

Uploading + text parsing = middleware ka kaam
Saving to DB = controller ka kaam

CLIENT (from frontend or postman)
  |
  |  multipart/form-data
  |
SERVER
  |
  |--> upload.fields()   ← Multer (files + text parse)
  |
  |--> registerUser()   ← DB logic, Cloudinary, validations
  |
RESPONSE


*/