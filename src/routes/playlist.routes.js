import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from '../controllers/playlist.controller.js';
const router = Router();
router.use(verifyJWT);
router.route('/create').post(createPlaylist);
router.route('/getplaylists/:userId').get(getUserPlaylists);
router.route('/getplaylist/:playlistId').get(getPlaylistById);
router.route('/add/:playlistId/:videoId').patch(addVideoToPlaylist);
router.route('/remove/:playlistId/:videoId').patch(removeVideoFromPlaylist);
router.route('/removeplaylist/:playlistId').delete(deletePlaylist);
router.route('/update/:playlistId').patch(updatePlaylist);
export default router;
