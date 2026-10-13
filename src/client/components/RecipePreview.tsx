import React from 'react';
import { Recipe } from '../../shared/types.js';
import { Clock, Users, Flame } from 'lucide-react';

interface RecipePreviewProps {
  recipe: Recipe;
}

export const RecipePreview: React.FC<RecipePreviewProps> = ({ recipe }) => {
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        padding: '3rem 2.5rem',
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
          gap: '2.5rem',
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
      <div>
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
          {(recipe.steps || []).map((step, i) => (
            <div key={step.id || i} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--accent-subtle)',
                  color: 'var(--accent-primary)',
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
                <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  {step.instruction}
                </p>

                {/* Sub-meta: duration, temperature, cue */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                  {step.duration_minutes ? <span>Timp: ~{step.duration_minutes} min</span> : null}
                  {step.temperature_c ? <span>Temp: {step.temperature_c}°C</span> : null}
                  {step.heat_level ? <span>Foc: {step.heat_level}</span> : null}
                  {step.success_cue ? (
                    <span style={{ color: 'var(--accent-primary)', fontStyle: 'italic' }}>
                      Indiciu: {step.success_cue}
                    </span>
                  ) : null}
                </div>

                {/* Ingredient tags */}
                {step.ingredient_refs && step.ingredient_refs.length > 0 ? (
                  <div style={{ marginTop: '0.4rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {step.ingredient_refs.map((refId) => {
                      const matched = (recipe.ingredients || []).find((ing) => (ing.ingredient_id || ing.id) === refId);
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
                        </span>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
