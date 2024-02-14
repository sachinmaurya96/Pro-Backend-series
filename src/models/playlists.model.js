import mongoose, { Schema } from 'mongoose';
const PlaylistSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Playlist name is required'],
      unique: [true, 'playlist with this name is already exist'],
    },
    description: {
      type: String,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    videos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        unique: true,
      },
    ],
  },
  { timestamps: true }
);

export const Playlist = mongoose.model('Playlist', PlaylistSchema);
