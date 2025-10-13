const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");
// FIX: Use destructuring to explicitly pull 'fetch' from the required module.
const { default: fetch } = require('node-fetch');


// --- CONFIGURATION ---
const API_URL = "http://localhost:3000/repo";
const USER_ID = process.env.APNA_USER_ID;

// Utility to read config.json
async function readConfig(repoPath) {
  try {
    // Correctly locate config.json inside the .myGit folder
    const configPath = path.join(repoPath, '.myGit', 'config.json');
    const content = await fs.readFile(configPath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error("CRITICAL: Failed to read .myGit/config.json. Is your repo initialized?", err.message);
    throw new Error("Repository configuration not found. Please ensure you are in the project root.");
  }
}


async function commitRepo(message) {
  const repoPath = path.resolve(process.cwd()); // Assume running from project root
  const stagedPath = path.join(repoPath, ".myGit", "staging");
  const commitPath = path.join(repoPath, ".myGit", "commits");

  if (!USER_ID) {
    console.error("FATAL: Cannot commit. APNA_USER_ID environment variable is missing.");
    console.error("Action: Please set it (e.g., export APNA_USER_ID=\"<YourUserId>\").");
    return;
  }

  try {
    // STEP 1: Read Repository ID from local config
    const config = await readConfig(repoPath);
    const repoId = config.repoId;

    if (!repoId) {
      console.error("FATAL: Repository ID not found in config.json. Please ensure config.json has {'repoId': '<MongoDB_ID>'}");
      return;
    }

    // STEP 2: Perform Local File Operations
    const commitID = uuidv4();
    const commitDir = path.join(commitPath, commitID);
    await fs.mkdir(commitDir, { recursive: true });

    const files = await fs.readdir(stagedPath);
    for (const file of files) {
      await fs.copyFile(
        path.join(stagedPath, file),
        path.join(commitDir, file)
      );
    }

    await fs.writeFile(
      path.join(commitDir, "commit.json"),
      JSON.stringify({ message, date: new Date().toISOString() })
    );

    // ------------------------------------------------------------------
    // STEP 3: INTEGRATE WITH WEB API (Send Commit Metadata to MongoDB)
    // ------------------------------------------------------------------

    const endpoint = `${API_URL}/${repoId}/commit`;

    console.log(`\nSending commit metadata to MongoDB via API: ${endpoint}`);

    // FIX: fetch is now correctly imported via destructuring
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        userId: USER_ID
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log("-----------------------------------------");
      console.log(`✅ COMMIT SUCCESSFUL: Local files saved and metadata recorded in MongoDB.`);
      console.log(`Local Commit ID: ${commitID}`);
      console.log(`Commit Message: ${data.commit.message}`);
      console.log("-----------------------------------------");
    } else {
      console.log("-----------------------------------------");
      console.error("❌ WARNING: Local files saved, but METADATA FAILED to save to MongoDB.");
      console.error(`API Error: ${data.error || data.message || 'Unknown server error.'}`);
      console.log("-----------------------------------------");
    }


  } catch (err) {
    console.error("Error executing commit:", err.message);
  }
}

module.exports = { commitRepo };