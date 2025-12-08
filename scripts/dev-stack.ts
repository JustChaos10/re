import { ChildProcess, spawn } from 'node:child_process';
import net from 'node:net';

type Proc = ChildProcess & { label?: string };

const processes: Proc[] = [];

function log(message: string) {
  console.log(`[dev-stack] ${message}`);
}

function start(label: string, cmd: string, args: string[], env: NodeJS.ProcessEnv = {}): Proc {
  log(`starting ${label}: ${cmd} ${args.join(' ')}`);

  const child = spawn(cmd, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32', // makes npm resolvable on Windows shells
    env: {
      ...process.env,
      ...env,
    },
  }) as Proc;

  child.label = label;
  processes.push(child);

  child.on('exit', (code, signal) => {
    log(`${label} exited with code=${code ?? 'null'} signal=${signal ?? 'null'}`);
    shutdown(signal ?? 'SIGTERM');
    process.exit(code === null ? 1 : code);
  });

  return child;
}

function shutdown(signal: NodeJS.Signals | number = 'SIGTERM') {
  processes.forEach((proc) => {
    if (proc.exitCode === null) {
      log(`stopping ${proc.label ?? 'process'}...`);
      proc.kill(signal);
    }
  });
}

process.on('SIGINT', () => {
  log('received SIGINT, shutting down...');
  shutdown('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('received SIGTERM, shutting down...');
  shutdown('SIGTERM');
  process.exit(0);
});

async function canListen(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, host);
  });
}

async function isPortFree(port: number): Promise<boolean> {
  // Check both IPv6 and IPv4; Windows dual-stack sockets can hide conflicts if we only probe 0.0.0.0.
  const hosts = ['::', '0.0.0.0'];
  for (const host of hosts) {
    // eslint-disable-next-line no-await-in-loop
    if (!(await canListen(host, port))) {
      return false;
    }
  }
  return true;
}

async function findAvailablePort(start: number, attempts = 10): Promise<number> {
  for (let i = 0; i < attempts; i += 1) {
    const port = start + i;
    // eslint-disable-next-line no-await-in-loop
    if (await isPortFree(port)) return port;
  }
  throw new Error(`No free port found from ${start} to ${start + attempts - 1}`);
}

async function main() {
  const desiredApiPort = Number(process.env.PORT) || 3002;
  const desiredDemoPort = Number(process.env.DEMO_PORT) || 5173;

  const apiPort = await findAvailablePort(desiredApiPort);
  const demoPort = await findAvailablePort(desiredDemoPort);

  if (apiPort !== desiredApiPort) {
    log(`PORT ${desiredApiPort} busy, using ${apiPort} for API`);
  }
  if (demoPort !== desiredDemoPort) {
    log(`PORT ${desiredDemoPort} busy, using ${demoPort} for demo`);
  }

  start('api', 'npm', ['run', 'dev:api'], {
    PORT: String(apiPort),
  });

  start('demo', 'npm', ['run', 'dev', '--workspace=examples/demo'], {
    PORT: String(demoPort),
    VITE_API_URL: `http://localhost:${apiPort}`,
  });

  log(
    `stack running: API http://localhost:${apiPort} (PORT), demo http://localhost:${demoPort} (VITE_API_URL points to API)`
  );
}

main().catch((err) => {
  log(`failed to start dev stack: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
