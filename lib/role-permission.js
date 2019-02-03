const isArray = require('lodash/isArray')
const isString = require('lodash/isString')
const slug = require('slug')

class RolePermission {
  constructor (role, acl) {
    if (!role) throw new Error('role is required')

    this.name = isString(role) ? role : role && role.name
    this.id = (role && role.id) || null

    this.acl = acl

    this.table = `${this.acl.config.db.prefix}roles_permissions`
  }

  async resolveRole () {
    const role = await this.acl.roles.findByName(this.name)

    if (!role) throw new Error('role not found')

    const { id, name } = role

    this.name = name
    this.id = id
  }

  /**
   * add permission to a role
   * @param {string|array} perms string or array of permission(s)
   */
  async allow (perms) {
    if (!perms) {
      throw new Error('permission or array of permissions is required')
    }

    if (!isString(perms) && !isArray(perms)) {
      throw new Error('string or array is required as permissions')
    }

    await this.resolveRole()

    const { db, permissions } = this.acl

    const list = (!isArray(perms) ? perms.split(',') : perms).map(p => slug(p))

    // select all permissions not yet inserted
    const missingPermissions = (await db(permissions.table)
      .select(`${permissions.table}.id`)
      .whereIn(`${permissions.table}.name`, list)
      .whereNotIn(
        `${permissions.table}.id`,
        db(this.table)
          .select(`${this.table}.permissions_id`)
          .where(`${this.table}.roles_id`, this.id)
      )).map(({ id }) => ({ roles_id: this.id, permissions_id: id }))

    // insert remaining permissions
    if (missingPermissions.length) {
      return (await db(this.table).insert(missingPermissions)).rowCount
    }

    return 0
  }

  /**
   * remove permission(s) from a role
   * @param {string|array} perms string or array of permission(s)
   */
  async disallow (perms) {
    if (!perms) {
      throw new Error('permission or array of permissions is required')
    }

    if (!isString(perms) && !isArray(perms)) {
      throw new Error('string or array is required as permissions')
    }

    await this.resolveRole()

    const { db, permissions } = this.acl

    const list = (!isArray(perms) ? perms.split(',') : perms).map(p => slug(p))

    // select all permissions not yet inserted
    return db(this.table)
      .where('roles_id', this.id)
      .whereIn(
        'permissions_id',
        db(permissions.table)
          .select(`${permissions.table}.id`)
          .whereIn(`${permissions.table}.name`, list)
      )
      .del()
  }

  /**
   * check if the role has permission
   * @param {string} permission permission name
   */
  async hasPermission (permission) {
    const rolesTable = this.acl.roles.table
    const permissionsTable = this.acl.permissions.table

    const permissionName = slug(permission)

    const [{ total }] = await this.acl
      .db(this.table)
      .count(`${this.table}.id as total`)
      .join(rolesTable, `${rolesTable}.id`, `${this.table}.roles_id`)
      .join(
        permissionsTable,
        `${permissionsTable}.id`,
        `${this.table}.permissions_id`
      )
      .where(`${rolesTable}.name`, this.name)
      .where(`${permissionsTable}.name`, permissionName)

    return total && parseInt(total) > 0
  }

  /**
   * alias of hasPermission()
   * @param {string} permission permission name
   */
  can (permission) {
    return this.hasPermission(permission)
  }
}

module.exports = RolePermission
