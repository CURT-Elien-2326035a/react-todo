import React, { useState } from 'react';
import './App.css';
import data from './data.json';
import Header from './components/Header/Header';
import TaskForm from './components/TaskForm/TaskForm';
import FilterControls from './components/FilterControls/FilterControls';
import ActiveFilters from './components/ActiveFilters/ActiveFilters';
import CategoryManagement from './components/CategoryManagement/CategoryManagement';
import { formatDateForInput, formatDateFromInput, formatDateForJS, compareDates } from './utils/dateUtils';

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
      <Header todos={todos} taskStatuses={taskStatuses} />
      
      {/* Task Management Section */}
      <div className="todo-container">
        <TaskForm
          input={input}
          setInput={setInput}
          description={description}
          setDescription={setDescription}
          dateEcheance={dateEcheance}
          setDateEcheance={setDateEcheance}
          contactName={contactName}
          setContactName={setContactName}
          isRecurring={isRecurring}
          setIsRecurring={setIsRecurring}
          recurrenceType={recurrenceType}
          setRecurrenceType={setRecurrenceType}
          recurrenceInterval={recurrenceInterval}
          setRecurrenceInterval={setRecurrenceInterval}
          recurrenceStartDate={recurrenceStartDate}
          setRecurrenceStartDate={setRecurrenceStartDate}
          recurrenceEndDate={recurrenceEndDate}
          setRecurrenceEndDate={setRecurrenceEndDate}
          addTodo={addTodo}
        />
        
        <FilterControls 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          detailedStatusFilter={detailedStatusFilter}
          setDetailedStatusFilter={setDetailedStatusFilter}
          urgencyFilter={urgencyFilter}
          setUrgencyFilter={setUrgencyFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          categories={categories}
          taskStatuses={taskStatuses}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortDirection={sortDirection}
          setSortDirection={setSortDirection}
          resetFilters={resetFilters}
          filteredCount={filteredTodos.length}
          totalCount={todos.length}
        />
        
        <ActiveFilters 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          detailedStatusFilter={detailedStatusFilter}
          setDetailedStatusFilter={setDetailedStatusFilter}
          urgencyFilter={urgencyFilter}
          setUrgencyFilter={setUrgencyFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          categories={categories}
          taskStatuses={taskStatuses}
        />
      </div>
      
      {/* Category Management Section */}
      <CategoryManagement 
        categoryInput={categoryInput}
        setCategoryInput={setCategoryInput}
        categoryDescription={categoryDescription}
        setCategoryDescription={setCategoryDescription}
        categoryColor={categoryColor}
        setCategoryColor={setCategoryColor}
        categoryIcon={categoryIcon}
        setCategoryIcon={setCategoryIcon}
        editingCategoryId={editingCategoryId}
        setEditingCategoryId={setEditingCategoryId}
        categories={categories}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        handleCategorySubmit={handleCategorySubmit}
        resetCategoryForm={resetCategoryForm}
        startEditCategory={startEditCategory}
        deleteCategory={deleteCategory}
      />
      
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
          );
  }
  
  export default App;