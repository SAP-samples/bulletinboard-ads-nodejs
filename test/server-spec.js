const assert = require('assert')
const PostgresAdsService = require('../js/postgres-ads-service')
const ExpressServer = require('../js/express-server')
const request = require('supertest');

const DB_CONNECTION_URI = 'postgres://postgres@localhost:6543/postgres';
const PORT = 9090;

describe('Server', function () {
    let server
    let baseUrl

    before(async function () {
        server = new ExpressServer(new PostgresAdsService(DB_CONNECTION_URI))
        server.start(PORT)
        baseUrl = request(`http://localhost:${PORT}`)
        await baseUrl.delete('/api/v1/ads').expect(204)
    })

    after(async function () {
        server.stop()
    })

    afterEach(async function () {
        await baseUrl.delete('/api/v1/ads').expect(204)
    })
})
