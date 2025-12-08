import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useChat, UseChatOptions, generateReactCode } from '@re/core';
import { ComponentRenderer } from '../renderer';

export interface ReChatProps extends UseChatOptions {
  placeholder?: string;
  className?: string;
  onAction?: (actionId: string, data?: any) => void;
  onComponentGenerated?: (components: any[]) => void;
  renderComponents?: boolean;
  currentUI?: any;
  onStatusChange?: (isLoading: boolean) => void;
}

export interface ReChatRef {
  sendMessage: (content: string, currentUI?: any) => Promise<void>;
}

export const ReChat = forwardRef<ReChatRef, ReChatProps>(({
  projectId,
  location,
  model,
  temperature,
  topP,
  maxTokens,
  maxRetries,
  credentials,
  keyFilename,
  placeholder = 'Type a message...',
  className,
  onAction,
  onError,
  onComponentGenerated,
  renderComponents = true,
  currentUI,
  onStatusChange,
}, ref) => {
  const [input, setInput] = useState('');
  const [showCode, setShowCode] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, error, sendMessage } = useChat({
    projectId,
    location,
    model,
    temperature,
    topP,
    maxTokens,
    maxRetries,
    credentials,
    keyFilename,
    onError,
  });

  useImperativeHandle(ref, () => ({
    sendMessage
  }));

  // Notify parent when new components are generated
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && lastMessage.components && lastMessage.components.length > 0) {
      onComponentGenerated?.(lastMessage.components);
    }
  }, [messages, onComponentGenerated]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    onStatusChange?.(isLoading);
  }, [messages, isLoading, onStatusChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input;
    setInput('');
    await sendMessage(message, currentUI);
  };

  const toggleCode = (timestamp: number) => {
    setShowCode(prev => ({ ...prev, [timestamp]: !prev[timestamp] }));
  };

  return (
    <div className={`re-chat-container ${className || ''}`}>
      {error && (
        <div className="re-alert re-alert-error" style={{ position: 'sticky', top: 0, zIndex: 2 }}>
          <div className="re-alert-title">Generation error</div>
          <div className="re-alert-message">{error.message}</div>
          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
            <button
              className="re-button re-button-secondary re-button-sm"
              disabled={isLoading}
              onClick={async () => {
                const lastUser = [...messages].reverse().find(m => m.role === 'user');
                if (lastUser) {
                  await sendMessage(lastUser.content, currentUI);
                }
              }}
            >
              Retry last prompt
            </button>
          </div>
        </div>
      )}
      <div className="re-chat-messages">
        {messages.map((message) => (
          <div
            key={message.timestamp}
            className={`re-chat-message re-chat-message-${message.role}`}
          >
            {message.role === 'user' ? (
              <div className="re-chat-message-content">{message.content}</div>
            ) : (
              <div className="re-chat-message-content">
                {message.components && message.components.length > 0 ? (
                  <>
                    <div className="re-chat-actions" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => toggleCode(message.timestamp)}
                        className="re-button re-button-ghost re-button-sm"
                        style={{ fontSize: '0.75rem' }}
                      >
                        {showCode[message.timestamp] ? 'Hide Code' : 'Show Code'}
                      </button>
                    </div>
                    
                    {showCode[message.timestamp] ? (
                      <pre style={{ 
                        background: 'var(--re-bg-secondary)', 
                        padding: '1rem', 
                        borderRadius: 'var(--re-radius-md)',
                        overflowX: 'auto',
                        fontSize: '0.875rem'
                      }}>
                        <code>{generateReactCode(message.components)}</code>
                      </pre>
                    ) : (
                      renderComponents ? (
                        message.components.map((component) => (
                          <ComponentRenderer
                            key={component.id}
                            component={component}
                            onAction={onAction}
                          />
                        ))
                      ) : (
                        <div style={{ 
                          padding: '0.75rem', 
                          background: 'var(--re-bg-secondary)', 
                          borderRadius: 'var(--re-radius-md)',
                          border: '1px solid var(--re-border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <span>✨ UI Artifact Generated</span>
                        </div>
                      )
                    )}
                  </>
                ) : (
                  <div style={{ color: 'var(--re-text-secondary)' }}>Generating...</div>
                )}
              </div>
            )}
          </div>
        ))}
        {error && (
          <div className="re-alert re-alert-error">
            <div className="re-alert-title">Error</div>
            <div className="re-alert-message">{error.message}</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="re-chat-input-container">
        <form className="re-chat-input-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            className="re-chat-input"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="re-button re-button-primary re-button-md"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
        {isLoading && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--re-text-secondary)' }}>
            Generating…
          </div>
        )}
      </div>
    </div>
  );
});
