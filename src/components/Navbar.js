import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Add your CSS styles

const Navbar = ({ isAuthenticated, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">Task Manager</Link>
      </div>
      <ul className="navbar-links">
        {isAuthenticated ? (
          <>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/tasks">Task List</Link>
            </li>
            <li>
              <Link to="/tasks/create" className="create-task-btn">Create Task</Link>
            </li>
            <li>
              <button onClick={onLogout} className="logout-btn">Logout</button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/signup">Signup</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
