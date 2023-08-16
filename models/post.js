const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title: { type: String, required: true, maxLength: 100 },
    timestamp: { type: Date, default: Date.now() },
    text: { type: String, required: true, maxLength: 10000 },
    published: { type: Boolean, required: true, default: false },
});

// Export model
module.exports = mongoose.model("Post", PostSchema);