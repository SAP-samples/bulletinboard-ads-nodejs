const assert = require('assert')
const PostgresAdsService = require('../js/postgres-ads-service')
const ExpressServer = require('../js/express-server')
const request = require('supertest');

const DB_CONNECTION_URI = 'postgres://postgres@localhost:5432/postgres';
const PORT = 8080;

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

    it('should respond with the ads that were created before', async () => {
        await baseUrl.post('/api/v1/ads').send({
            'title': 'My new ad',
            'contact': 'john.doe@example.com',
            'price': 15.99,
            'currency': 'EUR',
            'category': 'New'
        }).expect(201)

        await baseUrl.post('/api/v1/ads').send({
            'title': 'Cool stuff',
            'contact': 'jane.doe@example.com',
            'price': 11.99,
            'currency': 'USD',
            'category': 'New2'
        }).expect(201)

        const result = await baseUrl.get('/api/v1/ads').expect(200)
        assert.equal(result.body[0].title, 'My new ad')
        assert.equal(result.body[0].contact, 'john.doe@example.com')
        assert.equal(result.body[0].price, 15.99)
        assert.equal(result.body[0].currency, 'EUR')
        assert.equal(result.body[0].category, 'New')

        assert.equal(result.body[1].title, 'Cool stuff')
        assert.equal(result.body[1].contact, 'jane.doe@example.com')
        assert.equal(result.body[1].price, 11.99)
        assert.equal(result.body[1].currency, 'USD')
        assert.equal(result.body[1].category, 'New2')
    })
})
