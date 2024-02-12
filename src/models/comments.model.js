import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    Video:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video",
        required:true
    },
    content:{
        type:String,
        required:true
    },
},{timestamps:true})


export const Comment = mongoose.model("Comment",commentSchema)