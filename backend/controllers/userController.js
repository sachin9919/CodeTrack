const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const dotenv = require("dotenv");
const mongoose = require("mongoose"); // Import mongoose for ID validation

dotenv.config();

// --- Signup ---
async function signup(req, res) {
  const { username, password, email } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: "User already exists!" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ username, password: hashedPassword, email });
    const savedUser = await newUser.save();
    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });
    res.json({ token, userId: savedUser._id });
  } catch (err) {
    console.error("Error during signup : ", err.message);
    res.status(500).json({ error: "Server error during signup." }); // Send JSON error
  }
}

// --- Login ---
async function login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });
    res.json({ token, userId: user._id });
  } catch (err) {
    console.error("Error during login : ", err.message);
    res.status(500).json({ error: "Server error during login." }); // Send JSON error
  }
}

// --- Get All Users ---
async function getAllUsers(req, res) {
  try {
    const users = await User.find({}).select('username _id'); // Select only needed fields
    res.json(users);
  } catch (err) {
    console.error("Error fetching all users: ", err.message);
    res.status(500).json({ error: "Server error fetching users." });
  }
}

// --- Get User Profile ---
async function getUserProfile(req, res) {
  const profileUserId = req.params.id;
  // Assumes authentication middleware adds req.user.id for the logged-in user
  const loggedInUserId = req.user?.id; // Use optional chaining

  if (!mongoose.Types.ObjectId.isValid(profileUserId)) {
    return res.status(400).json({ message: "Invalid profile user ID format." });
  }

  try {
    const user = await User.findById(profileUserId)
      .select('username email followedUsers repositories createdAt')
      .populate({
        path: 'repositories',
        select: 'name description visibility _id', // Include _id for link
        options: { limit: 10, sort: { createdAt: -1 } }
      });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const followingCount = user.followedUsers.length;

    // FIX 1: Check if the logged-in user is following this profile user
    let isFollowing = false;
    if (loggedInUserId && mongoose.Types.ObjectId.isValid(loggedInUserId)) {
      // Find the logged-in user's document to check their followedUsers array
      const loggedInUser = await User.findById(loggedInUserId).select('followedUsers');
      if (loggedInUser && loggedInUser.followedUsers.includes(profileUserId)) {
        isFollowing = true;
      }
    }

    // Convert Mongoose doc to plain object to add properties
    const userProfileData = user.toObject();
    userProfileData.followingCount = followingCount;
    userProfileData.isFollowing = isFollowing; // Add the following status

    // Remove sensitive data if not viewing own profile (optional)
    // if (loggedInUserId !== profileUserId) { delete userProfileData.email; }

    res.send(userProfileData);

  } catch (err) {
    console.error("Error during fetching profile: ", err.message);
    res.status(500).json({ error: "Server error fetching profile." });
  }
}

// --- Update User Profile ---
async function updateUserProfile(req, res) {
  const profileUserId = req.params.id;
  const loggedInUserId = req.user?.id; // Assumes auth middleware
  const { email, password } = req.body;

  // Security Check: Make sure the logged-in user can only update their own profile
  if (!loggedInUserId || loggedInUserId !== profileUserId) {
    return res.status(403).json({ error: "Forbidden: You can only update your own profile." });
  }
  if (!mongoose.Types.ObjectId.isValid(profileUserId)) {
    return res.status(400).json({ message: "Invalid user ID format." });
  }

  try {
    const user = await User.findById(profileUserId);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    // Update fields if provided
    if (email) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    const updatedUser = await user.save();
    // Avoid sending password hash back
    updatedUser.password = undefined;
    res.send(updatedUser);
  } catch (err) {
    console.error("Error during updating profile: ", err.message);
    res.status(500).json({ error: "Server error updating profile." });
  }
}

// --- Delete User Profile ---
async function deleteUserProfile(req, res) {
  const profileUserId = req.params.id;
  const loggedInUserId = req.user?.id; // Assumes auth middleware

  // Security Check: Make sure the logged-in user can only delete their own profile
  if (!loggedInUserId || loggedInUserId !== profileUserId) {
    return res.status(403).json({ error: "Forbidden: You can only delete your own profile." });
  }
  if (!mongoose.Types.ObjectId.isValid(profileUserId)) {
    return res.status(400).json({ message: "Invalid user ID format." });
  }

  try {
    const result = await User.findByIdAndDelete(profileUserId);
    if (!result) {
      return res.status(404).json({ message: "User not found!" });
    }
    // TODO: Consider deleting user's repos, issues, etc., or reassigning ownership
    res.json({ message: "User Profile Deleted!" });
  } catch (err) {
    console.error("Error during deleting profile: ", err.message);
    res.status(500).json({ error: "Server error deleting profile." });
  }
}

// --- FIX 2: Add Follow User Function ---
async function followUser(req, res) {
  const idToFollow = req.params.idToFollow;
  const currentUserId = req.user?.id; // Assumes auth middleware provides logged-in user's ID

  if (!currentUserId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  if (currentUserId === idToFollow) {
    return res.status(400).json({ error: "You cannot follow yourself." });
  }
  if (!mongoose.Types.ObjectId.isValid(idToFollow)) {
    return res.status(400).json({ message: "Invalid user ID format to follow." });
  }


  try {
    const userToFollow = await User.findById(idToFollow);
    if (!userToFollow) {
      return res.status(404).json({ error: "User to follow not found." });
    }

    // Add idToFollow to the current user's followedUsers array using $addToSet to prevent duplicates
    const updatedUser = await User.findByIdAndUpdate(
      currentUserId,
      { $addToSet: { followedUsers: idToFollow } },
      { new: true } // Return the updated document
    ).select('followedUsers'); // Only return the updated array

    if (!updatedUser) {
      return res.status(404).json({ error: "Current user not found." }); // Should not happen if authenticated
    }

    res.json({ message: `Successfully followed ${userToFollow.username}`, followedUsers: updatedUser.followedUsers });

  } catch (err) {
    console.error("Error during follow user: ", err.message);
    res.status(500).json({ error: "Server error during follow." });
  }
}

// --- FIX 3: Add Unfollow User Function ---
async function unfollowUser(req, res) {
  const idToUnfollow = req.params.idToUnfollow;
  const currentUserId = req.user?.id; // Assumes auth middleware

  if (!currentUserId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  if (currentUserId === idToUnfollow) {
    return res.status(400).json({ error: "You cannot unfollow yourself." });
  }
  if (!mongoose.Types.ObjectId.isValid(idToUnfollow)) {
    return res.status(400).json({ message: "Invalid user ID format to unfollow." });
  }

  try {
    // Check if user to unfollow exists (optional, but good practice)
    const userToUnfollow = await User.findById(idToUnfollow).select('username');
    if (!userToUnfollow) {
      // Unfollowing someone who doesn't exist technically succeeds in the goal
      // but you might want to return 404 if the ID format was valid but user is gone.
      console.log(`Attempted to unfollow non-existent user ID: ${idToUnfollow}`);
    }

    // Remove idToUnfollow from the current user's followedUsers array using $pull
    const updatedUser = await User.findByIdAndUpdate(
      currentUserId,
      { $pull: { followedUsers: idToUnfollow } },
      { new: true }
    ).select('followedUsers');

    if (!updatedUser) {
      return res.status(404).json({ error: "Current user not found." });
    }

    res.json({ message: `Successfully unfollowed user`, followedUsers: updatedUser.followedUsers });

  } catch (err) {
    console.error("Error during unfollow user: ", err.message);
    res.status(500).json({ error: "Server error during unfollow." });
  }
}


module.exports = {
  getAllUsers,
  signup,
  login,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  // FIX 4: Export new functions
  followUser,
  unfollowUser,
};