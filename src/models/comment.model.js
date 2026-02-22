import mongoose, {Schema} from 'mongoose'
import mongooseAggregatePaginate from mongoose
import { Video } from './video.model'
import { User } from './user.model'

const commentSchema = new Schema({
      content:{
        type: String,
        required: true
      },
      video:{
        types:Schema.Types.ObjectId,
        ref: Video
      },
      owner:{
        types:Schema.Types.ObjectId,
        ref: User
      }

},{timestamps:true})

commentSchema.plugin(mongooseAggregatePaginate)


export const Comment =  mongoose.model("Comment",commentSchema)