//It only verify ki user is there or not 

import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async(req,res,next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")

        console.log(token);
        
    
        if(!token){
            throw new ApiError(401,"Unautorised request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        // token to genrerate kara loge par us token ko decode whi kar payega jiske pass secret key hogi
          
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            
            throw new ApiError(401, "invalid access token")
        }
    
        //now if user is there confirmed:
        
        req.user = user; // added an object in req
        next(); // used bcz agar koi route me dusra MW hai to use execute karo warna method call kro.
    
    } catch (error) {
        throw new ApiError(401,"invalid access token")
    }

})
