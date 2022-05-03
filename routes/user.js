'use strict';

const express = require('express');
const router = express.Router();
const routeGuard = require('../middleware/route-guard');
const fileUploader = require('../cloudinary.config.js');
const User = require('./../models/user');
const Offer = require('./../models/offer');

router.get('/:id', routeGuard, (req, res, next) => {
  let userSingle;
  let userIsOwner;
  const { id } = req.params;
  User.findById(id)
    .then((userDoc) => {
      userSingle = userDoc;
      userIsOwner = req.user && String(req.user._id) === String(userDoc._id);
      console.log('user is owner?' + userIsOwner);
      return Offer.find({ creator: userDoc._id });
    })
    .then((userOffers) => {
      res.render('user', { profile: userSingle, userOffers, userIsOwner });
    })
    .catch((error) => {
      next(error);
    });
});

// edit profile get
router.get('/:id/edit', routeGuard, (req, res, next) => {
  const { id } = req.params;
  User.findOne({ _id: id, creator: req.user._id }).then((user) => {
    console.log(user.location);
    if (!user) {
      throw new Error('OFFER_NOT_FOUND');
    } else {
      if (user.genres.includes('Installation')) {
        user.installation = true;
      }
      if (user.genres.includes('Painting')) {
        user.painting = true;
      }
      if (user.genres.includes('Drawing')) {
        user.drawing = true;
      }
      if (user.genres.includes('Printing')) {
        user.printing = true;
      }
      if (user.genres.includes('Media')) {
        user.media = true;
      }
      if (user.genres.includes('Photography')) {
        user.photo = true;
      }
      if (user.genres.includes('Ceramics')) {
        user.ceramics = true;
      }
      if (user.genres.includes('Textile')) {
        user.textile = true;
      }

      if (user.location.includes('Friedrichshain')) {
        user.Firedrichshain = true;
      } else if (user.location.includes('Kreuzberg')) {
        user.Kreuzberg = true;
      } else if (user.location.includes('Neukölln')) {
        user.Neukoelln = true;
      } else if (user.location.includes('Britz')) {
        user.Britz = true;
      } else if (user.location.includes('Treptow')) {
        user.Treptow = true;
      } else if (user.location.includes('Köpenick')) {
        user.Koepenick = true;
      } else if (user.location.includes('Marzahn')) {
        user.Marzahn = true;
      } else if (user.location.includes('Hellersdorf')) {
        user.Hellersdorf = true;
      } else if (user.location.includes('Lichtenberg (Süd)')) {
        user.Ls = true;
      } else if (user.location.includes('Lichtenberg (Nord)')) {
        user.Ln = true;
      } else if (user.location.includes('Prenzlauer Berg')) {
        user.Pberg = true;
      } else if (user.location.includes('Pankow')) {
        user.Pankow = true;
      } else if (user.location.includes('Heinersdorf')) {
        user.Heinersdorf = true;
      } else if (user.location.includes('Weißensee')) {
        user.Weissensee = true;
      } else if (user.location.includes('Mitte')) {
        user.Mitte = true;
      } else if (user.location.includes('Wedding')) {
        user.Wedding = true;
      } else if (user.location.includes('Reinickendorf')) {
        user.Reinickendorf = true;
      } else if (user.location.includes('Charlottenburg')) {
        user.Charlottenburg = true;
      } else if (user.location.includes('Wilmersdorf')) {
        user.Wilmersdorf = true;
      } else if (user.location.includes('Tempelhof')) {
        user.Tempelhof = true;
      } else if (user.location.includes('Schöneberg')) {
        user.Schoeneberg = true;
      } else if (user.location.includes('Steglitz')) {
        user.Steglitz = true;
      } else if (user.location.includes('Zehlendorf')) {
        user.Zehlendorf = true;
      } else if (user.location.includes('Spandau')) {
        user.Spandau = true;
      } else if (user.location.includes('Schöneweide')) {
        user.Schoeneweide = true;
      }
    }
    res.render('edit-profile', { user });
  });
});

// edit profile POST
/* router.post(
  '/:id/edit',
  routeGuard,
  fileUploader.single('picture'),
  (req, res, next) => {
    console.log(req.params);
    const { id } = req.params;
    const { name, email, genres, location } = req.body;
    User.findByIdAndUpdate(id, {
      name,
      email,
      picture: req.file.path,
      genres,
      location
    })
      .then(() => {
        console.log('Hello');
        res.redirect(`/user/${id}`);
      })
      .catch((error) => {
        next(error);
      });
  }
); */

module.exports = router;
