import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

// app.use ham tab use krte hai jab hame middleware ka use krna hota hai 
app.use(cors({
    // aap kon konsa origin allow kr rahe ho
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

// are bhai json ke liye ek limit bhi to lagaunga server crash thodi nahi krwana hai
app.use(express.json({limit: '100mb'}))
// jab mere pass url se data aayega tab abhi +, space , ? jesi chiz bhi aati hai to iske liye bhi kuchh krna padega to (isko encoded krna padta hai )
app.use(express.urlencoded({extended: true, limit: '100mb'}))
// kai baar me file, pdf, images, favicon wagera apne server par store krna chahta hu to publicly (public folder me) to uske liye express ki configration hai static  
app.use(express.static("public"))

// mere server se user ke browser me cookie access bhi kr pau or cookie set bhi kr pau basically uski application pe CRUD operation perform kr pau
app.use(cookieParser());


// routers most of the time hame middleware ke niche hi import krte hai like this ⬇️
// routes import 
import userRouter from './routes/user.routes.js'
import tweetRouter from './routes/tweet.routes.js'
import commentRouter from './routes/comment.routes.js'
import videoRouter from './routes/video.routes.js'
import likeRouter from './routes/like.routes.js'
import playlistRouter from './routes/playlist.routes.js'
import subscriptionRouter from './routes/subscription.routes.js'

// routes declarations:- app.get() ka use yaha nahi kr sakte kyuki get ek hi file me use kr skte hai 
// lekin ab ham sepratlly likh rahe hai to ab router ko lane ke liye middleware laga hoga -- app.use()

app.use("/api/v1/users", userRouter)
app.use("/api/v1/tweet", tweetRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlists", playlistRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)

// http://localhost:8000/api/v1/users/register

export { app }