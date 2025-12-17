import {Router} from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router() // creates a mini express app

router.route("/register").post(registerUser);
//router.post("/register", registerUser);



export default router // Default export → any import name allowed