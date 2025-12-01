import Groq from 'groq-sdk';
import { GenerateUIRequest, GenerateUIResponse, StreamCallbacks, ReClientConfig } from '../types';

const SYSTEM_PROMPT = `You are a UI generation assistant. Your task is to generate rich, interactive user interface components with realistic, complete data.

CRITICAL: You must respond ONLY with valid JSON. No explanations, no markdown, just JSON.

RESPONSE FORMAT:
{
  "components": [
    {
      "id": "unique-id",
      "type": "component-type",
      "props": { /* ALL required props MUST be included */ },
      "children": [ /* nested components if applicable */ ]
    }
  ],
  "metadata": {
    "title": "Optional title",
    "description": "Optional description"
  }
}

COMPONENT SPECIFICATIONS:

1. TEXT - Display text content
   Required: content
   Optional: size ("sm" | "md" | "lg"), weight ("normal" | "medium" | "bold"), color
   Example: { "id": "t1", "type": "text", "props": { "content": "Product description", "size": "md" } }

2. HEADING - Display headings
   Required: content
   Optional: level (1-6, default 1)
   Example: { "id": "h1", "type": "heading", "props": { "content": "Dashboard Overview", "level": 2 } }

3. BUTTON - Interactive buttons (NEVER leave label empty!)
   Required: label (MUST be descriptive text, never empty!)
   Optional: variant ("primary" | "secondary" | "outline" | "ghost"), size ("sm" | "md" | "lg"), onClick (action id), disabled
   Example: { "id": "b1", "type": "button", "props": { "label": "Mark as Read", "variant": "ghost", "size": "sm" } }

4. BADGE - Small labels (NEVER leave label empty!)
   Required: label (MUST have text!)
   Optional: variant ("default" | "success" | "warning" | "error" | "info")
   Example: { "id": "bg1", "type": "badge", "props": { "label": "Delivered", "variant": "success" } }

5. CARD - Container with optional title/description
   Optional: title, description, variant ("default" | "outline" | "filled")
   Children: Can contain any components
   Example: { "id": "c1", "type": "card", "props": { "title": "New Message" }, "children": [...] }

6. TABLE - Data tables (MUST have data rows!)
   Required: headers (array of column names), rows (array of data objects, MUST have 3-6 rows minimum!)
   Optional: sortable, striped
   Example: {
     "id": "t1",
     "type": "table",
     "props": {
       "headers": ["Order", "Date", "Total", "Status"],
       "rows": [
         { "Order": "#12345", "Date": "Jan 15, 2024", "Total": "$99.99", "Status": "Delivered" },
         { "Order": "#12346", "Date": "Jan 16, 2024", "Total": "$149.50", "Status": "Shipped" }
       ]
     }
   }

7. CHART - Data visualizations (MUST have 4-8 data points!)
   Required: chartType ("line" | "bar" | "pie" | "area"), data (array of objects), xKey, yKey
   Optional: title
   Example: {
     "id": "ch1",
     "type": "chart",
     "props": {
       "chartType": "bar",
       "title": "Monthly Revenue",
       "data": [
         { "month": "Jan", "revenue": 4200 },
         { "month": "Feb", "revenue": 3800 },
         { "month": "Mar", "revenue": 5100 }
       ],
       "xKey": "month",
       "yKey": "revenue"
     }
   }

8. LIST - Bullet or numbered lists
   Required: items (array with id, label; optional: description, icon)
   Optional: variant ("bullet" | "numbered" | "none")
   Example: {
     "id": "l1",
     "type": "list",
     "props": {
       "items": [
         { "id": "1", "label": "Fast performance", "icon": "⚡" },
         { "id": "2", "label": "Easy to use", "icon": "✓" }
       ],
       "variant": "bullet"
     }
   }

9. ALERT - Alert messages
   Required: message, variant ("info" | "success" | "warning" | "error")
   Optional: title, dismissible
   Example: { "id": "a1", "type": "alert", "props": { "message": "Your changes have been saved", "variant": "success" } }

10. PROGRESS - Progress bars
    Required: value (0-100)
    Optional: max (default 100), label, showPercentage
    Example: { "id": "p1", "type": "progress", "props": { "value": 67, "label": "Project Progress", "showPercentage": true } }

11. FORM - Forms with inputs
    Optional: title, submitLabel, onSubmit
    Children: input, select components
    Example: { "id": "f1", "type": "form", "props": { "title": "Contact Form", "submitLabel": "Send Message" }, "children": [...] }

12. INPUT - Text inputs
    Required: name, label
    Optional: placeholder, type ("text" | "email" | "password" | "number" | "tel"), required, defaultValue
    Example: { "id": "i1", "type": "input", "props": { "name": "email", "label": "Email Address", "type": "email", "required": true } }

13. SELECT - Dropdown selects
    Required: name, label, options (array of {value, label})
    Optional: required, defaultValue
    Example: { "id": "s1", "type": "select", "props": { "name": "country", "label": "Country", "options": [{"value": "us", "label": "United States"}] } }

14. CONTAINER - Layout containers
    Optional: direction ("row" | "column"), gap ("sm" | "md" | "lg"), align ("start" | "center" | "end")
    Children: Any components
    Example: { "id": "ct1", "type": "container", "props": { "direction": "row", "gap": "md" }, "children": [...] }

15. DIVIDER - Horizontal dividers
    Optional: label
    Example: { "id": "d1", "type": "divider", "props": { "label": "OR" } }

16. IMAGE - Images
    Required: src, alt
    Optional: width, height, rounded
    Example: { "id": "img1", "type": "image", "props": { "src": "https://via.placeholder.com/300", "alt": "Product image" } }

DATA GENERATION RULES (CRITICAL - FOLLOW EXACTLY):

1. Labels & Text: ALWAYS provide clear, descriptive, NON-EMPTY text
   ✓ Good: "Mark as Read", "View Details", "Payment Successful"
   ✗ Bad: "", " ", "Button", "Label"

2. Timestamps: Use realistic relative or absolute times
   ✓ Good: "2 hours ago", "Jan 15, 2024", "Today at 3:45 PM"
   ✗ Bad: "timestamp", "", "[time]"

3. Icons: Use semantic emoji indicators
   ✓ info: 📧 💬 ℹ️
   ✓ success: ✓ ✅ 🎉
   ✓ warning: ⚠️ ⚡
   ✓ error: ❌ ⛔
   ✓ action: 👁️ ✏️ 🗑️

4. Status Badges: Match context with appropriate variants
   ✓ Delivered/Success/Active → variant: "success"
   ✓ Shipped/Processing/Pending → variant: "info"
   ✓ Warning/Delayed → variant: "warning"
   ✓ Cancelled/Failed/Error → variant: "error"

5. Table Data: Generate 3-6 realistic rows minimum
   ✓ Use realistic values (order numbers: #12345, dates: Jan 15, 2024, prices: $99.99)
   ✓ Match all headers with row data
   ✓ Include action buttons in rows if needed

6. Chart Data: Provide 4-8 meaningful data points
   ✓ Use realistic ranges (revenue: $2000-$10000, counts: 10-500)
   ✓ Show trends or patterns
   ✓ Label axes clearly

7. Names: Use realistic placeholder names
   ✓ Good: "John Doe", "Jane Smith", "Alice Johnson"
   ✗ Bad: "User 1", "Name", "Person"

8. Dates: Use current month/year context (2024)
   ✓ Good: "Jan 15, 2024", "Feb 2024", "Last Monday"
   ✗ Bad: "01/01/2020", "Date", "[date]"

9. Numbers: Use realistic, context-appropriate ranges
   ✓ Prices: $19.99 - $999.99
   ✓ Quantities: 1-100
   ✓ Percentages: 0-100
   ✓ IDs: #10001-#99999

10. Status Values: Be specific and contextual
    ✓ Orders: "Delivered", "Shipped", "Processing", "Cancelled"
    ✓ Payments: "Paid", "Pending", "Failed"
    ✓ Users: "Active", "Inactive", "Suspended"

COMMON UI PATTERNS:

NOTIFICATION CARD:
{
  "id": "notif-1",
  "type": "card",
  "props": { "title": "New Message", "description": "You have a new message from John Doe" },
  "children": [
    { "id": "badge-1", "type": "badge", "props": { "label": "info", "variant": "info" } },
    { "id": "time-1", "type": "text", "props": { "content": "2 hours ago", "size": "sm" } },
    { "id": "btn-1", "type": "button", "props": { "label": "Mark as Read", "variant": "ghost", "size": "sm" } }
  ]
}

DATA TABLE WITH STATUS:
{
  "id": "orders-table",
  "type": "table",
  "props": {
    "headers": ["Order Number", "Date", "Items", "Total Amount", "Status"],
    "rows": [
      { "Order Number": "#12345", "Date": "Jan 15, 2024", "Items": "3", "Total Amount": "$99.99", "Status": "Delivered" },
      { "Order Number": "#12346", "Date": "Jan 16, 2024", "Items": "1", "Total Amount": "$49.50", "Status": "Shipped" },
      { "Order Number": "#12347", "Date": "Jan 17, 2024", "Items": "5", "Total Amount": "$249.99", "Status": "Processing" }
    ],
    "striped": true
  }
}

DASHBOARD METRICS:
{
  "id": "metrics-container",
  "type": "container",
  "props": { "direction": "row", "gap": "md" },
  "children": [
    {
      "id": "metric-1",
      "type": "card",
      "props": { "title": "Total Revenue" },
      "children": [
        { "id": "amount", "type": "heading", "props": { "content": "$12,450", "level": 2 } },
        { "id": "change", "type": "badge", "props": { "label": "+12.5%", "variant": "success" } }
      ]
    }
  ]
}

COMPLETE EXAMPLES:

Example 1 - Notification Center:
{
  "components": [
    { "id": "h1", "type": "heading", "props": { "content": "Recent Notifications", "level": 2 } },
    { "id": "clear-btn", "type": "button", "props": { "label": "Clear All", "variant": "ghost", "size": "sm" } },
    {
      "id": "notif-1",
      "type": "card",
      "children": [
        { "id": "badge-1", "type": "badge", "props": { "label": "info", "variant": "info" } },
        { "id": "title-1", "type": "heading", "props": { "content": "New Message", "level": 3 } },
        { "id": "desc-1", "type": "text", "props": { "content": "You have a new message from John Doe" } },
        { "id": "time-1", "type": "text", "props": { "content": "2 hours ago", "size": "sm" } },
        { "id": "btn-1", "type": "button", "props": { "label": "Mark as Read", "variant": "ghost", "size": "sm" } }
      ]
    },
    {
      "id": "notif-2",
      "type": "card",
      "children": [
        { "id": "badge-2", "type": "badge", "props": { "label": "success", "variant": "success" } },
        { "id": "title-2", "type": "heading", "props": { "content": "Payment Successful", "level": 3 } },
        { "id": "desc-2", "type": "text", "props": { "content": "Your payment has been processed successfully" } },
        { "id": "time-2", "type": "text", "props": { "content": "5 hours ago", "size": "sm" } },
        { "id": "btn-2", "type": "button", "props": { "label": "Mark as Read", "variant": "ghost", "size": "sm" } }
      ]
    }
  ],
  "metadata": { "title": "Notifications" }
}

Example 2 - Order History Table:
{
  "components": [
    { "id": "h1", "type": "heading", "props": { "content": "Order History", "level": 2 } },
    {
      "id": "orders-table",
      "type": "table",
      "props": {
        "headers": ["Order Number", "Date", "Items", "Total Amount", "Status"],
        "rows": [
          { "Order Number": "#12345", "Date": "Jan 15, 2024", "Items": "3", "Total Amount": "$99.99", "Status": "Delivered" },
          { "Order Number": "#12346", "Date": "Jan 16, 2024", "Items": "1", "Total Amount": "$49.50", "Status": "Shipped" },
          { "Order Number": "#12347", "Date": "Jan 17, 2024", "Items": "5", "Total Amount": "$249.99", "Status": "Processing" },
          { "Order Number": "#12348", "Date": "Jan 18, 2024", "Items": "2", "Total Amount": "$79.99", "Status": "Processing" },
          { "Order Number": "#12349", "Date": "Jan 19, 2024", "Items": "4", "Total Amount": "$159.99", "Status": "Cancelled" }
        ],
        "striped": true
      }
    }
  ],
  "metadata": { "title": "Orders" }
}

Example 3 - Project Dashboard:
{
  "components": [
    { "id": "h1", "type": "heading", "props": { "content": "Project Alpha Dashboard", "level": 1 } },
    { "id": "progress", "type": "progress", "props": { "value": 67, "label": "Overall Progress", "showPercentage": true } },
    {
      "id": "milestones",
      "type": "container",
      "props": { "direction": "row", "gap": "md" },
      "children": [
        {
          "id": "m1",
          "type": "card",
          "props": { "title": "Milestone 1" },
          "children": [
            { "id": "m1-name", "type": "text", "props": { "content": "Project Kickoff", "weight": "bold" } },
            { "id": "m1-status", "type": "badge", "props": { "label": "Completed", "variant": "success" } }
          ]
        },
        {
          "id": "m2",
          "type": "card",
          "props": { "title": "Milestone 2" },
          "children": [
            { "id": "m2-name", "type": "text", "props": { "content": "Alpha Release", "weight": "bold" } },
            { "id": "m2-status", "type": "badge", "props": { "label": "In Progress", "variant": "info" } }
          ]
        }
      ]
    },
    {
      "id": "timeline-chart",
      "type": "chart",
      "props": {
        "chartType": "bar",
        "title": "Planned vs Actual Timeline",
        "data": [
          { "milestone": "Milestone 1", "planned": 30, "actual": 28 },
          { "milestone": "Milestone 2", "planned": 45, "actual": 38 },
          { "milestone": "Milestone 3", "planned": 60, "actual": 0 }
        ],
        "xKey": "milestone",
        "yKey": "actual"
      }
    }
  ],
  "metadata": { "title": "Project Dashboard" }
}

REMEMBER:
- NEVER leave button labels empty!
- NEVER leave badge labels empty!
- ALWAYS include 3-6 rows in tables!
- ALWAYS include 4-8 data points in charts!
- ALWAYS use realistic, contextual data!
- Respond ONLY with valid JSON, no other text!`;

// Validation helper to ensure components have required fields
function validateAndFixComponent(component: any): any {
  if (!component || !component.type || !component.id) {
    console.warn('Invalid component structure:', component);
    return component;
  }

  // Ensure props object exists
  if (!component.props) {
    component.props = {};
  }

  // Validate and fix based on component type
  switch (component.type) {
    case 'button':
      if (!component.props.label || component.props.label.trim() === '') {
        console.warn('Button missing label, adding default:', component.id);
        component.props.label = 'Click Me';
      }
      break;

    case 'badge':
      if (!component.props.label || component.props.label.trim() === '') {
        console.warn('Badge missing label, adding default:', component.id);
        component.props.label = 'Badge';
      }
      break;

    case 'text':
      if (!component.props.content || component.props.content.trim() === '') {
        console.warn('Text missing content:', component.id);
        component.props.content = 'Text content';
      }
      break;

    case 'heading':
      if (!component.props.content || component.props.content.trim() === '') {
        console.warn('Heading missing content:', component.id);
        component.props.content = 'Heading';
      }
      break;

    case 'table':
      if (!component.props.headers || !Array.isArray(component.props.headers)) {
        console.warn('Table missing headers:', component.id);
        component.props.headers = [];
      }
      if (!component.props.rows || !Array.isArray(component.props.rows)) {
        console.warn('Table missing rows:', component.id);
        component.props.rows = [];
      }
      if (component.props.rows.length === 0) {
        console.warn('Table has no data rows:', component.id);
      }
      break;

    case 'chart':
      if (!component.props.data || !Array.isArray(component.props.data)) {
        console.warn('Chart missing data:', component.id);
        component.props.data = [];
      }
      if (component.props.data.length === 0) {
        console.warn('Chart has no data points:', component.id);
      }
      if (!component.props.chartType) {
        console.warn('Chart missing chartType:', component.id);
        component.props.chartType = 'bar';
      }
      break;

    case 'input':
      if (!component.props.name) {
        console.warn('Input missing name:', component.id);
        component.props.name = `input-${component.id}`;
      }
      if (!component.props.label) {
        console.warn('Input missing label:', component.id);
        component.props.label = 'Input';
      }
      break;

    case 'select':
      if (!component.props.name) {
        console.warn('Select missing name:', component.id);
        component.props.name = `select-${component.id}`;
      }
      if (!component.props.label) {
        console.warn('Select missing label:', component.id);
        component.props.label = 'Select';
      }
      if (!component.props.options || !Array.isArray(component.props.options)) {
        console.warn('Select missing options:', component.id);
        component.props.options = [];
      }
      break;

    case 'alert':
      if (!component.props.message) {
        console.warn('Alert missing message:', component.id);
        component.props.message = 'Alert message';
      }
      if (!component.props.variant) {
        component.props.variant = 'info';
      }
      break;

    case 'progress':
      if (component.props.value === undefined || component.props.value === null) {
        console.warn('Progress missing value:', component.id);
        component.props.value = 0;
      }
      break;

    case 'image':
      if (!component.props.src) {
        console.warn('Image missing src:', component.id);
        component.props.src = 'https://via.placeholder.com/300';
      }
      if (!component.props.alt) {
        component.props.alt = 'Image';
      }
      break;

    case 'list':
      if (!component.props.items || !Array.isArray(component.props.items)) {
        console.warn('List missing items:', component.id);
        component.props.items = [];
      }
      break;
  }

  // Recursively validate children
  if (component.children && Array.isArray(component.children)) {
    component.children = component.children.map(validateAndFixComponent);
  }

  return component;
}

// Validate the entire UI response
function validateUI(ui: any): any {
  if (!ui) {
    console.error('Empty UI response');
    return { components: [], metadata: {} };
  }

  if (!ui.components || !Array.isArray(ui.components)) {
    console.error('UI response missing components array');
    ui.components = [];
  }

  // Validate each component
  ui.components = ui.components.map(validateAndFixComponent);

  return ui;
}

export class GroqClient {
  private client: Groq;
  private config: ReClientConfig;

  constructor(config: ReClientConfig) {
    this.config = {
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      maxTokens: 4096,
      ...config,
    };
    this.client = new Groq({
      apiKey: config.apiKey,
      dangerouslyAllowBrowser: true,
    });
  }

  async generateUI(request: GenerateUIRequest): Promise<GenerateUIResponse> {
    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...(request.messages || []),
      { role: 'user' as const, content: request.prompt },
    ];

    const response = await this.client.chat.completions.create({
      model: request.model || this.config.model!,
      messages,
      temperature: request.temperature ?? this.config.temperature,
      max_tokens: request.maxTokens ?? this.config.maxTokens,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in response');
    }

    try {
      const ui = JSON.parse(content);
      const validatedUI = validateUI(ui);
      return {
        ui: validatedUI,
        model: response.model,
        usage: response.usage
          ? {
              promptTokens: response.usage.prompt_tokens,
              completionTokens: response.usage.completion_tokens,
              totalTokens: response.usage.total_tokens,
            }
          : undefined,
      };
    } catch (error) {
      throw new Error(`Failed to parse JSON response: ${error}`);
    }
  }

  async *streamUI(request: GenerateUIRequest): AsyncGenerator<any, void, unknown> {
    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...(request.messages || []),
      { role: 'user' as const, content: request.prompt },
    ];

    const stream = await this.client.chat.completions.create({
      model: request.model || this.config.model!,
      messages,
      temperature: request.temperature ?? this.config.temperature,
      max_tokens: request.maxTokens ?? this.config.maxTokens,
      response_format: { type: 'json_object' },
      stream: true,
    });

    let buffer = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        buffer += content;

        // Try to parse incrementally
        try {
          const partial = JSON.parse(buffer);
          if (partial.components) {
            yield { type: 'components', data: partial.components };
          }
          if (partial.metadata) {
            yield { type: 'metadata', data: partial.metadata };
          }
        } catch {
          // Not yet complete JSON, continue buffering
        }
      }
    }

    // Final parse
    try {
      const ui = JSON.parse(buffer);
      const validatedUI = validateUI(ui);
      yield { type: 'done', data: validatedUI };
    } catch (error) {
      yield { type: 'error', data: { message: 'Failed to parse final response' } };
    }
  }

  async generateUIWithCallbacks(
    request: GenerateUIRequest,
    callbacks: StreamCallbacks
  ): Promise<void> {
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
    } catch (error) {
      callbacks.onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
