import React, { useState } from 'react';
import './App.css';
import data from './data.json';

function App() {
  // Define task statuses with labels, colors, and icons
  const taskStatuses = {
    not_started: { label: 'Non commencée', color: '#6c757d', icon: '⭕' },
    in_progress: { label: 'En cours', color: '#0d6efd', icon: '🔄' },
    on_hold: { label: 'En attente', color: '#ffc107', icon: '⏸️' },
    completed: { label: 'Terminée', color: '#198754', icon: '✅' },
    cancelled: { label: 'Annulée', color: '#dc3545', icon: 'X' }
  };
  
  // Convert existing todo data to use new status format
  const convertedTodos = data.taches.map(task => ({
    ...task,
    // Add status property based on done property
    status: task.done ? 'completed' : 'in_progress',
    // Keep done property for backward compatibility
    done: task.done
  }));
  
  const [todos, setTodos] = useState(convertedTodos);
  const [categories, setCategories] = useState(data.categories);
  const [relations, setRelations] = useState(data.relations);
  const [input, setInput] = useState('');
  const [description, setDescription] = useState('');
  const [dateEcheance, setDateEcheance] = useState('');
  const [contactName, setContactName] = useState('');
  
  // Category state
  const [categoryInput, setCategoryInput] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryColor, setCategoryColor] = useState('#ffffff');
  const [categoryIcon, setCategoryIcon] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'done', 'active'
  const [detailedStatusFilter, setDetailedStatusFilter] = useState('all'); // For new status system
  const [urgencyFilter, setUrgencyFilter] = useState('all'); // 'all', 'urgent', 'normal'
  const [categoryFilter, setCategoryFilter] = useState(null); // null or category ID
  
  // Récurrence states
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState('daily');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceStartDate, setRecurrenceStartDate] = useState('');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');  
  // Sorting states
  const [sortBy, setSortBy] = useState('default'); // 'default', 'name', 'date_creation', 'date_echeance'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'
  // Format date from DD/MM/YYYY to YYYY-MM-DD for HTML date input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    const parts = dateString.split('/');
    if (parts.length !== 3) return '';
    
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  // Format date from YYYY-MM-DD (HTML input) to DD/MM/YYYY (app format)
  const formatDateFromInput = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };
  // Add a new task
  const addTodo = (e) => {
    e.preventDefault();
    if (input.trim()) {
      const newTask = {
        id: Date.now(),
        title: input.trim(),
        description: description.trim(),
        date_creation: new Date().toLocaleDateString('fr-FR'),
        date_echeance: dateEcheance,
        status: 'not_started', // Default to not started
        done: false, // Keep for compatibility
        urgent: false,
        contacts: contactName.trim() ? [{ name: contactName.trim() }] : [],
        // Récurrence properties
        isRecurring: isRecurring,
        recurrenceType: recurrenceType,
        recurrenceInterval: parseInt(recurrenceInterval) || 1,
        recurrenceStartDate: recurrenceStartDate || dateEcheance,
        recurrenceEndDate: recurrenceEndDate || null
      };
      
      if (isRecurring) {
        // Generate recurring task instances
        const recurringTasks = generateRecurringTasks(newTask);
        setTodos([...todos, ...recurringTasks]);
      } else {
        setTodos([...todos, newTask]);
      }
      
      // Reset form
      setInput('');
      setDescription('');
      setDateEcheance('');
      setContactName('');
      resetRecurrenceForm();
    }
  };
  
  // Generate recurring task instances based on recurrence settings
  const generateRecurringTasks = (baseTask) => {
    const startDate = baseTask.recurrenceStartDate ? new Date(formatDateForJS(baseTask.recurrenceStartDate)) : new Date();
    const endDate = baseTask.recurrenceEndDate ? new Date(formatDateForJS(baseTask.recurrenceEndDate)) : new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 6); // Default to 6 months if no end date
    
    const tasks = [];
    let currentDate = new Date(startDate);
    let taskId = baseTask.id;
    
    // Generate up to 30 instances max to prevent infinite loop
    let instanceCount = 0;
    const maxInstances = 30;
    
    while (currentDate <= endDate && instanceCount < maxInstances) {
      const taskDate = new Date(currentDate);
      
      // Create a copy of the base task with a unique ID and date
      const taskInstance = {
        ...baseTask,
        id: taskId++,
        date_echeance: taskDate.toLocaleDateString('fr-FR'),
        // Keep track of the parent task pattern
        recurringTaskId: baseTask.id,
        instanceNumber: instanceCount + 1
      };
      
      tasks.push(taskInstance);
      instanceCount++;
      
      // Advance to the next occurrence date
      switch (baseTask.recurrenceType) {
        case 'daily':
        currentDate.setDate(currentDate.getDate() + baseTask.recurrenceInterval);
        break;
        case 'weekly':
        currentDate.setDate(currentDate.getDate() + (baseTask.recurrenceInterval * 7));
        break;
        case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + baseTask.recurrenceInterval);
        break;
        default:
        currentDate.setDate(currentDate.getDate() + baseTask.recurrenceInterval);
      }
    }
    
    return tasks;
  };
  
  // Format date from DD/MM/YYYY to YYYY-MM-DD for JS Date
  const formatDateForJS = (dateString) => {
    if (!dateString) return null;
    
    const parts = dateString.split('/');
    if (parts.length !== 3) return dateString;
    
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };
  
  // Reset recurrence form fields
  const resetRecurrenceForm = () => {
    setIsRecurring(false);
    setRecurrenceType('daily');
    setRecurrenceInterval(1);
    setRecurrenceStartDate('');
    setRecurrenceEndDate('');
  };
  
  // Set task status (replaces toggleDone)
  const setTaskStatus = (id, status) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { 
        ...todo, 
        status: status,
        // Update done property for backward compatibility
        done: status === 'completed'
      } : todo
    );
    setTodos(updatedTodos);
  };
  
  // Toggle the "urgent" status of a task
  const toggleUrgent = (id) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, urgent: !todo.urgent } : todo
    );
    setTodos(updatedTodos);
  };
  
  // Add a contact to a task
  const addContact = (id, contactName) => {
    if (contactName.trim()) {
      const updatedTodos = todos.map(todo =>
        todo.id === id
        ? { ...todo, contacts: [...todo.contacts, { name: contactName.trim() }] }
        : todo
      );
      setTodos(updatedTodos);
    }
  };
  
  // Category CRUD operations
  
  // Add or update category
  const handleCategorySubmit = (e) => {
    e.preventDefault();
    
    if (categoryInput.trim()) {
      if (editingCategoryId) {
        // Update existing category
        const updatedCategories = categories.map(cat => 
          cat.id === editingCategoryId 
          ? { 
            ...cat, 
            title: categoryInput.trim(), 
            description: categoryDescription.trim(),
            color: categoryColor,
            icon: categoryIcon
          } 
          : cat
        );
        setCategories(updatedCategories);
        setEditingCategoryId(null);
      } else {
        // Add new category
        const newCategory = {
          id: Date.now(),
          title: categoryInput.trim(),
          description: categoryDescription.trim(),
          color: categoryColor,
          icon: categoryIcon
        };
        setCategories([...categories, newCategory]);
      }
      
      // Reset form
      resetCategoryForm();
    }
  };
  
  // Delete a category
  const deleteCategory = (id) => {
    // Remove the category
    setCategories(categories.filter(cat => cat.id !== id));
    
    // Remove all relations with this category
    setRelations(relations.filter(relation => relation.categorie !== id));
    
    // If this was the selected filter, reset the filter
    if (categoryFilter === id) {
      setCategoryFilter(null);
    }
  };
  // Ajoutez cette fonction de comparaison après les autres fonctions utilitaires

// Helper function to compare dates in DD/MM/YYYY format
const compareDates = (dateA, dateB) => {
  if (!dateA) return 1; // Null dates go to end
  if (!dateB) return -1;
  
  const partsA = dateA.split('/').map(Number);
  const partsB = dateB.split('/').map(Number);
  
  // Convert to YYYY-MM-DD for proper comparison
  const dateObjA = new Date(partsA[2], partsA[1] - 1, partsA[0]);
  const dateObjB = new Date(partsB[2], partsB[1] - 1, partsB[0]);
  
  return dateObjA - dateObjB;
};
  // Start editing a category
  const startEditCategory = (category) => {
    setCategoryInput(category.title);
    setCategoryDescription(category.description || '');
    setCategoryColor(category.color || '#ffffff');
    setCategoryIcon(category.icon || '');
    setEditingCategoryId(category.id);
  };
  
  // Reset category form
  const resetCategoryForm = () => {
    setCategoryInput('');
    setCategoryDescription('');
    setCategoryColor('#ffffff');
    setCategoryIcon('');
    setEditingCategoryId(null);
  };
  
  // Toggle category assignment to a task
  const toggleTaskCategory = (taskId, categoryId) => {
    const existingRelation = relations.find(
      relation => relation.tache === taskId && relation.categorie === categoryId
    );
    
    if (existingRelation) {
      // Remove the relation
      setRelations(relations.filter(relation => 
        !(relation.tache === taskId && relation.categorie === categoryId)
      ));
    } else {
      // Add the relation
      setRelations([...relations, { tache: taskId, categorie: categoryId }]);
    }
  };
  
  // Get categories for a task
  const getTaskCategories = (taskId) => {
    const taskRelations = relations.filter(relation => relation.tache === taskId);
    return categories.filter(category => 
      taskRelations.some(relation => relation.categorie === category.id)
    );
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDetailedStatusFilter('all');
    setUrgencyFilter('all');
    setCategoryFilter(null);
  };
  
// Apply filters to todos
const filteredTodos = todos.filter(todo => {
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
  
  // Apply sorting to filtered todos
  const sortedTodos = [...filteredTodos].sort((a, b) => {
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
  
  // Update task deadline
  const updateTaskDeadline = (id, newDeadline) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id
      ? { ...todo, date_echeance: newDeadline }
      : todo
    );
    setTodos(updatedTodos);
  };
  
  return (
    <div className="App">
    <header>
    <h1>Todo Amu</h1>
    <div className="header-stats">
    <p>
    {todos.length} todos, dont {todos.filter(todo => !todo.done).length} en cours
      <span className="filter-count"> - {filteredTodos.length} affichée(s)</span>
    </p>
    <div className="status-summary">
    {Object.entries(taskStatuses).map(([key, { label, color, icon }]) => {
      const count = todos.filter(todo => todo.status === key).length;
      return count > 0 ? (
        <span 
        key={key} 
        className="status-pill"
        style={{ backgroundColor: color }}
        >
        {icon} {count}
        </span>
      ) : null;
    })}
    </div>
    </div>
    </header>
    
    {/* Task Management Section */}
    <div className="todo-container">
    <form onSubmit={addTodo}>
    <input
    type="text"
    value={input}
    onChange={(e) => setInput(e.target.value)}
    placeholder="Titre de la tâche"
    required
    />
    <input
    type="text"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    placeholder="Description"
    />
    <input
    type="date"
    value={dateEcheance}
    onChange={(e) => setDateEcheance(e.target.value)}
    placeholder="Date d'échéance"
    />
    <input
    type="text"
    value={contactName}
    onChange={(e) => setContactName(e.target.value)}
    placeholder="Nom du contact"
    />
    
    {/* Récurrence Section */}
    <div className="recurrence-section">
    <label className="recurrence-toggle">
    <input
    type="checkbox"
    checked={isRecurring}
    onChange={(e) => setIsRecurring(e.target.checked)}
    />
    Tâche récurrente
    </label>
    
    {isRecurring && (
      <div className="recurrence-options">
      <div className="recurrence-row">
      <label>Type:</label>
      <select
      value={recurrenceType}
      onChange={(e) => setRecurrenceType(e.target.value)}
      >
      <option value="daily">Quotidien</option>
      <option value="weekly">Hebdomadaire</option>
      <option value="monthly">Mensuel</option>
      </select>
      
      <label>Tous les:</label>
      <input
      type="number"
      min="1"
      value={recurrenceInterval}
      onChange={(e) => setRecurrenceInterval(e.target.value)}
      />
      <span>
      {recurrenceType === 'daily' && 'jour(s)'}
      {recurrenceType === 'weekly' && 'semaine(s)'}
      {recurrenceType === 'monthly' && 'mois'}
      </span>
      </div>
      
      <div className="recurrence-dates">
      <div>
      <label>Du:</label>
      <input
      type="date"
      value={recurrenceStartDate}
      onChange={(e) => setRecurrenceStartDate(e.target.value)}
      />
      </div>
      
      <div>
      <label>Au:</label>
      <input
      type="date"
      value={recurrenceEndDate}
      onChange={(e) => setRecurrenceEndDate(e.target.value)}
      placeholder="(optionnel)"
      />
      </div>
      </div>
      </div>
    )}
    </div>
    
    <button type="submit">Ajouter</button>
    </form>
    
    
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
      {filteredTodos.length} tâche(s) affichée(s)
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
      {/* Active Filters Display */}
    {(searchTerm || statusFilter !== 'all' || detailedStatusFilter !== 'all' || urgencyFilter !== 'all' || categoryFilter !== null) && (
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
    )}
    </div>
    
    {/* Category Management Section */}
    <div className="category-management">
    <h2>Gestion des catégories</h2>
    
    <form onSubmit={handleCategorySubmit}>
    <input
    type="text"
    value={categoryInput}
    onChange={(e) => setCategoryInput(e.target.value)}
    placeholder="Titre de la catégorie"
    required
    />
    <input
    type="text"
    value={categoryDescription}
    onChange={(e) => setCategoryDescription(e.target.value)}
    placeholder="Description"
    />
    <div className="color-picker">
    <label>Couleur:</label>
    <input
    type="color"
    value={categoryColor}
    onChange={(e) => setCategoryColor(e.target.value)}
    />
    </div>
    <input
    type="text"
    value={categoryIcon}
    onChange={(e) => setCategoryIcon(e.target.value)}
    placeholder="Icône (emoji ou texte)"
    />
    <button type="submit">
    {editingCategoryId ? 'Mettre à jour' : 'Ajouter'}
    </button>
    {editingCategoryId && (
      <button type="button" onClick={resetCategoryForm}>
      Annuler
      </button>
    )}
    </form>
    
    {/* Categories List */}
    <div className="categories-list">
    <h3>Liste des catégories</h3>
    <ul>
    {categories.map((category) => (
      <li 
      key={category.id}
      className={`category-item ${categoryFilter === category.id ? 'category-selected' : ''}`}
      style={{ borderLeft: `5px solid ${category.color || 'gray'}` }}
      >
      <div onClick={() => setCategoryFilter(categoryFilter === category.id ? null : category.id)} 
      className="category-content">
      <strong>{category.title}</strong> {category.icon && <span>{category.icon}</span>}
      {category.description && <p>{category.description}</p>}
      </div>
      <div className="category-actions">
      <button onClick={() => startEditCategory(category)}>
      Modifier
      </button>
      <button onClick={() => deleteCategory(category.id)}>
      Supprimer
      </button>
      </div>
      </li>
    ))}
    </ul>
    </div>
    </div>
    
    {/* Todo List with Status Management */}
    <div className="todos">
    <h2>Tâches {filteredTodos.length !== todos.length && `(${filteredTodos.length}/${todos.length})`}</h2>
    {filteredTodos.length > 0 ? (
      <ul>
      {filteredTodos.map((todo) => {
        const taskCategories = getTaskCategories(todo.id);
        
        return (
          <li
          key={todo.id}
          className={`task-item status-${todo.status} ${todo.isRecurring ? 'recurring-task' : ''}`}
          style={{
            borderLeft: todo.urgent ? '5px solid red' : 'none'
          }}
          >
          <div>
          <div className="task-header">
          <span 
          className="status-indicator" 
          style={{ backgroundColor: taskStatuses[todo.status]?.color || '#999' }}
          title={taskStatuses[todo.status]?.label || 'État inconnu'}
          >
          {taskStatuses[todo.status]?.icon || '?'}
          </span>
          <strong className="task-title">{todo.title}</strong>
          {todo.isRecurring && (
            <span className="recurring-badge" title="Tâche récurrente">🔄</span>
          )}
          </div>
          
          <p>{todo.description}</p>
          <p>Créé le: {todo.date_creation}</p>
          <p>Échéance: {todo.date_echeance}</p>
          
          {todo.isRecurring && (
            <div className="recurring-info">
            <p>
            <strong>Tâche récurrente:</strong> Tous les {todo.recurrenceInterval} 
            {todo.recurrenceType === 'daily' && ' jour(s)'}
            {todo.recurrenceType === 'weekly' && ' semaine(s)'}
            {todo.recurrenceType === 'monthly' && ' mois'}
            </p>
            <p>
            <strong>Période:</strong> Du {todo.recurrenceStartDate} 
            {todo.recurrenceEndDate ? ` au ${todo.recurrenceEndDate}` : ' (sans fin)'}
            </p>
            {todo.instanceNumber && (
              <p><strong>Occurrence:</strong> #{todo.instanceNumber}</p>
            )}
            </div>
          )}
          
          <div className="task-detail">
          <label>Échéance:</label>
          <div className="deadline-editor">
          <input
          type="date"
          value={formatDateForInput(todo.date_echeance)}
          onChange={(e) => updateTaskDeadline(todo.id, formatDateFromInput(e.target.value))}
          className="deadline-input"
          />
          <span className="deadline-display">
          {todo.date_echeance || 'Non définie'}
          </span>
          </div>
          </div>
          
          <p>
          Contacts: {todo.contacts.map((contact, index) => (
            <span key={index}>{contact.name}{index < todo.contacts.length - 1 ? ', ' : ''}</span>
          ))}
          </p>
          
          
          <div className="task-categories">
            <p>Catégories:</p>
            <div className="category-tags">
            {taskCategories.length > 0 ? (
              taskCategories.map(category => (
                <span 
                key={category.id} 
                className="category-tag"
                style={{ backgroundColor: category.color || 'gray' }}
                >
                {category.icon && <span>{category.icon}</span>}
                {category.title}
                <button 
                onClick={() => toggleTaskCategory(todo.id, category.id)}
                title="Retirer cette catégorie"
                >
                ×
                </button>
                </span>
              ))
            ) : (
              <span className="no-categories">Aucune catégorie</span>
            )}
            </div>
          </div>
          </div>

          <div className="task-actions">
          {/* Status Selector */}
          <div className="status-selector">
          <select
          value={todo.status}
          onChange={(e) => setTaskStatus(todo.id, e.target.value)}
          className={`status-${todo.status}`}
          style={{ borderColor: taskStatuses[todo.status]?.color }}
          >
          {Object.entries(taskStatuses).map(([key, { label }]) => (
            <option key={key} value={key}>
            {label}
            </option>
          ))}
          </select>
          </div>
          
          <button onClick={() => toggleUrgent(todo.id)}>
          {todo.urgent ? 'Non Urgent' : 'Urgent'}
          </button>
          <input
          type="text"
          placeholder="Ajouter un contact"
          onBlur={(e) => {
            addContact(todo.id, e.target.value);
            e.target.value = '';
          }}
          />
          
          {/* Category Assignment Dropdown */}
          <select
          onChange={(e) => {
            if (e.target.value) {
              toggleTaskCategory(todo.id, parseInt(e.target.value));
              e.target.value = ''; // Reset select after use
            }
          }}
          value=""
          >
          <option value="">Assigner une catégorie</option>
          {categories
            .filter(category => !taskCategories.some(c => c.id === category.id))
            .map(category => (
              <option key={category.id} value={category.id}>
              {category.title}
              </option>
            ))}
            </select>
            </div>
            </li>
          );
        })}
        </ul>
      ) : (
        <p className="no-tasks">Aucune tâche ne correspond aux filtres actuels</p>
      )}
      </div>
      </div>
      </div>
    );
  }
  
  export default App;