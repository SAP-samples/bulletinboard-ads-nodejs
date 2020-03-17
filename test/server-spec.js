const assert = require('assert')
const PostgresAdsService = require('../js/postgres-ads-service')
const ExpressServer = require('../js/express-server')
const request = require('supertest')

const DB_CONNECTION_URI = 'postgres://postgres@localhost:5432/testdb'
const PORT = 8081
const REVIEWS_URL = 'http://localhost:9090'

describe('Server', function () {
    let server
    let db
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
        const reviewsClientMock = {
            getAverageRating: async () => 4.5
        }
        db = new PostgresAdsService(DB_CONNECTION_URI)
        server = new ExpressServer(db, reviewsClientMock, REVIEWS_URL)
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
        assert.equal(result.body.reviewsUrl, `${REVIEWS_URL}/#/reviews/john.doe@example.com`)
        assert.equal(result.body.averageRating, 4.5)
        assert(result.body.createdAt)
        assert(!result.body.modifiedAt)

        const id = result.body.id
        assert(result.header.location, `/api/v1/ads/${id}`)
        assert(result.header['content-type'], 'application/json; charset=utf-8')
    })

    it('should respond with all ads', async () => {
        await createAd()
        await createAd('Another ad')

        const result = await baseUrl.get('/api/v1/ads').expect(200)
        assert(result.body.value.length, 2)
        assert(result.headers['content-type'], 'application/json; charset=utf-8')

        assert.equal(result.body.value[0].title, 'My new ad')
        assert.equal(result.body.value[0].contact, 'john.doe@example.com')
        assert.equal(result.body.value[0].price, 15.99)
        assert.equal(result.body.value[0].currency, 'EUR')
        assert.equal(result.body.value[0].category, 'New')
        assert.equal(result.body.value[0].reviewsUrl, `${REVIEWS_URL}/#/reviews/john.doe@example.com`)
        assert.equal(result.body.value[0].averageRating, 4.5)

        assert.equal(result.body.value[1].title, 'Another ad')
        assert.equal(result.body.value[1].contact, 'john.doe@example.com')
        assert.equal(result.body.value[1].price, 15.99)
        assert.equal(result.body.value[1].currency, 'EUR')
        assert.equal(result.body.value[1].category, 'New')
        assert.equal(result.body.value[0].reviewsUrl, `${REVIEWS_URL}/#/reviews/john.doe@example.com`)
        assert.equal(result.body.value[1].averageRating, 4.5)
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
        assert.equal(result.body.reviewsUrl, `${REVIEWS_URL}/#/reviews/john.doe@example.com`)
        assert.equal(result.body.averageRating, 4.5)
    })

    it('should return 404 - NOT FOUND id ad does not exist', async () => {
        await baseUrl.get(`/api/v1/ads/${-1}`).expect(404)
    })

    it('should return 400 - BAD REQUEST on invalid input', async () => {
        await baseUrl.post('/api/v1/ads').send({
            'title': '',
            'contact': 'john.doe@example.com',
            'price': 15.99,
            'currency': 'EUR',
            'category': 'New'
        }).expect(400)

        await baseUrl.post('/api/v1/ads').send({
            'title': 'My new ad',
            'contact': '',
            'price': 15.99,
            'currency': 'EUR',
            'category': 'New'
        }).expect(400)

        await baseUrl.post('/api/v1/ads').send({
            'title': 'My new ad',
            'contact': 'john.doe@example.com',
            'price': null,
            'currency': 'EUR',
            'category': 'New'
        }).expect(400)

        await baseUrl.post('/api/v1/ads').send({
            'title': 'My new ad',
            'contact': 'john.doe@example.com',
            'price': 15.99,
            'currency': '',
            'category': 'New'
        }).expect(400)

        const entriesInDb = await db.getAll()
        assert.equal(entriesInDb.length, 0)
    })

    it('should update the ad with the given id', async () => {
        let result = await createAd()
        const id = result.body.id

        result = await baseUrl.put(`/api/v1/ads/${id}`).send({
            'title': 'Updated ad',
            'contact': 'updated.doe@example.com',
            'price': 11.99,
            'currency': 'USD',
            'category': 'Newer'
        }).expect(200)

        assert.equal(result.body.title, 'Updated ad')
        assert.equal(result.body.contact, 'updated.doe@example.com')
        assert.equal(result.body.price, 11.99)
        assert.equal(result.body.currency, 'USD')
        assert.equal(result.body.category, 'Newer')
        assert.equal(result.body.reviewsUrl, `${REVIEWS_URL}/#/reviews/updated.doe@example.com`)
        assert.equal(result.body.averageRating, 4.5)
        assert(result.body.modifiedAt)
    })

    it('should return 404 - NOT FOUND on update if ad does not exist', async () => {
        await baseUrl.put(`/api/v1/ads/${-1}`).send({
            'title': 'My updated ad',
            'contact': 'updated.doe@example.com',
            'price': 11.99,
            'currency': 'USD',
            'category': 'Newer'
        }).expect(404)
    })

    it('should return 400 - BAD REQUEST on invalid input', async () => {
        let result = await createAd()
        const id = result.body.id

        await baseUrl.put(`/api/v1/ads/${id}`).send({
            'title': '',
            'contact': 'updated.doe@example.com',
            'price': 11.99,
            'currency': 'USD',
            'category': 'Newer'
        }).expect(400)

        await baseUrl.put(`/api/v1/ads/${id}`).send({
            'title': 'Updated ad',
            'contact': '',
            'price': 11.99,
            'currency': 'USD',
            'category': 'Newer'
        }).expect(400)

        await baseUrl.put(`/api/v1/ads/${id}`).send({
            'title': 'Updated ad',
            'contact': 'updated.doe@example.com',
            'price': null,
            'currency': 'USD',
            'category': 'Newer'
        }).expect(400)

        await baseUrl.put(`/api/v1/ads/${id}`).send({
            'title': 'Updated ad',
            'contact': 'updated.doe@example.com',
            'price': 11.99,
            'currency': '',
            'category': 'Newer'
        }).expect(400)

        const entryInDb = await db.getById(id)
        assert.equal(entryInDb.title, 'My new ad')
        assert.equal(entryInDb.contact, 'john.doe@example.com')
        assert.equal(entryInDb.price, 15.99)
        assert.equal(entryInDb.currency, 'EUR')
        assert.equal(entryInDb.category, 'New')
    })

    it('should delete the ad with the given id', async () => {
        const result = await createAd()
        const id = result.body.id
        
        await baseUrl.delete(`/api/v1/ads/${id}`).expect(204)
        await baseUrl.get(`/api/v1/ads/${id}`).expect(404)
    })

    it('should return 404 - NOT FOUND on deletion if ad does not exist', async () => {
        await baseUrl.delete(`/api/v1/ads/${-1}`).expect(404)
    })
})
