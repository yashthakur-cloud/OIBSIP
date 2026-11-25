const express = require('express');
const {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resendVerification,
  resetPassword,
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.get('/verify/:token', verifyEmail);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/resend-verification', resendVerification);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
