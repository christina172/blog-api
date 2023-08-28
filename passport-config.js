require("dotenv").config();
const bcrypt = require('bcryptjs');
const jsonwebtoken = require("jsonwebtoken");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const User = require("./models/user");

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.TOKEN_SECRET
};

const strategy = new JwtStrategy(options, (payload, done) => {
    User.findOne({ _id: payload.sub })
        .then((user) => {
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        })
        .catch(err => done(err, false));
});

function initializePassport(passport) {
    passport.use(strategy);
};

function issueJWT(user) {
    const expiresIn = "2m";

    const payload = {
        sub: user._id
    };

    const signedToken = jsonwebtoken.sign(payload, process.env.TOKEN_SECRET, { expiresIn: expiresIn });

    return {
        token: "Bearer " + signedToken,
        expires: expiresIn
    }
};

async function verifyLogin(password, hash) {
    bcrypt.compare(password, hash, (err, res) => {
        if (res) {
            return true;
        } else {
            return false;
        }
    })
};


module.exports.initializePassport = initializePassport;
module.exports.issueJWT = issueJWT;
module.exports.verifyLogin = verifyLogin;