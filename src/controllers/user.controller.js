import { asyncHandler } from "../utills/AsyncHandler.js"
import { ApiError } from "../utills/apiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utills/cloudinary.js"
import { ApiResponse } from "../utills/ApiResponse.js"

const registerUser = asyncHandler(async (req,res)=>{
    //get user detail
    //validation - not empty
    //ceck if userc alredy exist : username , email
    //check for image , check avatar
    //upload them to cloudinary, avtar
    //create usr object - create entry in db
    //remove password and refrest toke field from response 
    //check for user creation 
    //return response

    const {fullName , email, username, password} = req.body
   if([fullName , email, username, password].some((fields)=>fields?.trim()==="")){
    throw new ApiError(400,"all fields are required")
   }
   const existedUser = User.findOne({
    $or:[{username},{email}]
   })
   if(existedUser){
    throw new ApiError(409,"User with email or username already exist")
   }
   const avatarLoaclPath = req.files?.avatar[0]?.path;
   const coverImageLoaclPath = req.files?.coverImage[0]?.path;
   if(!avatarLoaclPath){
    throw new ApiError(400,"Avatar file is required")
   }
   const avatar = await uploadOnCloudinary(avatarLoaclPath)
   const coverImage = await uploadOnCloudinary(coverImageLoaclPath)
   if(!avatar){
    throw new ApiError(400,"Avatar file is required")
   }
   const user = await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
    username:username.toLowerCase()
   })
   const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
   )
   if(!createdUser){
    throw new ApiError(500,"Something went wrong while registring user")
   }
   return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered succesfully")
   )
})

export {registerUser} 