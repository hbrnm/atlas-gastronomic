import React from 'react';
import { Recipe } from '../../shared/types.js';

interface GeneralInfoProps {
  recipe: Recipe;
  onChange: (updated: Partial<Recipe>) => void;
}

export const GeneralInfo: React.FC<GeneralInfoProps> = ({ recipe, onChange }) => {
  return (
    <div className="editor-panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Context Gastronomic & Metadate</h2>
          <p className="panel-desc">Definiți identitatea editorială, clasificarea regională și timpii de preparare.</p>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Titlul Rețetei *</label>
          <input
            type="text"
            className="form-control"
            placeholder="ex: Sarmale moldovenești de Crăciun în foi de varză murată"
            value={recipe.title || ''}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </div>

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Rezumat Editorial / Descriere Gastronomică</label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Descrieți pe scurt specificul preparatului, profilul aromatic și contextul de servire..."
            value={recipe.summary || ''}
            onChange={(e) => onChange({ summary: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Categorie</label>
          <input
            type="text"
            className="form-control"
            placeholder="ex: Fel Principal, Supe și Ciorbe, Deserturi"
            value={recipe.category || ''}
            onChange={(e) => onChange({ category: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Tradiție Culinară</label>
          <input
            type="text"
            className="form-control"
            placeholder="ex: Românească, Austro-Ungară, Balcanică"
            value={recipe.culinary_tradition || ''}
            onChange={(e) => onChange({ culinary_tradition: e.target.value || null })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Regiune / Zonă Etnografică</label>
          <input
            type="text"
            className="form-control"
            placeholder="ex: Moldova, Transilvania, Oltenia"
            value={recipe.region || ''}
            onChange={(e) => onChange({ region: e.target.value || null })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Nivel de Dificultate</label>
          <select
            className="form-control"
            value={recipe.difficulty || ''}
            onChange={(e) => onChange({ difficulty: (e.target.value as any) || null })}
          >
            <option value="">Nespecificat</option>
            <option value="easy">Ușor (accesibil oricărui începător)</option>
            <option value="moderate">Moderat (necesită atenție la textură/timpi)</option>
            <option value="advanced">Avansat (tehnici culinare de precizie)</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Număr Porții (Cantitate)</label>
          <input
            type="number"
            min="1"
            className="form-control"
            value={recipe.yield?.quantity ?? 4}
            onChange={(e) =>
              onChange({
                yield: {
                  ...recipe.yield,
                  quantity: parseFloat(e.target.value) || 1,
                  unit: recipe.yield?.unit || 'porții',
                },
              })
            }
          />
        </div>

        <div className="form-group">
          <label className="form-label">Unitate Porție</label>
          <input
            type="text"
            className="form-control"
            placeholder="porții, bucăți, litri"
            value={recipe.yield?.unit || 'porții'}
            onChange={(e) =>
              onChange({
                yield: {
                  ...recipe.yield,
                  quantity: recipe.yield?.quantity ?? 4,
                  unit: e.target.value || 'porții',
                },
              })
            }
          />
        </div>

        <div className="form-group">
          <label className="form-label">Timp de Preparare Activ (Minute)</label>
          <input
            type="number"
            min="0"
            className="form-control"
            placeholder="ex: 25"
            value={recipe.timing?.active_minutes ?? ''}
            onChange={(e) =>
              onChange({
                timing: {
                  ...recipe.timing,
                  active_minutes: e.target.value ? parseInt(e.target.value, 10) : null,
                  total_minutes: recipe.timing?.total_minutes ?? null,
                },
              })
            }
          />
        </div>

        <div className="form-group">
          <label className="form-label">Timp Total / Gătire (Minute)</label>
          <input
            type="number"
            min="0"
            className="form-control"
            placeholder="ex: 60"
            value={recipe.timing?.total_minutes ?? ''}
            onChange={(e) =>
              onChange({
                timing: {
                  ...recipe.timing,
                  active_minutes: recipe.timing?.active_minutes ?? null,
                  total_minutes: e.target.value ? parseInt(e.target.value, 10) : null,
                  lead_time_hours: recipe.timing?.lead_time_hours ?? null,
                },
              })
            }
          />
        </div>

        <div className="form-group">
          <label className="form-label">Timp Maturare / Odihnă (Ore) [V2]</label>
          <input
            type="number"
            min="0"
            step="any"
            className="form-control"
            placeholder="ex: 24 (pentru ragù, macerare sau odihnă peste noapte)"
            value={recipe.timing?.lead_time_hours ?? ''}
            onChange={(e) =>
              onChange({
                timing: {
                  ...recipe.timing,
                  active_minutes: recipe.timing?.active_minutes ?? null,
                  total_minutes: recipe.timing?.total_minutes ?? null,
                  lead_time_hours: e.target.value === '' ? null : parseFloat(e.target.value),
                },
              })
            }
          />
        </div>
      </div>
    </div>
  );
};
