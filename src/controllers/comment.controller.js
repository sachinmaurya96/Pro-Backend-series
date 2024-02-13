import { Comment } from "../models/comments.model.js"
import { ApiResponse } from "../utills/ApiResponse.js"
import { ApiError } from "../utills/apiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    if(!videoId){
        throw new ApiError(400,"videoid is missing")
    }
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    if(!videoId){
        throw new ApiError(400,"videoid is missing")
    }
    const {content} = req.body
    if(!content){
        throw new ApiError(400,"videoid is missing")
    }
    try {
        const comment = await Comment.create({
            owner:req.user?._id,
            content,
            videoId
        })
        return res 
        .status(200)
        .json(new ApiResponse(200,comment,"coment added successfully"))
    } catch (error) {
        throw new ApiError(400,error.message)
    }
    // TODO: add a comment to a video
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }