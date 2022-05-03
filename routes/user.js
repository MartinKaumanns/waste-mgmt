'use strict';

const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const Offer = require('./../models/offer');

router.get('/:id', (req, res, next) => {
  let userSingle;
  const { id } = req.params;
  User.findById(id)
    .then((userDoc) => {
      userSingle = userDoc;
      return Offer.find({ creator: userDoc._id });
      /* .then((offerArray) => {
          userOffers = offerArray;
          console.log(offerArray);
          return userOffers; */
    })
    .then((userOffers) => {
      console.log(userOffers);
      res.render('user', { profile: userSingle, userOffers });
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = router;
