const { ExtractJwt } = require('passport-jwt');
const TwitterStrategy = require('passport-twitter');
const { User } = require('../models');
const config = require('./config');


const twitterOptions = {
  consumerKey: config.twitterapi.apiKey,
  consumerSecret: config.twitterapi.apiSecret,
  callbackURL: config.twitterapi.callbackUrl
};


const twitterVerify = (token, refreshToken, profile, done) => {
  // asynchronous
  process.nextTick(function () {
    console.log('profile ', profile)
    // find the user in the database based on their twitter id
    User.findOne({ 'twitterId': profile.id }, function (err, user) {
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
      newUser.firstName = profile._json.first_name;
      newUser.lastName = profile._json.last_name;
      newUser.email = profile._json.email;

      // save our user to the database
      newUser.save(function (dberr) {
        if (dberr) throw dberr;

        // if successful, return the new user
        return done(null, newUser);
      });
    });
  });
};

const twitterStrategy = new TwitterStrategy(twitterOptions, twitterVerify);

module.exports = {
  twitterStrategy
};
