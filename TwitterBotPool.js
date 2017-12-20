const Twit = require('twit')

class TwitterBotPool {
    constructor(options) {
        this.options = options

        if (!this.options.tokens || !this.options.tokens.length) {
            throw new Error('No clients defined!')
        }

        const defaults = {
            tweet_reload_time: 15 * 60 * 1000,
            initial_tweet: false
        }
        for (var key in defaults) {
            if (!this.options[key]) this.options[key] = defaults[key]
        }

        this.accounts = []
        this.options.tokens.forEach(tokens => {
            this.accounts.push({
                client: new Twit({
                    consumer_key: tokens[0],
                    consumer_secret: tokens[1],
                    access_token: tokens[2],
                    access_token_secret: tokens[3]
                }),
                next_tweet_available: new Date().getTime() + this.options.initial_tweet ? 0 : this.options.tweet_reload_time
            })
        })
    }

    getClient(n) {
        if (typeof this.accounts[n] === 'undefined') return false
        return this.accounts[n].client
    }

    tweet(options) {
        var returnVal = false
        for (var acc of this.accounts) {
            if (acc.next_tweet_available <= new Date().getTime()) {
                acc.next_tweet_available = new Date().getTime() + this.options.tweet_reload_time
                returnVal = {
                    client: acc.client,
                    promise: acc.client.post('statuses/update', options)
                }
                break
            }
        }
        return returnVal
    }
}

module.exports = TwitterBotPool