const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.get('/', async (request, response) => {
  const users = await User.find({});
  return response.json(users);
});

usersRouter.post('/', async (request, response) => {
  const { username, password, name } = request.body;
  const hash = await bcrypt.hash(password, 10);
  const user = new User({ username, name, hash });
  const savedUser = await user.save();
  return response.status(201).json(savedUser);
});

module.exports = usersRouter;
