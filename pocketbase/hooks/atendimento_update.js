onRecordAfterUpdateSuccess((e) => {
  var record = e.record
  var status = record.getString('status')
  var prioridade = record.getString('prioridade')
  var oldStatus = record.original().getString('status')
  var dataAbertura = record.getString('data_abertura')

  function getSettings() {
    try {
      var all = $app.findRecordsByFilter('settings', "id != ''", '', 1, 0)
      return all.length > 0 ? all[0] : null
    } catch (_) {
      return null
    }
  }

  function sendSlack(msg) {
    var s = getSettings()
    if (!s) return
    var webhook = s.getString('slack_webhook_url')
    if (!webhook) return
    try {
      $http.send({
        url: webhook,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: msg }),
        timeout: 10,
      })
    } catch (_) {}
  }

  if (status === 'Aberto' && dataAbertura) {
    var abertura = new Date(dataAbertura + 'T00:00:00')
    var hoursOpen = (Date.now() - abertura.getTime()) / 3600000
    if (hoursOpen > 24) {
      var tags = record.get('tags')
      if (!tags || !Array.isArray(tags)) tags = []
      if (tags.indexOf('Escalação') === -1) {
        tags.push('Escalação')
        var upd = $app.findRecordById('atendimento', record.id)
        upd.set('tags', tags)
        $app.save(upd)
      }
      sendSlack('⚠️ Ticket em escalação: ' + record.getString('assunto') + ' (aberto há >24h)')
    }
  }

  if (oldStatus !== 'Resolvido' && status === 'Resolvido') {
    try {
      var clientId = record.getString('cliente')
      var client = $app.findRecordById('clients', clientId)
      var email = client.getString('email') || client.getString('contact_email')
      if (email) {
        $app.logger().info('Feedback request sent to ' + email + ' for ticket ' + record.id)
      }
    } catch (_) {}

    var satisfacao = record.get('satisfacao_cliente') || 0
    if (satisfacao >= 8) {
      try {
        var cid = record.getString('cliente')
        var scRecords = $app.findRecordsByFilter(
          'sucesso_cliente',
          'cliente = "' + cid + '"',
          '',
          1,
          0,
        )
        if (scRecords.length > 0) {
          var sc = scRecords[0]
          var nps = sc.get('nps_score') || 0
          var csat = sc.get('csat_score') || 0
          var tempoRes = sc.get('tempo_medio_resolucao_horas') || 0
          var utiliza = sc.getString('utiliza_todos_servicos')
          var dataCheckin = sc.getString('data_ultima_checkin')
          var diasCheckin = 999
          if (dataCheckin) {
            var cd = new Date(dataCheckin + 'T00:00:00')
            diasCheckin = Math.floor((Date.now() - cd.getTime()) / 86400000)
          }
          var score = Math.round(
            (nps / 10) * 30 +
              (10 - tempoRes / 10) * 20 +
              (csat / 10) * 20 +
              (diasCheckin <= 30 ? 15 : 0) +
              (utiliza === 'Sim' ? 15 : 0),
          )
          score = Math.max(0, Math.min(100, score))
          var updatedSc = $app.findRecordById('sucesso_cliente', sc.id)
          updatedSc.set('health_score', score)
          $app.save(updatedSc)
        }
      } catch (_) {}
    }
  }

  if (prioridade === 'Urgente' && status === 'Aberto') {
    sendSlack('🚨 Ticket URGENTE: ' + record.getString('assunto'))
  }

  e.next()
}, 'atendimento')
