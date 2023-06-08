const supertest = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const app = require('../app');
const Blog = require('../models/blog');
const helper = require('./test_helper');
const User = require('../models/user');

const api = supertest(app);
let token = '';
let userId = '';
const testBlog = {
  title: 'steins;gate',
  url: 'asd',
};

beforeAll(async () => {
  await User.deleteMany({});
  const hash = await bcrypt.hash('password', 10);
  const initialUser = new User({
    username: 'admin',
    name: 'kuromika',
    hash,
  });
  const savedUser = await initialUser.save();
  userId = savedUser.id;
  const response = await api.post('/api/login').send({
    username: 'admin',
    password: 'password',
  });
  token = response.body.token;
}, 15000);

beforeEach(async () => {
  await Blog.deleteMany({});
  const blog = new Blog({
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    user: userId,
  });
  await blog.save();
}, 30000);

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

    expect(response.body).toHaveLength(1);
  });
});

describe('When posting a new blog', () => {
  test('Responds with 401 unathorized if no token is given', async () => {
    await api.post('/api/blogs').send(testBlog).expect(401);
  });

  test('Returns new blog as JSON', async () => {
    await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send(testBlog).expect(201)
      .expect('Content-Type', /application\/json/);
  });

  test('New post is reflected in database', async () => {
    await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send(testBlog);
    const blogsAtEnd = await helper.blogsInDB();
    expect(blogsAtEnd).toHaveLength(2);
  });

  test('Defaults to 0 likes if property is missing from request', async () => {
    const response = await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send(testBlog);
    expect(response.body.likes).toBe(0);
  });

  test('Responds with bad request if title or url properties are missing', async () => {
    const withoutURL = { likes: 10, title: 'random' };
    await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send(withoutURL).expect(400);
    const withoutTitle = { url: 'asd', likes: 5 };
    await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send(withoutTitle).expect(400);
  });
});

describe('deletion of a blog', () => {
  const fakeId = '12312asdas';

  test('Blog is deleted if id exists and is right', async () => {
    const blogsInDB = await helper.blogsInDB();
    await api.delete(`/api/blogs/${blogsInDB[0].id}`).set('Authorization', `Bearer ${token}`).expect(204);
    const blogsAtEnd = await helper.blogsInDB();
    expect(blogsAtEnd).toHaveLength(blogsInDB.length - 1);
  });

  test('Responds with bad request if id is malformatted', async () => {
    await api.delete(`/api/blogs/${fakeId}`).set('Authorization', `Bearer ${token}`).expect(400);
  });

  test('Responds with unathorized if no token is given', async () => {
    await api.delete(`/api/blogs/${fakeId}`).expect(401);
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
