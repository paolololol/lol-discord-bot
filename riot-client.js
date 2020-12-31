const axios = require('axios')
const config = require('dotenv').config().parsed

class RiotClient {
    #client = null;

    constructor() {
        if (RiotClient._instance) {
            return RiotClient._instance
        }
        RiotClient._instance = this

        this.#client = axios.create({
            baseURL: 'https://euw1.api.riotgames.com/',
            headers: {
                'X-Riot-Token': config.RGAPI
            }
        })
    }

    async getSummoner(summonerName) {
       return this.#client.get(`/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`);
    }
}

module.exports = RiotClient 