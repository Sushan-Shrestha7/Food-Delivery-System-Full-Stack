const nodemailer = require('nodemailer');
require('dotenv').config({ path: './.env' });

const host = process.env.SMTP_HOST || 'smtp.gmail.com';
const port = Number(process.env.SMTP_PORT) || 587;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASSWORD;
const secure = process.env.SMTP_SECURE === 'true' || port === 465;

console.log('--- SMTP Configuration ---');
console.log('Host:', host);
console.log('Port:', port);
console.log('Secure:', secure);
console.log('User:', user);
console.log('Pass configured:', Boolean(pass));

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: {
    user,
    pass,
  },
  family: 4,
});

async function main() {
  try {
    console.log('\nVerifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');

    console.log('Sending test email to:', user);
    const info = await transporter.sendMail({
      from: `"Ugrachandi Food Delivery" <${user}>`,
      to: user,
      subject: 'Test Verification Email - Ugrachandi',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #ff6347;">Ugrachandi Food Delivery</h2>
          <p>This is a test email sent using <b>Nodemailer SMTP</b>.</p>
          <p>Your test OTP code is: <b style="font-size: 20px; color: #ff6347;">123456</b></p>
        </div>
      `,
    });
    console.log('✅ Email sent successfully! Message ID:', info.messageId);
  } catch (err) {
    console.error('❌ Error sending mail:', err);
  }
}

main();
