const TwitterBotPool = require('./TwitterBotPool.js')
const botPool = new TwitterBotPool({
    tokens: require('./tokens.js'),
    tweet_reload_time: 15 * 60 * 1000,
    initial_tweet: true
})

const statuses = [
    'Someone loves you <3',
    'Someone who really likes you wanted to remind you of it :)',
    '❤ You are beloved! ❤',
    'Reminder that you are loved and never alone :)',
    'Look at the sky. Someone is looking at it and thinking of you ❤',
    'Life is beautiful magical fantastical, and so you are <3',
    'Someone wants you to know that they\'ll always be here for you'
]

function interval() {
    const mainClient = botPool.getClient(0)

    mainClient.get('direct_messages/events/list', { count: 50 }).then(result => {
        if (result.data && result.data.events && typeof result.data.events.forEach === 'function') {
            result.data.events.forEach(msg_event => {
		const message = msg_event.message_create.message_data
                var removeDirectMessage = true
                if (message.entities.user_mentions.length) {
                    removeDirectMessage = false
                    message.entities.user_mentions.forEach(mention => {
                        var tweet = botPool.tweet({ status: '@' + mention.screen_name + ' ' + statuses[Math.floor(Math.random() * statuses.length)] })
                        if ( tweet) {
                            tweet.promise.then(res => {
                                if (!res.data.entities || !res.data.entities.user_mentions.length) tweet.client.post('statuses/destroy/:id', { id: res.data.id_str })
                            })
                            removeDirectMessage = true
                        }
                    })
                }
                if (removeDirectMessage) mainClient.delete('direct_messages/events/destroy', { id: msg_event.id })
            })
        }
    })
}
interval()
setInterval(interval, 60 * 1000)
