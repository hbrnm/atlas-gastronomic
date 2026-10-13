import React, { useState, useEffect } from 'react';
import { Recipe } from '../shared/types.js';
import { RecipeListItem } from '../server/repository.js';
import { fetchRecipes, fetchRecipeById, saveRecipeApi, deleteRecipeApi } from './services/api.js';
import { Header } from './components/Header.js';
import { RecipeList } from './components/RecipeList.js';
import { RecipeEditor } from './components/RecipeEditor.js';
import { Loader2, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'editor'>('list');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load recipe list on mount
  const loadRecipes = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const data = await fetchRecipes();
      setRecipes(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Eroare la conectarea cu serverul bazei de date.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, []);

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
      <Header
        currentView={currentView}
        onNavigateToList={handleNavigateToList}
        onNewRecipe={handleCreateNewRecipe}
      />

      {errorMessage && (
        <div style={{ maxWidth: '1320px', margin: '1rem auto 0 auto', padding: '0 1.5rem', width: '100%' }}>
          <div className="val-item error">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {isLoading && currentView === 'list' && recipes.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', padding: '5rem 0' }}>
          <Loader2 size={36} className="spin" style={{ color: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Se încarcă catalogul gastronomic...</p>
        </div>
      ) : (
        <main style={{ flex: 1 }}>
          {currentView === 'list' ? (
            <RecipeList
              recipes={recipes}
              onOpenRecipe={handleOpenRecipe}
              onNewRecipe={handleCreateNewRecipe}
            />
          ) : currentRecipe ? (
            <RecipeEditor
              initialRecipe={currentRecipe}
              onBackToList={handleNavigateToList}
              onSave={handleSaveRecipe}
              onDelete={handleDeleteRecipe}
              isSaving={isSaving}
              saveError={errorMessage}
            />
          ) : null}
        </main>
      )}
    </div>
  );
};
