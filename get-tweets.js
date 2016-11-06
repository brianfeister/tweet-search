// NOTE: requires node ^4.2.3

var Twitter = require('twitter');

var credentials = require('./credentials.json');

var client = new Twitter({
  consumer_key: credentials.consumer_key,
  consumer_secret: credentials.consumer_secret,
  access_token_key: credentials.access_token_key,
  access_token_secret: credentials.access_token_secret
});

var tweetTotal = 0;

var q = '#critters';

function tallyTweetsAndRetweets (tweets) {
    tweetTotal += tweets.statuses.length;
    tweets.statuses.forEach( (tweet) => {
        tweetTotal += tweet.retweet_count;
    });
}

function getTweetChunk (max_id) {
    return new Promise( (resolve, reject) => {
        client.get('search/tweets', {max_id: max_id, count: 99, q: q}, function(error, tweets, response) {
            tallyTweetsAndRetweets(tweets);
            resolve(tweets);
        });
    })
    .then( tweets => {
        if ( tweets.statuses.length > 98) {
            return getTweetChunk(tweets.statuses[tweets.statuses.length - 1].id);
        } else {
            tallyTweetsAndRetweets(tweets);
            console.log('tweetTotal:',tweetTotal);
        }
    });
}

client.get('search/tweets', {count: 99, q: q}, function(error, tweets, response) {
    tallyTweetsAndRetweets(tweets);
    getTweetChunk(tweets.statuses[tweets.statuses.length - 1].id)
});
