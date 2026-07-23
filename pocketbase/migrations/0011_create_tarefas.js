migrate(
  (app) => {
    var clientsId = app.findCollectionByNameOrId('clients').id
    var employeesId = app.findCollectionByNameOrId('employees').id

    var collection = new Collection({
      name: 'tarefas',
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
        {
          name: 'tipo',
          type: 'select',
          values: [
            'Livro Caixa',
            'Documentação Fiscal',
            'Declaração (IR/IRPJ)',
            'Reunião de Resultados',
            'NPS Survey',
            'Regularização',
            'Outra',
          ],
          maxSelect: 1,
        },
        { name: 'descricao', type: 'text' },
        { name: 'data_vencimento', type: 'date' },
        {
          name: 'status',
          type: 'select',
          values: ['Não Iniciada', 'Em Andamento', 'Aguardando Cliente', 'Concluída', 'Atrasada'],
          maxSelect: 1,
        },
        { name: 'responsavel', type: 'relation', collectionId: employeesId, maxSelect: 1 },
        {
          name: 'documentos_necessarios',
          type: 'select',
          values: [
            'Comprovante de Renda',
            'Nota Fiscal',
            'Recibo',
            'Demonstrativo Bancário',
            'Contrato',
            'Outro',
          ],
          maxSelect: 6,
        },
        {
          name: 'arquivos',
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
        { name: 'historico', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_tarefas_cliente ON tarefas (cliente)',
        'CREATE INDEX idx_tarefas_status ON tarefas (status)',
        'CREATE INDEX idx_tarefas_data_vencimento ON tarefas (data_vencimento)',
        'CREATE INDEX idx_tarefas_responsavel ON tarefas (responsavel)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('tarefas'))
    } catch (_) {}
  },
)
