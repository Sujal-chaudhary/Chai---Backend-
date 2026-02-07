import mongoose, {Schema} from 'mongoose'
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema (
    {
   username: {
    type: String,
    required: true,
    unique: true,
    lowercase:true,
    trim: true,
    index: true // helpful when you want to make any field searchable
   },
   email: {
    type: String,
    required: true,
    unique: true,
    lowercase:true,
    trim: true,
    },
   fullname: {
    type: String,
    required: true,
    lowercase:true,
    trim: true,
    index: true
    },
    avatar: {
        type: String, // cloudinary url
        required: true,
    },
    coverImage: {
        type: String, // cloudinary url
     },
     watchHistory:[
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
     ],
     password:{
        type: String,
        required: [true, 'Password is required'],// you can add msg with true fields.
     },
     refreshToken:{
        type: String
     }

},{timestamps: true})


// using async bcz Password encryption is time taking process

/* This is a Mongoose middleware (hook) that runs BEFORE a user document is saved in MongoDB. */
userSchema.pre("save", async function () {
     if(!this.isModified("password")) return;

     this.password = await bcrypt.hash(this.password, 10)
     
})
/*note:- if there will be change in this users field then har bar ye password save krega 
         therefore i want ki jab bhi changes password field me ho tabhi ye part run ho and password save ho hamara. 
         
         bcrypt.hash(plainTextPassword, saltRounds)

         plainTextPassword → "mypassword123"

      10 → salt rounds (security vs speed balance)

     More rounds = more secure but slower
     10 is industry standard 👍
         
         
         */
         

   //How to create custom methods in mongoose?
   
   userSchema.methods.isPasswordCorrect = async function (password) {
      return await bcrypt.compare(password, this.password)
   } 

   // JWT tokens:-

  /* This method creates a short-lived token used for:

    API authentication, Protected routes*/

   userSchema.methods.generateAccessToken = function(){
      return jwt.sign(
         {
            _id: this._id, // left is payload name and right is coming form our DB
            email: this.email,
            username: this.username,
            fullname: this.fullname
         },
         process.env.ACCESS_TOKEN_SECRET,
         {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
         }
   )
   }

   /* Refresh token:
       Lives longer, Used to generate new access tokens, Contains minimal data */
   userSchema.methods.generateRefreshToken = function(){
       return jwt.sign(
         {
            _id: this._id, // left is payload name and right is coming form our DB
         },
         process.env.REFRESH_TOKEN_SECRET,
         {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
         }
   )
   }



export const User = mongoose.model("User",userSchema)





/*Hum direct to encrypt kr nhi skte so we take help of some mongoose hooks(middlewares provided by mongoose are also called as pre and post hooks)


Middleware (also called pre and post hooks) are functions which are passed control during execution of asynchronous functions. Middleware is specified on the schema level and is useful for writing plugins

-->JWT tokens:-

jwt is a bearer token (ye token jiske bhi pass hai main usko data behj dunga so it is like a key)
it has a very strong security.

jwt liabrary make this token for us but we have to make some varibles to take it out from it.

*/



 