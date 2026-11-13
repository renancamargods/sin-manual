# Auditoria cruzada — Manual de Processos SIN × Código .NET (SIN-Sales)

_Data: 2026-11-13 · Manual: `sin-manual` (publicado em sin-manual.eng-renancamargodasilva.workers.dev) ·
Código: `C:\Users\renan.camargo\Desktop\SIN-Sales` (.NET/C#, Blazor, DDD) · Base: código vivo._

## Fechamento do grupo C (2026-11-13)

Confirmados no HML (logado, só leitura) os candidatos a "tela ausente". **4 eram telas reais de usuário e foram documentadas** (PT+EN, registradas no `modules.ts`, build 200):
- Fiscal → **Memória de Cálculo Fiscal** (`modulos/fiscal/memoria-de-calculo-fiscal`)
- Faturamentos → **Análise de Consignado** (`modulos/faturamentos/analise-de-consignado`)
- Faturamentos → **Monitor SAP Consignado** (`modulos/faturamentos/monitor-sap-consignado`)
- Faturamentos → **Relatório de Remessas** (`modulos/faturamentos/relatorio-de-remessas`)

`RelatorioOPL` já existia (`faturamentos/relatorio-operador-logistico`). As 5 restantes (`Invoice`, `FresaDoConjunto`, `ImplanteDoConjunto`, `DadosPaciente`, `ResultadoAnalise`) abrem **de dentro de um pai** → ficam como sub-entidade (campo/regra da tela-pai), não viram página. **Cobertura de telas de usuário: efetivamente 100%.**

---

## Resumo executivo

- **Cobertura boa das telas de usuário**, mas há **ruído de nomes** entre sistema e manual (o sistema diz
  "Centro", o manual diz "Lounge"; PascalCase × kebab) que precisa de um **de-para oficial**.
- **233 rotas `@page`** no sistema × **170 telas** no manual. O delta **não** são 63 telas faltando: ~metade
  são **sub-entidades** (coleções-filhas com CRUD próprio, ex.: `ContatoDeCliente`, `ItemPrePedido`) que o
  manual documenta como **campos/regras dentro da tela-pai**, não como tela de menu; a outra parte é
  **diferença de nome** (mesma tela).
- **Integrações** bem cobertas no nível de usuário (SAP, Ignition, ClearSale, Serasa, ZapSign, Freshdesk,
  PayGo). Faltam só as de **infra** (Hangfire, SignalR, GraphQL como camada) — aceitável ficarem no técnico.
- **Fluxos de processo** (pedido, aprovação sem/com Ignition, motor de crédito) estão alinhados ao .NET.

---

## Frente 1 — Cobertura de módulos e telas (arquitetura)

**O que mudou (divergente/obsoleto):**
- **Ruído de nomenclatura sistema × manual** (mesma tela, nome diferente) — precisa padronizar:
  - `Administrador/AmarracaoDeFaturamentoPorCentro` (código) ↔ "Amarração de Faturamento por **Lounge**" (manual)
  - `ControleFuncionalidade` ↔ `controle-de-funcionalidade`; `ConciliacaoPix` ↔ "Conciliadora PIX";
    `ChaveValorConfig` ↔ "Chave e Valor"; `DominioAnexo` ↔ "Domínio de Anexo";
    `IncotermEntrega` ↔ "Incoterm"; `ModuloNegocio` ↔ "Módulo de Negócio";
    `PortoDestinoComex` ↔ "Porto de Destino"; `TipoDeAnexo` ↔ "Tipos de Anexo"; **Centro ↔ Lounge** (sistêmico).
  - São **a mesma tela** — não são gaps; são inconsistências de rótulo a reconciliar.

**Gaps (no código, candidatos a faltar no manual — a confirmar tela a tela):**
- **Sub-entidades com page própria** (o manual trata como regra/campo da tela-pai; decidir caso a caso se
  viram página): Clientes → `ContatoDeCliente`, `TelefoneDeCliente`, `Socio`, `DadoFinanceiro`,
  `ObservacaoDoCliente` (regras já documentadas em *Regras de Validação*); Pedidos → `ItemPrePedido`,
  `ItemNotaFiscal`, `ItemDataMatrix*`, `PedidoInformacaoDePagamentoMisto`, `ObservacaoDoCredito`;
  Contratos → `ItemDeComodato`, `DescontoDoContrato`, `ParticipanteDeCurso`; Políticas → `ItemDeCampanha`,
  `ItemDePoliticaComercial`.
- **Telas de usuário plausivelmente ausentes (verificar):** Administrador → `Logradouro`,
  `Questao`/`RespostaPreDefinida` (do módulo Questionários), `EnderecoPortugal`, `ImagemDePais`;
  Fiscal → `MemoriaDeCalculoFiscal`; Ocorrências → `DadosPaciente`, `ResultadoAnalise`,
  `SolicitacoesHandsonProduto`; Produtos → `FresadoConjunto`, `ImplanteDoConjunto`, `DocumentoDeProduto`;
  Inventários → `Contagem` (execução por scanner DataMatrix — provavelmente intencionalmente só nos fluxos).

**O que atualizar (proposta):**
- Criar um **de-para oficial `rota .NET → página do manual`** (resolve o ruído de nome e serve de índice de
  cobertura). Já consigo gerar a partir das `@page` × `modules.ts`.
- Padronizar **Centro vs Lounge** em todo o manual (seguir o que a UI final exibir; hoje o código ainda tem
  "Centro" em várias rotas — alinhar com a dev).
- Rodar a lista de "plausivelmente ausentes" tela a tela e documentar as que forem de menu/usuário.

---

## Frente 2 — Padrão de escrita das páginas (consistência documental)

**O que mudou (divergente/obsoleto):**
- Nenhuma divergência estrutural grave: o padrão do `CLAUDE.md` (Visão geral → Campos → Fluxos →
  Controle do documento) está seguido. A inconsistência real é a de **nomenclatura** (Frente 1).

**Gaps (existe, mas vale reforçar):**
- **Bilíngue PT/EN: 261/261 páginas com par** (verificado) — sem órfãs. Manter a regra ao criar telas novas.
- Regras de validação sincronizadas com os `*Validator.cs` (feito no ciclo recente para Cliente, Controle de
  Funcionalidade, Política de Contrato, Regras de Pagamento, Parâmetros de Pedidos por Produto/Filial).

**O que atualizar (proposta):**
- Ao fechar o de-para, aproveitar para **renomear títulos** divergentes (Lounge/Centro etc.) de uma vez.
- Manter o método já provado: **toda mudança de `*Validator.cs` no .NET → espelhar na página de regras**
  (auditável por `git diff` dos Validators).

---

## Frente 3 — Integrações e contratos

**O que mudou (divergente/obsoleto):**
- Sem divergência conceitual: as integrações de usuário estão descritas.

**Gaps (no código, pouco/nada no manual):**

| Integração | Arquivos no .NET | Páginas no manual | Situação |
|---|---:|---:|---|
| SAP (faturamento/estoque) | ~2933 | 50 | OK (fluxos + técnico) |
| GraphQL (camada de API) | ~3994 | 2 | Infra — só técnico, ok |
| Ignition (fila/aprovação) | ~1331 | 24 | OK (on/off documentado) |
| ZapSign (assinatura) | ~949 | 7 | OK |
| Freshdesk (ticket/suporte) | ~823 | 7 | OK |
| Serasa (crédito) | ~634 | 8 | OK |
| ClearSale (antifraude) | ~584 | 9 | OK |
| PayGo (gateway cartão) | ~60 | 5 | OK |
| **Hangfire** (jobs em background) | ~259 | 0 | **Não documentado** (infra) |
| **SignalR** (estado compartilhado) | ~94 | 0 | **Não documentado** (infra) |

**O que atualizar (proposta):**
- Deixar como está no nível de usuário. Se quiser completude técnica, adicionar em `/tecnico` uma página
  "Integrações & Jobs" cobrindo **Hangfire** (o que roda em background: faturamento SAP, etc.) e **SignalR**
  (estado compartilhado em tempo real) — ambos atrás da senha.
- Conferir **PagarMe/PIX** (o grep direto falhou por escaping): a página *Simular Pagamentos* já cita
  PagarMe/PIX — validar se o gateway atual é PayGo, PagarMe ou ambos e alinhar o texto.

---

## Frente 4 — Processos de negócio (fluxos)

**O que mudou (divergente/obsoleto):**
- Alinhado. Os fluxos do manual batem com o .NET (sincronizados recentemente): Processo do Pedido
  (partes Itens/Pagamento/Políticas), Aprovação Sem/Com Ignition, Motor de Crédito (R006).

**Gaps (no código, ampliar no manual):**
- **Motor de Crédito sequencial (R006_v2)**: o .NET percorre TODOS os critérios (1ª parada = determinante,
  Parecer Final). Confirmar se a página do Motor de Crédito reflete o motor **sequencial** atual (e não o
  antigo que parava na 1ª decisão).
- **Roteamento de alçadas** (PF → Crédito; PJ → Crédito+Fiscal; PE → Comex) e os status finais por forma de
  pagamento (Boleto→Integrado; Cartão/PIX→Aguardando Pagamento): confirmar no fluxo de Aprovação.

**O que atualizar (proposta):**
- Revisar a página do **Motor de Crédito** contra `AnalisePedidoAppService` / motor R006_v2 no .NET.
- Fechar o mapa de **alçadas × tipo de pessoa × operação** no fluxo de Aprovação.

---

## Próximos passos recomendados (ordem de valor)

1. **De-para `rota .NET → página do manual`** (resolve Frente 1 e o ruído de nomes de uma vez). Gerável agora.
2. **Padronizar Centro/Lounge** e os títulos divergentes no manual.
3. ~~**Verificar os candidatos a "tela ausente"**~~ ✅ **Feito (13/11)** — ver "Fechamento do grupo C" no topo.
4. **Revisar Motor de Crédito e alçadas** (Frente 4) contra o .NET atual.
5. (Opcional) Página técnica "Integrações & Jobs" (Hangfire/SignalR) atrás da senha.

> Nota de método: os números vêm de `@page` nos `.razor` do SIN-Sales × arquivos `.mdx` do manual,
> normalizados por módulo. O delta bruto (233×170) superestima lacunas por causa de sub-entidades e
> diferença de nome — por isso a leitura acima separa "mesma tela, outro nome" de "tela realmente ausente".
