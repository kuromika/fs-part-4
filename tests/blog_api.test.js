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
}, 15000);

describe('Get blogs', () => {
  test('Returns blogs as JSON', async () => {
    api.get('/api/blogs').expect(200).expect('Content-Type', /application\/json/);
  });

  test('Returns the correct amount of blogs', async () => {
    const response = await api.get('/api/blogs');

    expect(response.body).toHaveLength(helper.initialBlogs.length);
  });
});

describe('Post blog', () => {
  const testBlog = {
    title: 'steins;gate',
  };
  test('Returns new blog as JSON', async () => {
    api.post('/api/blogs').send(testBlog).expect(201).expect('Content-Type', /application\/json/);
  });

  test('Saves new blog in database properly', async () => {
    const newBlog = new Blog(testBlog);
    const savedBlog = await newBlog.save();
    const blogsAtEnd = await helper.blogsInDB();

    expect(savedBlog).toEqual(newBlog);
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
