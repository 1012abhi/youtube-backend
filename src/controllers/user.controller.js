import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

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
    console.log('email: ', email);
    
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");   
    }  

    const existedUser = User.findOne({
        // operator:- dono me se koi bhi mil jaye
        $or:  [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
        
    }

    // multer ye file ko database me store krake hamare path me save kr dega kyuki hame multer ko bola hai -------->check krlo middleware me 
    // multer wo file apne server pe le aaya hai 
    const avatarLocalPath = res.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

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


export { registerUser }