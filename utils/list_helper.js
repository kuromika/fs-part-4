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

const mostBlogs = (blogs) => {
  if (!blogs.length) {
    return null;
  }
  const authors = {};

  for (let i = 0; i < blogs.length; i += 1) {
    if (!authors[blogs[i].author]) {
      authors[blogs[i].author] = 1;
    } else {
      authors[blogs[i].author] += 1;
    }
  }

  let max = 0;
  let author = '';

  Object.keys(authors).forEach((key) => {
    if (authors[key] > max) {
      author = key;
      max = authors[key];
    }
  });

  return { author, blogs: max };
};

module.exports = {
  favoriteBlog,
  dummy,
  totalLikes,
  mostBlogs,
};
