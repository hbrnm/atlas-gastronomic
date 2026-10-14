import { Recipe, RecipeValidationResult } from '../../shared/types.js';
import { RecipeListItem } from '../../server/repository.js';

const API_BASE = '/api';
const ACCESS_KEY_STORAGE_KEY = 'atlas_access_key';
const EDITORIAL_KEY_STORAGE_KEY = 'atlas_editorial_key';

export function getStoredAccessKey(): string {
  try {
    return localStorage.getItem(ACCESS_KEY_STORAGE_KEY) || localStorage.getItem('atlas_editorial_passkey') || '';
  } catch {
    return '';
  }
}

export function setStoredAccessKey(key: string): void {
  try {
    if (key.trim()) {
      localStorage.setItem(ACCESS_KEY_STORAGE_KEY, key.trim());
      localStorage.setItem(EDITORIAL_KEY_STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(ACCESS_KEY_STORAGE_KEY);
      localStorage.removeItem(EDITORIAL_KEY_STORAGE_KEY);
      localStorage.removeItem('atlas_editorial_passkey');
    }
  } catch {}
}

export function getStoredPasskey(): string {
  return getStoredAccessKey();
}

export function setStoredPasskey(key: string): void {
  setStoredAccessKey(key);
}

function getAuthHeaders(): Record<string, string> {
  const key = getStoredAccessKey();
  if (key) {
    return {
      'x-atlas-access-key': key,
      'x-atlas-editorial-key': key,
      'x-atlas-passkey': key,
    };
  }
  return {};
}

export interface AuthStatusResponse {
  privateAccessRequired: boolean;
  editorialAuthRequired: boolean;
  readAuthenticated: boolean;
  writeAuthenticated: boolean;
  authRequired: boolean;
  authenticated: boolean;
}

export async function checkAuthStatus(): Promise<AuthStatusResponse> {
  try {
    const res = await fetch(`${API_BASE}/auth/status`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      return {
        privateAccessRequired: false,
        editorialAuthRequired: false,
        readAuthenticated: true,
        writeAuthenticated: true,
        authRequired: false,
        authenticated: true,
      };
    }
    return res.json();
  } catch {
    return {
      privateAccessRequired: false,
      editorialAuthRequired: false,
      readAuthenticated: true,
      writeAuthenticated: true,
      authRequired: false,
      authenticated: true,
    };
  }
}

export async function verifyKeyApi(key: string): Promise<{ valid: boolean; canRead: boolean; canWrite: boolean; error?: string }> {
  const res = await fetch(`${API_BASE}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { valid: false, canRead: false, canWrite: false, error: data.error || 'Cheie de acces invalidă.' };
  }
  return res.json();
}

export async function fetchRecipes(): Promise<RecipeListItem[]> {
  const res = await fetch(`${API_BASE}/recipes`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Eroare la încărcarea listei de rețete.');
  }
  return res.json();
}

export async function fetchRecipeById(id: string): Promise<{ recipe: Recipe; validation: RecipeValidationResult }> {
  const res = await fetch(`${API_BASE}/recipes/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Rețeta nu a putut fi găsită pe server.');
  }
  return res.json();
}

export async function saveRecipeApi(recipe: Recipe): Promise<{ recipe: Recipe; validation: RecipeValidationResult }> {
  const isExisting = Boolean(recipe.id);
  const url = isExisting ? `${API_BASE}/recipes/${recipe.id}` : `${API_BASE}/recipes`;
  const method = isExisting ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
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
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Eroare la ștergerea rețetei.');
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
