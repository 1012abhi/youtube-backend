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
app.use(express.json({limit: '16kb'}))
// jab mere pass url se data aayega tab abhi +, space , ? jesi chiz bhi aati hai to iske liye bhi kuchh krna padega to (isko encoded krna padta hai )
app.use(express.urlencoded({extended: true, limit: '16kb'}))
// kai baar me file, pdf, images, favicon wagera apne server par store krna chahta hu to publicly (public folder me) to uske liye express ki configration hai static  
app.use(express.static("public"))

// mere server se user ke browser me cookie access bhi kr pau or cookie set bhi kr pau basically uski application pe CRUD operation perform kr pau
app.use(cookieParser());









export { app }