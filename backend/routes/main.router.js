const express = require("express");
const userRouter = require("./user.router");
const repoRouter = require("./repo.router");
const issueRouter = require("./issue.router");

const mainRouter = express.Router();

// Prefix all routes
mainRouter.use("/user", userRouter);
mainRouter.use("/repo", repoRouter);
mainRouter.use("/issue", issueRouter);

mainRouter.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

module.exports = mainRouter;