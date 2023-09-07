const express = require('express');
const router = express.Router();
const passport = require("passport");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');

const passportConfig = require("../passport-config");

const User = require("../models/user");
const Post = require("../models/post");
const Comment = require("../models/comment");

router.get("/posts", passport.authenticate("jwt", { session: false }), asyncHandler(async (req, res, next) => {
    const allPosts = await Post.find().sort({ timestamp: -1 }).exec();

    res.status(200).json(allPosts);
}));

router.post("/log-in", asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
        return res.json({ success: false, message: "Incorrect username" });
    };
    const isValid = await bcrypt.compare(req.body.password, user.password);
    if (isValid) {
        const tokenObject = passportConfig.issueJWT(user);
        return res.status(200).json({ success: true, user: user, token: tokenObject.token, expiresIn: tokenObject.expires });
    } else {
        return res.json({ success: false, message: "Incorrect password" });
    }
}));

router.get("/posts/:postid", passport.authenticate("jwt", { session: false }), getPost, asyncHandler(async (req, res, next) => {
    const allCommentsToAPost = await Comment.find({ post: req.params.postid }).sort({ timestamp: -1 }).exec();

    res.status(200).json({ post: res.post, allCommentsToAPost: allCommentsToAPost });
}));

router.post("/posts", passport.authenticate("jwt", { session: false }), [
    body("title").trim().escape(),
    body("text").trim().escape(),

    (async (req, res, next) => {

        const post = new Post({
            title: req.body.title,
            timestamp: Date.now(),
            text: req.body.text,
            published: req.body.published,
        });

        await post.save();
        res.status(201).json(post);
    })
]);

router.patch("/posts/:postid", passport.authenticate("jwt", { session: false }), getPost, asyncHandler(async (req, res, next) => {
    if (req.body.title != null) {
        body("title").trim().escape();
        res.post.title = req.body.title
    };
    if (req.body.text != null) {
        body("text").trim().escape();
        res.post.text = req.body.text
    };
    if (req.body.published != null) {
        res.post.published = req.body.published
    };
    const updatedPost = await res.post.save();
    res.json({ success: true, message: "Updated post", post: updatedPost });
}));

router.delete("/posts/:postid", passport.authenticate("jwt", { session: false }), getPost, asyncHandler(async (req, res, next) => {
    await Comment.deleteMany({ post: req.params.postid }).exec();
    await res.post.deleteOne();
    res.json({ success: true, message: "Deleted post" });
}));

router.delete("/posts/:postid/comments/:commentid", passport.authenticate("jwt", { session: false }), asyncHandler(async (req, res, next) => {
    const comment = await Comment.findById(req.params.commentid).exec();
    if (comment === null) {
        return res.status(404).json({ success: false, message: "Comment not found" })
    };
    await comment.deleteOne();
    res.json({ success: true, message: "Deleted comment" });
}));

async function getPost(req, res, next) {
    let post;
    try {
        post = await Post.findById(req.params.postid).exec();
        if (post == null) {
            return res.status(404).json({ success: false, message: "Post not found" })
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message })
    }
    res.post = post;
    next();
}

module.exports = router;
