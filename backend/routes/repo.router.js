const express = require("express");
const repoController = require("../controllers/repoController");
const issueController = require("../controllers/issueController");

const repoRouter = express.Router();

// --- Basic Repo Routes ---
repoRouter.post("/create", repoController.createRepository);
repoRouter.get("/all", repoController.getAllRepositories);
repoRouter.get("/user/:userID", repoController.fetchRepositoriesForCurrentUser);
repoRouter.get("/:id", repoController.fetchRepositoryById);
repoRouter.put("/update/:id", repoController.updateRepositoryById);
repoRouter.patch("/toggle/:id", repoController.toggleVisibilityById);
repoRouter.delete("/delete/:id", repoController.deleteRepositoryById);

// --- Git Action Routes ---
repoRouter.post("/:repoId/push", repoController.pushToRemote);
repoRouter.post("/:repoId/pull", repoController.pullFromRemote);

// FIX: Added the missing route for Commits.
// The frontend calls /:id/commit, so we use :id here.
repoRouter.post("/:id/commit", repoController.commitToRepository);

// --- Issue Routes for a specific repo ---
repoRouter.post("/:repoId/issues", issueController.createIssue);
repoRouter.get("/:repoId/issues", issueController.getAllIssues);

module.exports = repoRouter;