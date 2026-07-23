migrate(
  (app) => {
    var clientsId = app.findCollectionByNameOrId('clients').id

    var collection = new Collection({
      name: 'propostas',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'cliente',
          type: 'relation',
          required: true,
          collectionId: clientsId,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'data_proposta', type: 'date' },
        {
          name: 'plano_proposto',
          type: 'select',
          values: [
            'Essencial T1',
            'Essencial T2',
            'Essencial T3',
            'Estratégico T1',
            'Estratégico T2',
            'Estratégico T3',
          ],
          maxSelect: 1,
        },
        { name: 'valor_mensal', type: 'number' },
        {
          name: 'status',
          type: 'select',
          values: ['Enviada', 'Em Discussão', 'Aceita', 'Recusada', 'Vencida'],
          maxSelect: 1,
        },
        { name: 'data_aceita', type: 'date' },
        { name: 'nps_score', type: 'number', min: 1, max: 10, onlyInt: true },
        { name: 'csat_score', type: 'number', min: 1, max: 10, onlyInt: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_propostas_cliente ON propostas (cliente)',
        'CREATE INDEX idx_propostas_status ON propostas (status)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('propostas'))
    } catch (_) {}
  },
)
