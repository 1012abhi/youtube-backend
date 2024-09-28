import {ApiResponse} from '../utils/ApiResponse.js'
import {ApiError} from '../utils/ApiError.js'
import {asyncHandler} from '../utils/asyncHandler.js'
import {Playlist} from '../models/playlist.model.js'
import mongoose from 'mongoose'


const createPlaylist = asyncHandler(async (req, res) => {
    // TODO: create playlist
    const { name, description } = req.body

    if (!name || !description) {
        throw new ApiError(400, "name or description both are required")
    }

    const playlist = await Playlist.create(
        {
            owner: req.user._id,
            name, 
            description
        }
    )
    if (!playlist) {
        throw new ApiError(400, "can't create playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "playlist created successfully")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    // TODO: get user palylists

    const {userId} = req.params

    const allPlaylists = await Playlist.find({owner: userId})
    if (!allPlaylists.length) {
        throw new ApiError(404, "No playlists found for this user")
    }

    return res 
    .status(200)
    .json(
        new ApiResponse(200, allPlaylists, 'get all playlist which is created by user')
    )
}) 

const getPlylistById = asyncHandler(async (req, res) => {
    //TODO: get playlist by id
    const {playlistId} = req.params

    if(!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "playlisId not found")
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist) {
        throw new ApiError(400, "playlist not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "get playlist successfully")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "invalid video ID")
    }
    if(!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "invalid playlist ID")
    }
    
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(400, "playlist not found")
    }
    
    playlist.videos.push(videoId)
    await playlist.save()

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "video is added successfully")
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    
    if(!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "invalid video ID")
    }
    if(!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "invalid playlist ID")
    }
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(400, "playlist not found")
    }
    const videoIndex = playlist.videos.indexOf(videoId)
    if (videoIndex > -1) {
        playlist.videos.splice(videoIndex, 1)
    }

    playlist.save()

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "video removed successfully")
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(404, "Invalid playlist")
    }

    const playlist = await Playlist.findByIdAndDelete(playlistId)

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "playlist deleted successfully")
    )
    
})

const updatePlaylist = asyncHandler(async (req, res) =>{
    const { playlistId } = req.params
    const { name, description } = req.body

    const playllist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            name, description
        }
    )
    if(!playllist) {
        throw new ApiError(404, "playlist not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playllist, "playlist updated successfully")
    )

})

export { createPlaylist, getUserPlaylists, getPlylistById, 
    addVideoToPlaylist, removeVideoFromPlaylist, 
    deletePlaylist, updatePlaylist }