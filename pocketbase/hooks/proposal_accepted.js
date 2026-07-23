onRecordAfterUpdateSuccess((e) => {
  var oldStatus = e.record.original().getString('status')
  var newStatus = e.record.getString('status')
  if (oldStatus !== 'Aceita' && newStatus === 'Aceita') {
    var clientId = e.record.getString('cliente')
    var responsavelId = ''
    try {
      var client = $app.findRecordById('clients', clientId)
      responsavelId = client.getString('responsavel_mb')
    } catch (_) {}

    var today = new Date()
    var dueDate = new Date(today.getTime() + 5 * 86400000)

    var tarefasCol = $app.findCollectionByNameOrId('tarefas')
    var task = new Record(tarefasCol)
    task.set('cliente', clientId)
    task.set('tipo', 'Outra')
    task.set('descricao', 'Onboarding do cliente')
    task.set('data_vencimento', dueDate.toISOString().slice(0, 10))
    task.set('status', 'Não Iniciada')
    if (responsavelId) {
      task.set('responsavel', responsavelId)
    }
    $app.save(task)
  }
  e.next()
}, 'propostas')
