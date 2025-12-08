import { useState, useCallback, useRef } from 'react';
import { GeminiClient } from '../client';
import { ChatMessage, Component, ServiceAccountCredentials } from '../types';
import {
  calculateMaxDepth,
  collectComponentTypes,
  extractPropsUsage,
  hasPlaceholderData,
} from '../utils/component-metrics';
import { validateUI } from '../utils/validator';

export interface UseChatOptions {
  projectId: string;
  location?: string;
  model?: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  maxRetries?: number;
  credentials?: ServiceAccountCredentials;
  keyFilename?: string;
  onError?: (error: Error) => void;
}

export interface ChatMessageWithUI extends ChatMessage {
  components?: Component[];
  metadata?: any;
  timestamp: number;
}

export interface UseChatReturn {
  messages: ChatMessageWithUI[];
  isLoading: boolean;
  error: Error | null;
  sendMessage: (content: string, currentUI?: any) => Promise<void>;
  reset: () => void;
}

export function useChat(options: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessageWithUI[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const latestGenerationRef = useRef<{ components: Component[]; metadata?: any }>({
    components: [],
    metadata: undefined,
  });

  const clientRef = useRef<GeminiClient>(
    new GeminiClient({
      projectId: options.projectId,
      location: options.location,
      model: options.model,
      temperature: options.temperature,
      topP: options.topP,
      maxTokens: options.maxTokens,
      maxRetries: options.maxRetries,
      credentials: options.credentials,
      keyFilename: options.keyFilename,
    })
  );

  const reset = useCallback(() => {
    setMessages([]);
    setError(null);
    setIsLoading(false);
    latestGenerationRef.current = { components: [], metadata: undefined };
  }, []);

  const sendMessage = useCallback(
    async (content: string, currentUI?: any) => {
      const timestamp = Date.now();
      const userMessage: ChatMessageWithUI = {
        role: 'user',
        content,
        timestamp,
      };

      // Create assistant message placeholder
      const assistantMessage: ChatMessageWithUI = {
        role: 'assistant',
        content: '',
        components: [],
        timestamp: timestamp + 1,
      };

      latestGenerationRef.current = { components: [], metadata: undefined };
      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsLoading(true);
      setError(null);

      // To reduce token usage, only keep the last user/assistant pair
      const recent = [...messages, userMessage].slice(-2);
      const history: ChatMessage[] = recent.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const updateAssistantMessage = (
        updater: (message: ChatMessageWithUI) => ChatMessageWithUI
      ) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.timestamp === assistantMessage.timestamp && msg.role === 'assistant'
              ? updater(msg)
              : msg
          )
        );
      };

      try {
        await clientRef.current.generateUIWithCallbacks(
          {
            prompt: content,
            messages: history,
            model: options.model,
            temperature: options.temperature,
            topP: options.topP,
            maxTokens: options.maxTokens,
            currentUI,
          },
          {
            onComponent: (newComponents) => {
              latestGenerationRef.current.components = [
                ...(latestGenerationRef.current.components || []),
                ...newComponents,
              ];
              updateAssistantMessage((msg) => ({
                ...msg,
                components: [...(msg.components || []), ...newComponents],
              }));
            },
            onMetadata: (meta) => {
              latestGenerationRef.current.metadata = meta;
              updateAssistantMessage((msg) => ({
                ...msg,
                metadata: meta,
              }));
            },
            onError: (err) => {
              setError(err);
              options.onError?.(err);
            },
            onDone: () => {
              setIsLoading(false);
              const snapshot = latestGenerationRef.current;
              const validation = validateUI(snapshot.components || []);
              if (!validation.ok) {
                const err = new Error(validation.reason);
                setError(err);
                options.onError?.(err);
              }
              if (snapshot.components.length > 0) {
                console.log('[Re Telemetry Chat]', {
                  promptHash: hashPrompt(content),
                  componentTypes: collectComponentTypes(snapshot.components),
                  nestingDepth: calculateMaxDepth(snapshot.components),
                  propsUsed: extractPropsUsage(snapshot.components),
                  hasRealisticData: !hasPlaceholderData(snapshot.components),
                  metadataPresent: Boolean(snapshot.metadata),
                  valid: validation.ok,
                });
              }
              latestGenerationRef.current = { components: [], metadata: undefined };
            },
          }
        );
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options.onError?.(error);
        setIsLoading(false);
      }
    },
    [messages, options]
  );

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    reset,
  };
}

function hashPrompt(prompt: string) {
  let h = 0;
  for (let i = 0; i < prompt.length; i++) h = (h << 5) - h + prompt.charCodeAt(i);
  return Math.abs(h).toString(16);
}
