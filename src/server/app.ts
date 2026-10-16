import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import { RecipeRepository, AuthenticatedActor } from './repository.js';
import { validateRecipe } from '../shared/validation.js';
import { Recipe } from '../shared/types.js';
import { RecipeEditorialProfile } from '../shared/editorial-types.js';

function timingSafeKeyCompare(provided: string | null | undefined, expected: string | null | undefined): boolean {
  if (!provided || !expected) return false;
  const hashA = crypto.createHash('sha256').update(provided.trim()).digest();
  const hashB = crypto.createHash('sha256').update(expected.trim()).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

export function createExpressApp(repo: RecipeRepository) {
  const app = express();

  // Trust first proxy hop (essential for Railway edge router and X-Forwarded-For)
  app.set('trust proxy', 1);

  // Security Headers for Staging & Production
  app.use((req, res, next) => {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });

  app.use(cors());
  app.use(express.json({ limit: '5mb' }));

  // In-Memory Rate Limiting for Auth Endpoint (Protection against brute-force guessing)
  interface RateLimitRecord {
    count: number;
    resetAt: number;
  }
  const authRateLimits = new Map<string, RateLimitRecord>();

  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of authRateLimits.entries()) {
      if (now > record.resetAt) {
        authRateLimits.delete(ip);
      }
    }
  }, 10 * 60 * 1000);
  if (cleanupInterval.unref) cleanupInterval.unref();

  const authRateLimiter = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (process.env.DISABLE_AUTH_RATE_LIMITER === 'true') return next();

    const clientIp = (req.ip || req.socket.remoteAddress || 'unknown').toString();
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes window
    const maxAttempts = 5; // max 5 verify attempts per 15 min per IP

    let record = authRateLimits.get(clientIp);
    if (!record || now > record.resetAt) {
      record = { count: 1, resetAt: now + windowMs };
      authRateLimits.set(clientIp, record);
      return next();
    }

    if (record.count >= maxAttempts) {
      const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec.toString());
      return res.status(429).json({
        valid: false,
        error: `Prea multe încercări eșuate de autentificare. Vă rugăm să reîncercați peste ${Math.ceil(retryAfterSec / 60)} minute.`,
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
      });
    }

    record.count++;
    return next();
  };

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Atlas Gastronomic — Recipe Core V1',
      timestamp: new Date().toISOString(),
    });
  });

  // Private Access & Shared Key Authentication
  const getAccessKey = () => process.env.ATLAS_ACCESS_KEY;
  const getEditorialKey = () =>
    process.env.ATLAS_EDITORIAL_KEY || process.env.ATLAS_EDITORIAL_PASSKEY;
  const getReviewerKey = () => process.env.ATLAS_REVIEWER_KEY;
  const getApproverKey = () => process.env.ATLAS_APPROVER_KEY;

  const extractAccessKey = (req: express.Request): string | null => {
    const fromAccess = req.headers['x-atlas-access-key'];
    if (typeof fromAccess === 'string' && fromAccess.trim().length > 0) {
      return fromAccess.trim();
    }
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7).trim();
    }
    // Query parameter is strictly disabled in production to prevent logging keys in proxy access logs or browser history
    if (process.env.NODE_ENV !== 'production') {
      const queryKey = req.query?.key;
      if (typeof queryKey === 'string' && queryKey.trim().length > 0) {
        return queryKey.trim();
      }
    }
    return null;
  };

  const extractEditorialKey = (req: express.Request): string | null => {
    const fromEditorial = req.headers['x-atlas-editorial-key'] || req.headers['x-atlas-passkey'];
    if (typeof fromEditorial === 'string' && fromEditorial.trim().length > 0) {
      return fromEditorial.trim();
    }
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7).trim();
    }
    // Query parameter is strictly disabled in production
    if (process.env.NODE_ENV !== 'production') {
      const queryKey = req.query?.editorial_key || req.query?.key;
      if (typeof queryKey === 'string' && queryKey.trim().length > 0) {
        return queryKey.trim();
      }
    }
    return null;
  };

  const extractReviewerKey = (req: express.Request): string | null => {
    const fromHeader = req.headers['x-atlas-reviewer-key'];
    if (typeof fromHeader === 'string' && fromHeader.trim().length > 0) {
      return fromHeader.trim();
    }
    return null;
  };

  const extractApproverKey = (req: express.Request): string | null => {
    const fromHeader = req.headers['x-atlas-approver-key'];
    if (typeof fromHeader === 'string' && fromHeader.trim().length > 0) {
      return fromHeader.trim();
    }
    return null;
  };

  const resolveActor = (req: express.Request): AuthenticatedActor => {
    const approverKey = getApproverKey();
    const reviewerKey = getReviewerKey();
    const editorialKey = getEditorialKey();

    const providedApprover = extractApproverKey(req);
    const providedReviewer = extractReviewerKey(req);
    const providedEditorial = extractEditorialKey(req);

    const clientName = typeof req.headers['x-atlas-actor-name'] === 'string'
      ? (req.headers['x-atlas-actor-name'] as string).trim()
      : null;
    const isAgent = req.headers['x-atlas-agent-client'] === 'true';

    // 1. Approver Role (Highest authorization)
    if (approverKey && providedApprover && timingSafeKeyCompare(providedApprover, approverKey)) {
      if (isAgent) {
        return {
          actor_id: 'agent_attempted_approver',
          actor_role: 'system',
          is_human: false,
          display_name: 'Atlas Automated Agent (Impersonation Rejected)',
        };
      }
      const name = clientName || 'Redactor-Șef Aprobator';
      return {
        actor_id: 'usr_approver_' + crypto.createHash('sha256').update(name).digest('hex').substring(0, 8),
        actor_role: 'approver',
        is_human: true,
        display_name: name,
      };
    }

    // 2. Reviewer Role
    if (reviewerKey && providedReviewer && timingSafeKeyCompare(providedReviewer, reviewerKey)) {
      const name = clientName || 'Recenzent Editorial';
      return {
        actor_id: 'usr_reviewer_' + crypto.createHash('sha256').update(name).digest('hex').substring(0, 8),
        actor_role: 'reviewer',
        is_human: !isAgent,
        display_name: isAgent ? 'Atlas AI Reviewer' : name,
      };
    }

    // 3. Editor Role (from editorial key)
    if (editorialKey && providedEditorial && timingSafeKeyCompare(providedEditorial, editorialKey)) {
      if (isAgent) {
        return {
          actor_id: 'agent_antigravity',
          actor_role: 'editor',
          is_human: false,
          display_name: 'Atlas Automated Agent',
        };
      }
      const name = clientName || 'Redactor Gastronomic';
      return {
        actor_id: 'usr_editor_' + crypto.createHash('sha256').update(name).digest('hex').substring(0, 8),
        actor_role: 'editor',
        is_human: true,
        display_name: name,
      };
    }

    // 4. In development / test environment:
    if (process.env.NODE_ENV !== 'production') {
      const testRole = req.headers['x-atlas-test-role'] as string;
      const testIsHuman = req.headers['x-atlas-test-human'] !== 'false';
      if (testRole === 'approver') {
        return {
          actor_id: (req.headers['x-atlas-test-actor-id'] as string) || 'usr_dev_approver',
          actor_role: 'approver',
          is_human: testIsHuman,
          display_name: clientName || 'Dev Approver',
        };
      }
      if (testRole === 'reviewer') {
        return {
          actor_id: 'usr_dev_reviewer',
          actor_role: 'reviewer',
          is_human: testIsHuman,
          display_name: clientName || 'Dev Reviewer',
        };
      }
      if (!editorialKey || editorialKey.trim().length === 0) {
        return {
          actor_id: (req.headers['x-atlas-test-actor-id'] as string) || 'usr_dev_editor',
          actor_role: 'editor',
          is_human: testIsHuman,
          display_name: clientName || 'Dev Editor',
        };
      }
    }

    // Fallback default editor
    return {
      actor_id: 'usr_anonymous_editor',
      actor_role: 'editor',
      is_human: true,
      display_name: clientName || 'Editor Anonim',
    };
  };

  // Auth status endpoint (never exposes secrets or hashes)
  app.get('/api/auth/status', (req, res) => {
    const accessKey = getAccessKey();
    const editorialKey = getEditorialKey();
    const isProd = process.env.NODE_ENV === 'production';
    const requireAuth = process.env.ATLAS_REQUIRE_AUTH === 'true';

    const privateAccessRequired = Boolean(accessKey && accessKey.trim().length > 0);
    const editorialAuthRequired = Boolean(editorialKey && editorialKey.trim().length > 0) || (isProd && requireAuth);

    const providedAccess = extractAccessKey(req);
    const providedEditorial = extractEditorialKey(req);

    const readAuthenticated = !privateAccessRequired || Boolean(
      (providedAccess && timingSafeKeyCompare(providedAccess, accessKey)) ||
      (providedEditorial && (timingSafeKeyCompare(providedEditorial, accessKey) || (editorialKey && timingSafeKeyCompare(providedEditorial, editorialKey))))
    );
    const writeAuthenticated = Boolean(providedEditorial && editorialKey && timingSafeKeyCompare(providedEditorial, editorialKey));

    res.json({
      privateAccessRequired,
      editorialAuthRequired,
      readAuthenticated,
      writeAuthenticated,
      authRequired: privateAccessRequired || editorialAuthRequired,
      authenticated: privateAccessRequired ? readAuthenticated : writeAuthenticated,
    });
  });

  // Verify access key endpoint (rate-limited against brute-force)
  app.post('/api/auth/verify', authRateLimiter, (req, res) => {
    const { key } = req.body || {};
    if (!key || typeof key !== 'string') {
      return res.status(400).json({ valid: false, error: 'Cheia de acces este obligatorie.' });
    }
    const trimmed = key.trim();
    const accessKey = getAccessKey();
    const editorialKey = getEditorialKey();

    const canRead = !accessKey || timingSafeKeyCompare(trimmed, accessKey) || (Boolean(editorialKey) && timingSafeKeyCompare(trimmed, editorialKey));
    const canWrite = Boolean(editorialKey && timingSafeKeyCompare(trimmed, editorialKey));

    if (!canRead && !canWrite) {
      return res.status(401).json({ valid: false, error: 'Cheie de acces invalidă.' });
    }

    res.json({
      valid: true,
      canRead,
      canWrite,
    });
  });

  // Require Read Access (when private mode is configured)
  const requireReadAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const accessKey = getAccessKey();
    if (!accessKey || accessKey.trim().length === 0) {
      return next();
    }
    const editorialKey = getEditorialKey();
    const providedAccess = extractAccessKey(req);
    const providedEditorial = extractEditorialKey(req);

    const isMatch = (providedAccess && timingSafeKeyCompare(providedAccess, accessKey)) ||
                    (providedEditorial && (timingSafeKeyCompare(providedEditorial, accessKey) || (editorialKey && timingSafeKeyCompare(providedEditorial, editorialKey))));

    if (!isMatch) {
      return res.status(401).json({
        error: 'Acces privat. Cheie de acces validă necesară pentru consultarea rețetelor (fail-closed).',
        code: 'APP_AUTH_REQUIRED',
      });
    }
    return next();
  };

  // Require Editorial Write Auth (fails closed in production when credentials are missing or unconfigured)
  const requireEditorialAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const isProd = process.env.NODE_ENV === 'production';
    const editorialKey = getEditorialKey();
    const requireAuth = process.env.ATLAS_REQUIRE_AUTH === 'true';

    // FAIL CLOSED IN PRODUCTION:
    // If credentials are required in production but none are configured on the server, fail closed:
    if (isProd && requireAuth && (!editorialKey || editorialKey.trim().length === 0)) {
      return res.status(403).json({
        error: 'Operațiunile de scriere sunt dezactivate în producție: nicio cheie de acces redacțională nu este configurată pe server (fail-closed).',
        code: 'CREDENTIALS_MISSING_SERVER',
      });
    }

    if (editorialKey && editorialKey.trim().length > 0) {
      const provided = extractEditorialKey(req);
      if (!provided || !timingSafeKeyCompare(provided, editorialKey)) {
        return res.status(401).json({
          error: 'Acces neautorizat. Cheie redacțională obligatorie lipsă sau invalidă (fail-closed).',
          code: 'EDITORIAL_AUTH_REQUIRED',
        });
      }
      return next();
    }

    return next();
  };

  // GET /api/recipes — List all recipes
  app.get('/api/recipes', requireReadAuth, (req, res) => {
    try {
      const recipes = repo.getAllRecipes();
      res.json(recipes);
    } catch (err: any) {
      res.status(500).json({ error: 'Eroare la încărcarea rețetelor', details: err.message });
    }
  });

  // GET /api/recipes/:id — Get single recipe
  app.get('/api/recipes/:id', requireReadAuth, (req, res) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const recipe = repo.getRecipeById(id);
      if (!recipe) {
        return res.status(404).json({ error: 'Rețeta nu a fost găsită' });
      }
      const validation = validateRecipe(recipe);
      res.json({ recipe, validation });
    } catch (err: any) {
      res.status(500).json({ error: 'Eroare la obținerea rețetei', details: err.message });
    }
  });

  // POST /api/recipes/validate — Validate without saving
  app.post('/api/recipes/validate', (req, res) => {
    try {
      const validation = validateRecipe(req.body);
      res.json(validation);
    } catch (err: any) {
      res.status(400).json({ error: 'Eroare la validarea rețetei', details: err.message });
    }
  });

  // POST /api/recipes — Create or save recipe
  app.post('/api/recipes', requireEditorialAuth, (req, res) => {
    try {
      const recipeData: Recipe = req.body;

      if (!recipeData.title) {
        return res.status(400).json({ error: 'Titlul rețetei este obligatoriu' });
      }

      // Generate id and recipe_id slug if missing
      if (!recipeData.id) {
        recipeData.id = 'rec_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
      }
      if (!recipeData.recipe_id) {
        const slug = recipeData.title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        recipeData.recipe_id = slug || 'reteta-' + Date.now().toString(36);
      }
      if (!recipeData.version) {
        recipeData.version = '1.0.0';
      }
      if (!recipeData.status) {
        recipeData.status = 'draft';
      }

      const validation = validateRecipe(recipeData);

      // Save recipe
      const saved = repo.saveRecipe(recipeData);
      res.status(201).json({ recipe: saved, validation });
    } catch (err: any) {
      res.status(500).json({ error: 'Eroare la salvarea rețetei', details: err.message });
    }
  });

  // PUT /api/recipes/:id — Update or save existing recipe (with optional editorial sync)
  app.put('/api/recipes/:id', requireEditorialAuth, (req, res) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { editorial: editorialData, ...recipeBody } = req.body || {};
      const recipeData: Recipe = {
        ...recipeBody,
        id,
      };

      if (!recipeData.title) {
        return res.status(400).json({ error: 'Titlul rețetei este obligatoriu' });
      }

      if (!recipeData.recipe_id) {
        const slug = recipeData.title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        recipeData.recipe_id = slug || 'reteta-' + Date.now().toString(36);
      }

      const validation = validateRecipe(recipeData);
      const actor = resolveActor(req);
      const rationale = (req.body?.rationale as string) || 'Actualizare rețetă via Recipe Editor';

      if (editorialData !== undefined) {
        const result = repo.saveRecipeWithEditorial(recipeData, editorialData, actor, rationale);
        return res.json({ recipe: result.recipe, validation, editorial: result.editorial });
      }

      const saved = repo.saveRecipe(recipeData);
      const editorial = repo.getEditorialByRecipeId(saved.id);
      res.json({ recipe: { ...saved, editorial }, validation, editorial });
    } catch (err: any) {
      if (err.message?.startsWith('FORBIDDEN')) {
        return res.status(403).json({ error: err.message });
      }
      if (err.message?.startsWith('VALIDATION_ERROR')) {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: 'Eroare la actualizarea rețetei', details: err.message });
    }
  });

  // GET /api/editorial — Get all editorial profiles
  app.get('/api/editorial', requireReadAuth, (req, res) => {
    try {
      const profiles = repo.getAllEditorialProfiles();
      res.json(profiles);
    } catch (err: any) {
      res.status(500).json({ error: 'Eroare la încărcarea profilurilor editoriale', details: err.message });
    }
  });

  // GET /api/recipes/:id/editorial — Get single recipe editorial profile
  app.get('/api/recipes/:id/editorial', requireReadAuth, (req, res) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const editorial = repo.getEditorialByRecipeId(id);
      if (!editorial) {
        return res.status(404).json({ error: 'Profilul editorial nu a fost găsit' });
      }
      res.json(editorial);
    } catch (err: any) {
      res.status(500).json({ error: 'Eroare la obținerea profilului editorial', details: err.message });
    }
  });

  // PUT /api/recipes/:id/editorial — Update single recipe editorial profile
  app.put('/api/recipes/:id/editorial', requireEditorialAuth, (req, res) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const actor = resolveActor(req);
      const rationale = req.body?.rationale || 'Actualizare profil editorial via panou dedicat';
      const profileData = req.body?.editorial || req.body;

      const result = repo.saveEditorial(id, profileData, actor, rationale);
      res.json(result);
    } catch (err: any) {
      if (err.message?.startsWith('FORBIDDEN')) {
        return res.status(403).json({ error: err.message });
      }
      if (err.message?.startsWith('VALIDATION_ERROR')) {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: 'Eroare la actualizarea profilului editorial', details: err.message });
    }
  });

  // GET /api/recipes/:id/editorial/audit — Get immutable audit history for recipe editorial profile
  app.get('/api/recipes/:id/editorial/audit', requireReadAuth, (req, res) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const history = repo.getEditorialAudit(id);
      res.json({ recipe_id: id, count: history.length, audit_history: history });
    } catch (err: any) {
      res.status(500).json({ error: 'Eroare la obținerea istoricului de audit', details: err.message });
    }
  });

  // DELETE /api/recipes/:id — Delete recipe
  app.delete('/api/recipes/:id', requireEditorialAuth, (req, res) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const deleted = repo.deleteRecipe(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Rețeta nu a fost găsită' });
      }
      res.json({ success: true, message: 'Rețeta a fost ștearsă cu succes' });
    } catch (err: any) {
      res.status(500).json({ error: 'Eroare la ștergerea rețetei', details: err.message });
    }
  });

  return app;
}
