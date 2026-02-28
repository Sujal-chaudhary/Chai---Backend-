import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

/*So toggle here is not flipping a boolean field, it is create-or-delete of the like document.*/
 
const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId))
    {
        throw new ApiError(400,"video not found")
    }
    //Check if a like already exists for current user on this video:
    const like = await Like.findOne({video:videoId,likedBy:req.user._id}) //returns a doc
    /* .create() is a Model method ,
    delete is available on model and on a single document, but not on an array from find().*/
    
    if(like){
        await like.deleteOne() //unlike
    }else{
        await Like.create({video:videoId,likedBy:req.user._id}) //like
    }

return res
.status(200)
.json(new ApiResponse(200,"liked"))


})


const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //validation:
    if(!commentId || !mongoose.Types.ObjectId.isValid(commentId))
    {
        throw new ApiError(400,"video not found")
    }
    
    const like = await Like.findOne({comment: commentId,likedBy:req.user._id})

    if(like){
        await like.deleteOne() //unlike
    }else{
        await Like.create({comment:commentId,likedBy:req.user._id}) //like
    }

 return res
.status(200)
.json(new ApiResponse(200,"liked"))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //validation:
    if(!tweetId || !mongoose.Types.ObjectId.isValid(tweetId))
    {
        throw new ApiError(400,"tweet not found")
    }
    
    const like = await Like.findOne({tweet: tweetId,likedBy:req.user._id})

    if(like){
        await like.deleteOne() //unlike
    }else{
        await Like.create({tweet:tweetId,likedBy:req.user._id}) //like
    }

 return res
.status(200)
.json(new ApiResponse(200,"liked"))

    
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
         const {page = 1, limit = 10, sortby, sortType} = req.query
         //Sanitize i/p:

        let pageNumber = Number(page)
        if(Number.isNaN(pageNumber) || pageNumber<=0)
       {   pageNumber = 1} // assigned default values

        let limitNumber = Number(limit)
        if(Number.isNaN(limitNumber) || limitNumber<=0)
       {   limitNumber = 10} // assigned default values

      const skip =  (pageNumber - 1)* limitNumber

     
      /* Creating Dynamic Filter Object:-
       note:- query and userID are Optional filters
      */
       
      let filter = {}
       
       const userId = req.user._id // using verifyJWT 
       if(userId){
        filter.likedBy = userId
      }

      /* create dynamic sort object */
    
     let order = sortType === "asc" ? 1 : -1

      let sort = {
         createdAt: order
      }

  /*PAGINATION*/

  const userLikedVideos = await Like.aggregate([
    {
        $match:filter
    },
     {
        $sort:sort
    },
    {
        $skip:skip
    },
    {
        $limit:limitNumber
    },
    {
        $lookup:{
            from:"videos",
            localField:"video",
            foreignField:"_id",
            as:"likedVideos"
        }
    },
    {
        $unwind:"$likedVideos"// makes lookup array -> object
    },
    
   {
    
   $replaceRoot: { newRoot: "$likedVideos" }
   } //That makes each document become the video object directly.
   
   
  ])


 return res
  .status(200)
  .json(new ApiResponse(200,userLikedVideos,"likedVideos fetched successfully"))
  
})


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}