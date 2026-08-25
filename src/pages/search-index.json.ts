import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Transforma o corpo (Markdown/MDX) em texto pesquisável.
// Importante: componentes como <FaqAccordion> e <DocTable> guardam o texto
// (perguntas, respostas, células) dentro de props JSX. Só remover tags apagaria
// esse conteúdo, então extraímos separadamente todo o texto entre aspas e o
// juntamos com a prosa em Markdown.
function toSearchText(body: string): string {
  const src = (body ?? '').replace(/^import .*$/gm, '');

  const quoted = (src.match(/'[^']*'|"[^"]*"/g) ?? [])
    .map((s) => s.slice(1, -1))
    .filter((s) => s.length > 1 && !s.includes('/') && !s.includes('.astro'))
    .join(' ');

  const prose = src
    .replace(/<[^>]*>/g, ' ')
    .replace(/[{}[\]]/g, ' ')
    .replace(/[#*`>|]/g, ' ')
    .replace(/\s+/g, ' ');

  return `${prose} ${quoted}`.replace(/\s+/g, ' ').trim().slice(0, 8000);
}

export const GET: APIRoute = async () => {
  // Índice cobre PT e EN. A busca filtra pelo idioma da página atual (campo lang).
  const entries = await getCollection('docs', ({ data }) => !data.draft);

  const items = entries.map((entry) => {
    const lang = entry.data.lang ?? 'pt';
    const path = `/${entry.data.section}/${entry.data.routeSlug}`;
    return {
      title: entry.data.title,
      description: entry.data.description,
      module: entry.data.moduleLabel ?? entry.data.title,
      href: lang === 'en' ? `/en${path}` : path,
      lang,
      keywords: [...entry.data.keywords, ...entry.data.tags],
      content: toSearchText(entry.body ?? ''),
    };
  });

  return new Response(JSON.stringify(items), {
    headers: { 'Content-Type': 'application/json' },
  });
};
