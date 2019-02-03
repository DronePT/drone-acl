const { DB_PREFIX = 'ACL_' } = process.env

exports.up = function (knex, Promise) {
  return knex.schema.createTable(`${DB_PREFIX}permissions`, table => {
    table.increments()
    table
      .string('name')
      .unique()
      .notNullable()
    table.text('description').nullable()
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable(`${DB_PREFIX}permissions`)
}
