const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({});
  response.json(blogs);
});

blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body);
  const savedBlog = await blog.save();
  response.status(201).json(savedBlog);
});

blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id);
  response.status(204).end();
});

blogsRouter.put('/:id', async (request, response) => {
  const {
    url, likes, title, author,
  } = request.body;

  const update = await Blog.findByIdAndUpdate(request.params.id, {
    url, likes, title, author,
  }, { new: true, query: true, runValidators: true });

  if (!update) {
    return response.status(404).end();
  }
  return response.json(update);
});

module.exports = blogsRouter;
