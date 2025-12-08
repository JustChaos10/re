import { useState, useCallback, useRef } from 'react';
import { GeminiClient } from '../client';
import { GenerateUIRequest, Component, ServiceAccountCredentials } from '../types';
import { validateUI } from '../utils/validator';

export interface UseGenerateUIOptions {
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

export interface UseGenerateUIReturn {
  components: Component[];
  metadata: any;
  isLoading: boolean;
  error: Error | null;
  generate: (prompt: string, options?: Partial<GenerateUIRequest>) => Promise<void>;
  stream: (prompt: string, options?: Partial<GenerateUIRequest>) => Promise<void>;
  reset: () => void;
}

export function useGenerateUI(options: UseGenerateUIOptions): UseGenerateUIReturn {
  const [components, setComponents] = useState<Component[]>([]);
  const [metadata, setMetadata] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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
    setComponents([]);
    setMetadata(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const generate = useCallback(
    async (prompt: string, requestOptions?: Partial<GenerateUIRequest>) => {
      setIsLoading(true);
      setError(null);

      const maxRetries = options.maxRetries || 3;
      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const response = await clientRef.current.generateUI({
            prompt,
            ...requestOptions,
          });

          const validation = validateUI(response.ui.components || []);
          if (!validation.ok) {
            // Non-blocking validation - warn but still render
            console.warn('[Re Validation]', validation.reason);
          }
          // Always set components even if validation warns
          setComponents(response.ui.components || []);
          setMetadata(response.ui.metadata || null);
          logTelemetry('generate', prompt, {
            model: response.model,
            temperature: requestOptions?.temperature ?? options.temperature,
            topP: requestOptions?.topP ?? options.topP,
            valid: validation.ok,
            retryCount: attempt - 1,
          });

          setIsLoading(false);
          return; // Success - exit retry loop
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));

          if (attempt < maxRetries) {
            console.log(`[Re] Retry ${attempt}/${maxRetries} after error:`, lastError.message);
            // Exponential backoff: 1s, 2s, 4s
            await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
          }
        }
      }

      // All retries exhausted
      setError(lastError!);
      options.onError?.(lastError!);
      setIsLoading(false);
    },
    [options]
  );

  const stream = useCallback(
    async (prompt: string, requestOptions?: Partial<GenerateUIRequest>) => {
      setIsLoading(true);
      setError(null);
      setComponents([]);
      setMetadata(null);
      const started = performance.now();
      let acc: Component[] = [];

      try {
        await clientRef.current.generateUIWithCallbacks(
          { prompt, ...requestOptions },
          {
            onComponent: (comps) => {
              acc = [...acc, ...comps];
              setComponents(acc);
            },
            onMetadata: (meta) => {
              setMetadata(meta);
            },
            onError: (err) => {
              setError(err);
              options.onError?.(err);
            },
            onDone: () => {
              const validation = validateUI(acc || []);
              if (!validation.ok) {
                // Non-blocking validation - warn but still render
                console.warn('[Re Validation]', validation.reason);
              }
              logTelemetry('stream', prompt, {
                model: requestOptions?.model ?? options.model,
                temperature: requestOptions?.temperature ?? options.temperature,
                topP: requestOptions?.topP ?? options.topP,
                valid: validation.ok,
                durationMs: performance.now() - started,
                chunkCount: acc.length,
              });
              setIsLoading(false);
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
    [options]
  );

  return {
    components,
    metadata,
    isLoading,
    error,
    generate,
    stream,
    reset,
  };
}

function hashPrompt(prompt: string) {
  let h = 0;
  for (let i = 0; i < prompt.length; i++) h = (h << 5) - h + prompt.charCodeAt(i);
  return Math.abs(h).toString(16);
}

function logTelemetry(kind: 'generate' | 'stream', prompt: string, extras: Record<string, any>) {
  console.log('[Re Telemetry]', {
    kind,
    promptHash: hashPrompt(prompt),
    ...extras,
  });
}
