'use strict';

const { Router } = require('express');
const routeGuard = require('../middleware/route-guard');
const bcryptjs = require('bcryptjs');
const Offer = require('./../models/offer');
const fileUploader = require('../cloudinary.config.js');
const { render } = require('../app');

const router = new Router();

let queryObj;
let searchObj;

router.get('/create', (req, res) => {
  res.render('offer-create');
});

router.get('/offer-suggestions', (req, res, next) => {
  let limit = 30;
  // if(req.user) {
  //   let offerOfMyGenre = [];
  //   let genresArray = req.user.genres;
  //   for (let i=0 ; i< genresArray.length; i++) {
  //     //console.log(genresArray[i])
  //     Offer.find({ genres: genresArray[i] }).sort({ createdAt : -1})
  //     .then((genreOffers) => {
  //       offerOfMyGenre = offerOfMyGenre.concat(genreOffers)
  //     })
  //     .then(()=>{
  //       limit = limit - offerOfMyGenre.length
  //       console.log('Limit = ' + limit)
  //       console.log(offerOfMyGenre)
  //       return Offer.find().sort({ createdAt : -1}).limit(limit)
  //     .then((offersRest) => {
  //       let allOffers = offersOfMyGenre.concat(offersRest)
  //       res.render('offer-suggestions', { allOffers });
  //     });
  //     })
  //   }
  // } else {
  Offer.find()
    .sort({ createdAt: -1 })
    .limit(limit) // filter own offers out
    .then((offers) => {
      res.render('offer-suggestions', { offers });
    });
  // }
});

router.get('/offer-search', (req, res, next) => {
  const limit = 30;
  const searchTerm = req.query.searchfield;
  queryObj = {};
  searchObj = {
    $or: [
      { title: { $regex: searchTerm } },
      { description: { $regex: searchTerm } },
      { genres: { $regex: searchTerm } },
      { materials: { $regex: searchTerm } }
    ]
  };
  Offer.find(searchObj)
  .sort({ createdAt: -1 })
  .limit(limit)
  .then((filteredOffers) => {
    res.render('offer-filtered', { filteredOffers, searchObj });
  });
});

router.get('/offer-sorted-price', (req, res, next) => {
  const limit = 30;
  if(!(Object.keys(searchObj).length === 0 && searchObj.constructor === Object)) {
    Offer.find(searchObj)
  .sort({ price: 1 })
  .limit(limit)
  .then((filteredOffers) => {
    res.render('offer-filtered', { filteredOffers, searchObj });
  });
  } else {
    Offer.find(queryObj)
    .sort({ price: 1 })
    .limit(limit)
    .then((filteredOffers) => {
      res.render('offer-filtered', { filteredOffers, queryObj});
    })
  }   
})

router.get('/offer-sorted-descending-price', (req, res, next) => {
  const limit = 30;
  if(!(Object.keys(searchObj).length === 0 && searchObj.constructor === Object)) {
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
      res.render('offer-filtered', { filteredOffers, queryObj});
    })
  }   
})

router.get('/offer-sorted-date', (req, res, next) => {
  const limit = 30;
  if(!(Object.keys(searchObj).length === 0 && searchObj.constructor === Object)) {
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
      res.render('offer-filtered', { filteredOffers, queryObj});
    })
  }   
})

router.get('/offer-sorted-oldest-date', (req, res, next) => {
  const limit = 30;
  if(!(Object.keys(searchObj).length === 0 && searchObj.constructor === Object)) {
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
      res.render('offer-filtered', { filteredOffers, queryObj});
    })
  }   
})



router.get('/offer-filtered', (req, res, next) => {
  let limit = 30;
  // if (!req.query.genres && !req.query.materials) {
  //   Offer.find()
  //     .sort({ createdAt: -1 })
  //     .limit(limit)
  //     .then((filteredOffers) => {
  //       console.log('offer', filteredOffers);
  //       res.render('offer-filtered', { filteredOffers });
  //     });
  // } else if (!req.query.genres) {
  //   query.materialsSearch = req.query.materials
  //   Offer.find({
  //     materials: { $in: req.query.materials }
  //   })
  //     .sort({ createdAt: -1 })
  //     .limit(limit)
  //     .then((filteredOffers) => {
  //       console.log('offer', filteredOffers);
  //       res.render('offer-filtered', { filteredOffers });
  //     });
  // } else if (!req.query.materials) {
  //   query.genresSearch = req.query.genres
  //   Offer.find({
  //     genres: { $in: req.query.genres }
  //   })
  //     .sort({ createdAt: -1 })
  //     .limit(limit)
  //     .then((filteredOffers) => {
  //       console.log('offer', filteredOffers);
  //       res.render('offer-filtered', { filteredOffers });
  //     });
  // } else {
  //   query.genresSearch = req.query.genres
  //   query.materialsSearch = req.query.materials
  //   Offer.find({
  //     $and: [
  //       { genres: { $in: req.query.genres } },
  //       { materials: { $in: req.query.materials } }
  //     ]
  //   })
  //     .sort({ createdAt: -1 })
  //     .limit(limit)
  //     .then((filteredOffers) => {
  //       console.log(query)
  //       console.log('offer', filteredOffers);
  //       res.render('offer-filtered', { filteredOffers, query });
  //     });
  // }
  searchObj = {};
  if (!req.query.genres && !req.query.materials) {
    queryObj = {}
  } else if (!req.query.genres) {
    queryObj = { materials: { $in: req.query.materials }}
  } else if (!req.query.materials) {
    queryObj = { genres: { $in: req.query.genres }}
  } else {
    queryObj = {
      $and: [
        { genres: { $in: req.query.genres } },
        { materials: { $in: req.query.materials } }
      ]}
  }

  Offer.find(queryObj)
    .sort({ createdAt: -1 })
    .limit(limit)
    .then((filteredOffers) => {
      res.render('offer-filtered', { filteredOffers, queryObj});
    })
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
