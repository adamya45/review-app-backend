const { isValidObjectId } = require("mongoose");
const emailVerificationToken = require("../models/emailVerificationToken");
const User = require("../models/user");
const crypto = require("crypto");
const { generateOTP, generateMailTransporter } = require("../utils/mails");
const { sendError, generateRandomByte } = require("../utils/helper");
const passwordResetToken = require("../models/passwordResetToken");

exports.create = async (req, res) => {
  const { name, email, password } = req.body;

  const oldUser = await User.findOne({ email });
  if (oldUser) return sendError(res, "This email is already registered!");

  const newUser = new User({ name, email, password });
  await newUser.save();

  //generate 6 digit OTP
  let OTP = generateOTP;

  //store otp inside our db
  const newEmailVerificationToken = new emailVerificationToken({
    owner: newUser._id,
    token: OTP,
  });

  await newEmailVerificationToken.save();

  //send that OTP to our user
  var transport = generateMailTransporter();

  transport.sendMail({
    from: "verification@popcornperspective.com",
    to: newUser.email,
    subject: "Email Verification",
    html: `
    <p>Hi ${newUser.name} your 6-digit verification OTP is </p>
    <h1>${OTP}</h1>
    `,
  });

  res.status(201).json({
    message:
      "Please verify your email. OTP has been sent to your email account",
  });
};

exports.verifyEmail = async (req, res) => {
  const { userId, OTP } = req.body;

  if (!isValidObjectId(userId)) return res.json({ error: "Invalid user!" });

  const user = await User.findById(userId);
  if (!user) return sendError(res, "user not found!", 404);

  if (user.isVerified) return sendError(res, "user is already verified!");

  const token = await emailVerificationToken.findOne({ owner: userId });
  if (!token) return sendError(res, "token not found");

  const isMatch = await token.compareToken(OTP);
  if (!isMatch) return sendError(res, "Please submit a  valid OTP");

  user.isVerified = true;
  await user.save();

  await emailVerificationToken.findByIdAndDelete(token._id);

  var transport = generateMailTransporter();

  transport.sendMail({
    from: "verification@popcornperspective.com",
    to: user.email,
    subject: "Welcome Email",
    html: `
    <h1>Welcome ${user.name} to Popcorn Perspective, thanks for choosing us.</h1>
    `,
  });

  res.status(200).json({ message: "Email verified successfully!" });
};

exports.resendEmailVerificationToken = async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(userId);
  if (!user) return sendError(res, "user not found", 404);

  if (user.isVerified) return sendError(res, "This email is already verified!");

  const alreadyHasToken = await emailVerificationToken.findOne({
    owner: userId,
  });
  if (alreadyHasToken)
    return sendError(
      res,
      "Only after one hour you can request for another token"
    );

  //generate 6 digit OTP
  let OTP = generateOTP();
  //store otp inside our db
  const newEmailVerificationToken = new emailVerificationToken({
    owner: user._id,
    token: OTP,
  });

  await newEmailVerificationToken.save();

  //send that OTP to our user
  var transport = generateMailTransporter();

  transport.sendMail({
    from: "verification@popcornperspective.com",
    to: user.email,
    subject: "Email Verification",
    html: `
      <p>Your 6-digit verification OTP is </p>
      <h1>${OTP}</h1>
      `,
  });

  res.json({ message: "New OTP has been sent to your registered acount!" });
};

exports.forgetPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return sendError(res, "email is missing!");

  const user = await User.findOne({ email });
  if (!user) return sendError(res, "User not found!", 404);

  const alreadyHasToken = await passwordResetToken.findOne({ owner: user._id });
  if (alreadyHasToken)
    return sendError(
      res,
      "Only after one hour you can request for another token"
    );

  const token = await generateRandomByte();
  const newPasswordResetToken = await passwordResetToken({
    owner: user._id,
    token,
  });
  await newPasswordResetToken.save();

  const resetPasswordUrl = 
    `http://localhost:3000/reset-password?token=${token}&id=${user._id}`;

  var transport = generateMailTransporter();

  transport.sendMail({
    from: "security@popcornperspective.com",
    to: user.email,
    subject: "Reset Password Link",
    html: `
      <p>Click here to reset your password</p>
      <a href='${resetPasswordUrl}'>Change Password</a>
      `,
  });

  res.json({message: 'Link sent to your email!'})
};
