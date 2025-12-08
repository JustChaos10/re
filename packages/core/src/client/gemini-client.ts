import { VertexAI } from '@google-cloud/vertexai';
import { jsonrepair } from 'jsonrepair';
import { uiResponseSchema } from '../schemas';
import { summarizeUIForPrompt } from '../utils/ui-summarizer';
import { GenerateUIRequest, GenerateUIResponse, StreamCallbacks, ReClientConfig } from '../types';

export const SYSTEM_PROMPT = `You are a Generative UI architect specializing in creating beautiful, functional interfaces.

CORE PRINCIPLES:
1. Match UI complexity to content - simple prompts get simple UIs
2. Prefer visual components (charts, stats, badges) when showing DATA
3. Prefer clean layouts (cards, lists, forms) when showing CONTENT or ACTIONS
4. Always maintain proper visual hierarchy and whitespace
5. Never leave empty sections - always provide meaningful content

LAYOUT GUIDELINES:
- Use "stack" with gap "lg" or "xl" for main layouts (vertical stacking)
- Use "split" for side-by-side comparisons (max 2 columns)
- Use "section" to group related content with clear titles
- Use "card" to create visual containers for distinct items
- Use "spacer" with size "lg" between major sections for breathing room
- Wrap everything in a root "stack" component

COMPONENT SELECTION RULES:

DATA VISUALIZATION (use when prompt involves numbers, trends, comparisons):
- chart: For trends/time series (chartType: "line", "bar", "pie", "area")
  { "type": "chart", "props": { "chartType": "bar", "title": "Sales by Region", "xKey": "region", "yKey": "sales", "data": [...] }}
- stat: For key metrics - ALWAYS include trend when showing stats
  { "type": "stat", "props": { "label": "Revenue", "value": "$1.2M", "trend": "+12.5%", "trendDirection": "up", "description": "vs last month" }}
- progress: For percentages, completion rates
  { "type": "progress", "props": { "value": 75, "label": "Progress", "showValue": true }}
- table: For structured data with multiple attributes
  { "type": "table", "props": { "headers": ["Name", "Value"], "rows": [...] }}

CONTENT DISPLAY (use for information, lists, descriptions):
- heading: Clear visual hierarchy (level 1-4)
  { "type": "heading", "props": { "content": "Section Title", "level": 2 }}
- text: Body content, descriptions
  { "type": "text", "props": { "content": "Description text here", "size": "md" }}
- list: Itemized information (always include icons for visual interest)
  { "type": "list", "props": { "items": [{ "id": "1", "label": "Item", "description": "Details", "icon": "check" }] }}
- card: Grouped related content
  { "type": "card", "props": { "title": "Card Title" }, "children": [...] }
- callout: Important notes, tips, security notices
  { "type": "callout", "props": { "message": "Security Tip: Use a strong password", "variant": "info" }}

INTERACTIVE (use for user actions and forms):
- button: Primary actions
  { "type": "button", "props": { "label": "Submit", "variant": "primary" }}
- form: Multi-field input - add contextual helper text to all inputs
  { "type": "form", "props": { "submitLabel": "Submit" }, "children": [...] }
- input: Text input fields - include helpful placeholder and description
  { "type": "input", "props": { "name": "email", "label": "Email", "type": "email", "placeholder": "you@example.com", "helperText": "We'll never share your email" }}
- select: Dropdown selections
  { "type": "select", "props": { "name": "country", "label": "Country", "options": [{ "value": "us", "label": "United States" }] }}

VISUAL ENHANCEMENT:
- icon: Add to stats, list items, cards (names: trophy, star, check, x, arrow-up, arrow-down, chart, users, calendar, clock, zap, target, award, medal, flag, car, heart, mail, phone, home, settings, search, plus, minus, edit, trash, download, upload, link, image, video, music, file, folder, globe, map, compass, sun, moon, cloud, bolt, fire, leaf, drop, gift, tag, bookmark, bell, lock, unlock, eye, message, send)
  { "type": "icon", "props": { "name": "star", "size": "md" }}
- badge: Status labels, categories, HIGHLIGHT RECOMMENDED OPTIONS (variant: "primary" for recommended)
  { "type": "badge", "props": { "label": "Most Popular", "variant": "primary" }}
  { "type": "badge", "props": { "label": "Active", "variant": "success" }}
- avatar: People, teams, entities
  { "type": "avatar", "props": { "name": "John Doe", "size": "md" }}
- illustration: Empty states, decorative (names: document, chart, success, error, empty, search, settings)
  { "type": "illustration", "props": { "name": "success", "size": "lg" }}

SPECIAL PATTERNS:

For PRICING PAGES:
- Always highlight one tier as "Most Popular" or "Recommended" using a badge
- Include feature lists with checkmark icons
- Use "primary" variant button for the recommended tier

For LOGIN/SIGNUP FORMS:
- Include helpful input descriptions (e.g., "Use at least 8 characters")
- Add a "Security Tips" callout at the bottom

For DASHBOARDS:
- Add trend indicators to all stats ("+12%", "-5.2%", etc.)
- Include trendDirection: "up" or "down" on stats
- Use icons that match the metric (dollar-sign, users, chart, etc.)

IMAGE HANDLING:
When images are contextually appropriate, use Lorem Picsum with descriptive seeds:
- Format: https://picsum.photos/seed/{descriptive-keyword}/{width}/{height}
- Examples:
  { "type": "image", "props": { "src": "https://picsum.photos/seed/product-tech/400/300", "alt": "Technology product", "rounded": true }}

SPACING SCALE:
gap/padding values: "none", "xs" (4px), "sm" (8px), "md" (16px), "lg" (24px), "xl" (32px), "2xl" (48px)
- Use "xl" or "2xl" gaps between major sections
- Use "lg" gaps within sections
- Use "md" gaps within cards and groups
- Use "sm" for tight element groupings

QUALITY CHECKLIST:
✅ Root component should be a "stack" with gap "xl"
✅ Include a main heading (level 1) that summarizes the content
✅ Use visual components (charts, stats, badges, icons) not just text
✅ Add trend indicators to stats (+X%, -X%, with trendDirection)
✅ Highlight recommended options with "Most Popular" badges
✅ Add helper text to form inputs
✅ Include icons in lists and with stats for visual interest
✅ Provide real, contextual content - never placeholder text like "[Content]"

RESPONSE STRUCTURE:
{
  "metadata": { 
    "title": "Descriptive UI Title",
    "suggestions": ["Related action 1", "Related action 2"]
  },
  "components": [
    { "type": "stack", "props": { "gap": "xl" }, "children": [...] }
  ]
}

Output valid JSON only. No markdown, no code fences, no explanations.`;

type GeminiGenerationConfig = {
  temperature?: number;
  topP?: number;
  maxOutputTokens?: number;
  responseMimeType?: string;
};

// Conservative cap to stay within GA Gemini 2.5 limits.
const MODEL_MAX_OUTPUT_TOKENS = 8192;
const ALLOWED_COMPONENT_TYPES = new Set([
  'text',
  'heading',
  'button',
  'card',
  'list',
  'table',
  'chart',
  'form',
  'input',
  'select',
  'image',
  'alert',
  'progress',
  'badge',
  'divider',
  'container',
  'icon',
  'stack',
  'section',
  'split',
  'spacer',
  'illustration',
  'callout',
  'stat',
  'avatar',
  'tag-group',
]);

type VertexContent = {
  role: 'user' | 'model' | 'system';
  parts: Array<{ text: string }>;
};

export class GeminiClient {
  private vertex: VertexAI;
  private config: ReClientConfig;

  constructor(config: ReClientConfig) {
    if (!config.projectId) {
      throw new Error('Vertex AI projectId is required');
    }

    this.config = {
      // Use Gemini 2.5 Pro for better structured JSON output quality
      model: 'gemini-2.5-pro',
      temperature: 0.4,  // Slightly higher for more creative UI generation
      topP: 0.9,
      // Allow large JSON payloads; capped per-model when building configs.
      maxTokens: 12000,
      maxRetries: 3,
      location: 'us-central1',
      ...config,
    };

    this.vertex = new VertexAI({
      project: this.config.projectId,
      location: this.config.location ?? 'us-central1',
      googleAuthOptions: this.buildAuthOptions(config),
    });
  }

  private buildAuthOptions(config: ReClientConfig) {
    const auth: Record<string, any> = {};
    if (config.credentials) auth.credentials = config.credentials;
    if (config.keyFilename) auth.keyFilename = config.keyFilename;
    return Object.keys(auth).length > 0 ? auth : undefined;
  }

  private shouldRetry(error: any) {
    const message = typeof error === 'string' ? error : error?.message || '';
    const status = (error as any)?.status ?? (error as any)?.code ?? (error as any)?.statusCode;
    const lower = message.toLowerCase();
    return (
      status === 429 ||
      status === 500 ||
      status === 503 ||
      lower.includes('rate') ||
      lower.includes('timeout') ||
      lower.includes('overloaded') ||
      lower.includes('unavailable')
    );
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async withRetry<T>(fn: () => Promise<T>) {
    const attempts = this.config.maxRetries ?? 3;
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (error) {
        const isLast = i === attempts - 1;
        if (!this.shouldRetry(error) || isLast) throw error;
        await this.sleep(250 * Math.pow(2, i));
      }
    }
    throw new Error('Retry attempts exhausted');
  }

  private buildContents(request: GenerateUIRequest): VertexContent[] {
    const contents: VertexContent[] = [];

    // Add style context if provided
    if (request.styleContext) {
      const styleGuide = this.buildStyleGuide(request.styleContext);
      if (styleGuide) {
        contents.push({
          role: 'user',
          parts: [{ text: `Style Preferences: ${styleGuide}` }],
        });
      }
    }

    const history = request.messages || [];
    for (const msg of history) {
      const role = msg.role === 'assistant' ? 'model' : msg.role === 'system' ? 'user' : 'user';
      contents.push({
        role,
        parts: [{ text: msg.content }],
      });
    }

    if (request.currentUI !== undefined && request.currentUI !== null) {
      const { summary, truncated } = summarizeUIForPrompt(request.currentUI);
      contents.push({
        role: 'user',
        parts: [
          {
            text: `Current UI Summary${truncated ? ' (truncated)' : ''}: ${JSON.stringify(summary)}`,
          },
        ],
      });
      if (truncated) {
        contents.push({
          role: 'user',
          parts: [
            {
              text:
                'Context truncated for length; preserve existing ids/layout and extend rather than rewrite unless explicitly instructed.',
            },
          ],
        });
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: request.prompt }],
    });

    return contents;
  }

  /**
   * Build style guide text from style context
   */
  private buildStyleGuide(ctx: NonNullable<GenerateUIRequest['styleContext']>): string {
    const parts: string[] = [];

    if (ctx.density === 'compact') {
      parts.push('Use minimal spacing (gap: "sm", padding: "sm"). Prefer inline layouts. Keep content concise.');
    } else if (ctx.density === 'spacious') {
      parts.push('Use generous spacing (gap: "xl" or "2xl", padding: "lg"). Add spacers between sections. More visual breathing room.');
    }

    if (ctx.colorScheme === 'dark') {
      parts.push('Design for dark mode with appropriate contrast.');
    }

    if (ctx.style === 'minimal') {
      parts.push('Prefer clean, simple layouts with minimal decoration. Focus on typography and whitespace.');
    } else if (ctx.style === 'corporate') {
      parts.push('Professional appearance with structured layouts, data focus, and formal tone.');
    } else if (ctx.style === 'playful') {
      parts.push('Use vibrant colors, more icons, badges, and engaging visual elements.');
    } else if (ctx.style === 'modern') {
      parts.push('Contemporary design with cards, subtle shadows, and visual depth.');
    }

    return parts.join(' ');
  }

  private buildGenerationConfig(request: GenerateUIRequest): GeminiGenerationConfig {
    const requestedMax = request.maxTokens ?? this.config.maxTokens;
    const maxOutputTokens =
      requestedMax && requestedMax > 0
        ? Math.min(requestedMax, MODEL_MAX_OUTPUT_TOKENS)
        : MODEL_MAX_OUTPUT_TOKENS;

    return {
      temperature: request.temperature ?? this.config.temperature,
      topP: request.topP ?? this.config.topP,
      maxOutputTokens,
      responseMimeType: 'application/json',
    };
  }

  private extractText(payload: any): string {
    const candidates = payload?.candidates || payload?.response?.candidates || [];
    for (const candidate of candidates) {
      const parts = candidate?.content?.parts || candidate?.contents?.[0]?.parts || [];
      const text = parts.map((p: any) => p?.text || '').join('');
      if (text) return text;
    }
    return '';
  }

  private parseUIResponse(rawText: string) {
    if (!rawText) throw new Error('Model returned an empty response');

    // Clean markdown code fences
    let cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/g, '')
      .trim();

    // Try to extract JSON object if there's extra text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }

    const parseAttempts = [cleaned];
    const heuristicallyRepaired = this.repairJson(cleaned);
    if (heuristicallyRepaired !== cleaned) {
      parseAttempts.push(heuristicallyRepaired);
    }

    let parsed: any = null;
    for (const attempt of parseAttempts) {
      try {
        parsed = JSON.parse(attempt);
        break;
      } catch {
        continue;
      }
    }

    if (!parsed) {
      try {
        parsed = JSON.parse(jsonrepair(cleaned));
      } catch (error) {
        this.logMalformedResponse(cleaned, error);
        throw new Error(`Failed to parse model response as JSON: ${cleaned.slice(0, 500)}`);
      }
    }

    // Ensure we have a components array
    if (!parsed.components) {
      parsed.components = [];
    }
    if (!Array.isArray(parsed.components)) {
      parsed.components = [parsed.components];
    }

    // Drop any invalid component types before validation
    parsed.components = this.sanitizeComponents(parsed.components);

    // Add IDs to all components recursively before validation
    parsed.components = this.addMissingIds(parsed.components);

    const result = uiResponseSchema.safeParse(parsed);
    if (!result.success) {
      console.warn('[GeminiClient] Schema validation issues (attempting recovery):',
        this.formatValidationIssues(result.error.issues));
      // Try to proceed anyway with what we have
    }

    const enrichedUI = this.enrichUI(result.success ? result.data : parsed);

    // Validate the response quality
    const validation = this.validateUIResponse(enrichedUI);
    if (validation.issues.length > 0) {
      console.warn('[GeminiClient] Response quality issues:', validation.issues.join(', '));
    }

    return enrichedUI;
  }

  /**
   * Validate the UI response for quality issues
   */
  private validateUIResponse(ui: any): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check for empty response
    if (!ui.components || ui.components.length === 0) {
      issues.push('No components generated');
      return { valid: false, issues };
    }

    // Check for placeholder content that shouldn't be there
    const uiString = JSON.stringify(ui);
    if (uiString.includes('[Content not provided]') || uiString.includes('[Title not provided]')) {
      issues.push('Contains placeholder content');
    }

    // Check for missing metadata
    if (!ui.metadata?.title) {
      issues.push('Missing metadata title');
    }

    // Count visual components
    const visualTypes = ['chart', 'stat', 'progress', 'badge', 'icon', 'avatar', 'illustration', 'image'];
    const hasVisualComponents = this.hasComponentTypes(ui.components, visualTypes);
    if (!hasVisualComponents) {
      issues.push('No visual components (charts, stats, icons, etc.)');
    }

    return { valid: issues.length === 0, issues };
  }

  /**
   * Check if components contain any of the specified types (recursive)
   */
  private hasComponentTypes(components: any[], types: string[]): boolean {
    for (const comp of components) {
      if (!comp) continue;
      if (types.includes(comp.type)) return true;
      if (Array.isArray(comp.children) && this.hasComponentTypes(comp.children, types)) {
        return true;
      }
    }
    return false;
  }

  private addMissingIds(components: any[], prefix: string = 'gen'): any[] {
    return (components || []).map((comp, index) => {
      if (!comp || typeof comp !== 'object') return comp;

      const updated = {
        ...comp,
        id: comp.id || this.uniqueId(`${prefix}-${comp.type || 'comp'}`),
      };

      if (Array.isArray(comp.children)) {
        updated.children = this.addMissingIds(comp.children, `${updated.id}`);
      }

      // Also handle items in lists that need IDs
      if (Array.isArray(comp.props?.items)) {
        updated.props = {
          ...comp.props,
          items: comp.props.items.map((item: any, i: number) => ({
            ...item,
            id: item.id || this.uniqueId(`${updated.id}-item`),
          })),
        };
      }

      // Handle tags in tag-groups
      if (Array.isArray(comp.props?.tags)) {
        updated.props = {
          ...comp.props,
          tags: comp.props.tags.map((tag: any, i: number) => ({
            ...tag,
            id: tag.id || this.uniqueId(`${updated.id}-tag`),
          })),
        };
      }

      return updated;
    });
  }

  private formatValidationIssues(issues: any[]) {
    const formatted = issues.slice(0, 5).map((issue: any) => {
      const path = Array.isArray(issue.path) ? issue.path.join('.') : '';
      return path ? `${path}: ${issue.message}` : issue.message;
    });
    const suffix = issues.length > 5 ? ` ...and ${issues.length - 5} more` : '';
    return `${formatted.join(' | ')}${suffix}`;
  }

  private sanitizeComponents(components: any[]): any[] {
    return components
      .map((component) => this.sanitizeComponent(component))
      .filter(Boolean);
  }

  private sanitizeComponent(component: any): any | null {
    if (!component || typeof component !== 'object') return null;
    if (!ALLOWED_COMPONENT_TYPES.has(component.type)) return null;

    const sanitized: any = { ...component };
    if (Array.isArray(component.children)) {
      sanitized.children = component.children
        .map((child: any) => this.sanitizeComponent(child))
        .filter(Boolean);
    }
    return sanitized;
  }

  private enrichUI(ui: any) {
    return {
      ...ui,
      components: this.enrichComponents(ui.components || []),
    };
  }

  private enrichComponents(components: any[]): any[] {
    return (components || []).map((component) => this.enrichComponent(component)).filter(Boolean);
  }

  private enrichComponent(component: any): any | null {
    if (!component || typeof component !== 'object') return null;
    const base = {
      ...component,
      // Auto-generate ID if missing
      id: component.id || this.uniqueId(component.type || 'component'),
      props: component.props ?? {},
      children: Array.isArray(component.children) ? component.children : [],
    };

    switch (component.type) {
      case 'text': {
        const { content = '[Content not provided]', size = 'md', weight = 'normal' } = base.props;
        return { ...base, props: { ...base.props, content, size, weight } };
      }
      case 'heading': {
        const { content = '[Title not provided]', level = 2 } = base.props;
        return { ...base, props: { ...base.props, content, level } };
      }
      case 'button': {
        const { label = 'Action', variant = 'primary', size = 'md' } = base.props;
        return { ...base, props: { ...base.props, label, variant, size } };
      }
      case 'card': {
        return { ...base, children: this.enrichComponents(base.children) };
      }
      case 'list': {
        const items =
          Array.isArray(base.props.items) && base.props.items.length > 0
            ? base.props.items
            : [{ id: this.uniqueId('item'), label: '[List items not provided]' }];
        const variant = base.props.variant ?? 'none';
        return { ...base, props: { ...base.props, items, variant } };
      }
      case 'table': {
        const headers = Array.isArray(base.props.headers) && base.props.headers.length > 0
          ? base.props.headers
          : ['Column A', 'Column B'];
        const rows =
          Array.isArray(base.props.rows) && base.props.rows.length > 0
            ? base.props.rows
            : Array.from({ length: 4 }).map((_, i) => ({
              id: this.uniqueId('row'),
              [headers[0]]: `Row ${i + 1} A`,
              [headers[1]]: `Row ${i + 1} B`,
            }));
        return { ...base, props: { ...base.props, headers, rows } };
      }
      case 'chart': {
        const chartType = base.props.chartType ?? 'bar';
        const xKey = base.props.xKey ?? 'name';
        const yKey = base.props.yKey ?? 'value';
        const title = base.props.title ?? 'Data Overview';
        const data =
          Array.isArray(base.props.data) && base.props.data.length > 0
            ? base.props.data
            : this.generateContextualChartData(chartType, xKey, yKey);
        return { ...base, props: { ...base.props, chartType, xKey, yKey, data, title } };
      }
      case 'form': {
        const submitLabel = base.props.submitLabel ?? 'Submit';
        return { ...base, props: { ...base.props, submitLabel }, children: this.enrichComponents(base.children) };
      }
      case 'input': {
        const name = base.props.name ?? this.uniqueId('input');
        const label = base.props.label ?? 'Input';
        const type = base.props.type ?? 'text';
        // Generate smart placeholder and helper text based on type
        const { placeholder, helperText } = this.getInputDefaults(type, label, base.props);
        return {
          ...base,
          props: {
            ...base.props,
            name,
            label,
            type,
            placeholder: base.props.placeholder ?? placeholder,
            helperText: base.props.helperText ?? helperText
          }
        };
      }
      case 'select': {
        const name = base.props.name ?? this.uniqueId('select');
        const label = base.props.label ?? 'Select';
        const options =
          Array.isArray(base.props.options) && base.props.options.length > 0
            ? base.props.options
            : [
              { value: 'option-1', label: 'Option 1' },
              { value: 'option-2', label: 'Option 2' },
              { value: 'option-3', label: 'Option 3' },
            ];
        return { ...base, props: { ...base.props, name, label, options } };
      }
      case 'image': {
        const alt = base.props.alt ?? 'Image';
        const width = base.props.width ?? 600;
        const height = base.props.height ?? 400;
        const rounded = base.props.rounded ?? false;
        // Use Lorem Picsum with smart seeding based on alt text
        const src = this.getValidImageUrl(base.props.src, alt, width, height);
        return { ...base, props: { ...base.props, src, alt, width, height, rounded } };
      }
      case 'alert': {
        const variant = base.props.variant ?? 'info';
        const message = base.props.message ?? 'Alert message';
        return { ...base, props: { ...base.props, variant, message } };
      }
      case 'progress': {
        const value = typeof base.props.value === 'number' ? base.props.value : 50;
        const max = typeof base.props.max === 'number' ? base.props.max : 100;
        const showPercentage = base.props.showPercentage ?? true;
        return { ...base, props: { ...base.props, value, max, showPercentage } };
      }
      case 'badge': {
        const label = base.props.label ?? 'Badge';
        const variant = base.props.variant ?? 'default';
        return { ...base, props: { ...base.props, label, variant } };
      }
      case 'divider': {
        return { ...base, props: { ...base.props } };
      }
      case 'container': {
        return { ...base, children: this.enrichComponents(base.children) };
      }
      case 'icon': {
        const name = base.props.name ?? 'info';
        const size = base.props.size ?? 'md';
        return { ...base, props: { ...base.props, name, size } };
      }
      case 'stack': {
        const gap = base.props.gap ?? 'md';
        return { ...base, props: { ...base.props, gap }, children: this.enrichComponents(base.children) };
      }
      case 'section': {
        const title = base.props.title ?? '[Section title not provided]';
        const subtitle = base.props.subtitle ?? '';
        return { ...base, props: { ...base.props, title, subtitle }, children: this.enrichComponents(base.children) };
      }
      case 'split': {
        const gap = base.props.gap ?? 'md';
        let children = this.enrichComponents(base.children);
        if (children.length < 2) {
          const filler = {
            id: this.uniqueId('split'),
            type: 'container',
            props: { direction: 'column', gap: 'md' },
            children: [],
          };
          while (children.length < 2) children.push(filler);
        }
        return { ...base, props: { ...base.props, gap }, children: children.slice(0, 2) };
      }
      case 'spacer': {
        const size = base.props.size ?? 'md';
        return { ...base, props: { ...base.props, size } };
      }
      case 'illustration': {
        const name = base.props.name ?? 'document';
        const size = base.props.size ?? 'md';
        return { ...base, props: { ...base.props, name, size } };
      }
      case 'callout': {
        const message = base.props.message ?? 'Note';
        const variant = base.props.variant ?? 'info';
        const collapsible = base.props.collapsible ?? false;
        return {
          ...base,
          props: { ...base.props, message, variant, collapsible },
          children: this.enrichComponents(base.children),
        };
      }
      case 'stat': {
        const label = base.props.label ?? '[Metric]';
        const value = base.props.value ?? '[Value]';
        // Auto-generate trend if not provided (like C1)
        const trend = base.props.trend ?? this.generateRandomTrend();
        const trendDirection = base.props.trendDirection ?? (trend.startsWith('-') ? 'down' : 'up');
        const description = base.props.description ?? 'vs last period';
        return { ...base, props: { ...base.props, label, value, trend, trendDirection, description } };
      }
      case 'avatar': {
        const name = base.props.name ?? 'User';
        const size = base.props.size ?? 'md';
        return { ...base, props: { ...base.props, name, size } };
      }
      case 'tag-group': {
        const tags =
          Array.isArray(base.props.tags) && base.props.tags.length > 0
            ? base.props.tags
            : [
              { id: this.uniqueId('tag'), label: 'Tag 1' },
              { id: this.uniqueId('tag'), label: 'Tag 2' },
            ];
        return { ...base, props: { ...base.props, tags } };
      }
      default:
        return base;
    }
  }

  private uniqueId(prefix: string) {
    return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
  }

  /**
   * Generate random trend value like C1 does (e.g., "+8.2%", "-3.1%")
   */
  private generateRandomTrend(): string {
    const isUp = Math.random() > 0.3; // 70% chance of upward trend
    const value = (Math.random() * 15 + 1).toFixed(1);
    return isUp ? `+${value}%` : `-${value}%`;
  }

  /**
   * Generate smart placeholder and helper text based on input type
   */
  private getInputDefaults(type: string, label: string, props: any): { placeholder: string; helperText: string } {
    const labelLower = label.toLowerCase();

    // Type-specific defaults (like C1's intelligent hints)
    const defaults: Record<string, { placeholder: string; helperText: string }> = {
      email: {
        placeholder: 'you@example.com',
        helperText: 'We\'ll use this to contact you'
      },
      password: {
        placeholder: '••••••••',
        helperText: 'At least 8 characters recommended'
      },
      tel: {
        placeholder: '+1 (555) 123-4567',
        helperText: 'Include country code for international'
      },
      phone: {
        placeholder: '+1 (555) 123-4567',
        helperText: 'Include country code for international'
      },
      url: {
        placeholder: 'https://example.com',
        helperText: 'Full URL including https://'
      },
      number: {
        placeholder: '0',
        helperText: 'Numeric values only'
      },
      date: {
        placeholder: 'YYYY-MM-DD',
        helperText: 'Select a date'
      },
      search: {
        placeholder: 'Search...',
        helperText: ''
      }
    };

    // Check if type matches
    if (defaults[type]) {
      return defaults[type];
    }

    // Label-based smart defaults
    if (labelLower.includes('name') && labelLower.includes('first')) {
      return { placeholder: 'John', helperText: 'Your first name' };
    }
    if (labelLower.includes('name') && labelLower.includes('last')) {
      return { placeholder: 'Doe', helperText: 'Your last name' };
    }
    if (labelLower.includes('name') || labelLower.includes('full name')) {
      return { placeholder: 'John Doe', helperText: 'Your full name' };
    }
    if (labelLower.includes('email')) {
      return defaults.email;
    }
    if (labelLower.includes('phone') || labelLower.includes('mobile')) {
      return defaults.tel;
    }
    if (labelLower.includes('message') || labelLower.includes('comment')) {
      return { placeholder: 'Type your message here...', helperText: '' };
    }
    if (labelLower.includes('address')) {
      return { placeholder: '123 Main St, City, Country', helperText: 'Your full address' };
    }
    if (labelLower.includes('company') || labelLower.includes('organization')) {
      return { placeholder: 'Acme Inc.', helperText: 'Your company or organization' };
    }
    if (labelLower.includes('website') || labelLower.includes('url')) {
      return defaults.url;
    }

    // Default fallback
    return { placeholder: `Enter ${label.toLowerCase()}...`, helperText: '' };
  }

  /**
   * Generate contextual sample chart data based on chart type
   */
  private generateContextualChartData(chartType: string, xKey: string, yKey: string): any[] {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const categories = ['Category A', 'Category B', 'Category C', 'Category D'];

    // Pie charts work better with categories
    if (chartType === 'pie') {
      return categories.map((cat, i) => ({
        [xKey]: cat,
        [yKey]: Math.floor(25 + (i * 10) + (Math.random() * 15))
      }));
    }

    // Line/bar/area charts work better with time series
    return months.map((month, i) => ({
      [xKey]: month,
      [yKey]: Math.floor(30 + (i * 8) + (Math.random() * 20))
    }));
  }

  /**
   * Validate and fix image URLs to use Lorem Picsum for reliable loading
   */
  private getValidImageUrl(originalUrl: string | undefined, alt: string, width: number, height: number): string {
    // If URL is already a valid picsum URL, keep it
    if (originalUrl?.includes('picsum.photos')) {
      return originalUrl;
    }

    // If URL looks like a real valid URL (not placeholder), try to keep it
    if (originalUrl && this.isLikelyValidImageUrl(originalUrl)) {
      return originalUrl;
    }

    // Generate contextual placeholder using Lorem Picsum with seeded keyword
    const seed = this.generateImageSeed(alt);
    return `https://picsum.photos/seed/${seed}/${width}/${height}`;
  }

  /**
   * Check if a URL is likely to be a valid, loadable image
   */
  private isLikelyValidImageUrl(url: string): boolean {
    // Reject obvious placeholders
    const placeholderPatterns = [
      'placehold',
      'placeholder',
      'via.placeholder',
      'dummyimage',
      'fakeimg',
      'example.com',
      'localhost',
    ];
    const lowerUrl = url.toLowerCase();
    if (placeholderPatterns.some(p => lowerUrl.includes(p))) {
      return false;
    }

    // Accept common image hosting services
    const validHosts = [
      'unsplash.com',
      'images.unsplash.com',
      'pexels.com',
      'images.pexels.com',
      'pixabay.com',
      'cloudinary.com',
      'imgur.com',
      'i.imgur.com',
      'amazonaws.com',
      's3.',
      'googleusercontent.com',
      'picsum.photos',
    ];
    if (validHosts.some(h => lowerUrl.includes(h))) {
      return true;
    }

    // For other URLs, check if they have image extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return imageExtensions.some(ext => lowerUrl.includes(ext));
  }

  /**
   * Generate a consistent seed for Lorem Picsum based on alt text
   */
  private generateImageSeed(alt: string): string {
    // Convert alt text to a URL-friendly seed
    const seed = alt
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 30)
      || 'placeholder';

    return seed;
  }

  /**
   * Process all image URLs in the component tree to ensure they're valid
   */
  private processImageUrls(components: any[]): any[] {
    return components.map(comp => {
      if (!comp || typeof comp !== 'object') return comp;

      // Process image components
      if (comp.type === 'image' && comp.props) {
        const width = comp.props.width ?? 600;
        const height = comp.props.height ?? 400;
        comp.props.src = this.getValidImageUrl(comp.props.src, comp.props.alt || 'Image', width, height);
      }

      // Recursively process children
      if (Array.isArray(comp.children)) {
        comp.children = this.processImageUrls(comp.children);
      }

      return comp;
    });
  }

  private repairJson(input: string): string {
    let text = input;
    // Map "component" -> "type" (common model alias)
    text = text.replace(/"component"\s*:/g, '"type":');
    // Remove trailing commas before ] or }
    text = text.replace(/,\s*([}\]])/g, '$1');
    // If the string is truncated, cut to the last closing brace.
    const lastBrace = text.lastIndexOf('}');
    if (lastBrace > 0 && lastBrace < text.length - 1) {
      text = text.slice(0, lastBrace + 1);
    }

    const braceImbalance = this.countImbalance(text, '{', '}');
    if (braceImbalance > 0) {
      text = `${text}${'}'.repeat(braceImbalance)}`;
    }

    const bracketImbalance = this.countImbalance(text, '[', ']');
    if (bracketImbalance > 0) {
      text = `${text}${']'.repeat(bracketImbalance)}`;
    }
    return text;
  }

  private countImbalance(text: string, open: string, close: string) {
    let balance = 0;
    for (const char of text) {
      if (char === open) balance++;
      if (char === close) balance = Math.max(0, balance - 1);
    }
    return balance;
  }

  private logMalformedResponse(payload: string, error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('[GeminiClient] Failed to repair model response', {
      error: message,
      preview: payload.slice(0, 500),
    });
  }

  private mapUsage(usage?: any) {
    if (!usage) return undefined;
    const promptTokens = usage.promptTokenCount ?? usage.inputTokenCount ?? 0;
    const completionTokens = usage.candidatesTokenCount ?? usage.outputTokenCount ?? 0;
    const totalTokens = usage.totalTokenCount ?? promptTokens + completionTokens;
    return { promptTokens, completionTokens, totalTokens };
  }

  async generateUI(request: GenerateUIRequest): Promise<GenerateUIResponse> {
    return this.withRetry(async () => {
      const modelId = request.model || this.config.model!;
      const model = this.vertex.getGenerativeModel({
        model: modelId,
        systemInstruction: {
          role: 'system',
          parts: [{ text: SYSTEM_PROMPT }],
        },
      });

      const result = await model.generateContent({
        contents: this.buildContents(request),
        generationConfig: this.buildGenerationConfig(request),
        safetySettings: [],
      });

      const text = this.extractText(result);
      const object = this.parseUIResponse(text);

      return {
        ui: {
          components: object.components || [],
          metadata: object.metadata,
        },
        model: modelId,
        usage: this.mapUsage(result.response?.usageMetadata),
      };
    });
  }

  async *streamUI(request: GenerateUIRequest): AsyncGenerator<any, void, unknown> {
    const modelId = request.model || this.config.model!;
    const model = this.vertex.getGenerativeModel({
      model: modelId,
      systemInstruction: {
        role: 'system',
        parts: [{ text: SYSTEM_PROMPT }],
      },
    });

    const streamResponse = await this.withRetry(() =>
      model.generateContentStream({
        contents: this.buildContents(request),
        generationConfig: this.buildGenerationConfig(request),
        safetySettings: [],
      })
    );

    let aggregated = '';
    for await (const item of streamResponse.stream) {
      aggregated += this.extractText(item);
    }

    const object = this.parseUIResponse(aggregated);

    if (object.components && object.components.length > 0) {
      yield { type: 'components', data: object.components };
    }

    if (object.metadata) {
      yield { type: 'metadata', data: object.metadata };
    }

    yield {
      type: 'done',
      data: {
        components: object.components || [],
        metadata: object.metadata,
      },
    };
  }

  async generateUIWithCallbacks(
    request: GenerateUIRequest,
    callbacks: StreamCallbacks
  ): Promise<void> {
    const attempts = this.config.maxRetries ?? 3;
    for (let i = 0; i < attempts; i++) {
      try {
        for await (const chunk of this.streamUI(request)) {
          switch (chunk.type) {
            case 'components':
              callbacks.onComponent?.(chunk.data);
              break;
            case 'metadata':
              callbacks.onMetadata?.(chunk.data);
              break;
            case 'error':
              callbacks.onError?.(new Error(chunk.data.message));
              break;
            case 'done':
              callbacks.onDone?.();
              break;
          }
        }
        return;
      } catch (error) {
        const isLast = i === attempts - 1;
        if (!this.shouldRetry(error) || isLast) {
          callbacks.onError?.(error instanceof Error ? error : new Error(String(error)));
          throw error;
        }
        await this.sleep(250 * Math.pow(2, i));
      }
    }
  }
}
