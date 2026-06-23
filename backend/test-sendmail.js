const { sendMail } = require('./services/mail/index');

sendMail('duc.2174802010002@vanlanguni.vn', 'Test', 'Hello').then(res => {
  console.log("Result:", res);
  process.exit(0);
});
