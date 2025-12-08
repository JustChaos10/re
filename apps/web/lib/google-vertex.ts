import { createVertex } from '@ai-sdk/google-vertex';
import type { LanguageModelV1 } from 'ai';
import { promises as fs } from 'fs';
import path from 'path';

type ServiceAccount = {
  project_id: string;
  client_email: string;
  private_key: string;
};

let cachedCredentials: Promise<ServiceAccount> | null = null;
let cachedProvider: ReturnType<typeof createVertex> | null = null;

async function fileExists(candidate: string) {
  try {
    await fs.access(candidate);
    return true;
  } catch {
    return false;
  }
}

async function loadServiceAccount(): Promise<ServiceAccount> {
  if (!cachedCredentials) {
    cachedCredentials = (async () => {
      const inline = process.env.NEXT_VERTEX_SERVICE_ACCOUNT_JSON || process.env.VERTEX_SERVICE_ACCOUNT_JSON;
      if (inline) {
        return JSON.parse(inline) as ServiceAccount;
      }

      const pathHint =
        process.env.NEXT_VERTEX_SERVICE_ACCOUNT_PATH ||
        process.env.VERTEX_SERVICE_ACCOUNT_PATH ||
        process.env.GOOGLE_APPLICATION_CREDENTIALS ||
        'service.json';

      const candidates = [
        pathHint,
        path.resolve(pathHint),
        path.resolve(process.cwd(), pathHint),
        path.resolve(process.cwd(), '..', pathHint),
      ].filter(Boolean) as string[];

      for (const candidate of candidates) {
        if (await fileExists(candidate)) {
          const raw = await fs.readFile(candidate, 'utf-8');
          return JSON.parse(raw) as ServiceAccount;
        }
      }

      throw new Error('Unable to locate Vertex AI service account JSON. Provide NEXT_VERTEX_SERVICE_ACCOUNT_JSON or set NEXT_VERTEX_SERVICE_ACCOUNT_PATH.');
    })();
  }

  return cachedCredentials;
}

export async function getVertexModel(modelId?: string): Promise<LanguageModelV1> {
  if (!cachedProvider) {
    const credentials = await loadServiceAccount();
    const projectId = process.env.NEXT_VERTEX_PROJECT_ID || credentials.project_id;
    if (!projectId) {
      throw new Error('Vertex AI project id missing. Set NEXT_VERTEX_PROJECT_ID or include project_id in the service account file.');
    }

    cachedProvider = createVertex({
      project: projectId,
      location: process.env.NEXT_VERTEX_LOCATION || 'asia-south1',
      googleAuthOptions: {
        credentials: {
          client_email: credentials.client_email,
          private_key: credentials.private_key,
        },
      },
    });
  }

  const fallbackModel = process.env.NEXT_VERTEX_MODEL || 'gemini-2.5-flash';
  return cachedProvider(modelId ?? fallbackModel);
}
