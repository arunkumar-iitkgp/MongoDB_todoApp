const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');

// GET /api/todos - Get all todos
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 }); // newest first
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/todos/:id - Get a single todo
router.get('/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    res.json(todo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/todos - Create a new todo
router.post('/', async (req, res) => {
  try {
    const todo = new Todo({
      title: req.body.title,
    });
    const newTodo = await todo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/todos/:id - Update a todo (title, completed)
router.put('/:id', async (req, res) => {
  try {
    const { title, completed } = req.body;
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    if (title !== undefined) todo.title = title;
    if (completed !== undefined) todo.completed = completed;

    const updatedTodo = await todo.save();
    res.json(updatedTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/todos/:id - Delete a todo
router.delete('/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    res.json({ message: 'Todo deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== Sub-item routes =====

// POST /api/todos/:id/items - Add a sub-item
router.post('/:id/items', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    todo.subItems.push({ title: req.body.title, completed: false });
    const updatedTodo = await todo.save();
    res.status(201).json(updatedTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/todos/:id/items/:itemId - Update a sub-item (toggle or rename)
router.put('/:id/items/:itemId', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    const subItem = todo.subItems.id(req.params.itemId);
    if (!subItem) {
      return res.status(404).json({ message: 'Sub-item not found' });
    }

    if (req.body.title !== undefined) subItem.title = req.body.title;
    if (req.body.completed !== undefined) subItem.completed = req.body.completed;

    const updatedTodo = await todo.save();
    res.json(updatedTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/todos/:id/items/:itemId - Delete a sub-item
router.delete('/:id/items/:itemId', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    const subItem = todo.subItems.id(req.params.itemId);
    if (!subItem) {
      return res.status(404).json({ message: 'Sub-item not found' });
    }

    subItem.deleteOne();
    const updatedTodo = await todo.save();
    res.json(updatedTodo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
