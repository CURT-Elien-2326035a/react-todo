import React, { createContext, useState, useContext, useEffect } from 'react';
import data from '../data.json';
import { generateRecurringTasks } from '../utils/taskUtils';
import { formatDateFromInput } from '../utils/dateUtils';

const TodoContext = createContext();

export function TodoProvider({ children }) {
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
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  // Task Actions
  const addTodo = (newTask) => {
    if (newTask.isRecurring) {
      // Generate recurring task instances
      const recurringTasks = generateRecurringTasks(newTask);
      setTodos([...todos, ...recurringTasks]);
    } else {
      setTodos([...todos, newTask]);
    }
  };

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

  const toggleUrgent = (id) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, urgent: !todo.urgent } : todo
    );
    setTodos(updatedTodos);
  };

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

  const updateTaskDeadline = (id, newDeadline) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id
      ? { ...todo, date_echeance: newDeadline }
      : todo
    );
    setTodos(updatedTodos);
  };

  // Category Actions
  const addOrUpdateCategory = (categoryData) => {
    if (editingCategoryId) {
      // Update existing category
      const updatedCategories = categories.map(cat => 
        cat.id === editingCategoryId 
        ? { ...categoryData, id: editingCategoryId } 
        : cat
      );
      setCategories(updatedCategories);
      setEditingCategoryId(null);
    } else {
      // Add new category
      const newCategory = {
        ...categoryData,
        id: Date.now()
      };
      setCategories([...categories, newCategory]);
    }
  };

  const deleteCategory = (id) => {
    // Remove the category
    setCategories(categories.filter(cat => cat.id !== id));
    
    // Remove all relations with this category
    setRelations(relations.filter(relation => relation.categorie !== id));
  };

  const startEditCategory = (category) => {
    setEditingCategoryId(category.id);
    return category;
  };

  // Task-Category Relations
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

  const getTaskCategories = (taskId) => {
    const taskRelations = relations.filter(relation => relation.tache === taskId);
    return categories.filter(category => 
      taskRelations.some(relation => relation.categorie === category.id)
    );
  };

  return (
    <TodoContext.Provider value={{
      todos,
      categories,
      relations,
      editingCategoryId,
      addTodo,
      setTaskStatus,
      toggleUrgent,
      addContact,
      updateTaskDeadline,
      addOrUpdateCategory,
      deleteCategory,
      startEditCategory,
      setEditingCategoryId,
      toggleTaskCategory,
      getTaskCategories
    }}>
      {children}
    </TodoContext.Provider>
  );
}

export function useTodo() {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodo must be used within a TodoProvider');
  }
  return context;
}

export default TodoProvider;
