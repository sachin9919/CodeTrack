const mongoose = require("mongoose");
const { Schema } = mongoose;

// NEW: Define the structure for a single Commit entry
const CommitSchema = new Schema({
  message: { type: String, required: true },
  // Mongoose will correctly cast the 'userId' string to ObjectId
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  timestamp: { type: Date, default: Date.now },
});

const RepositorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    // FIX: Change content array type from String to the new CommitSchema
    content: [CommitSchema],
    visibility: {
      type: Boolean,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    issues: [
      {
        type: Schema.Types.ObjectId,
        ref: "Issue",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Repository = mongoose.model("Repository", RepositorySchema);
module.exports = Repository;