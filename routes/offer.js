'use strict';

const { Router } = require('express');

const bcryptjs = require('bcryptjs');
const User = require('./../models/user');
const fileUploader = require('../cloudinary.config.js');

const router = new Router();

router.get('/create', (req, res) => {
    res.render('offer-create')
})

// router.post('/create', fileUploader.single('picture'), (req, res, next) => {
//     const { name, email, password, picture, genres, location } = req.body;
//     bcryptjs
//       .hash(password, 10)
//       .then((hash) => {
//         return User.create({
//           name,
//           email,
//           picture: req.file.path,
//           genres,
//           location,
//           passwordHashAndSalt: hash
//           /* April 28: New user specifications */
//         });
//       })
//       .then((user) => {
//         console.log(user);
//         req.session.userId = user._id;
//         res.redirect('/private');
//       })
//       .catch((error) => {
//         next(error);
//       });
//   });
  

module.exports = router;