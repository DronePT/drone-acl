const test = require('tape')
const knex = require('knex')

const ACL = require('../lib')
const RolePermission = require('./../lib/role-permission')

const knexConn = knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    database: 'baca',
    user: '',
    password: ''
  },
  migrations: {
    tableName: `ACL_migrations`
  }
})

const acl = new ACL(knexConn)

test('Run database migration', async t => {
  try {
    await acl.migrate()
    t.pass('Migration successfully run')
  } catch (error) {
    t.fail(error.toString())
  } finally {
    t.end()
  }
})

test('Roles', async t => {
  try {
    await acl.roles.clear()
    t.pass('clear all roles')

    const adminRole = await acl.roles.create('admin')
    t.equal(adminRole.name, 'admin', 'create admin role')

    t.assert(
      adminRole instanceof RolePermission,
      'role creation returns an instance of RolePermission'
    )

    const regularRole = await acl.roles.create('regular')
    t.equal(regularRole.name, 'regular', 'create regular role')

    const userRole = await acl.roles.create('user')
    t.equal(userRole.name, 'user', 'create user role')

    const findByName = await acl.roles.findByName('admin')
    t.equal(findByName.name, 'admin', 'find role by name')

    const updateRole = await acl.roles.update('admin', {
      name: 'administrator'
    })
    t.equal(updateRole.name, 'administrator', 'update role name')

    await acl.roles.delete('regular')
    t.assert(!(await acl.roles.findByName('regular')), 'delete role')

    const rolesList = await acl.roles.list()
    t.equal(rolesList.length, 2, 'list available roles')
    t.assert(
      Object.keys(rolesList[0]).length === 2 &&
        rolesList[0].id &&
        rolesList[0].name,
      'role object from list has only the following keys: id, name'
    )
  } catch (error) {
    t.fail(error.toString())
  } finally {
    t.end()
  }
})

test('Permissions', async t => {
  try {
    await acl.permissions.clear()
    t.pass('clear all permissions')

    const createUserPermission = await acl.permissions.create('create-users')

    t.equals(
      createUserPermission.name,
      'create-users',
      'create permission without description'
    )

    const listUserPermission = await acl.permissions.create(
      'Show users',
      'Show all system users'
    )

    t.equals(
      listUserPermission.name,
      'show-users',
      'create permission with sluggified name'
    )

    t.equals(
      listUserPermission.description,
      'Show all system users',
      'create permission with correct description'
    )

    const permissionList = await acl.permissions.list()
    t.equal(permissionList.length, 2, 'list available permissions')

    t.assert(
      Object.keys(permissionList[0]).join(',') === 'id,name,description',
      'permission object from list has only the following keys: id, name, description'
    )

    const updatePermissionName = await acl.permissions.update('show-users', {
      name: 'list users'
    })

    const updatePermissionDesc = await acl.permissions.update('list users', {
      description: 'List all system users'
    })

    t.equal(updatePermissionName.name, 'list-users', 'update permission name')
    t.equal(
      updatePermissionDesc.description,
      'List all system users',
      'update permission description'
    )
  } catch (error) {
    t.fail(error.toString())
  } finally {
    t.end()
  }
})

test('Role Permissions', async t => {
  try {
    const admin = acl.role('administrator')
    const user = acl.role('user')

    t.assert(await user.allow('list-users'), 'allow user role to list users')
    t.assert(
      await admin.allow('list-users'),
      'allow administrator role to list users'
    )

    t.assert(
      await acl.role('administrator').allow(['create-users', 'list-users']),
      'allow administrator to create and list users'
    )

    t.assert(
      !(await user.allow('list-users')),
      'not be able to allow a permission already allowed'
    )

    t.assert(
      await admin.hasPermission('create-users'),
      'administrator has permission to create users'
    )

    t.assert(
      await admin.hasPermission('list users'),
      'administrator has permission to list users'
    )

    t.assert(
      await user.hasPermission('list users'),
      'user has permission to list users'
    )

    t.assert(!(await user.can('create users')), `user cannot create users`)

    t.assert(
      await user.disallow('list-users'),
      'remove list users permission from user role'
    )

    t.assert(!(await user.can('list users')), `user cannot list users`)

    const supervisor = await acl.roles.create('supervisor')

    await supervisor.allow('create-users')

    t.assert(
      await supervisor.can('create users'),
      'supervisor can create users'
    )

    t.assert(
      (await acl.roles.create('supervisor')) instanceof RolePermission,
      'return RolePermission instance for already created role'
    )
  } catch (error) {
    t.fail(error.toString())
  } finally {
    t.end()
  }
})

test.onFinish(() => {
  acl.db.destroy()
})
