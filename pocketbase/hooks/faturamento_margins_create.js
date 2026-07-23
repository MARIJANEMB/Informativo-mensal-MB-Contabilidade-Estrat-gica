onRecordCreate((e) => {
  var receita = parseFloat(e.record.getString('receita')) || 0
  var cv = parseFloat(e.record.getString('custos_variaveis')) || 0
  var co = parseFloat(e.record.getString('custos_operacao')) || 0
  e.record.set('margem_bruta', receita - cv)
  e.record.set('margem_operacional', receita - cv - co)
  e.record.set('margem_liquida', receita - cv - co)
  e.record.set('margem_percentual', receita > 0 ? ((receita - cv - co) / receita) * 100 : 0)
  e.next()
}, 'faturamento_mensal')
