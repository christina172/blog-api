const express = require('express');
const router = express.Router();
const passport = require("passport");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

const passportConfig = require("../passport-config");

const User = require("../models/user");
const Post = require("../models/post");
const Comment = require("../models/comment");

router.get("/posts", passport.authenticate("jwt", { session: false }), asyncHandler(async (req, res, next) => {
    res.status(200).json({ success: true, message: "You are authorized! Route to view posts (GET)" });
}));

router.get("/log-in", asyncHandler(async (req, res, next) => {
    res.json({ "message": "Route to log in (GET)" });
}));

router.post("/log-in", asyncHandler(async (req, res, next) => {
    User.findOne({ username: req.body.username })
        .then((user) => {
            if (!user) {
                res.status(401).json({ success: false, message: "Incorrect username" });
            };
            const isValid = passportConfig.verifyLogin(req.body.password, user.password);
            if (isValid) {
                const tokenObject = passportConfig.issueJWT(user);
                res.status(200).json({ success: true, user: user, token: tokenObject.token, expiresIn: tokenObject.expires });
            } else {
                console.log(req.body.password, user.password);
                res.status(401).json({ success: false, message: "Incorrect password" });
            }
        })
        .catch((err) => {
            next(err);
        })
}));

router.get("/posts/:postid", asyncHandler(async (req, res, next) => {
    res.json({ "message": "Route to view a post (GET)" });
}));

router.post("/posts", asyncHandler(async (req, res, next) => {
    res.json({ "message": "Route to add a post (POST)" });
}));

router.put("/posts/:postid", asyncHandler(async (req, res, next) => {
    res.json({ "message": "Route to update a post (PUT)" });
}));

router.delete("/posts/:postid", asyncHandler(async (req, res, next) => {
    res.json({ "message": "Route to delete a post (DELETE)" });
}));

router.delete("/posts/:postid/comments/:commentid", asyncHandler(async (req, res, next) => {
    res.json({ "message": "Route to delete a comment (DELETE)" });
}));

module.exports = router;
