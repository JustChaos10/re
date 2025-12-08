import { GeneratedUI, Component } from './components';

export interface StreamChunk {
  type: 'components' | 'metadata' | 'error' | 'done';
  data: any;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Style context to influence UI generation
 */
export interface StyleContext {
  /** Visual density: compact uses less space, spacious uses more */
  density?: 'compact' | 'normal' | 'spacious';
  /** Color scheme preference */
  colorScheme?: 'light' | 'dark';
  /** Overall visual style */
  style?: 'minimal' | 'modern' | 'corporate' | 'playful';
}

export interface GenerateUIRequest {
  prompt: string;
  messages?: ChatMessage[];
  model?: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  stream?: boolean;
  currentUI?: any;
  /** Optional style context to influence the generated UI */
  styleContext?: StyleContext;
}

export interface GenerateUIResponse {
  ui: GeneratedUI;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface StreamCallbacks {
  onComponent?: (components: Component[]) => void;
  onMetadata?: (metadata: any) => void;
  onError?: (error: Error) => void;
  onDone?: () => void;
}

export interface ServiceAccountCredentials {
  client_email: string;
  private_key: string;
  project_id?: string;
  [key: string]: any;
}

export interface ReClientConfig {
  projectId: string;
  location?: string;
  model?: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  maxRetries?: number;
  credentials?: ServiceAccountCredentials;
  keyFilename?: string;
}
