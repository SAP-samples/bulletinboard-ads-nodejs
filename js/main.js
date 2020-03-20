'use strict'

const ExpressServer = require('./express-server')
const PostgresAdsService = require('./postgres-ads-service')
const ReviewsClient = require('./reviews-client')
const VCAP_SERVICES = process.env.VCAP_SERVICES
const REVIEWS_HOST = process.env.REVIEWS_HOST || 'http://localhost:9090'
const REVIEWS_HOST_INTERNAL = process.env.REVIEWS_HOST_INTERNAL || REVIEWS_HOST;
const DB_CONNECTION_URI  = process.env.POSTGRES_URI || 'postgres://postgres@localhost:5432/postgres'
const PORT_DEFAULT = 8080
let dbConnectionUriVCAP

if (VCAP_SERVICES) {
    const vcapServices = JSON.parse(VCAP_SERVICES)
    dbConnectionUriVCAP = vcapServices.postgresql[0].credentials.uri
}

const server = new ExpressServer(
  new PostgresAdsService(dbConnectionUriVCAP ||  DB_CONNECTION_URI),
  new ReviewsClient(REVIEWS_HOST_INTERNAL),
  REVIEWS_HOST
)
server.start(process.env.PORT || PORT_DEFAULT)
