import { User } from "../models/user.model.js";
import { asyncHandler } from "../utills/AsyncHandler.js";
import { ApiError } from "../utills/apiError.js";
import jwt from "jsonwebtoken";
export const verifyJWT = asyncHandler(async(req,_,next)=>{
   try {
     const token = await req.cookies?.accessToken || req.header("Athorization")?.replace("Bearer ","")
     if(!token){
         throw new ApiError(401,"Unothrized request")
     }
     const decodedInfo = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
     const user = await User.findById(decodedInfo._id).select("-password -refreshToken")
     if(!user){
         throw new ApiError(401,"Invalid Access Token")
     }
     req.user= user
     next()
   } catch (error) {
    throw new ApiError(401,error?.message || "invalid access token")
   }
})