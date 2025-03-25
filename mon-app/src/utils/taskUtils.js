import { formatDateForJS } from './dateUtils';

// Generate recurring task instances based on recurrence settings
export const generateRecurringTasks = (baseTask) => {
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
