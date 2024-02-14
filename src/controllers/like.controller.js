import { Like } from "../models/like.model.js"
import { ApiResponse } from "../utills/ApiResponse.js"
import { ApiError } from "../utills/apiError.js"


const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    if(!videoId){
        throw new ApiError(400," videoId is missing")
    }
    try {
        const like = await Like.create({
            likedBy:req.user?._id,
            Video:videoId
        })
        return res
        .status(200)
        .json(new ApiResponse(200,like,"video liked"))
    } catch (error) {
        throw new ApiError(400,error.message)
    }
    //TODO: toggle like on video
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    if(!commentId){
        throw new ApiError(400," commentId is missing")
    }
    try {
        const comment = await Like.create({
            likedBy:req.user?._id,
            comment:commentId
        })
        return res
        .status(200)
        .json(new ApiResponse(200,comment,"comment liked"))
    } catch (error) {
        throw new ApiError(400,error.message)
    }
    //TODO: toggle like on comment

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    if(!tweetId){
        throw new ApiError(400," tweetId is missing")
    }
    try {
        const tweet = await Like.create({
            likedBy:req.user?._id,
            tweet:tweetId
        })
        return res
        .status(200)
        .json(new ApiResponse(200,tweet,"tweet liked"))
    } catch (error) {
        throw new ApiError(400,error.message)
    }
    //TODO: toggle like on tweet
}
)
export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
}