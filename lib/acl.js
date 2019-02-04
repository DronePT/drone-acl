const path = require('path')

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
    return this.db.migrate.latest({
      directory: path.join(__dirname, '../migrations'),
      tableName: `${this.config.db.prefix}migrations`
    })
  }

  role (name) {
    return new RolePermission(name, this)
  }
}

module.exports = ACL
