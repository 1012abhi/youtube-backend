// ye sirf verify krega user hai ya nahi hai
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

// Production code me _ kyu likhte hai are hamara res khali hota hai isliye underscore (_) likha hota hai 
export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "").trim()              
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        } 
        
        //Basically, yeh line check karti hai ki token sahi hai ya nahi, aur agar sahi hai to decodedToken se user ke details nikal ke use kar sakte ho
        //Payload (data) de dega 
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) 
        
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            // NEXT_VIDEO discuss about fronend
            throw new ApiError(401, "Invalid Access Token")
        }
        
        req.user = user // req.user se ek user object ya user field banai aur user ke data ko req.user ke ander dal diya
        console.log(req.user);
        
        next()  
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
        
    }

})  