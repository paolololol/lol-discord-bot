const { MessageManager } = require('discord.js');
const commands = require('./commands')

const handleMessage = (message) => {
    if(!message.content.startsWith('!lol')) return;
    const command = message.content.split('!lol ', 2)[1]
    const [opcode, ...args] = command.split(' ')
    const handler = commands.get(opcode)
    if(!handler) {
        message.channel.send("Unknown command :(")
    } else {
        handler.call(handler, ...[message, ...args])
    }
}

module.exports = {
    handleMessage
}