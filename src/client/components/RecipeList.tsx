import React, { useState, useMemo } from 'react';
import { RecipeListItem } from '../../server/repository.js';
import { getRecipeEditorial } from '../services/editorialData.js';
import { Search, Clock, Users, ChefHat, Plus, Layers, Flame, BookOpen, Compass } from 'lucide-react';

interface RecipeListProps {
  recipes: RecipeListItem[];
  onOpenRecipe: (id: string) => void;
  onOpenDetail?: (id: string) => void;
  onOpenCook?: (id: string) => void;
  onNewRecipe: () => void;
  appMode?: 'cooking' | 'editorial';
}

export const RecipeList: React.FC<RecipeListProps> = ({
  recipes,
  onOpenRecipe,
  onOpenDetail,
  onOpenCook,
  onNewRecipe,
  appMode = 'editorial',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [traditionFilter, setTraditionFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');

  // Identify Featured Recipe (defaults to Tagliatelle al Ragù or the first recipe)
  const featuredRecipe = useMemo(() => {
    return (
      recipes.find((r) => r.id === 'rec_tagliatelle_ragu_001' || r.recipe_id === 'rec_tagliatelle_ragu_001') ||
      recipes[0] ||
      null
    );
  }, [recipes]);

  const featuredEditorial = useMemo(() => {
    return getRecipeEditorial(featuredRecipe?.id);
  }, [featuredRecipe]);

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
    if (status === 'human_approved') return <span className="hero-heritage-stamp" style={{ borderColor: 'var(--color-olive-border)', color: 'var(--color-olive)' }}>Aprobat Canonic</span>;
    if (status === 'published') return <span className="hero-heritage-stamp">Publicat</span>;
    if (status === 'draft') return <span className="hero-heritage-stamp" style={{ color: 'var(--text-subtle)', borderColor: 'var(--border-strong)' }}>Schiță</span>;
    return <span className="hero-heritage-stamp">{status}</span>;
  };

  const handleOpenDetailView = (id: string) => {
    if (onOpenDetail) onOpenDetail(id);
    else onOpenRecipe(id);
  };

  const handleOpenCookView = (id: string) => {
    if (onOpenCook) onOpenCook(id);
    else onOpenRecipe(id);
  };

  return (
    <div className="main-content">
      {/* Primary Editorial Heading */}
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
        Catalog Editorial de Rețete
      </h1>

      {/* Editorial Intro Banner */}
      <div className="publication-intro-banner">
        <p className="publication-intro-text">
          O colecție canonică de rețete fundamentale din marile tradiții europene, documentate istoric și structurate cu trasabilitate riguroasă a ingredientelor și tehnicilor.
        </p>
        <div className="publication-meta-badge">
          5 Rețete Fundamentale Validate
        </div>
      </div>

      {/* Featured Editorial Hero Spread (when no active filters) */}
      {!searchTerm && !categoryFilter && !traditionFilter && !difficultyFilter && featuredRecipe && (
        <section className="hero-editorial-spread">
          <div className="hero-spread-image-wrapper">
            <img
              src={featuredEditorial?.image || '/images/tagliatelle-ragu.jpg'}
              alt={featuredEditorial?.imageAlt || featuredRecipe.title}
              className="hero-spread-image"
            />
            {featuredEditorial?.imageCaption && (
              <div className="hero-image-caption-overlay">
                <span>{featuredEditorial.imageCaption}</span>
              </div>
            )}
          </div>

          <div className="hero-spread-content">
            <div>
              <div className="hero-kicker-row">
                <span className="hero-tradition-tag">
                  <Compass size={14} />
                  {featuredEditorial?.heritage || featuredRecipe.culinary_tradition || 'Tradiție Canonică'}
                </span>
                {getStatusBadge(featuredRecipe.status)}
              </div>

              <h2 className="hero-title">{featuredRecipe.title}</h2>

              <p className="hero-summary">
                {featuredRecipe.summary || featuredEditorial?.editorialSubtitle || 'Rețetă canonică structurată cu precizie de gramaj și timpi.'}
              </p>

              {featuredEditorial?.chefQuote && (
                <blockquote className="hero-pullquote">
                  {featuredEditorial.chefQuote}
                </blockquote>
              )}
            </div>

            <div>
              <div className="hero-meta-row">
                <div className="hero-meta-item">
                  <Users size={16} />
                  <span>{featuredRecipe.yield_quantity} {featuredRecipe.yield_unit || 'porții'}</span>
                </div>
                {featuredRecipe.total_minutes ? (
                  <div className="hero-meta-item">
                    <Clock size={16} />
                    <span>{featuredRecipe.total_minutes} min total</span>
                  </div>
                ) : null}
                <div className="hero-meta-item">
                  <Flame size={16} />
                  <span>{getDifficultyLabel(featuredRecipe.difficulty)}</span>
                </div>
                <div className="hero-meta-item">
                  <Layers size={16} />
                  <span>{featuredRecipe.ingredients_count} ingrediente</span>
                </div>
              </div>

              <div className="hero-actions-row">
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={() => handleOpenCookView(featuredRecipe.id)}
                >
                  <ChefHat size={18} />
                  Gătește în Cook Mode
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-lg"
                  onClick={() => handleOpenDetailView(featuredRecipe.id)}
                >
                  <BookOpen size={18} />
                  Citește Rețeta
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Catalog Section Header */}
      <div className="catalog-section-header">
        <div className="catalog-heading-wrap">
          <h2>Catalogul Canonic</h2>
          <p>Selecție de preparate iconice cu rețetar complet și instrucțiuni detaliate</p>
        </div>

        {appMode === 'editorial' && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={onNewRecipe}>
            <Plus size={15} /> Adaugă Rețetă Nouă
          </button>
        )}
      </div>

      {/* Filter and Discovery Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Caută după titlu, tradiție culinară sau ingredient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-subtle)',
            }}
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
          <option value="">Toate tradițiile culinare</option>
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

      {/* Recipe Cards Grid */}
      {filteredRecipes.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'var(--bg-surface)',
            border: '1px dashed var(--border-editorial)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <ChefHat size={44} style={{ color: 'var(--text-subtle)', marginBottom: '1rem' }} />
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', marginBottom: '0.5rem' }}>
            Nicio rețetă găsită
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Reajustați termenii de căutare sau filtrele de categorie și tradiție culinară.
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('');
              setTraditionFilter('');
              setDifficultyFilter('');
            }}
          >
            Resetează filtrele
          </button>
        </div>
      ) : (
        <div className="recipe-grid">
          {filteredRecipes.map((r) => {
            const editorial = getRecipeEditorial(r.id);
            const imageSrc = editorial?.image || '/images/tagliatelle-ragu.jpg';

            const handleCardClick = () => {
              if (appMode === 'cooking' && onOpenDetail) {
                onOpenDetail(r.id);
              } else {
                onOpenRecipe(r.id);
              }
            };

            return (
              <div
                key={r.id}
                className="recipe-card"
                onClick={handleCardClick}
              >
                {/* Visual Editorial Image Header */}
                <div className="card-image-box">
                  <img
                    src={imageSrc}
                    alt={r.title}
                    className="card-image"
                    loading="lazy"
                  />
                  <div className="card-tradition-badge">
                    {r.culinary_tradition || 'Canonic'}
                  </div>
                </div>

                <div className="card-content-body">
                  <div className="card-top">
                    <span className="card-category">
                      {r.category || 'Fel Principal'}
                    </span>
                    {getStatusBadge(r.status)}
                  </div>

                  <h2 className="card-title">{r.title}</h2>

                  <p className="card-summary">
                    {r.summary || 'Rețetă canonică documentată cu trasabilitate de ingrediente.'}
                  </p>

                  <div className="card-meta">
                    <div className="card-meta-left">
                      <div className="card-meta-item">
                        <Users size={14} />
                        <span>{r.yield_quantity} {r.yield_unit || 'porții'}</span>
                      </div>
                      {r.total_minutes ? (
                        <div className="card-meta-item">
                          <Clock size={14} />
                          <span>{r.total_minutes}m</span>
                        </div>
                      ) : null}
                      {r.difficulty ? (
                        <div className="card-meta-item">
                          <Flame size={14} />
                          <span>{getDifficultyLabel(r.difficulty)}</span>
                        </div>
                      ) : null}
                    </div>

                    <div className="card-meta-item">
                      <Layers size={14} />
                      <span>{r.ingredients_count} ingr.</span>
                    </div>
                  </div>

                  {/* Card Quick Actions */}
                  <div className="card-actions">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm btn-card-cook"
                      style={{ flex: 1 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCookView(r.id);
                      }}
                    >
                      <ChefHat size={14} />
                      Gătește
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm btn-card-detail"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetailView(r.id);
                      }}
                    >
                      Vezi Rețeta
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
