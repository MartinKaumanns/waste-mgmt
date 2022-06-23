'use strict';

const { Router } = require('express');
const routeGuard = require('../middleware/route-guard');
const Offer = require('./../models/offer');
const fileUploader = require('../cloudinary.config.js');

const router = new Router();

const GenresMap = {
  Installation: 'installation',
  Painting: 'painting',
  Media: 'media',
  Photography: 'photography',
  Ceramics: 'ceramics',
  'Performing Arts': 'performingArts',
  Architecture: 'architecture',
  Graphics: 'graphics',
  Other: 'Other'
};

const MaterialsMap = {
  wood: 'wood',
  metal: 'metal',
  plastic: 'plastic',
  'paper / cardboard': 'paper',
  'pens / brushes': 'pens',
  paints: 'paints',
  textile: 'textile',
  'stone / building materials': 'stone',
  'moulding / casting': 'moulding',
  tools: 'tools',
  'technical equipment': 'technicalEquipment',
  'studio furniture': 'studioFurniture',
  other: 'other'
};

const filterGathererMiddleware = (req, res, next) => {
  const filters = {};
  const { genres, materials } = req.query;
  if (genres) {
    for (let key in GenresMap) {
      const value = GenresMap[key];
      filters[value] = genres.includes(key);
    }
  }
  if (materials) {
    for (let key in MaterialsMap) {
      const value = MaterialsMap[key];
      filters[value] = materials.includes(key);
    }
  }
  console.log(filters);
  res.locals.filters = filters;
  next();
};

router.get('/create', (req, res) => {
  res.render('offer-create');
});

router.get('/category-megamenu', (req, res) => {
  console.log('hello');
  res.render('category-megamenu');
});

router.get('/search-megasearch', (req, res) => {
  res.render('search-megasearch');
});

router.get('/offer-suggestions', (req, res, next) => {
  let limit = 30;
  // checks if user is logged in
  if (req.user) {
    // searchs for all offers which contain the user's genre category
    // filters out own offers
    Offer.find({
      $and: [
        { completed: false },
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
              { completed: false },
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
    Offer.find({ completed: false })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('creator')
      .then((offers) => {
        res.render('offer-suggestions', { offers });
      });
  }
});

/// SEARCH FILTER: SORTING

router.get('/offer-search', (req, res, next) => {
  const limit = 30;
  const searchTerm = req.query.searchfield;
  const { sort } = req.query;
  let searchObj;
  // writes searchObj with search "term", filters out results of user
  if (req.user) {
    searchObj = {
      $and: [
        { completed: false },
        { creator: { $ne: { _id: req.user.id } } },
        { $text: { $search: searchTerm } }
      ]
    };
  } else {
    searchObj = {
      $and: [{ completed: false }, { $text: { $search: searchTerm } }]
    };
  }
  const searchSorting = {};
  switch (sort) {
    case 'price':
      searchSorting.price = 1;
      break;
    case 'price-descending':
      searchSorting.price = -1;
      break;
    case 'date':
      searchSorting.createdAt = 1;
      break;
    case 'date-oldest':
      searchSorting.createdAt = -1;
      break;
  }
  // performs query with searchObj
  Offer.find(searchObj)
    .sort(searchSorting)
    .limit(limit)
    .populate('creator')
    .then((filteredOffers) => {
      res.render('offer-search', { filteredOffers, searchTerm });
    });
});

/// CATEGORY FILTER: SORTING

router.get(
  '/offer-filtered/price',
  filterGathererMiddleware,
  (req, res, next) => {
    let limit = 30;
    let queryObj;
    //checks if user is loged in, if yes: filters out user's results
    if (req.user) {
      if (!req.query.genres && !req.query.materials) {
        queryObj = {
          $and: [
            { creator: { $ne: { _id: req.user.id } } },
            { completed: false }
          ]
        };
      } else if (!req.query.genres) {
        queryObj = {
          $and: [
            { completed: false },
            { creator: { $ne: { _id: req.user.id } } },
            { materials: { $in: req.query.materials } }
          ]
        };
      } else if (!req.query.materials) {
        queryObj = {
          $and: [
            { completed: false },
            { creator: { $ne: { _id: req.user.id } } },
            { genres: { $in: req.query.genres } }
          ]
        };
      } else {
        queryObj = {
          $and: [
            { completed: false },
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
        queryObj = { completed: false };
      } else if (!req.query.genres) {
        queryObj = {
          $and: [
            { materials: { $in: req.query.materials } },
            { completed: false }
          ]
        };
      } else if (!req.query.materials) {
        queryObj = {
          $and: [{ genres: { $in: req.query.genres } }, { completed: false }]
        };
      } else {
        queryObj = {
          $and: [
            {
              $or: [
                { genres: { $in: req.query.genres } },
                { materials: { $in: req.query.materials } }
              ]
            }
          ]
        };
      }
    }

    Offer.find(queryObj)
      .sort({ price: 1 })
      .limit(limit)
      .populate('creator')
      .then((filteredOffers) => {
        if (filteredOffers.length === 0) {
          res.render('offer-filtered');
        } else {
          res.render('offer-filtered', { filteredOffers });
        }
      })
      .catch((error) => {
        next(error);
      });
  }
);

router.get(
  '/offer-filtered/price-descending',
  filterGathererMiddleware,
  (req, res, next) => {
    let limit = 30;
    let queryObj;
    //checks if user is loged in, if yes: filters out user's results
    if (req.user) {
      if (!req.query.genres && !req.query.materials) {
        queryObj = {
          $and: [
            { completed: false },
            { creator: { $ne: { _id: req.user.id } } }
          ]
        };
      } else if (!req.query.genres) {
        queryObj = {
          $and: [
            { completed: false },
            { creator: { $ne: { _id: req.user.id } } },
            { materials: { $in: req.query.materials } }
          ]
        };
      } else if (!req.query.materials) {
        queryObj = {
          $and: [
            { completed: false },
            { creator: { $ne: { _id: req.user.id } } },
            { genres: { $in: req.query.genres } }
          ]
        };
      } else {
        queryObj = {
          $and: [
            { creator: { $ne: { _id: req.user.id } } },
            { completed: false },
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
        queryObj = { completed: false };
      } else if (!req.query.genres) {
        queryObj = {
          $and: [
            { materials: { $in: req.query.materials } },
            { completed: false }
          ]
        };
      } else if (!req.query.materials) {
        queryObj = {
          $and: [{ genres: { $in: req.query.genres } }, { completed: false }]
        };
      } else {
        queryObj = {
          $and: [
            { completed: false },
            {
              $or: [
                { genres: { $in: req.query.genres } },
                { materials: { $in: req.query.materials } }
              ]
            }
          ]
        };
      }
    }

    Offer.find(queryObj)
      .sort({ price: -1 })
      .limit(limit)
      .populate('creator')
      .then((filteredOffers) => {
        if (filteredOffers.length === 0) {
          res.render('offer-filtered');
        } else {
          res.render('offer-filtered', { filteredOffers });
        }
      })
      .catch((error) => {
        next(error);
      });
  }
);

router.get(
  '/offer-filtered/date-oldest',
  filterGathererMiddleware,
  (req, res, next) => {
    let limit = 30;
    let queryObj;
    //checks if user is loged in, if yes: filters out user's results
    if (req.user) {
      if (!req.query.genres && !req.query.materials) {
        queryObj = {
          $and: [
            { completed: false },
            { creator: { $ne: { _id: req.user.id } } }
          ]
        };
      } else if (!req.query.genres) {
        queryObj = {
          $and: [
            { completed: false },
            { creator: { $ne: { _id: req.user.id } } },
            { materials: { $in: req.query.materials } }
          ]
        };
      } else if (!req.query.materials) {
        queryObj = {
          $and: [
            { completed: false },
            { creator: { $ne: { _id: req.user.id } } },
            { genres: { $in: req.query.genres } }
          ]
        };
      } else {
        queryObj = {
          $and: [
            { completed: false },
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
        queryObj = { completed: false };
      } else if (!req.query.genres) {
        queryObj = {
          $and: [
            { materials: { $in: req.query.materials } },
            { completed: false }
          ]
        };
      } else if (!req.query.materials) {
        queryObj = {
          $and: [{ genres: { $in: req.query.genres } }, { completed: false }]
        };
      } else {
        queryObj = {
          $and: [
            { completed: false },
            {
              $or: [
                { genres: { $in: req.query.genres } },
                { materials: { $in: req.query.materials } }
              ]
            }
          ]
        };
      }
    }

    Offer.find(queryObj)
      .sort({ createdAt: 1 })
      .limit(limit)
      .populate('creator')
      .then((filteredOffers) => {
        if (filteredOffers.length === 0) {
          res.render('offer-filtered');
        } else {
          res.render('offer-filtered', { filteredOffers });
        }
      })
      .catch((error) => {
        next(error);
      });
  }
);

router.get(
  '/offer-filtered/date',
  filterGathererMiddleware,
  (req, res, next) => {
    let limit = 30;
    let queryObj;
    //checks if user is loged in, if yes: filters out user's results
    if (req.user) {
      if (!req.query.genres && !req.query.materials) {
        queryObj = {
          $and: [
            { completed: false },
            { creator: { $ne: { _id: req.user.id } } }
          ]
        };
      } else if (!req.query.genres) {
        queryObj = {
          $and: [
            { completed: false },
            { creator: { $ne: { _id: req.user.id } } },
            { materials: { $in: req.query.materials } }
          ]
        };
      } else if (!req.query.materials) {
        queryObj = {
          $and: [
            { completed: false },
            { creator: { $ne: { _id: req.user.id } } },
            { genres: { $in: req.query.genres } }
          ]
        };
      } else {
        queryObj = {
          $and: [
            { completed: false },
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
        queryObj = { completed: false };
      } else if (!req.query.genres) {
        queryObj = {
          $and: [
            { completed: false },
            { materials: { $in: req.query.materials } }
          ]
        };
      } else if (!req.query.materials) {
        queryObj = {
          $and: [{ completed: false }, { genres: { $in: req.query.genres } }]
        };
      } else {
        queryObj = {
          $and: [
            { completed: false },
            {
              $or: [
                { genres: { $in: req.query.genres } },
                { materials: { $in: req.query.materials } }
              ]
            }
          ]
        };
      }
    }

    Offer.find(queryObj)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('creator')
      .then((filteredOffers) => {
        if (filteredOffers.length === 0) {
          res.render('offer-filtered');
        } else {
          const filters = {};
          if (req.query.genres) {
            if (req.query.genres.includes('Installation')) {
              filters.installation = true;
            }
            if (req.query.genres.includes('Painting')) {
              filters.painting = true;
            }
            if (req.query.genres.includes('Media')) {
              filters.media = true;
            }
            if (req.query.genres.includes('Photography')) {
              filters.photography = true;
            }
            if (req.query.genres.includes('Ceramics')) {
              filters.ceramics = true;
            }
            if (req.query.genres.includes('Performing Arts')) {
              filters.performingArts = true;
            }
            if (req.query.genres.includes('Architecture')) {
              filters.architecture = true;
            }
            if (req.query.genres.includes('Graphics')) {
              filters.graphics = true;
            }
            if (req.query.genres.includes('Other')) {
              filters.Other = true;
            }
          }
          if (req.query.materials) {
            if (req.query.materials.includes('wood')) {
              filters.wood = true;
            }
            if (req.query.materials.includes('metal')) {
              filters.metal = true;
            }
            if (req.query.materials.includes('plastic')) {
              filters.plastic = true;
            }
            if (req.query.materials.includes('paper / cardboard')) {
              filters.paper = true;
            }
            if (req.query.materials.includes('pens / brushes')) {
              filters.pens = true;
            }
            if (req.query.materials.includes('paints')) {
              filters.paints = true;
            }
            if (req.query.materials.includes('textile')) {
              filters.textile = true;
            }
            if (req.query.materials.includes('stone / building materials')) {
              filters.stone = true;
            }
            if (req.query.materials.includes('moulding / casting')) {
              filters.moulding = true;
            }
            if (req.query.materials.includes('tools')) {
              filters.tools = true;
            }
            if (req.query.materials.includes('technical equipment')) {
              filters.technicalEquipment = true;
            }
            if (req.query.materials.includes('studio furniture')) {
              filters.studioFurniture = true;
            }
            if (req.query.materials.includes('other')) {
              filters.other = true;
            }
          }
          res.render('offer-filtered', { filteredOffers, filters });
        }
      })
      .catch((error) => {
        next(error);
      });
  }
);

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
  fileUploader.array('picture', 5),
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

    let files = req.files;
    let paths = [];

    /* set default image in case user did not select a file and trims array to max. 5 elements*/
    if (files.length === 0) {
      paths = [
        'https://res.cloudinary.com/dnfnzba4r/image/upload/v1652187504/waste-mgmt/cz5btg6wm6whle7llbfm.png'
      ];
    } else if (files.length > 5) {
      paths = files.map((eachFile) => eachFile.path);
      paths = paths.slice(0, 6);
    } else {
      paths = files.map((eachFile) => eachFile.path);
    }

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

router.post(
  '/:id/edit',
  routeGuard,
  fileUploader.array('picture', 5),
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

    let files = req.files;
    let paths = [];

    /* set default image in case user did not select a file and trims array to max. 5 elements */
    if (files.length === 0) {
      paths = [
        'https://res.cloudinary.com/dnfnzba4r/image/upload/v1652187504/waste-mgmt/cz5btg6wm6whle7llbfm.png'
      ];
    } else if (files.length > 5) {
      paths = files.map((eachFile) => eachFile.path);
      paths = paths.slice(0, 6);
    } else {
      paths = files.map((eachFile) => eachFile.path);
    }

    Offer.findByIdAndUpdate(
      { _id: id, creator: req.user._id },
      {
        title,
        description,
        picture: paths,
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
