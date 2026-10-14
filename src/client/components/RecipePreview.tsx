import React from 'react';
import { Recipe, StepRiskType } from '../../shared/types.js';
import { Clock, Users, Flame, GitFork, Thermometer, ShieldAlert, Award } from 'lucide-react';

interface RecipePreviewProps {
  recipe: Recipe;
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
      return 'Calitativ';
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

export const RecipePreview: React.FC<RecipePreviewProps> = ({ recipe }) => {
  return (
    <div
      className="recipe-preview-container"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        maxWidth: '860px',
        margin: '0 auto',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Category and Tradition */}
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <span
          style={{
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            fontWeight: 700,
            color: 'var(--accent-primary)',
          }}
        >
          {recipe.category || 'General'}
          {recipe.culinary_tradition ? ` • Tradiție ${recipe.culinary_tradition}` : ''}
          {recipe.region ? ` (${recipe.region})` : ''}
        </span>
      </div>

      {/* Main Title */}
      <h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '2.4rem',
          textAlign: 'center',
          lineHeight: 1.25,
          color: 'var(--text-main)',
          marginBottom: '1.25rem',
        }}
      >
        {recipe.title || 'Rețetă fără titlu'}
      </h1>

      {/* Summary */}
      {recipe.summary ? (
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.05rem',
            fontStyle: 'italic',
            textAlign: 'center',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            maxWidth: '680px',
            margin: '0 auto 2rem auto',
          }}
        >
          „{recipe.summary}”
        </p>
      ) : null}

      {/* Metrics Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '2rem',
          padding: '1rem',
          background: 'var(--bg-main)',
          borderTop: '1px solid var(--border-light)',
          borderBottom: '1px solid var(--border-light)',
          marginBottom: '2.5rem',
          fontSize: '0.875rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
          <Users size={16} style={{ color: 'var(--accent-primary)' }} />
          <span>
            <strong>Porții:</strong> {recipe.yield?.quantity || 4} {recipe.yield?.unit || 'porții'}
          </span>
        </div>

        {recipe.timing?.active_minutes ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
            <Clock size={16} style={{ color: 'var(--accent-primary)' }} />
            <span>
              <strong>Activ:</strong> {recipe.timing.active_minutes} min
            </span>
          </div>
        ) : null}

        {recipe.timing?.total_minutes ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
            <Clock size={16} style={{ color: 'var(--accent-primary)' }} />
            <span>
              <strong>Total:</strong> {recipe.timing.total_minutes} min
            </span>
          </div>
        ) : null}

        {recipe.timing?.lead_time_hours ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#b45309' }}>
            <Clock size={16} style={{ color: '#b45309' }} />
            <span>
              <strong>Maturare:</strong> {recipe.timing.lead_time_hours} ore
            </span>
          </div>
        ) : null}

        {recipe.difficulty ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
            <Flame size={16} style={{ color: 'var(--accent-primary)' }} />
            <span>
              <strong>Dificultate:</strong> {recipe.difficulty}
            </span>
          </div>
        ) : null}
      </div>

      {/* Ingredients Section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.35rem',
            color: 'var(--text-main)',
            borderBottom: '2px solid var(--accent-subtle)',
            paddingBottom: '0.5rem',
            marginBottom: '1rem',
          }}
        >
          Ingrediente Necesare
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
          {(recipe.ingredients || []).map((ing, i) => (
            <div
              key={ing.id || i}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '0.5rem',
                fontSize: '0.9rem',
                lineHeight: 1.4,
              }}
            >
              <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>•</span>
              <div>
                <strong>
                  {ing.quantity !== null ? ing.quantity : ''} {ing.unit || ''}
                </strong>{' '}
                <span>{ing.name}</span>
                {ing.preparation ? (
                  <span style={{ color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                    , {ing.preparation}
                  </span>
                ) : null}
                {ing.optional ? (
                  <span style={{ color: 'var(--text-subtle)', fontSize: '0.8rem' }}> (opțional)</span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Steps Section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.35rem',
            color: 'var(--text-main)',
            borderBottom: '2px solid var(--accent-subtle)',
            paddingBottom: '0.5rem',
            marginBottom: '1.25rem',
          }}
        >
          Metodă de Preparare Pas cu Pas
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {(recipe.steps || []).map((step, i) => {
            const isParallelRoot = Array.isArray(step.depends_on) && step.depends_on.length === 0;

            return (
              <div key={step.id || i} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: isParallelRoot ? '#e0f2fe' : 'var(--accent-subtle)',
                    color: isParallelRoot ? '#0369a1' : 'var(--accent-primary)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  {step.step_number || i + 1}
                </div>

                <div style={{ flex: 1 }}>
                  {/* Step Precedence Badges */}
                  {isParallelRoot ? (
                    <div style={{ marginBottom: '0.35rem' }}>
                      <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.72rem' }}>
                        Pornire Paralelă Independentă (T=0)
                      </span>
                    </div>
                  ) : Array.isArray(step.depends_on) && step.depends_on.length > 0 ? (
                    <div style={{ marginBottom: '0.35rem', display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                      <GitFork size={12} style={{ color: 'var(--accent-primary)' }} />
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Depinde de: {step.depends_on.join(', ')}
                      </span>
                    </div>
                  ) : null}

                  <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    {step.instruction}
                  </p>

                  {/* Sub-meta: duration, temperature, cue */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                    {step.duration_minutes ? <span>Durată: ~{step.duration_minutes} min</span> : null}
                    {step.active_minutes ? <span>(Activ: {step.active_minutes} min)</span> : null}
                    {step.passive_minutes ? <span>(Pasiv: {step.passive_minutes} min)</span> : null}
                    {step.temperature_c ? <span>Temp: {step.temperature_c}°C</span> : null}
                    {step.heat_level ? <span>Foc: {step.heat_level}</span> : null}
                    {step.success_cue ? (
                      <span style={{ color: 'var(--accent-primary)', fontStyle: 'italic' }}>
                        Indiciu: {step.success_cue}
                      </span>
                    ) : null}
                  </div>

                  {/* V2 Thermal constraints */}
                  {step.thermal_constraints && step.thermal_constraints.length > 0 ? (
                    <div style={{ marginTop: '0.4rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {step.thermal_constraints.map((tc, tcIdx) => (
                        <span
                          key={tcIdx}
                          style={{
                            fontSize: '0.72rem',
                            padding: '0.15rem 0.45rem',
                            borderRadius: 'var(--radius-sm)',
                            background: '#fffbeb',
                            color: '#b45309',
                            border: '1px solid #fde68a',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <Thermometer size={11} />
                          {tc.measurement_point === 'product_core' ? 'Miez' : tc.measurement_point === 'surface' ? 'Suprafață' : 'Cuptor'}: {tc.target_c ? `${tc.target_c}°C` : `${tc.min_c ?? ''}-${tc.max_c ?? ''}°C`}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {/* V2 Risks Taxonomy Badges */}
                  {step.risks && step.risks.length > 0 ? (
                    <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {step.risks.map((risk, rIdx) => (
                        <span key={rIdx} className={getRiskBadgeClass(risk.warning_type)}>
                          <ShieldAlert size={12} />
                          <strong>[{getRiskLabel(risk.warning_type)}]:</strong> {risk.message}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {/* Ingredient tags and step allocations */}
                  {step.ingredient_refs && step.ingredient_refs.length > 0 ? (
                    <div style={{ marginTop: '0.4rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {step.ingredient_refs.map((refId) => {
                        const matched = (recipe.ingredients || []).find((ing) => (ing.ingredient_id || ing.id) === refId);
                        const alloc = (step.allocations || []).find((a) => a.ingredient_id === refId);

                        return (
                          <span
                            key={refId}
                            style={{
                              fontSize: '0.72rem',
                              padding: '0.15rem 0.45rem',
                              borderRadius: 'var(--radius-sm)',
                              background: 'var(--bg-main)',
                              border: '1px solid var(--border-light)',
                              color: 'var(--text-muted)',
                            }}
                          >
                            {matched?.name || refId}
                            {alloc?.quantity_used_in_step ? ` (${alloc.quantity_used_in_step} ${alloc.unit || matched?.unit || ''})` : ''}
                          </span>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Claims / Attestation Section (V2 / OD-03) */}
      {recipe.claims && recipe.claims.length > 0 ? (
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem', marginTop: '2rem' }}>
          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.1rem',
              color: 'var(--text-main)',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Award size={16} style={{ color: 'var(--accent-primary)' }} />
            Atestare Istorică & Nivel de Încredere (Claims)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recipe.claims.map((claim) => (
              <div
                key={claim.claim_id}
                style={{
                  fontSize: '0.85rem',
                  padding: '0.5rem 0.75rem',
                  background: 'var(--bg-main)',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: '3px solid var(--accent-primary)',
                }}
              >
                <span>{claim.statement}</span>
                <span
                  style={{
                    marginLeft: '0.5rem',
                    fontSize: '0.72rem',
                    padding: '0.1rem 0.4rem',
                    background: 'var(--accent-subtle)',
                    color: 'var(--accent-primary)',
                    borderRadius: '2px',
                    fontWeight: 600,
                  }}
                >
                  {claim.confidence}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
