const mongoose = require('mongoose');
const validator = require('validator');

const model = mongoose.model('Restaurant', {
  name: {
    type: String,
    required: true,
    validate: {
      validator(name) {
        return validator.isAlphanumeric(name);
      },
    },
  },
  location: {
    type: String,
    required: true,
    validate: {
      validator(firstname) {
        return validator.isAlphanumeric(firstname);
      },
    },
  },
  type: {
    type: String,
    required: false,
  }
});

module.exports = model;