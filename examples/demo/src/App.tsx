import { useState } from 'react';
import { ThemeProvider, useTheme, ReRenderer } from '@re/react-ui';
import '@re/react-ui/styles.css';
import './App.css';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme} className="theme-toggle">
      {theme === 'light' ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}

function ChatDemo() {
  const [prompt, setPrompt] = useState('');
  const [components, setComponents] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [thinking, setThinking] = useState<string>('');

  const examplePrompts = [
    'Sales dashboard',
    'User profile',
    'Pricing table',
    'Sign-up form',
  ];

  const handleAction = async (actionId: string, data?: any) => {
    const followUp = `User triggered action: "${actionId}"${data ? ` with data: ${JSON.stringify(data)}` : ''
      }. Update the UI accordingly with clearer hierarchy and data realism.`;
    await handleGenerate(followUp, components);
  };

  const handleGenerate = async (text: string = prompt, currentUI?: any[]) => {
    if (!text.trim()) {
      setError('Please enter a prompt.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setComponents([]);
    setMetadata(null);
    setThinking('');

    try {
      const base = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${base}/api/generate/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, currentUI }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error || err?.message || `Request failed (${response.status})`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedComponents: any[] = [];

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6));

            switch (data.type) {
              case 'components':
                accumulatedComponents = [...accumulatedComponents, ...data.data];
                setComponents([...accumulatedComponents]);
                break;
              case 'metadata':
                setMetadata(data.data);
                setThinking(data.data?.thinking || '');
                break;
              case 'error':
                throw new Error(data.data.message);
              case 'done':
                break;
            }
          } catch (parseErr) {
            console.warn('[Re] Failed to parse SSE chunk:', parseErr);
          }
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Generation failed');
      setComponents([]);
      setMetadata(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <div className="desktop-shell">
      <header className="topbar">
        <div className="topbar-titles">
          <h1>Re Workbench</h1>
          <p>Generative UI powered by Gemini</p>
        </div>
        <div className="topbar-actions">
          <span className="version-chip">v1.0</span>
          <ThemeToggle />
        </div>
      </header>

      <main className="workspace">
        <section className="panel panel-chat">
          <div className="panel-heading">Prompt</div>
          <div className="panel-body">
            <div className="config-form">
              <label htmlFor="prompt">Describe the UI you want</label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="prompt-textarea"
                placeholder="e.g. Show me a sales dashboard with KPIs, revenue chart, and recent transactions table..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleGenerate();
                  }
                }}
              />

              <div className="prompt-actions">
                <button
                  className="generate-button"
                  onClick={() => handleGenerate()}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <span className="button-icon">⏳</span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <span className="button-icon">✨</span>
                      Generate UI
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="error-display">
                  <div className="error-header">
                    <span className="error-icon">⚠️</span>
                    <span className="error-title">Generation Failed</span>
                  </div>
                  <div className="error-message">{error}</div>
                  <div className="error-actions">
                    <button
                      className="retry-button"
                      onClick={() => {
                        setError(null);
                        handleGenerate();
                      }}
                    >
                      Retry
                    </button>
                    <button
                      className="dismiss-button"
                      onClick={() => setError(null)}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="panel panel-preview">
          <div className="panel-heading">Output</div>
          <div className="panel-body">
            <div className="preview-surface">
              {isGenerating && components.length === 0 && (
                <div className="streaming-indicator">
                  <div className="pulse-dot" />
                  <span>AI is generating your interface...</span>
                </div>
              )}

              {(metadata || thinking) && (
                <div className="thinking-container">
                  {metadata?.title && (
                    <div className="thinking-header">
                      <h3 className="thinking-title">{metadata.title}</h3>
                      {metadata.description && (
                        <p className="thinking-description">{metadata.description}</p>
                      )}
                    </div>
                  )}
                  {thinking && (
                    <details className="thinking-details">
                      <summary className="thinking-summary">
                        <span className="thinking-icon">💭</span>
                        {isGenerating ? 'AI Thinking...' : 'View AI Reasoning'}
                      </summary>
                      <div className="thinking-content">{thinking}</div>
                    </details>
                  )}
                </div>
              )}

              {components.length > 0 ? (
                <div className="components-fade-in">
                  <ReRenderer components={components} onAction={handleAction} />
                </div>
              ) : !isGenerating ? (
                <div className="preview-empty">
                  <div className="empty-icon-container">
                    <span className="empty-icon">🎨</span>
                  </div>
                  <h3>Ready to create</h3>
                  <p>Describe a desktop interface and watch AI build it for you in real-time.</p>
                  <div className="example-prompts">
                    {examplePrompts.map((example) => (
                      <button
                        key={example}
                        className="example-chip"
                        onClick={() => handleExampleClick(example)}
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <ChatDemo />
    </ThemeProvider>
  );
}

export default App;
