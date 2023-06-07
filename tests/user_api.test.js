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
}, 15000);

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
});

afterAll(() => {
  mongoose.connection.close();
});
