import {Router} from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"

const router = Router() // creates a mini express app

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

//router.post("/register", registerUser);



export default router // Default export → any import name allowed


// if MW fails then register user run hi ni hoga..