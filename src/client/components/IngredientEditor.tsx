import React from 'react';
import { RecipeIngredient } from '../../shared/types.js';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface IngredientEditorProps {
  ingredients: RecipeIngredient[];
  onChange: (ingredients: RecipeIngredient[]) => void;
}

export const IngredientEditor: React.FC<IngredientEditorProps> = ({ ingredients, onChange }) => {
  const handleAddIngredient = () => {
    const nextOrder = ingredients.length + 1;
    const newId = `ing_${Date.now().toString(36)}_${nextOrder}`;
    const newIngredient: RecipeIngredient = {
      id: newId,
      ingredient_id: `ingredient_${nextOrder}`,
      name: '',
      quantity: null,
      unit: 'g',
      preparation: null,
      group: null,
      optional: false,
      notes: null,
      sequence_order: nextOrder,
    };
    onChange([...ingredients, newIngredient]);
  };

  const handleUpdate = (index: number, patch: Partial<RecipeIngredient>) => {
    const next = [...ingredients];
    const current = next[index];
    
    // Auto-generate ingredient_id slug if name changed and ingredient_id is auto-derived
    if (patch.name !== undefined) {
      const prevExpectedSlug = current.name
        ? current.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/(^_|_$)/g, '')
        : '';

      const isAutoDerived =
        !current.ingredient_id ||
        current.ingredient_id.startsWith('ingredient_') ||
        current.ingredient_id === prevExpectedSlug;

      if (isAutoDerived) {
        const rawSlug = patch.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/(^_|_$)/g, '');

        if (rawSlug) {
          const isDuplicate = ingredients.some((ing, i) => i !== index && ing.ingredient_id === rawSlug);
          patch.ingredient_id = isDuplicate ? `${rawSlug}_${index + 1}` : rawSlug;
        } else {
          patch.ingredient_id = `ingredient_${index + 1}`;
        }
      }
    }

    next[index] = { ...current, ...patch };
    onChange(next);
  };

  const handleRemove = (index: number) => {
    const next = ingredients.filter((_, i) => i !== index);
    // Re-sequence
    const reordered = next.map((ing, i) => ({ ...ing, sequence_order: i + 1 }));
    onChange(reordered);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === ingredients.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const next = [...ingredients];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;

    const reordered = next.map((ing, i) => ({ ...ing, sequence_order: i + 1 }));
    onChange(reordered);
  };

  return (
    <div className="editor-panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Ingrediente Structurate ({ingredients.length})</h2>
          <p className="panel-desc">
            Definiți fiecare ingredient cu gramaj exact, unitate de măsură și mod de pregătire prealabilă.
          </p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={handleAddIngredient}>
          <Plus size={14} />
          Adaugă Ingredient
        </button>
      </div>

      {ingredients.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Niciun ingredient adăugat în această rețetă.
          </p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddIngredient}>
            <Plus size={14} /> Adaugă primul ingredient
          </button>
        </div>
      ) : (
        <div className="ingredient-table-wrap">
          <table className="ing-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>Ord.</th>
                <th style={{ minWidth: '180px' }}>Denumire Ingredient *</th>
                <th style={{ width: '100px' }}>Cantitate</th>
                <th style={{ width: '90px' }}>Unitate</th>
                <th style={{ minWidth: '180px' }}>Pregătire prealabilă</th>
                <th style={{ width: '120px' }}>Grup</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Opțional</th>
                <th style={{ width: '100px', textAlign: 'right' }}>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ing, idx) => (
                <tr key={ing.id || idx}>
                  <td style={{ color: 'var(--text-subtle)', fontWeight: 600 }}>
                    {idx + 1}
                  </td>
                  <td>
                    <input
                      type="text"
                      className="table-input"
                      placeholder="ex: Varză murată căpățână"
                      value={ing.name || ''}
                      onChange={(e) => handleUpdate(idx, { name: e.target.value })}
                    />
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
                      id: <code>{ing.ingredient_id || 'nespecificat'}</code>
                    </div>
                  </td>
                  <td>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      className="table-input"
                      placeholder="ex: 500"
                      value={ing.quantity ?? ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? null : parseFloat(e.target.value);
                        handleUpdate(idx, { quantity: val });
                      }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="table-input"
                      placeholder="g, ml, buc"
                      value={ing.unit || ''}
                      onChange={(e) => handleUpdate(idx, { unit: e.target.value || null })}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="table-input"
                      placeholder="ex: tocată fin, spălată în apă rece"
                      value={ing.preparation || ''}
                      onChange={(e) => handleUpdate(idx, { preparation: e.target.value || null })}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="table-input"
                      placeholder="Legume, Carne, Sos"
                      value={ing.group || ''}
                      onChange={(e) => handleUpdate(idx, { group: e.target.value || null })}
                    />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(ing.optional)}
                      onChange={(e) => handleUpdate(idx, { optional: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.2rem' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        disabled={idx === 0}
                        title="Mută mai sus"
                        onClick={() => handleMove(idx, 'up')}
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        disabled={idx === ingredients.length - 1}
                        title="Mută mai jos"
                        onClick={() => handleMove(idx, 'down')}
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        title="Șterge ingredient"
                        onClick={() => handleRemove(idx)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
