const ACL = require('./lib/index')
const knex = require('knex')

;(async function () {
  try {
    const knexConn = knex({
      client: 'pg',
      connection: {
        host: '127.0.0.1',
        database: 'database_name',
        user: '',
        password: ''
      },
      migrations: {
        tableName: 'ACL_migrations'
      }
    })

    const acl = new ACL(knexConn)

    // run required database migrations
    await acl.migrate()

    // create a permission
    await acl.permissions.create('view-users', 'Permission to view users')

    // create a role
    const admin = await acl.roles.create('administrator')

    // if role is already created you can use:
    // const admin = acl.role('administrator');

    // assign permissions to a role
    await admin.allow('view-users')

    const canViewUsers = await admin.can('view-users')

    console.log(canViewUsers)
  } catch (error) {
    console.log(error)
  }
})()
