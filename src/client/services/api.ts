import { Recipe, RecipeValidationResult } from '../../shared/types.js';
import { RecipeListItem } from '../../server/repository.js';

const API_BASE = '/api';

export async function fetchRecipes(): Promise<RecipeListItem[]> {
  const res = await fetch(`${API_BASE}/recipes`);
  if (!res.ok) {
    throw new Error('Eroare la încărcarea listei de rețete.');
  }
  return res.json();
}

export async function fetchRecipeById(id: string): Promise<{ recipe: Recipe; validation: RecipeValidationResult }> {
  const res = await fetch(`${API_BASE}/recipes/${id}`);
  if (!res.ok) {
    throw new Error('Rețeta nu a putut fi găsită pe server.');
  }
  return res.json();
}

export async function saveRecipeApi(recipe: Recipe): Promise<{ recipe: Recipe; validation: RecipeValidationResult }> {
  const isExisting = Boolean(recipe.id);
  const url = isExisting ? `${API_BASE}/recipes/${recipe.id}` : `${API_BASE}/recipes`;
  const method = isExisting ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipe),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Eroare la salvarea rețetei.');
  }

  return res.json();
}

export async function deleteRecipeApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/recipes/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Eroare la ștergerea rețetei.');
  }
}

export async function validateRecipeApi(recipe: Partial<Recipe>): Promise<RecipeValidationResult> {
  const res = await fetch(`${API_BASE}/recipes/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipe),
  });
  if (!res.ok) {
    throw new Error('Eroare la validarea rețetei.');
  }
  return res.json();
}
