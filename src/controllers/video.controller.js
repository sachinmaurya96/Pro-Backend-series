import { Video } from "../models/video.model.js"
import { ApiResponse } from "../utills/ApiResponse.js"
import { asyncHandler } from "../utills/AsyncHandler.js"
import { ApiError } from "../utills/apiError.js"
import { uploadOnCloudinary } from "../utills/cloudinary.js"



const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description,tags,category} = req.body
    // TODO: get video, upload to cloudinary, create video
    const videoFileLoacalPath = req.files?.videoFile[0]?.path
    let thumbnailLocalPath ;
    if( 
        req.files &&
        Array.isArray(req.files.thumbnail) &&
        req.files.thumbnail.length > 0
    ){
        thumbnailLocalPath = req.files?.thumbnail[0]?.path
    }
    if(!videoFileLoacalPath){
        throw new ApiError(400,"video file is required")
    }
    const videoFile = await uploadOnCloudinary(videoFileLoacalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    const video = await Video.create({
        title,
        description,
        tags,
        category,
        thumbnail,
        videoFile:videoFile.url,
        thumbnail:thumbnail.url,
    })
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!videoId){
        throw new ApiError(404,"video id not found")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"video is not found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,video,"video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}