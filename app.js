const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { MONGODB_URL } = require('./utils/config');
const { dataMorgan, unknownEndpoint, errorHandler } = require('./utils/middleware');
const blogRouter = require('./controllers/blogs');

const app = express();

mongoose.connect(MONGODB_URL);

app.use(cors());
app.use(express.static('build'));
app.use(express.json());
app.use(dataMorgan);

app.use('/api/blogs', blogRouter);

app.use(unknownEndpoint);
app.use(errorHandler);

module.exports = app;
