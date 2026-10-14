import React, { useState, useEffect } from 'react';
import { Recipe, StepRiskType } from '../../shared/types.js';
import { getRecipeEditorial } from '../services/editorialData.js';
import {
  Clock,
  ChefHat,
  ArrowLeft,
  Thermometer,
  ShieldAlert,
  Edit3,
  Compass,
  Wine,
} from 'lucide-react';

interface RecipeDetailProps {
  recipe: Recipe;
  servings?: number;
  onServingsChange?: (servings: number) => void;
  onBack: () => void;
  onStartCookMode: (servings?: number) => void;
  onOpenEditor: () => void;
}

function getRiskBadgeClass(type: StepRiskType): string {
  switch (type) {
    case 'culinary_quality':
      return 'badge-risk badge-risk-culinary_quality';
    case 'irreversible_risk':
      return 'badge-risk badge-risk-irreversible_risk';
    case 'food_safety':
      return 'badge-risk badge-risk-food_safety';
    case 'haccp_ccp':
      return 'badge-risk badge-risk-haccp_ccp';
    default:
      return 'badge-risk';
  }
}

function getRiskLabel(type: StepRiskType): string {
  switch (type) {
    case 'culinary_quality':
      return 'Atenție Culinară';
    case 'irreversible_risk':
      return 'Risc Ireversibil';
    case 'food_safety':
      return 'Siguranță Alimentară';
    case 'haccp_ccp':
      return 'Punct Critic HACCP';
    default:
      return type;
  }
}

export const RecipeDetail: React.FC<RecipeDetailProps> = ({
  recipe,
  servings: controlledServings,
  onServingsChange,
  onBack,
  onStartCookMode,
  onOpenEditor,
}) => {
  const baseYield = recipe.yield?.quantity || 4;
  const [internalServings, setInternalServings] = useState<number>(controlledServings ?? baseYield);

  // Sync internalServings when controlledServings or recipe changes
  useEffect(() => {
    if (controlledServings !== undefined) {
      setInternalServings(controlledServings);
    } else {
      setInternalServings(baseYield);
    }
  }, [controlledServings, baseYield, recipe.id]);

  const servings = controlledServings !== undefined ? controlledServings : internalServings;
  const setServings = (updater: number | ((prev: number) => number)) => {
    const next = typeof updater === 'function' ? updater(servings) : updater;
    const clamped = Math.max(1, next);
    setInternalServings(clamped);
    if (onServingsChange) {
      onServingsChange(clamped);
    }
  };

  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  const scaleFactor = servings / baseYield;

  const toggleIngredientCheck = (id: string) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formatScaledQuantity = (qty: number | null): string => {
    if (qty === null || qty === undefined) return '';
    const scaled = qty * scaleFactor;
    if (Number.isInteger(scaled)) return scaled.toString();
    if (scaled < 1) return scaled.toFixed(2).replace(/\.?0+$/, '');
    return scaled.toFixed(1).replace(/\.?0+$/, '');
  };

  // Group ingredients
  const ingredientGroups = React.useMemo(() => {
    const groups: Record<string, typeof recipe.ingredients> = {};
    for (const ing of recipe.ingredients) {
      const g = ing.group || 'Ingrediente Principale';
      if (!groups[g]) groups[g] = [];
      groups[g].push(ing);
    }
    return groups;
  }, [recipe.ingredients]);

  const editorial = getRecipeEditorial(recipe.id);
  const heroImageSrc = editorial?.image || '/images/tagliatelle-ragu.jpg';

  const getDifficultyLabel = (diff: string | null) => {
    if (diff === 'easy') return 'Ușor';
    if (diff === 'moderate') return 'Moderat';
    if (diff === 'advanced') return 'Avansat';
    return 'Nespecificat';
  };

  return (
    <div className="main-content recipe-detail-page recipe-detail-container">
      {/* Top Action & Navigation Bar */}
      <nav className="detail-top-nav">
        <button type="button" className="btn btn-ghost btn-back-catalogue" onClick={onBack}>
          <ArrowLeft size={16} />
          Catalog Canonic
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-primary btn-start-cook"
            onClick={() => onStartCookMode(servings)}
          >
            <ChefHat size={17} />
            Mod de Gătit (Cook Mode)
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onOpenEditor}
            title="Deschide în redactor"
          >
            <Edit3 size={15} />
            Editează
          </button>
        </div>
      </nav>

      {/* Cookbook Header Presentation */}
      <header className="cookbook-hero-header">
        <div className="cookbook-tradition-tag">
          <Compass size={14} />
          <span>{editorial?.heritage || recipe.culinary_tradition || 'Tradiție Europeană Canonică'}</span>
        </div>

        <h1 className="cookbook-title detail-title">{recipe.title}</h1>

        <p className="cookbook-subtitle">
          {recipe.summary || editorial?.editorialSubtitle || 'Rețetă canonică autentică documentată cu precizie procedurală.'}
        </p>

        {editorial?.chefQuote && (
          <blockquote className="hero-pullquote" style={{ maxWidth: '780px', margin: '0 auto 2rem auto', textAlign: 'left' }}>
            {editorial.chefQuote}
          </blockquote>
        )}
      </header>

      {/* Hero Food Photography Spread */}
      <figure className="cookbook-hero-image-spread">
        <div className="cookbook-hero-image-wrapper">
          <img
            src={heroImageSrc}
            alt={editorial?.imageAlt || recipe.title}
            className="cookbook-hero-image"
          />
        </div>
        <figcaption className="cookbook-image-footer">
          <span>{editorial?.imageCaption || 'Fotografie gastronomică realizată în lumina naturală a atelierului culinar.'}</span>
          <span style={{ color: 'var(--color-gold-dark)' }}>{editorial?.heritage} • Arhiva Atlas Gastronomic</span>
        </figcaption>
      </figure>

      {/* Recipe Key Metadata Strip */}
      <section className="cookbook-metadata-strip">
        <div className="meta-block">
          <span className="meta-block-label">Porții Referință</span>
          <span className="meta-block-value">{servings} {recipe.yield?.unit || 'porții'}</span>
          <span className="meta-block-sub">Randament bază: {baseYield}</span>
        </div>

        {recipe.timing?.active_minutes ? (
          <div className="meta-block">
            <span className="meta-block-label">Timp Activ (Muncă)</span>
            <span className="meta-block-value">{recipe.timing.active_minutes} min</span>
            <span className="meta-block-sub">Preparare & manevrare</span>
          </div>
        ) : null}

        {recipe.timing?.total_minutes ? (
          <div className="meta-block">
            <span className="meta-block-label">Timp Total</span>
            <span className="meta-block-value">{recipe.timing.total_minutes} min</span>
            <span className="meta-block-sub">Fierbere / Coacere inclusă</span>
          </div>
        ) : null}

        <div className="meta-block">
          <span className="meta-block-label">Dificultate Tehnică</span>
          <span className="meta-block-value">{getDifficultyLabel(recipe.difficulty)}</span>
          <span className="meta-block-sub">Nivel de execuție</span>
        </div>
      </section>

      {/* Two-Column Cookbook Body */}
      <div className="cookbook-body-columns">
        {/* Left Column: Scaler & Structured Ingredients */}
        <aside className="cookbook-ingredients-column">
          <div className="ingredients-header">
            <h2 className="ingredients-title">Ingrediente</h2>
          </div>

          {/* Serving Scaler */}
          <div className="serving-scaler-control">
            <span className="scaler-label">Calculează pentru:</span>
            <div className="scaler-stepper">
              <button
                type="button"
                className="scaler-btn btn-scaler-minus"
                onClick={() => setServings((s) => Math.max(1, s - 1))}
                disabled={servings <= 1}
                title="Scade porții"
                aria-label="Scade numărul de porții"
              >
                −
              </button>
              <span className="scaler-count serving-scaler-value">{servings}</span>
              <button
                type="button"
                className="scaler-btn btn-scaler-plus"
                onClick={() => setServings((s) => s + 1)}
                title="Crește porții"
                aria-label="Crește numărul de porții"
              >
                +
              </button>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
                {recipe.yield?.unit || 'porții'}
              </span>
            </div>
          </div>

          {/* Grouped Ingredients List */}
          {Object.entries(ingredientGroups).map(([groupName, items]) => (
            <div key={groupName} className="ingredient-group-block">
              <h3 className="ingredient-group-title">{groupName}</h3>
              <div>
                {items.map((ing) => {
                  const isChecked = checkedIngredients[ing.id];
                  const scaledQty = formatScaledQuantity(ing.quantity);

                  return (
                    <div
                      key={ing.id}
                      className="ingredient-item-row"
                      onClick={() => toggleIngredientCheck(ing.id)}
                      style={{
                        cursor: 'pointer',
                        opacity: isChecked ? 0.45 : 1,
                        textDecoration: isChecked ? 'line-through' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <input
                          type="checkbox"
                          className="ingredient-checkbox"
                          checked={Boolean(isChecked)}
                          onChange={() => {}}
                          style={{ accentColor: 'var(--color-olive)', cursor: 'pointer' }}
                        />
                        <span className="ingredient-name">{ing.name}</span>
                      </div>

                      <div className="ingredient-qty-unit">
                        {scaledQty ? (
                          <span>
                            {scaledQty} {ing.unit}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-subtle)' }}>
                            după gust
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quick Launch Cook Mode Button at bottom of ingredients */}
          <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => onStartCookMode(servings)}
            >
              <ChefHat size={16} />
              Gătește cu aceste cantități
            </button>
          </div>
        </aside>

        {/* Right Column: Cooking Steps & Procedural Execution */}
        <main className="cookbook-instructions-column">
          <h2 className="instructions-section-title">Mod de Preparare & Pași Procedurali</h2>

          {recipe.steps.map((step, idx) => {
            const stepNumber = step.step_number || idx + 1;

            return (
              <article key={step.id || idx} className="step-card">
                <header className="step-header-row">
                  <span className="step-ordinal">Pasul {stepNumber}</span>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {step.duration_minutes ? (
                      <span className="step-timing-badge">
                        <Clock size={13} />
                        {step.duration_minutes} min
                      </span>
                    ) : null}

                    {step.temperature_c ? (
                      <span className="step-timing-badge" style={{ color: 'var(--color-gold-dark)' }}>
                        <Thermometer size={13} />
                        {step.temperature_c}°C
                      </span>
                    ) : null}
                  </div>
                </header>

                <p className="step-instruction-text">{step.instruction}</p>

                {/* Step Ingredients Allocation */}
                {step.allocations && step.allocations.length > 0 && (
                  <div
                    style={{
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-xs)',
                      padding: '0.65rem 0.85rem',
                      marginBottom: '1rem',
                      fontSize: '0.85rem',
                    }}
                  >
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--color-olive)', display: 'block', marginBottom: '0.25rem' }}>
                      Ingrediente utilizate în acest pas:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {step.allocations.map((a, i) => {
                        const ing = recipe.ingredients.find((item) => item.ingredient_id === a.ingredient_id);
                        const scaledQty = a.quantity_used_in_step ? formatScaledQuantity(a.quantity_used_in_step) : null;
                        return (
                          <span
                            key={i}
                            style={{
                              background: 'var(--bg-surface)',
                              border: '1px solid var(--border-editorial)',
                              borderRadius: 'var(--radius-xs)',
                              padding: '0.2rem 0.5rem',
                              fontSize: '0.8rem',
                            }}
                          >
                            <strong>{ing ? ing.name : a.ingredient_id}</strong>
                            {scaledQty ? `: ${scaledQty} ${a.unit || ing?.unit || ''}` : ''}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Sensory Completion Cue & Thermal Constraints */}
                {(step.success_cue || (step.thermal_constraints && step.thermal_constraints.length > 0)) && (
                  <div className="step-cues-panel">
                    {step.success_cue && (
                      <div className="cue-item">
                        <span className="cue-label">Indiciu Senzorial de Finalizare</span>
                        <span className="cue-value">{step.success_cue}</span>
                      </div>
                    )}
                    {step.thermal_constraints && step.thermal_constraints.length > 0 && (
                      <div className="cue-item">
                        <span className="cue-label">Temperatură Țintă</span>
                        <span className="cue-value">
                          {step.thermal_constraints.map((tc) => 
                            `${tc.measurement_point === 'product_core' ? 'Miez' : tc.measurement_point === 'surface' ? 'Suprafață' : 'Echipament'}: ${tc.target_c ? `${tc.target_c}°C` : `${tc.min_c ?? ''}-${tc.max_c ?? ''}°C`}`
                          ).join(' | ')}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Culinary Risks & Tips */}
                {step.risks && step.risks.length > 0 && (
                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {step.risks.map((risk, rIdx) => (
                      <div
                        key={rIdx}
                        className={getRiskBadgeClass(risk.warning_type)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-xs)',
                          fontSize: '0.83rem',
                        }}
                      >
                        <ShieldAlert size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong>{getRiskLabel(risk.warning_type)}:</strong> {risk.message}
                          {risk.mitigation ? <span style={{ display: 'block', fontStyle: 'italic', marginTop: '0.2rem', opacity: 0.9 }}>Remediu: {risk.mitigation}</span> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            );
          })}

          {/* Terroir & Sommelier Pairing Editorial Box */}
          {editorial && (
            <section className="cookbook-terroir-box">
              <h3 className="terroir-box-title">
                <Wine size={18} />
                Acord Oenologic & Note de Terroir
              </h3>
              <div className="terroir-box-content">
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>Terroir & Proveniență:</strong> {editorial.terroir} ({editorial.region})
                </p>
                <p>
                  <strong>Recomandare Sommelier:</strong> {editorial.pairingSuggestion}
                </p>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};
