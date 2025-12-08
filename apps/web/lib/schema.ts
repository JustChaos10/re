import { z } from 'zod';

export const componentTypes = [
  'Header',
  'StockCard',
  'WeatherWidget',
  'InfoCard',
  'Alert',
  'AnalysisText',
  'TextBlock',
  'Section',
  'LayoutRow',
  'LayoutColumn',
  'ComparisonRow',
  'MetricList',
  'Divider',
  'KeyTakeaways',
  'InsightCard',
  'TimelineComparison',
  'RelatedQueries',
] as const;

export const componentSchema: z.ZodType<any> = z.lazy(() => {
  const recursiveChildren = z.array(componentSchema).min(1, 'Provide at least one child.');

  return z.discriminatedUnion('type', [
    z.object({
      id: z.string().optional(),
      type: z.literal('Header'),
      props: z.object({
        title: z.string(),
        subtitle: z.string().optional(),
      }),
    }),
    z.object({
      id: z.string().optional(),
      type: z.literal('StockCard'),
      props: z.object({
        symbol: z.string(),
        price: z.coerce.number(),
        change: z.coerce.number(),
        changeDirection: z.enum(['up', 'down']),
        summary: z.string().optional(),
      }),
    }),
    z.object({
      id: z.string().optional(),
      type: z.literal('WeatherWidget'),
      props: z.object({
        location: z.string(),
        temperature: z.coerce.number(),
        condition: z.string(),
        high: z.coerce.number().optional(),
        low: z.coerce.number().optional(),
        feelsLike: z.coerce.number().optional(),
      }),
    }),
    z.object({
      id: z.string().optional(),
      type: z.literal('InfoCard'),
      props: z.object({
        title: z.string(),
        stat: z.string(),
        trend: z.string().optional(),
        description: z.string().optional(),
        variant: z.enum(['neutral', 'success', 'warning', 'danger']).optional(),
      }),
    }),
    z.object({
      id: z.string().optional(),
      type: z.literal('Alert'),
      props: z.object({
        title: z.string().optional(),
        message: z.string(),
        variant: z.enum(['info', 'success', 'warning', 'error']).default('info'),
        actionLabel: z.string().optional(),
      }),
    }),
    z.object({
      id: z.string().optional(),
      type: z.literal('AnalysisText'),
      props: z.object({
        content: z.string(),
      }),
    }),
    z.object({
      id: z.string().optional(),
      type: z.literal('TextBlock'),
      props: z.object({
        title: z.string().optional(),
        content: z.string(),
      }),
    }),
    z.object({
      id: z.string().optional(),
      type: z.literal('Section'),
      props: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
      }),
      children: recursiveChildren,
    }),
    z.object({
      id: z.string().optional(),
      type: z.literal('LayoutRow'),
      props: z.object({
        gap: z.enum(['sm', 'md', 'lg']).default('md'),
        columns: z.number().min(1).max(3).default(2),
      }),
      children: recursiveChildren,
    }),
    z.object({
      id: z.string().optional(),
      type: z.literal('LayoutColumn'),
      props: z.object({
        gap: z.enum(['sm', 'md', 'lg']).default('md'),
      }),
      children: recursiveChildren,
    }),
    z.object({
      id: z.string().optional(),
      type: z.literal('ComparisonRow'),
      props: z.object({
        title: z.string().optional(),
        items: z
          .array(
            z.object({
              label: z.string(),
              value: z.string(),
              detail: z.string().optional(),
            })
          )
          .min(2),
      }),
    }),
    z.object({
      id: z.string().optional(),
      type: z.literal('MetricList'),
      props: z.object({
        title: z.string().optional(),
        items: z
          .array(
            z.object({
              label: z.string(),
              value: z.string(),
              delta: z.string().optional(),
            })
          )
          .min(1),
      }),
    }),
    z.object({
      id: z.string().optional(),
      type: z.literal('Divider'),
      props: z.object({
        label: z.string().optional(),
      }),
    }),
    z.object({
      id: z.string().optional(),
      type: z.literal('KeyTakeaways'),
      props: z.object({
        title: z.string().optional(),
        items: z
          .array(
            z.object({
              label: z.string(),
              caption: z.string().optional(),
              trend: z.enum(['up', 'down', 'steady']).optional(),
            })
          )
          .min(2),
      }),
    }),
    z.object({
      id: z.string().optional(),
      type: z.literal('InsightCard'),
      props: z.object({
        title: z.string(),
        description: z.string(),
        metric: z.string().optional(),
        icon: z.string().optional(),
        tone: z.enum(['info', 'success', 'warning', 'danger']).optional(),
      }),
    }),
    z.object({
      id: z.string().optional(),
      type: z.literal('TimelineComparison'),
      props: z.object({
        title: z.string().optional(),
        eras: z
          .array(
            z.object({
              era: z.string(),
              bullets: z.array(z.string()).min(2),
            })
          )
          .min(2),
      }),
    }),
    z.object({
      id: z.string().optional(),
      type: z.literal('RelatedQueries'),
      props: z.object({
        title: z.string().optional(),
        queries: z
          .array(
            z.object({
              prompt: z.string(),
              description: z.string().optional(),
            })
          )
          .min(3),
      }),
    }),
  ]);
});

export const renderInterfaceSchema = z.object({
  components: z.array(componentSchema).max(40),
});

export type ComponentNode = z.infer<typeof componentSchema>;
export type RenderInterfacePayload = z.infer<typeof renderInterfaceSchema>;

export const renderInterfaceTool = {
  name: 'render_interface',
  description:
    'Compose structured UI responses by selecting from the approved component library and wiring props that the frontend renderer can hydrate.',
  parameters: renderInterfaceSchema,
};
