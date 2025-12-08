import { z } from 'zod';

// Base component schema with recursive children
const baseComponentSchema = z.object({
  id: z.string().optional(),
  props: z.record(z.string(), z.any()).optional(),
});

// Define all component types
export const componentTypeSchema = z.enum([
  'text', 'heading', 'button', 'card', 'list', 'table', 'chart',
  'form', 'input', 'select', 'image', 'alert', 'progress', 'badge',
  'divider', 'container', 'icon', 'stack', 'section', 'split',
  'spacer', 'illustration', 'callout', 'stat', 'avatar', 'tag-group'
]);

// Recursive component schema - id is optional since AI may omit it, we auto-generate missing IDs
export const componentSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string().optional(),
    type: componentTypeSchema,
    props: z.record(z.string(), z.any()).optional(),
    children: z.array(componentSchema).optional(),
  })
);

// UI Response schema
export const uiResponseSchema = z.object({
  components: z.array(componentSchema),
  metadata: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
});

export type UIResponse = z.infer<typeof uiResponseSchema>;
export type ComponentSchema = z.infer<typeof componentSchema>;
