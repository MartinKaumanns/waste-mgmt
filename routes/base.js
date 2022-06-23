'use strict';

const express = require('express');
const router = express.Router();
const routeGuard = require('./../middleware/route-guard');
const Offer = require('./../models/offer');
const Project = require('./../models/project');
const fileUploader = require('../cloudinary.config.js');

router.get('/', fileUploader.array('picture', 5), (req, res, next) => {
  let offers;

  Offer.find({ completed: false })
    .sort({ createdAt: -1 })
    .limit(4)
    .populate('creator')
    .then((foundOffers) => {
      offers = foundOffers;
      return Project.find().sort({ createdAt: 1 }).populate('creator'); // for project space: fetches docs from the projects collection - oldest first (as array)
    })
    .then((projects) => {
      let project = projects[0]; // takes oldest doc
      res.render('home', { offers, project, title: 'waste mgmt' });
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/project-space', (req, res, next) => {
  Project.find()
    .sort({ createdAt: 1 })
    .populate('creator') // for project space: fetches docs from the projects collection - oldest first (as array)
    .then((projects) => {
      let project = projects[0]; // takes oldest doc
      res.render('project-space', { project });
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/project-space/create', (req, res) => {
  if (req.user) {
    res.render('project-create');
  } else {
    res.redirect('/authentication/sign-in');
  }
});

router.post(
  '/project-space/create',
  routeGuard,
  fileUploader.array('picture', 5),
  (req, res, next) => {
    const { title, description, picture, genres, materials } = req.body;

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

    Project.create({
      title,
      creator: req.user._id,
      web: req.user.web,
      insta: req.user.insta,
      description,
      picture: paths,
      genres,
      materials
    })
      .then((project) => {
        res.render('project-feedback', { project });
      })
      .catch((error) => {
        next(error);
      });
  }
);

module.exports = router;
