import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyToken = async (req, res, next) => {
try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if(!token){
        return res.status(401).json({
            success: false,
            message:"Unauthenicated request",
        })
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    if(!user){
        return res.status(401).json({
            success: false,
            message:"invalid Access Token",
        })
    }
    req.user = user
} catch (error) {
    return res.status(401).json({
        success: false,
        message:error.message,
    })
}
}