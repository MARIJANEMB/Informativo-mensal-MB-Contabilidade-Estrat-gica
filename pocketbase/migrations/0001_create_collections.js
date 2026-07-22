migrate(
  (app) => {
    const clients = new Collection({
      name: 'clients',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'cnpj', type: 'text' },
        { name: 'contact_email', type: 'text' },
        { name: 'contact_phone', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ["CREATE UNIQUE INDEX idx_clients_cnpj ON clients (cnpj) WHERE cnpj != ''"],
    })
    app.save(clients)

    const clientsId = app.findCollectionByNameOrId('clients').id

    const monthlyRecords = new Collection({
      name: 'monthly_records',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'client',
          type: 'relation',
          required: true,
          collectionId: clientsId,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'month', type: 'number', min: 1, max: 12, onlyInt: true },
        { name: 'year', type: 'number', onlyInt: true },
        { name: 'notes', type: 'text' },
        {
          name: 'attachments',
          type: 'file',
          maxSelect: 20,
          maxSize: 10485760,
          mimeTypes: [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
          ],
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_monthly_records_client ON monthly_records (client, year, month)'],
    })
    app.save(monthlyRecords)

    const taxObligations = new Collection({
      name: 'tax_obligations',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'client',
          type: 'relation',
          required: true,
          collectionId: clientsId,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'month', type: 'number', min: 1, max: 12, onlyInt: true },
        { name: 'year', type: 'number', onlyInt: true },
        { name: 'obligation_name', type: 'text', required: true },
        {
          name: 'status',
          type: 'select',
          values: ['Pending', 'Paid', 'Exempt', 'Not Applicable'],
          maxSelect: 1,
        },
        { name: 'payment_date', type: 'date' },
        {
          name: 'proof',
          type: 'file',
          maxSelect: 1,
          maxSize: 10485760,
          mimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        },
        { name: 'observations', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_tax_obligations_client ON tax_obligations (client, year, month)'],
    })
    app.save(taxObligations)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('tax_obligations'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('monthly_records'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('clients'))
    } catch (_) {}
  },
)
