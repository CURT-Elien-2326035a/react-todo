import React from 'react';
import './ActiveFilters.css';

function ActiveFilters({
  searchTerm, setSearchTerm,
  statusFilter, setStatusFilter,
  detailedStatusFilter, setDetailedStatusFilter,
  urgencyFilter, setUrgencyFilter,
  categoryFilter, setCategoryFilter,
  categories,
  taskStatuses
}) {
  const hasActiveFilters = searchTerm || statusFilter !== 'all' || detailedStatusFilter !== 'all' || 
                          urgencyFilter !== 'all' || categoryFilter !== null;
                          
  if (!hasActiveFilters) return null;
  
  return (
    <div className="active-filters">
      <h3>Filtres actifs:</h3>
      <div className="filter-badges">
        {searchTerm && (
          <span className="filter-badge">
            Recherche: "{searchTerm}"
            <button onClick={() => setSearchTerm('')}>×</button>
          </span>
        )}
        {statusFilter !== 'all' && (
          <span className="filter-badge">
            Statut: {statusFilter === 'done' ? 'Terminées' : 'En cours'}
            <button onClick={() => setStatusFilter('all')}>×</button>
          </span>
        )}
        {detailedStatusFilter !== 'all' && (
          <span className="filter-badge">
            État: {taskStatuses[detailedStatusFilter].label}
            <button onClick={() => setDetailedStatusFilter('all')}>×</button>
          </span>
        )}
        {urgencyFilter !== 'all' && (
          <span className="filter-badge">
            Urgence: {urgencyFilter === 'urgent' ? 'Urgent' : 'Normal'}
            <button onClick={() => setUrgencyFilter('all')}>×</button>
          </span>
        )}
        {categoryFilter !== null && (
          <span className="filter-badge">
            Catégorie: {categories.find(cat => cat.id === categoryFilter)?.title}
            <button onClick={() => setCategoryFilter(null)}>×</button>
          </span>
        )}
      </div>
    </div>
  );
}

export default ActiveFilters;
