const mongoose = require('mongoose');
const validator = require('validator');

const model = mongoose.model('Restaurant', {
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: false,
  }
});

module.exports = model;