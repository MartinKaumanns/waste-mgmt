'use strict';

const { Router } = require('express');

const bcryptjs = require('bcryptjs');
const Offer = require('./../models/offer');
const fileUploader = require('../cloudinary.config.js');

const router = new Router();

router.get('/create', (req, res) => {
    res.render('offer-create')
})

router.post('/create', fileUploader.single('picture'), (req, res, next) => {
    const { title, description, picture, genres, materials, price, payment, location } = req.body;
    Offer.create({
          title, 
          creator: req.user._id,
          description,
          picture: req.file.path,
          genres,
          materials,
          price, 
          payment, 
          location,
          completed: false
      })
      .then((offer) => {
        console.log(offer);
      })
      .catch((error) => {
        next(error);
      })
})
  

module.exports = router;