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

(async function() {
  const acl = new ACL({
    db: {
      client: 'pg',
      host: '127.0.0.1',
      database: 'database_name',
      username: '',
      password: ''
    }
  });

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

#### migrate()

```javascript
acl.migrate();
```

### Roles

#### create(name)

Create a new role

```javascript
acl.roles.create('role-name-here');
```

#### update(name, changes)

Update a role data

```javascript
acl.roles.update('role-name-here', { name: 'new-role-name' });
```

#### delete(name)

Delete a role by its name

```javascript
acl.roles.delete('role-name-here');
```

#### findByName(name)

Find a role by its name

```javascript
acl.roles.findByName('role-name-here');
```

#### list()

List all available roles

```javascript
acl.roles.list();
```

#### clear()

Remove all roles

```javascript
acl.roles.clear();
```
