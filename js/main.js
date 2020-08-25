'use strict'

const ExpressServer = require('./express-server')
const PostgresAdsService = require('./postgres-ads-service')
const ReviewsClient = require('./reviews-client')
const logger = require('./logger')

const REVIEWS_HOST_DEFAULT = 'http://localhost:9090'
const DB_CONNECTION_URI_DEFAULT = 'postgres://postgres@localhost:5432/postgres'
const PORT_DEFAULT = 8080

//REVISE if the separation HOST/HOST_INTERNAL is only for local development in K8s context, maybe s.th. like "kubernetes.docker.internal" could help (is already mapped to 127.0.0.1 in /etc/hosts)
const REVIEWS_HOST = process.env.REVIEWS_HOST || REVIEWS_HOST_DEFAULT
const REVIEWS_HOST_INTERNAL = process.env.REVIEWS_HOST_INTERNAL || REVIEWS_HOST

const dbUriCf = process.env.VCAP_SERVICES ? JSON.parse(process.env.VCAP_SERVICES).postgresql[0].credentials.uri : undefined
const dbUriK8s = process.env.POSTGRES_URI
const dbConnectionUri = dbUriCf || dbUriK8s || DB_CONNECTION_URI_DEFAULT

const defaultLogger = logger.create()
const adsService = new PostgresAdsService(dbConnectionUri, defaultLogger)
const reviewsClient = new ReviewsClient(REVIEWS_HOST_INTERNAL)

const server = new ExpressServer(adsService, reviewsClient, REVIEWS_HOST, defaultLogger)

const port = process.env.PORT || PORT_DEFAULT
server.start(port)
