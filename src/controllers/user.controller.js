import { asyncHandler } from '../utills/AsyncHandler.js';
import { ApiError } from '../utills/apiError.js';
import { User } from '../models/user.model.js';
import {
  deleateOnCloudinary,
  uploadOnCloudinary,
} from '../utills/cloudinary.js';
import { ApiResponse } from '../utills/ApiResponse.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSava: false });
    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(
      500,
      'Something went wrong while generating refresh and acess token'
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //get user detail
  //validation - not empty
  //ceck if userc alredy exist : username , email
  //check for image , check avatar
  //upload them to cloudinary, avtar
  //create usr object - create entry in db
  //remove password and refrest toke field from response
  //check for user creation
  //return response

  const { fullName, email, username, password } = req.body;
  if (
    [fullName, email, username, password].some(
      (fields) => fields?.trim() === ''
    )
  ) {
    throw new ApiError(400, 'all fields are required');
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, 'User with email or username already exist');
  }
  const avatarLoaclPath = req.files?.avatar[0]?.path;
  let coverImageLoaclPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLoaclPath = req.files?.coverImage[0]?.path;
  }
  if (!avatarLoaclPath) {
    throw new ApiError(400, 'Avatar file is required');
  }
  const avatar = await uploadOnCloudinary(avatarLoaclPath);
  const coverImage = await uploadOnCloudinary(coverImageLoaclPath);
  if (!avatar) {
    throw new ApiError(400, 'Avatar file is required');
  }
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || '',
    email,
    password,
    username: username.toLowerCase(),
  });
  const createdUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );
  if (!createdUser) {
    throw new ApiError(500, 'Something went wrong while registring user');
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, 'User registered succesfully'));
});

const loginUser = asyncHandler(async (req, res) => {
  //get user detail
  //check fields empty or not
  //find user by email or username
  //check user exixt or not
  //if exist then compaire password
  //password is correct then check accesstoke and refresh token
  //send cookies
  //send a response {loggedinuser,accesstoken,refreshtoken}

  const { email, username, password } = req.body;
  if (!(username || password)) {
    throw new ApiError(400, 'username or password is required');
  }
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (!user) {
    throw new ApiError(404, 'user does not exist');
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'invalid user credential');
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );
  const option = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie('accessToken', accessToken, option)
    .cookie('refreshToken', refreshToken, option)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        'User logged In succesfully'
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const option = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie('accessToken', option)
    .clearCookie('refreshToken', option)
    .json(new ApiResponse(200, {}, 'User logged out'));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, 'unauthorized request');
  }

  try {
    const decodedInfo = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedInfo?._id);
    if (!user) {
      throw new ApiError(401, 'Invalid refresh token');
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, 'refresh token is required or used');
    }
    const option = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );
    return res
      .status(200)
      .cookie('accessToken', accessToken, option)
      .cookie('refreshToken', refreshToken, option)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          'Access token refreshed'
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || 'invalid refresh token');
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, 'Invalid password');
  }
  user.password = newPassword;

  await user.save({ validateBeforeSava: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'password changed successfully'));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  console.log(req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, 'current user fetched successfully'));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, username, email } = req.body;
  if (!fullName || !username || !email) {
    throw new ApiError(400, 'all fields are required');
  }

  const existUser = await User.findOne({
    $or: [{ email }, { username }],
  }); 
  if(existUser){
    throw new ApiError(404,"user alredy exist with this username or email")
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      fullName: fullName,
      email: email,
      username: username,
    },
    { new: true },

  ).select("-password");
  
  return res
    .status(200)
    .json(new ApiResponse(200, user, 'account details update successfully'));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const public_id = (((req.user?.avatar.split("/")).pop()).split("."))[0]
  console.log(public_id)

  const avatarLocalPath = req.file?.path;

  console.log(avatarLocalPath)
  if (!avatarLocalPath) {
    throw new ApiError(400, 'Avatar file is missing');
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new ApiError(400, 'Error while uploading on avatar');
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select('-password');

  //todo delete image from cloudenary
  await deleateOnCloudinary(public_id);
  return res
    .status(200)
    .json(new ApiResponse(200, user, 'Avatar updated successfully'));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const public_id = (((req.user?.coverImage?.split("/")).pop()).split("."))[0]
  const coverLocalPath = req.file?.path;
  if (!coverLocalPath) {
    throw new ApiError(400, 'Coverimage file is missing');
  }
  const coverImage = await uploadOnCloudinary(coverLocalPath);
  if (!coverImage.url) {
    throw new ApiError(400, 'Error while uploading on coverImage');
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select('-password');
  await deleateOnCloudinary(public_id);
  return res
    .status(200)
    .json(new ApiResponse(200, user, 'CoverImage updated successfully'));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) {
    throw new ApiError(400, 'username is missing');
  }
  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: 'subscriptions',
        localField: '_id',
        foreignField: 'channel',
        as: 'subscribers',
      },
    },
    {
      $lookup: {
        from: 'subscriptions',
        localField: '_id',
        foreignField: 'subscriber',
        as: 'subscribedTo',
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: '$subscribers',
        },
        channelsSubscribedToCount: {
          $size: '$subscribedTo',
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, '$subscribers.subscriber'] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        avatar: 1,
        coverImage: 1,
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
      },
    },
  ]);
  if (!channel?.length) {
    throw new ApiError(404, 'Channel does not exist');
  }
  return res
    .status(404)
    .json(new ApiResponse(200, channel[0], 'User channel fetched succesfully'));
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: 'videos',
        localField: 'watchHistory',
        foreignField: '_id',
        as: 'watchHistory',
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: 'owner',
              foreignField: '_id',
              as: 'owner',
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: '$owner',
              },
            },
          },
        ],
      },
    },
  ]);
  if (!user?.length) {
    throw new ApiError(404, 'Something went Wrong while fetching watchhistory');
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        'WatchHistory fetched successfully'
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
