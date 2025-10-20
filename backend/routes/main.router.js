const express = require("express");
const userRouter = require("./user.router");
const repoRouter = require("./repo.router");
// Removed unused issueRouter import
// Removed cliRouter import as it wasn't used here before

// FIX 1: Import the new searchRouter
const searchRouter = require("./search.router");

const mainRouter = express.Router();

// Prefix all routes
mainRouter.use("/user", userRouter);
mainRouter.use("/repo", repoRouter);

// FIX 2: Integrate the new router for search API calls
// Requests to /api/search will be handled by searchRouter
mainRouter.use("/search", searchRouter);


mainRouter.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

module.exports = mainRouter;