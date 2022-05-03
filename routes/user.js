'use strict';

const express = require('express');
const router = express.Router();
const routeGuard = require('../middleware/route-guard');
const User = require('./../models/user');
const Offer = require('./../models/offer');

router.get('/:id', routeGuard, (req, res, next) => {
  let userSingle;
  let userIsOwner;
  const { id } = req.params;
  User.findById(id)
    .then((userDoc) => {
      userSingle = userDoc;
      userIsOwner =
        req.user && String(req.user._id) === String(userDoc._id);
        console.log('user is owner?' + userIsOwner)
      return Offer.find({ creator: userDoc._id });
    })
    .then((userOffers) => {
      res.render('user', { profile: userSingle, userOffers, userIsOwner });
    })
    .catch((error) => {
      next(error);
    });
});



module.exports = router;
