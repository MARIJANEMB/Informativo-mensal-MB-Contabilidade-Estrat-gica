migrate(
  (app) => {
    var now = new Date()
    var m = now.getMonth() + 1
    var y = now.getFullYear()

    var clientIds = []
    try {
      var clients = app.findRecordsByFilter('clients', '', '', 100, 0)
      for (var i = 0; i < clients.length; i++) {
        clientIds.push(clients[i].id)
      }
    } catch (_) {}

    if (clientIds.length === 0) return

    var doCol = app.findCollectionByNameOrId('document_obligations')
    var docTypes = ['XML', 'Extrato', 'Comprovante de Pagamento', 'Outros']
    var docStatuses = ['Pendente', 'Recebido', 'Pendente', 'Não Necessário']
    var docObs = [
      'XML de notas fiscais de entrada do mês',
      'Extrato bancário para conciliação',
      'Comprovante de pagamento DAS',
      'Documentos adicionais solicitados pelo contador',
    ]

    for (var i = 0; i < clientIds.length; i++) {
      var cid = clientIds[i]
      var existing = []
      try {
        existing = app.findRecordsByFilter(
          'document_obligations',
          'client = "' + cid + '" && month = ' + m + ' && year = ' + y,
          '',
          100,
          0,
        )
      } catch (_) {}

      if (existing.length > 0) continue

      for (var j = 0; j < docTypes.length; j++) {
        var existingType = []
        try {
          existingType = app.findRecordsByFilter(
            'document_obligations',
            'client = "' +
              cid +
              '" && month = ' +
              m +
              ' && year = ' +
              y +
              ' && document_type = "' +
              docTypes[j] +
              '"',
            '',
            1,
            0,
          )
        } catch (_) {}
        if (existingType.length > 0) continue

        var rec = new Record(doCol)
        rec.set('client', cid)
        rec.set('month', m)
        rec.set('year', y)
        rec.set('document_type', docTypes[j])
        rec.set('status', docStatuses[j])
        rec.set('observations', docObs[j])
        app.save(rec)
      }
    }
  },
  (app) => {
    try {
      var records = app.findRecordsByFilter('document_obligations', '', '', 1000, 0)
      for (var i = 0; i < records.length; i++) {
        app.delete(records[i])
      }
    } catch (_) {}
  },
)
