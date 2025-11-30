import { useState } from 'react';
import { ThemeProvider, useTheme, ReChat, useGenerateUI } from '@re/react-ui';
import '@re/react-ui/styles.css';
import './App.css';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className="theme-toggle">
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}

function ChatDemo() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('groq-api-key') || '');
  const [isConfigured, setIsConfigured] = useState(!!localStorage.getItem('groq-api-key'));

  const handleSaveApiKey = () => {
    localStorage.setItem('groq-api-key', apiKey);
    setIsConfigured(true);
  };

  if (!isConfigured) {
    return (
      <div className="config-screen">
        <div className="config-card">
          <h1>🚀 Re - Generative UI</h1>
          <p>Powered by Groq</p>

          <div className="config-form">
            <label htmlFor="api-key">Enter your Groq API Key:</label>
            <input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="gsk_..."
              className="re-form-input"
            />
            <button
              onClick={handleSaveApiKey}
              disabled={!apiKey}
              className="re-button re-button-primary re-button-lg"
            >
              Get Started
            </button>

            <p className="config-help">
              Don't have an API key?{' '}
              <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer">
                Get one from Groq
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>Re - Generative UI</h1>
          <p>Build agentic interfaces beyond text • Powered by Groq</p>
        </div>
        <div className="header-actions">
          <button
            onClick={() => {
              localStorage.removeItem('groq-api-key');
              setIsConfigured(false);
            }}
            className="re-button re-button-ghost re-button-sm"
          >
            Change API Key
          </button>
          <ThemeToggle />
        </div>
      </header>

      <div className="chat-wrapper">
        <ReChat
          apiKey={apiKey}
          placeholder="Ask me to create a UI... (e.g., 'Show me a sales dashboard')"
          className="chat-interface"
          onError={(error) => {
            console.error('Chat error:', error);
          }}
        />
      </div>

      <footer className="app-footer">
        <p>
          Try: "Show me a dashboard" • "Create a contact form" • "Display sales data as a chart"
        </p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <ChatDemo />
    </ThemeProvider>
  );
}

export default App;
