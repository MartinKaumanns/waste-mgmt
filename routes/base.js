'use strict';

const express = require('express');
const router = express.Router();
const routeGuard = require('./../middleware/route-guard');
const Offer = require('./../models/offer');
const Project = require('./../models/project');
const fileUploader = require('../cloudinary.config.js');

router.get('/',  fileUploader.array('picture', 5), (req, res, next) => {

/// dev version: creating a new project for the project space

  // let paths = [
  //   'https://res.cloudinary.com/dnfnzba4r/image/upload/v1652182009/waste-mgmt/gmwwqqawhwesckggzugd.jpg',
  //   'https://res.cloudinary.com/dnfnzba4r/image/upload/v1652182008/waste-mgmt/iysubhlnuvgnmeoj3kzr.jpg',
  //   'https://res.cloudinary.com/dnfnzba4r/image/upload/v1652182009/waste-mgmt/arrph6luvmbmckyroihn.jpg'
  // ]

  // let description= 'Alice Hauck and Amelie Plümpe have been working as a sculpting duo in Berlin since 2018. Their work extends into painting and installation, using sculptural techniques and design directions from architecture, industry, and urban planning. Microarchitectures, street furniture, building fragments, symbols in public space and what surrounds everyday life form the basis of their work.';

  // Project.create({
  //   title: 'serialized',
  //   creator: '627a4efdacfd4d5071c870e9',
  //   insta: 'https://www.instagram.com/hauck_pluempe/',
  //   web: 'https://hauck-pluempe.de/',
  //   description,
  //   picture: paths,
  //   genres: ['Installation', 'Ceramics'],
  //   materials: ['wood',
  //   'metal',
  //   'moulding / casting',
  //   'other']
  // })
  let offers;

  Offer.find()
    .sort({ createdAt: -1 })
    .limit(4)
    .populate('creator')
    .then((foundOffers) => {
      offers=foundOffers;
      return Project.find().sort({createdAt: 1}).populate('creator') // for project space: fetches docs from the projects collection - oldest first (as array)
    })
    .then((projects)=> {
      let project= projects[0] // takes oldest doc
      res.render('home', { offers, project, title: 'waste mgmt' });
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/project-space', (req, res, next) => {
   Project.find().sort({createdAt: 1}).populate('creator') // for project space: fetches docs from the projects collection - oldest first (as array)
  .then((projects)=> {
    let project = projects[0] // takes oldest doc
    res.render('project-space', { project });
  })
  .catch((error) => {
    next(error);
  });
})


module.exports = router;
