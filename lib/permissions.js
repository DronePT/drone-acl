const slug = require('slug')

slug.defaults.mode = 'rfc3986'

class Permissions {
  constructor (acl) {
    this.db = acl.db
    this.config = acl.config

    this.table = `${this.config.db.prefix}permissions`
    this.visibleColumns = ['id', 'name', 'description']
  }

  /**
   * remove all permissions from table
   */
  clear () {
    return this.db(this.table).del()
  }

  /**
   * create new permission
   * @param {string} name permission name
   * @param {string} [description] permission description (optional)
   */
  async create (name, description = '') {
    // check if permission exists
    const p = await this.findByName(name)

    if (p) return p

    const [permission] = await this.db(this.table).insert(
      { name: slug(name), description },
      this.visibleColumns
    )

    return permission
  }

  /**
   * find a permission by name
   * @param {string} name permission name
   */
  findByName (name) {
    return this.db(this.table)
      .first(this.visibleColumns)
      .where('name', slug(name))
  }

  /**
   * list all available permissions
   */
  list () {
    return this.db(this.table).select(this.visibleColumns)
  }

  /**
   * update a permission data by its name
   * @param {string} name permission name
   * @param {object} updateData object containing data to update
   */
  async update (name, updateData = {}) {
    // we need to sluggify the name if there is a new one to update
    if (updateData.name) updateData.name = slug(updateData.name)

    const [updated] = await this.db(this.table)
      .update(updateData)
      .where('name', slug(name))
      .returning(this.visibleColumns)

    if (!updated) throw new Error('permission not found')

    return updated
  }
}

module.exports = Permissions
