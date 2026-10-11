import { registerUser, loginUser, getCurrentUserProfile } from '../services/auth.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const register = async (req, res, next) => {
  try {
    const { fullName, email, password, organization } = req.body;
    const data = await registerUser({ fullName, email, password, organization });
    return ApiResponse.created(res, data, 'Registration successful');
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const data = await loginUser({ email, password });
    return ApiResponse.success(res, data, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await getCurrentUserProfile(req.user?.id);
    return ApiResponse.success(res, { user }, 'User profile retrieved');
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    return ApiResponse.success(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};
