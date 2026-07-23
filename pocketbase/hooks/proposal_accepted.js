onRecordAfterUpdateSuccess((e) => {
  var oldStatus = e.record.original().getString('status')
  var newStatus = e.record.getString('status')
  if (oldStatus !== 'Aceita' && newStatus === 'Aceita') {
    var clientId = e.record.getString('cliente')
    var clientName = ''
    var responsavelId = ''
    try {
      var client = $app.findRecordById('clients', clientId)
      clientName = client.getString('name')
      responsavelId = client.getString('responsavel_mb')
    } catch (_) {}

    var dataAceita = e.record.getString('data_aceita')
    var baseDate = dataAceita ? new Date(dataAceita + 'T00:00:00') : new Date()
    var dueDate = new Date(baseDate.getTime() + 5 * 86400000)

    var scRecords = []
    try {
      scRecords = $app.findRecordsByFilter(
        'sucesso_cliente',
        'cliente = "' + clientId + '"',
        '',
        1,
        0,
      )
    } catch (_) {}

    var hasCompletedOnboarding =
      scRecords.length > 0 && scRecords[0].getString('status_onboarding') === 'Completo'

    if (!hasCompletedOnboarding) {
      var tarefasCol = $app.findCollectionByNameOrId('tarefas')
      var task = new Record(tarefasCol)
      task.set('cliente', clientId)
      task.set('tipo', 'Regularização')
      task.set('descricao', 'Onboarding – ' + clientName)
      task.set('data_vencimento', dueDate.toISOString().slice(0, 10))
      task.set('status', 'Não Iniciada')
      if (responsavelId) {
        task.set('responsavel', responsavelId)
      }
      $app.save(task)

      try {
        var scCol = $app.findCollectionByNameOrId('sucesso_cliente')
        if (scRecords.length > 0) {
          var scUpdate = $app.findRecordById('sucesso_cliente', scRecords[0].id)
          if (scUpdate.getString('status_onboarding') !== 'Completo') {
            scUpdate.set('status_onboarding', 'Apresentação')
            $app.save(scUpdate)
          }
        } else {
          var scNew = new Record(scCol)
          scNew.set('cliente', clientId)
          scNew.set('status_onboarding', 'Apresentação')
          if (responsavelId) {
            scNew.set('customer_success_manager', responsavelId)
          }
          scNew.set('data_inicio_relacionamento', new Date().toISOString().slice(0, 10))
          $app.save(scNew)
        }
      } catch (_) {}
    }
  }
  e.next()
}, 'propostas')
