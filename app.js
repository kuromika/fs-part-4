const express = require('express');
require('express-async-errors');
const cors = require('cors');
const mongoose = require('mongoose');
const { MONGODB_URL } = require('./utils/config');
const {
  dataMorgan, unknownEndpoint, errorHandler, extractToken, extractUser,
} = require('./utils/middleware');
const userRouter = require('./controllers/users');
const blogRouter = require('./controllers/blogs');
const loginRouter = require('./controllers/login');
const { info } = require('./utils/logger');

const app = express();

const connectMongoose = async () => {
  await mongoose.connect(MONGODB_URL);
  info('Connected to MongoDB');
};

connectMongoose();

app.use(cors());
app.use(express.static('build'));
app.use(express.json());
app.use(extractToken);

if (process.env.NODE_ENV !== 'test') {
  app.use(dataMorgan);
}

app.use('/api/blogs', extractUser, blogRouter);
app.use('/api/users', userRouter);
app.use('/api/login', loginRouter);

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing');
  app.use('/api/testing', testingRouter);
}

app.use(unknownEndpoint);
app.use(errorHandler);

module.exports = app;
