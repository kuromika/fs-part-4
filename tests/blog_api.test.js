const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Blog = require('../models/blog');
const helper = require('./test_helper');

const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany({});

  const noteObjects = helper.initialBlogs.map((blog) => new Blog(blog));
  const promises = noteObjects.map((note) => note.save());
  await Promise.all(promises);
}, 10000);

describe('Get blogs', () => {
  test('Returns blogs as JSON', async () => {
    api.get('/api/blogs').expect(200).expect('Content-Type', /application\/json/);
  });

  test('Returns the correct amount of blogs', async () => {
    const response = await api.get('/api/blogs');

    expect(response.body).toHaveLength(helper.initialBlogs.length);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
