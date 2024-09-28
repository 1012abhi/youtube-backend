import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";


const router = Router()
router.use(verifyJWT)

router.route('/create').post(createPlaylist);
router.route('/getplaylists/:userId').get(getUserPlaylists)
router.route('/getplaylist/:playlistId').get(getPlylistById)
router.route('/add/:playlistId/:videoId').patch(addVideoToPlaylist)
router.route('/delete/:playlistId/:videoId').patch(removeVideoFromPlaylist)
router.route('/delete/:playlistId').patch(deletePlaylist)
router.route('/update/:playlistId').patch(updatePlaylist)

export default router;