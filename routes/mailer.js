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

router.get('/:id/send-email/', (req, res, next) => {
  const offerId = req.params.id;
  Offer.findById(offerId)
    .populate('creator')
    .then((offer) => {
      res.render('offer-email', { offerId, offer });
    });
});

router.post('/:id/send-email', routeGuard, (req, res, next) => {
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

module.exports = router;
