'use strict'

const pg = require('pg')

function PostgresAdsService(dbConnectionUri) {

    const pool = new pg.Pool({ 'connectionString': dbConnectionUri })
    const CREATE_SQL = `CREATE TABLE IF NOT EXISTS "advertisements" (
        "id" SERIAL PRIMARY KEY,
        "title" VARCHAR (256),
        "contact" VARCHAR (256),
        "price" NUMERIC,
        "currency" VARCHAR (256),
        "category" VARCHAR (256),
        "createdAt" TIMESTAMP,
        "modifiedAt" TIMESTAMP)`

    const tableInitialized = pool.query(CREATE_SQL)

    this.getAll = async () => {
        await tableInitialized
        const ads = await pool.query('SELECT * FROM "advertisements"')
        return ads.rows
    }

    this.createAd = async (ad) => {
        await tableInitialized
        const statement = `INSERT INTO "advertisements" 
        ("title", "contact", "price", "currency", "category", "createdAt") VALUES
        ($1, $2, $3, $4, $5, $6)`;
        const values = [ad.title, ad.contact, ad.price, ad.currency, ad.category, new Date()]
        return pool.query(statement, values)
    }

    this.deleteAll = async () => {
        await tableInitialized
        return pool.query('DELETE FROM "advertisements"')
    }

    this.stop = async function () {
        await pool.end()
    }
}

module.exports = PostgresAdsService