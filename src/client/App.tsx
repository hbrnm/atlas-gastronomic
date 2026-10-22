import React, { useState, useEffect } from 'react';
import { Recipe } from '../shared/types.js';
import { RecipeListItem } from '../server/repository.js';
import { fetchRecipes, fetchRecipeById, saveRecipeApi, deleteRecipeApi, checkAuthStatus, verifyKeyApi, setStoredAccessKey } from './services/api.js';
import { Header } from './components/Header.js';
import { RecipeList } from './components/RecipeList.js';
import { RecipeEditor } from './components/RecipeEditor.js';
import { RecipeDetail } from './components/RecipeDetail.js';
import { CookMode } from './components/CookMode.js';
import { Loader2, AlertCircle, Lock, KeyRound } from 'lucide-react';

function getInitialSession(): { view: 'list' | 'detail' | 'cook' | 'editor'; recipeId: string | null } {
  try {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.startsWith('#/cook/')) {
        return { view: 'cook', recipeId: hash.replace('#/cook/', '') };
      }
      const raw = localStorage.getItem('atlas_active_session');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.recipeId && parsed.view === 'cook') {
          return { view: 'cook', recipeId: parsed.recipeId };
        }
      }
    }
  } catch {}
  return { view: 'list', recipeId: null };
}

function getInitialServingsMap(): Record<string, number> {
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('atlas_recipe_servings');
      const map = raw ? JSON.parse(raw) : {};
      const sessionRaw = localStorage.getItem('atlas_active_session');
      if (sessionRaw) {
        const parsed = JSON.parse(sessionRaw);
        if (parsed.recipeId && typeof parsed.servings === 'number') {
          map[parsed.recipeId] = parsed.servings;
        }
      }
      return map;
    }
  } catch {}
  return {};
}

function getInitialAppMode(): 'cooking' | 'editorial' {
  try {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlMode = params.get('mode');
      if (urlMode === 'editorial' || urlMode === 'cooking') return urlMode;
      const stored = localStorage.getItem('atlas_app_mode');
      if (stored === 'editorial' || stored === 'cooking') return stored;
    }
  } catch {}
  return 'cooking';
}

export const App: React.FC = () => {
  const [initialSession] = useState(getInitialSession);
  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'detail' | 'cook' | 'editor'>(initialSession.view);
  const [appMode, setAppMode] = useState<'cooking' | 'editorial'>(getInitialAppMode);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Recipe-specific servings map: { [recipeId: string]: number } with persistence
  const [recipeServingsMap, setRecipeServingsMap] = useState<Record<string, number>>(getInitialServingsMap);

  const handleToggleMode = (mode: 'cooking' | 'editorial') => {
    setAppMode(mode);
    try {
      localStorage.setItem('atlas_app_mode', mode);
      if (typeof window !== 'undefined' && window.history && window.location) {
        const url = new URL(window.location.href);
        if (mode === 'editorial') {
          url.searchParams.set('mode', 'editorial');
        } else {
          url.searchParams.delete('mode');
        }
        window.history.replaceState({}, '', url.toString());
      }
    } catch {}
  };

  const handleUpdateRecipeServings = (recipeId: string, servings: number) => {
    setRecipeServingsMap((prev) => {
      const next = { ...prev, [recipeId]: servings };
      try {
        localStorage.setItem('atlas_recipe_servings', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Private Access State
  const [isPrivateGateActive, setIsPrivateGateActive] = useState(false);
  const [accessKeyInput, setAccessKeyInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);

  // Load recipe list on mount
  const loadRecipes = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const data = await fetchRecipes();
      setRecipes(data);
    } catch (err: any) {
      if (err.message && err.message.includes('privat')) {
        setIsPrivateGateActive(true);
      } else {
        setErrorMessage(err.message || 'Eroare la conectarea cu serverul bazei de date.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initApp = async () => {
      const auth = await checkAuthStatus();
      if (auth.privateAccessRequired && !auth.readAuthenticated) {
        setIsPrivateGateActive(true);
        setIsLoading(false);
        setIsReady(true);
        return;
      }
      
      await loadRecipes();

      // Restore active recipe session if one was requested
      if (initialSession.recipeId && initialSession.view !== 'list') {
        try {
          const { recipe } = await fetchRecipeById(initialSession.recipeId);
          if (recipe) {
            setCurrentRecipe(recipe);
            setCurrentView(initialSession.view);
          } else {
            setCurrentView('list');
          }
        } catch (e) {
          console.warn('Could not restore previous session:', e);
          setCurrentView('list');
        }
      }
      setIsReady(true);
    };
    initApp();
  }, []);

  // Persist session to localStorage and sync URL hash ONLY for Cook Mode after isReady is true
  useEffect(() => {
    if (!isReady) return;
    if (currentView === 'cook' && currentRecipe) {
      const activeServings = recipeServingsMap[currentRecipe.id] ?? currentRecipe.yield?.quantity ?? 4;
      try {
        localStorage.setItem(
          'atlas_active_session',
          JSON.stringify({
            view: 'cook',
            recipeId: currentRecipe.id,
            servings: activeServings,
          })
        );
        window.location.hash = `#/cook/${currentRecipe.id}`;
      } catch {}
    } else {
      try {
        localStorage.removeItem('atlas_active_session');
        if (window.location.hash.startsWith('#/cook/')) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      } catch {}
    }
  }, [currentView, currentRecipe, isReady, recipeServingsMap]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessKeyInput.trim()) return;
    try {
      setIsVerifyingKey(true);
      setAuthError(null);
      const res = await verifyKeyApi(accessKeyInput.trim());
      if (res.valid) {
        setStoredAccessKey(accessKeyInput.trim());
        setIsPrivateGateActive(false);
        await loadRecipes();
      } else {
        setAuthError(res.error || 'Cheie de acces invalidă.');
      }
    } catch {
      setAuthError('Eroare la verificarea cheii.');
    } finally {
      setIsVerifyingKey(false);
    }
  };

  const handleOpenRecipe = async (id: string) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const { recipe } = await fetchRecipeById(id);
      setCurrentRecipe(recipe);
      setCurrentView('editor');
    } catch (err: any) {
      setErrorMessage(err.message || 'Eroare la deschiderea rețetei.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDetail = async (id: string) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const { recipe } = await fetchRecipeById(id);
      setCurrentRecipe(recipe);
      setCurrentView('detail');
    } catch (err: any) {
      setErrorMessage(err.message || 'Eroare la deschiderea rețetei.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCook = async (id: string) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const { recipe } = await fetchRecipeById(id);
      setCurrentRecipe(recipe);
      setCurrentView('cook');
    } catch (err: any) {
      setErrorMessage(err.message || 'Eroare la pornirea modului de gătit.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewRecipe = () => {
    const newId = 'rec_' + Date.now().toString(36);
    const blankRecipe: Recipe = {
      id: newId,
      recipe_id: 'reteta-noua-' + Date.now().toString(36).substring(4),
      version: '1.0.0',
      title: '',
      summary: '',
      culinary_tradition: 'Românească',
      region: null,
      category: 'Fel Principal',
      status: 'draft',
      yield: {
        quantity: 4,
        unit: 'porții',
        approx_final_weight_g: null,
      },
      timing: {
        active_minutes: 20,
        total_minutes: 45,
      },
      difficulty: 'easy',
      ingredients: [],
      steps: [],
      equipment: [],
      allergens: [],
      sources: [],
      editorial_notes: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setCurrentRecipe(blankRecipe);
    setCurrentView('editor');
  };

  const handleSaveRecipe = async (recipeToSave: Recipe) => {
    try {
      setIsSaving(true);
      setErrorMessage(null);
      const { recipe: saved } = await saveRecipeApi(recipeToSave);
      setCurrentRecipe(saved);
      // Refresh list in background
      const updatedList = await fetchRecipes();
      setRecipes(updatedList);
    } catch (err: any) {
      setErrorMessage(err.message || 'Eroare la salvare.');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      await deleteRecipeApi(id);
      setCurrentRecipe(null);
      setCurrentView('list');
      await loadRecipes();
    } catch (err: any) {
      setErrorMessage(err.message || 'Eroare la ștergerea rețetei.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToList = () => {
    setCurrentView('list');
    loadRecipes();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {currentView !== 'cook' && (
        <Header
          currentView={currentView}
          appMode={appMode}
          onToggleMode={handleToggleMode}
          onNavigateToList={handleNavigateToList}
          onNewRecipe={handleCreateNewRecipe}
          activeRecipeTitle={currentRecipe?.title}
        />
      )}

      {errorMessage && (
        <div style={{ maxWidth: '1320px', margin: '1rem auto 0 auto', padding: '0 1.5rem', width: '100%' }}>
          <div className="val-item error">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {isPrivateGateActive ? (
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
          <div
            className="private-auth-gate"
            style={{
              maxWidth: '480px',
              width: '100%',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-editorial)',
              borderRadius: 'var(--radius-sm)',
              padding: '3rem 2.25rem',
              boxShadow: 'var(--shadow-elevated)',
              textAlign: 'center',
            }}
          >
            <div className="gate-seal-icon">
              <Lock size={32} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.65rem', letterSpacing: '0.04em', marginBottom: '0.35rem', color: 'var(--text-ink)' }}>
              Atlas Gastronomic — Acces Privat
            </h2>
            <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '0.98rem', color: 'var(--color-gold-dark)', marginBottom: '1.25rem' }}>
              Salon Privat de Cultură Culinară
            </div>
            <p style={{ fontFamily: 'var(--font-body-serif)', color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.6 }}>
              Această ediție este rezervată exclusiv membrilor și redacției. Introduceți cheia de acces pentru a consulta compendiul și a activa modul de gătit.
            </p>

            {authError && (
              <div className="val-item error auth-error-msg" style={{ marginBottom: '1.25rem', textAlign: 'left', background: 'var(--color-error-bg)', color: 'var(--color-error)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-xs)' }}>
                <AlertCircle size={16} />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="access-key-input search-input"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-editorial)',
                    background: 'var(--bg-subtle)',
                    fontSize: '0.95rem',
                  }}
                  placeholder="Introduceți cheia de acces..."
                  value={accessKeyInput}
                  onChange={(e) => setAccessKeyInput(e.target.value)}
                  autoFocus
                />
                <KeyRound size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-unlock-app"
                disabled={isVerifyingKey || !accessKeyInput.trim()}
                style={{ padding: '0.85rem', justifyContent: 'center', fontSize: '1rem', letterSpacing: '0.04em' }}
              >
                {isVerifyingKey ? 'Se verifică acreditarea...' : 'Deblochează Compendiul'}
              </button>
            </form>
          </div>
        </main>
      ) : (isLoading || !isReady) ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', padding: '5rem 0' }}>
          <Loader2 size={36} className="spin" style={{ color: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Se încarcă catalogul gastronomic...</p>
        </div>
      ) : (
        <main style={{ flex: 1 }}>
          {currentView === 'list' ? (
            <RecipeList
              recipes={recipes}
              appMode={appMode}
              onOpenRecipe={handleOpenRecipe}
              onOpenDetail={handleOpenDetail}
              onOpenCook={handleOpenCook}
              onNewRecipe={handleCreateNewRecipe}
            />
          ) : currentView === 'detail' && currentRecipe ? (
            <RecipeDetail
              recipe={currentRecipe}
              appMode={appMode}
              servings={recipeServingsMap[currentRecipe.id] ?? currentRecipe.yield?.quantity ?? 4}
              onServingsChange={(s) => handleUpdateRecipeServings(currentRecipe.id, s)}
              onBack={handleNavigateToList}
              onStartCookMode={(s) => {
                const effective = typeof s === 'number' ? s : (recipeServingsMap[currentRecipe.id] ?? currentRecipe.yield?.quantity ?? 4);
                handleUpdateRecipeServings(currentRecipe.id, effective);
                setCurrentView('cook');
              }}
              onOpenEditor={() => setCurrentView('editor')}
            />
          ) : currentView === 'cook' && currentRecipe ? (
            <CookMode
              recipe={currentRecipe}
              servings={recipeServingsMap[currentRecipe.id] ?? currentRecipe.yield?.quantity ?? 4}
              onExit={() => setCurrentView('detail')}
            />
          ) : currentRecipe ? (
            <RecipeEditor
              initialRecipe={currentRecipe}
              onBackToList={handleNavigateToList}
              onSave={handleSaveRecipe}
              onDelete={handleDeleteRecipe}
              onOpenCookMode={() => setCurrentView('cook')}
              onOpenDetailView={() => setCurrentView('detail')}
              isSaving={isSaving}
              saveError={errorMessage}
            />
          ) : null}
        </main>
      )}
    </div>
  );
};
