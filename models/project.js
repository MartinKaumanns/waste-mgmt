'use strict';

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true
    },
    creator: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    insta: {
        type: String
    },
    web: {
        type: String
    },
    genres: [
      {
        type: String,
        required: true,
        enum: [
          'Installation',
          'Painting',
          'Media',
          'Photography',
          'Ceramics',
          'Performing Arts',
          'Architecture',
          'Graphics',
          'Other'
        ]
      }
    ],
    picture: [
      {
        type: String
      }
    ],
    materials: [
      {
        type: String,
        required: true,
        enum: [
          'wood',
          'metal',
          'plastic',
          'paper / cardboard',
          'pens / brushes',
          'paints',
          'textile',
          'stone / building materials',
          'moulding / casting',
          'tools',
          'technical equipment',
          'studio furniture',
          'other'
        ]
      }
    ],
    description: {
      type: String,
      maxlength: 700
    }
  },
  { timestamps: true }
);

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
