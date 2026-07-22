migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.fields.add(
      new SelectField({
        name: 'role',
        values: ['Admin', 'User'],
        maxSelect: 1,
      }),
    )
    app.save(users)

    try {
      const admin = app.findAuthRecordByEmail('users', 'marijane@mbcontabilidadems.com')
      admin.set('role', 'Admin')
      app.save(admin)
    } catch (e) {}
  },
  (app) => {
    try {
      const users = app.findCollectionByNameOrId('users')
      users.fields.removeByName('role')
      app.save(users)
    } catch (e) {}
  },
)
