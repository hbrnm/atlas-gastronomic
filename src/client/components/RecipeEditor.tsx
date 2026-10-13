import React, { useState, useEffect, useMemo } from 'react';
import { Recipe, RecipeValidationResult } from '../../shared/types.js';
import { validateRecipe } from '../../shared/validation.js';
import { GeneralInfo } from './GeneralInfo.js';
import { IngredientEditor } from './IngredientEditor.js';
import { StepEditor } from './StepEditor.js';
import { ValidationPanel } from './ValidationPanel.js';
import { RecipePreview } from './RecipePreview.js';
import { ArrowLeft, Save, Eye, Layers, ListOrdered, FileText, Check, AlertCircle, Trash2 } from 'lucide-react';

interface RecipeEditorProps {
  initialRecipe: Recipe;
  onBackToList: () => void;
  onSave: (recipe: Recipe) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  isSaving: boolean;
  saveError: string | null;
}

export const RecipeEditor: React.FC<RecipeEditorProps> = ({
  initialRecipe,
  onBackToList,
  onSave,
  onDelete,
  isSaving,
  saveError,
}) => {
  const [recipe, setRecipe] = useState<Recipe>(initialRecipe);
  const [activeTab, setActiveTab] = useState<'info' | 'ingredients' | 'steps' | 'preview'>('info');
  const [isDirty, setIsDirty] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Sync if initialRecipe changes from outside
  useEffect(() => {
    setRecipe(initialRecipe);
    setIsDirty(false);
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
    setIsDirty(true);
  };

  const handleSaveClick = async () => {
    try {
      await onSave(recipe);
      setIsDirty(false);
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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

      {activeTab === 'preview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <ValidationPanel validation={validationResult} />
          <RecipePreview recipe={recipe} />
        </div>
      )}
    </div>
  );
};
