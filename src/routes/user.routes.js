import { Router } from "express";
import { changeCurrentPassword, currentUser, getUserChannelProfile, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccount, updateAvatar, updateCoverImg } from "../controllers/user.controllers.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();
router.route('/register').post(upload.fields([{name: "avatar", maxCount: 1}, {name: "coverImg", maxCount: 1}]), registerUser);
router.route("/login").post(loginUser)

// secured routes
router.route("/logout").post(verifyToken, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/update-password").post(verifyToken, changeCurrentPassword);
router.route("/update-account").post(verifyToken, updateAccount);
router.route("/update-avatar").patch(verifyToken, upload.single("avatar"), updateAvatar);
router.route("/update-coverimg").patch(verifyToken, upload.single("coverImg"), updateCoverImg);
router.route("/current-user").get(verifyToken, currentUser)
router.route("/:username").get(verifyToken, getUserChannelProfile)

export default router;