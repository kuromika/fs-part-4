const dummy = (blogs) => 1;

const totalLikes = (blogs) => {
  if (!blogs.length) {
    return 0;
  }
  const reducer = (sum, current) => sum + current.likes;
  return blogs.reduce(reducer, 0);
};
// ...

module.exports = {
  dummy,
  totalLikes,
};
