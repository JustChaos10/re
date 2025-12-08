'use client';

import React from 'react';
import { useState, useTransition } from 'react';
import type { RenderInterfacePayload } from '@/lib/schema';
import { DynamicRenderer } from './dynamic-renderer';

type ChatInterfaceProps = {
  generateInterface: (payload: { prompt: string }) => Promise<RenderInterfacePayload>;
};

export function ChatInterface({ generateInterface }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [uiPayload, setUiPayload] = useState<RenderInterfacePayload>({ components: [] });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) return;

    startTransition(async () => {
      try {
        setError(null);
        const response = await generateInterface({ prompt: input });
        setUiPayload(response);
        setInput('');
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Failed to generate interface');
      }
    });
  };

  return (
    <div style={containerStyle}>
      <section style={panelStyle}>
        <h1 style={titleStyle}>C1-style Generative UI</h1>
        <p style={subtitleStyle}>
          Ask a question and Gemini 2.5 Flash will respond with a JSON UI schema rendered below.
        </p>
        <form onSubmit={handleSubmit} style={formStyle}>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder=\"e.g. Compare Apple vs Tesla over the last week\"
            style={textareaStyle}
            rows={4}
          />
          <div style={formFooterStyle}>
            <button type=\"submit\" style={buttonStyle} disabled={isPending}>
              {isPending ? 'Thinking…' : 'Generate interface'}
            </button>
            <p style={helperTextStyle}>System prompt enforces summary vs comparison heuristics.</p>
          </div>
        </form>
        {error && <p style={errorStyle}>{error}</p>}
      </section>

      <section style={resultsLayoutStyle}>
        <div style={rendererColumnStyle}>
          <h2 style={sectionHeadingStyle}>Rendered Components</h2>
          <DynamicRenderer components={uiPayload.components} />
        </div>
        <div style={logColumnStyle}>
          <h2 style={sectionHeadingStyle}>JSON payload</h2>
          <pre style={codeBlockStyle}>
            {JSON.stringify(uiPayload, null, 2)}
          </pre>
        </div>
      </section>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '2rem 1.5rem 3rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

const panelStyle: React.CSSProperties = {
  borderRadius: 32,
  padding: '2rem',
  background: '#0f172a',
  color: '#fff',
  boxShadow: '0 40px 120px rgba(15, 23, 42, 0.45)',
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '2.5rem',
  fontWeight: 600,
};

const subtitleStyle: React.CSSProperties = {
  marginTop: '0.75rem',
  marginBottom: '1.5rem',
  color: '#cbd5ff',
  fontSize: '1rem',
  maxWidth: 640,
};

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const textareaStyle: React.CSSProperties = {
  borderRadius: 24,
  border: '1px solid rgba(255,255,255,0.2)',
  background: 'rgba(15,23,42,0.3)',
  color: '#fff',
  fontSize: '1rem',
  padding: '1rem 1.5rem',
  resize: 'vertical',
};

const formFooterStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
  flexWrap: 'wrap',
};

const buttonStyle: React.CSSProperties = {
  border: 'none',
  borderRadius: 999,
  padding: '0.85rem 1.75rem',
  fontSize: '1rem',
  fontWeight: 600,
  background: 'linear-gradient(120deg,#60a5fa,#7c3aed)',
  color: '#fff',
};

const helperTextStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  margin: 0,
  color: '#9db4ff',
};

const errorStyle: React.CSSProperties = {
  marginTop: '0.5rem',
  color: '#fecaca',
  fontWeight: 600,
};

const resultsLayoutStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1.1fr 0.9fr',
  gap: '1.25rem',
};

const rendererColumnStyle: React.CSSProperties = {
  borderRadius: 28,
  background: '#fff',
  padding: '1.5rem',
  boxShadow: '0 25px 70px rgba(15, 23, 42, 0.08)',
};

const logColumnStyle: React.CSSProperties = {
  borderRadius: 28,
  background: '#0b1221',
  padding: '1.5rem',
  color: '#f5f6ff',
  boxShadow: '0 25px 70px rgba(15, 23, 42, 0.18)',
  maxHeight: '720px',
  overflow: 'auto',
};

const sectionHeadingStyle: React.CSSProperties = {
  margin: '0 0 0.75rem',
  fontSize: '1.25rem',
  color: '#0b1221',
};

const codeBlockStyle: React.CSSProperties = {
  borderRadius: 20,
  background: '#11172b',
  color: '#e0e9ff',
  padding: '1rem',
  fontSize: '0.85rem',
  maxHeight: '520px',
  overflow: 'auto',
  border: '1px solid #1f2a46',
};
