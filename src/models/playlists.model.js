import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Playlist name is required"],
        unique:[true,"playlist with this name is already exist"],
    },
    description:{
        type:String,
    },
    videos:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video"
    }],
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
},{timestamps:true})


export const Playlist = mongoose.model("Playlist",playlistSchema)