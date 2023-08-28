require("dotenv").config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const passport = require('passport');

const debug = require("debug");

const passportConfig = require("./passport-config");

const indexRouter = require('./routes/index');
const blogRouter = require('./routes/myblog');

const app = express();

// Set up mongoose connection
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const mongoDB = process.env.CONNECTION_STRING;

main().catch((err) => debug(err));
async function main() {
  await mongoose.connect(mongoDB);
}

app.use(cors({
  origin: "*",
}));

passportConfig.initializePassport(passport);
app.use(passport.initialize());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/blog', indexRouter);
app.use('/myblog', blogRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json(res.locals.error);
});

module.exports = app;
