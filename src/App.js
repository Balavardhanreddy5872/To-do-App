import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import Home from './components/Home';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import axios from 'axios';
import './App.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [tasks, setTasks] = useState([]);

  // Check if the user is authenticated by checking localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setIsAuthenticated(true);
      setUserId(storedUserId);
      fetchTasks(storedUserId);
    }
  }, []);

  // Fetch tasks based on user ID
  const fetchTasks = (userId) => {
    axios.get(`http://localhost:5000/tasks?userId=${userId}`)
      .then(response => setTasks(response.data))
      .catch(error => console.error(error));
  };

  // Handle login
  const handleLogin = (userId) => {
    localStorage.setItem('userId', userId);
    setIsAuthenticated(true);
    setUserId(userId);
    fetchTasks(userId); // Fetch tasks after login
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setUserId(null);
    setTasks([]); // Clear tasks on logout
  };

  // Handle signup
  const handleSignup = (userId) => {
    localStorage.setItem('userId', userId);
    setIsAuthenticated(true);
    setUserId(userId);
    fetchTasks(userId); // Fetch tasks after signup
  };

  // Handle saving a task (create or update)
  const handleSaveTask = (task) => {
    if (task.id) {
      // Update an existing task
      axios.put(`http://localhost:5000/tasks/${task.id}`, task)
        .then(response => {
          const updatedTasks = tasks.map(t => (t.id === task.id ? response.data : t));
          setTasks(updatedTasks);
        })
        .catch(error => console.error(error));
    } else {
      // Create a new task
      axios.post('http://localhost:5000/tasks', task)
        .then(response => {
          setTasks([...tasks, response.data]);
        })
        .catch(error => console.error(error));
    }
  };

  // Handle deleting a task
  const handleDeleteTask = (taskId) => {
    axios.delete(`http://localhost:5000/tasks/${taskId}`)
      .then(() => {
        setTasks(tasks.filter(task => task.id !== taskId));
      })
      .catch(error => console.error(error));
  };

  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <div className="app-container">
        <Routes>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} />}
          />
          <Route
            path="/signup"
            element={isAuthenticated ? <Navigate to="/" /> : <SignupPage onSignup={handleSignup} />}
          />
          <Route
            path="/tasks"
            element={isAuthenticated ? <TaskList tasks={tasks} onEdit={handleSaveTask} onDelete={handleDeleteTask} /> : <Navigate to="/login" />}
          />
          <Route
            path="/tasks/create"
            element={isAuthenticated ? <TaskForm onSave={handleSaveTask} /> : <Navigate to="/login" />}
          />
          <Route
            path="/tasks/edit/:id"
            element={isAuthenticated ? <TaskForm onSave={handleSaveTask} tasks={tasks} /> : <Navigate to="/login" />}
          />
          <Route
            path="/"
            element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
