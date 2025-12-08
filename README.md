# Re - Generative UI Framework

Build agentic interfaces beyond text — powered by Google Vertex AI Gemini.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)

## ✨ Features

- 🤖 **Gemini-Powered** — UI generation with streaming support via Vertex AI
- 🎨 **16+ Components** — Ready-to-render components with theming
- ⚛️ **React Hooks** — `useGenerateUI` and `useChat` for generate/stream/chat flows
- 🔌 **Backend API** — Express server with SSE streaming
- 📦 **TypeScript-First** — Full type safety across all packages

## 📦 Packages

| Package | Description |
|---------|-------------|
| [@re/core](./packages/core) | Gemini client + React hooks |
| [@re/react-ui](./packages/react-ui) | React component library |
| [@re/api](./packages/api) | Backend API server |
| [demo](./examples/demo) | Example application |

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **npm** 9+
- **Google Cloud** account with Vertex AI API enabled

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/re.git
cd re
npm install
```

### 2. Set Up Google Cloud Credentials

You'll need a **Google Cloud service account** with Vertex AI permissions:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable the **Vertex AI API**:
   - Navigate to **APIs & Services** > **Enable APIs and Services**
   - Search for "Vertex AI API" and enable it
4. Create a service account:
   - Go to **IAM & Admin** > **Service Accounts**
   - Click **Create Service Account**
   - Give it a name (e.g., `re-generative-ui`)
   - Grant the role: **Vertex AI User**
5. Create a JSON key:
   - Click on your service account
   - Go to **Keys** > **Add Key** > **Create new key**
   - Choose **JSON** and download it
6. Save the downloaded file as `service.json` in the project root

### 3. Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env
```

Edit `.env` with your values:

```env
# Your Google Cloud Project ID
VERTEX_PROJECT_ID=your-gcp-project-id

# Region (us-central1 recommended)
VERTEX_LOCATION=us-central1

# Model to use
VERTEX_MODEL=gemini-2.5-flash

# Path to your service account JSON
VERTEX_SERVICE_ACCOUNT_PATH=./service.json

# API Server
PORT=3001
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 4. Run the Application

```bash
# Start the API server
npm run dev:api

# In another terminal, start the demo app
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to see the demo!

## 🔌 API Endpoints

The backend API exposes the following endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/generate` | Non-streaming generation |
| POST | `/api/generate/stream` | SSE streaming generation |
| POST | `/v1/chat/completions` | OpenAI-compatible endpoint |

## 🪝 Hooks API

### `useGenerateUI`

```tsx
import { useGenerateUI } from '@re/core';

function App() {
  const { components, generate, isLoading } = useGenerateUI({
    projectId: process.env.VERTEX_PROJECT_ID!,
    credentials: JSON.parse(process.env.VERTEX_SERVICE_ACCOUNT_JSON!),
  });

  return (
    <button onClick={() => generate('Show me a sales dashboard')} disabled={isLoading}>
      Generate UI
    </button>
  );
}
```

### Options

| Option | Required | Description |
|--------|----------|-------------|
| `projectId` | Yes | Your GCP project ID |
| `credentials` | Yes* | Service account object |
| `keyFilename` | Yes* | Or path to service account file |
| `location` | No | Region (default: `us-central1`) |
| `model` | No | Model name (default: `gemini-2.5-flash`) |
| `temperature` | No | Sampling temperature |
| `topP` | No | Nucleus sampling |
| `maxTokens` | No | Max output tokens |
| `onError` | No | Error callback |

*Either `credentials` or `keyFilename` is required

## 🎨 Components

The component library includes:

**Layout:** Container, Stack, Section, Split, Spacer, Divider

**Content:** Text, Heading, Card, List, Table, Image, Illustration

**Data:** Chart, Stat, Progress, Badge, Tag Group, Avatar

**Interactive:** Button, Form, Input, Select

**Feedback:** Alert, Callout, Icon

## 🔐 Security

> ⚠️ **Important:** Never commit your credentials to git!

- ✅ `service.json` is already in `.gitignore`
- ✅ `.env` is already in `.gitignore`
- Load credentials **only on the server** — never ship them to the browser
- Set `ALLOWED_ORIGINS` for CORS protection
- Run behind HTTPS in production

## 📁 Project Structure

```
re/
├── packages/
│   ├── api/          # Backend API server
│   ├── core/         # Gemini client & hooks
│   └── react-ui/     # React components
├── examples/
│   └── demo/         # Demo application
├── apps/
│   └── web/          # Web application
├── .env.example      # Environment template
└── service.json      # Your credentials (gitignored)
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT
