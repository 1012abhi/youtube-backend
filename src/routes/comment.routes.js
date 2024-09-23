import { Router } from "express";
import { createComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
router.use(verifyJWT) // Apply verifyJWT middleware to all routes in this file

router.route('/create/:videoId').post(createComment)
router.route('/get/comments/:videoId').get(getVideoComments)

router.route('/update/:commentId').patch(updateComment)
router.route('/delete/:commentId').patch(deleteComment)

export default router