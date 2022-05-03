'use strict';

const express = require('express');
const router = express.Router();
const User = require('./../models/user');

router.get('/:id', (req, res, next)  => {
    const { id } = req.params;
    User.findById(id)
      .then((userSingle) => {
        res.render('user', { userSingle });
      })
      .catch((error) => {
        next(error);
      });
  })

  module.exports = router;