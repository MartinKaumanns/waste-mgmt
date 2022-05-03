'use strict';

const { Router } = require('express');
const routeGuard = require('../middleware/route-guard');
const bcryptjs = require('bcryptjs');
const Offer = require('./../models/offer');
const fileUploader = require('../cloudinary.config.js');
const { render } = require('../app');

const router = new Router();

router.get('/create', (req, res) => {
  res.render('offer-create');
});

router.get('/offer-suggestions', (req, res, next) => {
  Offer.find().then((offers) => {
    res.render('offer-suggestions', { offers });
  });
});

router.get('/:id', (req, res, next) => {
  const { id } = req.params;
  Offer.findById(id)
    .populate('creator')
    .then((offer) => {
      let userIsOwner =
        req.user && String(req.user._id) === String(offer.creator._id);
      res.render('offer', { offer, userIsOwner });
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/:id/edit', (req, res, next) => {
  const { id } = req.params;
  Offer.findOne({ _id: id, creator: req.user._id })
    .then((offer) => {
      if (!offer) {
        throw new Error('OFFER_NOT_FOUND');
      } else {
        res.render('edit-offer', { offer });
      }
    })
    .catch((error) => {
      next(error);
    });
});

router.post(
  '/create',
  routeGuard,
  fileUploader.single('picture'),
  (req, res, next) => {
    const {
      title,
      description,
      picture,
      genres,
      materials,
      price,
      alternativepayment,
      location
    } = req.body;
    Offer.create({
      title,
      creator: req.user._id,
      description,
      picture: req.file.path,
      genres,
      materials,
      price,
      alternativepayment,
      location,
      completed: false
    })
      .then((offer) => {
        const id = offer._id;
        res.redirect('/offer/' + id);
      })
      .catch((error) => {
        next(error);
      });
  }
);

router.post(
  '/:id/edit',
  routeGuard,
  fileUploader.single('picture'),
  (req, res, next) => {
    console.log(req.params);
    const id = req.params.id;
    const {
      title,
      description,
      picture,
      genres,
      materials,
      price,
      alternativepayment,
      location
    } = req.body;
    Offer.findByIdAndUpdate(
      { _id: id, creator: req.user._id },
      {
        title,
        description,
        picture: req.file.path,
        genres,
        materials,
        price,
        alternativepayment,
        location,
        completed: false
      }
    )
      .then(() => {
        console.log('Hello');
        res.redirect(`/offer/${id}`);
      })
      .catch((error) => {
        next(error);
      });
  }
);

router.post('/:id/delete', routeGuard, (req, res, next) => {
  const { id } = req.params;
  Offer.findOneAndUpdate(
    { _id: id, creator: req.user._id },
    { completed: true },
    { returnDocument: 'after' }
  )
    .then((updatedDoc) => {
      console.log(updatedDoc);
      res.redirect('/'); //should redirect to suggestions in the end
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = router;
