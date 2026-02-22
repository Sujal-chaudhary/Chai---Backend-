import mongoose, {Schema} from 'mongoose'
import { Comment } from './comment.model'
import { User } from './user.model'

const likeSchema = new Schema({
 video:{
        types:Schema.Types.ObjectId,
        ref: Video
      },
      
 comment:{
        types:Schema.Types.ObjectId,
        ref: Comment
      },
 likedBy:{
        types:Schema.Types.ObjectId,
        ref: User
      },
 tweet:{
        types:Schema.Types.ObjectId,
        ref: Tweet
      },


},{timestamps:true})

export const Like = mongoose.model("Like",likeSchema)