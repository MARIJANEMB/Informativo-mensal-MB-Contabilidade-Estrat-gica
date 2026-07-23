migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('clients')
    var employeesId = app.findCollectionByNameOrId('employees').id

    if (!col.fields.getByName('data_inicio')) {
      col.fields.add(new DateField({ name: 'data_inicio' }))
    }
    if (!col.fields.getByName('regime_tributario')) {
      col.fields.add(
        new SelectField({
          name: 'regime_tributario',
          values: ['Simples Nacional', 'Lucro Presumido', 'Lucro Real'],
          maxSelect: 1,
        }),
      )
    }
    if (!col.fields.getByName('plano_contratado')) {
      col.fields.add(
        new SelectField({
          name: 'plano_contratado',
          values: [
            'Essencial T1',
            'Essencial T2',
            'Essencial T3',
            'Estratégico T1',
            'Estratégico T2',
            'Estratégico T3',
          ],
          maxSelect: 1,
        }),
      )
    }
    if (!col.fields.getByName('valor_mensal')) {
      col.fields.add(new NumberField({ name: 'valor_mensal' }))
    }
    if (!col.fields.getByName('status')) {
      col.fields.add(
        new SelectField({
          name: 'status',
          values: ['Ativo', 'Inativo', 'Cancelado', 'Diagnosticado'],
          maxSelect: 1,
        }),
      )
    }
    if (!col.fields.getByName('contato_principal')) {
      col.fields.add(new TextField({ name: 'contato_principal' }))
    }
    if (!col.fields.getByName('celular')) {
      col.fields.add(new TextField({ name: 'celular' }))
    }
    if (!col.fields.getByName('email')) {
      col.fields.add(new TextField({ name: 'email' }))
    }
    if (!col.fields.getByName('email_secundario')) {
      col.fields.add(new TextField({ name: 'email_secundario' }))
    }
    if (!col.fields.getByName('endereco')) {
      col.fields.add(new TextField({ name: 'endereco' }))
    }
    if (!col.fields.getByName('responsavel_mb')) {
      col.fields.add(
        new RelationField({
          name: 'responsavel_mb',
          collectionId: employeesId,
          maxSelect: 1,
        }),
      )
    }
    if (!col.fields.getByName('tags')) {
      col.fields.add(
        new SelectField({
          name: 'tags',
          values: [
            'Comércio',
            'Serviços',
            'Imobiliária',
            'Saúde',
            'Educação',
            'Alto Potencial Upsell',
            'Churn Risk',
            'VIP',
            'Satisfação Baixa',
          ],
          maxSelect: 9,
        }),
      )
    }
    if (!col.fields.getByName('ultima_interacao')) {
      col.fields.add(new DateField({ name: 'ultima_interacao' }))
    }
    if (!col.fields.getByName('notas')) {
      col.fields.add(new TextField({ name: 'notas' }))
    }
    app.save(col)

    var clients = app.findRecordsByFilter('clients', '', '', 1000, 0)
    for (var i = 0; i < clients.length; i++) {
      var c = clients[i]
      var changed = false
      var oldEmail = c.getString('contact_email')
      var oldPhone = c.getString('contact_phone')
      if (oldEmail && !c.getString('email')) {
        c.set('email', oldEmail)
        changed = true
      }
      if (oldPhone && !c.getString('celular')) {
        c.set('celular', oldPhone)
        changed = true
      }
      if (!c.getString('status')) {
        c.set('status', 'Ativo')
        changed = true
      }
      if (changed) app.save(c)
    }
  },
  (app) => {
    var col = app.findCollectionByNameOrId('clients')
    var fieldsToRemove = [
      'data_inicio',
      'regime_tributario',
      'plano_contratado',
      'valor_mensal',
      'status',
      'contato_principal',
      'celular',
      'email',
      'email_secundario',
      'endereco',
      'responsavel_mb',
      'tags',
      'ultima_interacao',
      'notas',
    ]
    for (var i = 0; i < fieldsToRemove.length; i++) {
      var f = col.fields.getByName(fieldsToRemove[i])
      if (f) col.fields.remove(f)
    }
    app.save(col)
  },
)
