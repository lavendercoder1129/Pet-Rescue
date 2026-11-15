import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Generate signed JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'dev_secret_key_simulation_jwt',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

/**
 * Configure cookie options
 */
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction, // HTTPS in production
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  };
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new Donor or Rescuer (Admin disallowed publicly)
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, confirmPassword, role } = req.body;

    // 1. Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, and password.',
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    // Password policy: min 8 characters, at least 1 letter and 1 number
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.',
      });
    }

    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one letter and one number.',
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email format.',
      });
    }

    // 2. Strict Role Guard: Public registration can NEVER create an admin
    const normalizedRole = (role || 'donor').toLowerCase();
    if (normalizedRole === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin accounts cannot be registered publicly.',
      });
    }

    if (!['donor', 'rescuer'].includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Account type must be either Donor or Rescuer.',
      });
    }

    // 3. Prevent duplicate email registration
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // 4. Hash password
    const passwordHash = await User.hashPassword(password);

    // 5. Create user
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : '',
      passwordHash,
      role: normalizedRole,
      rescuerVerificationStatus:
        normalizedRole === 'rescuer' ? 'pending' : 'not_applicable',
    });

    // 6. Generate token and set HTTP-only cookie
    const token = generateToken(newUser._id, newUser.role);
    res.cookie('token', token, getCookieOptions());

    res.status(201).json({
      success: true,
      message:
        normalizedRole === 'rescuer'
          ? 'Rescuer registration submitted. Your account is in pending verification status.'
          : 'Registration successful. Welcome to Pet Rescue!',
      token,
      user: newUser.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get JWT token
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // 2. Find user including passwordHash
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select('+passwordHash');

    // 3. Security: Do not reveal whether email exists or not
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // 4. Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // 5. Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.',
      });
    }

    // 6. Issue token & set cookie
    const token = generateToken(user._id, user.role);
    res.cookie('token', token, getCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user profile
 * @access  Private (Requires authentication)
 */
export const getMe = async (req, res) => {
  // req.user is already populated by verifyAuth middleware
  res.status(200).json({
    success: true,
    user: req.user.toJSON(),
  });
};

/**
 * @route   POST /api/auth/logout
 * @desc    Log out user & clear HTTP-only cookie
 * @access  Public / Private
 * @note    In stateless JWT, clearing the client token/cookie removes access credentials.
 *          Tokens issued prior to expiry cannot be invalidated server-side without a
 *          token revocation blacklist or short-lived token rotation architecture.
 */
export const logout = async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully. Authentication cookie cleared.',
  });
};
