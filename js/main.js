'use strict'

const ExpressServer = require('./express-server')
const PostgresAdsService = require('./postgres-ads-service')
const ReviewsClient = require('./reviews-client')

const VCAP_SERVICES = JSON.parse(process.env.VCAP_SERVICES)
const DB_CONNECTION_URI = VCAP_SERVICES.postgresql[0].credentials.uri
const REVIEWS_URL = process.env.REVIEWS_URL

const server = new ExpressServer(new PostgresAdsService(DB_CONNECTION_URI), new ReviewsClient(REVIEWS_URL))
server.start(process.env.PORT)
