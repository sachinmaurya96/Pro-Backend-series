import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from '../controllers/comment.controller.js';

const router = Router();
router.use(verifyJWT);
router.route('/addcomment/:videoId').post(addComment);
router.route('/getcomment/:videoId').get(getVideoComments);
router.route('/updatecomment/:commentId').patch(updateComment);
router.route('/deletecomment/:commentId').delete(deleteComment);

export default router;
