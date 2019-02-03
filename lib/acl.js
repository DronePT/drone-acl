const Roles = require('./roles')
const Permissions = require('./permissions')
const RolePermission = require('./role-permission')

class ACL {
  constructor (knex, config = {}) {
    const { DB_PREFIX = 'ACL_' } = process.env

    // default configurations
    this.config = {
      db: Object.assign(
        {
          prefix: DB_PREFIX
        },
        config.db || {}
      )
    }

    this.db = knex

    this.roles = new Roles(this)
    this.permissions = new Permissions(this)
  }

  migrate () {
    return this.db.migrate.latest()
  }

  role (name) {
    return new RolePermission(name, this)
  }
}

module.exports = ACL
