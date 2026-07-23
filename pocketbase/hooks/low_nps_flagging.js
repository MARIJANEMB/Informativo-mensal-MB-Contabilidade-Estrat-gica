onRecordAfterUpdateSuccess((e) => {
  var nps = parseInt(e.record.getString('nps_score') || '0', 10)
  if (nps > 0 && nps < 7) {
    var clientId = e.record.getString('cliente')
    try {
      var client = $app.findRecordById('clients', clientId)
      var tags = client.get('tags')
      if (!tags || !Array.isArray(tags)) tags = []
      if (tags.indexOf('Satisfação Baixa') === -1) {
        tags.push('Satisfação Baixa')
        client.set('tags', tags)
        $app.save(client)
      }
    } catch (_) {}
  }
  e.next()
}, 'propostas')
