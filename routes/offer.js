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
      console.log(offer.genres.includes('Painting'));
      if (!offer) {
        throw new Error('OFFER_NOT_FOUND');
      } else {
        if (offer.genres.includes('Installation')) {
          offer.installation = true;
        }
        if (offer.genres.includes('Painting')) {
          offer.painting = true;
        }
        if (offer.genres.includes('Drawing')) {
          offer.drawing = true;
        }
        if (offer.genres.includes('Printing')) {
          offer.printing = true;
        }
        if (offer.genres.includes('Media')) {
          offer.media = true;
        }
        if (offer.genres.includes('Photography')) {
          offer.photo = true;
        }
        if (offer.genres.includes('Ceramics')) {
          offer.ceramics = true;
        }
        if (offer.genres.includes('Textile')) {
          offer.textile = true;
        }

        if (offer.materials.includes('wood')) {
          offer.wood = true;
        }
        if (offer.materials.includes('steel')) {
          offer.steel = true;
        }
        if (offer.materials.includes('colors')) {
          offer.colors = true;
        }
        if (offer.materials.includes('paper')) {
          offer.paper = true;
        }
        if (offer.materials.includes('tools')) {
          offer.tools = true;
        }
        if (offer.materials.includes('equipment')) {
          offer.equipment = true;
        }
        if (offer.materials.includes('machines')) {
          offer.machines = true;
        }
        if (offer.materials.includes('other')) {
          offer.other = true;
        }

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
