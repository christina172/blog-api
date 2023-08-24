const express = require('express');
const router = express.Router();
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

const User = require("../models/user");
const Post = require("../models/post");
const Comment = require("../models/comment");

router.get("/posts", asyncHandler(async (req, res, next) => {
  const allPosts = await Post.find().sort({ timestamp: -1 }).exec();

  res.json(allPosts);
}));

router.get("/posts/:postid", asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.postid).exec();
  if (post === null) {
    // No results.
    const err = new Error("Post not found");
    err.status = 404;
    return next(err);
  }
  const allCommentsToAPost = await Comment.find({ post: req.params.postid }).sort({ timestamp: -1 }).exec();

  res.json({ post: post, allCommentsToAPost: allCommentsToAPost });
}));

router.post("/posts/:postid/comments", [
  body("author").trim().escape(),
  body("text").trim().escape(),

  asyncHandler(async (req, res, next) => {

    const comment = new Comment({
      author: req.body.author,
      timestamp: Date.now(),
      text: req.body.text,
      post: req.params.postid,
    });

    await comment.save();
    res.json(comment);
  })
]);

module.exports = router;
