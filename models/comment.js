const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    author: { type: String, required: true, maxLength: 100 },
    timestamp: { type: Date, default: Date.now() },
    text: { type: String, required: true, maxLength: 1000 },
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
});

// Export model
module.exports = mongoose.model("Comment", CommentSchema);