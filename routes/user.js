const express = require("express");

const {
  create,
  verifyEmail,
  resendEmailVerificationToken,
  forgetPassword,
  sendResetPasswordTokenStatus,
  resetPassword,
  signIn,
} = require("../controllers/user");

const {
  userValidator,
  validate,
  validatePassword,
  signInvalidator,
} = require("../middlewares/validators");
const { isValidPassResetToken } = require("../middlewares/user");
const router = express.Router();

router.post("/create", userValidator, validate, create);
router.post("/signIn", signInvalidator, validate, signIn);
router.post("/verify-email", verifyEmail);
router.post("/resend-email-verification-token", resendEmailVerificationToken);
router.post("/forget-password", forgetPassword);
router.post(
  "/verify-pass-reset-token",
  isValidPassResetToken,
  sendResetPasswordTokenStatus
);
router.post(
  "/reset-password",
  validatePassword,
  validate,
  isValidPassResetToken,
  resetPassword
);

module.exports = router;
