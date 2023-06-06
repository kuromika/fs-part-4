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
    await api.get('/api/blogs').expect(200).expect('Content-Type', /application\/json/);
  });

  test('Blogs contain id property', async () => {
    const response = await api.get('/api/blogs');
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0].id).toBeDefined();
  });

  test('Returns the correct amount of blogs', async () => {
    const response = await api.get('/api/blogs');

    expect(response.body).toHaveLength(helper.initialBlogs.length);
  });
});

describe('Post blog', () => {
  const testBlog = {
    title: 'steins;gate',
    url: 'asd',
  };
  test('Returns new blog as JSON', async () => {
    await api.post('/api/blogs').send(testBlog).expect(201).expect('Content-Type', /application\/json/);
  });

  test('New post is reflected in database', async () => {
    const newBlog = new Blog(testBlog);
    const savedBlog = await newBlog.save();
    const blogsAtEnd = await helper.blogsInDB();

    expect(savedBlog).toEqual(newBlog);
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);
  });

  test('Defaults to 0 likes if property is missing from request', async () => {
    const blog = new Blog(testBlog);
    const savedBlog = await blog.save();

    expect(savedBlog.likes).toBe(0);
  });

  test('Responds with bad request if title or url properties are missing', async () => {
    const withoutURL = { likes: 10, title: 'random' };
    await api.post('/api/blogs').send(withoutURL).expect(400);
    const withoutTitle = { url: 'asd', likes: 5 };
    await api.post('/api/blogs').send(withoutTitle).expect(400);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
