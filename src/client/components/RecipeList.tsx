import React, { useState, useMemo } from 'react';
import { RecipeListItem } from '../../server/repository.js';
import { Search, Clock, Users, ChefHat, Plus, Layers, Flame } from 'lucide-react';

interface RecipeListProps {
  recipes: RecipeListItem[];
  onOpenRecipe: (id: string) => void;
  onNewRecipe: () => void;
}

export const RecipeList: React.FC<RecipeListProps> = ({ recipes, onOpenRecipe, onNewRecipe }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [traditionFilter, setTraditionFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');

  const categories = useMemo(() => {
    const set = new Set(recipes.map((r) => r.category).filter(Boolean));
    return Array.from(set).sort();
  }, [recipes]);

  const traditions = useMemo(() => {
    const list = recipes.map((r) => r.culinary_tradition).filter((t): t is string => Boolean(t));
    const set = new Set(list);
    return Array.from(set).sort();
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    return recipes.filter((r) => {
      const matchSearch =
        !searchTerm ||
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.summary && r.summary.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.culinary_tradition && r.culinary_tradition.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategory = !categoryFilter || r.category === categoryFilter;
      const matchTradition = !traditionFilter || r.culinary_tradition === traditionFilter;
      const matchDifficulty = !difficultyFilter || r.difficulty === difficultyFilter;

      return matchSearch && matchCategory && matchTradition && matchDifficulty;
    });
  }, [recipes, searchTerm, categoryFilter, traditionFilter, difficultyFilter]);

  const getDifficultyLabel = (diff: string | null) => {
    if (diff === 'easy') return 'Ușor';
    if (diff === 'moderate') return 'Moderat';
    if (diff === 'advanced') return 'Avansat';
    return 'Nespecificat';
  };

  const getStatusBadge = (status: string) => {
    if (status === 'draft') return <span className="badge badge-draft">Schiță</span>;
    if (status === 'human_approved') return <span className="badge badge-approved">Aprobat Uman</span>;
    if (status === 'published') return <span className="badge badge-approved">Publicat</span>;
    return <span className="badge badge-review">{status}</span>;
  };

  return (
    <div className="main-content">
      <div className="library-hero">
        <div className="library-heading">
          <h1>Catalog Editorial de Rețete</h1>
          <p>Rețete gastronomice structurate cu trasabilitate de ingrediente și pași procedurali.</p>
        </div>

        <button type="button" className="btn btn-primary" onClick={onNewRecipe}>
          <Plus size={16} />
          Adaugă Rețetă Nouă
        </button>
      </div>

      <div className="filter-bar">
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <input
            type="text"
            className="search-input"
            style={{ width: '100%', paddingLeft: '2.25rem' }}
            placeholder="Caută după titlu, tradiție sau rezumat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search
            size={16}
            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }}
          />
        </div>

        <select
          className="select-filter"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">Toate categoriile</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          className="select-filter"
          value={traditionFilter}
          onChange={(e) => setTraditionFilter(e.target.value)}
        >
          <option value="">Toate tradițiile</option>
          {traditions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          className="select-filter"
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
        >
          <option value="">Toate nivelurile</option>
          <option value="easy">Ușor</option>
          <option value="moderate">Moderat</option>
          <option value="advanced">Avansat</option>
        </select>
      </div>

      {filteredRecipes.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'var(--bg-surface)',
            border: '1px dashed var(--border-strong)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <ChefHat size={48} style={{ color: 'var(--text-subtle)', marginBottom: '1rem' }} />
          <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: '0.5rem' }}>Nicio rețetă găsită</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Nu există rețete care să corespundă criteriilor de căutare selectate.
          </p>
          <button type="button" className="btn btn-secondary" onClick={onNewRecipe}>
            <Plus size={16} /> Creează o rețetă nouă
          </button>
        </div>
      ) : (
        <div className="recipe-grid">
          {filteredRecipes.map((r) => (
            <div
              key={r.id}
              className="recipe-card"
              onClick={() => onOpenRecipe(r.id)}
            >
              <div className="card-top">
                <span
                  style={{
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontWeight: 700,
                    color: 'var(--accent-primary)',
                  }}
                >
                  {r.category || 'General'}
                  {r.culinary_tradition ? ` • ${r.culinary_tradition}` : ''}
                </span>
                {getStatusBadge(r.status)}
              </div>

              <h2 className="card-title">{r.title}</h2>
              <p className="card-summary">{r.summary || 'Fără rezumat editorial specificat.'}</p>

              <div className="card-meta">
                <div className="meta-group">
                  <span title="Porții" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Users size={14} />
                    {r.yield_quantity} {r.yield_unit || 'porții'}
                  </span>
                  {r.total_minutes ? (
                    <span title="Timp total" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={14} />
                      {r.total_minutes} min
                    </span>
                  ) : null}
                  {r.difficulty ? (
                    <span title="Dificultate" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Flame size={14} />
                      {getDifficultyLabel(r.difficulty)}
                    </span>
                  ) : null}
                </div>

                <div className="meta-group">
                  <span title="Număr ingrediente" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Layers size={14} />
                    {r.ingredients_count} ingr.
                  </span>
                  <span>{r.steps_count} pași</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
