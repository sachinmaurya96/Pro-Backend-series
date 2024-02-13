import { Video } from "../models/video.model.js"
import { ApiResponse } from "../utills/ApiResponse.js"
import { asyncHandler } from "../utills/AsyncHandler.js"
import { ApiError } from "../utills/apiError.js"
import { uploadOnCloudinary } from "../utills/cloudinary.js"



const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10,title,userId} = req.query
    const totalVideos = await Video.countDocuments().exec()
    const totalPages = Math.floor(totalVideos%limit===0?totalVideos/limit:totalVideos/limit+1)
    //calculate skip value based on page and limit
    const skip = (Number(page) - 1) * (Number(limit))

    //construct the base query to filter products
    const query = Video.find({})

    if(title){
        query.where("title").regex(new RegExp(title,"i"))
    }
    if(userId){
        query.where("owner").equals(userId)
    }
    try {
        const videos = await query
        .skip(skip)
        .limit(Number(limit))
        .exec()
        res.set("total-pages",totalPages)
        return res
        .status(200)
        .json(new ApiResponse(200,videos,"videos fetched succesfully"))
    } catch (error) {
        throw new ApiError(500,"error while fetching videos")
    }

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    console.log(title,description)
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
    if(!videoFile || !thumbnail){
        throw new ApiError(500,"Error while uploadindg video or thumbnail on cloudinary")
    }
    const video = await Video.create({
        title:title,
        description:description,
        videoFile:videoFile.url,
        thumbnail:thumbnail.url,
        duration:videoFile.duration
    })
    if(!video){
        throw new ApiError(400,"video not found")
    }
    return res 
    .status(200)
    .json(new ApiResponse(200,video,"video uploaded succesfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!videoId){
        throw new ApiError(404,"video id not found")
    }

    const video = await Video.findById(videoId).populate({
        path:"owner",
        select:"fullName username avatar"
    })
    const channel = await Video.aggregate([
        {
            $lookup:{
                from:"subscriptions",
                localField:"owner",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                subscribersCount:1,
                isSubscribed:1
            }
        }

    ])
    if(!video){
        throw new ApiError(404,"video is not found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,{...video,...channel},"video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400,"videoId is missing")
    }
    const {title,description} = req.body
    if(!title){
        throw new ApiError(400,"video title is required")
    }
    const thumbnailLocalPath = req.file?.path
    if(!thumbnailLocalPath){
        throw new ApiError(400,"thumbnail file is missing")
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            title:title,
            thumbnail:thumbnail,
            description:description,
        },
        {
            new:true
        }
    )
    if(!video){
        throw new ApiError(400,"video detailed updating failed")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,video,"video updating successfully"))
    //TODO: update video details like title, description, thumbnail
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400,"videoId is missing")
    }
   try {
    await Video.findByIdAndDelete(videoId)
    return res
    .status(200)
    .json(new ApiResponse(200,{},"video deleted successfully"))
   } catch (error) {
    throw new ApiError(404,error.message)
   }
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400,"videoId is missing")
    }
   try {
    const videoStatus = await Video.findById(videoId)
     const video = await Video.findByIdAndUpdate(
         videoId,
         {
             isPublished:!videoStatus?.isPublished
         },
         {
             new:true
         }
     )
     return res
     .status(200)
     .json(new ApiResponse(200,video,`${videoStatus.isPublished?"video unpublished succcessfull":"video published successfull"}`))
   } catch (error) {
    throw new ApiError(500,error.message)
   }
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}