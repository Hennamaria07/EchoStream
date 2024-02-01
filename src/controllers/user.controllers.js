import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const registerUser = async (req, res) => {
    // get the data from the frontend
    const {fullName, email, username, password} = req.body;
    try {
        // console.log(fullName , email , username,  password);
        // validation
        if([fullName, email, username, password].some((fields) => fields?.trim() === "")) {
            return res.status(400).json({
                status: false,
                message: "All fields are required"
            });
        }
        // check if user with same username or email is already exists
        const existedUser = await User.findOne({
            $or: [{username}, {email}]
        })
        if(existedUser){
            return res.status(409).json({
                status: false,
                message: "user already exists"
            });
        }
        // taking the localpath
        const avatarLocalPath = req.files?.avatar[0]?.path;
        // const coverImgLocalPath = req.files?.coverImg[0]?.path;
        let coverImgLocalPath;
        if(req.files && Array.isArray(req.files.coverImg) && req.files.coverImg.length > 0) {
            coverImgLocalPath = req.files.coverImg[0].path;
        }
        console.log(avatarLocalPath, coverImgLocalPath);

        // check for images
        if(!avatarLocalPath){
            res.status(400).json({
                success: false,
                message: "Avatar file is required"
            })
        }
        // upload files into cloudinary
       const avatar = await uploadOnCloudinary(avatarLocalPath);
       const coverImg = await uploadOnCloudinary(coverImgLocalPath);

    // check the files were uploaded in the cloudinary
        if(!avatar){
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
        console.log(user);
        // remove password and refresh token field from response
        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        );
        console.log(createdUser);
        if(!createdUser){
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
