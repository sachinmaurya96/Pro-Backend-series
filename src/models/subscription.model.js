import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscriber:{
        type:Schema.Types.ObjectId,//subscriber 
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId, //channel subscribed by current user
        ref:"User"
    },

},{timestamps:true})

export const Subscription = mongoose.model("Subscription",subscriptionSchema)