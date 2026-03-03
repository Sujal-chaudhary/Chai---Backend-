import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
     //validate the coming data
     if(!name?.trim() || !description?.trim()){
        throw new ApiError(400,"Name and description are required")
     }
     //create the playlist
     const newPlaylist = await Playlist.create(
        {
          name: name.trim(),
          description:description.trim(),
          owner:req.user._id
        }
     )

     
     return res
     .status(201)
     .json(new ApiResponse(201,newPlaylist,"playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => { //fetching many playlist so pagination is used
    const {userId} = req.params
    if(!userId || !mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(400,"user does not exist")
    }
    const {page=1, limit=10} = req.query
    //sanitize input
    let pageNumber = Number(page)
      if(Number.isNaN(pageNumber) || pageNumber<=0)
       {   pageNumber = 1} // assigned default values

    let limitNumber = Number(limit)
      if(Number.isNaN(limitNumber) || limitNumber<=0)
       {   limitNumber = 10} // assigned default values

      const skip =  (pageNumber - 1)* limitNumber

      //Aggregation pipeline:
      const playlists = await Playlist.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId)
            }
        },
        {
           $sort:{
            createdAt: -1
           }
        },
        {
            $skip: skip
        },
        {
            $limit:limitNumber
        }
      ])

      return res
      .status(200)
      .json(new ApiResponse(200,playlists,"user playlist fetched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params // here i have to fetch a specific playlist among many
    if(!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"user does not exist")
    }

    //fetch that playlist:
        const playlist = await Playlist.findById(playlistId)
        if(!playlist){
            throw new ApiError(400,"playlist does not exist")
        }    
         
        // Private playlist protection
        if (!playlist.owner.equals(req.user._id)) {
           throw new ApiError(403, "You are not allowed to access this playlist");
          }  

    
    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"playlist fetched successfully"))
    
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
   if(!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"Invalid ID")
    }
    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid ID")
    }

    const video = await Video.findById(videoId);
           if (!video) {
          throw new ApiError(404, "Video not found");
           }
 

    //get the playlist:
    const addvideos = await Playlist.findById(playlistId)
    if(!addvideos){
        throw new ApiError(404,"playlist not found")
    }
    //owner check:
    if(addvideos.owner.equals(req.user._id)){
        addvideos.videos.addToSet(videoId) // avoids duplicates
        await addvideos.save()
    }else{
        throw new ApiError(403, "You are not allowed to access this playlist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,addvideos,"video added successfully"))
    
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"Invalid ID")
    }
    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid ID")
    }

    const video = await Video.findById(videoId);
           if (!video) {
          throw new ApiError(404, "Video not found");
           }

    //get the playlist:
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404,"playlist not found")
    }
    if(playlist.owner.equals(req.user._id)){
       playlist.videos.pull(videoId)
       await playlist.save()
    }else{
        throw new ApiError(403,"Unauthorised")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"video removed"))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"Invalid ID")
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404,"playlist not found")
    }

      if(playlist.owner.equals(req.user._id)){
       playlist.deleteOne(playlistId)
    }else{
        throw new ApiError(403,"Unauthorised")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,null,"playlist removed"))

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
     if(!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"Invalid ID")
    }
    const {name, description} = req.body //only these fields are need to be updated
    if(!name?.trim() || !description?.trim()){
        throw new ApiError(400,"Name and description are required")
     }

     // fetch playlist first, check owner, then update.
     const playlist = await Playlist.findById(playlistId)
     if(!playlist){
        throw new ApiError(404,"playlist not found")
     }
     if(!(playlist.owner.equals(req.user._id))){
         throw new ApiError(403, "You are not allowed to update this playlist");
     }

     playlist.name = name.trim()
     playlist.description = description.trim()
     await playlist.save();

      return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist updated successfully"));
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}