const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const loginRouter = require('express').Router();
const User = require('../models/user');

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body;
  const user = await User.findOne({ username });
  const isCorrect = user && await bcrypt.compare(password, user.hash);
  if (!isCorrect) {
    return response.status(401).json({
      error: 'Invalid username or password',
    });
  }

  const tokenUser = {
    username: user.username,
    id: user._id,
  };

  const token = jwt.sign(tokenUser, process.env.SECRET);

  return response.status(200).send({ token, username: user.username, name: user.name });
});

module.exports = loginRouter;
