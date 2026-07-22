migrate(
  (app) => {
    const clientsId = app.findCollectionByNameOrId('clients').id

    const collection = new Collection({
      name: 'document_obligations',
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
        {
          name: 'document_type',
          type: 'select',
          values: ['XML', 'Extrato', 'Comprovante de Pagamento', 'Outros'],
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          values: ['Pendente', 'Recebido', 'Não Necessário'],
          maxSelect: 1,
        },
        {
          name: 'proof',
          type: 'file',
          maxSelect: 1,
          maxSize: 10485760,
          mimeTypes: [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
          ],
        },
        { name: 'observations', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_document_obligations_client ON document_obligations (client)',
        'CREATE INDEX idx_document_obligations_client_month_year ON document_obligations (client, month, year)',
      ],
    })

    app.save(collection)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('document_obligations'))
    } catch (_) {}
  },
)
