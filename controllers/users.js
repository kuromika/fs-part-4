const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.get('/', async (request, response) => {
  const users = await User.find({});
  return response.json(users);
});

usersRouter.post('/', async (request, response, next) => {
  const { username, password, name } = request.body;
  if (!password || password.length < 3) {
    const error = new Error('password is required and must be at least 3 characters long');
    error.name = 'ValidationError';
    next(error);
  }
  const hash = await bcrypt.hash(password, 10);
  const user = new User({ username, name, hash });
  const savedUser = await user.save();
  return response.status(201).json(savedUser);
});

module.exports = usersRouter;
