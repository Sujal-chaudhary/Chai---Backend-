import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Tweet } from "../models/tweet.model.js"
import { ApiResponse } from "../utils/ApiResponse"
import mongoose from "mongoose"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body
    if(!content){
        throw new ApiError(400,"invalid input")
    }

    //make DB call and create tweet obeject
    const newTweet = await Tweet.create(
        {
             owner:req.user._id,
             content
        }
    )

    return res
    .status(201)
    .json(new ApiResponse(201,newTweet,"tweet created successfully"))



})

const getUserTweets = asyncHandler(async (req, res) => {
    //taking out from url
    const { userId } = req.params
    //validate
    if(!userId || !mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(400,"userId does not exist")
    }

    const userTweets = await Tweet.find({owner:userId}) // returns an array of tweet
    
    return res
    .status(200)
    .json(new ApiResponse(200,userTweet,"User tweets fetched successfully"))

})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const {content} = req.body
    //validate
      if(!tweetId || !mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400,"tweetId does not exist")
    }
    if(!content?.trim()){
        throw new ApiError(400,"content not found")
    }
    
    //only auth users are allowed to update the tweet
    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
            throw new ApiError(404,"tweet not fetched")
        }
    if(tweet.owner.equals(req.user._id)){
      tweet.content = content.trim()
        await tweet.save()
    }else{
        throw new ApiError(403,"unauthorised user")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,tweet,"tweet updated successfully"))
    

})


const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //validate
      if(!tweetId || !mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400,"tweetId does not exist")
      }
    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
            throw new ApiError(404,"tweet not fetched")
        }
        //only owner can delete the tweet
        if(tweet.owner.equals(req.user._id)){
            await tweet.deleteOne()
        }else{
            throw new ApiError(403,"unauthorised")
        }


        return res
        .status(200)
        .json(new ApiResponse(200,"tweet deleted successfully"))

})


export {createTweet,getUserTweets,updateTweet,deleteTweet}

