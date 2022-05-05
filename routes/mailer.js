'use strict';
const { Router } = require('express');
const routeGuard = require('../middleware/route-guard');

const { render } = require('../app');
const router = new Router();

const User = require('./../models/user');
const Offer = require('./../models/offer');

const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASSWORD
  }
});

module.exports = router;
