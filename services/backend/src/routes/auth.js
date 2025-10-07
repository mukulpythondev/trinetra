// src/routes/auth.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Validation middleware
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').matches(/^[0-9]{10}$/).withMessage('Valid 10-digit phone required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginValidation = [
  body('password').notEmpty().withMessage('Password is required')
];

// @route   POST /api/auth/register
router.post('/register', registerValidation, authController.register);

// @route   POST /api/auth/login
router.post('/login', loginValidation, authController.login);

// @route   GET /api/auth/me
router.get('/me', protect, authController.getMe);

// @route   PUT /api/auth/fcm-token
router.put('/fcm-token', protect, authController.updateFCMToken);

// @route   POST /api/auth/logout
router.post('/logout', protect, authController.logout);

module.exports = router;