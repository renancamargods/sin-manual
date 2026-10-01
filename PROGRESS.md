# PROGRESS — S.I.N Manual (handoff)

Manual do usuário do **S.I.N Implant System** — Astro + MDX + Tailwind. Este arquivo é o
resumo de estado para continuar em outra sessão sem reler todo o histórico.
Ler junto: `CLAUDE.md` (padrões do projeto) e a memória `sin-manual-project.md`.

_Última atualização: 2026-09-30._

## Como rodar (Node portátil)
```
$env:PATH = "C:\Users\renan.camargo\Downloads\node-v24.18.1-win-x64\node-v24.18.1-win-x64;" + $env:PATH
npm.cmd run dev -- --host 127.0.0.1 --port 4321 --strictPort
```
- Sempre porta **4321**. Build: `npm.cmd run build` (derrubar o dev antes; rodar os dois juntos trava/crash libuv).
- **Nunca commitar/push — quem faz é o usuário.** Ele revisa cada página no 4321 antes do commit.
- Publicação: GitHub Desktop → push → Cloudflare reconstrói.

## Regras que NÃO podem se perder
- **Bilíngue:** toda página PT tem gêmea EN em `src/content/docs/en/...` (`lang: 'en'`, mesmo `section`/`routeSlug`). Imports EN = +1 nível.
- **Navegação central:** `src/data/modules.ts` — `modules[].routines`, `tecnicoPages`, e dicts EN no fim (`routineTitleEn`, `tecnicoSubEn`, `tecnicoGroupEn`, `moduleEn`). Toda tela/subpágina nova precisa ser registrada.
- **DocControl** assinado "Renan Camargo" + data da conversa (Revisado/Aprovado = "A definir").
- **Não inventar** campos/regras. Nomes reais entre aspas. Comentado/desativado no código NÃO entra.
- **HML só leitura** (Claude in Chrome): nunca Salvar/Excluir/Aprovar; só capturar estrutura, sem dado pessoal.
- **Não colar segredos** (IPs de BD, senhas, tokens) nas páginas — só estrutura/finalidade.

## Fontes da verdade
- Código do sistema (SIN-Sales): `C:\Users\renan.camargo\Desktop\SIN-Sales`
  - Validators (regras de campo): `CrmSin.Domain.Entities/<Modulo>/Validators/*Validator.cs` (FluentValidation)
  - Rotas de tela: `@page` nos `.razor` de `CrmSin.SPA.Blazor/<Modulo>/...`
- HML: `https://crmsinhml.sinimplantsystem.com/Web/<Modulo>/<Tela>` (login "renan", Homologação)

## Estado atual da cobertura
- **Módulos:** 168 telas documentadas. Restam **9 indisponíveis** (não têm `@page` no sistema — dão "Página não encontrada"): Serviço Agendado, Execução de Serviço Agendado, Fila de Aprovações - Contratos, Buscar Remessa, Caixas do Pedido, Nova Fila de Aprovação - Pedidos (virou a mesma "Fila de Aprovações - Pedidos"), Log de Faturamento SAP, Pedido para Integração, Formulário Agenda. → nada a fazer até a dev publicá-las.
- **Doc. Técnicas e Configurações** (tudo atrás de senha, Basic Auth no Worker):
  Mapa de Fluxos · Fluxos (~23) · De Para (161 enums) · APIs · Migrations (945) · Parâmetros · Permissões · Templates · Banco de Dados · **AZURE** · **Regras de Validação (20 telas)**.

## Feito nas sessões recentes
- **AZURE** (grupo técnico): Abertura de BUG, Abertura de Melhoria/PBI (modelo de prompt + campos obrigatórios do Azure DevOps).
- **Fluxos novos:** Simular Pagamentos em Homologação (QA), Motor de Crédito (R006), Verificar a Decisão do Motor de Crédito (QA).
- **Regras de Validação** (grupo `tecnico/regras-de-validacao`, dos Validators reais): Cliente, Pedido, Lead, Contrato, Fechamento de Consignado, Produto, Orçamento, Trocas/Devoluções (TDC), Política Comercial, Condição de Pagamento, Ocorrência, Empresa, Lounge, Mensagem Personalizada, Usuário, Regra de Aprovação, Entidade de Aprovação, Refugo, Registros, Cadastros Base.
- **Telas de módulo destravadas** (liam no HML, tiradas do "indisponível"): Inventários Disponíveis, Agenda.
- **Fix de UI:** removido `overflow-hidden` do `<header>` em `src/components/Hero.astro` — o dropdown da busca não corta mais (valia pra todas as páginas).
- Ignition on/off documentado (Controle de Funcionalidade + fluxos Sem/Com Ignition): chaves `Fila.Clientes.SemIgnition` / `Fila.Pedidos.SemIgnition` (Habilitada = usa a nova fila SEM Ignition).
- Busca: índice público (sem `tecnico`) + índice gated `/tecnico/search-index.json`, mesclados no `SearchBox.astro`.
- Sidebar/home: grupo técnico sem página-índice não dá mais 404 (nome só expande / aponta pro 1º submódulo).

## Próximos passos possíveis
1. **Mais QA/HML** no estilo "Simular Pagamentos" (reprocessar SAP, gerar pedido pela Ocorrência PFCQ…) — **precisa do passo-a-passo/print do usuário** (não inventar).
2. **Regras de Validação** para mais telas (baixo valor restante: sub-entidades como Contato/Endereço/Telefone do cliente, item de X, feature-flags Fiscal, etiquetas regulatórias; vários validators vazios).
3. Revisar as 9 telas indisponíveis quando a dev publicá-las.
4. Bot do manual (busca/dúvidas/sugestão) — estimativa dada; começar por form de sugestão → Worker; depois RAG sobre o índice respeitando a senha.

## Pendências pontuais
- Nada bloqueante. Tudo em 200 no último build; aguardando o usuário revisar no 4321 e commitar.
