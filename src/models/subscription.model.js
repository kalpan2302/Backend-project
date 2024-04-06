import mongoose , {Schema} from "mongoose"

const subscriptionSchema = new Schema({
    subscriber : {
        type : Schema.Types.ObjectId,   // one who is subscribing
        ref : "User"
    },
    channel : {
        type : Schema.Types.ObjectId,   // one to whom subscriber is subscribing..
        ref : "User"
    }
},{timestamps:true}) 

export const Subscription = mongoose.model("Subscription",subscriptionSchema)


// youtube video(number 19) of chai aur code to understand the subscription and channel schema and how number of subscriber and channel which was subcribed is manage ..