'use strict';

const { Router } = require('express');
const routeGuard = require('../middleware/route-guard');
const bcryptjs = require('bcryptjs');
const Offer = require('./../models/offer');
const fileUploader = require('../cloudinary.config.js');
const { render } = require('../app');

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const router = new Router();

let queryObj;
let searchObj;

router.get('/create', (req, res) => {
  res.render('offer-create');
});

router.get('/offer-suggestions', (req, res, next) => {
  let limit = 30;
  // checks if user is logged in
  if (req.user) {
    // searchs for all offers which contain the user's genre category
    let genresArray = req.user.genres;
    Offer.find({ genres: { $in: req.user.genres } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .then((offers) => {
        console.log('Länge eigener genre offerings: ', offers.length);
        // checks if results are already 30(limit)
        if (offers.length < limit) {
          // finds latest offers that do not contain the user's genre and concats the list of results
          // should filter out own offers {creator : { $ne : ObjectId('626d4f0ff3c3d119acbf7425')}}
          Offer.find({ genres: { $nin: req.user.genres } })
            .sort({ createdAt: -1 })
            .limit(limit - offers.length)
            .then((restOffers) => {
              offers = offers.concat(restOffers);
              console.log('Länge aller offerings: ', offers.length);
              console.log(offers[0].creator, req.user._id);
              res.render('offer-suggestions', { offers });
            })
            .catch((error) => {
              next(error);
            });
        } else {
          res.render('offer-suggestions', { offers });
        }
      })
      .catch((error) => {
        next(error);
      });
  } else {
    // if user is not logged in find the 30(limit) latest offers
    // should filter out own offers
    Offer.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .then((offers) => {
        res.render('offer-suggestions', { offers });
      });
  }
});

router.get('/offer-search', (req, res, next) => {
  const limit = 30;
  const searchTerm = req.query.searchfield;
  queryObj = {}; // empties queryObj
  // writes searchObj with search "term"
  searchObj = {
    $or: [
      { title: { $regex: searchTerm } },
      { description: { $regex: searchTerm } },
      { genres: { $regex: searchTerm } },
      { materials: { $regex: searchTerm } }
    ]
  };
  // performs query with searchObj
  Offer.find(searchObj)
    .sort({ createdAt: -1 })
    .limit(limit)
    .then((filteredOffers) => {
      res.render('offer-filtered', { filteredOffers, searchObj });
    });
});

router.get('/offer-sorted-price', (req, res, next) => {
  const limit = 30;
  // checks if a category query (queryObj) or a search with an input (searchObj) was performed before
  // checks if searchObj is NOT empty (--> there was a search before)
  if (
    !(Object.keys(searchObj).length === 0 && searchObj.constructor === Object)
  ) {
    // fetches all documents with former searchObj and sort by price (lowest first)
    Offer.find(searchObj)
      .sort({ price: 1 })
      .limit(limit)
      .then((filteredOffers) => {
        res.render('offer-filtered', { filteredOffers, searchObj });
      });
  } else {
    // if there was no query before OR a category query
    Offer.find(queryObj)
      // fetches all documents with former queryObj and sort by price (lowest first)
      .sort({ price: 1 })
      .limit(limit)
      .then((filteredOffers) => {
        res.render('offer-filtered', { filteredOffers, queryObj });
      });
  }
});

router.get('/offer-sorted-descending-price', (req, res, next) => {
  const limit = 30;
  if (
    !(Object.keys(searchObj).length === 0 && searchObj.constructor === Object)
  ) {
    Offer.find(searchObj)
      .sort({ price: -1 })
      .limit(limit)
      .then((filteredOffers) => {
        res.render('offer-filtered', { filteredOffers, searchObj });
      });
  } else {
    Offer.find(queryObj)
      .sort({ price: -1 })
      .limit(limit)
      .then((filteredOffers) => {
        res.render('offer-filtered', { filteredOffers, queryObj });
      });
  }
});

router.get('/offer-sorted-date', (req, res, next) => {
  const limit = 30;
  if (
    !(Object.keys(searchObj).length === 0 && searchObj.constructor === Object)
  ) {
    Offer.find(searchObj)
      .sort({ createdAt: -1 })
      .limit(limit)
      .then((filteredOffers) => {
        res.render('offer-filtered', { filteredOffers, searchObj });
      });
  } else {
    Offer.find(queryObj)
      .sort({ createdAt: -1 })
      .limit(limit)
      .then((filteredOffers) => {
        res.render('offer-filtered', { filteredOffers, queryObj });
      });
  }
});

router.get('/offer-sorted-oldest-date', (req, res, next) => {
  const limit = 30;
  if (
    !(Object.keys(searchObj).length === 0 && searchObj.constructor === Object)
  ) {
    Offer.find(searchObj)
      .sort({ createdAt: 1 })
      .limit(limit)
      .then((filteredOffers) => {
        res.render('offer-filtered', { filteredOffers, searchObj });
      });
  } else {
    Offer.find(queryObj)
      .sort({ createdAt: 1 })
      .limit(limit)
      .then((filteredOffers) => {
        res.render('offer-filtered', { filteredOffers, queryObj });
      });
  }
});

router.get('/offer-filtered', (req, res, next) => {
  let limit = 30;
  searchObj = {};

  if (!req.query.genres && !req.query.materials) {
    queryObj = {};
  } else if (!req.query.genres) {
    queryObj = { materials: { $in: req.query.materials } };
  } else if (!req.query.materials) {
    queryObj = { genres: { $in: req.query.genres } };
  } else {
    queryObj = {
      $and: [
        { genres: { $in: req.query.genres } },
        { materials: { $in: req.query.materials } }
      ]
    };
  }

  Offer.find(queryObj)
    .sort({ createdAt: -1 })
    .limit(limit)
    .then((filteredOffers) => {
      res.render('offer-filtered', { filteredOffers, queryObj });
    });
});

router.get('/:id/offer-email', (req, res, next) => {
  const offerId = req.params.id;
  Offer.findById(offerId)
    .populate('creator')
    .then((offer) => {
      res.render('offer-email', { offerId, offer });
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

router.post('/:id/offer-email', (req, res, next) => {
  // console.log(req.params.id);
  const offerId = req.params.id;
  Offer.findById(offerId)
    .populate('creator')
    ///EMAIL Client down therefore no redirection to email-feedback
    /* .then((offer) => {
      //console.log(offer.creator.email)
      transporter
        .sendMail({
          from: `"User01" ${process.env.EMAIL}`,
          to: offer.creator.email,
          subject: 'waste-mgmt offer',
          text: req.body.text,
          html: `Hi ${req.user.name} is interested in ${offer.title} <br> ${req.body.text}`
        }) */
    .then(() => {
      console.log({ offerId });
      res.render('email-feedback', { offerId });
    })
    .catch((error) => {
      console.log(error);
    });
  /* }); */
});

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
      res.redirect('offer/offer-suggestions');
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = router;
