const { DB_PREFIX = 'ACL_' } = process.env

exports.up = function (knex, Promise) {
  return knex.schema.createTable(`${DB_PREFIX}roles`, table => {
    table.increments()

    table.string('name').notNullable()

    table
      .timestamp('created_at')
      .notNullable()
      .defaultTo(knex.raw('now()'))

    table.timestamp('deleted_at').nullable()
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable(`${DB_PREFIX}roles`)
}
