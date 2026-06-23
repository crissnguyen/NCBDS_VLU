const nodemailer = require('nodemailer');
require('dotenv').config({path: './.env'});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.sendMail({
  from: process.env.SMTP_FROM,
  to: process.env.SMTP_USER,
  subject: "Test Email",
  text: "Hello from local test"
}).then(info => {
  console.log("SUCCESS:", info.messageId);
}).catch(err => {
  console.error("ERROR:", err.message);
});
