import mongoose, {Schema} from 'mongoose'
import { Video } from './video.model'
import { User } from './user.model'

const playlistSchema = new Schema(
{
   name:{
    type:String,
    required: true
 },
 description:{
    type:String,
    required: true
 },
 videos:
 [
      {
        types:Schema.Types.ObjectId,
        ref: Video
      }
 ],
 owner:{
    types: Schema.Types.ObjectId,
    ref: User
 }

},{timestamps: true})


export const Playlist = mongoose.model("Playlist",playlistSchema)