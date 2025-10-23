const express = require("express");
const repoController = require("../controllers/repoController");
const issueController = require("../controllers/issueController");
// Assuming authMiddleware protects owner actions, import it if you have it
// const { protect } = require('../middleware/authMiddleware');

const repoRouter = express.Router();

// --- Public / General Repo Routes ---
repoRouter.get("/all", repoController.getAllRepositories); // Fetches ALL repos
repoRouter.get("/public", repoController.getPublicRepositories); // Fetches only PUBLIC repos
repoRouter.get("/user/:userID", repoController.fetchRepositoriesForCurrentUser); // Repos for a specific user
repoRouter.get("/:id", repoController.fetchRepositoryById); // Fetch single repo by ID

// --- Routes likely requiring Authentication (owner actions) ---
// Add 'protect' middleware before controller if needed, e.g., protect, repoController.createRepository
repoRouter.post("/create", /* protect, */ repoController.createRepository);
repoRouter.put("/update/:id", /* protect, */ repoController.updateRepositoryById);
repoRouter.patch("/toggle/:id", /* protect, */ repoController.toggleVisibilityById);
repoRouter.delete("/delete/:id", /* protect, */ repoController.deleteRepositoryById);

// --- Git Action Routes (likely require auth) ---
repoRouter.post("/:repoId/push", /* protect, */ repoController.pushToRemote);
repoRouter.post("/:repoId/pull", /* protect, */ repoController.pullFromRemote);
repoRouter.post("/:id/commit", /* protect, */ repoController.commitToRepository);

// --- Issue Routes for a specific repo (likely require auth) ---
repoRouter.post("/:repoId/issues", /* protect, */ issueController.createIssue);
repoRouter.get("/:repoId/issues", /* protect, */ issueController.getAllIssues);

module.exports = repoRouter;