const { request: leagueRequest, authenticate, connect } = require('league-connect')
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
            console.log(data)
        })
    }

    async logEvents() {
        const credentials = await authenticate()
        this.#socket = await connect(credentials)
        this.#initializeSocket()
    } 
}

module.exports = LeagueClient