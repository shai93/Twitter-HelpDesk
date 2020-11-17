const Twit = require("twit");
const config = require("../config/config");
const { Autohook } = require('twitter-autohook');
const util = require('util');
const request = require('request');
const Tweets = require('../models/tweets.model');

const post = util.promisify(request.post);

module.exports = (io) => {
    const autoHook = async () => {
        try {
            const webhook = new Autohook({
                token: config.twitterapi.accessToken,
                token_secret: config.twitterapi.accessTokenSecret,
                consumer_key: config.twitterapi.apiKey,
                consumer_secret: config.twitterapi.apiSecret,
                env: 'dev',
                port: 1339
            });

            webhook.on('event', async event => {
                // Don't worry, we'll start adding something more meaningful
                // in just a moment.
                if (event.tweet_create_events) {
                    console.log('tweet ', event)
                    //save incoming tweets
                    const newTweet = new Tweets();
                    newTweet.tweetUserId = event.tweet_create_events[0].user.id;
                    newTweet.tweetUser = event.tweet_create_events[0].user;
                    newTweet.tweets = event.tweet_create_events[0].text;
                    newTweet.save(async function (err) {
                        if (err) return console.error(err);
                        const allTweets = await getAllTweets(event.tweet_create_events[0].user.id)
                        io.emit('allTweets', allTweets)
                    })
                    // await sayHi(event);
                }
            });

            // Removes existing webhooks
            await webhook.removeWebhooks();

            // Starts a server and adds a new webhook
            await webhook.start();

            // Subscribes to your own user's activity
            await webhook.subscribe({ oauth_token: config.twitterapi.accessToken, oauth_token_secret: config.twitterapi.accessTokenSecret });
        } catch (e) {
            // Display the error and quit
            console.error(e);
            process.exit(1);
        }
    }
    autoHook();

    io.on("connection", socket => {
        console.log('connection')
    });

    const getAllTweets = async (tweetUserId) => {
        const allTweets = await Tweets.find({ tweetUserId }).sort('-createdAt');
        return allTweets;
    };
};