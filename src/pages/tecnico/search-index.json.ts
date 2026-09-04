import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Índice de busca da seção TÉCNICA (Doc. Técnicas e Configurações).
// Fica em /tecnico/search-index.json → o Worker (Basic Auth) protege este
// caminho, então só usuários autenticados conseguem baixá-lo. O SearchBox
// tenta buscá-lo e, quando recebe 200 (logado), junta esses resultados aos
// da busca pública. Público (401) simplesmente não enxerga.

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
  const entries = await getCollection(
    'docs',
    ({ data }) => !data.draft && data.section === 'tecnico',
  );

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
