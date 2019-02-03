# ACL

An access control list connected to a database via knex module.

### How to install

```bash
npm install --save drone-acl
```

---

### How to use

```javascript
const ACL = require('drone-acl');
const knex = require('knex');

(async function() {
  const knexConn = const knexConn = knex({
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

  const acl = new ACL(knexConn);

  // run required database migrations
  await acl.migrate();

  // create a role
  await acl.roles.create('administrator');

  // create a permission
  await acl.permissions.create('view-users', 'Permission to view users');

  // work with administrator role
  const admin = acl.role('administrator');

  // assign permissions to a role
  await admin.allow('view-users');

  await admin.hasPermission('view-users'); // true
})();
```

---

## API

### ACL

#### migrate(): Promise

Create required DB tables

```javascript
acl.migrate();
```

#### role(name: String): RolePermission

Get a role to work with

```javascript
const role = acl.role('role-name');
```

### RolePermission

#### allow(permission: String|String[]): Promise

Add a permission or array of permissions to the role access

```javascript
acl.role('role-name').allow('permission-name');
```

#### disallow(permission: String|String[]): Promise

Remove permission or array of permissions from the role access

```javascript
acl.role('role-name').disallow('permission-name');
```

#### hasPermission(permission: String): Promise -> boolean

Verifiy if role has access to the permission

```javascript
acl.role('role-name').hasPermission('permission-name');
```

#### can(permission: String): Promise -> boolean

Alias of `hasPermission()`

```javascript
acl.role('role-name').can('permission-name');
```

### Roles

#### create(name): Promise -> RolePermission

Create a new role

```javascript
acl.roles.create('role-name-here');
```

#### update(name, changes): Promise

Update a role data

```javascript
acl.roles.update('role-name-here', { name: 'new-role-name' });
```

#### delete(name): Promise

Delete a role by its name

```javascript
acl.roles.delete('role-name-here');
```

#### findByName(name): Promise

Find a role by its name

```javascript
acl.roles.findByName('role-name-here');
```

#### list(): Promise

List all available roles

```javascript
acl.roles.list();
```

#### clear(): Promise

Remove all roles

```javascript
acl.roles.clear();
```

### Permissions

#### create(name): Promise

Create a new permission

```javascript
acl.permissions.create('permission name', 'permission description');
```

#### update(name, changes): Promise

Update a permission data

```javascript
acl.permissions.update('role-name-here', {
  name: 'new-permission-name',
  description: 'new-permission description'
});
```

#### delete(name): Promise

Delete a permission by its name

```javascript
acl.permissions.delete('permission-name-here');
```

#### findByName(name): Promise

Find a permission by its name

```javascript
acl.permissions.findByName('permission-name-here');
```

#### list(): Promise

List all available permissions

```javascript
acl.permissions.list();
```

#### clear(): Promise

Remove all permissions

```javascript
acl.permissions.clear();
```
