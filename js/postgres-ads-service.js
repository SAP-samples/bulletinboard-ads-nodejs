'use strict'

const pg = require('pg')

function PostgresAdsService(dbConnectionUri) {

    const pool = new pg.Pool({ 'connectionString': dbConnectionUri })

    this.stop = async function () {
        await pool.end()
    }
}

module.exports = PostgresAdsService