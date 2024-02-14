import { Router } from 'express';
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
} from '../controllers/video.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router.route('/').get(getAllVideos);
router.route('/publish-video').post(
  verifyJWT,
  upload.fields([
    {
      name: 'videoFile',
      maxCount: 1,
    },
    {
      name: 'thumbnail',
      maxCount: 1,
    },
  ]),
  publishAVideo
);
router.route('/watch/:videoId').get(getVideoById);
router.route('/update/:videoId').patch(verifyJWT, updateVideo);
router.route('/remove/:videoId').delete(verifyJWT, deleteVideo);
router.route('/PublishStatus/:videoId').patch(verifyJWT, togglePublishStatus);

export default router;
