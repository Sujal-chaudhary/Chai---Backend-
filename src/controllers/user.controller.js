/*REGISTER A USER*/

import {asyncHandler} from "../utils/asyncHandler.js"; 
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js" // this user will talk to DB on our behalf.
import  {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { log } from "console";
import jwt from "jsonwebtoken"

//just a method:
const generateAcccessAndRefreshTokens = async(userId) => {
  try {
   const user = await User.findById(userId)
   const accessToken =  user.generateAccessToken()
   const refreshToken  = user.generateRefreshToken()

   user.refreshToken = refreshToken
   await user.save({validateBeforeSave: false}) // kuch validate na kro mere is field ko bas save kr do isse baki fields affect ni hongi

   return {accessToken, refreshToken};
    
  } catch (error) {
    throw new ApiError(500,"something went wrong")
  }
}




//Controllers:

const registerUser = asyncHandler(
    async(req,res) => {
    /* Steps */
       // get user details from frontend (take help of postman) --> Extract kara rhe data
       // validation (checkings) - not empty
       // check if user already exists (username or email)
       // check for image, check for avatar (as it is compuslory)
       // then upload them to cloudinary(then again check kar lo avatar gya hai ya nhi)
       // create user object(as it is nosql to objects hi banye jate and store karate) - create entry in DB
       // now response me, jo humne data create kiya wo as it is mil jata hai therefore remove password and refresh token field from response.
       // check for user creation
       // in the end return response (if user is registered properly) else throw error.


       // note: agar data forms/json se aa rha hai to wo direct req.body me aata hai but (url ka scene thod alag hai)

       // step 1:(Data Extraction)
       const {fullname, email, username, password} = req.body //Extract kr rhe hai text data
       console.log("body: ", req.body);
       
       
       

       
       //step 2:(validation)

       /*if(fullname === "" || email === "" || username ==="" || password ===""){
        throw new ApiError(400,"All fields are required")
      }*/
        
      // Better way:- we used .some() instead of .map() bcz that returns boolean but map returns an array
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

      //step 4: Handling file
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


const loginUser = asyncHandler(
  async(req,res) =>{
     /* Steps */
   //Fetch user data from req.body
   //username or email
   //find the user
   //check password
   // access and refresh token generate karwa do
   //send these tokens in form of cookies(secure)

   const {email, username, password} = req.body
  

   //validation
   if(!(username || email)) {
    throw new ApiError(400,"username or password is required")
   }

   //check weather user exist or not:
   const user = await User.findOne({
     $or: [{username}, {email}]
  })
   
  if(!user){
    throw new ApiError(400,"username or email is not found")
  }

  //is password correct:
 const isPasswordValid = await user.isPasswordCorrect(password)

 if(!isPasswordValid){
    throw new ApiError(401,"password incorrect")
  }

  //if password is correct then generate access and refersh token in thhe form of cookies:
  
 const {accessToken, refreshToken} = await generateAcccessAndRefreshTokens(user._id)

 //send response to loggedinuser

 const loggedInUser = await User.findById(user._id). // i get my user object it is searching by id field
 select("-password -refreshToken")



 //now we will send cookies:

 const options = {
  httpOnly: true, 
  secure: true
  //if both the fields are true then it is modified at the server level not on frontend
   }

 return res
 .status(200)
 .cookie("accessToken",accessToken, options)
 .cookie("refreshToken",refreshToken, options)
 .json(
  new ApiResponse(
    200,
    {
      user: loggedInUser, accessToken, refreshToken
      //we have send this again in case user want to save this in his locale storage
    },
    "User Logged In Successfully"

  )
 )
 
})


const logoutUser = asyncHandler(
  async(req,res) => {
     // first we will bring the user as we wrote the MW so now i can access user from my req.

     await User.findByIdAndUpdate(
      req.user._id,{

        $set: {
          refreshToken: undefined
              }
      },

      {
        new: true
      }
    )

    const options = {
   httpOnly: true, 
   secure: true
  }

  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},"user logged out"))
    


} )


const refreshAccessToken = asyncHandler(async(req,res)=> {
      //refreshToken le aayo from cookies:-
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
        if(!incomingRefreshToken){
          throw new ApiError(401,"Unautorised request")
          }
      // then validate kara dunga refresh tokens ko and decode it 
      try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
  
        //user ko le aunaga
        const user = await User.findById(decodedToken?._id)
        if(!user){
          throw new ApiError(401,"invalid refresh token")
        }
        
        //if matches then i will generate new refresh adn access token for the user
        if(incomingRefreshToken !== user?.refreshToken){
          throw new ApiError(401,"refresh token is expired or used")
        }
  
         const {accessToken, newrefreshToken} = await user.generateAcccessAndRefreshTokens(user._id)
  
        const options = {
           httpOnly: true, 
           secure: true
        }
        
        return res
        .status (200)
        .cookie("accessToken",accessToken)
        .cookie("refreshToken",newrefreshToken)
        .json(new ApiResponse(
           200,
           {accessToken, refreshToken: newrefreshToken},
           "Access token refreshed"
        ))
  
      } catch (error) {
        throw new ApiError(401,"invalid refresh token")
      }
})







export {registerUser,loginUser,logoutUser,refreshAccessToken};



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