const catchAsync = require('../utils/catchAsync');
const config = require('../config/config');
const { User } = require('../models');
var twitterAPI = require('node-twitter-api');

var twitter = new twitterAPI({
    consumerKey: config.twitterapi.apiKey,
    consumerSecret: config.twitterapi.apiSecret,
    callback: config.twitterapi.callbackUrl
});

const logout = catchAsync(async (req, res) => {
    req.logout();
    res.redirect(config.clientRedirectUrl);
});


const connect = catchAsync(async (req, res) => {
    twitter.getRequestToken(function (error, requestToken, requestTokenSecret, results) {
        if (error) {
            console.log("Error getting OAuth request token : " + error);
        } else {
            req.session.oauthRequestToken = requestToken;
            req.session.oauthRequestTokenSecret = requestTokenSecret;
            const redirect = {
                redirectUrl: `https://api.twitter.com/oauth/authenticate?oauth_token=${req.session.oauthRequestToken}`
            }
            res.send(redirect);
        }
    });
});

const saveAccessTokens = catchAsync(async (req, res) => {
    twitter.getAccessToken(req.query.oauth_token, req.session.oauthRequestTokenSecret, req.query.oauth_verifier, (error, oauthAccessToken, oauthAccessTokenSecret, results) => {
        if (error) {
            res.status(500).send(error)
        } else {
            req.session.oauthAccessToken = oauthAccessToken;
            req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
            twitter.verifyCredentials(oauthAccessToken, oauthAccessTokenSecret, function (error, data, response) {
                if (error) {
                    res.send(error, 500);
                } else {
                    User.findOne({ 'twitterId': data.id }, function (err, user) {
                        // if there is an error, stop everything and return that
                        // ie an error connecting to the database
                        if (err) {
                            res.send(error, 500);
                        }
                        // if the user is found, then log them in
                        if (user) {
                            res.send(data);
                        } else {
                            const newUser = new User();
                            newUser.name = data.name,
                            newUser.screenName = data.screen_name,
                            newUser.twitterId = data.id,
                            newUser.profileImageUrl = data.profile_image_url
                            newUser.save();
                        }
                    });
                }
            });
        }
    });
})

module.exports = {
    logout,
    connect,
    saveAccessTokens
};
