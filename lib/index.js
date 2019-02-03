const knex = require('knex')

const Roles = require('./roles')
const Permissions = require('./permissions')
const RolePermission = require('./role-permission')

class ACL {
  constructor (config) {
    const {
      DB_HOST,
      DB_DATABASE,
      DB_USERNAME,
      DB_PASSWORD,
      DB_PREFIX = 'ACL_'
    } = process.env

    // default configurations
    this.config = {
      db: {
        client: 'pg',
        prefix: DB_PREFIX,
        host: DB_HOST || '',
        database: DB_DATABASE || '',
        username: DB_USERNAME || '',
        password: DB_PASSWORD || ''
      }
    }

    this._createDatabaseConnection(config)

    this.roles = new Roles(this)
    this.permissions = new Permissions(this)
  }

  _createDatabaseConnection (config) {
    this.config.db = Object.assign({}, this.config.db, config.db)

    const {
      client,
      prefix,
      host,
      database,
      username: user,
      password
    } = this.config.db

    this.db = knex({
      client,
      connection: {
        host,
        user,
        password,
        database
      },
      migrations: {
        tableName: `${prefix}migrations`
      }
    })
  }

  migrate () {
    return this.db.migrate.latest()
  }

  role (name) {
    return new RolePermission(name, this)
  }
}

module.exports = ACL
