//Email Service
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'bridie.langosh68@ethereal.email',
    pass: 'X5wHhr88uRx3X9H3Z8'
  }
});

transporter
  .sendMail({
    to: 'wadad94771@chokxus.com',
    subject: 'Offer',
    text: 'This is a test email'
  })
  .then(() => {
    console.log('The email was sent successfully');
  })
  .catch((error) => {
    console.log(error);
  });

/* 
Name	    Bridie Langosh
Username	bridie.langosh68@ethereal.email (also works as a real inbound email address)
Password	X5wHhr88uRx3X9H3Z8 

*/
