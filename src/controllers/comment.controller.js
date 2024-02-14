import { Comment } from '../models/comments.model.js';
import { ApiResponse } from '../utills/ApiResponse.js';
import { ApiError } from '../utills/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, 'videoid is missing');
  }
  const { page = 1, limit = 10 } = req.query;
  try {
    const totalComments = await Comment.countDocuments().exec();
    const totalPages = Math.floor(
      countComments % limit === 0
        ? totalComments / limit
        : totalComments / limit + 1
    );
    const skip = (Number(page) - 1) * Number(limit);
    const query = await Comment.find({});
    const comments = await query.skip(skip).limit(Number(limit)).exec();
    res.set('totlaPages', totalPages);
    return res
      .status(200)
      .json(new ApiResponse(200, comments, 'commets fetched succesfully'));
  } catch (error) {
    throw new ApiError(400, error.message);
  }
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, 'videoid is missing');
  }
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, 'videoid is missing');
  }
  try {
    const comment = await Comment.create({
      owner: req.user?._id,
      content,
      videoId,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, comment, 'coment added successfully'));
  } catch (error) {
    throw new ApiError(400, error.message);
  }
  // TODO: add a comment to a video
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  if (!commentId) {
    throw new ApiError(400, 'commentId is missing');
  }
  try {
    const comment = await Comment.findByIdAndUpdate(
      commentId,
      {
        content: content,
      },
      { new: true }
    );
    return res
      .status(200)
      .json(new ApiResponse(200, comment, 'coment updated successfully'));
  } catch (error) {
    throw new ApiError(400, error.message);
  }
  // TODO: update a comment
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, 'commentId is missing');
  }
  try {
    const comment = await Comment.findById(commentId)
    if(String(comment.owner) !== String(req.user?._id)){
        throw new ApiError(404,"unothorized request")
    }
    await Comment.findByIdAndDelete(commentId);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, 'comment deleted successfully'));
  } catch (error) {
    throw new ApiError(400, error.message);
  }

  // TODO: delete a comment
});

export { getVideoComments, addComment, updateComment, deleteComment };
