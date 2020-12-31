const {handleMessage} = require('./handlers')
const client = require('./client')
const config = require('dotenv').config().parsed

client.on('ready', () => {
    console.log('Ready')
})

client.on('message', handleMessage)

client.login(config.TOKEN)