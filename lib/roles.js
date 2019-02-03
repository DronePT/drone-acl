const moment = require('moment')

class Roles {
  constructor (acl) {
    this.db = acl.db
    this.config = acl.config

    this.table = `${this.config.db.prefix}roles`
    this.visibleColumns = ['id', 'name']
  }

  /**
   * remove all roles from table
   */
  clear () {
    return this.db(this.table).del()
  }

  /**
   * create new role
   * @param {string} name role name
   */
  async create (name) {
    // check if role exists
    const r = await this.findByName(name)

    if (r) return r

    const [role] = await this.db(this.table).insert(
      { name },
      this.visibleColumns
    )

    return role
  }

  /**
   * find a role by name
   * @param {string} name role name
   */
  findByName (name) {
    return this.db(this.table)
      .first(this.visibleColumns)
      .where('name', name)
      .whereNull('deleted_at')
  }

  /**
   * list all available roles
   */
  list () {
    return this.db(this.table)
      .select(this.visibleColumns)
      .whereNull('deleted_at')
  }

  /**
   * update a role data by its name
   * @param {string} name role name
   * @param {object} updateData object container data to update
   */
  async update (name, updateData = {}) {
    const [updated] = await this.db(this.table)
      .update(updateData)
      .where('name', name)
      .whereNull('deleted_at')
      .returning(this.visibleColumns)

    return updated
  }

  /**
   * delete a role by its name
   * @param {string} name role name
   */
  async delete (name) {
    return this.update(name, { deleted_at: moment() })
  }
}

module.exports = Roles
