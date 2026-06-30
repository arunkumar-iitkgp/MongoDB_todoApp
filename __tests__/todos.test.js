const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Todo = require('../models/Todo');
const { connect, clearData, close } = require('./setup');

// --------------------------------------------------------------------
// Test lifecycle — using in-memory MongoDB via mongodb-memory-server
// --------------------------------------------------------------------
beforeAll(async () => await connect());
afterEach(async () => await clearData());
afterAll(async () => await close());

// ====================================================================
//  Todo API Routes — Comprehensive Test Suite
// ====================================================================

describe('Todo API — /api/todos', () => {

  // ==================================================================
  //  POST /api/todos — Create a new todo
  // ==================================================================
  describe('POST /api/todos', () => {
    it('should create a new todo with valid title', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({ title: 'Buy groceries' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.title).toBe('Buy groceries');
      expect(res.body.completed).toBe(false);
      expect(res.body.subItems).toEqual([]);
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).toHaveProperty('updatedAt');
    });

    it('should return 400 when title is empty', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({ title: '' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 400 when title is missing', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should trim whitespace from title', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({ title: '   Laundry   ' });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Laundry');
    });

    it('should return 400 when title exceeds 200 characters', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({ title: 'x'.repeat(201) });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  // ==================================================================
  //  GET /api/todos — List all todos
  // ==================================================================
  describe('GET /api/todos', () => {
    it('should return an empty array when no todos exist', async () => {
      const res = await request(app).get('/api/todos');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should return all todos sorted newest first', async () => {
      await Todo.create({ title: 'First' });
      // Small delay to ensure different timestamps
      await new Promise((r) => setTimeout(r, 10));
      await Todo.create({ title: 'Second' });

      const res = await request(app).get('/api/todos');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].title).toBe('Second');
      expect(res.body[1].title).toBe('First');
    });

    it('should include subItems in the response', async () => {
      const todo = await Todo.create({
        title: 'With sub-items',
        subItems: [{ title: 'Sub 1' }, { title: 'Sub 2' }],
      });

      const res = await request(app).get('/api/todos');

      expect(res.status).toBe(200);
      expect(res.body[0].subItems).toHaveLength(2);
      expect(res.body[0].subItems[0].title).toBe('Sub 1');
      expect(res.body[0].subItems[1].title).toBe('Sub 2');
    });
  });

  // ==================================================================
  //  GET /api/todos/:id — Get a single todo
  // ==================================================================
  describe('GET /api/todos/:id', () => {
    it('should return a todo by its ID', async () => {
      const todo = await Todo.create({ title: 'Find me' });

      const res = await request(app).get(`/api/todos/${todo._id}`);

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Find me');
    });

    it('should return 404 for a non-existent todo ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app).get(`/api/todos/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Todo not found');
    });

    it('should return 500 for an invalid ObjectId format', async () => {
      const res = await request(app).get('/api/todos/invalid-id');

      expect(res.status).toBe(500);
    });
  });

  // ==================================================================
  //  PUT /api/todos/:id — Update a todo
  // ==================================================================
  describe('PUT /api/todos/:id', () => {
    it('should update the title of a todo', async () => {
      const todo = await Todo.create({ title: 'Old title' });

      const res = await request(app)
        .put(`/api/todos/${todo._id}`)
        .send({ title: 'New title' });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('New title');
      expect(res.body.completed).toBe(false); // unchanged
    });

    it('should mark a todo as completed', async () => {
      const todo = await Todo.create({ title: 'Task' });

      const res = await request(app)
        .put(`/api/todos/${todo._id}`)
        .send({ completed: true });

      expect(res.status).toBe(200);
      expect(res.body.completed).toBe(true);
    });

    it('should mark a completed todo as incomplete', async () => {
      const todo = await Todo.create({ title: 'Task', completed: true });

      const res = await request(app)
        .put(`/api/todos/${todo._id}`)
        .send({ completed: false });

      expect(res.status).toBe(200);
      expect(res.body.completed).toBe(false);
    });

    it('should update both title and completed status', async () => {
      const todo = await Todo.create({ title: 'Task' });

      const res = await request(app)
        .put(`/api/todos/${todo._id}`)
        .send({ title: 'Updated', completed: true });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Updated');
      expect(res.body.completed).toBe(true);
    });

    it('should return 400 when updating with an empty title', async () => {
      const todo = await Todo.create({ title: 'Task' });

      const res = await request(app)
        .put(`/api/todos/${todo._id}`)
        .send({ title: '' });

      expect(res.status).toBe(400);
    });

    it('should return 404 when updating a non-existent todo', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .put(`/api/todos/${fakeId}`)
        .send({ title: 'Ghost' });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Todo not found');
    });
  });

  // ==================================================================
  //  DELETE /api/todos/:id — Delete a todo
  // ==================================================================
  describe('DELETE /api/todos/:id', () => {
    it('should delete an existing todo', async () => {
      const todo = await Todo.create({ title: 'Delete me' });

      const res = await request(app).delete(`/api/todos/${todo._id}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Todo deleted');

      // Verify it's actually gone
      const deleted = await Todo.findById(todo._id);
      expect(deleted).toBeNull();
    });

    it('should return 404 when deleting a non-existent todo', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app).delete(`/api/todos/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Todo not found');
    });
  });

  // ==================================================================
  //  POST /api/todos/:id/items — Add a sub-item
  // ==================================================================
  describe('POST /api/todos/:id/items', () => {
    it('should add a sub-item to an existing todo', async () => {
      const todo = await Todo.create({ title: 'Parent' });

      const res = await request(app)
        .post(`/api/todos/${todo._id}/items`)
        .send({ title: 'Child task' });

      expect(res.status).toBe(201);
      expect(res.body.subItems).toHaveLength(1);
      expect(res.body.subItems[0].title).toBe('Child task');
      expect(res.body.subItems[0].completed).toBe(false);
    });

    it('should add multiple sub-items', async () => {
      const todo = await Todo.create({ title: 'Multiple' });

      await request(app)
        .post(`/api/todos/${todo._id}/items`)
        .send({ title: 'Sub 1' });

      const res2 = await request(app)
        .post(`/api/todos/${todo._id}/items`)
        .send({ title: 'Sub 2' });

      expect(res2.status).toBe(201);
      expect(res2.body.subItems).toHaveLength(2);
    });

    it('should return 400 when sub-item title is empty', async () => {
      const todo = await Todo.create({ title: 'Parent' });

      const res = await request(app)
        .post(`/api/todos/${todo._id}/items`)
        .send({ title: '' });

      expect(res.status).toBe(400);
    });

    it('should return 404 when adding sub-item to non-existent todo', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .post(`/api/todos/${fakeId}/items`)
        .send({ title: 'Orphan' });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Todo not found');
    });
  });

  // ==================================================================
  //  PUT /api/todos/:id/items/:itemId — Update a sub-item
  // ==================================================================
  describe('PUT /api/todos/:id/items/:itemId', () => {
    let todo;
    let subItem;

    beforeEach(async () => {
      todo = await Todo.create({
        title: 'Parent',
        subItems: [{ title: 'Sub task' }],
      });
      subItem = todo.subItems[0];
    });

    it('should update a sub-item title', async () => {
      const res = await request(app)
        .put(`/api/todos/${todo._id}/items/${subItem._id}`)
        .send({ title: 'Updated sub-task' });

      expect(res.status).toBe(200);
      const updated = res.body.subItems.find(
        (s) => s._id.toString() === subItem._id.toString()
      );
      expect(updated.title).toBe('Updated sub-task');
    });

    it('should toggle a sub-item completion status', async () => {
      const res = await request(app)
        .put(`/api/todos/${todo._id}/items/${subItem._id}`)
        .send({ completed: true });

      expect(res.status).toBe(200);
      const updated = res.body.subItems.find(
        (s) => s._id.toString() === subItem._id.toString()
      );
      expect(updated.completed).toBe(true);
    });

    it('should return 404 when todo does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .put(`/api/todos/${fakeId}/items/${subItem._id}`)
        .send({ title: 'Ghost' });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Todo not found');
    });

    it('should return 404 when sub-item does not exist', async () => {
      const fakeItemId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .put(`/api/todos/${todo._id}/items/${fakeItemId}`)
        .send({ title: 'Ghost sub' });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Sub-item not found');
    });
  });

  // ==================================================================
  //  DELETE /api/todos/:id/items/:itemId — Delete a sub-item
  // ==================================================================
  describe('DELETE /api/todos/:id/items/:itemId', () => {
    it('should delete a sub-item from a todo', async () => {
      const todo = await Todo.create({
        title: 'Parent',
        subItems: [{ title: 'Delete me' }, { title: 'Keep me' }],
      });
      const targetSubItem = todo.subItems[0];

      const res = await request(app)
        .delete(`/api/todos/${todo._id}/items/${targetSubItem._id}`);

      expect(res.status).toBe(200);
      expect(res.body.subItems).toHaveLength(1);
      expect(res.body.subItems[0].title).toBe('Keep me');
    });

    it('should return 404 when todo does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const fakeItemId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .delete(`/api/todos/${fakeId}/items/${fakeItemId}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Todo not found');
    });

    it('should return 404 when sub-item does not exist', async () => {
      const todo = await Todo.create({
        title: 'Parent',
        subItems: [{ title: 'Only one' }],
      });
      const fakeItemId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .delete(`/api/todos/${todo._id}/items/${fakeItemId}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Sub-item not found');
    });
  });

  // ==================================================================
  //  Full workflow integration tests
  // ==================================================================
  describe('Full workflow', () => {
    it('should handle a complete todo lifecycle', async () => {
      // 1. Create a todo
      const createRes = await request(app)
        .post('/api/todos')
        .send({ title: 'Plan vacation' });
      expect(createRes.status).toBe(201);
      const todoId = createRes.body._id;

      // 2. Add sub-items
      const sub1Res = await request(app)
        .post(`/api/todos/${todoId}/items`)
        .send({ title: 'Book flights' });
      expect(sub1Res.status).toBe(201);
      const sub1Id = sub1Res.body.subItems[0]._id;

      await request(app)
        .post(`/api/todos/${todoId}/items`)
        .send({ title: 'Pack bags' });

      // 3. Mark sub-item as completed
      const toggleSubRes = await request(app)
        .put(`/api/todos/${todoId}/items/${sub1Id}`)
        .send({ completed: true });
      expect(toggleSubRes.status).toBe(200);
      const toggledSub = toggleSubRes.body.subItems.find(
        (s) => s._id.toString() === sub1Id.toString()
      );
      expect(toggledSub.completed).toBe(true);

      // 4. Mark main todo as completed
      const completeRes = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ completed: true });
      expect(completeRes.status).toBe(200);
      expect(completeRes.body.completed).toBe(true);

      // 5. List all todos and verify count
      const listRes = await request(app).get('/api/todos');
      expect(listRes.status).toBe(200);
      expect(listRes.body).toHaveLength(1);

      // 6. Delete the todo
      const deleteRes = await request(app).delete(`/api/todos/${todoId}`);
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.message).toBe('Todo deleted');

      // 7. Verify empty list
      const emptyRes = await request(app).get('/api/todos');
      expect(emptyRes.status).toBe(200);
      expect(emptyRes.body).toEqual([]);
    });
  });
});
