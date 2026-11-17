# Resumo do Manual S.I.N — para avaliação por IA

> Contexto para outra IA avaliar **o que temos, como temos e de onde vem**. Tudo abaixo descreve um produto real, em produção. Números conferidos no repositório em 17/11/2026.

---

## 1. O que é

Manual do usuário (e documentação técnica) do **S.I.N Implant System** — o CRM/ERP de vendas **SIN-Sales**, feito em **.NET + Blazor**. O manual é um **site estático bilíngue (PT/EN)** que documenta, tela a tela, o sistema real, e ainda traz **treinos guiados interativos** e um **assistente de IA** próprio.

- **Público:** usuários do CRM (dia a dia), suporte e desenvolvimento (seção técnica).
- **Objetivo:** documentar 100% das telas com fidelidade ao sistema real, treinar o usuário e dar suporte por IA — sem inventar nada.

---

## 2. Stack e como é feito

| Camada | Tecnologia |
|---|---|
| Site | **Astro 4.16** (static site generator) |
| Conteúdo | **MDX** (Markdown + componentes) em coleções de conteúdo |
| Estilo | **Tailwind CSS** (tema nas cores da marca S.I.N, vermelho) |
| Hospedagem | **Cloudflare Worker** (`src/worker.js`) servindo os assets de `dist/` |
| IA | **Cloudflare Workers AI** (cota grátis, sem chave externa/cartão) |
| Publicação | **GitHub Desktop → push → Cloudflare rebuild** (deploy automático) |

- **Build atual: ~902 páginas** geradas.
- **URL:** `https://sin-manual.eng-renancamargodasilva.workers.dev/`
- **Seção técnica protegida:** `/tecnico` e `/en/tecnico` ficam atrás de **Basic Auth** (senha em secret do Worker) — o resto é público.

### Arquitetura de conteúdo
- Páginas em `src/content/docs/` com frontmatter padronizado (`routeSlug`, `lang`, `section`, `module`, `title`, `description`, `keywords`…).
- Navegação central em **`src/data/modules.ts`** (lista de módulos, rotinas por módulo, rótulos EN). Toda tela nova é registrada aqui.
- **~22 componentes Astro** reutilizáveis: `QuickCards`, `Callout`, `DocTable`, `FaqAccordion`, `DocControl`, `RoutineList`, `SearchBox`, `Sidebar`, `Breadcrumb`, `TableOfContents`, `SimuladorTela`, `AssistenteChat` (Dentinho), etc.

---

## 3. O que temos (números reais)

Tudo é **bilíngue**: cada página PT tem a gêmea EN em `/en/...`. Total: **~898 arquivos MDX** (≈449 em EN).

| Conteúdo | Quantidade (PT) |
|---|---|
| **Módulos** | **20** |
| **Telas documentadas** (páginas de tela) | **355** |
| Páginas-índice de módulo | 20 |
| **Simuladores guiados** (módulo Simulador) | **181** |
| **Documentação técnica** | **69 páginas** |
| — Fluxos de processo | 32 |
| — Regras de validação | 20 |
| — Referências (status cliente/pedido, tipos de pedido, motivos de bloqueio), APIs, parâmetros, permissões, Azure, banco de dados, migrations, templates, mapa de fluxos | demais |
| Páginas do manual (introdução, como acessar, visão geral, glossário, FAQ) | 5 |
| Telas marcadas como "não disponível no sistema" | 9 |

### Os 20 módulos
Administrador · Aprovações · Autenticador · Clientes · Contratos · Faturamentos · Fiscal · Ignition · Integrador · Inventários · Leads · Ocorrências · Pedidos · Planejamento de Vendas · Políticas · Produtos · Qualidade · Regulatórios · Roteirizador · Simulador.

### Padrão de página de tela (fixo)
Visão geral → QuickCards (Finalidade/Uso/Cuidado) → Quando usar → Como acessar → Antes de começar → Diferenças importantes → Estrutura da tela → **Campos principais** → Fluxos → Ações → Permissões → Comportamentos → Relação com outros processos → O que a tela **não** faz → Problemas comuns → FAQ → **Controle do documento** (assinado "Renan Camargo" + data, versionado).

### Busca e idioma
- Índice de busca **por idioma** (`search-index.json.ts` indexa PT e EN, com corpo, FAQ e tabelas).
- `SearchBox` filtra pelo idioma da página.

---

## 4. O "Dentinho" (assistente de IA do manual)

**O que é:** um mascote em forma de **dente feliz** (SVG animado), botão flutuante + painel lateral, bilíngue, com personalidade (frases de "pensando" descontraídas).

**Como é feito:**
- Front-end: componente `src/components/AssistenteChat.astro`.
- Back-end: endpoint **`POST /api/chat`** dentro do **Cloudflare Worker**.
- Motor: **Cloudflare Workers AI** (binding `AI`) — modelos abertos na **cota grátis**, **sem chave externa, sem cartão**.
- Modelos: **Llama 3.3 70B** (primário) com **fallback automático para Llama 3.1 8B** se falhar/estourar cota.
- **RAG (resposta com fonte):** o Worker faz **busca por palavra** sobre o próprio índice do manual (mesmo espírito do `SearchBox`), pega os **~8 melhores trechos**, aplica um **limiar de relevância** para decidir se o manual cobre o assunto e responde **citando as "Fontes"** (as telas de onde tirou). Limita o tamanho da pergunta (anti-abuso/custo).
- Observação: a rota `/api/chat` só existe no **Worker publicado** (não no `astro dev`).

---

## 5. O Simulador (treino guiado passo a passo)

**O que é:** um **módulo inteiro (181 telas)** de treinos interativos. Cada simulador reproduz uma tela/processo real passo a passo; o **Dentinho "se apresenta" a cada clique** (narra e anima), e **cada etapa mostra a permissão (🔑) e o parâmetro (⚙️) necessários** — foco didático em *processo*, não só em campos.

**Como é feito (arquitetura em 3 camadas, para escalar a ~180 telas sem 1 componente por tela):**
1. **Motor genérico puro** — `src/lib/simulador.mjs`: máquina de estados por tipos de ação (`ABRIR`, `SALVAR`, `ANEXAR`, `ENVIAR`, `APROVAR`, `FIM`). **Sem texto** — só lógica.
2. **Spec por tela** — `src/lib/simuladores/<slug>.mjs`: dados bilíngues da tela (etapas, variantes por cenário, painel de estado, e por etapa: quem faz, tela, texto, dica, fala do Dentinho, **permissão e parâmetro**).
3. **Tela "burra"** — `src/components/SimuladorTela.astro`: desenha qualquer spec e anima o Dentinho. A página MDX só faz `<SimuladorTela slug="..." lang=".." />`.

**Como os 181 foram produzidos:**
- **17 specs à mão** (telas de processo complexas: pedido, aprovações, consignado, contrato, lead, ocorrência, TDC, orçamento, cliente, etc.).
- **~163 gerados** por pipeline: classifica cada tela por tipo (Cadastro → `makeCrud`; Consulta/Relatório → `makeConsulta`) e **extrai dados reais da própria doc da tela** (filtros reais, campos reais, visão geral).
- **Obrigatórios reais** vêm de um minerador (`_mine-validators.cjs`) que varre os **~300 `*Validator.cs`** do .NET (FluentValidation `.NotNull()/.NotEmpty()`) → casa com os rótulos da UI.
- **`_gap-check.mjs`** valida de ponta a ponta: paridade PT=EN=specs, toda etapa com texto nos 2 idiomas, toda página na navegação. Hoje: **sem gaps**.

---

## 6. De onde vem tudo (fontes de verdade)

Regra de ouro do projeto: **não inventar campos nem regras** — tudo é extraído do sistema real.

1. **Código-fonte do SIN-Sales (.NET/Blazor):** nomes de telas, campos e, sobretudo, as **regras de validação** (FluentValidation `*Validator.cs`) → obrigatórios e limites.
2. **Ambiente de Homologação (HML) ao vivo:** inspeção **somente leitura** (navegador logado), tela a tela, para conferir rótulos, botões, filtros e comportamento real.
3. **Banco de dados CrmSin (SQL Server), somente leitura:** confirmação de regras, status e ciclos (ex.: regra de aprovação por tipo de pessoa conferida direto nas tabelas).
4. **Catálogo de feature flags** (tela "Controle de Funcionalidade" — **8 chaves reais** do CRM, lidas de `appsettings`): usado para citar o "parâmetro necessário" em cada tela/etapa.
5. **Nomes reais entre aspas**, pessoas generalizadas, e nunca se documenta ação que a tela não faz.

---

## 7. Qualidade, versionamento e operação

- **Bilíngue obrigatório:** criar/editar PT exige criar/atualizar a gêmea EN no mesmo passo. Marcas mantidas sem traduzir (Lounge, DataMatrix, SAP, PIX, ZapSign, Ignition, Pulse Credit, etc.).
- **Controle do documento** em cada página (assinatura + histórico de versões).
- **Revisão humana antes de publicar:** o autor revisa no ambiente local (porta 4321) antes do commit; a publicação é por push no GitHub (Cloudflare reconstrói).
- **Feedback:** botão no rodapé (mailto) por idioma.
- **Scripts de verificação** versionados (gap-check, mineradores, geradores, check do motor de simuladores).

---

## 8. O que pedir para a IA avaliar (sugestões)

- Cobertura e consistência da documentação (355 telas + 69 técnicas) vs. um CRM/ERP desse porte.
- Qualidade do modelo **motor + spec + tela burra** para escalar simuladores (manutenção, risco de divergir do sistema real).
- Estratégia de **RAG sobre busca por palavra** do Dentinho (precisão, alucinação, quando dizer "não está no manual").
- Fidelidade garantida por **extração de validators .NET + inspeção read-only do HML/banco** — pontos fortes e furos.
- Bilinguismo PT/EN mantido à mão em ~898 arquivos — riscos de drift e como mitigar.
- Lacunas: 9 telas "não disponíveis", seção técnica atrás de Basic Auth, dependência da cota grátis de Workers AI.
