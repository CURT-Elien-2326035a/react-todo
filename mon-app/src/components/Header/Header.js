import React from 'react';
import HeaderStats from './HeaderStats';

const Header = ({ todos, taskStatuses }) => {
  return (
    <header>
      <h1>Todo Amu</h1>
      <HeaderStats todos={todos} taskStatuses={taskStatuses} />
    </header>
  );
};

export default Header;
