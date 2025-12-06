// require('dotenv').config({path: './env'})


// import mongoose from 'mongoose';
// import {DB_NAME} from "./constants";
import connectDB from './db/index.js';
import dotenv from 'dotenv'

dotenv.config({path: './env'})

connectDB()

// every async process after completion return a promise
.then(() => {
  app.listen(process.env.PORT || 8000,() => {
    console.log(`server is running at ${process.env.PORT}`);
  }) // now our server will with start listening.
})
.catch((error) => {
  console.log("mongoDB connection failed !!!",error);
  
});








{/* 1st Approach */}
/* sometimes we initialize app here only which is made by express
import express from "express";
const app = express()

//IIFE (Immediately Invoked Function Expression)
// Ye ek function hota hai jo banate hi turant execute ho jata hai, bina usko alag se call kiye.

(async() =>  {
    try {
      await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
      console.log("DB connected")

      app.on("error", (error) => {console.log("ERROR:",error) // Listener (as sometimes there is error is on server side)
        throw error
      })

      app.listen(process.env.PORT,() => {
        console.log(`app is listening on ${process.env.PORT}`);
        
      })
    } catch (error) {
        console.log("MongoDB connection ERROR:",error);
        throw error;
    }
})()


We use async–await here because:-

Mongoose.connect() is asynchronous
 
We must wait for DB to connect before starting server

We must catch errors properly

We cannot use top-level await directly → so IIFE

Backend initialization is asynchronous by nature

*/