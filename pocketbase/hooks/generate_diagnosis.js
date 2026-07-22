routerAdd(
  'POST',
  '/backend/v1/reports/diagnosis',
  (e) => {
    try {
      const body = e.requestInfo().body || {}
      const clientId = body.clientId || ''
      const month = body.month || 0
      const year = body.year || 0

      if (!clientId) return e.badRequestError('clientId is required')
      if (!month || !year) return e.badRequestError('month and year are required')

      var notes = 'Nenhuma nota registrada.'
      try {
        var mr = $app.findFirstRecordByFilter(
          'monthly_records',
          'client = "' + clientId + '" && month = ' + month + ' && year = ' + year,
        )
        if (mr && mr.getString('notes')) {
          notes = mr.getString('notes')
        }
      } catch (_) {}

      var taxObs = []
      try {
        taxObs = $app.findRecordsByFilter(
          'tax_obligations',
          'client = "' + clientId + '" && month = ' + month + ' && year = ' + year,
          '',
          100,
          0,
        )
      } catch (_) {}

      var docObs = []
      try {
        docObs = $app.findRecordsByFilter(
          'document_obligations',
          'client = "' + clientId + '" && month = ' + month + ' && year = ' + year,
          '',
          100,
          0,
        )
      } catch (_) {}

      if (taxObs.length === 0 && docObs.length === 0) {
        return e.json(200, {
          diagnosis:
            'Não há obrigações registradas para este cliente no período selecionado. Adicione obrigações fiscais e documentos para gerar um diagnóstico detalhado.',
          actionPlan: [
            'Cadastre as obrigações fiscais do mês',
            'Registre os documentos pendentes do cliente',
          ],
        })
      }

      var taxSummary = taxObs
        .map(function (o) {
          return (
            '- ' +
            o.getString('obligation_name') +
            ': ' +
            o.getString('status') +
            (o.getString('payment_date') ? ' (pago em ' + o.getString('payment_date') + ')' : '') +
            (o.getString('observations') ? ' — ' + o.getString('observations') : '')
          )
        })
        .join('\n')

      var docSummary = docObs
        .map(function (o) {
          return (
            '- ' +
            o.getString('document_type') +
            ': ' +
            o.getString('status') +
            (o.getString('proof') ? ' (arquivo anexado)' : ' (sem arquivo)') +
            (o.getString('observations') ? ' — ' + o.getString('observations') : '')
          )
        })
        .join('\n')

      var prompt =
        'Você é um contador experiente da MB Contabilidade. Analise os dados do cliente para o mês ' +
        month +
        '/' +
        year +
        ' e gere um diagnóstico.\n\n' +
        'NOTAS DO MÊS:\n' +
        notes +
        '\n\n' +
        'OBRIGAÇÕES FISCAIS:\n' +
        (taxSummary || 'Nenhuma obrigação registrada.') +
        '\n\n' +
        'DOCUMENTOS PENDENTES:\n' +
        (docSummary || 'Nenhum documento registrado.') +
        '\n\n' +
        'Responda em JSON no formato: {"diagnosis": "parágrafo curto de diagnóstico", "actionPlan": ["ação 1", "ação 2", "ação 3"]}. ' +
        'O diagnóstico deve ser um parágrafo conciso sobre a situação fiscal e documental do cliente. ' +
        'O actionPlan deve conter de 2 a 3 ações práticas e específicas. Responda APENAS com o JSON, sem texto adicional.'

      var reply = $ai.chat({
        model: 'fast',
        messages: [
          {
            role: 'system',
            content:
              'Você é um assistente contábil que sempre responde com JSON válido. Não inclua markdown ou texto fora do JSON.',
          },
          { role: 'user', content: prompt },
        ],
      })

      var content = reply.choices[0].message.content.trim()
      var parsed = null
      try {
        var jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0])
        }
      } catch (_) {}

      if (!parsed || !parsed.diagnosis) {
        parsed = {
          diagnosis: content.substring(0, 500),
          actionPlan: ['Revise as obrigações pendentes e organize os documentos do próximo mês.'],
        }
      }

      if (!Array.isArray(parsed.actionPlan) || parsed.actionPlan.length === 0) {
        parsed.actionPlan = [
          'Revise as obrigações pendentes e organize os documentos do próximo mês.',
        ]
      }

      return e.json(200, {
        diagnosis: parsed.diagnosis,
        actionPlan: parsed.actionPlan,
      })
    } catch (err) {
      return e.json(500, {
        error: 'Falha ao gerar diagnóstico: ' + (err.message || 'erro desconhecido'),
      })
    }
  },
  $apis.requireAuth(),
)
