onRecordAfterUpdateSuccess((e) => {
  var record = e.record
  var healthScore = record.get('health_score') || 0
  var riscoChurn = record.getString('risco_churn')
  var npsScore = record.get('nps_score') || 0
  var dataUltimaCheckin = record.getString('data_ultima_checkin')
  var oldHealthScore = record.original().get('health_score') || 0
  var oldRisco = record.original().getString('risco_churn')
  var oldNps = record.original().get('nps_score') || 0
  var oldCsat = record.original().get('csat_score') || 0
  var oldCheckin = record.original().getString('data_ultima_checkin')
  var oldUtiliza = record.original().getString('utiliza_todos_servicos')
  var newCsat = record.get('csat_score') || 0
  var newUtiliza = record.getString('utiliza_todos_servicos')

  function sendSlack(msg) {
    try {
      var all = $app.findRecordsByFilter('settings', "id != ''", '', 1, 0)
      if (all.length > 0 && all[0].getString('slack_webhook_url')) {
        $http.send({
          url: all[0].getString('slack_webhook_url'),
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: msg }),
          timeout: 10,
        })
      }
    } catch (_) {}
  }

  if (healthScore !== oldHealthScore && healthScore > 0 && healthScore < 40) {
    sendSlack('🚨 Health Score crítico: ' + healthScore + '. Ação imediata necessária!')
  }

  if (oldRisco !== 'Crítico' && riscoChurn === 'Crítico') {
    try {
      var tarefasCol = $app.findCollectionByNameOrId('tarefas')
      var task = new Record(tarefasCol)
      var clientId = record.getString('cliente')
      var csmId = record.getString('customer_success_manager')
      var tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
      task.set('cliente', clientId)
      task.set('tipo', 'Regularização')
      task.set('descricao', 'Reunião de Retenção')
      task.set('data_vencimento', tomorrow)
      task.set('status', 'Não Iniciada')
      if (csmId) task.set('responsavel', csmId)
      $app.save(task)
    } catch (_) {}
  }

  if (dataUltimaCheckin && oldCheckin !== dataUltimaCheckin) {
    var checkinDate = new Date(dataUltimaCheckin + 'T00:00:00')
    var dias = Math.floor((Date.now() - checkinDate.getTime()) / 86400000)
    if (dias > 30) sendSlack('📅 Cliente sem check-in há ' + dias + ' dias. Agendar reunião.')
  }

  if (npsScore > 0 && npsScore < 6 && oldNps !== npsScore) {
    try {
      var clientId = record.getString('cliente')
      var client = $app.findRecordById('clients', clientId)
      var tags = client.get('tags')
      if (!tags || !Array.isArray(tags)) tags = []
      if (tags.indexOf('NPS Baixo') === -1) {
        tags.push('NPS Baixo')
        client.set('tags', tags)
        $app.save(client)
      }
      var atendimentoCol = $app.findCollectionByNameOrId('atendimento')
      var ticket = new Record(atendimentoCol)
      ticket.set('cliente', clientId)
      ticket.set('categoria', 'Reclamação')
      ticket.set('prioridade', 'Alta')
      ticket.set('assunto', 'NPS Baixo – ' + client.getString('name'))
      ticket.set('status', 'Aberto')
      ticket.set('data_abertura', new Date().toISOString().slice(0, 10))
      $app.save(ticket)
    } catch (_) {}
  }

  if (
    oldNps !== npsScore ||
    oldCsat !== newCsat ||
    oldCheckin !== dataUltimaCheckin ||
    oldUtiliza !== newUtiliza
  ) {
    var tempoRes = record.get('tempo_medio_resolucao_horas') || 0
    var diasCheckin = 999
    if (dataUltimaCheckin) {
      var cd = new Date(dataUltimaCheckin + 'T00:00:00')
      diasCheckin = Math.floor((Date.now() - cd.getTime()) / 86400000)
    }
    var score = Math.round(
      (npsScore / 10) * 30 +
        (10 - tempoRes / 10) * 20 +
        (newCsat / 10) * 20 +
        (diasCheckin <= 30 ? 15 : 0) +
        (newUtiliza === 'Sim' ? 15 : 0),
    )
    score = Math.max(0, Math.min(100, score))
    var updatedRec = $app.findRecordById('sucesso_cliente', record.id)
    updatedRec.set('health_score', score)
    $app.save(updatedRec)
  }

  e.next()
}, 'sucesso_cliente')
