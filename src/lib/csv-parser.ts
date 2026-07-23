export interface ParsedCSV {
  headers: string[]
  rows: string[][]
}

export function parseCSV(text: string): ParsedCSV {
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length === 0) return { headers: [], rows: [] }

  const parseLine = (line: string): string[] => {
    const cells: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        cells.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    cells.push(current.trim())
    return cells
  }

  const headers = parseLine(lines[0])
  const rows = lines.slice(1).map(parseLine)
  return { headers, rows }
}

const FIELD_MAPS: Record<string, Record<string, string>> = {
  clients: {
    cliente: 'name',
    nome: 'name',
    cnpj: 'cnpj',
    data_inicio: 'data_inicio',
    regime_tributario: 'regime_tributario',
    plano_contratado: 'plano_contratado',
    valor_mensal: 'valor_mensal',
    status: 'status',
    contato_principal: 'contato_principal',
    celular: 'celular',
    email: 'email',
    endereco: 'endereco',
  },
  tarefas: {
    cliente: 'cliente',
    tipo: 'tipo',
    descricao: 'descricao',
    data_vencimento: 'data_vencimento',
    status: 'status',
    responsavel: 'responsavel',
  },
  propostas: {
    cliente: 'cliente',
    data_proposta: 'data_proposta',
    plano_proposto: 'plano_proposto',
    valor_mensal: 'valor_mensal',
    status: 'status',
    data_aceita: 'data_aceita',
    nps_score: 'nps_score',
    csat_score: 'csat_score',
  },
  faturamento_mensal: {
    cliente: 'cliente',
    mes: 'mes',
    ano: 'ano',
    receita: 'receita',
    custos_variaveis: 'custos_variaveis',
    custos_operacao: 'custos_operacao',
  },
}

export function mapColumns(collection: string, headers: string[]): Record<number, string> {
  const fieldMap = FIELD_MAPS[collection] || {}
  const result: Record<number, string> = {}
  headers.forEach((header, idx) => {
    const normalized = header.toLowerCase().trim().replace(/\s+/g, '_')
    if (fieldMap[normalized]) {
      result[idx] = fieldMap[normalized]
    }
  })
  return result
}
