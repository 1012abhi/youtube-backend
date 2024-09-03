import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

// register route se registerUser method pe koi ja raha hai to middleware se milke jana 
router.route("/register").post(
//upload is a middleware
//    ⬇️
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]), 
    registerUser
    )

export default router