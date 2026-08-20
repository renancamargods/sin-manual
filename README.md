# Manual do Usuário — S.I.N Implant System

Site de documentação/manual do usuário construído com Astro + MDX + Tailwind CSS.

## Rodar localmente

```bash
npm install
npm run dev
```

Se precisar fixar host/porta no Windows:

```bash
npm.cmd run dev -- --host 127.0.0.1 --port 4321 --strictPort
```

## Build de produção

```bash
npm run build
npm run preview
```

O resultado do build é gerado em `dist/` como site estático.

## Estrutura

```
src/
  content/docs/          # Conteúdo em MDX (manual, módulos, doc-tecnicas)
  components/            # Hero, QuickCards, Callout, DocTable, FaqAccordion, Sidebar, SearchBox...
  layouts/                # BaseLayout e DocsLayout
  data/modules.ts         # Registro central de módulos e rotinas (navegação, home, busca)
  pages/                  # Home, rota dinâmica de conteúdo, endpoint de busca
```

## Adicionar uma nova tela/rotina

1. Adicione a rotina em `src/data/modules.ts`, dentro do módulo correspondente (`routines: [...]`).
2. Crie o arquivo MDX em `src/content/docs/modulos/<modulo>/<rotina>.mdx`, com o mesmo `slug` (`<modulo>/<rotina>`).
3. Siga a estrutura de seções já usada nas páginas de exemplo (`cliente.mdx`, `produto.mdx`, `usuario.mdx`, `regra-de-aprovacao.mdx`, `contrato.mdx`, `pedido.mdx`).

A rotina passa a aparecer automaticamente como link ativo no menu lateral e na página inicial do módulo assim que o arquivo MDX existir; até lá, aparece como "Em breve".
