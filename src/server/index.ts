import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { initDatabase } from './db.js';
import { RecipeRepository } from './repository.js';
import { createExpressApp } from './app.js';

import { Recipe } from '../shared/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function startServer(customPort?: number, customDbPath?: string, seedRecipes?: Recipe[]) {
  const PORT = customPort || (process.env.PORT ? parseInt(process.env.PORT, 10) : 3000);
  const isProd = process.env.NODE_ENV === 'production';

  // 1. Initialize SQLite Database
  const db = initDatabase(customDbPath, seedRecipes);
  const repo = new RecipeRepository(db);

  // 2. Create Express app with API routes
  const app = createExpressApp(repo);

  // 3. Frontend Integration (Vite in Dev, Static in Prod)
  let viteInstance: any = null;
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const clientRoot = path.resolve(__dirname, '../client');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root: clientRoot,
    });
    viteInstance = vite;

    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) {
        return next();
      }
      try {
        let template = fs.readFileSync(path.resolve(clientRoot, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (err: any) {
        vite.ssrFixStacktrace(err);
        next(err);
      }
    });
  } else {
    const distClient = path.resolve(process.cwd(), 'dist/client');
    app.use(express.static(distClient));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distClient, 'index.html'));
    });
  }

  // 4. Start listening
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`  ATLAS GASTRONOMIC — RECIPE CORE V1`);
    console.log(`  Editorial Workspace: http://localhost:${PORT}`);
    console.log(`  API Status:          http://localhost:${PORT}/api/health`);
    console.log(`  Database Engine:     SQLite (Node 24 native DatabaseSync)`);
    console.log(`  Environment:         ${isProd ? 'production' : 'development'}`);
    console.log(`======================================================\n`);
  });

  return {
    server,
    app,
    db,
    repo,
    close: async () => {
      if (viteInstance) {
        await viteInstance.close();
      }
      await new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
}

const isDirectRun = Boolean(
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
);

if (isDirectRun) {
  startServer().catch((err) => {
    console.error('Fatal error starting server:', err);
    process.exit(1);
  });
}
