import { Router } from "express";
import { createTweet, deleteTweet, getUserTweet, updateTweet } from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
router.use(verifyJWT) // Apply verifyJWT middleware to all routes in this file

router.route("/create-tweet").post(createTweet)
router.route("/get").get(getUserTweet)
router.route("/:tweetId").patch(updateTweet)
router.route("/deleteTweet/:tweetId").delete(deleteTweet)

export default router