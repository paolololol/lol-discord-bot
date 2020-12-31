const { VoiceChannel } = require("discord.js");
const redis = require('./redis')
const logger = require('./logger')

const membersForChannel = (message) => {
    const channels = message.guild.channels.cache
    const userChannel = Object.values(Object.fromEntries(channels)).find(x => x instanceof VoiceChannel && x.members.get(message.author.id))
    if(!userChannel) {
        message.channel.send("You're not connected to any channel")
        return []
    }       
    const connectedMembers = userChannel.members 
    logger.debug(`Available members: ${connectedMembers}`)
    return connectedMembers;
}

const summonersForChannel = async (message) => {
    const connectedMembers = membersForChannel(message);
    const summonerNames = (await Promise.all(connectedMembers.map(x => redis.smembers(x.id)))).flat() || []
    logger.debug(`Will invite: ${summonerNames}`)
    return summonerNames;
}

module.exports = {
    membersForChannel,
    summonersForChannel
}