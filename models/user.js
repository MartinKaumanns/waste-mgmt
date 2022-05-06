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
    genres: [
      {
        type: String,
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
    location: {
      type: String,
      enum: [
        'Friedrichshain',
        'Kreuzberg',
        'Neukölln',
        'Britz',
        'Treptow',
        'Köpenick',
        'Marzahn',
        'Hellersdorf',
        'Lichtenberg (Süd)',
        'Lichtenberg (Nord)',
        'Prenzlauer Berg',
        'Pankow',
        'Heinersdorf',
        'Weißensee',
        'Mitte',
        'Wedding',
        'Reinickendorf',
        'Charlottenburg',
        'Wilmersdorf',
        'Tempelhof',
        'Schöneberg',
        'Steglitz',
        'Zehlendorf',
        'Spandau',
        'Schöneweide'
      ]
    }
  },
  { timestamps: true }
);

const User = mongoose.model('User', schema);

module.exports = User;

/* Changes */
//more changes
