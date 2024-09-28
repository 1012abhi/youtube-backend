import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getLikedVideos, toggleCommentLike, toggleTwitterLike, toggleVideoLike } from "../controllers/like.controller.js";

const router = Router()
router.use(verifyJWT)

router.route('/:videoId').post(toggleVideoLike)
router.route('/c/:commentId').post(toggleCommentLike)
router.route('/t/:twitterId').post(toggleTwitterLike)

router.route('/videos').get(getLikedVideos)
export default router