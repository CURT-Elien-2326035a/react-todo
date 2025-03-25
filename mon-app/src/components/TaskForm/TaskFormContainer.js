import React from 'react';
import TaskForm from './TaskForm';
import { useTodo } from '../../context/TodoContext';

const TaskFormContainer = () => {
  const { addTask } = useTodo();
  
  const handleSubmit = (taskData) => {
    addTask(taskData);
  };
  
  return <TaskForm onSubmit={handleSubmit} />;
};

export default TaskFormContainer;
