const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tweetsSchema = new Schema({
  tweetUserId:{
      type:String
  },
  tweetUser:{
    type: mongoose.Schema.Types.Mixed
  },
  tweets: {
    type: mongoose.Schema.Types.Mixed,
  },
},
{
  timestamps: true,
});


const Tweets = mongoose.model("tweet", tweetsSchema);

module.exports = Tweets;