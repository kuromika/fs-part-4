const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Blog = require('../models/blog');
const helper = require('./test_helper');

const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany({});
  await Blog.insertMany(helper.initialBlogs);
}, 15000);

describe('When getting blogs', () => {
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

describe('When posting a new blog', () => {
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

describe('deletion of a blog', () => {
  test('Blog is deleted if id exists and is right', async () => {
    const blogsInDB = await helper.blogsInDB();
    await api.delete(`/api/blogs/${blogsInDB[0].id}`).expect(204);
    const blogsAtEnd = await helper.blogsInDB();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1);
  });

  test('Responds with bad request if id is malformatted', async () => {
    const fakeId = '12312asdas';
    await api.delete(`/api/blogs/${fakeId}`).expect(400);
  });
});

describe('update of a blog', () => {
  const badId = '123aasasd';
  const update = { likes: 100 };
  const fakeId = '647fe1339787d733804791d3';

  test('Blog is updated if id exists', async () => {
    const blogsInDB = await helper.blogsInDB();
    const response = await api.put(`/api/blogs/${blogsInDB[0].id}`).send(update).expect(200).expect('Content-Type', /application\/json/);
    expect(response.body.likes).toBe(100);
  });

  test('responds with bad request if id is malformatted', async () => {
    await api.put(`/api/blogs/${badId}`).send(update).expect(400);
  });

  test('responds with not found if id does not exist', async () => {
    await api.put(`/api/blogs/${fakeId}`).send(update).expect(404);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
