const dummy = (blogs) => 1;

const totalLikes = (blogs) => {
  if (!blogs.length) {
    return 0;
  }
  const reducer = (sum, current) => sum + current.likes;
  return blogs.reduce(reducer, 0);
};

const favoriteBlog = (blogs) => {
  let favorite = -1;
  let maxLikes = 0;

  for (let i = 0; i < blogs.length; i += 1) {
    if (blogs[i].likes > maxLikes) {
      favorite = i;
      maxLikes = blogs[i].likes;
    }
  }
  if (favorite < 0) {
    return null;
  }
  return blogs[favorite];
};

module.exports = {
  favoriteBlog,
  dummy,
  totalLikes,
};
