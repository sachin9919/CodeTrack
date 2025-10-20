const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const dotenv = require("dotenv");

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
    res.status(500).send("Server error");
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
    res.status(500).send("Server error!");
  }
}

// --- Get All Users ---
async function getAllUsers(req, res) {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    console.error("Error during fetching : ", err.message);
    res.status(500).send("Server error!");
  }
}

// --- Get User Profile ---
async function getUserProfile(req, res) {
  const currentID = req.params.id;
  try {
    // Fetch the user initially without populating repositories to check the IDs
    const userWithRepoIds = await User.findById(currentID).select('repositories');
    if (!userWithRepoIds) {
      return res.status(404).json({ message: "User not found!" });
    }
    // FIX 1: Log the raw repository IDs stored in the user document
    console.log("Raw repository IDs found in user document:", userWithRepoIds.repositories);

    // Now, fetch the user again, this time populating the repositories
    const user = await User.findById(currentID)
      .select('username email followedUsers repositories createdAt')
      .populate({
        path: 'repositories',
        select: 'name description visibility',
        options: { limit: 10, sort: { createdAt: -1 } }
      });

    // FIX 2: Log the repositories array *after* attempting population
    console.log("Repositories array *after* populate:", user.repositories);

    // Calculate following count
    const followingCount = user.followedUsers.length;

    // Send back the user data
    const userProfileData = user.toObject();
    userProfileData.followingCount = followingCount;

    res.send(userProfileData);

  } catch (err) {
    console.error("Error during fetching profile: ", err.message);
    res.status(500).send("Server error!");
  }
}


// --- Update User Profile ---
async function updateUserProfile(req, res) {
  const currentID = req.params.id;
  const { email, password } = req.body;
  try {
    const user = await User.findById(currentID);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    const updatedUser = await user.save();
    res.send(updatedUser);
  } catch (err) {
    console.error("Error during updating : ", err.message);
    res.status(500).send("Server error!");
  }
}

// --- Delete User Profile ---
async function deleteUserProfile(req, res) {
  const currentID = req.params.id;
  try {
    const result = await User.findByIdAndDelete(currentID);
    if (!result) {
      return res.status(404).json({ message: "User not found!" });
    }
    res.json({ message: "User Profile Deleted!" });
  } catch (err) {
    console.error("Error during deleting : ", err.message);
    res.status(500).send("Server error!");
  }
}

module.exports = {
  getAllUsers,
  signup,
  login,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
};