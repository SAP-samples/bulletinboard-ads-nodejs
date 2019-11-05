const assert = require('assert')
const PostgresAdsService = require('../js/postgres-ads-service')
const ExpressServer = require('../js/express-server')
const request = require('supertest');

const DB_CONNECTION_URI = 'postgres://postgres@localhost:5432/postgres';
const PORT = 8080;

describe('Server', function () {
    let server
    let baseUrl

    const createAd = (title = '') => {
        return baseUrl.post('/api/v1/ads').send({
            'title': title || 'My new ad',
            'contact': 'john.doe@example.com',
            'price': 15.99,
            'currency': 'EUR',
            'category': 'New'
        }).expect(201)
    }

    before(async () => {
        server = new ExpressServer(new PostgresAdsService(DB_CONNECTION_URI))
        server.start(PORT)
        baseUrl = request(`http://localhost:${PORT}`)
        await baseUrl.delete('/api/v1/ads').expect(204)
    })

    after(async () => {
        server.stop()
    })

    afterEach(async () => {
        await baseUrl.delete('/api/v1/ads').expect(204)
    })

    it('should return the created ad with right "Location" header', async () => {
        const result = await baseUrl.post('/api/v1/ads').send({
            'title': 'My new ad',
            'contact': 'john.doe@example.com',
            'price': 15.99,
            'currency': 'EUR',
            'category': 'New'
        }).expect(201)

        assert.equal(result.body.title, 'My new ad')
        assert.equal(result.body.contact, 'john.doe@example.com')
        assert.equal(result.body.price, 15.99)
        assert.equal(result.body.currency, 'EUR')
        assert.equal(result.body.category, 'New')

        const id = result.body.id
        assert(result.header.location, `/api/v1/ads/${id}`)
        assert(result.header['content-type'], 'application/json; charset=utf-8')
    })

    it('should respond with all ads', async () => {
        await createAd()
        await createAd('Another ad')

        const result = await baseUrl.get('/api/v1/ads').expect(200)
        assert(result.body.length, 2)
        assert(result.headers['content-type'], 'application/json; charset=utf-8')

        assert.equal(result.body[0].title, 'My new ad')
        assert.equal(result.body[0].contact, 'john.doe@example.com')
        assert.equal(result.body[0].price, 15.99)
        assert.equal(result.body[0].currency, 'EUR')
        assert.equal(result.body[0].category, 'New')

        assert.equal(result.body[1].title, 'Another ad')
        assert.equal(result.body[1].contact, 'john.doe@example.com')
        assert.equal(result.body[1].price, 15.99)
        assert.equal(result.body[1].currency, 'EUR')
        assert.equal(result.body[1].category, 'New')
    })

    it('should return the ad with the given id', async () => {
        let result = await createAd()
                
        const id = result.body.id
        result = await baseUrl.get(`/api/v1/ads/${id}`).expect(200)


        assert.equal(result.body.title, 'My new ad')
        assert.equal(result.body.contact, 'john.doe@example.com')
        assert.equal(result.body.price, 15.99)
        assert.equal(result.body.currency, 'EUR')
        assert.equal(result.body.category, 'New')
    })

    it('should return 404 - NOT FOUND id ad does not exist', async () => {
        result = await baseUrl.get(`/api/v1/ads/${-1}`).expect(404)
    })

    it('should delete the ad with the given id', async () => {
        const result = await createAd()
        
        const id = result.body.id
        
        await baseUrl.delete(`/api/v1/ads/${id}`).expect(204)
        await baseUrl.get(`/api/v1/ads/${id}`).expect(404)
    })

    it('should return 404 - NOT FOUND on deletion if ad does not exist', async () => {
        result = await baseUrl.delete(`/api/v1/ads/${-1}`).expect(404)
    })
})
