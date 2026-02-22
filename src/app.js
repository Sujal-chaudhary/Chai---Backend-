// using EXPRESS:

import express from 'express'
import cors from 'cors'
import cookieParser from "cookie-parser"

const app = express()

// CORS -> Cross-Origin Resource Sharing,CORS only blocks cross-origin reads by JavaScript

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
/* NOTE:-
now as we know humara data kai jagah se aayega in our backend url ,json, some req in form etc..

“Data kai jagah se aayega” = client can send data in many formats
→ so we configure middleware to parse everything properly

-> we use middlewares or when we do any configuration we take help of app.use() 
*/

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended:true , limit:"16kb"}))
 /*Frontend se jab tum form submit karte ho (like login form, contact form), toh data URL-encoded format me aata hai.

Ye middleware us data ko JavaScript object me convert karta hai, taaki tum backend me easily req.body ke through access kar sako.

you can also write without params
 */ 

app.use(express.static("public"))/* kabhi kabar koi files,image aayi to main use server pe hi rkahna chahta to main ek public folder aaise assests ko store krne ke liye bana deta hu taki anyone can access  */


app.use(cookieParser()) // browser se jo bhi cookies aaye server use read kr ske and unpe CRUD operation perform kar sake.





//routes import:
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.route.js"

//routes decleration:-

/*as pehle hum app.get directly use yha krte the beacuse hum route bhi yahi likh rhe the aur controller bhi but now they are seprated there we will use app.use() here */

app.use("/api/v1/users", userRouter) // when any user type "/users"the control will come in hand of userRouter then ye userRouter.js me jayenge aur puchega kya krna hai.

// http://localhost:8000/api/v1/users/register

app.use("/api/v1/videos",videoRouter) // ALL routes inside VideoRouter automatically belong to the videos resource.





 



export { app }