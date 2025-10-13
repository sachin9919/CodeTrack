const express = require("express");
const userRouter = require("./user.router");
const repoRouter = require("./repo.router");
const issueRouter = require("./issue.router");
// FIX: Import the new cliRouter
const cliRouter = require("./cli.router");

const mainRouter = express.Router();

// Prefix all routes
mainRouter.use("/user", userRouter);
mainRouter.use("/repo", repoRouter);
mainRouter.use("/issue", issueRouter);
// FIX: Integrate the new router for CLI configuration API calls
mainRouter.use("/cli", cliRouter);

mainRouter.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

module.exports = mainRouter;