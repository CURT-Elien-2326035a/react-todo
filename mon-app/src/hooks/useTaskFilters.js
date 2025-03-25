import { useState } from 'react';
import { compareDates } from '../utils/dateUtils';

export function useTaskFilters(initialTodos) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'done', 'active'
  const [detailedStatusFilter, setDetailedStatusFilter] = useState('all'); // For new status system
  const [urgencyFilter, setUrgencyFilter] = useState('all'); // 'all', 'urgent', 'normal'
  const [categoryFilter, setCategoryFilter] = useState(null); // null or category ID
  const [sortBy, setSortBy] = useState('default'); // 'default', 'name', 'date_creation', 'date_echeance'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDetailedStatusFilter('all');
    setUrgencyFilter('all');
    setCategoryFilter(null);
  };

  const applyFilters = (todos, getTaskCategories) => {
    // First filter todos
    const filtered = todos.filter(todo => {
      // Search term filter
      const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        todo.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter (basic done/not done)
      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'done' && todo.done) || 
        (statusFilter === 'active' && !todo.done);
        
      // Detailed status filter (new status system)
      const matchesDetailedStatus = 
        detailedStatusFilter === 'all' || 
        todo.status === detailedStatusFilter;
        
      // Urgency filter
      const matchesUrgency = 
        urgencyFilter === 'all' || 
        (urgencyFilter === 'urgent' && todo.urgent) || 
        (urgencyFilter === 'normal' && !todo.urgent);
        
      // Category filter
      const taskCategories = getTaskCategories(todo.id);
      const matchesCategory = 
        categoryFilter === null || 
        taskCategories.some(category => category.id === categoryFilter);
        
      return matchesSearch && matchesStatus && matchesDetailedStatus && matchesUrgency && matchesCategory;
    });

    // Then sort the filtered todos
    return [...filtered].sort((a, b) => {
      // Default order (no sorting)
      if (sortBy === 'default') return 0;
      
      let comparison = 0;
      
      // Compare based on selected criteria
      if (sortBy === 'name') {
        comparison = a.title.localeCompare(b.title, 'fr', {sensitivity: 'base'});
      } else if (sortBy === 'date_creation') {
        comparison = compareDates(a.date_creation, b.date_creation);
      } else if (sortBy === 'date_echeance') {
        if (!a.date_echeance) return 1; // Undefined dates to end
        if (!b.date_echeance) return -1;
        comparison = compareDates(a.date_echeance, b.date_echeance);
      }
      
      // Reverse if descending order
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  return {
    filters: {
      searchTerm, setSearchTerm,
      statusFilter, setStatusFilter,
      detailedStatusFilter, setDetailedStatusFilter,
      urgencyFilter, setUrgencyFilter,
      categoryFilter, setCategoryFilter,
      sortBy, setSortBy,
      sortDirection, setSortDirection
    },
    resetFilters,
    applyFilters
  };
}
