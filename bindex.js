//Email Service
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

transporter
  .sendMail({
    from: `"User01" ${process.env.EMAIL}`,
    to: 'wadad94771@chokxus.com', // User email of offerer
    subject: 'Offer',
    text: 'This is a test email',
    html: '<head><style>a:{color: red;}</style></head><body>This is a <a href="https://google.com">test</a>email<body> '
  })
  .then(() => {
    console.log('The email was sent successfully');
  })
  .catch((error) => {
    console.log(error);
  });

/// Profile pic
//scss
/*   nav {
    a,
    button {
      align-items: center;
      display: inline-flex;
    }
  
    img {
      width: 1.5em;
      height: 1.5em;
      border-radius: 50%;
      object-fit: cover;
    }
  } */
// layout.hbs
{
  /* <a href="/user/{{user.id}}"><img
            src="{{user.picture}}"
            alt="{{user.name}}"
          />{{user.name}}'s Profile</a>
        {{!-- <form action="/user/{{ user.id }}">
          <button></button>
        </form> --}} */
}
