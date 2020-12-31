const redis = require('./redis')
const logger = require('./logger')
const LeagueClient = require('./league-client')
const { summonersForChannel } = require('./helpers')

const commands = new Map();

commands.set('register', async (message, ...name) => {
    const league = new LeagueClient()
    const spacedName = name.join(' ')
    logger.info(`${message.author.username} - ${message.author.id} is registering the summoner name ${spacedName}`)

    const summoner = await league.getSummonerId(spacedName)
    if (!summoner.summonerId) {
        message.channel.send(`${spacedName} was not found :(`)
        return
    }

    await redis.sadd(message.author.id, summoner.summonerId)
    message.channel.send(`Added summoner name ${spacedName} to ${message.author.username} - Id: ${summoner.summonerId}`)
})

commands.set('spam', async (message, ...name) => {
    const league = new LeagueClient()
    const spacedName = name.join(' ')
    const summoner = await league.getSummonerId(spacedName)

    if (!summoner.summonerId) {
        message.channel.send("The target is not in our radar :(")
    } else {
        try {
            const interval = setInterval(async () => {
                await league.createLobby('botIntro')
                await league.invite(summoner.summonerId)
                await league.leaveLobby()
            }, 1000);
            setTimeout(() => {
                clearInterval(interval)
            }, 20000)
        } catch (e) {
            console.log(e)
            // Who cares?
        }
    }
})

commands.set('play', async (message, type) => {
    const league = new LeagueClient()
    const toInvite = await summonersForChannel(message)

    try {
        await league.createLobby(type)
        toInvite.map(player => league.invite(player))
    } catch (e) {
        message.channel.send(e.message)
    }
})

module.exports = commands