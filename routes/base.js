'use strict';

const express = require('express');
const router = express.Router();
const routeGuard = require('./../middleware/route-guard');
const Offer = require('./../models/offer');

router.get('/', (req, res, next) => {
  Offer.find().limit(3).then((offers) => {
    res.render('home', { offers, title: 'waste mgmt' });
  })
  .catch((error) => {
    next(error)
  })
});

module.exports = router;
