import React from 'react';
import { BookOpen, Plus, ChefHat, Edit3 } from 'lucide-react';

interface HeaderProps {
  currentView: 'list' | 'detail' | 'cook' | 'editor';
  appMode: 'cooking' | 'editorial';
  onToggleMode: (mode: 'cooking' | 'editorial') => void;
  onNavigateToList: () => void;
  onNewRecipe: () => void;
  activeRecipeTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  appMode,
  onToggleMode,
  onNavigateToList,
  onNewRecipe,
  activeRecipeTitle,
}) => {
  return (
    <header className="app-header">
      {/* 1. Publication Dateline Ribbon */}
      <div className="masthead-edition-bar">
        <div className="masthead-edition-left">
          <span className="masthead-tag">REVISTĂ & COMPENDIU CULINAR DE PRECIZIE</span>
          <span className="masthead-separator">·</span>
          <span className="masthead-issue">VOL. I • TOAMNĂ 2026</span>
        </div>
        <div className="masthead-edition-cities">
          <span>Bologna</span>
          <span>Milano</span>
          <span>Dijon</span>
          <span>Paris</span>
          <span>București</span>
        </div>
      </div>

      {/* 2. Distinctive Centered Editorial Masthead */}
      <div className="masthead-hero">
        <div
          className="brand"
          onClick={onNavigateToList}
          role="button"
          tabIndex={0}
          title="Mergi la Catalogul Editorial"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigateToList();
            }
          }}
        >
          <div className="brand-monogram">
            <span>AG</span>
          </div>
          <div className="brand-text">
            <span className="brand-title">ATLAS GASTRONOMIC</span>
            <span className="brand-subtitle">Cultură Gastronomică & Tradiție Canonică Europeană</span>
          </div>
        </div>
      </div>

      {/* 3. Refined Editorial Navigation Bar */}
      <div className="masthead-nav-bar">
        <div className="nav-bar-inner">
          {/* Left Context: Active recipe breadcrumb or archival tag */}
          <div className="nav-left">
            {activeRecipeTitle && currentView !== 'list' ? (
              <div className="header-recipe-tag" title={activeRecipeTitle}>
                <span className="recipe-tag-prefix">Articol canonic:</span>
                <span className="recipe-tag-title">{activeRecipeTitle}</span>
              </div>
            ) : (
              <span className="nav-journal-dateline">Bucătărie Documentată Istoric</span>
            )}
          </div>

          {/* Right Navigation & Controls */}
          <nav className="header-nav">
            {/* Primary Catalog Access Button */}
            <button
              type="button"
              className={`btn nav-link-btn ${currentView === 'list' ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={onNavigateToList}
              title="Deschide catalogul complet"
            >
              <BookOpen size={15} />
              Bibliotecă
            </button>

            {/* Mode Switcher: Cooking / Reading vs Editorial Drafting */}
            <div className="mode-toggle-group" role="group" aria-label="Comută modul aplicației">
              <button
                type="button"
                className={`mode-toggle-btn ${appMode === 'cooking' ? 'active' : ''}`}
                onClick={() => onToggleMode('cooking')}
                title="Comută în modul de lectură și gătit"
              >
                <ChefHat size={14} />
                Gătit & Lectură
              </button>

              <button
                type="button"
                className={`mode-toggle-btn ${appMode === 'editorial' ? 'active' : ''}`}
                onClick={() => onToggleMode('editorial')}
                title="Comută în modul redacțional"
              >
                <Edit3 size={14} />
                Redacție
              </button>
            </div>

            {/* Editorial Action Button */}
            {appMode === 'editorial' && (
              <button
                type="button"
                className="btn btn-primary btn-sm btn-new-recipe"
                onClick={onNewRecipe}
                title="Compune o rețetă nouă"
              >
                <Plus size={15} />
                Adaugă Rețetă Nouă
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
