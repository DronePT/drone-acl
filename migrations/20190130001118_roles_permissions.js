const { DB_PREFIX = 'ACL_' } = process.env

exports.up = function (knex, Promise) {
  return knex.schema.createTable(`${DB_PREFIX}roles_permissions`, table => {
    table.increments()

    table.integer('roles_id').unsigned()
    table.integer('permissions_id').unsigned()

    table
      .foreign('roles_id')
      .references(`${DB_PREFIX}roles.id`)
      .onDelete('CASCADE')
    table
      .foreign('permissions_id')
      .references(`${DB_PREFIX}permissions.id`)
      .onDelete('CASCADE')

    table.unique(['roles_id', 'permissions_id'])
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable(`${DB_PREFIX}roles_permissions`)
}
