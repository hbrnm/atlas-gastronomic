import React from 'react';
import { RecipeStep, RecipeIngredient } from '../../shared/types.js';
import { Plus, Trash2, ArrowUp, ArrowDown, CheckSquare, Square } from 'lucide-react';

interface StepEditorProps {
  steps: RecipeStep[];
  ingredients: RecipeIngredient[];
  onChange: (steps: RecipeStep[]) => void;
}

export const StepEditor: React.FC<StepEditorProps> = ({ steps, ingredients, onChange }) => {
  const handleAddStep = () => {
    const nextNumber = steps.length + 1;
    const newStep: RecipeStep = {
      id: `step_${Date.now().toString(36)}_${nextNumber}`,
      step_number: nextNumber,
      instruction: '',
      duration_minutes: null,
      temperature_c: null,
      heat_level: null,
      success_cue: null,
      ingredient_refs: [],
    };
    onChange([...steps, newStep]);
  };

  const handleUpdate = (index: number, patch: Partial<RecipeStep>) => {
    const next = [...steps];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const handleRemove = (index: number) => {
    const next = steps.filter((_, i) => i !== index);
    const reordered = next.map((s, i) => ({ ...s, step_number: i + 1 }));
    onChange(reordered);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === steps.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const next = [...steps];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;

    const reordered = next.map((s, i) => ({ ...s, step_number: i + 1 }));
    onChange(reordered);
  };

  const toggleIngredientRef = (stepIndex: number, ingredientRefId: string) => {
    const step = steps[stepIndex];
    const currentRefs = step.ingredient_refs || [];
    const hasRef = currentRefs.includes(ingredientRefId);

    const updatedRefs = hasRef
      ? currentRefs.filter((id) => id !== ingredientRefId)
      : [...currentRefs, ingredientRefId];

    handleUpdate(stepIndex, { ingredient_refs: updatedRefs });
  };

  return (
    <div className="editor-panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Pași Procedurali de Preparare ({steps.length})</h2>
          <p className="panel-desc">
            Instrucțiuni clare de execuție, parametri termici și asocierea ingredientelor utilizate în fiecare etapă.
          </p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={handleAddStep}>
          <Plus size={14} />
          Adaugă Pas
        </button>
      </div>

      {steps.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Niciun pas de preparare adăugat.
          </p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddStep}>
            <Plus size={14} /> Adaugă primul pas
          </button>
        </div>
      ) : (
        <div className="steps-container">
          {steps.map((step, idx) => (
            <div key={step.id || idx} className="step-card">
              <div className="step-header">
                <span className="step-badge">PASUL #{idx + 1}</span>

                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={idx === 0}
                    title="Mută pasul mai sus"
                    onClick={() => handleMove(idx, 'up')}
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={idx === steps.length - 1}
                    title="Mută pasul mai jos"
                    onClick={() => handleMove(idx, 'down')}
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    title="Șterge pasul"
                    onClick={() => handleRemove(idx)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Instruction Text */}
              <div className="form-group">
                <label className="form-label">Instrucțiune de preparare *</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Descrieți acțiunea culinară exactă, tehnica de tăiere, mișcarea sau transformarea termică..."
                  value={step.instruction || ''}
                  onChange={(e) => handleUpdate(idx, { instruction: e.target.value })}
                />
              </div>

              {/* Thermal and Timing parameters */}
              <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
                <div className="form-group">
                  <label className="form-label">Durată (min)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    className="form-control"
                    placeholder="ex: 15"
                    value={step.duration_minutes ?? ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? null : parseFloat(e.target.value);
                      handleUpdate(idx, { duration_minutes: val });
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Temperatură (°C)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="ex: 95 sau 180"
                    value={step.temperature_c ?? ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? null : parseFloat(e.target.value);
                      handleUpdate(idx, { temperature_c: val });
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nivel de căldură</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Mic, Mediu, Iute, Baie de aburi"
                    value={step.heat_level || ''}
                    onChange={(e) => handleUpdate(idx, { heat_level: e.target.value || null })}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Indiciu Senzorial de Succes (Success Cue)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ex: Până când ceapa devine translucidă fără a prinde culoare"
                    value={step.success_cue || ''}
                    onChange={(e) => handleUpdate(idx, { success_cue: e.target.value || null })}
                  />
                </div>
              </div>

              {/* Associated Ingredients Picker */}
              <div className="step-refs-section">
                <span className="step-refs-label">Ingrediente consumate sau introduse în acest pas:</span>
                {ingredients.length === 0 ? (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                    Nu există ingrediente declarate în rețetă. Adăugați ingrediente mai întâi.
                  </span>
                ) : (
                  <div className="step-refs-checkboxes">
                    {ingredients.map((ing) => {
                      const refId = ing.ingredient_id || ing.id;
                      const isSelected = (step.ingredient_refs || []).includes(refId);

                      return (
                        <div
                          key={refId}
                          className={`ref-pill-label ${isSelected ? 'selected' : ''}`}
                          onClick={() => toggleIngredientRef(idx, refId)}
                        >
                          {isSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                          <span>{ing.name || refId}</span>
                          {ing.quantity ? (
                            <span style={{ opacity: 0.7, fontSize: '0.75rem' }}>
                              ({ing.quantity} {ing.unit})
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
