import mongoose, {Schema} from 'mongoose'
import { User } from './user.model'

import mongooseAggregatePaginate from mongoose
/* This plugin adds pagination support for MongoDB aggregation pipelines. */

const videoSchema = new Schema(
    {
        videoFile: {
            type:String,// cloudinary url
            required: true,
        },
        thumbnail: {
            type:String,// cloudinary url
            required: true,
        },
        title: {
            type:String,
            required: true,
        },
        description: {
            type:String,
            required: true,
        },
        duration: {
            type:Number,
            required: true,
        },
        isPublished:{
            type: Boolean,
            default: true
        },
        views:{
            type: Number,
            default: 0
        },
        owner:{
            type: Schema.Types.ObjectId,
            ref: "User"

        }


    }
,{timestamps:true}
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)

/* we will use liabrary like bcrypt --> help us to hash password
   
as we know we used tokens so for that we will use a libarary JWT(json web tokens)

both the above liabrary are based on cryptography Algorithms as they both genreate tokens && you can visit a site JWT.io to see how tokens forms.

we are going to use them in every project.

*/