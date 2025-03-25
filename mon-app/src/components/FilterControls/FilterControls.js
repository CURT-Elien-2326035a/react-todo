import React from 'react';
import './FilterControls.css';

function FilterControls({ 
  searchTerm, setSearchTerm,
  statusFilter, setStatusFilter,
  detailedStatusFilter, setDetailedStatusFilter,
  urgencyFilter, setUrgencyFilter,
  categoryFilter, setCategoryFilter,
  categories,
  taskStatuses,
  sortBy, setSortBy,
  sortDirection, setSortDirection,
  resetFilters,
  filteredCount,
  totalCount
}) {
  return (
    <div className="filter-controls">
      <h2>Filtres</h2>
      
      <div className="filter-row">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Recherche par titre ou description"
          className="search-input"
        />
      </div>
      
      <div className="filter-row">
        <div className="filter-group">
          <label>Statut:</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tous</option>
            <option value="active">En cours</option>
            <option value="done">Terminées</option>
          </select>
        </div>
        
        <div className="filter-group detailed-status-filter">
          <label>État détaillé:</label>
          <select 
            value={detailedStatusFilter} 
            onChange={(e) => setDetailedStatusFilter(e.target.value)}
          >
            <option value="all">Tous</option>
            {Object.entries(taskStatuses).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>Urgence:</label>
          <select 
            value={urgencyFilter} 
            onChange={(e) => setUrgencyFilter(e.target.value)}
          >
            <option value="all">Toutes</option>
            <option value="urgent">Urgent</option>
            <option value="normal">Normal</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Catégorie:</label>
          <select 
            value={categoryFilter || ''} 
            onChange={(e) => setCategoryFilter(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Toutes</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="filter-actions">
        <button onClick={resetFilters} className="reset-filters-btn">
          Réinitialiser les filtres
        </button>
        <div className="filter-stats">
          {filteredCount} tâche(s) affichée(s)
        </div>
      </div>

      <div className="filter-row sort-controls">
        <div className="filter-group">
          <label>Trier par:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">Par défaut</option>
            <option value="name">Nom</option>
            <option value="date_creation">Date de création</option>
            <option value="date_echeance">Date d'échéance</option>
          </select>
        </div>
        
        {sortBy !== 'default' && (
          <div className="filter-group">
            <label>Direction:</label>
            <select 
              value={sortDirection} 
              onChange={(e) => setSortDirection(e.target.value)}
            >
              <option value="asc">Ascendant ↑</option>
              <option value="desc">Descendant ↓</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

export default FilterControls;
