import {Router} from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router() // creates a mini express app

//Public routes:- Anyone can access

router.route("/register").post(
    upload.fields([ // files goes to req.files (we have to extract it from here)
        {
            name: "avatar", // field name
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1 
        }
    ]),
    registerUser
);

router.route("/login").post(loginUser)



//Secured routes(AUTH required)

router.route("/logout").post(
    verifyJWT,
    logoutUser)

router.route("/refresh-token").post(refreshAccessToken)



export default router // Default export → so while import any import name is allowed


// if MW fails then register user run hi ni hoga..