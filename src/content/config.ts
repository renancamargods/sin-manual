import { defineCollection, z } from 'astro:content';

const routineRef = z.object({
  title: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  status: z.enum(['disponivel', 'em-breve']).default('em-breve'),
});

const docs = defineCollection({
  type: 'content',
  schema: z.object({
    // Roteamento
    section: z.enum(['manual', 'modulos', 'tecnico']),
    routeSlug: z.string(),

    // Identificação / SEO / busca
    title: z.string(),
    description: z.string(),
    keywords: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),

    // Classificação do conteúdo
    pageType: z
      .enum(['manual', 'module-index', 'routine', 'tecnico'])
      .default('routine'),
    module: z.string().optional(),
    moduleLabel: z.string().optional(),

    // Badges do hero
    routineType: z.string().optional(),
    permission: z.string().optional(),
    impact: z.string().optional(),

    // Página de módulo: lista de rotinas do módulo
    routines: z.array(routineRef).optional(),

    // Ordenação no menu
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

export const collections = { docs };
