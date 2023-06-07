const express = require('express');
require('express-async-errors');
const cors = require('cors');
const mongoose = require('mongoose');
const { MONGODB_URL } = require('./utils/config');
const { dataMorgan, unknownEndpoint, errorHandler } = require('./utils/middleware');
const blogRouter = require('./controllers/blogs');
const userRouter = require('./controllers/users');
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

if (process.env.NODE_ENV !== 'test') {
  app.use(dataMorgan);
}

app.use('/api/blogs', blogRouter);
app.use('/api/users', userRouter);

app.use(unknownEndpoint);
app.use(errorHandler);

module.exports = app;
