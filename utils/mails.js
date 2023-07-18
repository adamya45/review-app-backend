const nodemailer = require("nodemailer");

exports.generateOTP = (otp_len = 6) => {
  //generate 6 digit OTP
  let OTP = "";
  for (let i = 0; i < otp_len; i++) {
    OTP += Math.round(Math.random() * 9);
  }
  return OTP;
};

exports.generateMailTransporter = () =>
  nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.MAIL_TRAP_USER,
      pass: process.env.MAIL_TRAP_PASS,
    },
  });
