import React from 'react';
import { BookOpen, Plus, Compass } from 'lucide-react';

interface HeaderProps {
  currentView: 'list' | 'editor' | 'preview';
  onNavigateToList: () => void;
  onNewRecipe: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigateToList, onNewRecipe }) => {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand" onClick={onNavigateToList}>
          <div className="brand-icon">
            <Compass size={20} />
          </div>
          <div>
            <span className="brand-title">ATLAS GASTRONOMIC</span>
            <span className="brand-subtitle">Redacție Culinară • Recipe Core V1</span>
          </div>
        </div>

        <nav className="header-nav">
          <button
            type="button"
            className={`btn ${currentView === 'list' ? 'btn-secondary' : 'btn-ghost'}`}
            onClick={onNavigateToList}
          >
            <BookOpen size={16} />
            Bibliotecă Rețete
          </button>
          
          <button
            type="button"
            className="btn btn-primary"
            onClick={onNewRecipe}
          >
            <Plus size={16} />
            Rețetă Nouă
          </button>
        </nav>
      </div>
    </header>
  );
};
