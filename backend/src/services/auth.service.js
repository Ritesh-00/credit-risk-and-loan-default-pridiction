import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { ENV } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';
import { checkDbConnection } from '../config/db.js';

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role || 'analyst',
    },
    ENV.JWT_SECRET,
    { expiresIn: ENV.JWT_EXPIRES_IN }
  );
};

export const registerUser = async ({ fullName, email, password, organization }) => {
  if (!checkDbConnection()) {
    // Demo fallback when user has not yet plugged in their Mongo URI
    const demoUser = {
      id: 'usr_' + Date.now(),
      fullName,
      email,
      organization: organization || 'Risk Assessment Bank',
      role: 'risk_officer',
      createdAt: new Date().toISOString(),
    };
    return {
      user: demoUser,
      token: generateToken(demoUser),
    };
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('An account with this email address already exists.');
  }

  const user = await User.create({
    fullName,
    email,
    password,
    organization: organization || 'Financial Institution',
  });

  const token = generateToken(user);

  return {
    user: user.toJSON(),
    token,
  };
};

export const loginUser = async ({ email, password }) => {
  if (!checkDbConnection()) {
    // Demo login
    const demoUser = {
      id: 'usr_demo_officer',
      fullName: email.split('@')[0] || 'Senior Risk Officer',
      email,
      organization: 'Global Credit Corp',
      role: 'risk_officer',
    };
    return {
      user: demoUser,
      token: generateToken(demoUser),
    };
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  const token = generateToken(user);

  return {
    user: user.toJSON(),
    token,
  };
};

export const getCurrentUserProfile = async (userId) => {
  if (!checkDbConnection()) {
    return {
      id: userId || 'usr_demo_officer',
      fullName: 'Senior Credit Risk Officer',
      email: 'officer@creditrisk.ai',
      organization: 'Risk & Underwriting Dept',
      role: 'risk_officer',
    };
  }

  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User profile not found.');
  }

  return user.toJSON();
};
