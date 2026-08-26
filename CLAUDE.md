# S.I.N Manual — instruções do projeto (ler antes de editar)

Manual do usuário do **S.I.N Implant System** — Astro + MDX + Tailwind. Este arquivo é
o padrão do projeto; siga-o ao criar/editar páginas. Referência visual de padrão: a
tela **Cliente** (`src/content/docs/modulos/clientes/cliente.mdx`).

## Como rodar (Node portátil, PowerShell)
```
$env:PATH = "C:\Users\renan.camargo\Downloads\node-v24.18.1-win-x64\node-v24.18.1-win-x64;" + $env:PATH
npm.cmd run dev -- --host 127.0.0.1 --port 4321 --strictPort
```
- **Sempre a porta 4321.** Se estiver ocupada, derrubar o processo e subir nela mesmo.
- **Publicação:** GitHub Desktop → push → Cloudflare reconstrói. **Nunca commitar/push** — quem faz é o usuário. Mudanças só aparecem no site publicado após o push; no local, `Ctrl+Shift+R` se cachear.
- O usuário **revisa cada página no navegador (4321) antes de commitar**.

## Conteúdo e navegação
- Páginas em `src/content/docs/`. Frontmatter usa **`routeSlug`** (não `slug`) e o campo **`lang`** (pt|en, default pt). URL = `/{section}/{routeSlug}` (EN = `/en/...`).
- Navegação central em `src/data/modules.ts`: `manualPages`, `modules` (com `routines`), `tecnicoPages`. **Toda tela nova precisa ser registrada** no `routines` do módulo.
- Componentes: `QuickCards`, `Callout`, `DocTable`, `FaqAccordion`, `DocControl`. `RoutineList` ("Rotinas do módulo") é automático no índice.

## Bilíngue PT/EN (regra crítica)
- PT na raiz; **EN em `/en/...`**. Cada página PT tem **gêmea EN** em `src/content/docs/en/...` com `lang: 'en'` e mesmo `section`/`routeSlug`.
- **Ao criar/editar uma página PT, crie/atualize a gêmea EN no mesmo passo.**
- Rótulos de navegação EN: dicionários no fim de `modules.ts` — `moduleEn`, `manualPageEn`, `tecnicoGroupEn`, `routineTitleEn` (por `moduleId/slug`), `tecnicoSubEn`. Tela nova → adicionar em `routineTitleEn`.
- Nomes de módulo diferem por idioma (ex.: PT "Administrador" / EN "Administrator").
- Traduzir tudo (inclusive nomes de tela/campo); **manter marcas**: Lounge, DataMatrix, SAP, PIX, ZapSign, GO.ON, Ignition, Pulse Credit, VerifyID, ClearSale.

### Profundidade dos imports (erro comum)
- PT manual `docs/manual/*` → `../../../components/`
- PT módulo `docs/modulos/<m>/*` → `../../../../components/`
- PT técnico `docs/tecnico/*` → `../../../components/` ; `docs/tecnico/fluxos/*` → `../../../../components/`
- **EN = +1 nível** que o PT equivalente (módulo/fluxos EN → `../../../../../components/`; manual/técnico EN → `../../../../components/`).

## Busca e feedback
- Busca é **por idioma**: `search-index.json.ts` indexa PT e EN (campo `lang`, href `/en`, + corpo/FAQ/tabelas); `SearchBox.astro` filtra pelo idioma da página.
- Feedback: botão no `SiteFooter` (mailto, rótulo/assunto/corpo por idioma). E-mail provisório `renansinimplante@gmail.com`.

## Padrão de página de tela
Ordem: Visão geral → QuickCards (Finalidade/Uso/Cuidado) → Quando usar → Como acessar →
Antes de começar → Diferenças importantes → Estrutura da tela → **Campos principais** (### por grupo)
→ Fluxos → Ações → Permissões → Comportamentos → Relação com outros processos → O que a tela não faz
→ Problemas comuns → FAQ → **Controle do documento**.
- **DocControl** assinado **Renan Camargo + data da conversa** (Revisado/Aprovado = "A definir").
- Nomes reais de botões/telas/campos/status **entre aspas**; generalizar nomes de pessoas; **não inventar** campos/regras; não documentar ação que a tela não faz.
- FAQ em 2 camadas: específico no rodapé da página; central em `manual/faq.mdx` (só links por módulo, sem duplicar).

## Fluxo comigo
1. Usuário manda a tela (prints/prompt). 2. Crio PT + gêmea EN + registro no `modules.ts`.
3. Verifico no 4321. 4. Passo para o usuário revisar **antes do commit**; ele aprova e commita.
