import { useState } from 'react';

export function useRecurrence() {
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState('daily');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceStartDate, setRecurrenceStartDate] = useState('');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');

  const resetRecurrenceForm = () => {
    setIsRecurring(false);
    setRecurrenceType('daily');
    setRecurrenceInterval(1);
    setRecurrenceStartDate('');
    setRecurrenceEndDate('');
  };

  const getRecurrenceData = () => ({
    isRecurring,
    recurrenceType,
    recurrenceInterval: parseInt(recurrenceInterval) || 1,
    recurrenceStartDate,
    recurrenceEndDate
  });

  return {
    recurrence: {
      isRecurring, setIsRecurring,
      recurrenceType, setRecurrenceType,
      recurrenceInterval, setRecurrenceInterval,
      recurrenceStartDate, setRecurrenceStartDate,
      recurrenceEndDate, setRecurrenceEndDate
    },
    resetRecurrenceForm,
    getRecurrenceData
  };
}
