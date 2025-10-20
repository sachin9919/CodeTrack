const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");

const { pushRepo } = require("./push");
const { pullRepo } = require("./pull");

// --- REPOSITORY CRUD & OTHER ACTIONS ---

async function createRepository(req, res) {
  const { owner, name, description, visibility } = req.body; // Removed issues, content as they shouldn't be set initially
  try {
    if (!name) {
      return res.status(400).json({ error: "Repository name is required!" });
    }
    if (!mongoose.Types.ObjectId.isValid(owner)) {
      return res.status(400).json({ error: "Invalid User ID!" });
    }

    // Check if user exists
    const ownerUser = await User.findById(owner);
    if (!ownerUser) {
      return res.status(404).json({ error: "Owner user not found!" });
    }

    // Check if repo with the same name already exists for this user (optional but good practice)
    const existingRepo = await Repository.findOne({ name: name, owner: owner });
    if (existingRepo) {
      return res.status(400).json({ error: `Repository named '${name}' already exists for this user.` });
    }

    const newRepository = new Repository({
      name,
      description: description || "",
      visibility: visibility !== undefined ? visibility : true, // Default to public if not specified
      owner, // owner is just the ID
      // content and issues will be empty by default based on schema
    });

    // Save the new repository
    const savedRepository = await newRepository.save();

    // **FIX: Add the new repository's ID to the owner's repositories array**
    ownerUser.repositories.push(savedRepository._id);
    await ownerUser.save(); // Save the updated user document

    console.log(`Repository ${savedRepository.name} added to user ${ownerUser.username}`); // Add log

    res.status(201).json({
      message: "Repository created successfully!",
      repositoryID: savedRepository._id, // Send back the ID of the new repo
    });

  } catch (err) {
    // More specific error handling for duplicate key
    if (err.code === 11000 && err.keyPattern && err.keyPattern.name) {
      console.error("Duplicate repository name error:", err.message);
      // Note: The unique constraint is on name+owner combo ideally, but your schema has unique on name only.
      // If unique is ONLY on name, this error might trigger even for different users.
      // Consider adjusting the unique index in your schema if needed.
      return res.status(400).json({ error: `A repository named '${name}' might already exist.` });
    }
    console.error("Error during repository creation : ", err.message);
    res.status(500).json({ error: "Server error during repository creation." }); // Send JSON error
  }
}

// --- (Rest of your functions remain unchanged) ---

async function commitToRepository(req, res) {
  const { id } = req.params; // This ID is the Repository ID
  const { message, userId } = req.body;
  try {
    if (!message) {
      return res.status(400).json({ error: "Commit message is required." });
    }
    // Validate userId format before DB query
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid User ID format provided." });
    }
    // Check if the author user actually exists
    const authorUser = await User.findById(userId);
    if (!authorUser) {
      return res.status(404).json({ error: "Commit author (user) not found." });
    }

    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }
    const newCommit = {
      message: message,
      author: userId, // Store the valid ObjectId
      timestamp: new Date(),
    };
    repository.content.push(newCommit);
    const updatedRepository = await repository.save();
    res.status(200).json({
      message: "Commit successful!",
      commit: newCommit, // Send back the commit details
      repository: updatedRepository, // Send back updated repo if needed by frontend
    });
  } catch (err) {
    console.error("Error during commit : ", err.message);
    res.status(500).json({ error: "Server error during commit." });
  }
}

async function getAllRepositories(req, res) {
  try {
    const repositories = await Repository.find({})
      .populate("owner", "username") // Populate only username from owner
      // .populate("issues"); // Populating issues might be heavy, consider doing it only when needed
      .sort({ createdAt: -1 }); // Sort by newest first
    res.json(repositories);
  } catch (err) {
    console.error("Error during fetching repositories : ", err.message);
    res.status(500).json({ error: "Server error fetching repositories." }); // Send JSON error
  }
}

async function fetchRepositoryById(req, res) {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Repository ID format." });
    }
    const repository = await Repository.findById(id)
      .populate("owner", "username") // Populate only username
    // .populate("issues"); // Populate issues only if needed on this page
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }
    res.json(repository);
  } catch (err) {
    console.error("Error during fetching repository : ", err.message);
    res.status(500).json({ error: "Server error fetching repository." }); // Send JSON error
  }
}

async function fetchRepositoryByName(req, res) {
  // Note: Fetching by name might return multiple if name isn't unique across users
  // It's generally better to fetch by ID or by name + owner
  const { name } = req.params;
  try {
    const repositories = await Repository.find({ name }) // Changed findOne to find
      .populate("owner", "username")
    // .populate("issues");
    if (!repositories || repositories.length === 0) {
      return res.status(404).json({ error: `No repositories found with name '${name}'.` });
    }
    res.json(repositories); // Return array
  } catch (err) {
    console.error("Error during fetching repository by name : ", err.message);
    res.status(500).json({ error: "Server error fetching repository by name." });
  }
}

async function fetchRepositoriesForCurrentUser(req, res) {
  const { userID } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).json({ error: "Invalid User ID format." });
    }
    const repositories = await Repository.find({ owner: userID })
      .select('name description visibility createdAt') // Select only needed fields for dashboard list
      .sort({ createdAt: -1 }); // Sort by newest
    // No need to return 404 if empty, just send empty array
    res.status(200).json({ message: "Repositories fetched", repositories }); // Simplified response
  } catch (err) {
    console.error("Error during fetching user repositories : ", err.message);
    res.status(500).json({ error: "Server error fetching user repositories." }); // Send JSON error
  }
}

async function updateRepositoryById(req, res) {
  const { id } = req.params;
  // Only allow updating description via this route for simplicity now
  const { description } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Repository ID format." });
    }
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    // Only update description if provided
    if (description !== undefined) {
      repository.description = description;
    } else {
      // If description is not in body, don't change anything
      return res.status(400).json({ error: "No description provided for update." });
    }

    const updatedRepository = await repository.save();
    res.json({
      message: "Repository updated successfully!",
      repository: updatedRepository,
    });
  } catch (err) {
    console.error("Error during updating repository : ", err.message);
    res.status(500).json({ error: "Server error updating repository." });
  }
}

async function toggleVisibilityById(req, res) {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Repository ID format." });
    }
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }
    repository.visibility = !repository.visibility;
    const updatedRepository = await repository.save();
    res.json({
      message: "Repository visibility toggled successfully!",
      repository: updatedRepository,
    });
  } catch (err) {
    console.error("Error during toggling visibility : ", err.message);
    res.status(500).json({ error: "Server error toggling visibility." });
  }
}

async function deleteRepositoryById(req, res) {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Repository ID format." });
    }
    // Find the repository first to get the owner ID
    const repository = await Repository.findById(id).select('owner');
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }
    const ownerId = repository.owner;

    // Delete the repository
    const deleteResult = await Repository.findByIdAndDelete(id);
    if (!deleteResult) {
      // Should not happen if findById worked, but good practice
      return res.status(404).json({ error: "Repository not found during delete!" });
    }

    // Remove the repository reference from the owner's document
    await User.findByIdAndUpdate(ownerId, { $pull: { repositories: id } });

    console.log(`Repository ${id} deleted and removed from user ${ownerId}`); // Add log

    res.json({ message: "Repository deleted successfully!" });
  } catch (err) {
    console.error("Error during deleting repository : ", err.message);
    res.status(500).json({ error: "Server error deleting repository." });
  }
}

// --- GIT ACTIONS (PUSH & PULL) ---

async function pushToRemote(req, res) {
  const { repoId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(repoId)) {
    return res.status(400).json({ error: "Invalid Repository ID format." });
  }
  try {
    const repository = await Repository.findById(repoId); // Check if repo exists in DB
    if (!repository) {
      return res.status(404).json({ error: "Repository not found in database." });
    }
    const result = await pushRepo(repoId); // Call the push logic from push.js
    res.status(200).json({ message: result.message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function pullFromRemote(req, res) {
  const { repoId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(repoId)) {
    return res.status(400).json({ error: "Invalid Repository ID format." });
  }
  try {
    const repository = await Repository.findById(repoId); // Check if repo exists in DB
    if (!repository) {
      return res.status(404).json({ error: "Repository not found in database." });
    }
    const result = await pullRepo(repoId); // Call the pull logic from pull.js
    res.status(200).json({ message: result.message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  createRepository,
  getAllRepositories,
  commitToRepository,
  fetchRepositoryById,
  fetchRepositoryByName,
  fetchRepositoriesForCurrentUser,
  updateRepositoryById,
  toggleVisibilityById,
  deleteRepositoryById,
  pushToRemote,
  pullFromRemote,
};