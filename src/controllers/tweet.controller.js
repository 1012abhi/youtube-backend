import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js"
import { Tweet } from "../models/tweet.model.js";
import mongoose, { isValidObjectId } from "mongoose";


const createTweet = asyncHandler( async(req, res) => {
    // check login - are bhai ye field ham router me verifyJWT include krdenge😂
    // fetch username
    // req.body -> data 
    // res msg
    try {
        const { content = "" } = req.body
        
        if (!content) {
            throw new ApiError(400, "Content is required")
        }
        
        const user = await User.findById(req.user._id)
        if (!user) {
            throw new ApiError(400, " user does not exists")
        }
        
        const tweet = await Tweet.create(
            {
                owner: user._id, // Only store user ID as the owner
                content
            }
        )
    
        if (!tweet) {
            throw new ApiError(500, "Something went wrong while creating tweet")
        }
        
        // console.log(req.body.content);
        // console.log(req.user._id);
        return res
        .status(201)
        .json(
            new ApiResponse(201, tweet, "Tweet created Successfully")
        )
    } catch (error) {
        throw new ApiError(500, "Error occured while creating the tweet");
    
    }

})

const getUserTweet = asyncHandler( async(req, res) => {
    const userId = req.user._id;  // Assuming req.user has the logged-in user details
    
    try {
        // Fetch all tweets by the user
        const tweets = await Tweet.find({ owner: userId });

        if (!tweets.length) {
            throw new ApiError(404, "No tweets found for this user");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, tweets, "User tweets retrieved successfully"));
        
    } catch (error) {
        console.error("Error retrieving user tweets:", error);
        throw new ApiError(500, "Internal Server Error: Unable to retrieve tweets");
    }
    // directly return req.user for get current user
    // return res
    //         .status(200)
    //         .json(new ApiResponse(200, req.user, "User tweet retrieved successfully"));
}) 

const updateTweet = asyncHandler( async (req, res) => {
    const { tweetId } = req.params;
    const { content = "" } = req.body;

    // Log useful information for debugging
    // console.log("Updating Tweet with ID:", tweetId);
    // console.log("New Content:", content);

    // Validate the tweetId
    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid Tweet ID");
    }

    // Ensure content is provided
    if (!content.trim()) {
        throw new ApiError(400, "Content is required and cannot be empty");
    }

    try {
        // Find and update the tweet
        const tweet = await Tweet.findByIdAndUpdate(
            tweetId,
            { content },
            { new: true, runValidators: true } // Return the updated tweet and run validation
        );

        // If tweet not found, throw an error
        if (!tweet) {
            throw new ApiError(404, "Tweet not found, update failed");
        }

        // Success response
        return res.status(200).json(
            new ApiResponse(200, tweet, "Tweet updated successfully")
        );

    } catch (error) {
        // Log the error for debugging and throw a user-friendly message
        console.error("Error updating tweet:", error);
        throw new ApiError(500, "Internal Server Error: Unable to update tweet");
    }
});

const deleteTweet = asyncHandler ( async(req, res) => {
    const {tweetId} = req.params
    console.log(tweetId);

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid Tweet ID");
    }
    const tweet = await Tweet.findByIdAndDelete(tweetId)

    
    if (!tweet) {
        throw new ApiError(400, "tweet is not found");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, tweet, "tweet deleted successfully")
    )
})

export { createTweet, getUserTweet, updateTweet, deleteTweet}