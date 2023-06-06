const dummy = () => 1;

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

const mapArrayByRepetition = (array, property) => {
  const map = {};

  for (let i = 0; i < array.length; i += 1) {
    if (!map[array[i][property]]) {
      map[array[i][property]] = 1;
    } else {
      map[array[i][property]] += 1;
    }
  }

  return map;
};

const mapArrayByValue = (array, property, value) => {
  const map = {};

  for (let i = 0; i < array.length; i += 1) {
    if (!map[array[i][property]]) {
      map[array[i][property]] = array[i][value];
    } else {
      map[array[i][property]] += array[i][value];
    }
  }
  return map;
};

const findMaxInMap = (map, keyName, valueName) => {
  let maxValue = 0;
  let maxKey = '';

  Object.keys(map).forEach((key) => {
    if (map[key] > maxValue) {
      maxKey = key;
      maxValue = map[key];
    }
  });

  return {
    [keyName]: maxKey,
    [valueName]: maxValue,
  };
};

const mostBlogs = (blogs) => {
  if (!blogs.length) {
    return null;
  }

  const authors = mapArrayByRepetition(blogs, 'author');

  return findMaxInMap(authors, 'author', 'blogs');
};

const mostLikes = (blogs) => {
  if (!blogs.length) {
    return null;
  }

  const authors = mapArrayByValue(blogs, 'author', 'likes');

  return findMaxInMap(authors, 'author', 'likes');
};

module.exports = {
  favoriteBlog,
  dummy,
  totalLikes,
  mostBlogs,
  mostLikes,
};
