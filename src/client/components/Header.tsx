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
      {/* Top Editorial Masthead Bar */}
      <div className="masthead-edition-bar">
        <div>
          <span>REVISTĂ & COMPENDIU CULINAR DE PRECIZIE</span>
          <span style={{ marginLeft: '1rem', color: 'var(--color-gold-dark)' }}>VOL. I • TOAMNĂ 2026</span>
        </div>
        <div className="masthead-edition-cities">
          <span>Bologna</span>
          <span>Milano</span>
          <span>Dijon</span>
          <span>Paris</span>
          <span>București</span>
        </div>
      </div>

      {/* Main Header Inner */}
      <div className="header-inner">
        <div className="brand" onClick={onNavigateToList} role="button" tabIndex={0}>
          <div className="brand-monogram">
            <span>AG</span>
          </div>
          <div className="brand-text">
            <span className="brand-title">ATLAS GASTRONOMIC</span>
            <span className="brand-subtitle">Cultură Gastronomică & Tradiție Canonică</span>
          </div>
        </div>

        {activeRecipeTitle && currentView !== 'list' && (
          <div className="header-recipe-tag" title={activeRecipeTitle}>
            <span>{activeRecipeTitle}</span>
          </div>
        )}

        <nav className="header-nav">
          {/* Mode Switcher */}
          <div className="mode-toggle-group">
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

          <button
            type="button"
            className={`btn ${currentView === 'list' ? 'btn-secondary' : 'btn-ghost'}`}
            onClick={onNavigateToList}
            title="Deschide catalogul complet"
          >
            <BookOpen size={15} />
            Bibliotecă
          </button>

          {appMode === 'editorial' && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onNewRecipe}
              title="Compune o rețetă nouă"
            >
              <Plus size={15} />
              Adaugă Rețetă Nouă
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
