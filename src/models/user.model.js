import mongoose, {Schema} from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt' 

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, // यह अतिरिक्त स्पेस को हटाने के लिए है
            index: true
        },   
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String,     //cloudinary url
            required: true
        },
        coverImage: {
            type: String,
            required: true
        },
        coverImage: {
            type: String
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Video'
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required'],  
        },
        refreshToken: {
            type: String,
        }
    }, {timestamps: true}
)

// ------------------- password encryption ---------------
// jab bhi aap pre ke under callback likh rhe ho to please aero function me mat likhna kyuki iske pass this ka refrence nahi hota hai 
// isiliye bhi isme normal functioni ka use krunga 
// ab encryption me thoda time lagta hai to ham async await ka use krenge
// ab hamne middleware liya hai to next to likhna hi padega (next kuchh nahi bss ek flag hai kaam ho gya hai ab aage pass krdo)
userSchema.pre("save", async function (next) {
    // yadi password modified hi nahi hua hai to return krdo
    if(!this.isModified("password")) return next(); 

    // yadi modified hua hai to password encrypt krdo
    this.password = bcrypt.hash(this.password, 10)
    next()
})

// ------------------ custom methods -------------
// database me hamne jo password store karaya hai wo to hai encrypted form me lekin jo user hame dega wo to jo hai wo hi hoga na 
// ham bss isme check kr rahe hai ki password sahi hai ki nahi
userSchema.methods.isPasswordCorrect = async function (password) {
    // bcrypt :- check krke de dega iske pass ek method hai compare ye true or false de dega
    return await bcrypt.compare(password, this.password)    
}

// method - ACCESS TOKEN GENERATE and REFRESH TOKEN GENERATE dono hi JWT tokens hai
userSchema.methods.generateAccessToken = function(){ 
    // jwt ke ander sign method hai jo ki generate kr deta hai token
    return jwt.sign(
        {
// left wala to key hai or right me jo hai wo database se aa raha hai
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        // expiry ke liye Object lagta hai 
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model('User', userSchema)