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


async function pullRepo() {
  const repoPath = path.resolve(process.cwd());
  const localRepoPath = path.join(repoPath, ".myGit");
  const commitsPath = path.join(localRepoPath, "commits");

  let repoId;

  try {
    // STEP 1: Get the Repository ID
    const config = await readConfig(repoPath);
    repoId = config.repoId;

    if (!repoId) {
      console.error("FATAL: Cannot pull. Repository ID not found in config.json.");
      return;
    }

    // STEP 2: Define the S3 prefix using the Repository ID
    // This ensures we only list objects belonging to this repo.
    const s3Prefix = `${repoId}/commits/`;

    const data = await s3
      .listObjectsV2({
        Bucket: S3_BUCKET,
        Prefix: s3Prefix, // CRITICAL FIX: Use repo-scoped prefix
      })
      .promise();

    const objects = data.Contents;

    if (!objects || objects.length <= 1) { // 1 accounts for the directory prefix itself
      console.log(`No remote content found for repository ID: ${repoId}.`);
      return;
    }

    for (const object of objects) {
      const key = object.Key;

      // Skip the directory prefix itself
      if (key === s3Prefix) continue;

      // Extract the relative commit directory (e.g., '68dff40d-a34.../commit.json')
      const relativePath = key.substring(s3Prefix.length - 8); // Start path after 'commits/'

      // Determine the full local path to save the file
      const localFilePath = path.join(commitsPath, relativePath);
      const localDir = path.dirname(localFilePath);

      // Ensure the local commit directory exists
      await fs.mkdir(localDir, { recursive: true });

      const params = {
        Bucket: S3_BUCKET,
        Key: key,
      };

      const fileContent = await s3.getObject(params).promise();

      // Write the file content to the local path
      await fs.writeFile(localFilePath, fileContent.Body);
    }

    console.log("-----------------------------------------");
    console.log(`✅ PULL SUCCESSFUL! All commits pulled from S3 for Repo ID: ${repoId}`);
    console.log("-----------------------------------------");

  } catch (err) {
    console.error("-----------------------------------------");
    console.error("❌ UNABLE TO PULL FROM S3.");
    console.error(`AWS Error: ${err.message}`);
    console.error("Action: Please confirm your AWS keys and S3 policies are correct.");
    console.error("-----------------------------------------");
  }
}

module.exports = { pullRepo };