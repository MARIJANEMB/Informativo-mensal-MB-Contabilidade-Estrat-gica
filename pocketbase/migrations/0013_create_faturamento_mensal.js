migrate(
  (app) => {
    var clientsId = app.findCollectionByNameOrId('clients').id

    var collection = new Collection({
      name: 'faturamento_mensal',
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
        { name: 'mes', type: 'number', min: 1, max: 12, onlyInt: true },
        { name: 'ano', type: 'number', onlyInt: true },
        { name: 'receita', type: 'number' },
        { name: 'custos_variaveis', type: 'number' },
        { name: 'custos_operacao', type: 'number' },
        { name: 'margem_bruta', type: 'number' },
        { name: 'margem_operacional', type: 'number' },
        { name: 'margem_liquida', type: 'number' },
        { name: 'margem_percentual', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_faturamento_cliente ON faturamento_mensal (cliente)',
        'CREATE INDEX idx_faturamento_cliente_mes ON faturamento_mensal (cliente, ano, mes)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('faturamento_mensal'))
    } catch (_) {}
  },
)
