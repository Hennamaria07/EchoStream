import mongoose from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema(
    {
        videoFile: {
            type: String,
            required: true
        },
        thumbnail: {
            type: String,
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
            type: Number, //from cloudinary
            required: true
        },
        views: {
            type: Number, //from cloudinary
            default: 0
        },
        isPublished: {
            type: Boolean, //from cloudinary
            default: true
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
    );
    videoSchema.plugin(aggregatePaginate)

    export const Video = mongoose.model("Video", videoSchema);