import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAcceesAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: true});
        return {accessToken, refreshToken}
    } catch (error) {
        throw new Error("Oops! something went wrong while generating access and refresh tokens");
    }
}

export const registerUser = async (req, res) => {
    // get the data from the frontend
    const { fullName, email, username, password } = req.body;
    try {
        // console.log(fullName , email , username,  password);
        // validation
        if ([fullName, email, username, password].some((fields) => fields?.trim() === "")) {
            return res.status(400).json({
                status: false,
                message: "All fields are required"
            });
        }
        // check if user with same username or email is already exists
        const existedUser = await User.findOne({
            $or: [{ username }, { email }]
        })
        if (existedUser) {
            return res.status(409).json({
                status: false,
                message: "user already exists"
            });
        }
        // taking the localpath
        const avatarLocalPath = req.files?.avatar[0]?.path;
        // const coverImgLocalPath = req.files?.coverImg[0]?.path;
        let coverImgLocalPath;
        if (req.files && Array.isArray(req.files.coverImg) && req.files.coverImg.length > 0) {
            coverImgLocalPath = req.files.coverImg[0].path;
        }
        console.log(avatarLocalPath, coverImgLocalPath);

        // check for images
        if (!avatarLocalPath) {
            res.status(400).json({
                success: false,
                message: "Avatar file is required"
            })
        }
        // upload files into cloudinary
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        const coverImg = await uploadOnCloudinary(coverImgLocalPath);

        // check the files were uploaded in the cloudinary
        if (!avatar) {
            res.status(400).json({
                success: false,
                message: "Avatar file is required"
            })
        }
        // create user object- create entry in db
        const user = await User.create({
            fullName,
            email: email.toLowerCase(),
            username: username.toLowerCase(),
            password,
            avatar: avatar.url,
            coverImg: coverImg?.url || "",
        });
        // console.log(user);
        // remove password and refresh token field from response
        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        );
        console.log(createdUser);
        if (!createdUser) {
            return res.status(500).json({
                success: false,
                message: "Oops! something went wrong!"
            });
        }
        return res.status(201).json({
            success: true,
            message: "user registered successfully",
            createdUser
        })
    }
    catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
}

export const loginUser = async (req, res) => {
    // get the data from the frontend
    const { username, email, password } = req.body;
    try {
        // validated
        if (!(username || email)) {
            return res.status(400).json({
                success: false,
                message: "username or email is required"
            });
        }
        // finding the user
        const user = await User.findOne({
            $or: [{ username }, { email }]
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "user not found"
            });
        }
        // password check
        const passwordValidate = await user.isPasswordCorrect(password);
        if (!passwordValidate) {
            return res.status(401).json({
                success: false,
                message: "invalid user credentials"
            });
        }
        // access and refresh token
        const {refreshToken, accessToken} = await generateAcceesAndRefreshTokens(user._id);
        const loggedUser = await User.findById(user._id).select("-password -refreshToken");
        console.log(loggedUser);

        // send cookie
        const options = {
            //only server can modify the cookies 
            httpOnly: true, 
            secure: true
        }
        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({
            success: true,
            message: "User loggedin successfully!",
            user: loggedUser, accessToken, refreshToken
        })
    } catch (error) {
         res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const logoutUser = async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    refreshToken: undefined
                }
            },
            {
                new: true
            }
        );
        const options = {
            httpOnly: true,
            secure: true
        };
        res.status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json({
                success: true,
                message: "User logged out successfully!"
            });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const refreshAccessToken = async (req, res) => {
    try {
        const incomingrefreshToken = req.cookies.refreshToken || req.body.refreshToken;
        if (!incomingrefreshToken) {
            return res.status(401).json({
                success: false,
                message: "unauthorized request"
            });
        }
        // verifing
        const decodedToken = jwt.verify(incomingrefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id);
        if(!user){
            return res.status(401).json({
                success: false,
                message:"invalid Refresh Token",
            })
        }
        if(incomingrefreshToken !== user?.refreshToken){
            return res.status(401).json({
                success: false,
                message:"Refresh token is expired or used",
            })
        }
        const {accessToken, newRefreshToken} = await generateAcceesAndRefreshTokens(user._id);
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", newRefreshToken, options)
        .json({
            success: true,
            accessToken,
            refreshToken: newRefreshToken,
            message: "Access token refreshed successfully!"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}