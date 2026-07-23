migrate(
  (app) => {
    var clientIds = []
    try {
      var clients = app.findRecordsByFilter('clients', '', '', 100, 0)
      for (var i = 0; i < clients.length; i++) clientIds.push(clients[i].id)
    } catch (_) {}
    if (clientIds.length === 0) return

    var empIds = []
    try {
      var emps = app.findRecordsByFilter('employees', '', '', 100, 0)
      for (var j = 0; j < emps.length; j++) empIds.push(emps[j].id)
    } catch (_) {}

    var now = new Date()
    var m = now.getMonth() + 1
    var y = now.getFullYear()

    var tarefasCol = app.findCollectionByNameOrId('tarefas')
    var tarefasSeeds = [
      {
        tipo: 'Livro Caixa',
        desc: 'Enviar demonstrativo de caixa mensal',
        offset: 5,
        status: 'Não Iniciada',
      },
      {
        tipo: 'Documentação Fiscal',
        desc: 'Solicitar NF-e pendentes do mês',
        offset: -2,
        status: 'Atrasada',
      },
      {
        tipo: 'Reunião de Resultados',
        desc: 'Apresentar análise financeira trimestral',
        offset: 10,
        status: 'Em Andamento',
      },
    ]
    for (var k = 0; k < tarefasSeeds.length; k++) {
      var ts = tarefasSeeds[k]
      var tExisting = []
      try {
        tExisting = app.findRecordsByFilter('tarefas', 'descricao = "' + ts.desc + '"', '', 1, 0)
      } catch (_) {}
      if (tExisting.length > 0) continue
      var due = new Date(now.getTime() + ts.offset * 86400000)
      var tRec = new Record(tarefasCol)
      tRec.set('cliente', clientIds[k % clientIds.length])
      tRec.set('tipo', ts.tipo)
      tRec.set('descricao', ts.desc)
      tRec.set('data_vencimento', due.toISOString().slice(0, 10))
      tRec.set('status', ts.status)
      if (empIds.length > 0) tRec.set('responsavel', empIds[k % empIds.length])
      app.save(tRec)
    }

    var propCol = app.findCollectionByNameOrId('propostas')
    var propSeeds = [
      { plano: 'Estratégico T2', valor: 2500, status: 'Aceita' },
      { plano: 'Essencial T3', valor: 1800, status: 'Em Discussão' },
      { plano: 'Estratégico T1', valor: 3200, status: 'Enviada' },
    ]
    for (var p = 0; p < propSeeds.length; p++) {
      var ps = propSeeds[p]
      var pExisting = []
      try {
        pExisting = app.findRecordsByFilter(
          'propostas',
          'cliente = "' +
            clientIds[p % clientIds.length] +
            '" && plano_proposto = "' +
            ps.plano +
            '"',
          '',
          1,
          0,
        )
      } catch (_) {}
      if (pExisting.length > 0) continue
      var pRec = new Record(propCol)
      pRec.set('cliente', clientIds[p % clientIds.length])
      pRec.set('data_proposta', now.toISOString().slice(0, 10))
      pRec.set('plano_proposto', ps.plano)
      pRec.set('valor_mensal', ps.valor)
      pRec.set('status', ps.status)
      if (ps.status === 'Aceita') {
        var aceita = new Date(now.getTime() - 10 * 86400000)
        pRec.set('data_aceita', aceita.toISOString().slice(0, 10))
        pRec.set('nps_score', 8)
        pRec.set('csat_score', 9)
      }
      app.save(pRec)
    }

    var fatCol = app.findCollectionByNameOrId('faturamento_mensal')
    var fatSeeds = [
      { receita: 5000, cv: 800, co: 1200 },
      { receita: 3500, cv: 500, co: 900 },
      { receita: 6000, cv: 1000, co: 1500 },
    ]
    for (var f = 0; f < fatSeeds.length; f++) {
      var fs = fatSeeds[f]
      var fExisting = []
      try {
        fExisting = app.findRecordsByFilter(
          'faturamento_mensal',
          'cliente = "' + clientIds[f % clientIds.length] + '" && mes = ' + m + ' && ano = ' + y,
          '',
          1,
          0,
        )
      } catch (_) {}
      if (fExisting.length > 0) continue
      var fRec = new Record(fatCol)
      fRec.set('cliente', clientIds[f % clientIds.length])
      fRec.set('mes', m)
      fRec.set('ano', y)
      fRec.set('receita', fs.receita)
      fRec.set('custos_variaveis', fs.cv)
      fRec.set('custos_operacao', fs.co)
      fRec.set('margem_bruta', fs.receita - fs.cv)
      fRec.set('margem_operacional', fs.receita - fs.cv - fs.co)
      fRec.set('margem_liquida', fs.receita - fs.cv - fs.co)
      fRec.set(
        'margem_percentual',
        fs.receita > 0 ? ((fs.receita - fs.cv - fs.co) / fs.receita) * 100 : 0,
      )
      app.save(fRec)
    }
  },
  (app) => {
    try {
      var t = app.findRecordsByFilter('tarefas', '', '', 1000, 0)
      for (var i = 0; i < t.length; i++) app.delete(t[i])
    } catch (_) {}
    try {
      var p = app.findRecordsByFilter('propostas', '', '', 1000, 0)
      for (var j = 0; j < p.length; j++) app.delete(p[j])
    } catch (_) {}
    try {
      var f = app.findRecordsByFilter('faturamento_mensal', '', '', 1000, 0)
      for (var k = 0; k < f.length; k++) app.delete(f[k])
    } catch (_) {}
  },
)
