migrate(
  (app) => {
    const collection = new Collection({
      name: 'employees',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'text' },
        { name: 'role', type: 'text' },
        {
          name: 'department',
          type: 'select',
          values: ['Fiscal', 'Contábil', 'Folha', 'Outros'],
          maxSelect: 1,
        },
        { name: 'notes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        "CREATE UNIQUE INDEX idx_employees_email ON employees (email) WHERE email != ''",
        'CREATE INDEX idx_employees_department ON employees (department)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('employees'))
    } catch (_) {}
  },
)
