const fs = require("fs").promises;
const path = require("path");
const { s3, S3_BUCKET } = require("../config/aws-config");

// Utility to read config.json (Copied from commit.js)
async function readConfig(repoPath) {
  try {
    const configPath = path.join(repoPath, '.myGit', 'config.json');
    const content = await fs.readFile(configPath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error("CRITICAL: Failed to read .myGit/config.json. Is your repo initialized?", err.message);
    throw new Error("Repository configuration not found.");
  }
}

async function pushRepo() {
  const repoPath = path.resolve(process.cwd());
  const localRepoPath = path.join(repoPath, ".myGit");
  const commitsPath = path.join(localRepoPath, "commits");

  let repoId;

  try {
    // STEP 1: Get the Repository ID
    const config = await readConfig(repoPath);
    repoId = config.repoId;

    if (!repoId) {
      console.error("FATAL: Cannot push. Repository ID not found in config.json.");
      return;
    }

    const commitDirs = await fs.readdir(commitsPath);

    if (commitDirs.length === 0) {
      console.log("No new commits found to push.");
      return;
    }

    for (const commitDir of commitDirs) {
      const commitPath = path.join(commitsPath, commitDir);
      const files = await fs.readdir(commitPath);

      for (const file of files) {
        const filePath = path.join(commitPath, file);
        const fileContent = await fs.readFile(filePath);

        // STEP 2: CRITICAL FIX: Use the Repository ID in the S3 Key
        // S3 Key Format: [REPO_ID]/commits/[COMMIT_ID]/[FILENAME]
        const s3Key = `${repoId}/commits/${commitDir}/${file}`;

        const params = {
          Bucket: S3_BUCKET,
          Key: s3Key,
          Body: fileContent,
        };

        await s3.upload(params).promise();
      }
    }

    console.log("-----------------------------------------");
    console.log(`✅ PUSH SUCCESSFUL! All file content pushed to S3 for Repo ID: ${repoId}`);
    console.log("-----------------------------------------");
  } catch (err) {
    console.error("-----------------------------------------");
    console.error("❌ ERROR PUSHING TO S3.");
    console.error(`AWS Error: ${err.message}`);
    console.error("Action: Please confirm your AWS keys are active and your S3 bucket permissions are correct.");
    console.error("-----------------------------------------");
  }
}

module.exports = { pushRepo };