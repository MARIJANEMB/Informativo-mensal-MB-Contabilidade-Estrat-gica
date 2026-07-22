migrate(
  (app) => {
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'marijane@mbcontabilidadems.com')
    } catch (_) {
      const users = app.findCollectionByNameOrId('_pb_users_auth_')
      const rec = new Record(users)
      rec.setEmail('marijane@mbcontabilidadems.com')
      rec.setPassword('Skip@Pass')
      rec.setVerified(true)
      rec.set('name', 'Marijane')
      app.save(rec)
    }

    var clientsCol = app.findCollectionByNameOrId('clients')
    var seedClients = [
      {
        name: 'Acme Corp LTDA',
        cnpj: '12.345.678/0001-90',
        contact_email: 'contato@acme.com',
        contact_phone: '(11) 3456-7890',
      },
      {
        name: 'Tech Solutions BR',
        cnpj: '98.765.432/0001-10',
        contact_email: 'financeiro@techsolutions.com',
        contact_phone: '(11) 9876-5432',
      },
      {
        name: 'Comercio Vale Sul',
        cnpj: '45.678.901/0001-23',
        contact_email: 'admin@valesul.com',
        contact_phone: '(19) 3234-5678',
      },
    ]
    var clientIds = []
    for (var i = 0; i < seedClients.length; i++) {
      var c = seedClients[i]
      var existing = []
      try {
        existing = app.findRecordsByFilter('clients', 'cnpj = "' + c.cnpj + '"', '', 1, 0)
      } catch (_) {}
      if (existing.length > 0) {
        clientIds.push(existing[0].id)
        continue
      }
      var rec = new Record(clientsCol)
      rec.set('name', c.name)
      rec.set('cnpj', c.cnpj)
      rec.set('contact_email', c.contact_email)
      rec.set('contact_phone', c.contact_phone)
      app.save(rec)
      clientIds.push(rec.id)
    }

    var now = new Date()
    var m = now.getMonth() + 1
    var y = now.getFullYear()
    var mrCol = app.findCollectionByNameOrId('monthly_records')
    var toCol = app.findCollectionByNameOrId('tax_obligations')
    var oblNames = ['FGTS', 'DAS', 'IRPJ', 'CSLL', 'PIS', 'COFINS', 'ISS', 'ICMS']
    var oblStatus = [
      'Paid',
      'Paid',
      'Pending',
      'Pending',
      'Paid',
      'Pending',
      'Exempt',
      'Not Applicable',
    ]
    var notes = [
      'Conciliacao bancaria concluida. Notas fiscais de entrada processadas. Pendente confirmacao de pagamento DAS.',
      'Folha de pagamento fechada. eSocial transmitido. Aguardando comprovante FGTS.',
      'Apuracao de ICMS concluida. Documentos contabeis em revisao para fechamento.',
    ]

    for (var i = 0; i < clientIds.length; i++) {
      var cid = clientIds[i]
      var mrExisting = []
      try {
        mrExisting = app.findRecordsByFilter(
          'monthly_records',
          'client = "' + cid + '" && month = ' + m + ' && year = ' + y,
          '',
          1,
          0,
        )
      } catch (_) {}
      if (mrExisting.length === 0) {
        var mrRec = new Record(mrCol)
        mrRec.set('client', cid)
        mrRec.set('month', m)
        mrRec.set('year', y)
        mrRec.set('notes', notes[i % notes.length])
        app.save(mrRec)
      }
      var toExisting = []
      try {
        toExisting = app.findRecordsByFilter(
          'tax_obligations',
          'client = "' + cid + '" && month = ' + m + ' && year = ' + y,
          '',
          100,
          0,
        )
      } catch (_) {}
      if (toExisting.length === 0) {
        for (var j = 0; j < oblNames.length; j++) {
          var toRec = new Record(toCol)
          toRec.set('client', cid)
          toRec.set('month', m)
          toRec.set('year', y)
          toRec.set('obligation_name', oblNames[j])
          toRec.set('status', oblStatus[j])
          if (oblStatus[j] === 'Paid') {
            var d = new Date()
            d.setDate(d.getDate() - 5)
            toRec.set('payment_date', d.toISOString().slice(0, 10))
          }
          app.save(toRec)
        }
      }
    }
  },
  (app) => {
    try {
      var u = app.findAuthRecordByEmail('_pb_users_auth_', 'marijane@mbcontabilidadems.com')
      app.delete(u)
    } catch (_) {}
    try {
      var clients = app.findRecordsByFilter('clients', '', '', 100, 0)
      for (var i = 0; i < clients.length; i++) {
        app.delete(clients[i])
      }
    } catch (_) {}
  },
)
