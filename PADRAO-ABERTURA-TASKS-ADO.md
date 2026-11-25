# Padrão de abertura de tasks no Azure DevOps (CRM S.I.N.)

Guia para abrir **Bugs (Correção)** e **PBIs (Melhoria)** no Azure DevOps do CRM S.I.N.
Use as ferramentas do MCP `azure-devops` (`wit_work_item*`, `wit_work_item_attachment*`).

- **Org:** `sinimplantsystem`
- **Project:** `Projetos Sin - Scrum`
- Todo item é **filho (Child) de um EPIC de módulo** (nunca criar solto).

O usuário normalmente manda em blocos: **módulo/tela**, **Correção ou Melhoria**, **o problema** e, às vezes, **uma foto**.

---

## 1. Bug × PBI — qual é qual

| | **Bug** | **PBI** |
|---|---|---|
| Quando | Erro / comportamento errado | Melhoria / nova funcionalidade |
| `System.WorkItemType` | `Bug` | `Product Backlog Item` |
| Campo do texto | `Microsoft.VSTS.TCM.ReproSteps` (HTML) | `System.Description` (HTML) |
| `Custom.Demand` | `Correção` | `Melhoria` |
| Conteúdo | erro + passo a passo + evidência | doc de requisito de PO (critérios de aceite etc.) |

Os dois: Parent = EPIC do módulo, State inicial `New`, título no padrão `Módulo > Tela > resumo`.

---

## 2. Fluxo (via MCP)

1. **Criar:** `wit_work_item_write` action `create` (campos = **array** de `{name, value, format?}`).
2. **Vincular ao EPIC:** `wit_work_item_link_write` action `link`, `updates: [{id: <novo>, linkToId: <EPIC>, type: "parent"}]`.
3. **Setar o Ticket com o próprio nº:** `wit_work_item_write` action `update`, `updates: [{op:"add", path:"/fields/Custom.Ticket", value:"<nº do item>"}]`.
4. **Anexar foto (se houver):** ver seção 6.

> `update` usa **JSON-Patch** (`updates`, não `fields`). `create` usa **array de campos** (`fields`). Não trocar.

---

## 3. Campos (reference names exatos)

| Campo | Valor |
|---|---|
| `System.Title` | `Módulo > Tela > resumo` (seção 4) |
| `System.State` | `New` |
| `System.AreaPath` | `Projetos Sin - Scrum` |
| `System.IterationPath` | `Projetos Sin - Scrum` |
| `Custom.Demand` | `Correção` (bug) **ou** `Melhoria` (PBI) |
| `Custom.RequestDate` | hoje, formato `2026-11-09T13:00:00Z` |
| `Custom.RequestingUser` | `Renan Camargo` |
| `Custom.Ticket` | nº do chamado externo (Freshdesk/atendimento) se houver; **se não houver, o nº da própria tarefa** (Bug/PBI) |
| `Custom.Department` | `Desenvolvimento` |
| `Custom.Board` | `Tecnologia` |
| Texto (Bug) | `Microsoft.VSTS.TCM.ReproSteps`, `format: "Html"` |
| Texto (PBI) | `System.Description`, `format: "Html"` + `Microsoft.VSTS.Common.Priority` (ex.: 3) e `Severity` (ex.: `3 - Medium`) |

---

## 3b. Guia de campos por rótulo da tela (com exemplo real)

Os mesmos campos da seção 3, pelos **rótulos que aparecem no formulário do ADO**, com um exemplo preenchido de uma tarefa real.
**Ticket:** quando o pedido **não** veio de um chamado externo (Freshdesk/atendimento), o Ticket é o **número da própria tarefa** (Bug/PBI).

### Bug — exemplo: [Bug 5079](https://dev.azure.com/sinimplantsystem/Projetos%20Sin%20-%20Scrum/_workitems/edit/5079) · `Administrador > Campo de Validação > acentuação: 'Tipo de Análise'`

| Campo | O que preencher | Exemplo (Bug 5079) |
|---|---|---|
| State | O estado do item — no create é `New`. | New |
| Area | `Projetos Sin - Scrum`. | Projetos Sin - Scrum |
| Iteration | `Projetos Sin - Scrum`. | Projetos Sin - Scrum |
| Repro Steps | O texto do reporte gerado pelo prompt (as 6 seções). | 6 tópicos: título `Administrador > Campo de Validação > acentuação: 'Tipo de Análise'` + URL, descrição, passo a passo, esperado, ajuste, evidência |
| Demand | A demanda relacionada. | Correção |
| Request Date | A data da solicitação. | 12/11/2026 |
| Requesting User | O usuário que está solicitando/reportando. | Renan Camargo |
| Ticket | Se houver ticket de suporte (Freshdesk/atendimento), o número do ticket; **se não houver, o número da própria tarefa**. | 5079 |
| Department | O departamento responsável. | Desenvolvimento |
| Board | O board/quadro de destino. | Tecnologia |
| Priority / Severity | Prioridade e severidade do erro. | 3 / 4 - Low |

### PBI — exemplo: [PBI 5099](https://dev.azure.com/sinimplantsystem/Projetos%20Sin%20-%20Scrum/_workitems/edit/5099) · `Faturamentos > Fila de Remessa Aguardando Separação > Alerta de Pedidos Acima de 10k e Transportadora SEDEX`

| Campo | O que preencher | Exemplo (PBI 5099) |
|---|---|---|
| State | O estado do item — no create é `New`. | New |
| Area | `Projetos Sin - Scrum`. | Projetos Sin - Scrum |
| Iteration | `Projetos Sin - Scrum`. | Projetos Sin - Scrum |
| Description | A documentação de requisito gerada pelo prompt. | Doc de PO: contexto, critérios de aceite (Dado-Quando-Então), regras do alerta de pedidos acima de R$ 10k com transportadora SEDEX |
| Demand | A demanda relacionada. | Melhoria |
| Request Date | A data da solicitação. | 12/11/2026 |
| Requesting User | O usuário que está solicitando. | William Costa |
| Ticket | Se houver ticket de suporte (Freshdesk/atendimento), o número do ticket; **se não houver, o número da própria tarefa**. | 5099 |
| Department | O departamento responsável. | Desenvolvimento |
| Board | O board/quadro de destino. | Tecnologia |
| Priority / Severity | Prioridade e severidade da melhoria. | 1 / 1 - Critical |

---

## 4. Título — `Módulo > Tela > resumo`

- Sempre **3 níveis**: **Módulo** (nome do EPIC) > **Tela** (a tela real, não um campo/coluna) > **resumo**.
- **Módulo/Tela = ONDE O ERRO ESTOURA** (a tela que o usuário usava), não onde mora a config/dado. Ex.: um erro que aparece montando um **Pedido** é `Pedidos > Pedido > ...`, mesmo que o cálculo venha de uma Política. O EPIC pai acompanha o módulo onde estoura.
- **Se a tela mostra um erro estourado, o título TERMINA com o erro:** `... - mensagem: <texto exato>`. Ex.: `... - mensagem: Attempted to divide by zero` / `... - mensagem: Acesso negado ao campo 'listar'`. (Só para erro de verdade; bug de lógica sem mensagem não precisa.)
- **Simples e sem jargão** no título (sem sigla, caixa-alta, rota ou nome de classe) — isso vai no ReproSteps. Qualquer usuário entende e reproduz só pelo título.
- 2º nível tem que ser uma **TELA**, não campo nem bloco de coluna.

---

## 5. ReproSteps (Bug) — HTML fixo

Cada cabeçalho em **negrito 17px**; conteúdo em `<div>`; `<div><br></div>` entre tópicos. Dentro do texto: `&gt;` para `>`, `&quot;` para aspas, `&apos;` para `'`.

Tópicos:
1. **Título - Reporte** → repetir o título e, na linha de baixo, `URL da tela: https://crmsinhml.sinimplantsystem.com/Web/<rota>` (pegar a rota real navegando no CRM).
2. **Descrição do Erro** → o que acontece; pode entrar o detalhe técnico.
3. **Passo a Passo para Reprodução** → **uma linha (um `<div>`) por passo**, terminando com `Resultado: ...`. Registrar **filtro/massa exatos** (coluna + valor + consultor/cliente) quando a tela tem filtros.
4. **Comportamento Esperado**.
5. **Possível Ajuste (Sugestão Técnica)** → arquivo/linha/classe + correção sugerida.
6. **Evidência** → só se tiver foto, texto exato: `Ver imagem anexada (aba Attachments).`

Modelo de cabeçalho:
```html
<div><span style="font-size:17px"><b>1 - Título - Reporte</b></span></div>
<div>Módulo &gt; Tela &gt; resumo.</div>
<div>URL da tela: https://crmsinhml.sinimplantsystem.com/Web/&lt;rota&gt;</div>
<div><br></div>
```

---

## 6. Anexo de imagem

**REGRA PRINCIPAL (pedido do Renan, 10/11/2026): NÃO anexar via MCP.** No card, deixe o tópico 6 Evidência com "Ver imagem anexada" e **passe a imagem no chat (`SendUserFile`) informando o número da task** — o usuário mesmo arrasta pra aba Attachments. Gere a evidência em arquivo limpo (sem padding), qualidade alta / resolução nativa (screenshot completo e/ou recorte legível), e envie com caption citando a task. É instantâneo e sem risco. Motivo: o upload inline do MCP anda truncando os anexos de forma imprevisível (de ~17,5k chars até cortar um JPG de 4KB para 3,4KB), virou vai-e-volta lento.

---
**FALLBACK — só se o usuário pedir pra eu anexar via MCP:**

1. `wit_work_item_attachment_upload` → `{project, fileName, content: <base64>}` → devolve `url`.
2. `wit_work_item_attachment_link` → `{project, workItemId, attachmentUrl, comment}`.

Gotchas:
- **Formato JPG** para prints (o dev baixa). `.png` serve para imagem de código (sintética, nítida).
- `content` é **base64 inline** com um **TETO de ~17,5k chars**: acima disso o upload **corta todo o excedente** (JPEG parcial, sem `FF D9`); abaixo ainda há micro-jitter de ~12–24 bytes no fim. O Read de linha única trunca acima de ~22k chars. Alvo: **b64 ≤ ~16,5k chars** (JPG ≤ ~12KB). **NÃO encolha a resolução** (usuário reclama de imagem borrada) — mantenha a **nativa** e ajuste só a **qualidade JPEG** até caber (ex.: 335×261 → q55 ≈ b64 16,3k). **Blindagem:** JPG terminando em `FF D9` + **~400–600 bytes de padding `0x00` DEPOIS do EOI** (o decoder ignora bytes pós-EOI, o jitter come só padding). E **SEMPRE verifique antes de vincular**: baixe o anexo (`wit_work_item_attachment`, savePath relativo) e confirme que **decodifica** (`[System.Drawing.Image]::FromFile` → W×H) e acha `FF D9`; só o tamanho não basta.
- **webp não abre no GDI+** (System.Drawing dá "Memória insuficiente"): converter com WIC (`[System.Windows.Media.Imaging.BitmapDecoder]` de `PresentationCore`) → `JpegBitmapEncoder`.
- **Verifique ANTES de vincular — nunca vincule e depois confira.** Se vincular primeiro e a imagem estiver truncada, você remove o anexo e ele **não some**: vai pra lista **"Deleted attachments"** (recuperável) e o `permanently delete` **só existe na UI** (o MCP não tem essa tool). Isso deixa resíduo no card e sobra pro usuário limpar. Fluxo certo: upload → baixar/decodificar OK → **só então** `_link`. Um upload bom = zero remoção = zero resíduo.
- Para **trocar** um anexo ruim já vinculado: suba/vincule o novo e remova o antigo com `update` `{op:"remove", path:"/relations/<idx>"}` (o `<idx>` é a posição do `AttachedFile` no array `relations` do item — pegue com um `wit_work_item` get). O removido ainda ficará em "Deleted attachments" até o usuário dar `permanently delete` na UI.

---

## 7. PBI (Melhoria) — o que muda

- `System.WorkItemType` = `Product Backlog Item`; texto em `System.Description` (não ReproSteps); `Custom.Demand` = `Melhoria`; setar `Priority` + `Severity`.
- **A Description vem SEMPRE do prompt de PO abaixo** — rode-o mentalmente e entregue o doc pronto:

> Aja como um Product Owner (PO) / Analista de Requisitos sênior e escreva uma documentação de requisito de software detalhada, pronta para virar um PBI no Azure DevOps. Entregue: **Título do PBI**, **Descrição/Contexto**, **Critérios de Aceite (formato Dado-Quando-Então)**, **Regras de Negócio e Validações**, **Fora de Escopo**, **Dependências/Impactos**, **Observações Técnicas**.

- Estilo HTML (igual ao modelo PBI **4695**): seções numeradas `<h1><strong><span>N - Título</span></strong></h1>` + `<hr>` entre elas, com `<p>/<ul><li>`.

---

## 8. EPICs por módulo (parent IDs)

Produtos=**546** · Autenticador=**895** (tela Usuário/Home/Favoritos) · Regulatórios=**449** · Administrador=**1266** (tela Lounge) · Cliente/Clientes=**269** · Usuário=**270** · Pedido=**272** · Planejamento de Vendas=**448** · Anexos=**450** · Políticas=**538** · Gestão de Leads=**544** · Módulo de Contratos=**551** · Aprovações=**4296** · Faturamentos=**3700** · Inventário=**1283**
Frente de Lounge: Relatórios=255 · Trocas e Devoluções=256 · Picking=257 · Fechamento de Consignado=458 · OPL=1265.

Para outro módulo, achar o EPIC por WIQL (`wit_query`):
`SELECT [System.Id],[System.Title] FROM WorkItems WHERE [System.WorkItemType]='Epic' AND [System.Title] CONTAINS '<modulo>'`

---

## 9. Checklist antes de dar por pronto

- [ ] É Child de um EPIC de módulo (parent setado).
- [ ] Título `Módulo > Tela > resumo`, 2º nível é tela de verdade, sem jargão; termina com a mensagem se a tela mostrou erro.
- [ ] Demand certo (Correção/Melhoria); RequestDate = hoje; RequestingUser = Renan Camargo; Department=Desenvolvimento; Board=Tecnologia; State=New.
- [ ] Bug: ReproSteps com os 6 tópicos (cabeçalho negrito 17px; tópico 1 com título + URL; passo a passo uma linha por passo; filtro/massa exatos). PBI: Description do prompt de PO.
- [ ] Foto anexada (quando houver) e tópico 6 só com foto.
- [ ] `Custom.Ticket` = nº do próprio item depois de criado.
