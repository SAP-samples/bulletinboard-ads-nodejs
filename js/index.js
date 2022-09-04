import ExpressServer from './express-server.js'
import PostgresAdsService from './postgres-ads-service.js'
import ReviewsClient from './reviews-client.js'
import logger from './logger.js'

const REVIEWS_HOST_DEFAULT = 'http://localhost:9090'
const PORT_DEFAULT = 8080

// REVISE if the separation HOST/HOST_INTERNAL is only for local development in K8s context, maybe s.th. like "kubernetes.docker.internal" could help (is already mapped to 127.0.0.1 in /etc/hosts)
const REVIEWS_HOST = process.env.REVIEWS_HOST || REVIEWS_HOST_DEFAULT
const REVIEWS_HOST_INTERNAL = process.env.REVIEWS_HOST_INTERNAL || REVIEWS_HOST

const DB_CFG_DEFAULT = { connectionString: 'postgres://postgres@localhost:6543/postgres' }
const cfEnvFlat = Object.entries(JSON.parse(process.env.VCAP_SERVICES || '{}')).map(e => e[1]).flat()
const cfCred = (cfEnvFlat.find(e => e.name === 'postgres-bulletinboard-ads') || { credentials: null }).credentials
const dbCfgCf = cfCred ? { connectionString: cfCred.uri, ssl: { cert: cfCred.sslcert, ca: cfCred.sslrootcert } } : null
const dbCfgK8s = process.env.POSTGRES_URI ? { connectionString: process.env.POSTGRES_URI } : null
const dbCfg = dbCfgCf || dbCfgK8s || DB_CFG_DEFAULT

const defaultLogger = logger.create()
const adsService = new PostgresAdsService(dbCfg, defaultLogger)
const reviewsClient = new ReviewsClient(REVIEWS_HOST_INTERNAL)

const server = new ExpressServer(adsService, reviewsClient, REVIEWS_HOST, defaultLogger)

const port = process.env.PORT || PORT_DEFAULT
server.start(port)
