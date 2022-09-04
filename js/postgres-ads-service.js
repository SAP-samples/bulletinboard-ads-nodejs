import pg from 'pg'
import DBMigrate from 'db-migrate'

class PostgresAdsService {
  #pool
  #logger
  #tableInitialized

  constructor(config, logger) {
    const dbmigrate = DBMigrate.getInstance(true, { env: 'default', config: { default: { driver: 'pg', ...config } } })
    this.#logger = logger
    this.#pool = new pg.Pool(config)
    this.#tableInitialized = dbmigrate.up().then(() => {
      this.#logger.info('Database connection established')
    }).catch((error) => {
      this.#logger.error(error.stack)
      process.exit(1)
    })
  }

  async getAll() {
    await this.#tableInitialized
    const ads = await this.#pool.query('SELECT * FROM "advertisements"')
    return ads.rows
  }

  async getById(id) {
    await this.#tableInitialized
    const ads = await this.#pool.query('SELECT * FROM "advertisements" WHERE "id" = $1', [id])
    return ads.rows[0] || null
  }

  async createAd(ad) {
    await this.#tableInitialized
    const statement = `INSERT INTO "advertisements"
        ("title", "contact", "price", "currency", "category", "createdAt") VALUES
        ($1, $2, $3, $4, $5, $6) RETURNING *`
    const values = [ad.title, ad.contact, ad.price, ad.currency, ad.category, new Date()]
    const result = await this.#pool.query(statement, values)
    return result.rows[0]
  }

  async updateAd(id, ad) {
    await this.#tableInitialized
    const statement = `UPDATE "advertisements" SET
        ("title", "contact", "price", "currency", "category", "modifiedAt") =
        ($1, $2, $3, $4, $5, $6) WHERE "id" = $7 RETURNING *`
    const values = [ad.title, ad.contact, ad.price, ad.currency, ad.category, new Date(), id]
    const result = await this.#pool.query(statement, values)
    return result.rows[0]
  }

  async deleteAll() {
    await this.#tableInitialized
    return this.#pool.query('DELETE FROM "advertisements"')
  }

  async deleteById(id) {
    await this.#tableInitialized
    return this.#pool.query('DELETE FROM "advertisements" WHERE "id" = $1', [id])
  }

  async stop() {
    await this.#pool.end()
  }
}

export default PostgresAdsService
