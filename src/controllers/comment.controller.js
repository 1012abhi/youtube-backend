import {ApiResponse} from "../utils/ApiResponse.js";
import {ApiError} from "../utils/ApiError.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";

const getVideoComments = asyncHandler( async (req, res) => {
    //TODO: get all comments for a video

    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    const allComment = await Comment.find({ video: videoId})
        .skip((page - 1) * limit)
        .limit(limit)
    console.log('allComment', allComment);
    
    const totalcomment = await Comment.countDocuments({video: videoId})
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, allComment,totalcomment, "get video comments")
    )
})
// const getVideoComments = asyncHandler(async (req, res) => {
//     //TODO: get all comments for a video
//     const {videoId} = req.params
//     const {page = 1, limit = 10} = req.query

//     if(!videoId || videoId===":videoId"){
//         throw new ApiError(400, "Valid videoId is required")
//     }

//     const options = {
//         page,
//         limit,
//     }

//     const allComments = Comment.aggregate([
//         {
//             $match: {
//                 video: new mongoose.Types.ObjectId(videoId),
//             },
//         },
//     ])

//     const response = await allComments.paginateExec(options)

//     if(!response){
//         throw new ApiError(500, "Error in fetching comments for video")
//     }

//     return res
//             .status(200)
//             .json(new ApiResponse(200, response.docs, "Comments for video fetched successfully"))

// })

// const getVideoComments = asyncHandler(async (req, res) => {
//     const { videoId } = req.params;
//     const { page = 1, limit = 10 } = req.query;

//     try {
//         const limitNum = parseInt(limit);
//         const skipNum = (page - 1) * limitNum;

//         // Aggregating both comments and the total count in one query
//         const result = await Comment.aggregate([
//             {
//                 $match: { video: videoId } // Match comments by videoId
//             },
//             {
//                 $facet: {
//                     comments: [
//                         { $sort: { createdAt: -1 } }, // Sort by latest comments
//                         { $skip: skipNum }, // Skip for pagination
//                         { $limit: limitNum }, // Limit the number of comments
//                     ],
//                     totalCount: [
//                         { $count: 'count' } // Get total number of comments
//                     ]
//                 }
//             }
//         ]);

//         const comments = result[0].comments;
//         const totalComments = result[0].totalCount[0] ? result[0].totalCount[0].count : 0;

//         res.status(200).json({
//             success: true,
//             data: comments,
//             total: totalComments,
//             currentPage: page,
//             totalPages: Math.ceil(totalComments / limitNum),

//         });
//     } catch (error) {
//         res.status(500).json({ success: false, message: 'Failed to fetch comments', error: error.message });
//     }
// });

const createComment = asyncHandler( async(req, res) => {
    const { videoId } = req.params 
    const { content = "" } = req.body;
    console.log('videoId', videoId);

    if (!content) {
        throw new ApiError(400, "content is required");
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const user = await User.findById(req.user._id)
    if (!user) {
        throw new ApiError(400, "user is not exist")
    }
    
    const comment = await Comment.create(
        {
            video: videoId,
            owner: user._id,
            content,
        }
    )
    if (!comment) {
        throw new ApiError(400, "comment is not create")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, comment, "Comment created successfully")
    )
})

const updateComment = asyncHandler( async(req, res) => {
    const { commentId } = req.params
    const { content } = req.body

    const updateComment = await Comment.findByIdAndUpdate(
        commentId, 
        {
            $set: {
                content
            }
        },
        {new: true}
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200, updateComment, "Comment updated successfully")
    )
})

const deleteComment = asyncHandler( async(req, res) => {
    const { commentId } = req.params

    const deleteComment = await Comment.findByIdAndDelete(commentId)

    return res
    .status(200)
    .json(
        new ApiResponse(200, deleteComment, "Comment deleted successfully")
    )

})

export { getVideoComments, createComment, updateComment, deleteComment }