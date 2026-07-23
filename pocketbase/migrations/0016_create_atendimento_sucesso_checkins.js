migrate(
  (app) => {
    var clientsId = app.findCollectionByNameOrId('clients').id
    var employeesId = app.findCollectionByNameOrId('employees').id

    var atendimento = new Collection({
      name: 'atendimento',
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
        { name: 'data_abertura', type: 'date' },
        {
          name: 'categoria',
          type: 'select',
          values: [
            'Dúvida Técnica',
            'Problema Sistema',
            'Orientação Tributária',
            'Documentação',
            'Cobrança',
            'Solicitação',
            'Reclamação',
            'Outro',
          ],
          maxSelect: 1,
        },
        { name: 'assunto', type: 'text' },
        { name: 'descricao', type: 'text' },
        {
          name: 'prioridade',
          type: 'select',
          values: ['Baixa', 'Normal', 'Alta', 'Urgente'],
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          values: [
            'Aberto',
            'Em Atendimento',
            'Aguardando Cliente',
            'Resolvido',
            'Fechado',
            'Reaberto',
          ],
          maxSelect: 1,
        },
        { name: 'responsavel', type: 'relation', collectionId: employeesId, maxSelect: 1 },
        { name: 'data_resolucao', type: 'date' },
        { name: 'tempo_resposta_horas', type: 'number' },
        { name: 'tempo_resolucao_horas', type: 'number' },
        { name: 'satisfacao_cliente', type: 'number', min: 1, max: 10, onlyInt: true },
        {
          name: 'tags',
          type: 'select',
          values: ['Urgente', 'Recorrente', 'Educação', 'Problema Sistema', 'Dúvida', 'Escalação'],
          maxSelect: 6,
        },
        { name: 'historico', type: 'text' },
        {
          name: 'anexos',
          type: 'file',
          maxSelect: 10,
          maxSize: 10485760,
          mimeTypes: [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'application/xml',
            'text/xml',
            'application/zip',
          ],
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_atendimento_cliente ON atendimento (cliente)',
        'CREATE INDEX idx_atendimento_status ON atendimento (status)',
        'CREATE INDEX idx_atendimento_prioridade ON atendimento (prioridade)',
      ],
    })
    app.save(atendimento)

    var sucessoCliente = new Collection({
      name: 'sucesso_cliente',
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
          name: 'customer_success_manager',
          type: 'relation',
          collectionId: employeesId,
          maxSelect: 1,
        },
        { name: 'data_inicio_relacionamento', type: 'date' },
        {
          name: 'status_onboarding',
          type: 'select',
          values: [
            'Não Iniciado',
            'Apresentação',
            'Diagnóstico',
            'Plano Aceito',
            'Implementação',
            'Completo',
          ],
          maxSelect: 1,
        },
        { name: 'data_onboarding_concluido', type: 'date' },
        { name: 'health_score', type: 'number', min: 0, max: 100, onlyInt: true },
        {
          name: 'risco_churn',
          type: 'select',
          values: ['Baixo', 'Médio', 'Alto', 'Crítico'],
          maxSelect: 1,
        },
        { name: 'data_ultima_checkin', type: 'date' },
        {
          name: 'frequencia_checkin',
          type: 'select',
          values: ['Semanal', 'Quinzenal', 'Mensal', 'Trimestral'],
          maxSelect: 1,
        },
        { name: 'tickets_abertos', type: 'number' },
        { name: 'tempo_medio_resolucao_horas', type: 'number' },
        { name: 'nps_score', type: 'number', min: 1, max: 10, onlyInt: true },
        { name: 'csat_score', type: 'number', min: 1, max: 10, onlyInt: true },
        {
          name: 'utiliza_todos_servicos',
          type: 'select',
          values: ['Sim', 'Não', 'Parcialmente'],
          maxSelect: 1,
        },
        {
          name: 'oportunidades_upsell',
          type: 'select',
          values: [
            'Upgrade',
            'BPO',
            'Consultoria',
            'Planejamento Tributário',
            'Dev Liderança',
            'Diagnóstico',
          ],
          maxSelect: 6,
        },
        { name: 'data_proximo_revisar_contrato', type: 'date' },
        { name: 'notas_cs', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_sucesso_cliente_cliente ON sucesso_cliente (cliente)',
        'CREATE INDEX idx_sucesso_cliente_health_score ON sucesso_cliente (health_score)',
        'CREATE INDEX idx_sucesso_cliente_risco_churn ON sucesso_cliente (risco_churn)',
      ],
    })
    app.save(sucessoCliente)

    var checkins = new Collection({
      name: 'checkins',
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
        { name: 'data_da_reuniao', type: 'date' },
        {
          name: 'tipo_checkin',
          type: 'select',
          values: [
            'Check-in Regular',
            'Revisão de Resultados',
            'Planejamento Estratégico',
            'Satisfação/Feedback',
            'Resolução de Problema',
            'Upsell Discussion',
          ],
          maxSelect: 1,
        },
        { name: 'participantes_mb', type: 'relation', collectionId: employeesId, maxSelect: 10 },
        {
          name: 'assuntos_abordados',
          type: 'select',
          values: [
            'Resultados Financeiros',
            'Tarefas/Pendências',
            'Satisfação',
            'Oportunidades',
            'Upsell',
            'Problemas',
            'Roadmap',
          ],
          maxSelect: 7,
        },
        { name: 'feedback_cliente', type: 'text' },
        { name: 'acao_seguimento', type: 'text' },
        { name: 'proximo_checkin_agendado', type: 'date' },
        { name: 'satisfacao_checkin', type: 'number', min: 1, max: 10, onlyInt: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_checkins_cliente ON checkins (cliente)',
        'CREATE INDEX idx_checkins_data_da_reuniao ON checkins (data_da_reuniao)',
      ],
    })
    app.save(checkins)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('atendimento'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('sucesso_cliente'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('checkins'))
    } catch (_) {}
  },
)
