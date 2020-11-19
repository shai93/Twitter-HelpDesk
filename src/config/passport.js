const { ExtractJwt } = require('passport-jwt');
const TwitterStrategy = require('passport-twitter');
const { User } = require('../models');
const config = require('./config');
const passport = require('passport');


const twitterOptions = {
  consumerKey: config.twitterapi.apiKey,
  consumerSecret: config.twitterapi.apiSecret
};


const twitterVerify = (token, refreshToken, profile, done) => {
  // asynchronous
  process.nextTick(function () {
    // find the user in the database based on their twitter id
    User.findOne({ 'twitterId': profile._json.id_str }, function (err, user) {
      // if there is an error, stop everything and return that
      // ie an error connecting to the database
      if (err) return done(err);

      // if the user is found, then log them in
      if (user) {
        return done(null, user); // user found, return that user
      }
      // if there is no user found with that twitter id, create them
      const newUser = new User();
      // set all of the twitter information in our user model
      newUser.name = profile._json.name,
      newUser.screenName = profile._json.screen_name,
      newUser.twitterId = profile._json.id_str,
      newUser.profileImageUrl = profile._json.profile_image_url

      // save our user to the database
      newUser.save(function (dberr) {
        if (dberr) throw dberr;

        // if successful, return the new user
        return done(null, newUser);
      });
    });
  });
};

// serialize the user.id to save in the cookie session
// so the browser will remember the user when login
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// deserialize the cookieUserId to user in the database
passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => {
      done(null, user);
    })
    .catch(e => {
      done(new Error("Failed to deserialize an user"));
    });
});


const twitterStrategy = new TwitterStrategy(twitterOptions, twitterVerify);

module.exports = {
  twitterStrategy
};
