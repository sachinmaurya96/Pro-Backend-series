import mongoose from "mongoose";


const PlaylistSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Playlist name is required"],
        unique:[true,"playlist with this name is already exist"],
    },
    description:{
        type:String,
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
   
},{timestamps:true})


export const Playlist = mongoose.model("Playlist",PlaylistSchema)