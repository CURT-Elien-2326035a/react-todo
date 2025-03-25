import React from 'react';

const HeaderStats = ({ todos, taskStatuses }) => {
  return (
    <div className="header-stats">
      <p>
        {todos.length} todos, dont {todos.filter(todo => !todo.done).length} en cours
        <span className="filter-count"> - {todos.filter(todo => 
          todo.title.toLowerCase().includes('') || 
          todo.description.toLowerCase().includes('')
        ).length} affichée(s)</span>
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
  );
};

export default HeaderStats;
