import {ApiResponse} from '../utils/ApiResponse.js'
import {ApiError} from '../utils/ApiError.js'
import {asyncHandler} from '../utils/asyncHandler.js'
import { Like } from '../models/like.model.js'
import mongoose from 'mongoose'

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    // TODO: toggle like on video
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    
    // Find if the user has already liked the video
    const like = await Like.findOne({video: videoId, likedBy: req.user._id})

    if(like) {
        // remove the like
        await like.remove()
        return res
        .status(200)
        .json(new ApiResponse(200, null, "like removed"))
    } else {
        // Create a new like
        const newLike = await Like.create({video: videoId, likedBy: req.user._id})
        return res
        .status(200)
        .json(new ApiResponse(200, newLike, "video like successfully"))
    }

})
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    // TODO: toggle like on comment
    console.log(commentId);
    
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }
    
    // Find if the user has already liked the video
    const like = await Like.findOne({comment: commentId, likedBy: req.user._id})

    if(like) {
        // remove the like
        await like.remove()
        return res
        .status(200)
        .json(new ApiResponse(200, null, "like removed"))
    } else {
        // Create a new like
        const newLike = await Like.create({comment: commentId, likedBy: req.user._id})
        return res
        .status(200)
        .json(new ApiResponse(200, newLike, "comment like successfully"))
    }

})
const toggleTwitterLike = asyncHandler(async (req, res) => {
    const { twitterId } = req.params
    // TODO: toggle like on comment
    if (!mongoose.Types.ObjectId.isValid(twitterId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }
    
    // Find if the user has already liked the video
    const like = await Like.findOne({tweet: twitterId, likedBy: req.user._id})

    if(like) {
        // remove the like
        await like.remove()
        return res
        .status(200)
        .json(new ApiResponse(200, null, "like removed"))
    } else {
        // Create a new like
        const newLike = await Like.create({tweet: twitterId, likedBy: req.user._id})
        return res
        .status(200)
        .json(new ApiResponse(200, newLike, "tweet like successfully"))
    }

})

// Problem---------get all liked by like (video, comment, tweet) that is problem
const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    
    const users = req.user._id
    if (!users) {
        throw new ApiError(404, "user not found")
    }
    const videos = await Like.find({likedBy: req.user._id})
    if(!videos.length > 0) {
        throw new ApiError(404, "videos not found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, videos, "Success"))

})
export { toggleVideoLike, toggleCommentLike, toggleTwitterLike, getLikedVideos }