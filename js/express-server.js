import express from 'express'
import logger from './logger.js'

const CREATED = 201
const NO_CONTENT = 204
const BAD_REQUEST = 400
const NOT_FOUND = 404
const INTERNAL_SERVER_ERROR = 500

class ExpressServer {
    #app
    #httpServer
    #adsService
    #reviewsClient
    #reviewsHost
    #logger

    constructor(adsService, reviewsClient, reviewsHost, logger) {
        this.#adsService = adsService
        this.#reviewsClient = reviewsClient
        this.#reviewsHost = reviewsHost
        this.#logger = logger
        this.#app = express()
        this.#setupRoutesAndMiddlwares()
    }


    start(port) {
        //REVISE are we listening too early - what if the DB is not yet connected?
        this.#httpServer = this.#app.listen(port).on('error', (error) => {
            this.#logger.error(error.stack)
            process.exit(2)
        })
		this.#logger.info(`Server started on port ${port}`)
    }

    async stop() {
        await this.#adsService.stop()
        return this.#httpServer.close()
    }

    #setupRoutesAndMiddlwares() {
        this.#app.use(express.json())
        this.#app.use(express.static('ui'))
        this.#app.get('/api/v1/ads', wrap(async (req, res, next, logger) => {
            const ads = await this.#adsService.getAll()
            for (let i = 0; i < ads.length; i++) {
                await this.#addTransientProperties(ads[i], logger)
            }
            res.send({ 'value': ads })
        }))
    
        this.#app.get('/api/v1/ads/:id', wrap(async (req, res, next, logger) => {
            const id = req.params.id
            const ad = await this.#adsService.getById(id)
            if (ad) {
                await this.#addTransientProperties(ad, logger)
                return res.send(ad)
            }
            return res.status(NOT_FOUND).end()
        }))
    
        this.#app.post('/api/v1/ads', wrap(async (req, res, next, logger) => {
            const ad = req.body
            if (ad.title && ad.contact && ad.price && ad.currency) {
                const savedAd = await this.#adsService.createAd(ad)
                await this.#addTransientProperties(savedAd, logger)
                return res.status(CREATED).header('location', `/api/v1/ads/${savedAd.id}`).send(savedAd)
            }
            return res.status(BAD_REQUEST).end()
        }))
    
        this.#app.put('/api/v1/ads/:id', wrap(async (req, res, next, logger) => {
            const id = req.params.id
            const updateValues = req.body
            if (updateValues.title && updateValues.contact && updateValues.price && updateValues.currency) {
                const ad = await this.#adsService.getById(id)
                if (ad) {
                    const updatedAd = await this.#adsService.updateAd(id, req.body)
                    await this.#addTransientProperties(updatedAd, logger)
                    return res.send(updatedAd)
                }
                return res.status(NOT_FOUND).end()
            }
            return res.status(BAD_REQUEST).end()
        }))
    
        this.#app.delete('/api/v1/ads', wrap(async (req, res) => {
            await this.#adsService.deleteAll()
            res.status(NO_CONTENT).end()
        }))
    
        this.#app.delete('/api/v1/ads/:id', wrap(async (req, res) => {
            const id = req.params.id
            const ad = await this.#adsService.getById(id)
            if (ad) {
                await this.#adsService.deleteById(id)
                return res.status(NO_CONTENT).end()
            }
            return res.status(NOT_FOUND).end()
        }))
    }

    async #addTransientProperties(ad, logger) {
        ad.reviewsUrl = `${this.#reviewsHost}/#/reviews/${ad.contact}`
        let averageContactRating = await this.#reviewsClient.getAverageRating(ad.contact)
        if (!averageContactRating) {
            averageContactRating = 0
            logger.info('User does not have a rating yet, defaulting to 0 (=untrusted)')
        }
        ad.averageContactRating = averageContactRating
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

export default ExpressServer
