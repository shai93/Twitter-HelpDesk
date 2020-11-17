const catchAsync = require('../utils/catchAsync');
const config = require('../config/config');
const httpStatus = require('http-status');
const oauth = require('oauth');
const { User } = require('../models');
const _twitterConsumerKey = config.twitterapi.apiKey;
const _twitterConsumerSecret = config.twitterapi.apiSecret;
const twitterCallbackUrl = config.twitterapi.callbackUrl;
var twitterAPI = require('node-twitter-api');
const consumer = new oauth.OAuth("https://api.twitter.com/oauth/request_token", "https://api.twitter.com/oauth/access_token", _twitterConsumerKey, _twitterConsumerSecret, "1.0A", twitterCallbackUrl, "HMAC-SHA1");

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
    consumer.getOAuthRequestToken(function (error, oauthToken, oauthTokenSecret, results) {
        if (error) {
            res.send(error, 500);
        } else {
            req.session.oauthRequestToken = oauthToken;
            req.session.oauthRequestTokenSecret = oauthTokenSecret;
            const redirect = {
                redirectUrl: `https://api.twitter.com/oauth/authenticate?oauth_token=${req.session.oauthRequestToken}`
            }
            res.send(redirect);
        }
    });
});

const saveAccessTokens = catchAsync(async (req, res) => {
    consumer.getOAuthAccessToken(
        req.query.oauth_token,
        req.session.oauthRequestTokenSecret,
        req.query.oauth_verifier,
        (error, oauthAccessToken, oauthAccessTokenSecret, results) => {
            if (error) {
                res.status(500).send(error)
            }
            else {
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
