import  mongoose, {Model, Schema} from "mongoose"

const subscriptionSchema = new Schema({
    subscriber:{
        type: Schema.Types.ObjectId, // one who is subscribing
        ref: "User"
    },
    channel:{
    type: Schema.Types.ObjectId, 
    ref: "User"
    }
}, {timestamps: true})



export const Subscription = mongoose.model("Subscription",subscriptionSchema)

//detailed notes:
//https://chatgpt.com/share/698ca254-b2a8-8010-9c5f-6e9621b511a4