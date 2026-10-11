import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';
import { User } from '../models/user.model.js';
import { checkDbConnection } from '../config/db.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(ApiError.unauthorized('Authentication token is missing. Please log in.'));
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    if (checkDbConnection()) {
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(ApiError.unauthorized('The user associated with this token no longer exists.'));
      }
      req.user = user;
    } else {
      req.user = {
        id: decoded.id,
        fullName: decoded.fullName || 'User',
        email: decoded.email,
        role: decoded.role || 'analyst',
      };
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuthMiddleware = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        req.user = { id: decoded.id, email: decoded.email, fullName: decoded.fullName };
      } catch (e) {
        // Invalid token ignored for optional auth
      }
    }
    next();
  } catch (error) {
    next();
  }
};
