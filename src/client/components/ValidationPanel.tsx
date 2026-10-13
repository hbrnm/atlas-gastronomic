import React from 'react';
import { RecipeValidationResult } from '../../shared/types.js';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ValidationPanelProps {
  validation: RecipeValidationResult;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({ validation }) => {
  const { isValid, errors, warnings } = validation;

  return (
    <div className="validation-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isValid ? (
            <CheckCircle2 size={20} style={{ color: 'var(--color-success)' }} />
          ) : (
            <AlertCircle size={20} style={{ color: 'var(--color-error)' }} />
          )}
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem' }}>
            Integritate & Validare Editorială
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span
            className="badge"
            style={{
              backgroundColor: errors.length > 0 ? 'var(--color-error-bg)' : 'var(--bg-subtle)',
              color: errors.length > 0 ? 'var(--color-error)' : 'var(--text-subtle)',
            }}
          >
            {errors.length} {errors.length === 1 ? 'eroare' : 'erori'}
          </span>
          <span
            className="badge"
            style={{
              backgroundColor: warnings.length > 0 ? 'var(--color-warning-bg)' : 'var(--bg-subtle)',
              color: warnings.length > 0 ? 'var(--color-warning)' : 'var(--text-subtle)',
            }}
          >
            {warnings.length} {warnings.length === 1 ? 'recomandare' : 'recomandări'}
          </span>
        </div>
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginBottom: '1rem', fontStyle: 'italic' }}>
        Notă: Verificarea automată garantează integritatea structurală a datelor și trasabilitatea referințelor dintre pași și ingrediente. Aceasta nu atestă calitatea gastronomică sau gustul preparatului.
      </p>

      {errors.length === 0 && warnings.length === 0 ? (
        <div className="val-item" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)', borderLeft: '3px solid var(--color-success)' }}>
          <CheckCircle2 size={16} />
          <span>Toate cerințele structurale sunt îndeplinite. Rețeta este conformă standardului de redactare.</span>
        </div>
      ) : null}

      {/* Errors list */}
      {errors.length > 0 ? (
        <div style={{ marginBottom: warnings.length > 0 ? '0.75rem' : 0 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-error)', marginBottom: '0.35rem' }}>
            Erori Structurale (Necesită Remediere):
          </div>
          {errors.map((err, i) => (
            <div key={`err_${i}`} className="val-item error">
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>[{err.field}]</strong> {err.message}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Warnings list */}
      {warnings.length > 0 ? (
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-warning)', marginBottom: '0.35rem' }}>
            Recomandări & Avertismente Editoriale:
          </div>
          {warnings.map((warn, i) => (
            <div key={`warn_${i}`} className="val-item warning">
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>[{warn.field}]</strong> {warn.message}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
