const { request: leagueRequest, authenticate, connect } = require('league-connect')
const { GAME_TYPES } = require('./constants');
const logger = require('./logger');

class LeagueClient {
    constructor() {
        if (LeagueClient._instance) {
            return LeagueClient._instance
        }
        LeagueClient._instance = this
    }
    #isAuthenticated = false;
    #credentials = null
    #socket = null

    #initializeSocket() {
        this.#socket.on('message', (data) => {
            try {
                const [_, __, parsed] = JSON.parse(data)
                if (parsed.data.body === 'joined_room') {
                    this.leaveLobby().then(() => logger.debug("Left the lobby")).catch(e => logger.warn(e))
                }
            } catch (e) {
                // Unknown message format
            }
        })
    }

    async request(options) {
        if (!this.#isAuthenticated) {
            this.#credentials = await authenticate()
            this.#socket = await connect(this.#credentials)
            this.#initializeSocket()
        }
        return leagueRequest(options, this.#credentials)
    }

    async createLobby(gameType) {
        const queueId = GAME_TYPES[gameType]
        if (!queueId) {
            logger.warn(`Invalid game type: ${gameType}`)
            throw new Error("No such game type")
        }
        return this.request({
            method: 'POST',
            url: '/lol-lobby/v2/lobby',
            body: {
                queueId
            }
        })
    }

    leaveLobby() {
        return this.request({
            method: 'DELETE',
            url: '/lol-lobby/v2/lobby',
        })
    }

    async getSummonerId(summonerName) {
        const summoner = await this.request({
            method: "GET",
            url: `/lol-summoner/v1/summoners?name=${encodeURIComponent(summonerName)}`
        })

        let chunks = []
        for await (const chunk of summoner.body) {
            chunks.push(chunk)
        }
        const data = JSON.parse(Buffer.concat(chunks).toString('utf8'))
        return data;
    }

    async invite(summonerId) {
        return this.request({
            method: 'POST',
            url: '/lol-lobby/v2/lobby/invitations',
            body: [{
                toSummonerId: summonerId
            }]
        })
    }
}

module.exports = LeagueClient