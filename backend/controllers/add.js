const fs = require("fs").promises;
const path = require("path");

async function addRepo(filePath) {
  // The base directory where the command is executed (e.g., C:\...\backend)
  const currentDir = process.cwd();

  // CRITICAL FIX: Resolve the file path relative to the project root (one level up)
  const fileToAddPath = path.resolve(currentDir, "..", filePath);

  // The staging path is correctly located inside the current directory
  const stagingPath = path.join(currentDir, ".myGit", "staging");

  try {
    await fs.mkdir(stagingPath, { recursive: true });
    const fileName = path.basename(filePath);

    // Copy the file from the calculated file location to the staging folder
    await fs.copyFile(fileToAddPath, path.join(stagingPath, fileName));
    console.log(`File ${fileName} added to the staging area!`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error(`Error adding file: File not found.`);
      console.error(`Attempted to find file at: ${fileToAddPath}`);
      console.error("Please ensure the file exists in the project root folder (one level above 'backend').");
    } else {
      console.error("Error adding file : ", err);
    }
  }
}

module.exports = { addRepo };