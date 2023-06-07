const mongoose = require('mongoose');
const supertest = require('supertest');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const app = require('../app');

const api = supertest(app);

const JSONRegex = /application\/json/;

beforeEach(async () => {
  await User.deleteMany({});
  const hash = await bcrypt.hash('password', 10);
  const initialUser = new User({
    username: 'admin',
    name: 'kuromika',
    hash,
  });
  initialUser.save();
}, 30000);

describe('When there is a single user in the database', () => {
  test('can retrieve all the users', async () => {
    const response = await api.get('/api/users').expect(200).expect('Content-Type', JSONRegex);
    expect(response.body).toHaveLength(1);
  });

  test('can create a new user', async () => {
    const response = await api.post('/api/users').send({
      username: 'test',
      name: 'testuser',
      password: 'asd',
    }).expect(201).expect('Content-Type', JSONRegex);
    const usersInDb = await User.find({});
    expect(response.body.username).toBe('test');
    expect(usersInDb).toHaveLength(2);
  });

  test('users do not contain _id, __v and have id properties', async () => {
    const response = await api.get('/api/users').expect(200);
    const user = response.body[0];
    expect(user).toHaveProperty('id');
    expect(user.id).toBeDefined();
    expect(user).not.toHaveProperty('__v');
    expect(user).not.toHaveProperty('_id');
  });

  test('can not create a new user if password is less than 3 characters long', async () => {
    await api.post('/api/users').send({
      username: 'asd',
      password: '12',
      name: 'invalid password',
    }).expect(400);
    const users = await User.find({});
    expect(users).toHaveLength(1);
  }, 15000);

  test('can not create a new user if username is less than 3 characters long', async () => {
    await api.post('/api/users').send({
      username: 'as',
      password: 'lol',
      name: 'invalid username',
    }).expect(400);
    const users = await User.find({});
    expect(users).toHaveLength(1);
  });
}, 15000);

afterAll(() => {
  mongoose.connection.close();
});
