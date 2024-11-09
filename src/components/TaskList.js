import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './TaskList.css';

const TaskList = ({ onEdit, onDelete }) => {
  const [tasks, setTasks] = useState([]);

  // Fetch tasks from the backend when the component mounts
  useEffect(() => {
    axios.get('http://localhost:5000/tasks')
      .then(response => setTasks(response.data))
      .catch(error => console.error(error));
  }, []);

  // Function to handle task deletion
  const handleDelete = (taskId) => {
    axios.delete(`http://localhost:5000/tasks/${taskId}`)
      .then(response => {
        // Update the task list after successful deletion
        setTasks(tasks.filter(task => task.id !== taskId));
      })
      .catch(error => console.error(error));
  };

  return (
    <div className="task-list">
      <h1>Task List</h1>
      <button className="new-task-btn" onClick={() => onEdit(null)}>Create New Task</button>
      {tasks.length === 0 ? (
        <div className="no-tasks-message">No tasks found. Please create a new task.</div>
      ) : (
        <ul>
          {tasks.map(task => (
            <li key={task.id} className="task-item">
              <div className="task-details">
                <div className="task-title"><strong>Title:</strong> {task.title}</div>
                <div className="task-status"><strong>Status:</strong> {task.status}</div>
                <div className="task-due-date"><strong>Due Date:</strong> {task.dueDate}</div>
              </div>
              <div className="task-actions">
                <button className="edit-btn" onClick={() => onEdit(task)}>Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(task.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;
