import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    // validation
    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Bad request")
    }
    //sanitize input
    let pageNumber = Number(page)
      if(Number.isNaN(pageNumber) || pageNumber<=0)
       {   pageNumber = 1} // assigned default values

    let limitNumber = Number(limit)
      if(Number.isNaN(limitNumber) || limitNumber<=0)
       {   limitNumber = 10} // assigned default values

      const skip =  (pageNumber - 1)* limitNumber

      //get the comments:
      const videoComments = await Comment.aggregate([
             {
                $match:{
                    video:new mongoose.Types.ObjectId(videoId)
                }
             },
              {
                 $skip:skip
               },
  
             {
                $limit:limitNumber
             }
      ])

      return res
      .status(200)
      .json(new ApiResponse(200,videoComments,"comments fetched successfully"))

})

const addComment = asyncHandler(async (req, res) => {
     const {videoId} = req.params
     // validation
    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Bad request")
    }
     const { content } = req.body
    if(!content?.trim()){
        throw new ApiError(400,"invalid input")
    }

    // adding comment
    const newComment = await Comment.create(
        {
            content:content.trim(),
            video:videoId,
            owner:req.user._id
        }
    )

     return res
    .status(201)
    .json(new ApiResponse(201,newComment,"comment created successfully"))

})

const updateComment = asyncHandler(async (req, res) => {
         const {commentId} = req.params // bcz i am talking about specific commnet only
     // validation
    if(!commentId || !mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400,"Bad request")
    }
     const { content } = req.body
    if(!content?.trim()){
        throw new ApiError(400,"invalid input")
    }

    //take out that comment doc
    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(400,"comment does not exist")
    }
   
    //only this comment owner can update it:
    if(comment.owner.equals(req.user._id)){
        comment.content = content.trim()
        await comment.save()
    }else{
         throw new ApiError(403,"unauthorised user")
    }

    return res
        .status(200)
        .json(new ApiResponse(200,comment,"comment updated successfully"))
    
})

const deleteComment = asyncHandler(async (req, res) => {
       const {commentId} = req.params
     // validation
    if(!commentId || !mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400,"Bad request")
    }

    const comment = await Comment.findById(commentId)
    if(!comment){
         throw new ApiError(404,"comment not fetched")
    }

    //only owner can delete the comment:
     if(comment.owner.equals(req.user._id)){
        comment.content = content.trim()
        await comment.delete()
    }else{
         throw new ApiError(403,"unauthorised user")
    }

    return res
        .status(200)
        .json(new ApiResponse(200,"comment updated successfully"))
      
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }