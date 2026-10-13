import express from 'express';
import cors from 'cors';
import { RecipeRepository } from './repository.js';
import { validateRecipe } from '../shared/validation.js';
import { Recipe } from '../shared/types.js';

export function createExpressApp(repo: RecipeRepository) {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '5mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Atlas Gastronomic — Recipe Core V1',
      timestamp: new Date().toISOString(),
    });
  });

  // GET /api/recipes — List all recipes
  app.get('/api/recipes', (req, res) => {
    try {
      const recipes = repo.getAllRecipes();
      res.json(recipes);
    } catch (err: any) {
      res.status(500).json({ error: 'Eroare la încărcarea rețetelor', details: err.message });
    }
  });

  // GET /api/recipes/:id — Get single recipe
  app.get('/api/recipes/:id', (req, res) => {
    try {
      const recipe = repo.getRecipeById(req.params.id);
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
  app.post('/api/recipes', (req, res) => {
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

  // PUT /api/recipes/:id — Update or save existing recipe
  app.put('/api/recipes/:id', (req, res) => {
    try {
      const recipeData: Recipe = {
        ...req.body,
        id: req.params.id,
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
      const saved = repo.saveRecipe(recipeData);

      res.json({ recipe: saved, validation });
    } catch (err: any) {
      res.status(500).json({ error: 'Eroare la actualizarea rețetei', details: err.message });
    }
  });

  // DELETE /api/recipes/:id — Delete recipe
  app.delete('/api/recipes/:id', (req, res) => {
    try {
      const deleted = repo.deleteRecipe(req.params.id);
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
