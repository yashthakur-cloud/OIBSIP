const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const clientUrl = () => (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[character]));

async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: await bcrypt.hash(password, 10),
      verificationToken,
    });

    try {
      await sendEmail({
        to: user.email,
        subject: 'Verify your PizzaCraft account',
        html: `<p>Welcome to PizzaCraft, ${escapeHtml(user.name)}.</p><p><a href="${clientUrl()}/verify-email/${verificationToken}">Verify your email address</a></p>`,
        text: `Welcome to PizzaCraft, ${user.name}. Verify your email: ${clientUrl()}/verify-email/${verificationToken}`,
      });
    } catch (error) {
      // Keep the unverified account so the user can request another email from Login.
      return res.status(503).json({
        message: 'Your account was created, but the verification email could not be sent. Sign in to request a new verification email.',
      });
    }

    res.status(201).json({ message: 'Registration successful. Check your email to verify your account.' });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
}

async function verifyEmail(req, res) {
  try {
    const verificationTokenHash = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) {
      const previouslyVerifiedUser = await User.findOne({
        verifiedVerificationTokenHash: verificationTokenHash,
        isVerified: true,
      });
      if (previouslyVerifiedUser) {
        return res.json({ message: 'Your email is already verified. You can continue to login.' });
      }
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    user.isVerified = true;
    user.verifiedVerificationTokenHash = verificationTokenHash;
    user.verificationToken = undefined;
    await user.save();
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Email verification failed', error: error.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in' });
    }

    const token = jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
}

async function forgotPassword(req, res) {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    await sendEmail({
      to: user.email,
      subject: 'Reset your PizzaCraft password',
      html: `<p><a href="${clientUrl()}/reset-password/${resetToken}">Reset your password</a></p><p>This link expires in 15 minutes.</p>`,
    });
    res.json({ message: 'Password reset link sent' });
  } catch (error) {
    res.status(500).json({ message: 'Could not send password reset link', error: error.message });
  }
}

async function resendVerification(req, res) {
  try {
    if (!req.body.email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    const previousVerificationToken = user.verificationToken;
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();
    try {
      await sendEmail({
        to: user.email,
        subject: 'Verify your PizzaCraft account',
        html: `<p>Welcome to PizzaCraft, ${escapeHtml(user.name)}.</p><p><a href="${clientUrl()}/verify-email/${verificationToken}">Verify your email address</a></p>`,
        text: `Welcome to PizzaCraft, ${user.name}. Verify your email: ${clientUrl()}/verify-email/${verificationToken}`,
      });
    } catch (error) {
      user.verificationToken = previousVerificationToken;
      await user.save();
      return res.status(503).json({ message: 'Could not send verification email. Please try again.' });
    }
    res.json({ message: 'Verification email sent. Please check your inbox.' });
  } catch (error) {
    res.status(500).json({ message: 'Could not send verification email', error: error.message });
  }
}

async function resetPassword(req, res) {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpire: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Password reset failed', error: error.message });
  }
}

module.exports = { register, verifyEmail, login, forgotPassword, resendVerification, resetPassword };
