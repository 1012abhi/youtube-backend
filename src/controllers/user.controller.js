import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

// yaha par ham asynchandler ka use nahi kr rahe hai kyuki ye hamara internaly method hai yaha par ham koi web request nahi krne wale hai 
const generateAccessTokenAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)    // find user
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        // add user object me (database me save krwa diya hai)
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong when generating access token and refresh token")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    // res.status(200).json({
    //     message: "ok"
    // })
    // get user details form frontend
    // validation - not empty
    // check if user is already exist: username , email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db [object isliye create krunga kyuki mongodb nosql database hai to isme jayadatar object hi banaye jate hai] 
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const { fullName ,email, username, password } = req.body
    // console.log('email: ', req.body);
    
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");   
    }  

    const existedUser = await User.findOne({
        // operator:- dono me se koi bhi mil jaye
        $or:  [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
        
    }

    // multer ye file ko database me store krake hamare path me save kr dega kyuki hame multer ko bola hai -------->check krlo middleware me 
    // multer wo file apne server pe le aaya hai 
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;   //case (Cannot read properties of undefined):- jab user coverImage nahi bhejega tab ye error aayegi aur ye error aa kyu rhi hai hamne to coverImage required bhi nahi kiya hai to ye erorr option chenning wale question mark ? ki wajag se aa rahi hai 
    
    // solution of the coverImage ?
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) &&  req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }


    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
        
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
        
    }

    const user = await User.create(
        // entry in database
        {
            fullName,
            avatar: avatar.url,
            //ab yaha pe hame ek check lagana padega kyuki hame upar avatar check to lagaya par coverImage ka nahi lagaya hai 
            coverImage: coverImage?.url || "", // yahi coverImage hai to uska url nikallo nahi to empty hi chhod do
            email,
            password,
            username: username.toLowerCase()
        }
    )
    // remove password and refreshToken with the help of select method 
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User register Successfully")
    )
})

const loginUser = asyncHandler( async (req, res) => {
    // req body -> data
    // username or email
    // find the user
    // password check
    // access and refresh token
    // send cookies
    // res

    const {email, username, password} = req.body

    if (!username && !email) {
        throw new ApiError(400, "username or email is required");
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }   

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(404, "Incorrect password");
    }
    // ise await isliye kiya hai kyuki is method ke under bhi database ke kuchh operation ho rhe hai
    const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id) 
    
    // jab hame database se findOne kiye tha to user ke under unwantend fields bhi aa gyi hai like: password
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // jab ham cookies bhejte hai to hame options design krne padte hai 
    // apki cookie ko by default koi bhi modify kr sakta hai frontend pe lekin jab aap httOnly: true, aur seccure: true kr dete hai to aapki cookie ko server se hi modify kr skte hai 
    const options = {
        httpOnly: true,  
        secure: true
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )
})

const logoutUser = asyncHandler( async (req, res) => { 
    await User.findByIdAndUpdate(
        req.user._id, 
        {   
            $unset: {
                refreshToken: 1 // this removes the field form document
            }
        },
        {
            new: true
        }
    )
    
    const options = {
        httpOnly: true,  
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))


})

const refreshAccessToken = asyncHandler( async (req, res) => {
    const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken 
    
    if (!incommingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        //Basically, yeh line check karti hai ki token sahi hai ya nahi, aur agar sahi hai to decodedToken se user ke details nikal ke use kar sakte ho
        const decodedToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET) 
    
        const user = await User.findById(decodedToken?._id) // are bhai ise user ki id chahiye to decodedToken user ki id chahiye 
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        // token match ho jayega to new token de denge matlab generate karke bhai
        if (incommingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
    
        const { accessToken, newRefreshToken } = await generateAccessTokenAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
        
    }



})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword) // isme hamne oldpassword hi kyu diya are bhai yahi hamne newpassword de diya ye oldpassword keise aayega

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword        
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(
        new ApiResponse(200, req.user, "current user fetched successfully")
    )
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const {fullName, email} = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Accout details updated successfully"))
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    // TODO: DELETE OLD IMAGE ASSIGNMENT
    
    const avatar = uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: avatar.url
            }
        }, 
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar Image updated successfully")
    )
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image file is missing")
    }

    const coverImage = uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on cover image")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        }, 
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover image updated successfully")
    )
})

const getUserChannelProfile = asyncHandler( async(req, res) => {
    // destructure kr liya username ko url se 
    const {username} = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            // kin logo ne subscribe kiya hua hai 
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            },
            // kin channel ko mene subscribe kiys hua hai
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            },
        },
        {
            // ek additional field add kr dega taki ek hi object me ham sara data bhejde 
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {   // project field ka matlab hai ki jo jo aapko output me dikhana hai 
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,

            }
        }
    ])
    
    if (!channel?.length) {
        throw new ApiError(404, "Channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )



})

const getWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {   //iske under bahur sari videos aa gyi hai
            //ab ham watchHistory ke under jayege to watchHistory video se milegi
            $lookup: {
                from: "videos",
                localField: "watchHistory", //jiske under join krana hai 
                foreignField: "_id",       //jiske sath join krana hai
                as: "watchHistory",
                pipeline: [ // ab array ke under user ki users ki sari values aai hai  
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            // lekin ab kuch thodi dena hai owner ke under to isliye ham further ek or pipeline lagana hai 
                            pipeline: [
                                {
                                    // jo jo fields owner ke ander dena hai wo dedo
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    // ham jante ki ye sb fields aa to jayege lekin hamare pass aayega kya Array to array me se first value nikalna padega
                    {
                        $addFields: {
                            // aap naya naam bhi add kr sakte ho par me existing firle ko hi overrite kr raha hu 
                            owner: {
                                $first: "$owner" // ab fields me nikalna hai 
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "watch history fetched successfully"
        )
    )
})


export { registerUser, loginUser, logoutUser, 
    refreshAccessToken, changeCurrentPassword, 
    getCurrentUser, updateAccountDetails, updateUserAvatar, 
    updateUserCoverImage, getUserChannelProfile, getWatchHistory }