const isArray = require('lodash/isArray')
const isString = require('lodash/isString')
const slug = require('slug')

class RolePermission {
  constructor (role, acl) {
    this.roleName = role
    this.acl = acl

    this.table = `${this.acl.config.db.prefix}roles_permissions`
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

    const { db, roles, permissions } = this.acl

    const role = await roles.findByName(this.roleName)

    if (!role) {
      throw new Error('role not found')
    }

    const { id: roleId } = role

    const list = (!isArray(perms) ? perms.split(',') : perms).map(p => slug(p))

    // select all permissions not yet inserted
    const missingPermissions = (await db(permissions.table)
      .select(`${permissions.table}.id`)
      .whereIn(`${permissions.table}.name`, list)
      .whereNotIn(
        `${permissions.table}.id`,
        db(this.table)
          .select(`${this.table}.permissions_id`)
          .where(`${this.table}.roles_id`, roleId)
      )).map(({ id }) => ({ roles_id: roleId, permissions_id: id }))

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

    const { db, roles, permissions } = this.acl

    const role = await roles.findByName(this.roleName)

    if (!role) {
      throw new Error('role not found')
    }

    const { id: roleId } = role

    const list = (!isArray(perms) ? perms.split(',') : perms).map(p => slug(p))

    // select all permissions not yet inserted
    return db(this.table)
      .where('roles_id', roleId)
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
      .where(`${rolesTable}.name`, this.roleName)
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
