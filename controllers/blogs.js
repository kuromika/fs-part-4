const blogsRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const Blog = require('../models/blog');
const User = require('../models/user');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { blogs: 0 });
  response.json(blogs);
});

blogsRouter.post('/', async (request, response) => {
  if (!request.user) {
    return response.status(401).json({ error: 'A token is required' });
  }
  console.log(request.user);
  const user = await User.findById(request.user.id);
  const blog = new Blog({ ...request.body, user: user.id });
  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();
  return response.status(201).json(savedBlog);
});

blogsRouter.delete('/:id', async (request, response) => {
  if (!request.user) {
    return response.status(401).json({ error: 'A token is required' });
  }
  const blog = await Blog.findById(request.params.id);
  if (blog && blog.user.toString() !== request.user.id.toString()) {
    return response.status(401).json({ error: 'only the blog creator can do this' });
  }
  await Blog.findByIdAndDelete(request.params.id);
  return response.status(204).end();
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
