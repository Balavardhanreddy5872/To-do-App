const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(session({
  secret: '123456',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/todoApp', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error(error));

// <<<<<<<<<<<<<<<<<<<<<<-------------------------------Schemas------------------------>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 5 },
  email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Task Schema
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, default: 'pending' },
  dueDate: { type: Date },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Task = mongoose.model('Task', taskSchema);


// <<<<<<<<<<<<<<<<<<<<<<-------------------------------Routes------------------------>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      req.session.userId = user._id;
      res.json({ message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
});
// Signup route
app.post('/signup', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (name.length < 5) {
    return res.status(400).json({ message: 'Name must be at least 5 characters long' });
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ message: 'Email must contain @ and a valid domain' });
  }
  const passwordPattern = /^(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
  if (!passwordPattern.test(password)) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long and contain at least one special character' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user' });
  }
});
// Logout route
app.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out' });
});
// Task Routes 
// Get task route
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.session.userId ||"672f6f3e07e8125363760b6a" });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

app.get('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.session.userId ||"672f6f3e07e8125363760b6a" });
    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task' });
  }
});

app.post('/tasks', async (req, res) => {
  const { title, description, status, dueDate } = req.body;
  const userId = req.session.userId || "672f6f3e07e8125363760b6a";

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized: User not logged in' });
  }

  try {
    const newTask = new Task({ title, description, status, dueDate, userId });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task' });
  }
});



app.put('/tasks/:id', async (req, res) => {
  const { title, description, status, dueDate } = req.body;
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.session.userId ||"672f6f3e07e8125363760b6a"},
      { title, description, status, dueDate },
      { new: true }
    );
    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ message: 'Task not found or unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating task' });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.session.userId });
    if (task) {
      res.json({ message: 'Task deleted' });
    } else {
      res.status(404).json({ message: 'Task not found or unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
