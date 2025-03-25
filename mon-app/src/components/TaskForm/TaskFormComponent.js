import React from 'react';
import './TaskForm.css'; // Assuming you have some CSS for your form

const TaskFormComponent = ({
  input,
  setInput,
  description,
  setDescription,
  dateEcheance,
  setDateEcheance,
  contactName,
  setContactName,
  isRecurring,
  setIsRecurring,
  recurrenceType,
  setRecurrenceType,
  recurrenceInterval,
  setRecurrenceInterval,
  recurrenceStartDate,
  setRecurrenceStartDate,
  recurrenceEndDate,
  setRecurrenceEndDate,
  addTodo
}) => {
  return (
    <form className="task-form" onSubmit={addTodo}>
      <div className="form-group">
        <label htmlFor="task-title">Titre</label>
        <input
          id="task-title"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ajouter une tâche"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="task-description">Description</label>
        <textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optionnel)"
        />
      </div>

      <div className="form-group">
        <label htmlFor="task-date">Date d'échéance</label>
        <input
          id="task-date"
          type="date"
          value={dateEcheance}
          onChange={(e) => setDateEcheance(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="task-contact">Contact</label>
        <input
          id="task-contact"
          type="text"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          placeholder="Nom du contact (optionnel)"
        />
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
          />
          Tâche récurrente
        </label>
      </div>

      {isRecurring && (
        <div className="recurrence-options">
          <div className="form-group">
            <label htmlFor="recurrence-type">Type de récurrence</label>
            <select
              id="recurrence-type"
              value={recurrenceType}
              onChange={(e) => setRecurrenceType(e.target.value)}
            >
              <option value="daily">Quotidien</option>
              <option value="weekly">Hebdomadaire</option>
              <option value="monthly">Mensuel</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="recurrence-interval">Intervalle</label>
            <input
              id="recurrence-interval"
              type="number"
              min="1"
              value={recurrenceInterval}
              onChange={(e) => setRecurrenceInterval(Number(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label htmlFor="recurrence-start">Date de début</label>
            <input
              id="recurrence-start"
              type="date"
              value={recurrenceStartDate}
              onChange={(e) => setRecurrenceStartDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="recurrence-end">Date de fin (optionnel)</label>
            <input
              id="recurrence-end"
              type="date"
              value={recurrenceEndDate}
              onChange={(e) => setRecurrenceEndDate(e.target.value)}
            />
          </div>
        </div>
      )}

      <button type="submit" className="add-task-btn">
        Ajouter la tâche
      </button>
    </form>
  );
};

export default TaskFormComponent;
