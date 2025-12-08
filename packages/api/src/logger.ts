import fs from 'fs';
import path from 'path';

const LOG_PATH =
  process.env.API_LOG_PATH ||
  path.resolve(process.cwd(), 'logs', 're-api.log');

function ensureLogDir(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function safeSerialize(meta: unknown): string | undefined {
  if (meta instanceof Error) {
    return JSON.stringify(
      {
        name: meta.name,
        message: meta.message,
        stack: meta.stack,
      },
      null,
      2
    );
  }
  try {
    return JSON.stringify(meta, null, 2);
  } catch {
    return String(meta);
  }
}

export function logError(message: string, meta?: unknown) {
  ensureLogDir(LOG_PATH);
  const serializedMeta = safeSerialize(meta);
  const line =
    `[${new Date().toISOString()}] ERROR ${message}` +
    (serializedMeta ? `\n${serializedMeta}\n` : '\n');
  fs.appendFileSync(LOG_PATH, line);
}

export function logInfo(message: string, meta?: unknown) {
  ensureLogDir(LOG_PATH);
  const serializedMeta = safeSerialize(meta);
  const line =
    `[${new Date().toISOString()}] INFO ${message}` +
    (serializedMeta ? `\n${serializedMeta}\n` : '\n');
  fs.appendFileSync(LOG_PATH, line);
}
