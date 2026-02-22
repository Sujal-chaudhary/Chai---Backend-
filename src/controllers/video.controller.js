import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { v2 as cloudinary } from 'cloudinary';
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination (SEARCHING API)

    /*Input sanitization and handling the null values
      reason : as req.query return each parameter in string format by default
    */
      
    let pageNumber = Number(page)
    if(Number.isNaN(pageNumber) || pageNumber <= 0){
          pageNumber = 1 // assigned default values
    }

    let limitNumber = Number(limit)
    if(Number.isNaN(limitNumber) || limitNumber <= 0){
        limitNumber = 10
    }

    const skip =  (pageNumber - 1)* limitNumber


    /* Creating Dynamic Filter Object:-
       note:- query and userID are Optional filters
    */
       
       let filter = {} // 👉 dynamically build filter , on the basis of this i will get my list 

       if(userId){
        filter.owner = userId
       }

       if (query) {
          filter.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } }
   ]
     
   /*
   $or = mongoDB uses to Search multiple fields
   $regex = to match partial text.
   $options = Case insensitive search


   MongoDB will find videos where:

     title contains query
       OR
     description contains query
   
   */
  }


  /* create dynamic sort object */

  let sort = {}

  if(sortBy){
    if(sortType === "asc"){
        order = 1
  }else{ order = -1 }

  sort[sortBy] = order

}

/* build dynamic objects first
then plug them into query stages
*/

/*PAGINATION*/
const videos = await Video.aggregate([
    { //Stage 1 — Match (filtering)
        $match:filter // see rather than writing filter manually i have directly us filter and sort here
    },
    { //Stage 2 — Sorting
        $sort:sort
    },
    {// Stage3 — manual pagination*(we can also use plugins)
       
        $skip:skip

    },
    {
        $limit:limitNumber
    }

])

if(!videos?.length){
     throw ApiError(200,"videos does not found")
} //not necessary for empty list,Let frontend decide what to show.

return res
.status(200)
.json(new ApiResponse(200,videos,"videos fetched successfully"))
  
})
// this above can be said as pagination/dymanic searching API.


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    if(!title?.trim() || !description?.trim()){
        throw new ApiError(400,"please enter the video details")
    }
    
    // multer starts acting so now i am taking out paths:

    const videoFileLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path
    
    if(!videoFileLocalPath){
        throw ApiError(400,"upload failed")
    }
    if(!thumbnailLocalPath){
         throw ApiError(400,"please upload video thumbnail")
    }

   // console.log("files:",req.files);
    

    //Upload files on cloudinary:

     const videoFile = await uploadOnCloudinary(videoFileLocalPath) //timetaking
     const thumbnail = await uploadOnCloudinary(thumbnailLocalPath) //timetaking

     /* const [videoFile, thumbnail] = await Promise.all([
       uploadOnCloudinary(videoFileLocalPath),
       uploadOnCloudinary(thumbnailLocalPath)
     ])

     This uploads both simultaneously.

      Not required — but production-grade improvement.
    */

     if(!videoFile ){
                 throw new ApiError(400,"please upload an videoFile ")
             }
     if(!thumbnail){
                 throw new ApiError(400,"please upload an thumbanil")
             }

       // making a video object & making entry in DB:
       
       const video = await Video.create({
            title,
            description,
            videoFile:{
                url:videoFile.url,
                public_id:videoFile.public_id
            },
            thumbnail:{
                url:thumbnail.url,
                public_id:thumbnail.public_id
            },
            
            owner:req.user._id
        })

       // check wheather the video is uploaded on DB or not 
       
       if(!video){
        throw new ApiError(500,"something went wrong while video upload")
       }

       return res
       .status(200)
       .json(new ApiResponse(200,video,"video Uploaded successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //handles only empty string and undefined
    if(!videoId?.trim()){
        throw new ApiError(400,"bad Request")
    }

    //👉 validate ObjectId format before querying.
    const isValidObjectId = mongoose.Types.ObjectId.isValid(videoId)
    if(!isValidObjectId){
        throw new ApiError(404,"inavlid Id")
    }

    //query DB
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"video not found")
    }

    return res
      .status(200)
      .json(new ApiResponse(200,video,"video fetched successfuly"))
})


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const {title,description} = req.body
    //validate
    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"video not found")
    }
     
    //DB query:-

    let updateFields = {}//made optional fields update 

    if(title) {updateFields.title = title}
    if(description) {updateFields.description = description}

     // Handle thumbnail if provided
    if(req.files?.thumbnail?.length){
        const thumbnail = await uploadOnCloudinary(
            req.files.thumbnail[0].path
        )

        if(!thumbnail){
            throw new ApiError(400,"Thumbnail upload failed")
        }

        updateFields.thumbnail = thumbnail.url
    }


    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { // put fields that you want to be updated
            $set:updateFields
        },{new:true}
    )

    if(!updatedVideo){
        throw new ApiError(404,"Video not found")
    }


    return res
    .status(200)
    .json(new ApiResponse(200,updatedVideo,"details got updated successfully"))

})


const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"video not found")
    }

    //get that video:-
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"video not fetched")
    }

    //Remove external resources (if applicable)
    if(video.owner.equals(req.user._id)){ // only owner should be allowed o delte the video
        await cloudinary.uploader.destroy(video.videoFile.public_id,{resource_type: "video"})
        /*Cloudinary default resource type = image.
          For video file, you should specify:
          resource_type: "video" */
        await cloudinary.uploader.destroy(video.thumbnail.public_id)
    }else{
        throw new ApiError(403,"Not authorized to modify this video")
    }

  // Remove document from MongoDB
    await video.deleteOne()

    // await Video.findByIdAndDelete(videoId)

    return res
    .status(200)
    .json(new ApiResponse(200,"video deleted successfully"))
    

})


const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //validate videoId
    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"video not found")
    }
     //fetch the video:-
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"video not fetched")
    }

    //Authorization check
    if(video.owner.equals(req.user._id)){
          video.isPublished = !video.isPublished
          await video.save()
    }else{
       throw new ApiError(403,"Not authorized to modify this video")
    }

    return res
    .status(200)
    .json(new ApiResponse(200))

})

/*On YouTube-like platform:

isPublished = true → video visible to public

isPublished = false → video hidden / draft / private

So this controller allows:

👉 Owner to publish or unpublish video. */


export{
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}

/*  Use this pattern for each controller and you’ll be safe:

Validate input early (params, body, query).
Fetch required data from DB.
Handle “not found” clearly (404).
Check authorization (403).
Perform action/update.
Return consistent response shape (ApiResponse with message + data).

*/