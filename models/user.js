'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    passwordHashAndSalt: {
      type: String
    },
    /* April 28: New user specifications */
    picture: {
      type: String
    },
    genre: {
      type: String,
      enum: [
        'Installation',
        'Painting',
        'Drawing',
        'Printing',
        'Media',
        'Photography',
        'Ceramics',
        'Textile'
      ]
    }
  },
  { timestamps: true }
);

const User = mongoose.model('User', schema);

module.exports = User;

/* Changes */
//more changes
