'use strict'

const express = require('express')
const bodyParser = require('body-parser')

const CREATED = 201
const NO_CONTENT = 204
const BAD_REQUEST = 400
const NOT_FOUND = 404

function ExpressServer(adsService, reviewsClient, reviewsHost) {

    let httpServer
    const app = express()
    app.use(bodyParser.json())

    app.use(express.static('ui'))

    const addReviewsUrl = (ad) => {
        ad.reviewsUrl = `${reviewsHost}/#/reviews/${ad.contact}`;
    }

    app.get('/api/v1/ads', tryCatch(async (req, res) => {
        const ads = await adsService.getAll()
        for (let i = 0; i < ads.length; i++) {
            addReviewsUrl(ads[i])
            ads[i].averageRating = await reviewsClient.getAverageRating(ads[i].contact)
        }
        res.send({'value': ads})
    }))

    app.get('/api/v1/ads/:id', tryCatch(async (req, res) => {
        const id = req.params.id
        const ad = await adsService.getById(id)
        if (ad) {
            addReviewsUrl(ad)
            ad.averageRating = await reviewsClient.getAverageRating(ad.contact)
            return res.send(ad)
        }
        return res.status(NOT_FOUND).end()
    }))

    app.post('/api/v1/ads', tryCatch(async (req, res) => {
        const ad = req.body;
        if (ad.title && ad.contact && ad.price && ad.currency) {
            const savedAd = await adsService.createAd(ad)
            addReviewsUrl(savedAd)
            savedAd.averageRating = await reviewsClient.getAverageRating(savedAd.contact)
            return res.status(CREATED).header('location', `/api/v1/ads/${savedAd.id}`).send(savedAd)
        }
        return res.status(BAD_REQUEST).end()
    }))

    app.put('/api/v1/ads/:id', tryCatch(async (req, res) => {
        const id = req.params.id
        const updateValues = req.body
        if (updateValues.title && updateValues.contact && updateValues.price && updateValues.currency) {
            const ad = await adsService.getById(id)
            if (ad) {
                const updatedAd = await adsService.updateAd(id, req.body)
                addReviewsUrl(updatedAd)
                updatedAd.averageRating = await reviewsClient.getAverageRating(updatedAd.contact)
                return res.send(updatedAd)
            }
            return res.status(NOT_FOUND).end()
        }
        return res.status(BAD_REQUEST).end()
    }))

    app.delete('/api/v1/ads', tryCatch(async (req, res) => {
        await adsService.deleteAll()
        res.status(NO_CONTENT).end()
    }))

    app.delete('/api/v1/ads/:id', tryCatch(async (req, res) => {
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
            console.error(`Failed to start server at port ${port}, port might be in use.`)
            console.error(error.stack)
            process.exit(2)
        })
        console.log(`Server started on port ${port}`)
    }

    this.stop = async () => {
        await adsService.stop()
        httpServer.close()
    }
}

const tryCatch = (wrappedMiddleware) => {
    return async (req, res, next) => {
        try {
            await wrappedMiddleware(req, res, next)
        } catch (error) {
            console.error(error.stack)
            if (res.headersSent) {
                next(error)
            } else {
                res.status(INTERNAL_SERVER_ERROR).send('INTERNAL_SERVER_ERROR')
            }
        }
    }
}

module.exports = ExpressServer