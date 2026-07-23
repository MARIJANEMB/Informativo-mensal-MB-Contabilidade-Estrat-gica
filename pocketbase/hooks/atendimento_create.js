onRecordAfterCreateSuccess((e) => {
  var record = e.record
  var prioridade = record.getString('prioridade')
  var status = record.getString('status')

  if (prioridade === 'Urgente' && status === 'Aberto') {
    try {
      var allSettings = $app.findRecordsByFilter('settings', "id != ''", '', 1, 0)
      if (allSettings.length > 0) {
        var webhook = allSettings[0].getString('slack_webhook_url')
        if (webhook) {
          $http.send({
            url: webhook,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: '🚨 Ticket URGENTE criado: ' + record.getString('assunto'),
            }),
            timeout: 10,
          })
        }
      }
    } catch (_) {}
  }

  e.next()
}, 'atendimento')
