const nodemailer = require('nodemailer');
require('dotenv').config({ path: './.env' });

console.log('Host:', process.env.SMTP_HOST);
console.log('Port:', process.env.SMTP_PORT);
console.log('User:', process.env.SMTP_USER);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  family: 4,
});

async function main() {
  try {
    const info = await transporter.sendMail({
      from: `"Ugrachandi" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: 'Test OTP verification',
      html: '<p>Your test OTP is <b>123456</b></p>',
    });
    console.log('SUCCESS:', info);
  } catch (err) {
    console.error('ERROR SENDING MAIL:', err);
  }
}

main();
