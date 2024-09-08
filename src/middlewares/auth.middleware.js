// ye sirf verify krega user hai ya nahi hai
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from 'jsonwebtoken'
import { User } from "../models/user.model";

// Production code me _ kyu likhte hai are hamara res khali hota hai isliye underscore (_) likha hota hai 
export const  verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if (!token) {
            throw new ApiError(401,"Unauthorized request");
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)        
    
        const user = await User.findById(decodedToken?._id).select("-password refreshToken")
    
        if (!user) {
            // NEXT_VIDEO discuss about fronend
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
        
    }

})  