# MB CONTABILIDADE ESTRATÉGICA — Sistema Gerencial Skip

## Guia de Importação Rápida

---

## 📦 Arquivos Inclusos

```
├── MB_Skip_Schema.json           ← Esquema completo (estrutura de todas as tabelas)
├── Clientes.csv                  ← 5 clientes exemplo
├── Tarefas.csv                   ← 7 tarefas exemplo
├── Propostas.csv                 ← 6 propostas exemplo
├── Faturamento_Mensal.csv        ← 10 registros de faturamento
└── README_SKIP_IMPORT.md         ← Este arquivo
```

---

## 🚀 PASSO 1: Criar Tabelas no Skip

### Opção A: Importar via JSON (Recomendado - se Skip suporta bulk schema import)

1. Acesse seu workspace Skip
2. Vá em **Importar** ou **Criar do Schema**
3. Cole o conteúdo de `MB_Skip_Schema.json`
4. Clique em **Importar Estrutura**

### Opção B: Criar Manualmente (se JSON não funcionar)

#### Tabela 1: CLIENTES

- Nome: `Clientes`
- Campos (tipo):
  - `ID` (Auto-incremental)
  - `Cliente` (Text) - obrigatório
  - `CNPJ` (Text) - obrigatório, único
  - `Data_Início` (Date) - obrigatório
  - `Regime_Tributário` (Dropdown: "Simples Nacional", "Lucro Presumido", "Lucro Real")
  - `Plano_Contratado` (Dropdown: "Essencial T1-T3", "Estratégico T1-T3")
  - `Valor_Mensal` (Currency - BRL)
  - `Status` (Dropdown: "Ativo", "Inativo", "Cancelado", "Diagnosticado")
  - `Contato_Principal` (Text)
  - `Celular` (Phone)
  - `Email` (Email)
  - `Email_Secundário` (Email - opcional)
  - `Endereço` (Text - opcional)
  - `Responsável_MB` (Link para Team)
  - `Tags` (Multi-select)
  - `Última_Interação` (Date - opcional)
  - `Notas` (Long Text - opcional)

#### Tabela 2: TAREFAS

- Nome: `Tarefas`
- Campos (tipo):
  - `ID_Tarefa` (Auto-incremental)
  - `Cliente` (Link → Clientes) - obrigatório
  - `Tipo` (Dropdown: "Livro Caixa", "Documentação Fiscal", "Declaração", "Reunião de Resultados", "NPS Survey", "Regularização", "Outra")
  - `Descrição` (Long Text - opcional)
  - `Data_Vencimento` (Date) - obrigatório, com alertas
  - `Status` (Dropdown: "Não Iniciada", "Em Andamento", "Aguardando Cliente", "Concluída", "Atrasada")
  - `Responsável` (Link → Team) - obrigatório
  - `Documentos_Necessários` (Checklist - opcional)
  - `Arquivos_Anexados` (File - link com Google Drive)
  - `Histórico` (Comments - auto changelog)

#### Tabela 3: PROPOSTAS

- Nome: `Propostas`
- Campos (tipo):
  - `ID_Proposta` (Auto-incremental)
  - `Cliente` (Link → Clientes) - obrigatório
  - `Data_Proposta` (Date) - obrigatório
  - `Plano_Proposto` (Dropdown: igual a Plano_Contratado)
  - `Valor_Mensal` (Currency - BRL)
  - `Status` (Dropdown: "Enviada", "Em Discussão", "Aceita", "Recusada", "Vencida")
  - `Data_Aceita` (Date - opcional)
  - `NPS_Score` (Number 1-10 - opcional)
  - `CSAT_Score` (Number 1-10 - opcional)

#### Tabela 4: FATURAMENTO_MENSAL

- Nome: `Faturamento_Mensal`
- Campos (tipo):
  - `ID` (Auto-incremental)
  - `Cliente` (Link → Clientes) - obrigatório
  - `Mês` (Month-Year) - obrigatório
  - `Receita` (Currency - BRL) - **sincroniza com Omie automaticamente**
  - `Custos_Variáveis` (Currency - BRL)
  - `Custos_de_Operação` (Currency - BRL)
  - `Margem_Bruta` (Currency - BRL, **Formula**: `Receita - Custos_Variáveis`)
  - `Margem_Operacional` (Currency - BRL, **Formula**: `Receita - (Custos_Variáveis + Custos_de_Operação)`)
  - `Margem_Líquida` (Currency - BRL, **Formula**: `Receita - (Custos_Variáveis + Custos_de_Operação)`)
  - `Percentual_Margem` (Percentage, **Formula**: `(Margem_Líquida / Receita) * 100`)

---

## 📥 PASSO 2: Importar Dados

### Para cada tabela:

1. Abra a tabela no Skip
2. Clique em **Importar** ou **Import CSV**
3. Selecione o arquivo CSV correspondente (ex: `Clientes.csv`)
4. Verifique o mapeamento de colunas
5. Clique em **Importar**

**Ordem recomendada:**

1. ✅ `Clientes.csv` primeiro (pois as outras dependem dela)
2. ✅ `Tarefas.csv`
3. ✅ `Propostas.csv`
4. ✅ `Faturamento_Mensal.csv` por último

---

## ⚙️ PASSO 3: Configurar Relacionamentos

Após importar, valide os links:

- [ ] Todas as Tarefas estão linkadas aos Clientes certos?
- [ ] Todas as Propostas estão linkadas aos Clientes certos?
- [ ] Todos os Faturamentos estão linkados aos Clientes certos?

---

## 📊 PASSO 4: Criar Views

No Skip, crie as seguintes visualizações:

### Dashboard Executivo

- Tipo: Dashboard
- Widgets:
  - Total de Clientes Ativos (filtro: Status = "Ativo")
  - Receita Mensal Total (soma Valor_Mensal de clientes ativos)
  - Tarefas Vencidas (filtro: Status = "Atrasada")
  - Margem Média (média de Percentual_Margem)

### Kanban Operacional

- Tabela: Tarefas
- Tipo: Kanban
- Agrupar por: Status
- Colunas: "Não Iniciada" → "Em Andamento" → "Aguardando Cliente" → "Concluída"

### Timeline de Prazos

- Tabela: Tarefas
- Tipo: Calendário
- Campo de Data: Data_Vencimento

### Painel Comercial

- Tabela: Propostas
- Tipo: Table/Gallery
- Filtros disponíveis: Status, Plano_Proposto, Data_Proposta
- Colunas visíveis: Cliente, Plano, Valor, Status, NPS

### Análise de Rentabilidade

- Tabela: Faturamento_Mensal
- Tipo: Table
- Ordenar por: Percentual_Margem (descendente)
- Colunas: Cliente, Mês, Receita, Margem_Líquida, Percentual_Margem

---

## 🔔 PASSO 5: Configurar Automações

### Alerta: Tarefa vencida em 3 dias

```
IF: Data_Vencimento = HOJE + 3 dias
THEN: Notificar responsável via Email/Slack
```

### Alerta: Tarefa vencida HOJE

```
IF: Data_Vencimento = HOJE
THEN: Notificar urgente + @mention no Slack
```

### Proposta Aceita = Gerar Tarefa

```
IF: Status da Proposta muda para "Aceita"
THEN: Criar Tarefa tipo "Onboarding" com Data_Vencimento = Data_Aceita + 5 dias
```

### Flag NPS Baixo

```
IF: NPS_Score < 7
THEN: Adicionar tag "Satisfação Baixa" no Cliente
```

---

## 🔗 PASSO 6: Integração Omie

1. Vá em Configurações do Skip → Integrações
2. Conecte com Omie API
3. Configure sincronização:
   - Campo Skip: `Receita` (em Faturamento_Mensal)
   - Campo Omie: Receita do mês
   - Frequência: 1x ao mês (final do mês)
   - Mapeamento: CNPJ cliente → CNPJ no Omie

4. Teste o sync com um cliente

---

## 📁 PASSO 7: Estrutura Google Drive

Crie a seguinte estrutura:

```
Google Drive (raiz)
└── MB-Skip-Documentos/
    ├── Comércio XYZ Eireli/
    │   ├── Livro Caixa/
    │   ├── Documentação Fiscal/
    │   └── Declarações/
    ├── Construtora Visão Eireli/
    │   ├── Livro Caixa/
    │   ├── Documentação Fiscal/
    │   └── Declarações/
    └── [Próximos clientes...]
```

No Skip, salve o link da pasta raiz `MB-Skip-Documentos` no campo de configuração.

---

## ✅ Checklist de Implementação

- [ ] 4 tabelas criadas (Clientes, Tarefas, Propostas, Faturamento)
- [ ] Dados importados sem erros
- [ ] Relacionamentos validados
- [ ] 5 views criadas e funcionando
- [ ] Automações configuradas
- [ ] Integração Omie testada
- [ ] Estrutura Google Drive criada
- [ ] Time MB treinado no uso do Skip
- [ ] Dashboard executivo acessível
- [ ] Notificações funcionando

---

## 🎯 Próximos Passos Após Go-live

### Primeira Semana

- [ ] Monitorar utilização do sistema
- [ ] Resolver dúvidas do time
- [ ] Corrigir bugs / ajustar layouts

### Primeira Mês

- [ ] Revisar uso de cada view
- [ ] Verificar se as notificações estão chegando
- [ ] Ajustar filtros/sorting conforme necessário

### Primeira Trimestre

- [ ] Adicionar novas automações
- [ ] Expandir estrutura conforme crescimento
- [ ] Analisar dados: margem média, churn, NPS

---

## 📞 Suporte

Se tiver dúvidas na importação:

1. Verifique a coluna de erro (Skip mostra qual linha falhou)
2. Verifique se o tipo de dado está correto (ex: data em formato YYYY-MM-DD)
3. Verifique se os links estão corretos (nomes de cliente devem bater exatamente)

---

**Pronto para começar? Faça upload dos CSVs e do JSON ao Skip e comece a centralizar! 🚀**
