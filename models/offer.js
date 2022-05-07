'use strict';

const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
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
      maxlength: 400
    },
    price: {
      type: Number
    },
    alternativepayment: {
      type: String,
      maxlength: 400
    },
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
    },
    completed: {
      type: Boolean,
      required: true
    }
  },
  { timestamps: true }
);

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;
