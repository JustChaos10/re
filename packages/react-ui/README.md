# @re/react-ui

React UI component library for Re Generative UI.

## Installation

```bash
npm install @re/react-ui @re/core react react-dom
```

## Features

- 🎨 16+ pre-built components
- 🌓 Dark mode support
- 📊 Data visualization with charts
- 💅 Modern, clean design
- ♿ Accessible components
- 📱 Responsive design

## Usage

### Import Styles

```tsx
import '@re/react-ui/styles.css';
```

### Basic Components

```tsx
import { Text, Heading, Button, Card } from '@re/react-ui';

function App() {
  return (
    <Card
      component={{
        id: '1',
        type: 'card',
        props: { title: 'My Card' },
        children: [
          {
            id: '2',
            type: 'text',
            props: { content: 'Hello world!' }
          }
        ]
      }}
    />
  );
}
```

### Component Renderer

```tsx
import { ComponentRenderer, ReRenderer } from '@re/react-ui';

// Render single component
<ComponentRenderer component={component} />

// Render multiple components
<ReRenderer components={components} />
```

### Chat Interface

```tsx
import { ReChat } from '@re/react-ui';

function App() {
  return (
    <ReChat
      projectId={process.env.VERTEX_PROJECT_ID!}
      credentials={JSON.parse(process.env.VERTEX_SERVICE_ACCOUNT_JSON!)}
      placeholder="Type a message..."
      onAction={(actionId, data) => {
        console.log('Action:', actionId, data);
      }}
    />
  );
}
```
> Only provide credentials from server-side contexts (e.g., server components/API routes).

### Theming

```tsx
import { ThemeProvider, useTheme } from '@re/react-ui';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>Toggle</button>;
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <ThemeToggle />
    </ThemeProvider>
  );
}
```

## Components

All available components:
- Text, Heading, Button, Card
- List, Table, Chart
- Form, Input, Select
- Alert, Progress, Badge
- Image, Divider, Container

See [component documentation](../../README.md#-available-components) for details.

## License

MIT
