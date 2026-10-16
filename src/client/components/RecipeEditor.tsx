import React, { useState, useEffect, useMemo } from 'react';
import { Recipe, RecipeValidationResult } from '../../shared/types.js';
import { validateRecipe } from '../../shared/validation.js';
import { GeneralInfo } from './GeneralInfo.js';
import { IngredientEditor } from './IngredientEditor.js';
import { StepEditor } from './StepEditor.js';
import { ValidationPanel } from './ValidationPanel.js';
import { RecipePreview } from './RecipePreview.js';
import { EditorialPanel } from './EditorialPanel.js';
import { RecipeEditorialProfile } from '../../shared/editorial-types.js';
import { ArrowLeft, Save, Eye, Layers, ListOrdered, FileText, Check, AlertCircle, Trash2, ChefHat, BookOpen } from 'lucide-react';

interface RecipeEditorProps {
  initialRecipe: Recipe;
  onBackToList: () => void;
  onSave: (recipe: Recipe) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onOpenCookMode?: () => void;
  onOpenDetailView?: () => void;
  isSaving: boolean;
  saveError: string | null;
}

export const RecipeEditor: React.FC<RecipeEditorProps> = ({
  initialRecipe,
  onBackToList,
  onSave,
  onDelete,
  onOpenCookMode,
  onOpenDetailView,
  isSaving,
  saveError,
}) => {
  const [recipe, setRecipe] = useState<Recipe>(initialRecipe);
  const [activeTab, setActiveTab] = useState<'info' | 'ingredients' | 'steps' | 'editorial' | 'preview'>('info');
  const [isCoreDirty, setIsCoreDirty] = useState(false);
  const [isEditorialDirty, setIsEditorialDirty] = useState(false);
  const isDirty = isCoreDirty || isEditorialDirty;
  const [isDeleting, setIsDeleting] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Sync if initialRecipe changes from outside
  useEffect(() => {
    setRecipe(initialRecipe);
    setIsCoreDirty(false);
    setIsEditorialDirty(false);
  }, [initialRecipe.id]);

  const validationResult: RecipeValidationResult = useMemo(() => {
    return validateRecipe(recipe);
  }, [recipe]);

  const handleUpdate = (patch: Partial<Recipe>) => {
    setRecipe((prev) => ({
      ...prev,
      ...patch,
      updated_at: new Date().toISOString(),
    }));
    setIsCoreDirty(true);
  };

  const handleEditorialUpdate = (patch: Partial<RecipeEditorialProfile>) => {
    setRecipe((prev) => ({
      ...prev,
      editorial: {
        ...(prev.editorial || {
          recipe_id: prev.id,
          profile_version: 1,
          editorial_status: 'draft',
          image_rights_status: 'unverified',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
        ...patch,
        updated_at: new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    }));
    setIsEditorialDirty(true);
  };

  const handleSaveClick = async () => {
    try {
      await onSave(recipe);
      setIsCoreDirty(false);
      setIsEditorialDirty(false);
      setLastSavedTime(new Date().toLocaleTimeString('ro-RO'));
    } catch (err) {
      // error handled by parent
    }
  };

  const handleDeleteClick = async () => {
    if (!onDelete) return;
    if (!window.confirm('Sigur doriți să ștergeți această rețetă? Acțiunea este ireversibilă.')) {
      return;
    }
    try {
      setIsDeleting(true);
      await onDelete(recipe.id);
    } catch (err) {
      // error handled by parent
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="main-content">
      {/* Editor Header Bar */}
      <div className="editor-header-bar" style={{ marginBottom: '1.5rem' }}>
        <button type="button" className="btn btn-ghost" onClick={onBackToList}>
          <ArrowLeft size={16} />
          Bibliotecă
        </button>

        <div className="editor-title-wrap">
          <input
            type="text"
            className="recipe-title-input"
            placeholder="Titlul Rețetei (ex: Sarmale tradiționale)..."
            value={recipe.title || ''}
            onChange={(e) => handleUpdate({ title: e.target.value })}
          />
        </div>

        <div className="editor-header-actions">
          {/* Status Indicator */}
          <span className="badge badge-draft">
            {recipe.status === 'draft' ? 'Schiță (Draft)' : recipe.status}
          </span>

          {/* Validation badge preview */}
          {validationResult.errors.length > 0 ? (
            <span
              className="badge badge-val-error"
              style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)', cursor: 'pointer' }}
              onClick={() => setActiveTab('preview')}
              title="Click pentru a vedea erorile de validare"
            >
              <AlertCircle size={12} />
              {validationResult.errors.length} {validationResult.errors.length === 1 ? 'eroare' : 'erori'}
            </span>
          ) : (
            <span
              className="badge badge-val-valid"
              style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}
              title="Validare structurală conformă"
            >
              <Check size={12} /> Valid
            </span>
          )}

          {/* Save Button */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSaveClick}
            disabled={isSaving}
          >
            <Save size={16} />
            {isSaving ? 'Se salvează...' : isDirty ? 'Salvează Schița' : 'Salvat'}
          </button>

          {onOpenCookMode && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onOpenCookMode}
              title="Testează rețeta în Modul de Gătit"
            >
              <ChefHat size={15} />
              Cook Mode
            </button>
          )}

          {onOpenDetailView && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onOpenDetailView}
              title="Vezi rețeta în formatul pentru utilizatori"
            >
              <Eye size={15} />
              Vezi Rețeta
            </button>
          )}

          {/* Delete Button */}
          {onDelete && recipe.id && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--color-error)' }}
              onClick={handleDeleteClick}
              disabled={isDeleting}
              title="Șterge această rețetă definitiv"
            >
              <Trash2 size={15} />
              {isDeleting ? 'Se șterge...' : 'Șterge'}
            </button>
          )}
        </div>
      </div>

      {saveError ? (
        <div className="val-item error" style={{ marginBottom: '1rem' }}>
          <AlertCircle size={16} />
          <span>{saveError}</span>
        </div>
      ) : null}

      {lastSavedTime && !isDirty ? (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textAlign: 'right', marginTop: '-1rem', marginBottom: '1rem' }}>
          Ultima salvare confirmată în baza de date la {lastSavedTime}.
        </div>
      ) : null}

      {/* Editor Navigation Tabs */}
      <div className="editor-tabs">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          <FileText size={16} />
          1. Context & Metadate
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'ingredients' ? 'active' : ''}`}
          onClick={() => setActiveTab('ingredients')}
        >
          <Layers size={16} />
          2. Ingrediente ({recipe.ingredients?.length || 0})
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'steps' ? 'active' : ''}`}
          onClick={() => setActiveTab('steps')}
        >
          <ListOrdered size={16} />
          3. Pași de Preparare ({recipe.steps?.length || 0})
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          <Eye size={16} />
          4. Validare & Previzualizare
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'editorial' ? 'active' : ''}`}
          onClick={() => setActiveTab('editorial')}
        >
          <BookOpen size={16} />
          5. Profil Editorial & Proveniență
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'info' && (
        <GeneralInfo recipe={recipe} onChange={handleUpdate} />
      )}

      {activeTab === 'ingredients' && (
        <IngredientEditor
          ingredients={recipe.ingredients || []}
          onChange={(ings) => handleUpdate({ ingredients: ings })}
        />
      )}

      {activeTab === 'steps' && (
        <StepEditor
          steps={recipe.steps || []}
          ingredients={recipe.ingredients || []}
          onChange={(steps) => handleUpdate({ steps })}
        />
      )}

      {activeTab === 'editorial' && (
        <EditorialPanel
          editorial={recipe.editorial || undefined}
          onChange={handleEditorialUpdate}
          recipeTitle={recipe.title}
          recipeId={recipe.id}
        />
      )}

      {activeTab === 'preview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <ValidationPanel validation={validationResult} />
          <RecipePreview recipe={recipe} />
        </div>
      )}
    </div>
  );
};
