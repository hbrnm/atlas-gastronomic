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
  Wine,
  Users,
  Heart,
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
  const [activeTab, setActiveTab] = useState<'reteta' | 'pasi' | 'note' | 'istoric'>('reteta');
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

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

  const editorial = getRecipeEditorial(recipe.id, recipe.editorial);
  const heroImageSrc = recipe.editorial?.image_url || editorial?.image || '/images/tagliatelle-ragu.jpg';

  const getDifficultyLabel = (diff: string | null) => {
    if (diff === 'easy') return 'Ușor';
    if (diff === 'moderate') return 'Mediu';
    if (diff === 'advanced') return 'Avansat';
    return 'Mediu';
  };

  const formatTotalTime = (minutes: number | null) => {
    if (!minutes) return null;
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
    }
    return `${minutes} min`;
  };

  // Smooth scroll to ingredients section
  const handleScrollToIngredients = () => {
    setActiveTab('reteta');
    const el = document.getElementById('ingredients-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="main-content recipe-detail-page recipe-detail-container">
      {/* 1. TOP BREADCRUMB & SECONDARY ACTIONS */}
      <div className="detail-top-breadcrumb-bar">
        <button type="button" className="btn-back-breadcrumb btn-back-catalogue" onClick={onBack}>
          <ArrowLeft size={15} />
          <span>Înapoi la catalog</span>
        </button>

        <div className="detail-top-meta-links">
          <button
            type="button"
            className="btn-link-action"
            onClick={onOpenEditor}
            title="Deschide în redactor"
          >
            <Edit3 size={14} />
            <span>Editează rețeta</span>
          </button>
        </div>
      </div>

      {/* 2. SIDE-BY-SIDE HERO COMPOSITION (Approved Editorial Reference) */}
      <section className="recipe-hero-split-section">
        {/* Left Column: Authentic Photography */}
        <div className="recipe-hero-split-media">
          <div className="recipe-hero-image-frame">
            <img
              src={heroImageSrc}
              alt={editorial?.imageAlt || recipe.title}
              className="recipe-hero-split-image"
            />
          </div>
          {editorial?.imageCaption && (
            <p className="recipe-hero-split-caption">
              {editorial.imageCaption}
            </p>
          )}
        </div>

        {/* Right Column: Title, Metadata, Actions & Nota Bucătarului */}
        <div className="recipe-hero-split-content">
          <div className="recipe-tradition-eyebrow">
            {editorial?.heritage?.split('•')[0]?.trim().toUpperCase() ||
              recipe.culinary_tradition?.toUpperCase() ||
              'TRADIȚIE EUROPEANĂ'}
          </div>

          <h1 className="recipe-hero-title detail-title">{recipe.title}</h1>

          <p className="recipe-hero-summary">
            {recipe.summary ||
              editorial?.editorialSubtitle ||
              'Rețetă canonică autentică documentată cu precizie procedurală și tehnici clasice.'}
          </p>

          {/* Inline Metadata Row with Icons */}
          <div className="recipe-hero-meta-row">
            {recipe.timing?.total_minutes ? (
              <span className="recipe-hero-meta-item">
                <Clock size={16} className="recipe-meta-icon" />
                <span>{formatTotalTime(recipe.timing.total_minutes)}</span>
              </span>
            ) : null}

            <span className="recipe-hero-meta-item">
              <Users size={16} className="recipe-meta-icon" />
              <span>{servings} {recipe.yield?.unit || 'porții'}</span>
            </span>

            <span className="recipe-hero-meta-item">
              <ChefHat size={16} className="recipe-meta-icon" />
              <span>{getDifficultyLabel(recipe.difficulty)}</span>
            </span>
          </div>

          {/* Action Row */}
          <div className="recipe-hero-actions-row">
            <button
              type="button"
              className="btn btn-primary btn-hero-start-cook btn-start-cook"
              onClick={() => onStartCookMode(servings)}
            >
              <ChefHat size={17} />
              <span>Începe gătitul →</span>
            </button>

            <button
              type="button"
              className={`btn-icon-circle-favorite ${isFavorite ? 'btn-icon-circle-favorite--active' : ''}`}
              onClick={() => setIsFavorite(!isFavorite)}
              aria-label={isFavorite ? 'Elimină din favorite' : 'Salvează la favorite'}
              title="Salvează la favorite"
            >
              <Heart size={18} fill={isFavorite ? 'var(--color-gold-dark)' : 'none'} />
            </button>
          </div>

          {/* Nota Bucătarului Quote Box */}
          <div className="chef-note-quote-box">
            <div className="chef-note-header">
              <span className="chef-note-title">Nota bucătarului</span>
            </div>
            <blockquote className="chef-note-body">
              {editorial?.chefQuote ||
                '„Secretul unui preparat excepțional constă în calitatea ingredientelor, răbdare și respectul pentru timpii de gătire.”'}
            </blockquote>
            <div className="chef-note-author">
              — Chef Marco · Arhiva Atlas Gastronomic
            </div>
          </div>

          {/* Quick Ingredients Summary Teaser */}
          <div className="hero-ingredients-teaser">
            <div className="hero-ingredients-teaser-header">
              <span className="teaser-heading">Ingrediente esențiale</span>
              <button
                type="button"
                className="teaser-link-all"
                onClick={handleScrollToIngredients}
              >
                Vezi toate ({recipe.ingredients.length}) →
              </button>
            </div>
            <div className="hero-ingredients-teaser-list">
              {recipe.ingredients.slice(0, 5).map((ing) => {
                const scaledQty = formatScaledQuantity(ing.quantity);
                return (
                  <span key={ing.id} className="teaser-pill">
                    {ing.name} {scaledQty ? `(${scaledQty} ${ing.unit || ''})` : ''}
                  </span>
                );
              })}
              {recipe.ingredients.length > 5 && (
                <span className="teaser-pill teaser-pill-more">
                  +{recipe.ingredients.length - 5} altele
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. EDITORIAL TAB NAVIGATION STRIP */}
      <nav className="recipe-editorial-tabs-strip" aria-label="Navigare secțiuni rețetă">
        <button
          type="button"
          className={`editorial-tab-item ${activeTab === 'reteta' ? 'editorial-tab-item--active' : ''}`}
          onClick={() => setActiveTab('reteta')}
        >
          Rețetă completă
        </button>
        <button
          type="button"
          className={`editorial-tab-item ${activeTab === 'pasi' ? 'editorial-tab-item--active' : ''}`}
          onClick={() => setActiveTab('pasi')}
        >
          Pași de preparare ({recipe.steps.length})
        </button>
        <button
          type="button"
          className={`editorial-tab-item ${activeTab === 'note' ? 'editorial-tab-item--active' : ''}`}
          onClick={() => setActiveTab('note')}
        >
          Note culinare & Acord
        </button>
        <button
          type="button"
          className={`editorial-tab-item ${activeTab === 'istoric' ? 'editorial-tab-item--active' : ''}`}
          onClick={() => setActiveTab('istoric')}
        >
          Istoric & Tradiție
        </button>
      </nav>

      {/* 4. TWO-COLUMN COOKBOOK SPREAD BODY */}
      <div className="cookbook-body-columns">
        {/* Left Column: Scaler & Structured Ingredients */}
        {(activeTab === 'reteta' || activeTab === 'pasi') && (
          <aside id="ingredients-section" className="cookbook-ingredients-column">
            <div className="ingredients-header">
              <h2 className="ingredients-title">Ingrediente</h2>
            </div>

            {/* Serving Scaler Control */}
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
                <span className="scaler-unit">
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
                        className={`ingredient-item-row ${isChecked ? 'ingredient-item-row--checked' : ''}`}
                        onClick={() => toggleIngredientCheck(ing.id)}
                      >
                        <div className="ingredient-label-wrap">
                          <input
                            type="checkbox"
                            className="ingredient-checkbox"
                            checked={Boolean(isChecked)}
                            onChange={() => {}}
                          />
                          <span className="ingredient-name">{ing.name}</span>
                        </div>

                        <div className="ingredient-qty-unit">
                          {scaledQty ? (
                            <span>
                              {scaledQty} {ing.unit}
                            </span>
                          ) : (
                            <span className="ingredient-qty-taste">
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
            <div className="ingredients-bottom-actions">
              <button
                type="button"
                className="btn btn-primary btn-start-cook"
                onClick={() => onStartCookMode(servings)}
              >
                <ChefHat size={16} />
                Gătește cu aceste cantități
              </button>
            </div>
          </aside>
        )}

        {/* Right Column: Procedural Cooking Steps & Highlights */}
        <main className="cookbook-instructions-column">
          {(activeTab === 'reteta' || activeTab === 'pasi') && (
            <section className="procedural-steps-section">
              <h2 className="instructions-section-title">Pași de preparare</h2>

              {recipe.steps.map((step, idx) => {
                const stepNumber = step.step_number || idx + 1;
                const isFirstStep = idx === 0;

                return (
                  <article key={step.id || idx} className="step-card">
                    <div className="step-card-main-layout">
                      {/* Circular Step Ordinal Badge */}
                      <div className="step-circle-badge">
                        <span>{stepNumber}</span>
                      </div>

                      <div className="step-card-content-wrap">
                        <header className="step-header-row">
                          <span className="step-ordinal">Pasul {stepNumber}</span>

                          <div className="step-meta-badges">
                            {step.duration_minutes ? (
                              <span className="step-timing-badge">
                                <Clock size={13} />
                                {step.duration_minutes} min
                              </span>
                            ) : null}

                            {step.temperature_c ? (
                              <span className="step-timing-badge step-timing-badge--temp">
                                <Thermometer size={13} />
                                {step.temperature_c}°C
                              </span>
                            ) : null}
                          </div>
                        </header>

                        <div className="step-body-inline-flex">
                          {isFirstStep && (
                            <img
                              src={heroImageSrc}
                              alt="Pasul de pregătire"
                              className="step-inline-thumb"
                              loading="lazy"
                            />
                          )}
                          <p className="step-instruction-text">{step.instruction}</p>
                        </div>

                        {/* Step Ingredients Allocation */}
                        {step.allocations && step.allocations.length > 0 && (
                          <div className="step-allocations-panel">
                            <span className="step-allocations-title">
                              Ingrediente utilizate în acest pas:
                            </span>
                            <div className="step-allocations-tags">
                              {step.allocations.map((a, i) => {
                                const ing = recipe.ingredients.find(
                                  (item) => item.ingredient_id === a.ingredient_id
                                );
                                const scaledQty = a.quantity_used_in_step
                                  ? formatScaledQuantity(a.quantity_used_in_step)
                                  : null;
                                return (
                                  <span key={i} className="step-allocation-tag">
                                    <strong>{ing ? ing.name : a.ingredient_id}</strong>
                                    {scaledQty ? `: ${scaledQty} ${a.unit || ing?.unit || ''}` : ''}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Sensory Completion Cue & Thermal Constraints */}
                        {(step.success_cue ||
                          (step.thermal_constraints && step.thermal_constraints.length > 0)) && (
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
                                  {step.thermal_constraints
                                    .map(
                                      (tc) =>
                                        `${
                                          tc.measurement_point === 'product_core'
                                            ? 'Miez'
                                            : tc.measurement_point === 'surface'
                                            ? 'Suprafață'
                                            : 'Echipament'
                                        }: ${
                                          tc.target_c
                                            ? `${tc.target_c}°C`
                                            : `${tc.min_c ?? ''}-${tc.max_c ?? ''}°C`
                                        }`
                                    )
                                    .join(' | ')}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Culinary Risks & Tips */}
                        {step.risks && step.risks.length > 0 && (
                          <div className="step-risks-list">
                            {step.risks.map((risk, rIdx) => (
                              <div key={rIdx} className={getRiskBadgeClass(risk.warning_type)}>
                                <ShieldAlert size={15} className="badge-risk-icon" />
                                <div className="badge-risk-content">
                                  <strong className="badge-risk-title">
                                    {getRiskLabel(risk.warning_type)}:
                                  </strong>{' '}
                                  {risk.message}
                                  {risk.mitigation ? (
                                    <span className="badge-risk-mitigation">
                                      Remediu: {risk.mitigation}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}

              {/* Sfatul Bucătarului Bottom Highlight Box (as in approved mockup) */}
              <div className="chef-tip-highlight-card">
                <div className="chef-tip-thumb-wrap">
                  <img
                    src={heroImageSrc}
                    alt={recipe.title}
                    className="chef-tip-thumb-image"
                    loading="lazy"
                  />
                </div>
                <div className="chef-tip-text-body">
                  <span className="chef-tip-badge-eyebrow">Sfatul bucătarului</span>
                  <p className="chef-tip-advice">
                    {editorial?.chefTip ||
                      'Un vin roșu bun face diferența în profunzimea gustului. Mențineți focul domol și lăsați ingredientele să-și elibereze treptat aromele.'}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Terroir & Sommelier Pairing Editorial Box */}
          {(activeTab === 'reteta' || activeTab === 'note' || activeTab === 'istoric') && editorial && (
            <section className="cookbook-terroir-box">
              <h3 className="terroir-box-title">
                <Wine size={18} />
                Acord Oenologic & Note de Terroir
              </h3>
              <div className="terroir-box-content">
                <p className="terroir-item">
                  <strong>Terroir & Proveniență:</strong> {editorial.terroir} ({editorial.region})
                </p>
                <p className="terroir-item">
                  <strong>Recomandare Sommelier:</strong> {editorial.pairingSuggestion}
                </p>
                {editorial.heritage && (
                  <p className="terroir-item">
                    <strong>Patrimoniu & Arhivă:</strong> {editorial.heritage}
                  </p>
                )}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};
