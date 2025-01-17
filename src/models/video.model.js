import mongoose, {Schema} from "mongoose";
// iska matlab bss itna hi hai ki ek page par kitna content ho kitna content ham dikhana chahtehai sara to de hi  nahi skte hai ha chahe to load krwa le
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; 

const videoSchema = new Schema(
    {   
        videosFile: {
            type: String, //cloudinary url
            required: true
        },
        thumbnail: {
            type: String,//cloudinary url
            required: true
        },
        title: {
            type: String, 
            required: true
        },
        description : {
            type: String,
            required: true
        },
        duration : {
            type: Number,
            // required: true
        },
        views: {
            type: Number,
            default: 0
        },
        isPublised: {
            type: Boolean,
            default: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
    },
    {
        timestamps: true
    }
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model('Video', videoSchema)