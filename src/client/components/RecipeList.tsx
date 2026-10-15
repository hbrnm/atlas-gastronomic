import React, { useState, useMemo } from 'react';
import { RecipeListItem } from '../../server/repository.js';
import { getRecipeEditorial } from '../services/editorialData.js';
import { Search, Clock, Users, ChefHat, Plus, Layers, Flame, ArrowRight, Heart } from 'lucide-react';

interface RecipeListProps {
  recipes: RecipeListItem[];
  onOpenRecipe: (id: string) => void;
  onOpenDetail?: (id: string) => void;
  onOpenCook?: (id: string) => void;
  onNewRecipe: () => void;
  appMode?: 'cooking' | 'editorial';
}

const CURATED_RECIPE_IDS = [
  'rec_tagliatelle_ragu_001',
  'rec_risotto_milanese_002',
  'rec_boeuf_bourguignon_003',
  'rec_sarmale_traditionale_012',
];

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
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  // Curated editorial showcase recipes using real canonical IDs
  const curatedRecipes = useMemo(() => {
    const found = CURATED_RECIPE_IDS.map((id) =>
      recipes.find((r) => r.id === id || r.recipe_id === id)
    ).filter(Boolean) as RecipeListItem[];

    // Fallback if fewer than 4 matched in partial test seed DBs
    if (found.length === 0) {
      return recipes.slice(0, 4);
    }
    return found;
  }, [recipes]);

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

      let matchCollection = true;
      if (selectedCollection === 'sezon') {
        const text = `${r.title} ${r.summary || ''} ${r.category}`.toLowerCase();
        matchCollection =
          text.includes('varză') ||
          text.includes('sarmale') ||
          text.includes('legume') ||
          text.includes('șofran') ||
          text.includes('vin') ||
          r.category === 'Supe și Ciorbe' ||
          r.category === 'Fel Principal';
      } else if (selectedCollection === 'Italiană') {
        const text = `${r.culinary_tradition || ''} ${r.region || ''} ${r.title}`.toLowerCase();
        matchCollection =
          text.includes('italian') ||
          text.includes('bologn') ||
          text.includes('milan') ||
          text.includes('lombard') ||
          text.includes('emilia') ||
          text.includes('venet') ||
          r.id === 'rec_tagliatelle_ragu_001' ||
          r.id === 'rec_risotto_milanese_002' ||
          r.id === 'rec_tiramisu_trevisano_008';
      } else if (selectedCollection === 'Franceză') {
        const text = `${r.culinary_tradition || ''} ${r.region || ''} ${r.title}`.toLowerCase();
        matchCollection =
          text.includes('francez') ||
          text.includes('bourgogne') ||
          text.includes('provence') ||
          text.includes('paris');
      } else if (selectedCollection === 'Românească') {
        const text = `${r.culinary_tradition || ''} ${r.region || ''} ${r.title}`.toLowerCase();
        matchCollection =
          text.includes('român') ||
          text.includes('roman') ||
          text.includes('bucovin') ||
          text.includes('moldov');
      } else if (selectedCollection) {
        matchCollection = Boolean(r.culinary_tradition && r.culinary_tradition.toLowerCase().includes(selectedCollection.toLowerCase()));
      }

      return matchSearch && matchCategory && matchTradition && matchDifficulty && matchCollection;
    });
  }, [recipes, searchTerm, categoryFilter, traditionFilter, difficultyFilter, selectedCollection]);

  const getDifficultyLabel = (diff: string | null) => {
    if (diff === 'easy') return 'Ușor';
    if (diff === 'moderate') return 'Moderat';
    if (diff === 'advanced') return 'Avansat';
    return 'Nespecificat';
  };

  const getStatusBadge = (status: string) => {
    if (status === 'human_approved') return <span className="hero-heritage-stamp hero-heritage-stamp--approved">Aprobat Canonic</span>;
    if (status === 'published') return <span className="hero-heritage-stamp hero-heritage-stamp--published">Publicat</span>;
    if (status === 'editorial_review') return <span className="hero-heritage-stamp hero-heritage-stamp--review">Revizuire</span>;
    if (status === 'draft') return <span className="hero-heritage-stamp hero-heritage-stamp--draft">Schiță</span>;
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

  const handleSelectCollection = (traditionKey: string) => {
    setSelectedCollection(traditionKey);
    setTraditionFilter('');
    setCategoryFilter('');
    setDifficultyFilter('');
    setSearchTerm('');
    setTimeout(() => {
      const el = document.getElementById('catalog-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  };

  const handleSelectSeasonalCollection = () => {
    setSelectedCollection('sezon');
    setTraditionFilter('');
    setCategoryFilter('');
    setDifficultyFilter('');
    setSearchTerm('');
    setTimeout(() => {
      const el = document.getElementById('catalog-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  };

  const handleResetAllFilters = () => {
    setSelectedCollection(null);
    setTraditionFilter('');
    setCategoryFilter('');
    setDifficultyFilter('');
    setSearchTerm('');
  };

  const hasActiveFilter = Boolean(searchTerm || categoryFilter || traditionFilter || difficultyFilter || selectedCollection);

  return (
    <div className="main-content">
      {/* Primary Editorial Heading preserved for accessibility & tests */}
      <h1 className="visually-hidden">
        Catalog Editorial de Rețete
      </h1>

      {/* 1. Atmospheric Dark Hero Banner */}
      <section className="catalog-hero-banner">
        <div className="hero-banner-content">
          <div className="hero-banner-eyebrow">BUCĂTĂRIA EUROPEANĂ, AUTENTICĂ</div>
          <h2 className="hero-banner-title">Rețete care spun povești</h2>
          <p className="hero-banner-description">
            De la tradiții verificate la reinterpretări moderne, Atlas Gastronomic este ghidul tău în arta bucătăriei autentice.
          </p>
          <button
            type="button"
            className="btn btn-primary btn-hero-explore"
            onClick={() => {
              const el = document.getElementById('catalog-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Explorează catalogul <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* 2. Curated Editorial Showcase: "Selecția editorului" */}
      {!hasActiveFilter && curatedRecipes.length > 0 && (
        <section className="curated-showcase-section">
          <div className="curated-section-header">
            <div className="curated-heading-wrap">
              <h2 className="curated-section-title">Selecția editorului</h2>
              <p className="curated-section-subtitle">
                Rețete canonice fundamentale documentate cu rigoare istorică și validate în bucătărie
              </p>
            </div>
            <button
              type="button"
              className="curated-view-all-link"
              onClick={() => {
                const el = document.getElementById('catalog-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Vezi toate rețetele →
            </button>
          </div>

          <div className="curated-grid">
            {curatedRecipes.map((r) => {
              const editorial = getRecipeEditorial(r.id);
              const imageSrc = editorial?.image || '/images/tagliatelle-ragu.jpg';
              const tradition = r.culinary_tradition || 'Tradiție Europeană';
              const timeText = r.total_minutes
                ? `${Math.floor(r.total_minutes / 60) > 0 ? `${Math.floor(r.total_minutes / 60)}h ` : ''}${r.total_minutes % 60 ? `${r.total_minutes % 60}min` : ''}`.trim()
                : null;

              return (
                <article
                  key={`curated-${r.id}`}
                  className="curated-card"
                  onClick={() => handleOpenDetailView(r.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOpenDetailView(r.id);
                    }
                  }}
                >
                  <div className="curated-image-box">
                    <img src={imageSrc} alt={r.title} className="curated-image" loading="lazy" />
                    <button
                      type="button"
                      className="curated-favorite-btn"
                      title="Salvează la favorite"
                      aria-label={`Salvează ${r.title} la favorite`}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Heart size={15} />
                    </button>
                  </div>

                  <div className="curated-content">
                    <h3 className="curated-card-title">{r.title}</h3>
                    <div className="curated-meta-row">
                      <span>{tradition}</span>
                      {timeText && (
                        <>
                          <span className="curated-meta-sep">·</span>
                          <span>{timeText}</span>
                        </>
                      )}
                      <span className="curated-meta-sep">·</span>
                      <span>{r.yield_quantity} {r.yield_unit || 'porții'}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. Visual Collections Section: "Colecțiile noastre" */}
      {!hasActiveFilter && (
        <section className="collections-section">
          <div className="collections-header">
            <h2 className="collections-title">Colecțiile noastre</h2>
            <p className="collections-subtitle">
              Explorează marile tradiții gastronomice europene și creațiile sezoniere
            </p>
          </div>

          <div className="collections-grid">
            {/* Bucătăria italiană */}
            <div
              className="collection-card"
              role="button"
              tabIndex={0}
              onClick={() => handleSelectCollection('Italiană')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectCollection('Italiană');
                }
              }}
            >
              <div className="collection-img-wrap">
                <img src="/images/tagliatelle-ragu.jpg" alt="Bucătăria italiană" className="collection-img" />
                <div className="collection-overlay" />
              </div>
              <div className="collection-content">
                <h3 className="collection-name">Bucătăria italiană</h3>
                <span className="collection-link">Explorează colecția →</span>
              </div>
            </div>

            {/* Bucătăria franceză */}
            <div
              className="collection-card"
              role="button"
              tabIndex={0}
              onClick={() => handleSelectCollection('Franceză')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectCollection('Franceză');
                }
              }}
            >
              <div className="collection-img-wrap">
                <img src="/images/boeuf-bourguignon.jpg" alt="Bucătăria franceză" className="collection-img" />
                <div className="collection-overlay" />
              </div>
              <div className="collection-content">
                <h3 className="collection-name">Bucătăria franceză</h3>
                <span className="collection-link">Explorează colecția →</span>
              </div>
            </div>

            {/* Bucătăria românească */}
            <div
              className="collection-card"
              role="button"
              tabIndex={0}
              onClick={() => handleSelectCollection('Românească')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectCollection('Românească');
                }
              }}
            >
              <div className="collection-img-wrap">
                <img src="/images/sarmale.jpg" alt="Bucătăria românească" className="collection-img" />
                <div className="collection-overlay" />
              </div>
              <div className="collection-content">
                <h3 className="collection-name">Bucătăria românească</h3>
                <span className="collection-link">Explorează colecția →</span>
              </div>
            </div>

            {/* Rețete de sezon */}
            <div
              className="collection-card"
              role="button"
              tabIndex={0}
              onClick={() => handleSelectSeasonalCollection()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectSeasonalCollection();
                }
              }}
            >
              <div className="collection-img-wrap">
                <img src="/images/risotto-milanese.jpg" alt="Rețete de sezon" className="collection-img" />
                <div className="collection-overlay" />
              </div>
              <div className="collection-content">
                <h3 className="collection-name">Rețete de sezon</h3>
                <span className="collection-link">Explorează colecția →</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Active Collection / Filter Indicator */}
      {selectedCollection && (
        <div className="active-collection-banner">
          <div className="active-collection-info">
            <span className="active-collection-badge">Colecție activă:</span>
            <strong className="active-collection-name">
              {selectedCollection === 'sezon'
                ? 'Rețete de sezon'
                : `Bucătăria ${selectedCollection.toLowerCase()}`}
            </strong>
            <span className="active-collection-count">
              • {filteredRecipes.length} {filteredRecipes.length === 1 ? 'rețetă găsită' : 'rețete găsite'}
            </span>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm btn-reset-collection"
            onClick={handleResetAllFilters}
          >
            Resetează filtrele
          </button>
        </div>
      )}

      {/* 5. Complete Canonical Catalog */}
      <div id="catalog-section" className="catalog-section-header">
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
          <Search size={16} className="search-input-icon" />
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
        <div className="empty-catalog-state">
          <ChefHat size={44} className="empty-catalog-icon" />
          <h3 className="empty-catalog-title">
            Nicio rețetă găsită
          </h3>
          <p className="empty-catalog-text">
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
                </div>

                <div className="card-content-body">
                  <div className="card-top card-kicker-row">
                    <span className="card-kicker">
                      <span className="card-category">{r.category || 'Fel Principal'}</span>
                      <span className="kicker-separator">·</span>
                      <span className="card-tradition">{r.culinary_tradition || 'Tradiție Canonică'}</span>
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
