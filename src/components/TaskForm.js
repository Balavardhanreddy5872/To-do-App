import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TaskForm.css';

const TaskForm = ({ task, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [dueDate, setDueDate] = useState('');
  const [userId, setUserId] = useState(localStorage.getItem('userId'));

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setDueDate(task.dueDate);
    }
  }, [task]);

  // Handle the form submission (create or update task)
  const handleSubmit = (e) => {
    e.preventDefault();
    const newTask = { title, description, status, dueDate, userId }; // Add userId to task

    // If editing, use PUT request. If creating, use POST request.
    if (task) {
      axios.put(`http://localhost:5000/tasks/${task._id}`, newTask)
        .then(response => onSave(response.data))  // Pass the saved task to onSave (callback)
        .catch(error => console.error(error));
    } else {
      axios.post('http://localhost:5000/tasks', newTask)
        .then(response => onSave(response.data))  // Pass the new task to onSave (callback)
        .catch(error => console.error(error));
    }
  };

  // Render the form
  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h1>{task ? 'Edit Task' : 'Create Task'}</h1>

      <div className="form-group">
        <label>Title:</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Description:</label>
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Status:</label>
        <select value={status} onChange={e => setStatus(e.target.value)} required>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="form-group">
        <label>Due Date:</label>
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          required
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="save-btn">Save</button>
        <button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

export default TaskForm;
