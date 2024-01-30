import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
    {
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        username: {
            type: String,
            unique: true,
            required: [true, "username is required"],
            trim: true,
            lowercase: true,
            index: true //THIS IS USED FOR SEARCHING PURPOSE
        },
        email: {
            type: String,
            unique: true,
            required: [true, "email is required"],
            trim: true,
            lowercase: true
        },
        fullName: {
            type: String,
            required: [true, "fullname is required"],
            index: true //THIS IS USED FOR SEARCHING PURPOSE
        },
        avatar: {
            type: String, //url from cloudinary
            required: [true, "avatar is required"]
        },
        converImage: {
            type: String
        },
        password: {
            type: String,
            required: [true, "password is required"]
        },
        refreshToken: {
            type: String
        }
    }, 
    {
        timestamps: true
    }
    );

    // password hashing
    userSchema.pre("save", async function (next) {
        if(!this.isModified("password")) return next();
        this.password = bcrypt.hash(this.password, 10);
        next();
    })
//custom method for checking the password
userSchema.methods.isPasswordCorrect = async function (password) {
   return await bcrypt.compare(password, this.password)
}
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
        )
}
    export const User = mongoose.model("User", userSchema);