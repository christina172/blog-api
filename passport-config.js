require("dotenv").config();
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
    const expiresIn = "30m";

    const payload = {
        sub: user._id
    };

    const signedToken = jsonwebtoken.sign(payload, process.env.TOKEN_SECRET, { expiresIn: expiresIn });

    return {
        token: "Bearer " + signedToken,
        expires: expiresIn
    }
};

module.exports.initializePassport = initializePassport;
module.exports.issueJWT = issueJWT;