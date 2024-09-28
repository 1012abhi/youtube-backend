import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {asyncHandler} from '../utils/asyncHandler.js'
import {Subscription} from '../models/subscription.model.js'
import mongoose from 'mongoose'

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const userId = req.user._id
    // console.log("userId", userId);
    
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, 'Invalid channel Id')
    }

    const subscribe = await Subscription.findOne({channel: channelId, subscriber: userId})
    // console.log("subscribe",subscribe);
    
    if (subscribe) {
        await Subscription.deleteOne() 
        return res 
        .status(200)
        .json(
            new ApiResponse(200, subscribe, "unsubscribed")
        )
    } else {
        // channelId.subscriber.push(userId)
        // console.log("channelId.subscriber.push(userId)", channelId.subscriber.push(userId));
        
        // await channelId.save()
        const channelSubscribed = await Subscription.create({channel: channelId, subscriber: req.user._id})
        
        return res
        .status(200)
        .json(
            new ApiResponse(200, channelSubscribed, "channel subscribed")
        )
    }
})  

// problematically
// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => { 
    
    const {channelId} = req.params
    // console.log(channelId);
    
    if(!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400,'Invalid channel Id')
    }
    try {
        
            // Retrieve channel information using the channelId

            const channel = await Subscription.find({channel:channelId});
            // console.log("channel--", channel);
            
            // Check if channel exists
            if (!channel) {
                throw new ApiError(400,'Channel not found')
            }
        
            return res
            .status(200)
            .json(
                new ApiResponse(200, channel, "subscriber list")
            )
    } catch (error) {
        throw new ApiError(500, error?.message || 'internal error');
    }

})

// problematically
// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    try {
        const { subscriberId } = req.params;
        
        // Fetch the user's subscribed channels from the database
        const subscribedChannels = await Subscription.find({subscriber: subscriberId})
        
        if (!subscribedChannels) {
            throw new ApiError(404, 'No subscribed channels')
        }
        // Send the list of subscribed channels as a JSON response
        return res
        .status(200)
        .json(
            new ApiResponse(200, subscribedChannels, "channel list")
        );
    } catch (error) {
        // Handle errors (e.g., database errors)
        throw new ApiError(500,'Failed to fetch subscribed channels')
    }
})


export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels }