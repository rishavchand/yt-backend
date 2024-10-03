import mongoose, {schema} from "mongoose";
import mongooseaggregatepaginate from mongooseaggregatepaginate;

const videoSchema = new schema({
    videoFile: {
        type: String, // cloudinary url
        required: true
    },

    thumbnail: {
        type: String, // cloudinary url
        required: true
    },

    title: {
        type: String, 
        required: true
    },

    description: {
        type: String,
        required: true
    },

    duration: {
        type: Number,
        required: true
    },

    views: {
        type: Number,
        default: 0
    },

    isPublished: {
        type: Boolean,
        default: true
    },

    owner: {
        type: schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps: true})

videoSchema.plugin(mongooseaggregatepaginate);

export const Video = mongoose.model("Video", videoSchema)