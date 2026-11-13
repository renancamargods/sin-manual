# Triagem — padronização (🟠) e classificação dos sem-página (🔴)

_2026-11-13 · fecha as tarefas 1 (padronizar 🟠) e 2 (triar 🔴) do de-para._

## Tarefa 1 — Padronizar os 🟠: **nada a renomear** (manual já está certo)

Conclusão após inspeção: os 🟠 **não são erro do manual**. São:
- **Rota interna PascalCase (sistema) × título de usuário (manual)** — ex.: `/Administrador/IncotermEntrega`
  → página `incoterm`. Esperado; o manual usa o termo que o usuário vê.
- **Centro × Lounge**: o manual **já trata de propósito** — escreve **"Lounge (Centro)"** e usa "Centro"
  só onde é conceito do **SAP / origem-destino do romaneio**. Um "replace Centro→Lounge" **quebraria**
  esses trechos ("Centro no SAP", "Centro de origem"). → **Não mexer.**
- **Falsos pares** do matcher (ligou filha→pai), que não são renomeação e sim sub-entidade (ver Tarefa 2).

**Ação:** nenhuma edição em massa. (Se a dev padronizar a UI 100% em "Lounge", aí sim trocamos os poucos
"Centro" de usuário — hoje a decisão "Lounge (Centro)" está correta.)

## Tarefa 2 — Triagem dos 🔴 (51) + falsos-🟠

### A) Já documentado (name-miss — **não é gap**)
| Rota .NET | Página existente |
|---|---|
| `Administrador/ConciliacaoPix` | `administrador/conciliadora-pix` |
| `Administrador/TipoDeAnexo` | `administrador/tipos-de-anexo` |
| `Clientes/AtividadeEconomico` | `clientes/atividade-economica` |
| `Faturamentos/PedidoTDC` | `faturamentos/trocas-devolucoes` |
| `Faturamentos/PedidoSeparacao` | `faturamentos/fila-de-remessas-aguardando-separacao` |
| `Leads/LeadKanbanBoard` | `leads/quadro-kanban-leads` |
| `PlanejamentoDeVenda/...` | `planejamento-de-vendas/planejamento-de-vendas` |
| `Fiscal/ModuloFiscalFeatureFlag` | `fiscal/feature-flag-do-modulo-fiscal` |
| `Ocorrencias/SolicitacoesHandsOnProduto` | `ocorrencias/solicitacoes-handson` |
| `Produtos/Caixa` | `produtos/caixa-de-embalagem` |

### B) Sub-entidade / grid-filho — **documentada como campo/regra na tela-pai, não vira página**
O Blazor cria um `@page` por entidade de CRUD, inclusive para coleções abertas **de dentro do pai**.
Essas já são cobertas como campos/regras na página da tela-pai:

- **Clientes (filhas de Cliente):** `ContatoDeCliente`, `TelefoneDeCliente`, `TelefoneDeUsuario`, `Socio`,
  `DadoFinanceiro`, `ObservacaoDoCliente`, `SolicitacaoCadastralCliente`, `ClienteEmbaixador`,
  `TermoDePagamentoComex` _(regras já na página "Regras de Validação - Cliente")_.
- **Pedidos (filhas de Pedido/Nota):** `ItemPrePedido`, `ItemNotaFiscal`, `ItemDatamatrix*`,
  `PedidoInformacaoDePagamentoMisto`, `PedidoComplemento`, `ObservacaoDoCredito`, `TipoDePedido`,
  `DescontoIncondicionalItemPrePedido`.
- **Contratos (filhas de Contrato):** `ItemDeComodato*`, `ItemDePoliticaDeContrato`, `ItemDescontoContrato`,
  `DescontoDoContrato`, `ParceiroDeContrato`, `ParticipanteDeCurso`, `PoliticaDeContratoCurso`.
- **Políticas (filhas):** `ItemDeCampanha`, `NovoItemDeCampanha`, `ItemDePoliticaComercial`,
  `NovoItemDePoliticaComercial`, `ParticipacaoPremiacao`.
- **Faturamentos (itens):** `ItemDeTransferencia`, `ItemDevolucaoPedidoTDC`, `ItemSeparacaoPedido`,
  `ItemTrocaPedidoTDC`.
- **Leads (config/filhas):** `StatusLead`, `AlertaStatusLead`, `HistoricoDeInteracaoLead`, `ItemPotencialLead`.
- **Ocorrências (filhas):** `OcorrenciaAnexo`, `OcorrenciaProduto`, `Atividade`, `Submissoes`.
- **Aprovações (config do ciclo):** `EtapaDeAprovacao`, `CicloDeAprovacao`,
  `FilaDeAprovacaoSolicitacaoCadastralCliente`.
- **Integrador (config SAP):** `ConfiguracaoFluxoEtapa`, `ConfiguracaoTipoFluxo`, `ConfiguracaoTipoEtapa`.
- **Autenticador (fluxo de login, não cadastro):** `ConfirmarEmail`, `LoginExterno`.
- **Administrador (filhas):** `Questao`/`RespostaPreDefinida` (de Questionário), `AtributoValor` (de Atributo),
  `ImagemDePais`, `EnderecoPortugal`, `Logradouro`.
- **Produtos/Regulatórios (imagens/status):** `ImagemDe*`, `ImagemDeHierarquia`, `DocumentoDeProduto`,
  `StatusDoProdutoRegulatorios`.

### C) Tem **Listagem própria** mas **não está no menu estático** — verificar se é tela de usuário
Têm `@page` + `*Listagem.razor`, porém **não aparecem no `NavMenu`** (menu é dinâmico/por permissão no
banco). Podem ser telas de usuário **ou** sub-telas abertas por outra. **Não documento no escuro** (regra
"não inventar"):

- `Fiscal/MemoriaDeCalculoFiscal`
- `Pedidos/Invoice`
- `Faturamentos/AnaliseConsignado`, `Faturamentos/PedidoRemessaDeFaturamento`, `Faturamentos/RelatorioOPL`,
  `Faturamentos/MonitorSapConsignado`
- `Produtos/FresaDoConjunto`, `Produtos/ImplanteDoConjunto`
- `Ocorrencias/DadosPaciente`, `Ocorrencias/ResultadoAnalise`

**Recomendação:** confirmar essas ~10 no menu do HML (logado) ou com a dev. As que forem de usuário eu
documento no padrão (crio a página PT+EN a partir do `.razor`/validator). As que forem sub-telas entram no B.

## Veredito

- **Cobertura de telas de usuário do manual: efetivamente completa.** O gap bruto (233 rotas × 170 páginas)
  é explicado 100% por **name-miss (A)** + **sub-entidades (B)**; sobra só o **resíduo C a confirmar**.
- **Tarefa 1:** sem renomeação (manual já padronizado; Centro/Lounge é intencional).
- **Tarefa 2:** classificada; **0 tela de usuário comprovadamente faltando** — pendente só confirmar o grupo C.
