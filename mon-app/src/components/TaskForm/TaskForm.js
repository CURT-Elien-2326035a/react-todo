import React, { useState } from 'react';
import { useTodo } from '../../context/TodoContext';
import { useRecurrence } from '../../hooks/useRecurrence';
import TaskForm from './TaskFormComponent';

function TaskFormContainer() {
  const { addTodo } = useTodo();
  const { recurrence, resetRecurrenceForm, getRecurrenceData } = useRecurrence();
  
  const [input, setInput] = useState('');
  const [description, setDescription] = useState('');
  const [dateEcheance, setDateEcheance] = useState('');
  const [contactName, setContactName] = useState('');

  const handleSubmit = (e) => {
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
        ...getRecurrenceData()
      };
      
      addTodo(newTask);
      
      // Reset form
      setInput('');
      setDescription('');
      setDateEcheance('');
      setContactName('');
      resetRecurrenceForm();
    }
  };

  return (
    <TaskForm
      input={input}
      setInput={setInput}
      description={description}
      setDescription={setDescription}
      dateEcheance={dateEcheance}
      setDateEcheance={setDateEcheance}
      contactName={contactName}
      setContactName={setContactName}
      isRecurring={recurrence.isRecurring}
      setIsRecurring={recurrence.setIsRecurring}
      recurrenceType={recurrence.recurrenceType}
      setRecurrenceType={recurrence.setRecurrenceType}
      recurrenceInterval={recurrence.recurrenceInterval}
      setRecurrenceInterval={recurrence.setRecurrenceInterval}
      recurrenceStartDate={recurrence.recurrenceStartDate}
      setRecurrenceStartDate={recurrence.setRecurrenceStartDate}
      recurrenceEndDate={recurrence.recurrenceEndDate}
      setRecurrenceEndDate={recurrence.setRecurrenceEndDate}
      addTodo={handleSubmit}
    />
  );
}

export default TaskFormContainer;
