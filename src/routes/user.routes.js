import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controllers.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();
router.route('/register').post(upload.fields([{name: "avatar", maxCount: 1}, {name: "coverImg", maxCount: 1}]), registerUser);
router.route("/login").post(loginUser)

// secured routes
router.route("/logout").post(verifyToken, logoutUser)

export default router;