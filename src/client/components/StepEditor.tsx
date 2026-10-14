import React, { useState } from 'react';
import { RecipeStep, RecipeIngredient, StepRisk, StepThermalConstraint, StepRiskType, ThermalMeasurementPoint, ThermalConstraintType } from '../../shared/types.js';
import { Plus, Trash2, ArrowUp, ArrowDown, CheckSquare, Square, GitFork, Thermometer, ShieldAlert } from 'lucide-react';

interface StepEditorProps {
  steps: RecipeStep[];
  ingredients: RecipeIngredient[];
  onChange: (steps: RecipeStep[]) => void;
}

export const StepEditor: React.FC<StepEditorProps> = ({ steps, ingredients, onChange }) => {
  const [expandedV2Step, setExpandedV2Step] = useState<number | null>(null);

  const handleAddStep = () => {
    const nextNumber = steps.length + 1;
    const newStep: RecipeStep = {
      id: `step_${Date.now().toString(36)}_${nextNumber}`,
      step_id: `step_${nextNumber}`,
      step_number: nextNumber,
      instruction: '',
      duration_minutes: null,
      active_minutes: null,
      passive_minutes: null,
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

  const toggleDependency = (stepIndex: number, targetStepId: string) => {
    const step = steps[stepIndex];
    const current = Array.isArray(step.depends_on) ? [...step.depends_on] : [];
    const exists = current.includes(targetStepId);

    const updated = exists ? current.filter((id) => id !== targetStepId) : [...current, targetStepId];
    handleUpdate(stepIndex, { depends_on: updated });
  };

  const setParallelRoot = (stepIndex: number) => {
    const step = steps[stepIndex];
    const isParallel = Array.isArray(step.depends_on) && step.depends_on.length === 0;
    // Toggle between parallel root ([]) and implicit sequential (undefined)
    handleUpdate(stepIndex, { depends_on: isParallel ? undefined : [] });
  };

  const addRisk = (stepIndex: number) => {
    const step = steps[stepIndex];
    const currentRisks = step.risks || [];
    const newRisk: StepRisk = {
      warning_type: 'culinary_quality',
      message: '',
    };
    handleUpdate(stepIndex, { risks: [...currentRisks, newRisk] });
  };

  const updateRisk = (stepIndex: number, riskIndex: number, patch: Partial<StepRisk>) => {
    const step = steps[stepIndex];
    const risks = [...(step.risks || [])];
    risks[riskIndex] = { ...risks[riskIndex], ...patch };
    handleUpdate(stepIndex, { risks });
  };

  const removeRisk = (stepIndex: number, riskIndex: number) => {
    const step = steps[stepIndex];
    const risks = (step.risks || []).filter((_, i) => i !== riskIndex);
    handleUpdate(stepIndex, { risks: risks.length > 0 ? risks : undefined });
  };

  const addThermalConstraint = (stepIndex: number) => {
    const step = steps[stepIndex];
    const current = step.thermal_constraints || [];
    const newConstraint: StepThermalConstraint = {
      measurement_point: 'product_core',
      target_c: null,
      constraint_type: 'technological_target',
    };
    handleUpdate(stepIndex, { thermal_constraints: [...current, newConstraint] });
  };

  const updateThermalConstraint = (stepIndex: number, constraintIndex: number, patch: Partial<StepThermalConstraint>) => {
    const step = steps[stepIndex];
    const constraints = [...(step.thermal_constraints || [])];
    constraints[constraintIndex] = { ...constraints[constraintIndex], ...patch };
    handleUpdate(stepIndex, { thermal_constraints: constraints });
  };

  const removeThermalConstraint = (stepIndex: number, constraintIndex: number) => {
    const step = steps[stepIndex];
    const constraints = (step.thermal_constraints || []).filter((_, i) => i !== constraintIndex);
    handleUpdate(stepIndex, { thermal_constraints: constraints.length > 0 ? constraints : undefined });
  };

  const updateAllocation = (stepIndex: number, ingredientId: string, quantity: number | null, unit: string | null) => {
    const step = steps[stepIndex];
    const allocations = [...(step.allocations || [])];
    const existingIndex = allocations.findIndex((a) => a.ingredient_id === ingredientId);

    if (quantity === null || isNaN(quantity)) {
      if (existingIndex >= 0) {
        allocations.splice(existingIndex, 1);
      }
    } else {
      if (existingIndex >= 0) {
        allocations[existingIndex] = { ...allocations[existingIndex], quantity_used_in_step: quantity, unit };
      } else {
        allocations.push({ ingredient_id: ingredientId, quantity_used_in_step: quantity, unit });
      }
    }

    handleUpdate(stepIndex, { allocations: allocations.length > 0 ? allocations : undefined });
  };

  return (
    <div className="editor-panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Pași Procedurali de Preparare ({steps.length})</h2>
          <p className="panel-desc">
            Instrucțiuni clare de execuție, graf de dependențe (V2), parametri termici și riscuri culinare tipizate.
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
          {steps.map((step, idx) => {
            const isV2Expanded = expandedV2Step === idx;
            const otherSteps = steps.filter((_, i) => i !== idx);
            const isParallelRoot = Array.isArray(step.depends_on) && step.depends_on.length === 0;

            return (
              <div key={step.id || idx} className="step-card">
                <div className="step-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="step-badge">PASUL #{idx + 1}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontFamily: 'monospace' }}>
                      ID: {step.step_id || `step_${idx + 1}`}
                    </span>
                    {isParallelRoot ? (
                      <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.7rem' }}>
                        Ramură Paralelă (T=0)
                      </span>
                    ) : Array.isArray(step.depends_on) && step.depends_on.length > 0 ? (
                      <span className="badge" style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.7rem' }}>
                        Convergență ({step.depends_on.length} dep)
                      </span>
                    ) : null}
                  </div>

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
                <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
                  <div className="form-group">
                    <label className="form-label">Durată Totală (min)</label>
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
                    <label className="form-label">Timp Activ (min) [V2]</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className="form-control"
                      placeholder="lucru efectiv"
                      value={step.active_minutes ?? ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? null : parseFloat(e.target.value);
                        handleUpdate(idx, { active_minutes: val });
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Timp Pasiv (min) [V2]</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className="form-control"
                      placeholder="fierbere/odihnă"
                      value={step.passive_minutes ?? ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? null : parseFloat(e.target.value);
                        handleUpdate(idx, { passive_minutes: val });
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
                    <label className="form-label">Nivel căldură</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Mic, Mediu, Iute"
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
                        const allocation = (step.allocations || []).find((a) => a.ingredient_id === refId);

                        return (
                          <div key={refId} style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <div
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
                            {/* Quantity Allocation per Step (V2) */}
                            {isSelected ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', paddingLeft: '0.5rem' }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>Alocat:</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  style={{ width: '60px', padding: '0.1rem 0.3rem', fontSize: '0.75rem', border: '1px solid var(--border-light)', borderRadius: '3px' }}
                                  placeholder="tot"
                                  value={allocation?.quantity_used_in_step ?? ''}
                                  onChange={(e) => {
                                    const val = e.target.value === '' ? null : parseFloat(e.target.value);
                                    updateAllocation(idx, refId, val, ing.unit);
                                  }}
                                />
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>{ing.unit}</span>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* V2 Advanced Panel (Dependencies, Thermal Points, Risks) */}
                <div className="v2-foldable">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="v2-foldable-title">
                      <GitFork size={13} />
                      Parametri Arhitecturali V2 (Dependențe & Riscuri)
                    </span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                      onClick={() => setExpandedV2Step(isV2Expanded ? null : idx)}
                    >
                      {isV2Expanded ? 'Ascunde opțiuni avansate' : 'Configurează V2'}
                    </button>
                  </div>

                  {isV2Expanded ? (
                    <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {/* 1. Step ID & Dependencies */}
                      <div style={{ background: 'var(--bg-main)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Relații de Dependență (DAG):</span>
                          <button
                            type="button"
                            className={`btn btn-sm ${isParallelRoot ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                            onClick={() => setParallelRoot(idx)}
                          >
                            {isParallelRoot ? '✓ Pornire Paralelă (T=0)' : '+ Marchează ca Rădăcină Paralelă'}
                          </button>
                        </div>

                        {!isParallelRoot && otherSteps.length > 0 ? (
                          <div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                              Selectați pașii de la care pornește acest pas:
                            </span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.35rem' }}>
                              {otherSteps.map((other) => {
                                const targetId = other.step_id || `step_${other.step_number}`;
                                const isDep = Array.isArray(step.depends_on) && step.depends_on.includes(targetId);

                                return (
                                  <button
                                    key={targetId}
                                    type="button"
                                    className={`dependency-pill ${isDep ? 'active' : ''}`}
                                    onClick={() => toggleDependency(idx, targetId)}
                                  >
                                    Pasul #{other.step_number} ({targetId})
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ) : isParallelRoot ? (
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
                            Acest pas pornește independent la T=0 (nu depinde de pasul anterior).
                          </p>
                        ) : (
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontStyle: 'italic', margin: 0 }}>
                            Succesiune narativă implicită (urmează automat pasul #{idx}).
                          </p>
                        )}
                      </div>

                      {/* 2. Thermal Constraints */}
                      <div style={{ background: 'var(--bg-main)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Thermometer size={14} /> Constrângeri Termice pe Trei Puncte:
                          </span>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                            onClick={() => addThermalConstraint(idx)}
                          >
                            <Plus size={12} /> Adaugă punct termic
                          </button>
                        </div>

                        {(step.thermal_constraints || []).length === 0 ? (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                            Nicio constrângere termică specificată.
                          </span>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {(step.thermal_constraints || []).map((tc, tcIdx) => (
                              <div key={tcIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-surface)', padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}>
                                <select
                                  className="form-control"
                                  style={{ width: '130px', fontSize: '0.75rem', padding: '0.2rem' }}
                                  value={tc.measurement_point}
                                  onChange={(e) => updateThermalConstraint(idx, tcIdx, { measurement_point: e.target.value as ThermalMeasurementPoint })}
                                >
                                  <option value="equipment">Echipament / Cuptor</option>
                                  <option value="surface">Suprafață tigaie</option>
                                  <option value="product_core">Miez produs (inimă)</option>
                                </select>

                                <input
                                  type="number"
                                  placeholder="Țintă °C"
                                  style={{ width: '70px', fontSize: '0.75rem', padding: '0.2rem' }}
                                  value={tc.target_c ?? ''}
                                  onChange={(e) => updateThermalConstraint(idx, tcIdx, { target_c: e.target.value ? parseFloat(e.target.value) : null })}
                                />

                                <select
                                  className="form-control"
                                  style={{ width: '140px', fontSize: '0.75rem', padding: '0.2rem' }}
                                  value={tc.constraint_type}
                                  onChange={(e) => updateThermalConstraint(idx, tcIdx, { constraint_type: e.target.value as ThermalConstraintType })}
                                >
                                  <option value="technological_target">Țintă Tehnologică</option>
                                  <option value="quality_threshold">Prag Calitativ</option>
                                  <option value="food_safety_threshold">Prag Siguranță</option>
                                </select>

                                <button
                                  type="button"
                                  className="btn btn-ghost btn-sm"
                                  onClick={() => removeThermalConstraint(idx, tcIdx)}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 3. Typed Risk Taxonomy */}
                      <div style={{ background: 'var(--bg-main)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <ShieldAlert size={14} /> Taxonomie Riscuri Culinare (4 Categorii):
                          </span>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                            onClick={() => addRisk(idx)}
                          >
                            <Plus size={12} /> Adaugă avertisment
                          </button>
                        </div>

                        {(step.risks || []).length === 0 ? (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                            Niciun risc înregistrat pentru acest pas.
                          </span>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {(step.risks || []).map((risk, rIdx) => (
                              <div key={rIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-surface)', padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}>
                                <select
                                  className="form-control"
                                  style={{ width: '150px', fontSize: '0.75rem', padding: '0.2rem' }}
                                  value={risk.warning_type}
                                  onChange={(e) => updateRisk(idx, rIdx, { warning_type: e.target.value as StepRiskType })}
                                >
                                  <option value="culinary_quality">Calitativ (Senzorial)</option>
                                  <option value="irreversible_risk">Risc Ireversibil</option>
                                  <option value="food_safety">Siguranță Alimentară</option>
                                  <option value="haccp_ccp">Punct Critic HACCP</option>
                                </select>

                                <input
                                  type="text"
                                  placeholder="Mesaj de risc (ex: tăiere sos dacă depășește 60°C)..."
                                  style={{ flex: 1, fontSize: '0.75rem', padding: '0.2rem' }}
                                  value={risk.message || ''}
                                  onChange={(e) => updateRisk(idx, rIdx, { message: e.target.value })}
                                />

                                <button
                                  type="button"
                                  className="btn btn-ghost btn-sm"
                                  onClick={() => removeRisk(idx, rIdx)}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
