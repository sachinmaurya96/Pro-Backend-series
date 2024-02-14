import { Playlist } from '../models/playlists.model.js';
import { ApiResponse } from '../utills/ApiResponse.js';
import { asyncHandler } from '../utills/AsyncHandler.js';
import { ApiError } from '../utills/apiError.js';

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  console.log(name, description);
  if (!name) {
    throw new ApiError(400, 'playlist name is missing');
  }
  console.log(req.user?._id);
  try {
    console.log(name, description, req.user?._id);
    const playlist = await Playlist.create({
      name,
      description,
      owner: req.user?._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, playlist, 'playlist created successfully'));
  } catch (error) {
    throw new ApiError(400, error.message);
  }
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if (!userId) {
    throw new ApiError(400, 'userId is missing');
  }
  try {
    const userPlaylist = await Playlist.find({ owner: userId });
    if (!userPlaylist.length) {
      throw new ApiError(400, 'no any playlist is created here');
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, userPlaylist, 'playlists fetched successfully')
      );
  } catch (error) {
    throw new ApiError(400, error.message);
  }
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) {
    throw new ApiError(400, 'playlistid is missing');
  }
  try {
    const playlist = await Playlist.findById(playlistId).populate('videos');
    if (!playlist) {
      throw new ApiError(404, 'playlist not found');
    }
    return res
      .status(200)
      .json(new ApiResponse(200, playlist, 'playlist fetched successfully'));
  } catch (error) {
    throw new ApiError(400, error.message);
  }
  //TODO: get playlist by id
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId || !videoId) {
    throw new ApiError(400, 'playlist id or videoid is missing');
  }
  try {
    const playlist = await Playlist.findById(playlistId);
    if (playlist?.videos.includes(String(videoId))) {
      throw new ApiError(400, 'video is alredy added in playlist');
    }
    playlist?.videos.push(videoId);

    await playlist.save();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, 'video added successfully'));
  } catch (error) {
    throw new ApiError(400, error.message);
  }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!playlistId || !videoId) {
    throw new ApiError(400, 'playlist id or videoid is missing');
  }
  try {
    const addVideoPlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      { $pull: { videos: videoId } },
      { new: true }
    );
    return res
      .status(200)
      .json(new ApiResponse(200, {}, 'video removed successfully'));
  } catch (error) {
    throw new ApiError(400, error.message);
  }
  // TODO: remove video from playlist
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) {
    throw new ApiError(400, 'playlist id is missing');
  }

  try {
    const playlist = await Playlist.findById(playlistId);
    if (String(playlist?.owner) !== String(req.user?._id)) {
      throw new ApiError(404, 'unothorized request');
    }
    await Playlist.findByIdAndDelete(playlistId);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, 'playlist removed successfully'));
  } catch (error) {
    throw new ApiError(400, error.message);
  }
  // TODO: delete playlist
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) {
    throw new ApiError(400, 'playlist idis missing');
  }
  const { name, description } = req.body;
  if (!name) {
    throw new ApiError(400, 'name fild is required');
  }
  try {
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        name: name,
        description: description,
      },
      { new: true }
    );
    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedPlaylist, 'playlist updated successfully')
      );
  } catch (error) {
    throw new ApiError(400, error.message);
  }
  //TODO: update playlist
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
