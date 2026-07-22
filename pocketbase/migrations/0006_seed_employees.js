migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('employees')
    var seeds = [
      {
        name: 'Maria João',
        email: 'maria.joao@mbcontabilidadems.com',
        phone: '(11) 3456-7890',
        role: 'Contadora',
        department: 'Contábil',
        notes: 'Responsável pelo departamento contábil.',
      },
      {
        name: 'Carlos Santos',
        email: 'carlos.santos@mbcontabilidadems.com',
        phone: '(11) 3456-7891',
        role: 'Analista Fiscal',
        department: 'Fiscal',
        notes: 'Especialista em ICMS e Simples Nacional.',
      },
      {
        name: 'Ana Paula Lima',
        email: 'ana.lima@mbcontabilidadems.com',
        phone: '(11) 3456-7892',
        role: 'Auxiliar de Folha',
        department: 'Folha',
        notes: 'Responsável por eSocial e folha de pagamento.',
      },
      {
        name: 'Pedro Alves',
        email: 'pedro.alves@mbcontabilidadems.com',
        phone: '(11) 3456-7893',
        role: 'Analista Contábil',
        department: 'Contábil',
        notes: 'Conciliação bancária e fechamento mensal.',
      },
      {
        name: 'Juliana Rocha',
        email: 'juliana.rocha@mbcontabilidadems.com',
        phone: '(11) 3456-7894',
        role: 'Coordenadora Fiscal',
        department: 'Fiscal',
        notes: 'Lidera a equipe fiscal. Atende clientes do setor de comércio.',
      },
    ]

    for (var i = 0; i < seeds.length; i++) {
      var s = seeds[i]
      try {
        app.findFirstRecordByData('employees', 'email', s.email)
        continue
      } catch (_) {}
      var rec = new Record(col)
      rec.set('name', s.name)
      rec.set('email', s.email)
      rec.set('phone', s.phone)
      rec.set('role', s.role)
      rec.set('department', s.department)
      rec.set('notes', s.notes)
      app.save(rec)
    }
  },
  (app) => {
    try {
      var records = app.findRecordsByFilter('employees', '', '', 100, 0)
      for (var i = 0; i < records.length; i++) {
        app.delete(records[i])
      }
    } catch (_) {}
  },
)
