import { Router } from "express";
import {deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo, } from "../controllers/video.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {upload} from '../middlewares/multer.middleware.js'

const router = Router()
router.use(verifyJWT);

router
    .route('/get')
    .get(getAllVideos)
    
router.route('/publish').post(
        upload.fields([
            {
                name: 'videosFile',
                maxCount: 1,
            },
            {
                name: 'thumbnail',
                maxCount: 1,
            },
        ]),
        publishAVideo
    )
router
    .route('/:videoId')
    .get(getVideoById)
    .patch(deleteVideo)
    .patch(
        upload.fields([{name: 'thumbnail', maxCount:1}]),
        updateVideo
    )

router.route('/toggle/publish/:videoId').patch(togglePublishStatus)

export default router;