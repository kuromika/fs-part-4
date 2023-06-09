const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String, required: true, unique: true, minLength: 3,
  },
  name: { type: String, required: true },
  hash: { type: String, required: true },
  blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }],
});

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.hash;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('User', userSchema);
