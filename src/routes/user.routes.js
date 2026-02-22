import {Router} from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser, changeCurrentpassword,getCurrentUser,updateAccountDetails,updateUserAvatar,updateUsercoverImage, getUserProfile, getWatchHistory } from "../controllers/user.controller.js";
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

router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/password").patch(verifyJWT, changeCurrentpassword)
router.route("/current-user").post(verifyJWT, getCurrentUser)

router.route("/update-account-details").patch(verifyJWT, updateAccountDetails)
router.route("/update-User-Avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/update-User-cover-Image").patch(verifyJWT,upload.single("coverImage"), updateUsercoverImage)

//fetching from Url:
router.route("/c/:username").get(verifyJWT,getUserProfile)

router.route("/watch-History").get(verifyJWT,getWatchHistory)




export default router // Default export → so while import any import name is allowed


// if MW fails then register user run hi ni hoga..

/*
   👉 PATCH = update existing resource partially

   👉 POST = create new resource
*/