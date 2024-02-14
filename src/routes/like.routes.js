import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { toggleVideoDisLike, toggleVideoLike } from "../controllers/like.controller.js";

const router = Router()
router.use(verifyJWT)
router.route("/videolike/:videoId").post(toggleVideoLike)
router.route("/videodislike/:videoId").delete(toggleVideoDisLike)

export default router