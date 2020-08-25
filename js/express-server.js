'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const logger = require('./logger')

const CREATED = 201
const NO_CONTENT = 204
const BAD_REQUEST = 400
const NOT_FOUND = 404

function ExpressServer(adsService, reviewsClient, reviewsHost, defaultLogger) {

    let httpServer
    const app = express()
    app.use(bodyParser.json())

    app.use(express.static('ui'))

    const addTransientProperties = async (ad, requestLogger) => {
        ad.reviewsUrl = `${reviewsHost}/#/reviews/${ad.contact}`
        let averageContactRating = await reviewsClient.getAverageRating(ad.contact)
        if (!averageContactRating) {
            averageContactRating = 0
            requestLogger.info('User does not have a rating yet, defaulting to 0 (=untrusted)')
        }
        ad.averageContactRating = averageContactRating
    }

    app.get('/api/v1/ads', wrap(async (req, res, next, requestLogger) => {
        const ads = await adsService.getAll()
        for (let i = 0; i < ads.length; i++) {
            await addTransientProperties(ads[i], requestLogger)
        }
        res.send({ 'value': ads })
    }))

    app.get('/api/v1/ads/:id', wrap(async (req, res, next, requestLogger) => {
        const id = req.params.id
        const ad = await adsService.getById(id)
        if (ad) {
            await addTransientProperties(ad, requestLogger)
            return res.send(ad)
        }
        return res.status(NOT_FOUND).end()
    }))

    app.post('/api/v1/ads', wrap(async (req, res, next, requestLogger) => {
        const ad = req.body
        if (ad.title && ad.contact && ad.price && ad.currency) {
            const savedAd = await adsService.createAd(ad)
            await addTransientProperties(savedAd, requestLogger)
            return res.status(CREATED).header('location', `/api/v1/ads/${savedAd.id}`).send(savedAd)
        }
        return res.status(BAD_REQUEST).end()
    }))

    app.put('/api/v1/ads/:id', wrap(async (req, res, next, requestLogger) => {
        const id = req.params.id
        const updateValues = req.body
        if (updateValues.title && updateValues.contact && updateValues.price && updateValues.currency) {
            const ad = await adsService.getById(id)
            if (ad) {
                const updatedAd = await adsService.updateAd(id, req.body)
                await addTransientProperties(updatedAd, requestLogger)
                return res.send(updatedAd)
            }
            return res.status(NOT_FOUND).end()
        }
        return res.status(BAD_REQUEST).end()
    }))

    app.delete('/api/v1/ads', wrap(async (req, res) => {
        await adsService.deleteAll()
        res.status(NO_CONTENT).end()
    }))

    app.delete('/api/v1/ads/:id', wrap(async (req, res) => {
        const id = req.params.id
        const ad = await adsService.getById(id)
        if (ad) {
            await adsService.deleteById(id)
            return res.status(NO_CONTENT).end()
        }
        return res.status(NOT_FOUND).end()
    }))

    this.start = (port) => {
        httpServer = app.listen(port).on('error', function (error) {
            defaultLogger.error(error.stack)
            process.exit(2)
        })
        defaultLogger.info(`Server started on port ${port}`)
    }

    this.stop = async () => {
        await adsService.stop()
        httpServer.close()
    }
}

//wraps the middleware with a try catch and injects a logger as additional argument
const wrap = (wrappedMiddleware) => {
    return async (req, res, next) => {
		const requestLogger = logger.create()
        try {
            await wrappedMiddleware(req, res, next, requestLogger)
        } catch (error) {
            requestLogger.error(error.stack)
            if (res.headersSent) {
                next(error)
            } else {
                res.status(INTERNAL_SERVER_ERROR).send('INTERNAL_SERVER_ERROR')
            }
        }
    }
}

module.exports = ExpressServer
