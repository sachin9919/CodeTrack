const express = require("express");
const userController = require("../controllers/userController");
// FIX 1: Import the protect middleware
const { protect } = require('../middleware/authMiddleware');

const userRouter = express.Router();

// Public routes
userRouter.get("/allUsers", userController.getAllUsers); // Usually public or admin-only
userRouter.post("/signup", userController.signup);
userRouter.post("/login", userController.login);

// --- Protected Routes ---
// Apply the 'protect' middleware before the controller function for these routes
// The middleware will run first, verify the token, and add req.user

// Profile routes
// Apply protect to getUserProfile so it can check 'isFollowing' based on req.user.id
userRouter.get("/userProfile/:id", protect, userController.getUserProfile);
userRouter.put("/updateProfile/:id", protect, userController.updateUserProfile);
userRouter.delete("/deleteProfile/:id", protect, userController.deleteUserProfile);

// Follow/Unfollow routes
userRouter.post("/follow/:idToFollow", protect, userController.followUser);
userRouter.post("/unfollow/:idToUnfollow", protect, userController.unfollowUser);

module.exports = userRouter;