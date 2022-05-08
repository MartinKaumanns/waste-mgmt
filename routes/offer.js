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
    // filters out own offers
    let genresArray = req.user.genres;
    Offer.find({
      $and: [
        { genres: { $in: req.user.genres } },
        { creator: { $ne: { _id: req.user.id } } }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('creator')
      .then((offers) => {
        // checks if results are already 30(limit)
        if (offers.length < limit) {
          // finds latest offers that do not contain the user's genre and concats the list of results
          // filters out own offers {creator : { $ne : ObjectId('626d4f0ff3c3d119acbf7425')}}
          Offer.find({
            $and: [
              { genres: { $nin: req.user.genres } },
              { creator: { $ne: { _id: req.user.id } } }
            ]
          })
            .sort({ createdAt: -1 })
            .limit(limit - offers.length)
            .populate('creator')
            .then((restOffers) => {
              offers = offers.concat(restOffers);
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
      .populate('creator')
      .then((offers) => {
        res.render('offer-suggestions', { offers });
      });
  }
});

router.get('/offer-search/date', (req, res, next) => {
  const limit = 30;
  const searchTerm = req.query.searchfield;
  // writes searchObj with search "term", filters out results of user
  if (req.user) {
    searchObj = {
      $and: [
        { creator: { $ne: { _id: req.user.id } } },
        {
          $or: [
            { title: { $regex: searchTerm } },
            { description: { $regex: searchTerm } },
            { genres: { $regex: searchTerm } },
            { materials: { $regex: searchTerm } }
          ]
        }
      ]
    };
  } else {
    searchObj = {
      $or: [
        { title: { $regex: searchTerm } },
        { description: { $regex: searchTerm } },
        { genres: { $regex: searchTerm } },
        { materials: { $regex: searchTerm } }
      ]
    };
  }
  // performs query with searchObj
  Offer.find(searchObj)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('creator')
    .then((filteredOffers) => {
      filteredOffers.searchTerm = searchTerm;
      res.render('offer-filtered', { filteredOffers });
    });
});

router.get('/offer-search/date-oldest', (req, res, next) => {
  const limit = 30;
  const searchTerm = req.query.searchfield;
  // writes searchObj with search "term", filters out results of user
  if (req.user) {
    searchObj = {
      $and: [
        { creator: { $ne: { _id: req.user.id } } },
        {
          $or: [
            { title: { $regex: searchTerm } },
            { description: { $regex: searchTerm } },
            { genres: { $regex: searchTerm } },
            { materials: { $regex: searchTerm } }
          ]
        }
      ]
    };
  } else {
    searchObj = {
      $or: [
        { title: { $regex: searchTerm } },
        { description: { $regex: searchTerm } },
        { genres: { $regex: searchTerm } },
        { materials: { $regex: searchTerm } }
      ]
    };
  }
  // performs query with searchObj
  Offer.find(searchObj)
    .sort({ createdAt: 1 })
    .limit(limit)
    .populate('creator')
    .then((filteredOffers) => {
      filteredOffers.searchTerm = searchTerm;
      res.render('offer-filtered', { filteredOffers });
    });
});

router.get('/offer-search/price', (req, res, next) => {
  const limit = 30;
  const searchTerm = req.query.searchfield;
  // writes searchObj with search "term", filters out results of user
  if (req.user) {
    searchObj = {
      $and: [
        { creator: { $ne: { _id: req.user.id } } },
        {
          $or: [
            { title: { $regex: searchTerm } },
            { description: { $regex: searchTerm } },
            { genres: { $regex: searchTerm } },
            { materials: { $regex: searchTerm } }
          ]
        }
      ]
    };
  } else {
    searchObj = {
      $or: [
        { title: { $regex: searchTerm } },
        { description: { $regex: searchTerm } },
        { genres: { $regex: searchTerm } },
        { materials: { $regex: searchTerm } }
      ]
    };
  }
  // performs query with searchObj
  Offer.find(searchObj)
    .sort({ price: 1 })
    .limit(limit)
    .populate('creator')
    .then((filteredOffers) => {
      filteredOffers.searchTerm = searchTerm;
      res.render('offer-filtered', { filteredOffers });
    });
});

router.get('/offer-search/price-descending', (req, res, next) => {
  const limit = 30;
  const searchTerm = req.query.searchfield;
  // writes searchObj with search "term", filters out results of user
  if (req.user) {
    searchObj = {
      $and: [
        { creator: { $ne: { _id: req.user.id } } },
        {
          $or: [
            { title: { $regex: searchTerm } },
            { description: { $regex: searchTerm } },
            { genres: { $regex: searchTerm } },
            { materials: { $regex: searchTerm } }
          ]
        }
      ]
    };
  } else {
    searchObj = {
      $or: [
        { title: { $regex: searchTerm } },
        { description: { $regex: searchTerm } },
        { genres: { $regex: searchTerm } },
        { materials: { $regex: searchTerm } }
      ]
    };
  }
  // performs query with searchObj
  Offer.find(searchObj)
    .sort({ price: -1 })
    .limit(limit)
    .populate('creator')
    .then((filteredOffers) => {
      filteredOffers.searchTerm = searchTerm;
      res.render('offer-filtered', { filteredOffers });
    });
});

router.get('/offer-filtered/price', (req, res, next) => {
  let limit = 30;
  searchObj = {};
  //checks if user is loged in, if yes: filters out user's results
  if (req.user) {
    if (!req.query.genres && !req.query.materials) {
      queryObj = { creator: { $ne: { _id: req.user.id } } };
    } else if (!req.query.genres) {
      queryObj = {
        $and: [
          { creator: { $ne: { _id: req.user.id } } },
          { materials: { $in: req.query.materials } }
        ]
      };
    } else if (!req.query.materials) {
      queryObj = {
        $and: [
          { creator: { $ne: { _id: req.user.id } } },
          { genres: { $in: req.query.genres } }
        ]
      };
    } else {
      queryObj = {
        $and: [
          { creator: { $ne: { _id: req.user.id } } },
          {
            $or: [
              { genres: { $in: req.query.genres } },
              { materials: { $in: req.query.materials } }
            ]
          }
        ]
      };
    }
  } else {
    if (!req.query.genres && !req.query.materials) {
      queryObj = {};
    } else if (!req.query.genres) {
      queryObj = { materials: { $in: req.query.materials } };
    } else if (!req.query.materials) {
      queryObj = { genres: { $in: req.query.genres } };
    } else {
      queryObj = {
        $or: [
          { genres: { $in: req.query.genres } },
          { materials: { $in: req.query.materials } }
        ]
      };
    }
  }

  Offer.find(queryObj)
    .sort({ price: 1 })
    .limit(limit)
    .populate('creator')
    .then((filteredOffers) => {
      if (!filteredOffers || filteredOffers.length === 0) {
        res.render('offer-filtered');
      } else {
        if (req.query.genres) {
          if (req.query.genres.includes('Installation')) {
            filteredOffers[0].installation = true;
          }
          if (req.query.genres.includes('Painting')) {
            filteredOffers[0].painting = true;
          }
          if (req.query.genres.includes('Media')) {
            filteredOffers[0].media = true;
          }
          if (req.query.genres.includes('Photography')) {
            filteredOffers[0].photography = true;
          }
          if (req.query.genres.includes('Ceramics')) {
            filteredOffers[0].ceramics = true;
          }
          if (req.query.genres.includes('Performing Arts')) {
            filteredOffers[0].performingArts = true;
          }
          if (req.query.genres.includes('Architecture')) {
            filteredOffers[0].architecture = true;
          }
          if (req.query.genres.includes('Graphics')) {
            filteredOffers[0].graphics = true;
          }
          if (req.query.genres.includes('Other')) {
            filteredOffers[0].Other = true;
          }
        }
        if (req.query.materials) {
          if (req.query.materials.includes('wood')) {
            filteredOffers[0].wood = true;
          }
          if (req.query.materials.includes('metal')) {
            filteredOffers[0].metal = true;
          }
          if (req.query.materials.includes('plastic')) {
            filteredOffers[0].plastic = true;
          }
          if (req.query.materials.includes('paper / cardboard')) {
            filteredOffers[0].paper = true;
          }
          if (req.query.materials.includes('pens / brushes')) {
            filteredOffers[0].pens = true;
          }
          if (req.query.materials.includes('paints')) {
            filteredOffers[0].paints = true;
          }
          if (req.query.materials.includes('textile')) {
            filteredOffers[0].textile = true;
          }
          if (req.query.materials.includes('stone / building materials')) {
            filteredOffers[0].stone = true;
          }
          if (req.query.materials.includes('moulding / casting')) {
            filteredOffers[0].moulding = true;
          }
          if (req.query.materials.includes('tools')) {
            filteredOffers[0].tools = true;
          }
          if (req.query.materials.includes('technical equipment')) {
            filteredOffers[0].technicalEquipment = true;
          }
          if (req.query.materials.includes('studio furniture')) {
            filteredOffers[0].studioFurniture = true;
          }
          if (req.query.materials.includes('other')) {
            filteredOffers[0].other = true;
          }
        }
        res.render('offer-filtered', { filteredOffers });
      }
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/offer-filtered/price-descending', (req, res, next) => {
  let limit = 30;
  searchObj = {};
  //checks if user is loged in, if yes: filters out user's results
  if (req.user) {
    if (!req.query.genres && !req.query.materials) {
      queryObj = { creator: { $ne: { _id: req.user.id } } };
    } else if (!req.query.genres) {
      queryObj = {
        $and: [
          { creator: { $ne: { _id: req.user.id } } },
          { materials: { $in: req.query.materials } }
        ]
      };
    } else if (!req.query.materials) {
      queryObj = {
        $and: [
          { creator: { $ne: { _id: req.user.id } } },
          { genres: { $in: req.query.genres } }
        ]
      };
    } else {
      queryObj = {
        $and: [
          { creator: { $ne: { _id: req.user.id } } },
          {
            $or: [
              { genres: { $in: req.query.genres } },
              { materials: { $in: req.query.materials } }
            ]
          }
        ]
      };
    }
  } else {
    if (!req.query.genres && !req.query.materials) {
      queryObj = {};
    } else if (!req.query.genres) {
      queryObj = { materials: { $in: req.query.materials } };
    } else if (!req.query.materials) {
      queryObj = { genres: { $in: req.query.genres } };
    } else {
      queryObj = {
        $or: [
          { genres: { $in: req.query.genres } },
          { materials: { $in: req.query.materials } }
        ]
      };
    }
  }

  Offer.find(queryObj)
    .sort({ price: -1 })
    .limit(limit)
    .populate('creator')
    .then((filteredOffers) => {
      if (!filteredOffers || filteredOffers.length === 0) {
        res.render('offer-filtered');
      } else {
        if (req.query.genres) {
          if (req.query.genres.includes('Installation')) {
            filteredOffers[0].installation = true;
          }
          if (req.query.genres.includes('Painting')) {
            filteredOffers[0].painting = true;
          }
          if (req.query.genres.includes('Media')) {
            filteredOffers[0].media = true;
          }
          if (req.query.genres.includes('Photography')) {
            filteredOffers[0].photography = true;
          }
          if (req.query.genres.includes('Ceramics')) {
            filteredOffers[0].ceramics = true;
          }
          if (req.query.genres.includes('Performing Arts')) {
            filteredOffers[0].performingArts = true;
          }
          if (req.query.genres.includes('Architecture')) {
            filteredOffers[0].architecture = true;
          }
          if (req.query.genres.includes('Graphics')) {
            filteredOffers[0].graphics = true;
          }
          if (req.query.genres.includes('Other')) {
            filteredOffers[0].Other = true;
          }
        }
        if (req.query.materials) {
          if (req.query.materials.includes('wood')) {
            filteredOffers[0].wood = true;
          }
          if (req.query.materials.includes('metal')) {
            filteredOffers[0].metal = true;
          }
          if (req.query.materials.includes('plastic')) {
            filteredOffers[0].plastic = true;
          }
          if (req.query.materials.includes('paper / cardboard')) {
            filteredOffers[0].paper = true;
          }
          if (req.query.materials.includes('pens / brushes')) {
            filteredOffers[0].pens = true;
          }
          if (req.query.materials.includes('paints')) {
            filteredOffers[0].paints = true;
          }
          if (req.query.materials.includes('textile')) {
            filteredOffers[0].textile = true;
          }
          if (req.query.materials.includes('stone / building materials')) {
            filteredOffers[0].stone = true;
          }
          if (req.query.materials.includes('moulding / casting')) {
            filteredOffers[0].moulding = true;
          }
          if (req.query.materials.includes('tools')) {
            filteredOffers[0].tools = true;
          }
          if (req.query.materials.includes('technical equipment')) {
            filteredOffers[0].technicalEquipment = true;
          }
          if (req.query.materials.includes('studio furniture')) {
            filteredOffers[0].studioFurniture = true;
          }
          if (req.query.materials.includes('other')) {
            filteredOffers[0].other = true;
          }
        }
        res.render('offer-filtered', { filteredOffers });
      }
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/offer-filtered/date-oldest', (req, res, next) => {
  let limit = 30;
  searchObj = {};
  //checks if user is loged in, if yes: filters out user's results
  if (req.user) {
    if (!req.query.genres && !req.query.materials) {
      queryObj = { creator: { $ne: { _id: req.user.id } } };
    } else if (!req.query.genres) {
      queryObj = {
        $and: [
          { creator: { $ne: { _id: req.user.id } } },
          { materials: { $in: req.query.materials } }
        ]
      };
    } else if (!req.query.materials) {
      queryObj = {
        $and: [
          { creator: { $ne: { _id: req.user.id } } },
          { genres: { $in: req.query.genres } }
        ]
      };
    } else {
      queryObj = {
        $and: [
          { creator: { $ne: { _id: req.user.id } } },
          {
            $or: [
              { genres: { $in: req.query.genres } },
              { materials: { $in: req.query.materials } }
            ]
          }
        ]
      };
    }
  } else {
    if (!req.query.genres && !req.query.materials) {
      queryObj = {};
    } else if (!req.query.genres) {
      queryObj = { materials: { $in: req.query.materials } };
    } else if (!req.query.materials) {
      queryObj = { genres: { $in: req.query.genres } };
    } else {
      queryObj = {
        $or: [
          { genres: { $in: req.query.genres } },
          { materials: { $in: req.query.materials } }
        ]
      };
    }
  }

  Offer.find(queryObj)
    .sort({ createdAt: 1 })
    .limit(limit)
    .populate('creator')
    .then((filteredOffers) => {
      if (!filteredOffers || filteredOffers.length === 0) {
        res.render('offer-filtered');
      } else {
        if (req.query.genres) {
          if (req.query.genres.includes('Installation')) {
            filteredOffers[0].installation = true;
          }
          if (req.query.genres.includes('Painting')) {
            filteredOffers[0].painting = true;
          }
          if (req.query.genres.includes('Media')) {
            filteredOffers[0].media = true;
          }
          if (req.query.genres.includes('Photography')) {
            filteredOffers[0].photography = true;
          }
          if (req.query.genres.includes('Ceramics')) {
            filteredOffers[0].ceramics = true;
          }
          if (req.query.genres.includes('Performing Arts')) {
            filteredOffers[0].performingArts = true;
          }
          if (req.query.genres.includes('Architecture')) {
            filteredOffers[0].architecture = true;
          }
          if (req.query.genres.includes('Graphics')) {
            filteredOffers[0].graphics = true;
          }
          if (req.query.genres.includes('Other')) {
            filteredOffers[0].Other = true;
          }
        }
        if (req.query.materials) {
          if (req.query.materials.includes('wood')) {
            filteredOffers[0].wood = true;
          }
          if (req.query.materials.includes('metal')) {
            filteredOffers[0].metal = true;
          }
          if (req.query.materials.includes('plastic')) {
            filteredOffers[0].plastic = true;
          }
          if (req.query.materials.includes('paper / cardboard')) {
            filteredOffers[0].paper = true;
          }
          if (req.query.materials.includes('pens / brushes')) {
            filteredOffers[0].pens = true;
          }
          if (req.query.materials.includes('paints')) {
            filteredOffers[0].paints = true;
          }
          if (req.query.materials.includes('textile')) {
            filteredOffers[0].textile = true;
          }
          if (req.query.materials.includes('stone / building materials')) {
            filteredOffers[0].stone = true;
          }
          if (req.query.materials.includes('moulding / casting')) {
            filteredOffers[0].moulding = true;
          }
          if (req.query.materials.includes('tools')) {
            filteredOffers[0].tools = true;
          }
          if (req.query.materials.includes('technical equipment')) {
            filteredOffers[0].technicalEquipment = true;
          }
          if (req.query.materials.includes('studio furniture')) {
            filteredOffers[0].studioFurniture = true;
          }
          if (req.query.materials.includes('other')) {
            filteredOffers[0].other = true;
          }
        }
        res.render('offer-filtered', { filteredOffers });
      }
    })
    .catch((error) => {
      next(error);
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
      .populate('creator')
      .then((filteredOffers) => {
        res.render('offer-filtered', { filteredOffers });
      });
  } else {
    // if there was no query before OR a category query
    Offer.find(queryObj)
      // fetches all documents with former queryObj and sort by price (lowest first)
      .sort({ price: 1 })
      .limit(limit)
      .populate('creator')
      .then((filteredOffers) => {
        res.render('offer-filtered', { filteredOffers });
      });
  }
});

router.get('/offer-sorted-descending-price', (req, res, next) => {
  const limit = 30;
  console.log(req.query.genres);
  if (
    !(Object.keys(searchObj).length === 0 && searchObj.constructor === Object)
  ) {
    Offer.find(searchObj)
      .sort({ price: -1 })
      .limit(limit)
      .populate('creator')
      .then((filteredOffers) => {
        res.render('offer-filtered', { filteredOffers });
      });
  } else {
    Offer.find(queryObj)
      .sort({ price: -1 })
      .limit(limit)
      .populate('creator')
      .then((filteredOffers) => {
        res.render('offer-filtered', { filteredOffers });
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
      .populate('creator')
      .then((filteredOffers) => {
        res.render('offer-filtered', { filteredOffers, searchObj });
      });
  } else {
    Offer.find(queryObj)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('creator')
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
      .populate('creator')
      .then((filteredOffers) => {
        res.render('offer-filtered', { filteredOffers, searchObj });
      });
  } else {
    Offer.find(queryObj)
      .sort({ createdAt: 1 })
      .limit(limit)
      .populate('creator')
      .then((filteredOffers) => {
        res.render('offer-filtered', { filteredOffers, queryObj });
      });
  }
});

router.get('/offer-filtered/date', (req, res, next) => {
  let limit = 30;
  searchObj = {};
  //checks if user is loged in, if yes: filters out user's results
  if (req.user) {
    if (!req.query.genres && !req.query.materials) {
      queryObj = { creator: { $ne: { _id: req.user.id } } };
    } else if (!req.query.genres) {
      queryObj = {
        $and: [
          { creator: { $ne: { _id: req.user.id } } },
          { materials: { $in: req.query.materials } }
        ]
      };
    } else if (!req.query.materials) {
      queryObj = {
        $and: [
          { creator: { $ne: { _id: req.user.id } } },
          { genres: { $in: req.query.genres } }
        ]
      };
    } else {
      queryObj = {
        $and: [
          { creator: { $ne: { _id: req.user.id } } },
          {
            $or: [
              { genres: { $in: req.query.genres } },
              { materials: { $in: req.query.materials } }
            ]
          }
        ]
      };
    }
  } else {
    if (!req.query.genres && !req.query.materials) {
      queryObj = {};
    } else if (!req.query.genres) {
      queryObj = { materials: { $in: req.query.materials } };
    } else if (!req.query.materials) {
      queryObj = { genres: { $in: req.query.genres } };
    } else {
      queryObj = {
        $or: [
          { genres: { $in: req.query.genres } },
          { materials: { $in: req.query.materials } }
        ]
      };
    }
  }

  Offer.find(queryObj)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('creator')
    .then((filteredOffers) => {
      if (!filteredOffers || filteredOffers.length === 0) {
        res.render('offer-filtered');
      } else {
        if (req.query.genres) {
          if (req.query.genres.includes('Installation')) {
            filteredOffers[0].installation = true;
          }
          if (req.query.genres.includes('Painting')) {
            filteredOffers[0].painting = true;
          }
          if (req.query.genres.includes('Media')) {
            filteredOffers[0].media = true;
          }
          if (req.query.genres.includes('Photography')) {
            filteredOffers[0].photography = true;
          }
          if (req.query.genres.includes('Ceramics')) {
            filteredOffers[0].ceramics = true;
          }
          if (req.query.genres.includes('Performing Arts')) {
            filteredOffers[0].performingArts = true;
          }
          if (req.query.genres.includes('Architecture')) {
            filteredOffers[0].architecture = true;
          }
          if (req.query.genres.includes('Graphics')) {
            filteredOffers[0].graphics = true;
          }
          if (req.query.genres.includes('Other')) {
            filteredOffers[0].Other = true;
          }
        }
        if (req.query.materials) {
          if (req.query.materials.includes('wood')) {
            filteredOffers[0].wood = true;
          }
          if (req.query.materials.includes('metal')) {
            filteredOffers[0].metal = true;
          }
          if (req.query.materials.includes('plastic')) {
            filteredOffers[0].plastic = true;
          }
          if (req.query.materials.includes('paper / cardboard')) {
            filteredOffers[0].paper = true;
          }
          if (req.query.materials.includes('pens / brushes')) {
            filteredOffers[0].pens = true;
          }
          if (req.query.materials.includes('paints')) {
            filteredOffers[0].paints = true;
          }
          if (req.query.materials.includes('textile')) {
            filteredOffers[0].textile = true;
          }
          if (req.query.materials.includes('stone / building materials')) {
            filteredOffers[0].stone = true;
          }
          if (req.query.materials.includes('moulding / casting')) {
            filteredOffers[0].moulding = true;
          }
          if (req.query.materials.includes('tools')) {
            filteredOffers[0].tools = true;
          }
          if (req.query.materials.includes('technical equipment')) {
            filteredOffers[0].technicalEquipment = true;
          }
          if (req.query.materials.includes('studio furniture')) {
            filteredOffers[0].studioFurniture = true;
          }
          if (req.query.materials.includes('other')) {
            filteredOffers[0].other = true;
          }
        }
        res.render('offer-filtered', { filteredOffers });
      }
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/:id/offer-email', (req, res, next) => {
  const offerId = req.params.id;
  Offer.findById(offerId)
    .populate('creator')
    .then((offer) => {
      res.render('offer-email', { offerId, offer });
    })
    .catch((error) => {
      next(error);
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

router.get('/:id/edit', routeGuard, (req, res, next) => {
  const { id } = req.params;
  Offer.findOne({ _id: id, creator: req.user._id })
    .then((offer) => {
      if (!offer) {
        throw new Error('OFFER_NOT_FOUND');
      } else {
        if (offer.genres.includes('Installation')) {
          offer.installation = true;
        }
        if (offer.genres.includes('Painting')) {
          offer.painting = true;
        }
        if (offer.genres.includes('Media')) {
          offer.media = true;
        }
        if (offer.genres.includes('Photography')) {
          offer.photography = true;
        }
        if (offer.genres.includes('Ceramics')) {
          offer.ceramics = true;
        }
        if (offer.genres.includes('Performing Arts')) {
          offer.performingArts = true;
        }
        if (offer.genres.includes('Architecture')) {
          offer.architecture = true;
        }
        if (offer.genres.includes('Graphics')) {
          offer.graphics = true;
        }
        if (offer.genres.includes('Other')) {
          offer.Other = true;
        }

        if (offer.materials.includes('wood')) {
          offer.wood = true;
        }
        if (offer.materials.includes('metal')) {
          offer.metal = true;
        }
        if (offer.materials.includes('plastic')) {
          offer.plastic = true;
        }
        if (offer.materials.includes('paper / cardboard')) {
          offer.paper = true;
        }
        if (offer.materials.includes('pens / brushes')) {
          offer.pens = true;
        }
        if (offer.materials.includes('paints')) {
          offer.paints = true;
        }
        if (offer.materials.includes('textile')) {
          offer.textile = true;
        }
        if (offer.materials.includes('stone / building materials')) {
          offer.stone = true;
        }
        if (offer.materials.includes('moulding / casting')) {
          offer.moulding = true;
        }
        if (offer.materials.includes('tools')) {
          offer.tools = true;
        }
        if (offer.materials.includes('technical equipment')) {
          offer.technicalEquipment = true;
        }
        if (offer.materials.includes('studio furniture')) {
          offer.studioFurniture = true;
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
  fileUploader.array('picture', 3),
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

    const files = req.files;
    console.log(files);
    const paths = req.files.map((eachFile) => eachFile.path);
    console.log(paths);

    Offer.create({
      title,
      creator: req.user._id,
      description,
      picture: paths,
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

router.post('/:id/offer-email', routeGuard, (req, res, next) => {
  const offerId = req.params.id;
  Offer.findById(offerId)
    .populate('creator')
    ///EMAIL Client down therefore no redirection to email-feedback
    .then((offer) => {
      console.log(
        `Hi ${offer.creator.name}! ${req.user.name} is interested in ${offer.title}. This is ${req.user.name}'s message:  ${req.body.text} Respond to this message via ${req.user.name}'s email address: ${req.user.email}. Check out our inspiring artists at waste-mgmt's project space and the latest offers on waste-mgmt.art. We are hiring: Fullstack Developers please contact us via hiring@waste-mgmt.info. Good luck with your deals! Your waste-mgmt team 🔫`
      );
    })
    /* 
      //console.log(offer.creator.email)
      transporter
        .sendMail({
          from: `"User01" ${process.env.EMAIL}`,
          to: offer.creator.email,
          subject: `waste-mgmt: ${req.user.name} is interested in your offer`,
          text: `Hi ${offer.creator.name}! ${req.user.name} is interested in ${offer.title}. This is ${req.user.name}'s message:  ${req.body.text} Respond to this message via ${req.user.name}'s email address: ${req.user.email}. Check out our inspiring artists at waste-mgmt's project space and the latest offers on waste-mgmt.art. We are hiring: Fullstack Developers please contact us via hiring@waste-mgmt.info. Good luck with your dealz 🔫 Your waste-mgmt team`,
          html: `Hi ${offer.creator.name}! <br>
  ${req.user.name} is interested in <i>${offer.title}</i>. This is ${req.user.name}'s message: <br>
  ${req.body.text} <br>
  Respond to this message via ${req.user.name}'s email address: ${req.user.email}. <br>
  Check out our inspiring artists at waste-mgmt's <a href="waste-mgmt.art"><b>project space</b></a> and the <a href="waste-mgmt.art"><b>latest offers</b></a>. <br>
  We are hiring: Fullstack Developers please contact us via hiring@waste-mgmt.info 
  <br>Good luck with your dealz 🔫<br>
  Your waste-mgmt team`
        }) 
        */
    .then(() => {
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
      res.redirect('/offer/offer-suggestions');
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = router;
