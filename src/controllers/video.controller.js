import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";


const getAllVideos = asyncHandler(async (req, res) => {
    //TODO: get all videos based on query, sort, pagination

    // Query parameters ko destructure kar rahe hain
    const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'desc', userId } = req.query;

    // MongoDB query object banate hain
    let filter = {};

    // Agar koi search query di gai hai toh usko filter me add karte hain
    if (query) {
        filter.title = { $regex: query, $options: 'i' }; // Case-insensitive search for title
    }

    // Agar userId diya gaya hai toh usko filter karte hain
    if (userId) {
        filter.owner = userId; // Assuming 'owner' field stores the userId of video uploader
    }

    // Sort ka logic
    let sort = {};
    sort[sortBy] = sortType === 'asc' ? 1 : -1; // Sort ascending (1) ya descending (-1)

    try {
        // Paginate ke liye skip aur limit ka use karte hain
        const videos = await Video.find(filter) // Video collection se data fetch karna
            .sort(sort) // Sorting apply karna
            .skip((page - 1) * limit) // Pagination ke liye skip karte hain
            .limit(parseInt(limit)); // Limit apply karte hain

        // Total number of documents (videos) ko calculate karte hain for pagination
        const totalVideos = await Video.countDocuments(filter);

        // Response bhejte hain client ko
        return res.status(200)
        .json( 
            new ApiResponse(200,
            // success: true,
            // page: parseInt(page),
            // limit: parseInt(limit),
            // totalPages: Math.ceil(totalVideos / limit), // Total pages ka calculation
            totalVideos,
            videos, // Fetched videos
            "users videos feched..."
        ));
    } catch (error) {
        // Agar koi error aati hai toh response me error bhejte hain
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
});

const publishAVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video
    const { title, description } = req.body;
    
    // Check if title and description are provided
    if (!title || !description) {
        throw new ApiError(400, 'Title and description are required');
    }

    try {
        const videoLocalPath = req.files?.videosFile?.[0]?.path;
    
        let thumbnailPath;
        if(req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length>0){
            thumbnailPath = req.files?.thumbnail[0]?.path;
        }

        // Upload video to Cloudinary
        const videosFile = await uploadOnCloudinary(videoLocalPath);
        const thumbnail = await uploadOnCloudinary(thumbnailPath);
        
        if (!videosFile || !thumbnail) {
            throw new ApiError(400, 'Videourl & thumbnailurl are not available')
        }
        
        // Create new video document in the database
        const newVideo = await Video.create({
            videosFile: videosFile.secure_url, // Video URL from Cloudinary
            thumbnail: thumbnail?.public_id,  // Cloudinary public ID (for future deletions, if needed)
            title,
            description,
            duration: videosFile.duration,
            views: 0,
            isPublished: false,
            owner: req.user?._id, // Assuming req.user._id contains the ID of the logged-in user
        });

        if(!newVideo) {
            throw new ApiError(400,"Something went wrong while uploading video")
        }
        
        // Respond to the client with success
        return res
        .status(201)
        .json(new ApiResponse(201, newVideo, 'Video successfully uploaded and published'));
    } catch (error) {
        throw new ApiError(500, `Video upload failed: ${error.message}`);
    }
});

const getVideoById = asyncHandler(async (req, res) => {
    //TODO: get video by id
    const { videoId } = req.params
    
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }

    const video = await Video.findById(videoId)
    
    if (!video) {
        throw new ApiError(400, "video is not exists");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,
            video,
            "video is feched"
        )
    )
});

const updateVideo = asyncHandler(async (req, res) => {  
    //TODO: update video details like title, description, thumbnail
    const { videoId } = req.params
    const { title, description } = req.body

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new Error(400, "Invalid video Id");    
    }
    
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path
    // console.log("thumbnailLocalPath:", thumbnailLocalPath);
    
    if (!thumbnailLocalPath) {
        throw new ApiError(400, 'thumbnailLocalPath is required')
    }

    const thumbnailPathUploadOnCloudinary = await uploadOnCloudinary(thumbnailLocalPath)
    if(!thumbnailPathUploadOnCloudinary) {
        throw new ApiError(400, 'error while uploading thumbnail on cloudinary')
    }
    const updateTitleAndDescription = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title, description,
                thumbnail: thumbnailPathUploadOnCloudinary.url,
            }
        },
        {new: true}
    )
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, updateTitleAndDescription, "update successfully")
    )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!mongoose.Types.ObjectId.isValid(videoId)){
        throw new Error(400, "Invalid video Id");
        
    }

    // const deltedvideo = await deleteFromCloudinary(Video.videoFile)
    // if(!deltedvideo){
    //     throw new ApiError(400, "video is not deleted ");
    // }

    const deleteVideos = await Video.findByIdAndDelete(
        videoId
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200, deleteVideos, "Video is deleted Successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video Id")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(400, "video is not found")
    }

    video.isPublish = !video.isPublish;
    await video.save()

    return res 
    .status(200)
    .json(200, video, "Pblish Status updated successfully")
})

export { getAllVideos, publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus }