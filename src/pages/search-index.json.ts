import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const entries = await getCollection('docs', ({ data }) => !data.draft);

  const items = entries.map((entry) => ({
    title: entry.data.title,
    description: entry.data.description,
    module: entry.data.moduleLabel ?? entry.data.title,
    href: `/${entry.data.section}/${entry.data.routeSlug}`,
    keywords: [...entry.data.keywords, ...entry.data.tags],
  }));

  return new Response(JSON.stringify(items), {
    headers: { 'Content-Type': 'application/json' },
  });
};
