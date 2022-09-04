exports.up = function (db) {
  return db.runSql(`CREATE TABLE IF NOT EXISTS "advertisements" (
    "id" SERIAL PRIMARY KEY,
    "title" VARCHAR (256),
    "contact" VARCHAR (256),
    "price" NUMERIC,
    "currency" VARCHAR (256),
    "category" VARCHAR (256),
    "createdAt" TIMESTAMP,
    "modifiedAt" TIMESTAMP)`
  )
}
