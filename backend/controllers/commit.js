const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

async function commitRepo(message) {
  const repoPath = path.resolve(process.cwd(), ".myGit");
  const stagedPath = path.join(repoPath, "staging"); // system ko bata reahe hain is folder se cheeze copy karni hain dusre folder mein
  const commitPath = path.join(repoPath, "commits");

  try {
    const commitID = uuidv4();
    const commitDir = path.join(commitPath, commitID); // yaha pe kaam chal raha hai jo id mili hain usse folder banane ka 
    await fs.mkdir(commitDir, { recursive: true }); // recursive true isliye kiya ki agar nested structure ho to kaam ho jana chahiye koi dikkat nahi ani chahiye

    const files = await fs.readdir(stagedPath);
    for (const file of files) {
      await fs.copyFile(
        path.join(stagedPath, file),  // yaha pe file ko stage karwa ke agli line me commit karane ke prayas kiye ja rahe hain
        path.join(commitDir, file)
      );
    }

    await fs.writeFile(
      path.join(commitDir, "commit.json"),
      JSON.stringify({ message, date: new Date().toISOString() }) // to yaha pe user ke dwara java script ke roop mein provide ki gyi info ko json roop mein badal kar transfer kara ja raha hai, badi adbhut prakriya hai...:)
    );

    console.log(`Commit ${commitID} created with message: ${message}`);
  } catch (err) {
    console.error("Error committing files : ", err);
  }
}

module.exports = { commitRepo };