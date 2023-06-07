const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const logger = require('./logger');

morgan.token('data', (req, res) => {
  if (req.method === 'POST') {
    return JSON.stringify(res.body);
  }
  return '';
});

const dataMorgan = morgan((tokens, req, res) => [
  tokens.method(req, res),
  tokens.url(req, res),
  tokens.status(req, res),
  tokens.res(req, res, 'content-length'),
  '-',
  tokens['response-time'](req, res),
  'ms',
  tokens.data(req, res),
].join(' '));

const unknownEndpoint = (request, response) => {
  response.status(404).json({ error: 'Unknown endpoint' });
};

const errorHandler = (error, request, response, next) => {
  logger.error(error);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformated id' });
  }

  if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message });
  }

  if (error.code === 11000 && error.keyPattern.username) {
    return response.status(422).send({ error: 'username already exists' });
  }

  if (error.name === 'JsonWebTokenError') {
    return response.status(400).json({ error: error.message });
  }

  return next(error);
};

const extractToken = (request, response, next) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.startsWith('Bearer ')) {
    request.token = authorization.replace('Bearer ', '');
  }
  next();
};

const extractUser = async (request, response, next) => {
  if (request.token) {
    const decodedToken = jwt.verify(request.token, process.env.SECRET);
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'invalid token' });
    }
    const user = await User.findById(decodedToken.id);
    request.user = user;
  }
  return next();
};

module.exports = {
  unknownEndpoint,
  errorHandler,
  dataMorgan,
  extractToken,
  extractUser,
};
