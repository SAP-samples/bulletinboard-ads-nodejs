'use strict'

const ExpressServer = require('./express-server')
const PostgresAdsService = require('./postgres-ads-service')
const ReviewsClient = require('./reviews-client')
const VCAP_SERVICES = process.env.VCAP_SERVICES
const REVIEWS_HOST = process.env.REVIEWS_HOST
const REVIEWS_HOST_INTERNAL = process.env.REVIEWS_HOST_INTERNAL || REVIEWS_HOST;
let DB_CONNECTION_URI  = process.env.POSTGRES_URI

if (VCAP_SERVICES) {
    const vcapServices = JSON.parse(VCAP_SERVICES)
    DB_CONNECTION_URI = vcapServices.postgresql[0].credentials.uri
}

const server = new ExpressServer(
  new PostgresAdsService(DB_CONNECTION_URI),
  new ReviewsClient(REVIEWS_HOST_INTERNAL),
  REVIEWS_HOST
)
server.start(process.env.PORT)
